import { Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-zinc-900 bg-black px-4 py-10 font-jetbrains-mono sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold uppercase tracking-widest text-white">{t('common.appName')}</p>
          <p className="mt-2 text-xs uppercase tracking-widest">{t('footer.tagline')}</p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t('footer.contactSupport')}</p>
          <a
            href="mailto:contactunicornshub@gmail.com"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-400 transition hover:text-white"
          >
            <Mail className="h-4 w-4" />
            contactunicornshub@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
