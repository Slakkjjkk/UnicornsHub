import { AlertCircle, ArrowUpRight, GitFork, ImageIcon, Star } from 'lucide-react';

const statusStyles = {
  'Buscando Mantenedor': 'bg-amber-300/15 text-amber-100 ring-1 ring-amber-300/20',
  'Em Processo de Adocao': 'bg-violet-400/15 text-violet-100 ring-1 ring-violet-300/20',
};

function repositoryHref(repository) {
  if (repository.startsWith('http://') || repository.startsWith('https://')) {
    return repository;
  }

  return `https://${repository}`;
}

export default function ProjectCard({ project, onSelect }) {
  return (
    <article className="group flex h-full overflow-hidden rounded-3xl bg-zinc-900/85 shadow-xl shadow-black/20 ring-1 ring-white/10 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-950/25">
      <div className="flex w-full flex-col">
        <div className="relative aspect-[16/9] overflow-hidden bg-zinc-800">
          {project.imageUrl ? (
            <img
              src={project.imageUrl}
              alt={`Imagem do projeto ${project.name}`}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_30%,rgba(139,92,246,0.55),transparent_34%),linear-gradient(135deg,#27272a,#18181b)]">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-violet-100 backdrop-blur">
                <ImageIcon className="h-8 w-8" />
              </div>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-950/80 to-transparent" />
          <span
            className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur ${
              statusStyles[project.status] || 'bg-zinc-950/70 text-zinc-300 ring-1 ring-white/10'
            }`}
          >
            {project.status}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div>
            <h3 className="text-xl font-bold text-white">{project.name}</h3>
            <p className="mt-1 text-sm text-zinc-500">{project.repository}</p>
          </div>

          <p className="mt-4 line-clamp-3 text-sm leading-7 text-zinc-300">{project.summary}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {project.stack.map((tag) => (
              <span key={tag} className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4 rounded-2xl bg-zinc-950/55 px-4 py-3 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-violet-200" />
              {project.stars}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-violet-200" />
              {project.issues} issues
            </span>
            <span className="inline-flex items-center gap-1.5">
              <GitFork className="h-3.5 w-3.5 text-violet-200" />
              {project.difficulty}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
            <button
              type="button"
              onClick={() => onSelect(project)}
              className="h-11 rounded-2xl bg-white/5 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
            >
              Detalhes
            </button>
            <a
              href={repositoryHref(project.repository)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-violet-500 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-400"
            >
              Ver Repositorio no GitHub
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
