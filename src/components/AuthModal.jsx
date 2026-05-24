import { Loader2, Lock, Mail, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';

export default function AuthModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) {
    return null;
  }

  const isEmailValid = /\S+@\S+\.\S+/.test(email);
  const isPasswordValid = password.length >= 6;
  const canSubmit = isEmailValid && (mode === 'reset' || isPasswordValid) && isSupabaseConfigured && !isLoading;
  const authTabs = [
    { id: 'login', label: t('auth.loginTab') },
    { id: 'signup', label: t('auth.signupTab') },
    { id: 'reset', label: t('auth.resetTab') },
  ];

  function friendlyAuthError(message) {
    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes('invalid login credentials')) {
      return t('auth.wrongCredentials');
    }

    if (normalizedMessage.includes('already registered') || normalizedMessage.includes('already exists')) {
      return t('auth.emailExists');
    }

    if (normalizedMessage.includes('email not confirmed')) {
      return t('auth.emailNotConfirmed');
    }

    if (normalizedMessage.includes('rate limit')) {
      return t('auth.rateLimit');
    }

    console.error('[auth]', message);
    return t('common.genericError');
  }

  async function handleEmailAuth(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!isSupabaseConfigured) {
      const message = t('auth.configMissing');
      setError(message);
      toast.error(message);
      return;
    }

    if (!isEmailValid) {
      const message = t('auth.invalidEmail');
      setError(message);
      toast.error(message);
      return;
    }

    if (mode !== 'reset' && !isPasswordValid) {
      const message = t('auth.invalidPassword');
      setError(message);
      toast.error(message);
      return;
    }

    setIsLoading(true);

    if (mode === 'reset') {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });

      setIsLoading(false);

      if (resetError) {
        const message = friendlyAuthError(resetError.message);
        setError(message);
        toast.error(message);
        return;
      }

      const message = t('auth.resetSuccess');
      setSuccess(message);
      toast.success(message);
      return;
    }

    const response =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setIsLoading(false);

    if (response.error) {
      const message = friendlyAuthError(response.error.message);
      setError(message);
      toast.error(message);
      return;
    }

    if (mode === 'signup' && !response.data.session) {
      const message = t('auth.signupSuccess');
      setSuccess(message);
      toast.success(message);
      return;
    }

    if (mode === 'signup' && response.data.user?.identities?.length === 0) {
      const message = t('auth.emailExists');
      setError(message);
      toast.error(message);
      return;
    }

    toast.success(t('auth.loginSuccess'));
    onClose();
  }

  async function handleGoogleLogin() {
    setError('');
    setSuccess('');

    if (!isSupabaseConfigured) {
      const message = t('auth.configMissing');
      setError(message);
      toast.error(message);
      return;
    }

    setIsLoading(true);
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (googleError) {
      const message = friendlyAuthError(googleError.message);
      setError(message);
      toast.error(message);
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/85 px-4 py-8 backdrop-blur-xl">
      <div className="w-full max-w-lg overflow-hidden rounded-[2rem] bg-zinc-900/95 text-white shadow-[0_30px_100px_rgba(0,0,0,0.58)] ring-1 ring-white/10">
        <div className="flex items-start justify-between gap-4 p-7">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100 ring-1 ring-white/10">
              <Sparkles className="h-4 w-4 text-fuchsia-300" />
              {t('auth.eyebrow')}
            </div>
            <h2 className="text-3xl font-black tracking-tight">{t('auth.title')}</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-zinc-400">
              {t('auth.subtitle')}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:-translate-y-0.5 hover:bg-fuchsia-500"
            aria-label={t('auth.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-7 pb-7">
          <div className="mb-5 grid grid-cols-3 rounded-full bg-zinc-950/70 p-1.5 ring-1 ring-white/10">
            {authTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setMode(tab.id);
                  setError('');
                  setSuccess('');
                }}
                className={`rounded-full px-4 py-3 text-sm font-black transition ${
                  mode === tab.id ? 'bg-white text-zinc-950' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading || !isSupabaseConfigured}
            className="mb-5 flex h-14 w-full items-center justify-center gap-3 rounded-full bg-white px-5 text-sm font-black text-zinc-950 shadow-xl shadow-cyan-400/10 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleLogo />}
            {t('auth.google')}
          </button>

          <div className="mb-5 flex items-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
            <span className="h-px flex-1 bg-white/10" />
            {mode === 'reset' ? t('auth.resetDivider') : t('auth.emailDivider')}
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleEmailAuth} className="grid gap-4">
            <label className="grid gap-2 text-sm font-black text-zinc-200">
              {t('auth.email')}
              <div className="relative">
                <Mail className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-200" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  maxLength={160}
                  className={`pl-12 ${email && !isEmailValid ? 'border-fuchsia-400 focus:border-fuchsia-400' : ''}`}
                />
              </div>
            </label>

            {mode !== 'reset' ? (
              <label className="grid gap-2 text-sm font-black text-zinc-200">
                {t('auth.password')}
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-200" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    maxLength={128}
                    className={`pl-12 ${password && !isPasswordValid ? 'border-fuchsia-400 focus:border-fuchsia-400' : ''}`}
                  />
                </div>
              </label>
            ) : null}

            {!isSupabaseConfigured ? (
              <p className="rounded-[1.35rem] bg-fuchsia-500/10 px-4 py-3 text-sm font-bold leading-6 text-fuchsia-100 ring-1 ring-fuchsia-300/20">
                {t('auth.configMissing')}
              </p>
            ) : null}

            {error ? (
              <p className="rounded-[1.35rem] bg-fuchsia-500/10 px-4 py-3 text-sm font-bold leading-6 text-fuchsia-100 ring-1 ring-fuchsia-300/20">
                {error}
              </p>
            ) : null}

            {success ? (
              <p className="rounded-[1.35rem] bg-cyan-400/10 px-4 py-3 text-sm font-bold leading-6 text-cyan-100 ring-1 ring-cyan-300/20">
                {success}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-2 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-violet-600 px-7 text-sm font-black text-white shadow-xl shadow-violet-950/30 transition hover:-translate-y-0.5 hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {mode === 'login' ? t('auth.submitLogin') : mode === 'signup' ? t('auth.submitSignup') : t('auth.submitReset')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.75-.07-1.47-.2-2.16H12v4.08h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.32 2.98-7.45Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.51c-.9.6-2.04.95-3.38.95-2.6 0-4.8-1.76-5.59-4.12H3.06v2.59A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.41 13.9a6 6 0 0 1 0-3.8V7.51H3.06a10 10 0 0 0 0 8.98l3.35-2.59Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.98c1.47 0 2.8.51 3.84 1.5l2.88-2.88C16.95 2.95 14.7 2 12 2a10 10 0 0 0-8.94 5.51l3.35 2.59C7.2 7.74 9.4 5.98 12 5.98Z"
      />
    </svg>
  );
}
