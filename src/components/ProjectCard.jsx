import { Bookmark, Clock3, Flame, ImageIcon, Rocket, Search, Trash2, TrendingUp } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getSafeErrorMessage } from '../utils/errors.js';

function ProjectCard({ project, currentUser, onOpenProfile, onOpenDetails, onToggleSave, onDeleteProject }) {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const image = project.image || project.imageUrl;
  const adoptions_count = project.adoptions_count || 0;
  const founderName = project.profiles?.full_name || project.owner || t('projectCard.fallbackFounder');
  const canDelete = Boolean(currentUser?.id && project.userId === currentUser.id);

  async function handleToggleSave() {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      await onToggleSave?.(project.id);
      toast.success(project.is_saved ? t('projectCard.unsavedToast') : t('projectCard.savedToast'));
    } catch (error) {
      toast.error(getSafeErrorMessage(error, t, 'projectCard.saveError'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteProject() {
    if (isDeleting || !window.confirm(t('projectCard.deleteConfirm', { name: project.name }))) {
      return;
    }

    setIsDeleting(true);

    try {
      await onDeleteProject?.(project.id);
      toast.success(t('projectCard.deletedToast'));
    } catch (error) {
      toast.error(getSafeErrorMessage(error, t, 'projectCard.deleteError'));
      setIsDeleting(false);
    }
  }

  return (
    <article className="group relative h-full rounded-[2rem] bg-zinc-900/[0.88] p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,0.32)] ring-1 ring-white/10 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:-rotate-1">
      <div className="absolute -right-3 -top-3 h-24 w-24 rounded-full bg-fuchsia-500/70 opacity-0 blur-2xl transition group-hover:opacity-50" />
      <div className="absolute right-6 top-6 z-10 flex gap-2">
        <button
          type="button"
          onClick={handleToggleSave}
          disabled={isSaving}
          className={`flex h-11 w-11 items-center justify-center rounded-full shadow-lg ring-1 ring-white/10 backdrop-blur transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${
            project.is_saved ? 'bg-violet-600 text-white' : 'bg-zinc-950/70 text-cyan-100 hover:bg-zinc-900'
          }`}
          aria-label={project.is_saved ? t('projectCard.unsave') : t('projectCard.save')}
          title={project.is_saved ? t('projectCard.unsave') : t('projectCard.save')}
        >
          <Bookmark className="h-5 w-5" fill={project.is_saved ? 'currentColor' : 'none'} />
        </button>

        {canDelete ? (
          <button
            type="button"
            onClick={handleDeleteProject}
            disabled={isDeleting}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-950/70 text-fuchsia-100 shadow-lg ring-1 ring-white/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-fuchsia-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={t('projectCard.delete')}
            title={t('projectCard.delete')}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <div className="relative overflow-hidden rounded-[1.6rem] bg-zinc-950">
        <div className="aspect-[4/3] overflow-hidden">
          {image ? (
            <button type="button" onClick={() => onOpenDetails?.(project)} className="block h-full w-full">
              <img
                src={image}
                alt={t('projectCard.coverAlt', { name: project.name })}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </button>
          ) : (
            <button type="button" onClick={() => onOpenDetails?.(project)} className="flex h-full w-full items-center justify-center bg-zinc-900">
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.6rem] bg-white/10 text-cyan-100 backdrop-blur">
                <ImageIcon className="h-10 w-10" />
              </div>
            </button>
          )}
        </div>

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-950/70 px-3 py-1.5 text-xs font-black text-cyan-100 shadow-lg ring-1 ring-white/10 backdrop-blur">
            <Flame className="h-3.5 w-3.5 text-fuchsia-300" />
            {adoptions_count}
          </span>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-4 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] px-3 py-1 text-xs font-black text-cyan-100">
              <TrendingUp className="h-3.5 w-3.5 text-fuchsia-300" />
              {t('projectCard.ready', { difficulty: project.difficulty })}
            </p>
            <h3 className="text-2xl font-black tracking-tight">{project.name}</h3>
          </div>
        </div>

        <p className="mt-4 line-clamp-3 text-sm leading-7 text-zinc-300">{project.stopPoint || project.summary}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.stack.map((tag) => (
            <span key={tag} className="rounded-full bg-cyan-400/[0.10] px-3 py-1.5 text-xs font-black text-cyan-100 ring-1 ring-cyan-300/15">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 grid gap-3 rounded-[1.4rem] bg-zinc-950/60 p-4 text-sm text-zinc-400 ring-1 ring-white/10">
          <span className="inline-flex items-center gap-2 font-bold">
            <Rocket className="h-4 w-4 text-fuchsia-300" />
            {t('projectCard.originalLeader')}
            {project.userId ? (
              <button
                type="button"
                onClick={() => onOpenProfile?.(project.userId)}
                className="font-black text-cyan-100 underline-offset-4 transition hover:text-fuchsia-200 hover:underline"
              >
                {founderName}
              </button>
            ) : (
              <span className="font-black text-cyan-100">{founderName}</span>
            )}
          </span>
          <span className="inline-flex items-center gap-2 font-bold">
            <Clock3 className="h-4 w-4 text-cyan-300" />
            {t('projectCard.waitingSince', { date: project.lastCommit })}
          </span>
          <span className="inline-flex items-center gap-2 font-bold">
            <Flame className="h-4 w-4 text-fuchsia-300" />
            {t('projectCard.interestSignals', { count: adoptions_count })}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onOpenDetails?.(project)}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-violet-950/30 transition hover:-translate-y-0.5 hover:bg-violet-700"
        >
          {t('projectCard.viewDetails')}
          <Search className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

export default memo(ProjectCard);
