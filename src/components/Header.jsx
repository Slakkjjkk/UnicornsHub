import { Plus, Search, Sparkles } from 'lucide-react';

export default function Header({ searchTerm, onSearchChange, onOpenAddProject }) {
  return (
    <header className="sticky top-0 z-30 bg-zinc-950/80 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center justify-center gap-4 lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500 text-white shadow-xl shadow-violet-500/25">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-normal text-white">Unicorns Hub</h1>
              <p className="text-sm text-zinc-400">Ideias prontas para uma nova casa</p>
            </div>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:items-center lg:mx-0">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar por projeto, stack ou mantenedor"
              className="h-12 w-full rounded-2xl border-white/10 bg-zinc-900/80 pl-11 pr-4 shadow-lg shadow-black/10"
            />
          </label>

          <button
            type="button"
            onClick={onOpenAddProject}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-violet-500 px-5 text-sm font-semibold text-white shadow-xl shadow-violet-500/25 transition hover:-translate-y-0.5 hover:bg-violet-400"
          >
            <Plus className="h-4 w-4" />
            Doar Codigo
          </button>
        </div>
      </div>
    </header>
  );
}
