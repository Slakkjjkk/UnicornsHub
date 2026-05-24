import { LogOut, Rocket, Search, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Header({
  searchTerm,
  onSearchChange,
  onOpenAddProject,
  user,
  profile,
  onOpenAuth,
  onOpenProfile,
  onLogout,
  isAuthLoading,
}) {
  const { t, i18n } = useTranslation();
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const userName = profile?.full_name || user?.user_metadata?.full_name || user?.email || t('profile.fallbackName');

  function handleLanguageChange(event) {
    const language = event.target.value;
    i18n.changeLanguage(language);
    window.localStorage.setItem('unicorns-hub-language', language);
  }

  return (
    <header className="sticky top-0 z-30 bg-zinc-950/[0.84] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-4">
          <UnicornHubLogo />
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{t('common.appName')}</h1>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:max-w-4xl">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-200" />
            <input
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t('header.searchPlaceholder')}
              className="h-14 rounded-full border-2 border-white/10 bg-white/[0.08] pl-13 pr-5 text-white placeholder:text-zinc-500 focus:border-cyan-300 focus:ring-cyan-300/20"
            />
          </label>

          <select
            value={i18n.language}
            onChange={handleLanguageChange}
            className="h-14 w-full rounded-full border-2 border-white/10 bg-white/[0.08] px-4 text-sm font-black text-white outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/20 sm:w-24"
            aria-label={t('header.languageLabel')}
          >
            <option value="pt">PT</option>
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>

          <button
            type="button"
            onClick={onOpenAddProject}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-violet-600 px-7 text-sm font-black text-white shadow-[0_14px_38px_rgba(124,58,237,0.22)] transition hover:-translate-y-0.5 hover:bg-violet-700"
          >
            <Rocket className="h-5 w-5" />
            {t('common.submitProject')}
          </button>

          {user ? (
            <div className="flex items-center gap-2 rounded-full bg-white/[0.08] p-1.5 ring-1 ring-white/10">
              <button
                type="button"
                onClick={onOpenProfile}
                className="flex items-center gap-2 rounded-full pl-1.5 pr-2 transition hover:bg-white/[0.08]"
                aria-label={t('header.openMyProfile')}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={userName}
                    loading="lazy"
                    decoding="async"
                    className="h-10 w-10 rounded-full object-cover ring-1 ring-white/20"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-cyan-100 ring-1 ring-white/10">
                    <UserRound className="h-5 w-5" />
                  </span>
                )}
                <span className="hidden max-w-32 truncate text-xs font-black text-white lg:block">{userName}</span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                disabled={isAuthLoading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-xs font-black text-zinc-300 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:text-zinc-600"
              >
                <LogOut className="h-4 w-4" />
                {t('common.logout')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex h-14 items-center justify-center rounded-full bg-white/[0.08] px-6 text-sm font-black text-cyan-100 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-white/[0.12]"
            >
              {t('common.login')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function UnicornHubLogo() {
  return (
    <div className="relative flex h-16 w-16 items-center justify-center rounded-[1.55rem] bg-zinc-900/90 shadow-[0_18px_54px_rgba(124,58,237,0.2)] ring-1 ring-white/10">
      <div className="absolute inset-0 rounded-[1.55rem] bg-violet-600/10" />
      <svg
        aria-hidden="true"
        viewBox="0 0 64 64"
        className="relative h-12 w-12 overflow-visible"
        fill="none"
      >
        <path d="M18 40C21 28 30 21 43 18C38 26 37 34 44 44C34 49 25 48 18 40Z" fill="#c4b5fd" />
        <path d="M28 21L38 7L39 25" fill="#a855f7" />
        <path d="M38 7L42 13L39 25" stroke="white" strokeOpacity="0.42" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M19 40C24 39 30 41 35 47" stroke="#09090b" strokeOpacity="0.45" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M31 31C34 30 37 30 40 31" stroke="#09090b" strokeOpacity="0.52" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M14 22C19 24 23 27 26 32" stroke="#22d3ee" strokeOpacity="0.48" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M48 25C52 28 54 32 55 37" stroke="#d946ef" strokeOpacity="0.52" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="13" cy="21" r="2" fill="#22d3ee" />
        <circle cx="55" cy="38" r="2" fill="#d946ef" />
        <circle cx="48" cy="25" r="1.6" fill="#a855f7" />
        <path d="M47 9L49 13L53 15L49 17L47 21L45 17L41 15L45 13L47 9Z" fill="#22d3ee" />
      </svg>
    </div>
  );
}
