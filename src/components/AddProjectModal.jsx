import { Plus, X } from 'lucide-react';
import { useState } from 'react';

const initialForm = {
  name: '',
  repository: '',
  owner: '',
  imageUrl: '',
  difficulty: 'Intermediario',
  stack: '',
  summary: '',
  stopPoint: '',
  needs: '',
};

export default function AddProjectModal({ isOpen, onClose, onAddProject }) {
  const [form, setForm] = useState(initialForm);

  if (!isOpen) {
    return null;
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const stack = form.stack
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    onAddProject({
      id: `uh-${Date.now()}`,
      name: form.name.trim(),
      repository: form.repository.trim(),
      imageUrl: form.imageUrl.trim(),
      owner: form.owner.trim(),
      difficulty: form.difficulty,
      stack: stack.length ? stack : ['A definir'],
      status: 'Buscando Mantenedor',
      stars: 0,
      issues: 0,
      lastCommit: new Date().toISOString().slice(0, 10),
      summary: form.summary.trim(),
      stopPoint: form.stopPoint.trim(),
      needs: form.needs.trim(),
    });

    setForm(initialForm);
    onClose();
  }

  const canSubmit =
    form.name.trim() &&
    form.repository.trim() &&
    form.owner.trim() &&
    form.summary.trim() &&
    form.stopPoint.trim() &&
    form.needs.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 px-4 py-8 backdrop-blur-md">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-zinc-900 shadow-2xl shadow-black/40 ring-1 ring-white/10">
        <div className="sticky top-0 flex items-center justify-between bg-zinc-900/90 p-6 backdrop-blur">
          <div>
            <p className="text-sm font-medium text-violet-200">Adicionar projeto ao hub</p>
            <h2 className="mt-1 text-2xl font-bold text-white">Doar Codigo</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-zinc-300 transition hover:bg-white/10"
            aria-label="Fechar formulario"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome do projeto">
              <input value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
            </Field>
            <Field label="Repositorio">
              <input
                value={form.repository}
                onChange={(event) => updateField('repository', event.target.value)}
                placeholder="github.com/usuario/projeto"
                required
              />
            </Field>
          </div>

          <Field label="URL da Imagem do Projeto">
            <input
              value={form.imageUrl}
              onChange={(event) => updateField('imageUrl', event.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Responsavel atual">
              <input value={form.owner} onChange={(event) => updateField('owner', event.target.value)} required />
            </Field>
            <Field label="Dificuldade">
              <select value={form.difficulty} onChange={(event) => updateField('difficulty', event.target.value)}>
                <option>Iniciante</option>
                <option>Intermediario</option>
                <option>Avancado</option>
                <option>Especialista</option>
              </select>
            </Field>
          </div>

          <Field label="Stack principal">
            <input
              value={form.stack}
              onChange={(event) => updateField('stack', event.target.value)}
              placeholder="React, Node.js, PostgreSQL"
            />
          </Field>

          <Field label="Resumo tecnico">
            <textarea value={form.summary} onChange={(event) => updateField('summary', event.target.value)} required />
          </Field>

          <Field label="Ponto de parada">
            <textarea value={form.stopPoint} onChange={(event) => updateField('stopPoint', event.target.value)} required />
          </Field>

          <Field label="Perfil de mantenedor ideal">
            <textarea value={form.needs} onChange={(event) => updateField('needs', event.target.value)} required />
          </Field>

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-2xl px-5 text-sm font-semibold text-zinc-300 transition hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-violet-500 px-5 text-sm font-semibold text-white shadow-xl shadow-violet-500/20 transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none"
            >
              <Plus className="h-4 w-4" />
              Publicar doacao
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-zinc-300">
      {label}
      <div className="contents">
        {children}
      </div>
    </label>
  );
}
