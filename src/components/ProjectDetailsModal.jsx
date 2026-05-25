import { Bookmark, CalendarDays, Flame, Gauge, ImageIcon, Trash2, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getSafeErrorMessage } from '../utils/errors.js';
import { safeGitHubRepositoryUrl } from '../utils/security.js';

function formatDate(value, language) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(date);
}

export default function ProjectDetailsModal({
  project,
  currentUser,
  onClose,
  onOpenProfile,
  onToggleSave,
  onDeleteProject,
}) {
  const { t, i18n } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!project) {
    return null;
  }

  const image = project.image || project.imageUrl;
  const founderName = project.profiles?.full_name || project.owner || t('projectCard.fallbackFounder');
  const canDelete = Boolean(currentUser?.id && project.userId === currentUser.id);
  const safeRepositoryUrl = safeGitHubRepositoryUrl(project.repository);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4 py-8 font-jetbrains-mono backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto border border-zinc-800 bg-[#0a0a0a] text-zinc-400">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-zinc-800 bg-[#0a0a0a]/95 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t('projectDetails.eyebrow')}</p>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold uppercase tracking-widest text-white transition hover:text-zinc-400"
            aria-label={t('projectDetails.close')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-10 p-5 lg:grid-cols-[0.85fr_1.15fr] lg:p-8">
          <div className="overflow-hidden border border-zinc-800 bg-black">
            <div className="aspect-[4/3]">
              {image ? (
                <img
                  src={image}
                  alt={t('projectCard.coverAlt', { name: project.name })}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover grayscale transition duration-300 hover:grayscale-0"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-black">
                  <div className="flex h-24 w-24 items-center justify-center border border-zinc-800 text-zinc-600">
                    <ImageIcon className="h-12 w-12" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold uppercase tracking-widest text-white">{project.name}</h2>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400">{project.summary}</p>
              </div>

              <div className="flex gap-2">
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

            <div className="mt-8 grid gap-3 border-t border-zinc-800 pt-6 sm:grid-cols-2">
              <DetailItem icon={UserRound} label={t('projectDetails.originalLeader')}>
                {project.userId ? (
                  <button
                    type="button"
                    onClick={() => onOpenProfile?.(project.userId)}
                    className="font-bold text-sky-400 underline-offset-4 transition hover:text-white hover:underline"
                  >
                    {founderName}
                  </button>
                ) : (
                  founderName
                )}
              </DetailItem>
              <DetailItem icon={CalendarDays} label={t('projectDetails.createdAt')}>
                {formatDate(project.createdAt, i18n.language)}
              </DetailItem>
              <DetailItem icon={Gauge} label={t('projectDetails.difficulty')}>
                {project.difficulty}
              </DetailItem>
              <DetailItem icon={Flame} label={t('projectDetails.interest')}>
                {t('projectCard.interestSignals', { count: project.adoptions_count || 0 })}
              </DetailItem>
            </div>

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t('projectDetails.stack')}</p>
              <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-xs uppercase tracking-widest text-zinc-500">
                {project.stack.map((tag, index) => (
                  <span key={`${project.id}-${tag}-${index}`} className="text-zinc-500 after:content-[','] last:after:content-['']">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <TextBlock title={t('projectDetails.description')}>{project.summary}</TextBlock>
              <TextBlock title={t('projectDetails.epitaph')}>{project.stopPoint}</TextBlock>
              <TextBlock title={t('projectDetails.idealLeader')}>{project.needs}</TextBlock>
            </div>

            {safeRepositoryUrl ? (
              <a
                href={safeRepositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-widest text-white transition hover:text-zinc-400"
              >
                {t('projectCard.scaleProject')} {'->'}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, children }) {
  return (
    <div className="border-t border-zinc-800 py-4">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
        <Icon className="h-4 w-4 text-zinc-600" />
        {label}
      </p>
      <div className="mt-2 text-sm font-bold text-white">{children}</div>
    </div>
  );
}

function TextBlock({ title, children }) {
  return (
    <section className="border-t border-zinc-800 py-5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-zinc-400">{children}</p>
    </section>
  );
}
