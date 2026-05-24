import { assertSupabaseConfigured, supabase } from '../lib/supabaseClient.js';
import {
  createSafeServiceError,
  GITHUB_PROFILE_REGEX,
  LINKEDIN_PROFILE_REGEX,
  logServiceError,
  MAX_PROFILE_NAME_LENGTH,
  MAX_SOCIAL_URL_LENGTH,
  sanitizeText,
  sanitizeUrl,
} from '../utils/security.js';

function normalizeProfileError(error) {
  logServiceError('profileService', error);
  return createSafeServiceError();
}

function toProfile(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    full_name: sanitizeText(row.full_name, MAX_PROFILE_NAME_LENGTH),
    avatar_url: sanitizeUrl(row.avatar_url, MAX_SOCIAL_URL_LENGTH),
    github_url: sanitizeUrl(row.github_url, MAX_SOCIAL_URL_LENGTH),
    linkedin_url: sanitizeUrl(row.linkedin_url, MAX_SOCIAL_URL_LENGTH),
    updated_at: row.updated_at,
  };
}

export async function getProfile(userId) {
  assertSupabaseConfigured();

  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, github_url, linkedin_url, updated_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw normalizeProfileError(error);
  }

  return toProfile(data);
}

export async function updateProfile(userId, data) {
  assertSupabaseConfigured();

  if (!userId) {
    throw createSafeServiceError('AUTH_REQUIRED');
  }

  const payload = {
    id: userId,
    full_name: sanitizeText(data.full_name, MAX_PROFILE_NAME_LENGTH),
    avatar_url: sanitizeUrl(data.avatar_url, MAX_SOCIAL_URL_LENGTH),
    github_url: sanitizeUrl(data.github_url, MAX_SOCIAL_URL_LENGTH),
    linkedin_url: sanitizeUrl(data.linkedin_url, MAX_SOCIAL_URL_LENGTH),
    updated_at: new Date().toISOString(),
  };

  if (payload.github_url && !GITHUB_PROFILE_REGEX.test(payload.github_url)) {
    throw createSafeServiceError('INVALID_SOCIAL_URL');
  }

  if (payload.linkedin_url && !LINKEDIN_PROFILE_REGEX.test(payload.linkedin_url)) {
    throw createSafeServiceError('INVALID_SOCIAL_URL');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('id, full_name, avatar_url, github_url, linkedin_url, updated_at')
    .single();

  if (error) {
    throw normalizeProfileError(error);
  }

  return toProfile(profile);
}

export async function ensureProfile(user) {
  if (!user) {
    return null;
  }

  const existingProfile = await getProfile(user.id);

  if (existingProfile) {
    return existingProfile;
  }

  return updateProfile(user.id, {
    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Founder',
    avatar_url: user.user_metadata?.avatar_url || '',
  });
}
