import { SlidersHorizontal, X } from 'lucide-react';

export default function Filters({
  stacks,
  difficulties,
  selectedStack,
  selectedDifficulty,
  onStackChange,
  onDifficultyChange,
  onClearFilters,
}) {
  const hasFilters = selectedStack !== 'Todos' || selectedDifficulty !== 'Todos';

  return (
    <section>
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 pb-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-violet-200 shadow-lg shadow-black/15">
            <SlidersHorizontal className="h-4 w-4" />
          </span>
          Refine sua busca
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-zinc-900/70 p-3 shadow-xl shadow-black/15 ring-1 ring-white/10 sm:flex-row sm:items-center">
          <select
            value={selectedStack}
            onChange={(event) => onStackChange(event.target.value)}
            className="h-11 rounded-xl bg-zinc-950/70"
          >
            <option>Todos</option>
            {stacks.map((stack) => (
              <option key={stack}>{stack}</option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(event) => onDifficultyChange(event.target.value)}
            className="h-11 rounded-xl bg-zinc-950/70"
          >
            <option>Todos</option>
            {difficulties.map((difficulty) => (
              <option key={difficulty}>{difficulty}</option>
            ))}
          </select>

          {hasFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-zinc-300 transition hover:bg-white/5"
            >
              <X className="h-4 w-4" />
              Limpar
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
