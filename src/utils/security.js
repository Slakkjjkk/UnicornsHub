export const MAX_PROJECT_TEXT_LENGTH = 1000;
export const MAX_PROJECT_NAME_LENGTH = 100;
export const MAX_REPOSITORY_URL_LENGTH = 180;
export const MAX_STACK_LENGTH = 240;
export const MAX_PROFILE_NAME_LENGTH = 80;
export const MAX_SOCIAL_URL_LENGTH = 180;

export const GITHUB_REPOSITORY_REGEX =
  /^https:\/\/(www\.)?github\.com\/[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?\/[A-Za-z0-9._-]+(?:\.git)?\/?$/;
export const GITHUB_PROFILE_REGEX = /^https:\/\/(www\.)?github\.com\/[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?\/?$/i;
export const LINKEDIN_PROFILE_REGEX = /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9-_%]+\/?$/i;

export function sanitizeText(value, maxLength = MAX_PROJECT_TEXT_LENGTH) {
  return String(value || '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeTextArray(values, itemMaxLength = 32, maxItems = 12) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => sanitizeText(value, itemMaxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

export function sanitizeUrl(value, maxLength = MAX_SOCIAL_URL_LENGTH) {
  return sanitizeText(value, maxLength);
}

export function safeGitHubRepositoryUrl(value) {
  const url = sanitizeUrl(value, MAX_REPOSITORY_URL_LENGTH);
  return GITHUB_REPOSITORY_REGEX.test(url) ? url : '';
}

export function safeProfileUrl(value, regex) {
  const url = sanitizeUrl(value, MAX_SOCIAL_URL_LENGTH);
  return regex.test(url) ? url : '';
}

export function createSafeServiceError(code = 'REQUEST_FAILED') {
  const error = new Error(code);
  error.isSafeForUser = true;
  return error;
}

export function logServiceError(scope, error) {
  console.error(`[${scope}]`, error);
}
