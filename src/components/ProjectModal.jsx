import { ArrowUpRight, Calendar, Star, TrendingUp, User, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { safeGitHubRepositoryUrl } from '../utils/security.js';

export default function ProjectModal({ project, onClose }) {
  const { t } = useTranslation();

  if (!project) {
    return null;
  }

  const image = project.image || project.imageUrl;
  const safeRepositoryUrl = safeGitHubRepositoryUrl(project.repository);
  const statusLabels = {
    'Buscando Mantenedor': t('projectCard.statusSeeking'),
    'Em Processo de Adocao': t('projectCard.statusDiligence'),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/85 px-4 py-8 backdrop-blur-xl">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-zinc-900 text-white shadow-[0_30px_100px_rgba(0,0,0,0.58)] ring-1 ring-white/10">
        {image ? (
          <div className="relative h-64 overflow-hidden rounded-t-[2rem] sm:h-80">
            <img
              src={image}
              alt={`${t('addProject.coverPrompt')}: ${project.name}`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-zinc-900/70" />
          </div>
        ) : null}

        <div className="sticky top-0 flex items-start justify-between gap-4 bg-zinc-900/90 p-7 backdrop-blur">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-200">{project.repository}</p>
            <h2 className="mt-2 text-4xl font-black tracking-tight">{project.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white shadow-lg transition hover:-translate-y-1 hover:rotate-6 hover:bg-fuchsia-500"
            aria-label={t('profile.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-7 p-7">
          <div className="flex flex-wrap gap-2">
            {project.stack.map((tag) => (
              <span key={tag} className="rounded-full bg-cyan-400/12 px-3 py-1.5 text-xs font-black text-cyan-100 ring-1 ring-cyan-300/15">
                {tag}
              </span>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <Metric icon={Star} label="Stars" value={project.stars} />
            <Metric icon={TrendingUp} label={t('projectModal.status')} value={statusLabels[project.status] || project.status} />
            <Metric icon={User} label={t('projectModal.founder')} value={project.owner} />
            <Metric icon={Calendar} label={t('projectModal.waitingTraction')} value={project.lastCommit} />
          </div>

          <section className="rounded-[1.7rem] bg-white/[0.07] p-6 ring-1 ring-white/10">
            <h3 className="text-sm font-black uppercase tracking-[0.16em] text-cyan-200">{t('projectModal.productProof')}</h3>
            <p className="mt-3 leading-8 text-zinc-300">{project.summary}</p>
          </section>

          <section className="rounded-[1.7rem] bg-fuchsia-500/10 p-6 ring-1 ring-fuchsia-300/15">
            <h3 className="text-sm font-black uppercase tracking-[0.16em] text-fuchsia-200">{t('projectModal.scaleBottleneck')}</h3>
            <p className="mt-3 leading-8 text-zinc-300">{project.stopPoint}</p>
          </section>

          <section className="rounded-[1.7rem] bg-cyan-400/10 p-6 ring-1 ring-cyan-300/15">
            <h3 className="text-sm font-black uppercase tracking-[0.16em] text-cyan-200">{t('projectModal.idealLeader')}</h3>
            <p className="mt-3 leading-8 text-zinc-300">{project.needs}</p>
          </section>

          {safeRepositoryUrl ? (
            <a
              href={safeRepositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-7 py-4 text-sm font-black text-white shadow-xl shadow-violet-950/30 transition hover:-translate-y-1 hover:bg-violet-700"
            >
              {t('projectCard.scaleProject')}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[1.35rem] bg-zinc-950/70 p-4 ring-1 ring-white/10">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-cyan-200">
        <Icon className="h-3.5 w-3.5 text-fuchsia-300" />
        {label}
      </div>
      <p className="mt-2 text-sm font-black">{value}</p>
    </div>
  );
}
