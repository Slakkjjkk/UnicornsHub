import { Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-white/10 bg-zinc-950 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-black text-white">{t('common.appName')}</p>
          <p className="mt-1 font-semibold">{t('footer.tagline')}</p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <p className="font-black uppercase tracking-[0.16em] text-zinc-500">{t('footer.contactSupport')}</p>
          <a
            href="mailto:contactunicornshub@gmail.com"
            className="inline-flex items-center gap-2 font-bold text-cyan-100 transition hover:text-fuchsia-200"
          >
            <Mail className="h-4 w-4" />
            contactunicornshub@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
