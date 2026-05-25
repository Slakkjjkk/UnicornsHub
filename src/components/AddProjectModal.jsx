import { ImagePlus, Rocket, UploadCloud, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getSafeErrorMessage } from '../utils/errors.js';
import {
  GITHUB_REPOSITORY_REGEX,
  MAX_PROJECT_NAME_LENGTH,
  MAX_PROJECT_TEXT_LENGTH,
  MAX_REPOSITORY_URL_LENGTH,
  MAX_STACK_LENGTH,
  sanitizeText,
  sanitizeUrl,
} from '../utils/security.js';

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

const initialForm = {
  name: '',
  repository: '',
  image: '',
  difficulty: 'Intermediario',
  stack: '',
  summary: '',
  stopPoint: '',
  needs: '',
};

export default function AddProjectModal({ isOpen, onClose, onAddProject }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(initialForm);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  const normalizedForm = useMemo(() => {
    return {
      name: sanitizeText(form.name, MAX_PROJECT_NAME_LENGTH),
      repository: sanitizeUrl(form.repository, MAX_REPOSITORY_URL_LENGTH),
      difficulty: form.difficulty.trim(),
      stack: sanitizeText(form.stack, MAX_STACK_LENGTH),
      summary: sanitizeText(form.summary, MAX_PROJECT_TEXT_LENGTH),
      stopPoint: sanitizeText(form.stopPoint, MAX_PROJECT_TEXT_LENGTH),
      needs: sanitizeText(form.needs, MAX_PROJECT_TEXT_LENGTH),
    };
  }, [form]);

  const repositoryHasValue = Boolean(normalizedForm.repository);
  const isRepositoryValid = !repositoryHasValue || GITHUB_REPOSITORY_REGEX.test(normalizedForm.repository);
  const repositoryError = repositoryHasValue && !isRepositoryValid ? t('addProject.repositoryInvalid') : '';
  const hasValidationErrors = Boolean(repositoryError);

  if (!isOpen) {
    return null;
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      setFileName('');
      updateField('image', '');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setFileName('');
      updateField('image', '');
      setError(t('addProject.imageTooLarge'));
      toast.error(t('addProject.imageTooLarge'));

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      return;
    }

    setError('');
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      updateField('image', reader.result);
    };
    reader.readAsDataURL(file);
  }

  function handleClose() {
    setForm(initialForm);
    setFileName('');
    setError('');
    onClose();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError('');

    if (hasValidationErrors) {
      setError(t('addProject.validationError'));
      toast.error(t('addProject.validationError'));
      return;
    }

    const stack = normalizedForm.stack
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    setIsSubmitting(true);

    try {
      await onAddProject({
        name: normalizedForm.name,
        repository: normalizedForm.repository,
        image: form.image,
        difficulty: normalizedForm.difficulty,
        stack: stack.length ? stack : ['A definir'],
        status: 'Buscando Mantenedor',
        createdAt: new Date().toISOString(),
        stars: 0,
        issues: 0,
        lastCommit: new Date().toISOString().slice(0, 10),
        summary: normalizedForm.summary,
        stopPoint: normalizedForm.stopPoint,
        needs: normalizedForm.needs,
      });

      setForm(initialForm);
      setFileName('');
      toast.success(t('addProject.submitSuccess'));
      onClose();
    } catch (submitError) {
      const message = getSafeErrorMessage(submitError, t, 'addProject.submitError');
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSubmit =
    normalizedForm.name &&
    normalizedForm.repository &&
    normalizedForm.summary &&
    normalizedForm.stopPoint &&
    normalizedForm.needs &&
    !hasValidationErrors &&
    !isSubmitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4 py-8 font-jetbrains-mono backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto border border-zinc-800 bg-black text-zinc-400">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-black/95 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t('addProject.eyebrow')}</p>
            <h2 className="mt-2 text-2xl font-bold uppercase tracking-widest text-white">{t('addProject.title')}</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-center text-white transition hover:text-zinc-400"
            aria-label={t('addProject.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-8 p-5 lg:p-8">
          <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="border border-zinc-800 bg-black p-3 text-white">
              <div className="relative aspect-[4/5] overflow-hidden border border-zinc-900 bg-black">
                {form.image ? (
                  <img
                    src={form.image}
                    alt={t('addProject.previewAlt')}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover grayscale transition duration-300 hover:grayscale-0"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-4 bg-black p-8 text-center">
                    <div className="flex h-20 w-20 items-center justify-center border border-zinc-800">
                      <ImagePlus className="h-10 w-10 text-zinc-600" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">{t('addProject.coverPrompt')}</p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 flex w-full items-center justify-center gap-3 border border-zinc-800 px-5 py-4 text-xs font-bold uppercase tracking-widest text-sky-400 transition hover:border-sky-400 hover:text-white"
              >
                <UploadCloud className="h-5 w-5" />
                {fileName || t('addProject.upload')}
              </button>
            </div>

            <div className="grid gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t('addProject.name')}>
                  <input
                    value={form.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    maxLength={MAX_PROJECT_NAME_LENGTH}
                    required
                  />
                </Field>
                <Field label={t('addProject.repository')}>
                  <input
                    value={form.repository}
                    onChange={(event) => updateField('repository', event.target.value)}
                    placeholder={t('addProject.repositoryPlaceholder')}
                    maxLength={MAX_REPOSITORY_URL_LENGTH}
                    aria-invalid={Boolean(repositoryError)}
                    className={repositoryError ? 'border-zinc-300 focus:border-zinc-300' : ''}
                    required
                  />
                  {repositoryError ? <FieldHint tone="error">{repositoryError}</FieldHint> : null}
                </Field>
              </div>

              <Field label={t('addProject.maturity')}>
                <select value={form.difficulty} onChange={(event) => updateField('difficulty', event.target.value)}>
                  <option>Iniciante</option>
                  <option>Intermediario</option>
                  <option>Avancado</option>
                  <option>Especialista</option>
                </select>
              </Field>

              <Field label={t('addProject.stack')}>
                <input
                  value={form.stack}
                  onChange={(event) => updateField('stack', event.target.value)}
                  placeholder={t('addProject.stackPlaceholder')}
                  maxLength={MAX_STACK_LENGTH}
                />
              </Field>

              <Field label={t('addProject.summary')}>
                <textarea
                  value={form.summary}
                  onChange={(event) => updateField('summary', event.target.value)}
                  maxLength={MAX_PROJECT_TEXT_LENGTH}
                  required
                />
                <CharacterCounter count={form.summary.length} max={MAX_PROJECT_TEXT_LENGTH} label={t('addProject.characterCounter', { count: form.summary.length, max: MAX_PROJECT_TEXT_LENGTH })} />
              </Field>

              <Field label={t('addProject.stopPoint')}>
                <textarea
                  value={form.stopPoint}
                  onChange={(event) => updateField('stopPoint', event.target.value)}
                  maxLength={MAX_PROJECT_TEXT_LENGTH}
                  required
                />
                <CharacterCounter count={form.stopPoint.length} max={MAX_PROJECT_TEXT_LENGTH} label={t('addProject.characterCounter', { count: form.stopPoint.length, max: MAX_PROJECT_TEXT_LENGTH })} />
              </Field>

              <Field label={t('addProject.needs')}>
                <textarea
                  value={form.needs}
                  onChange={(event) => updateField('needs', event.target.value)}
                  maxLength={MAX_PROJECT_TEXT_LENGTH}
                  required
                />
                <CharacterCounter count={form.needs.length} max={MAX_PROJECT_TEXT_LENGTH} label={t('addProject.characterCounter', { count: form.needs.length, max: MAX_PROJECT_TEXT_LENGTH })} />
              </Field>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 pt-6 sm:flex-row sm:justify-end">
            {error ? (
              <p className="border border-zinc-800 px-4 py-3 text-sm font-bold leading-6 text-zinc-300 sm:mr-auto">
                {error}
              </p>
            ) : null}
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 transition hover:text-white"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center justify-center gap-2 border border-zinc-700 px-7 py-4 text-xs font-bold uppercase tracking-widest text-sky-400 transition hover:border-sky-400 hover:text-white disabled:cursor-not-allowed disabled:border-zinc-900 disabled:text-zinc-700"
            >
              <Rocket className="h-4 w-4" />
              {isSubmitting ? t('addProject.submitting') : t('addProject.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-xs font-bold uppercase tracking-widest text-white">
      {label}
      <div className="contents">{children}</div>
    </label>
  );
}

function FieldHint({ children, tone = 'default' }) {
  const toneClass = tone === 'error' ? 'text-zinc-300' : 'text-zinc-500';

  return <p className={`text-xs font-bold leading-5 ${toneClass}`}>{children}</p>;
}

function CharacterCounter({ count, max, label }) {
  const isNearLimit = count >= max * 0.9;

  return (
    <p className={`text-right text-xs font-bold uppercase tracking-widest ${isNearLimit ? 'text-zinc-300' : 'text-zinc-500'}`}>
      {label}
    </p>
  );
}
