export function getSafeErrorMessage(error, t, fallbackKey = 'common.genericError') {
  if (error?.message === 'AUTH_REQUIRED') {
    return t('app.loginRequired');
  }

  if (error?.isSafeForUser && error?.message !== 'REQUEST_FAILED') {
    return error.message;
  }

  return t(fallbackKey);
}
