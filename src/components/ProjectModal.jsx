import { AlertCircle, ArrowUpRight, Calendar, GitBranch, Star, User, X } from 'lucide-react';

function repositoryHref(repository) {
  if (repository.startsWith('http://') || repository.startsWith('https://')) {
    return repository;
  }

  return `https://${repository}`;
}

export default function ProjectModal({ project, onClose }) {
  if (!project) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 px-4 py-8 backdrop-blur-md">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-zinc-900 shadow-2xl shadow-black/40 ring-1 ring-white/10">
        {project.imageUrl ? (
          <div className="relative h-56 overflow-hidden rounded-t-3xl sm:h-72">
            <img src={project.imageUrl} alt={`Imagem do projeto ${project.name}`} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />
          </div>
        ) : null}

        <div className="sticky top-0 flex items-start justify-between gap-4 bg-zinc-900/90 p-6 backdrop-blur">
          <div>
            <p className="text-sm text-violet-200">{project.repository}</p>
            <h2 className="mt-2 text-3xl font-bold text-white">{project.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-zinc-300 transition hover:bg-white/10"
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-7 p-6">
          <div className="flex flex-wrap gap-2">
            {project.stack.map((tag) => (
              <span key={tag} className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300">
                {tag}
              </span>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <Metric icon={Star} label="Stars" value={project.stars} />
            <Metric icon={AlertCircle} label="Issues" value={project.issues} />
            <Metric icon={GitBranch} label="Dificuldade" value={project.difficulty} />
            <Metric icon={Calendar} label="Ultimo commit" value={project.lastCommit} />
          </div>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-normal text-violet-200">Resumo tecnico</h3>
            <p className="mt-3 leading-8 text-zinc-200">{project.summary}</p>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-normal text-violet-200">Ponto de parada</h3>
            <p className="mt-3 leading-8 text-zinc-300">{project.stopPoint}</p>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-normal text-violet-200">Perfil de mantenedor ideal</h3>
            <p className="mt-3 leading-8 text-zinc-300">{project.needs}</p>
          </section>

          <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center gap-2 text-sm text-zinc-400">
              <User className="h-4 w-4" />
              Doado por {project.owner}
            </div>

            <a
              href={repositoryHref(project.repository)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-violet-500 px-5 text-sm font-semibold text-white shadow-xl shadow-violet-500/20 transition hover:bg-violet-400"
            >
              Ver Repositorio no GitHub
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-zinc-950/60 p-4 shadow-inner shadow-black/20">
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Icon className="h-3.5 w-3.5 text-violet-200" />
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
