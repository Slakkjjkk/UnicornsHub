import { assertSupabaseConfigured, supabase } from '../lib/supabaseClient.js';
import { getProfile, updateProfile } from './profileService.js';
import {
  createSafeServiceError,
  GITHUB_REPOSITORY_REGEX,
  logServiceError,
  MAX_PROJECT_NAME_LENGTH,
  MAX_PROJECT_TEXT_LENGTH,
  MAX_REPOSITORY_URL_LENGTH,
  sanitizeText,
  sanitizeTextArray,
  sanitizeUrl,
} from '../utils/security.js';

const sortConfig = {
  recentes: { column: 'created_at', ascending: false },
  populares: { column: 'adoptions_count', ascending: false },
  alfabetica: { column: 'name', ascending: true },
};

function normalizeProjectError(error) {
  logServiceError('projectService', error);
  return createSafeServiceError();
}

function toProject(row, userId = null) {
  const savedRows = Array.isArray(row.saved_projects) ? row.saved_projects : [];

  return {
    id: row.id,
    user_id: row.user_id,
    userId: row.user_id,
    name: sanitizeText(row.name, MAX_PROJECT_NAME_LENGTH),
    repository: sanitizeUrl(row.repository, MAX_REPOSITORY_URL_LENGTH),
    image: row.image || '',
    imageUrl: row.image_url || row.image || '',
    owner: sanitizeText(row.profiles?.full_name || row.owner || 'Founder anonimo', 80),
    profiles: row.profiles || null,
    status: sanitizeText(row.status, 60),
    difficulty: sanitizeText(row.difficulty, 40),
    stack: sanitizeTextArray(row.stack),
    stars: row.stars || 0,
    issues: row.issues || 0,
    createdAt: row.created_at,
    adoptions_count: row.adoptions_count || 0,
    is_saved: Boolean(userId && savedRows.some((savedProject) => savedProject.user_id === userId)),
    lastCommit: row.last_commit,
    summary: sanitizeText(row.summary, MAX_PROJECT_TEXT_LENGTH),
    stopPoint: sanitizeText(row.stop_point, MAX_PROJECT_TEXT_LENGTH),
    needs: sanitizeText(row.needs, MAX_PROJECT_TEXT_LENGTH),
  };
}

async function syncProjectAdoptionsCount(projectId) {
  const { data: rpcCount, error: rpcError } = await supabase.rpc('sync_project_adoptions_count', {
    project_id_input: projectId,
  });

  if (!rpcError) {
    return rpcCount || 0;
  }

  if (!rpcError.message?.includes('sync_project_adoptions_count')) {
    throw normalizeProjectError(rpcError);
  }

  const { count, error: countError } = await supabase
    .from('saved_projects')
    .select('project_id', { count: 'exact', head: true })
    .eq('project_id', projectId);

  if (countError) {
    throw normalizeProjectError(countError);
  }

  const nextCount = count || 0;
  const { data: updatedProject, error: updateError } = await supabase
    .from('projects')
    .update({ adoptions_count: nextCount })
    .eq('id', projectId)
    .select('adoptions_count')
    .single();

  if (updateError) {
    throw normalizeProjectError(updateError);
  }

  return updatedProject.adoptions_count || 0;
}

async function toProjectRow(project, userId) {
  const profile = (await getProfile(userId)) || (await updateProfile(userId, { full_name: 'Founder Unicorns' }));
  const ownerName = sanitizeText(profile?.full_name || project.owner || 'Founder anonimo', 80);
  const repository = sanitizeUrl(project.repository, MAX_REPOSITORY_URL_LENGTH);

  if (!GITHUB_REPOSITORY_REGEX.test(repository)) {
    throw createSafeServiceError('INVALID_REPOSITORY');
  }

  return {
    user_id: userId,
    name: sanitizeText(project.name, MAX_PROJECT_NAME_LENGTH),
    repository,
    image_url: project.image || project.imageUrl || '',
    owner: ownerName,
    status: sanitizeText(project.status || 'Buscando Mantenedor', 60),
    difficulty: sanitizeText(project.difficulty, 40),
    stack: sanitizeTextArray(project.stack),
    stars: project.stars || 0,
    issues: project.issues || 0,
    created_at: project.createdAt || new Date().toISOString(),
    last_commit: project.lastCommit || new Date().toISOString().slice(0, 10),
    summary: sanitizeText(project.summary, MAX_PROJECT_TEXT_LENGTH),
    stop_point: sanitizeText(project.stopPoint, MAX_PROJECT_TEXT_LENGTH),
    needs: sanitizeText(project.needs, MAX_PROJECT_TEXT_LENGTH),
  };
}

export async function fetchProjects(sortBy = 'recentes', userId = null, page = 1, limit = 6) {
  assertSupabaseConfigured();

  const sort = sortConfig[sortBy] || sortConfig.recentes;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const { data, error, count } = await supabase
    .from('projects')
    .select('*, profiles(id, full_name, avatar_url), saved_projects(user_id)', { count: 'exact' })
    .order(sort.column, { ascending: sort.ascending })
    .range(from, to);

  if (error) {
    throw normalizeProjectError(error);
  }

  return {
    projects: (data || []).map((row) => toProject(row, userId)),
    total: count || 0,
  };
}

export async function addProject(project, userId) {
  assertSupabaseConfigured();

  if (!userId) {
    throw createSafeServiceError('AUTH_REQUIRED');
  }

  const { data, error } = await supabase
    .from('projects')
    .insert(await toProjectRow(project, userId))
    .select('*, profiles(id, full_name, avatar_url)')
    .single();

  if (error) {
    throw normalizeProjectError(error);
  }

  return toProject(data, userId);
}

export async function toggleSaveProject(projectId, userId) {
  assertSupabaseConfigured();

  if (!userId) {
    throw createSafeServiceError('AUTH_REQUIRED');
  }

  const { data: existingSave, error: readError } = await supabase
    .from('saved_projects')
    .select('project_id')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .maybeSingle();

  if (readError) {
    throw normalizeProjectError(readError);
  }

  if (existingSave) {
    const { error: deleteError } = await supabase
      .from('saved_projects')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (deleteError) {
      throw normalizeProjectError(deleteError);
    }

    const adoptions_count = await syncProjectAdoptionsCount(projectId);
    return { is_saved: false, adoptions_count };
  }

  const { error: insertError } = await supabase
    .from('saved_projects')
    .insert({ project_id: projectId, user_id: userId });

  if (insertError) {
    throw normalizeProjectError(insertError);
  }

  const adoptions_count = await syncProjectAdoptionsCount(projectId);
  return { is_saved: true, adoptions_count };
}

export async function deleteProject(projectId, userId) {
  assertSupabaseConfigured();

  if (!userId) {
    throw createSafeServiceError('AUTH_REQUIRED');
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', userId);

  if (error) {
    throw normalizeProjectError(error);
  }
}

export async function fetchSavedProjects(userId) {
  assertSupabaseConfigured();

  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from('saved_projects')
    .select('project:projects(*, profiles(id, full_name, avatar_url), saved_projects(user_id))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw normalizeProjectError(error);
  }

  return data
    .map((row) => row.project)
    .filter(Boolean)
    .map((project) => toProject(project, userId));
}
