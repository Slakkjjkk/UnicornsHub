import { Bookmark, Clock3, Flame, ImageIcon, Rocket, Trash2, TrendingUp } from 'lucide-react';
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
    <article className="group flex h-full flex-col border border-zinc-800 bg-black font-jetbrains-mono text-zinc-400">
      <div className="border-b border-zinc-800 bg-black">
        <div className="h-40 overflow-hidden">
          {image ? (
            <button type="button" onClick={() => onOpenDetails?.(project)} className="block h-full w-full">
              <img
                src={image}
                alt={t('projectCard.coverAlt', { name: project.name })}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover grayscale transition duration-300 group-hover:grayscale-0"
              />
            </button>
          ) : (
            <button type="button" onClick={() => onOpenDetails?.(project)} className="flex h-full w-full items-center justify-center bg-black">
              <div className="flex h-20 w-20 items-center justify-center border border-zinc-800 text-zinc-600">
                <ImageIcon className="h-10 w-10" />
              </div>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <Flame className="h-3.5 w-3.5 text-zinc-500" />
            {adoptions_count}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            {project.difficulty}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <TrendingUp className="h-3.5 w-3.5 text-zinc-500" />
              {t('projectCard.ready', { difficulty: project.difficulty })}
            </p>
            <h3 className="line-clamp-2 text-base font-bold uppercase leading-6 tracking-widest text-white">{project.name}</h3>
          </div>
        </div>

        <p className="mt-4 line-clamp-2 text-xs leading-6 text-zinc-400">{project.stopPoint || project.summary}</p>

        <div className="mt-4 flex flex-wrap gap-x-2 gap-y-1 text-[10px] uppercase tracking-widest text-zinc-500">
          {project.stack.map((tag, index) => (
            <span key={`${project.id}-${tag}-${index}`} className="text-zinc-500 after:content-[','] last:after:content-['']">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-5 grid gap-2 border-t border-zinc-900 pt-4 text-[11px] text-zinc-500">
          <span className="inline-flex items-start gap-2">
            <Rocket className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" />
            {t('projectCard.originalLeader')}
            {project.userId ? (
              <button
                type="button"
                onClick={() => onOpenProfile?.(project.userId)}
                className="line-clamp-1 text-left font-bold text-white underline-offset-4 transition hover:text-sky-400 hover:underline"
              >
                {founderName}
              </button>
            ) : (
              <span className="font-bold text-white">{founderName}</span>
            )}
          </span>
          <span className="inline-flex items-start gap-2">
            <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" />
            {t('projectCard.waitingSince', { date: project.lastCommit })}
          </span>
          <span className="inline-flex items-start gap-2">
            <Flame className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" />
            {t('projectCard.interestSignals', { count: adoptions_count })}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-zinc-900 pt-4">
          <button
            type="button"
            onClick={() => onOpenDetails?.(project)}
            className="inline-flex w-fit items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-sky-400 transition hover:text-white"
          >
            {t('projectCard.viewDetails')} {'->'}
          </button>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={handleToggleSave}
              disabled={isSaving}
              className={`text-xs font-bold uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-40 ${
                project.is_saved ? 'text-white' : 'text-zinc-500 hover:text-white'
              }`}
              aria-label={project.is_saved ? t('projectCard.unsave') : t('projectCard.save')}
              title={project.is_saved ? t('projectCard.unsave') : t('projectCard.save')}
            >
              <Bookmark className="h-4 w-4" fill={project.is_saved ? 'currentColor' : 'none'} />
            </button>

            {canDelete ? (
              <button
                type="button"
                onClick={handleDeleteProject}
                disabled={isDeleting}
                className="text-xs font-bold uppercase tracking-widest text-zinc-500 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={t('projectCard.delete')}
                title={t('projectCard.delete')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export default memo(ProjectCard);

