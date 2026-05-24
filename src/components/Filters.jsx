import { SlidersHorizontal, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Filters({
  stacks,
  difficulties,
  selectedStack,
  selectedDifficulty,
  sortBy,
  onStackChange,
  onDifficultyChange,
  onClearFilters,
  onSortChange,
}) {
  const { t } = useTranslation();
  const hasFilters = selectedStack !== 'Todos' || selectedDifficulty !== 'Todos';
  const sortOptions = [
    { value: 'recentes', label: t('filters.recent') },
    { value: 'populares', label: t('filters.popular') },
    { value: 'alfabetica', label: t('filters.alphabetical') },
  ];

  return (
    <section className="px-4 pb-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 rounded-[2.25rem] bg-white/[0.06] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] ring-1 ring-white/10 backdrop-blur-2xl">
        <div className="flex items-center gap-3 px-2 text-sm font-black text-white">
          <span className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-violet-600 text-white shadow-lg shadow-violet-500/15">
            <SlidersHorizontal className="h-5 w-5" />
          </span>
          {t('filters.title')}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select value={selectedStack} onChange={(event) => onStackChange(event.target.value)}>
              <option value="Todos">{t('common.all')}</option>
              {stacks.map((stack) => (
                <option key={stack}>{stack}</option>
              ))}
            </select>

            <select value={selectedDifficulty} onChange={(event) => onDifficultyChange(event.target.value)}>
              <option value="Todos">{t('common.all')}</option>
              {difficulties.map((difficulty) => (
                <option key={difficulty}>{difficulty}</option>
              ))}
            </select>

            {hasFilters ? (
              <button
                type="button"
                onClick={onClearFilters}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white/10 px-5 text-sm font-black text-cyan-100 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-fuchsia-500/25"
              >
                <Zap className="h-4 w-4" />
                {t('filters.clear')}
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2 rounded-full bg-zinc-950/55 p-1.5 ring-1 ring-white/10">
            {sortOptions.map((option) => {
              const isActive = sortBy === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSortChange(option.value)}
                  className={`rounded-full px-4 py-2.5 text-xs font-black transition ${
                    isActive
                      ? 'bg-white text-zinc-950 shadow-lg shadow-cyan-300/10'
                      : 'text-zinc-400 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
