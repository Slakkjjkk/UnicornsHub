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
    <section className="border-b border-zinc-900 px-4 py-8 font-jetbrains-mono sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-white">
          <span className="flex h-10 w-10 items-center justify-center border border-zinc-800 text-zinc-500">
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
                className="inline-flex h-12 items-center justify-center gap-2 border border-zinc-800 px-5 text-xs font-bold uppercase tracking-widest text-sky-400 transition hover:border-sky-400 hover:text-white"
              >
                <Zap className="h-4 w-4" />
                {t('filters.clear')}
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-5 border-t border-zinc-800 pt-4 xl:border-t-0 xl:pt-0">
            {sortOptions.map((option) => {
              const isActive = sortBy === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSortChange(option.value)}
                  className={`px-0 py-2 text-xs font-bold uppercase tracking-widest transition ${
                    isActive
                      ? 'text-white underline underline-offset-4'
                      : 'text-zinc-500 hover:text-white'
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
