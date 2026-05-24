import { Rocket, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="absolute left-8 top-12 h-32 w-32 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-44 w-44 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="absolute left-1/2 top-1/3 h-36 w-36 rounded-full bg-fuchsia-500/12 blur-3xl" />

      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2.5rem] bg-zinc-900/[0.88] p-8 text-white shadow-[0_28px_90px_rgba(0,0,0,0.4)] ring-1 ring-white/10 backdrop-blur-xl sm:p-10 lg:p-12">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100 ring-1 ring-violet-300/15">
            <Sparkles className="h-4 w-4 text-fuchsia-300" />
            {t('hero.eyebrow')}
          </div>

          <h2 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl">
            {t('hero.title')}
          </h2>

          <p className="mt-7 max-w-2xl text-lg font-semibold leading-8 text-zinc-300">
            {t('hero.subtitle')}
          </p>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[2.5rem] bg-violet-600 p-8 text-white shadow-[0_28px_80px_rgba(124,58,237,0.22)] ring-1 ring-white/10 transition hover:-rotate-1">
            <Rocket className="mb-8 h-12 w-12" />
            <h3 className="text-3xl font-black tracking-tight">{t('hero.featureTitle')}</h3>
            <p className="mt-4 text-base font-semibold leading-7 text-white/85">
              {t('hero.featureText')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-[2rem] bg-cyan-300/90 p-7 text-zinc-950 shadow-[0_24px_70px_rgba(34,211,238,0.16)] transition hover:-translate-y-2 hover:rotate-1">
              <TrendingUp className="mb-5 h-8 w-8" />
              <p className="text-4xl font-black tracking-tight">{t('hero.traction')}</p>
              <p className="mt-2 text-sm font-bold">{t('hero.tractionText')}</p>
            </div>
            <div className="rounded-[2rem] bg-fuchsia-500/85 p-7 text-white shadow-[0_24px_70px_rgba(217,70,239,0.18)] ring-1 ring-white/10 transition hover:-translate-y-2 hover:-rotate-1">
              <Zap className="mb-5 h-8 w-8" />
              <p className="text-4xl font-black tracking-tight">{t('hero.scale')}</p>
              <p className="mt-2 text-sm font-bold text-white/85">{t('hero.scaleText')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
