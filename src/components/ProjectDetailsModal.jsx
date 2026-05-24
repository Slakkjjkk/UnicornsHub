import { ArrowUpRight, Bookmark, CalendarDays, Flame, Gauge, ImageIcon, Rocket, Trash2, UserRound, X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/85 px-4 py-8 backdrop-blur-xl">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] bg-zinc-900/95 text-white shadow-[0_30px_100px_rgba(0,0,0,0.58)] ring-1 ring-white/10">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-zinc-900/90 p-5 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">{t('projectDetails.eyebrow')}</p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:-translate-y-0.5 hover:bg-fuchsia-500/20"
            aria-label={t('projectDetails.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-8 p-5 lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
          <div className="overflow-hidden rounded-[1.8rem] bg-zinc-950 ring-1 ring-white/10">
            <div className="aspect-[4/3]">
              {image ? (
                <img
                  src={image}
                  alt={t('projectCard.coverAlt', { name: project.name })}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-zinc-900">
                  <div className="flex h-24 w-24 items-center justify-center rounded-[1.8rem] bg-white/10 text-cyan-100">
                    <ImageIcon className="h-12 w-12" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-4xl font-black tracking-tight text-white">{project.name}</h2>
                <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-zinc-400">{project.summary}</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleToggleSave}
                  disabled={isSaving}
                  className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg ring-1 ring-white/10 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${
                    project.is_saved ? 'bg-violet-600 text-white' : 'bg-white/[0.08] text-cyan-100 hover:bg-white/[0.12]'
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
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.08] text-fuchsia-100 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-fuchsia-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label={t('projectCard.delete')}
                    title={t('projectCard.delete')}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <DetailItem icon={UserRound} label={t('projectDetails.originalLeader')}>
                {project.userId ? (
                  <button
                    type="button"
                    onClick={() => onOpenProfile?.(project.userId)}
                    className="font-black text-cyan-100 underline-offset-4 transition hover:text-fuchsia-200 hover:underline"
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
              <p className="text-sm font-black uppercase tracking-[0.16em] text-cyan-200">{t('projectDetails.stack')}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.stack.map((tag) => (
                  <span key={tag} className="rounded-full bg-cyan-400/[0.10] px-3 py-1.5 text-xs font-black text-cyan-100 ring-1 ring-cyan-300/15">
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
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-7 py-4 text-sm font-black text-white shadow-xl shadow-violet-950/30 transition hover:-translate-y-0.5 hover:bg-violet-700"
              >
                <Rocket className="h-5 w-5" />
                {t('projectCard.scaleProject')}
                <ArrowUpRight className="h-4 w-4" />
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
    <div className="rounded-[1.4rem] bg-zinc-950/60 p-4 ring-1 ring-white/10">
      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-zinc-500">
        <Icon className="h-4 w-4 text-cyan-200" />
        {label}
      </p>
      <div className="mt-2 text-sm font-black text-white">{children}</div>
    </div>
  );
}

function TextBlock({ title, children }) {
  return (
    <section className="rounded-[1.4rem] bg-white/[0.06] p-5 ring-1 ring-white/10">
      <h3 className="text-sm font-black uppercase tracking-[0.16em] text-cyan-200">{title}</h3>
      <p className="mt-3 text-sm font-semibold leading-7 text-zinc-300">{children}</p>
    </section>
  );
}
