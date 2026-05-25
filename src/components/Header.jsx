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
    <header className="sticky top-0 z-30 border-b border-zinc-900 bg-black/95 font-jetbrains-mono backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-4">
          <UnicornHubLogo />
          <h1 className="text-lg font-bold uppercase tracking-widest text-white sm:text-xl">{t('common.appName')}</h1>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:max-w-4xl">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
            <input
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t('header.searchPlaceholder')}
              className="h-12 border border-zinc-800 bg-black pl-11 pr-4 text-xs font-medium uppercase tracking-widest text-white placeholder:text-zinc-600 focus:border-sky-400"
            />
          </label>

          <select
            value={i18n.language}
            onChange={handleLanguageChange}
            className="h-12 w-full border border-zinc-800 bg-black px-4 text-xs font-bold uppercase tracking-widest text-white outline-none transition focus:border-sky-400 sm:w-24"
            aria-label={t('header.languageLabel')}
          >
            <option value="pt">PT</option>
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>

          <button
            type="button"
            onClick={onOpenAddProject}
            className="inline-flex h-12 items-center justify-center gap-2 border border-zinc-700 px-5 text-xs font-bold uppercase tracking-widest text-white transition hover:border-sky-400 hover:text-sky-400"
          >
            <Rocket className="h-4 w-4" />
            {t('common.submitProject')}
          </button>

          {user ? (
            <div className="flex items-center gap-2 border border-zinc-800 p-1.5">
              <button
                type="button"
                onClick={onOpenProfile}
                className="flex items-center gap-2 pl-1.5 pr-2 transition hover:text-sky-400"
                aria-label={t('header.openMyProfile')}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={userName}
                    loading="lazy"
                    decoding="async"
                    className="h-9 w-9 border border-zinc-800 object-cover grayscale transition hover:grayscale-0"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center border border-zinc-800 bg-black text-zinc-500">
                    <UserRound className="h-5 w-5" />
                  </span>
                )}
                <span className="hidden max-w-32 truncate text-xs font-bold uppercase tracking-widest text-white lg:block">{userName}</span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                disabled={isAuthLoading}
                className="inline-flex h-9 items-center justify-center gap-2 px-3 text-xs font-bold uppercase tracking-widest text-zinc-500 transition hover:text-white disabled:cursor-not-allowed disabled:text-zinc-700"
              >
                <LogOut className="h-4 w-4" />
                {t('common.logout')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex h-12 items-center justify-center border border-zinc-800 px-5 text-xs font-bold uppercase tracking-widest text-sky-400 transition hover:border-sky-400 hover:text-white"
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
    <div className="relative flex h-12 w-12 items-center justify-center border border-zinc-800 bg-black">
      <div className="absolute inset-0 bg-zinc-950" />
      <svg
        aria-hidden="true"
        viewBox="0 0 64 64"
        className="relative h-9 w-9 overflow-visible grayscale"
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
