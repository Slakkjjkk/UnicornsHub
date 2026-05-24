import { HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';

export default function Hero({ totalProjects, openProjects, adoptingProjects }) {
  const stats = [
    { label: 'Ideias esperando carinho', value: openProjects },
    { label: 'Conversas iniciadas', value: adoptingProjects },
    { label: 'Projetos no jardim', value: totalProjects },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.18fr_0.82fr] lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-xs font-semibold text-violet-100 shadow-lg shadow-violet-950/20">
            <Sparkles className="h-3.5 w-3.5 text-violet-200" />
            Todo bom projeto merece uma segunda temporada
          </div>

          <h2 className="max-w-4xl text-4xl font-bold tracking-normal text-white sm:text-6xl">
            Acolha ideias brilhantes que precisam de voce.
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            O Unicorns Hub aproxima criadores que querem soltar projetos com cuidado de pessoas prontas para dar
            continuidade, lapidar a experiencia e transformar potencial parado em produto vivo.
          </p>
        </div>

        <div className="grid gap-4 rounded-3xl bg-zinc-900/80 p-5 shadow-2xl shadow-black/30 ring-1 ring-white/10 backdrop-blur">
          <div className="flex items-start gap-4 rounded-2xl bg-zinc-950/60 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-white">Escolha com contexto e calma</p>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
                Veja o historico, o momento atual, a stack e o tipo de energia que cada projeto esta pedindo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-zinc-950/70 p-4 shadow-inner shadow-black/20">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="mt-2 text-xs leading-5 text-zinc-400">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-violet-500/10 px-4 py-3 text-sm text-violet-100">
            <ShieldCheck className="h-4 w-4" />
            Seus favoritos locais ficam salvos no navegador.
          </div>
        </div>
      </div>
    </section>
  );
}
