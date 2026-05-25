import { Rocket, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden border-b border-zinc-900 px-4 py-14 font-jetbrains-mono sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="text-white">
          <div className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-400">
            <Sparkles className="h-4 w-4" />
            {t('hero.eyebrow')}
          </div>

          <h2 className="max-w-4xl text-4xl font-bold uppercase leading-tight tracking-widest sm:text-6xl">
            {t('hero.title')}
          </h2>

          <p className="mt-8 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            {t('hero.subtitle')}
          </p>
        </div>

        <div className="grid gap-6 border-t border-zinc-800 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <div className="text-zinc-400">
            <Rocket className="mb-6 h-8 w-8 text-sky-400" />
            <h3 className="text-xl font-bold uppercase tracking-widest text-white">{t('hero.featureTitle')}</h3>
            <p className="mt-4 text-sm leading-7">
              {t('hero.featureText')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 border-t border-zinc-800 pt-6">
            <div>
              <TrendingUp className="mb-5 h-6 w-6 text-zinc-500" />
              <p className="text-3xl font-bold uppercase tracking-widest text-white">{t('hero.traction')}</p>
              <p className="mt-2 text-xs uppercase tracking-widest text-zinc-500">{t('hero.tractionText')}</p>
            </div>
            <div>
              <Zap className="mb-5 h-6 w-6 text-zinc-500" />
              <p className="text-3xl font-bold uppercase tracking-widest text-white">{t('hero.scale')}</p>
              <p className="mt-2 text-xs uppercase tracking-widest text-zinc-500">{t('hero.scaleText')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
