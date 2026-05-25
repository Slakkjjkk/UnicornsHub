import { Github, Linkedin, Loader2, Rocket, Save, UserRound, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { fetchSavedProjects } from '../services/projectService.js';
import { getProfile, updateProfile } from '../services/profileService.js';
import { getSafeErrorMessage } from '../utils/errors.js';
import {
  GITHUB_PROFILE_REGEX,
  LINKEDIN_PROFILE_REGEX,
  MAX_PROFILE_NAME_LENGTH,
  MAX_SOCIAL_URL_LENGTH,
  safeGitHubRepositoryUrl,
  safeProfileUrl,
  sanitizeText,
  sanitizeUrl,
} from '../utils/security.js';

export default function ProfileModal({ isOpen, profileId, currentUser, projects, onClose, onProfileUpdated }) {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedProjectsLoading, setIsSavedProjectsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('published');
  const [savedProjects, setSavedProjects] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isOwnProfile = Boolean(currentUser?.id && profileId === currentUser.id);

  useEffect(() => {
    if (!isOpen || !profileId) {
      return;
    }

    let isMounted = true;

    async function loadProfile() {
      setIsLoading(true);
      setError('');
      setSuccess('');

      try {
        const profileData = await getProfile(profileId);

        if (isMounted) {
          setProfile(profileData);
          setFullName(profileData?.full_name || '');
          setGithubUrl(profileData?.github_url || '');
          setLinkedinUrl(profileData?.linkedin_url || '');
        }
      } catch (loadError) {
        if (isMounted) {
          const message = getSafeErrorMessage(loadError, t, 'profile.loadError');
          setError(message);
          toast.error(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [isOpen, profileId]);

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('published');
      setSavedProjects([]);
      return;
    }

    if (!isOwnProfile || activeTab !== 'saved') {
      return;
    }

    let isMounted = true;

    async function loadSavedProjects() {
      setIsSavedProjectsLoading(true);
      setError('');

      try {
        const savedProjectData = await fetchSavedProjects(currentUser.id);

        if (isMounted) {
          setSavedProjects(savedProjectData);
        }
      } catch (loadError) {
        if (isMounted) {
          const message = getSafeErrorMessage(loadError, t, 'profile.savedLoadError');
          setError(message);
          toast.error(message);
        }
      } finally {
        if (isMounted) {
          setIsSavedProjectsLoading(false);
        }
      }
    }

    loadSavedProjects();

    return () => {
      isMounted = false;
    };
  }, [activeTab, currentUser?.id, isOpen, isOwnProfile]);

  const profileProjects = useMemo(() => {
    return projects.filter((project) => project.userId === profileId);
  }, [projects, profileId]);

  const activeProjects = activeTab === 'saved' ? savedProjects : profileProjects;
  const isProjectListLoading = activeTab === 'saved' && isSavedProjectsLoading;

  if (!isOpen) {
    return null;
  }

  const displayName = profile?.full_name || (isOwnProfile ? currentUser?.email?.split('@')[0] : null) || t('profile.fallbackName');
  const trimmedGithubUrl = sanitizeUrl(githubUrl, MAX_SOCIAL_URL_LENGTH);
  const trimmedLinkedinUrl = sanitizeUrl(linkedinUrl, MAX_SOCIAL_URL_LENGTH);
  const githubError = trimmedGithubUrl && !GITHUB_PROFILE_REGEX.test(trimmedGithubUrl) ? t('profile.invalidGithubUrl') : '';
  const linkedinError = trimmedLinkedinUrl && !LINKEDIN_PROFILE_REGEX.test(trimmedLinkedinUrl) ? t('profile.invalidLinkedinUrl') : '';
  const publicLinks = [
    safeProfileUrl(profile?.github_url, GITHUB_PROFILE_REGEX)
      ? { href: safeProfileUrl(profile.github_url, GITHUB_PROFILE_REGEX), label: t('profile.github'), icon: Github }
      : null,
    safeProfileUrl(profile?.linkedin_url, LINKEDIN_PROFILE_REGEX)
      ? { href: safeProfileUrl(profile.linkedin_url, LINKEDIN_PROFILE_REGEX), label: t('profile.linkedin'), icon: Linkedin }
      : null,
  ].filter(Boolean);

  async function handleSave(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const sanitizedFullName = sanitizeText(fullName, MAX_PROFILE_NAME_LENGTH);

    if (!sanitizedFullName) {
      setError(t('profile.nameRequired'));
      toast.error(t('profile.nameRequired'));
      return;
    }

    if (githubError || linkedinError) {
      const message = githubError || linkedinError;
      setError(message);
      toast.error(message);
      return;
    }

    setIsSaving(true);

    try {
      const updatedProfile = await updateProfile(currentUser.id, {
        full_name: sanitizedFullName,
        avatar_url: currentUser.user_metadata?.avatar_url || profile?.avatar_url || '',
        github_url: trimmedGithubUrl,
        linkedin_url: trimmedLinkedinUrl,
      });

      setProfile(updatedProfile);
      onProfileUpdated(updatedProfile);
      const message = t('profile.saveSuccess');
      setSuccess(message);
      toast.success(message);
    } catch (saveError) {
      const message = getSafeErrorMessage(saveError, t, 'profile.loadError');
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4 py-8 font-jetbrains-mono backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto border border-zinc-800 bg-black text-zinc-400">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-zinc-800 bg-black/95 p-5">
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                loading="lazy"
                decoding="async"
                className="h-14 w-14 border border-zinc-800 object-cover grayscale transition hover:grayscale-0"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center border border-zinc-800 bg-black text-zinc-500">
                <UserRound className="h-7 w-7" />
              </div>
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                {isOwnProfile ? t('profile.myProfile') : t('profile.publicProfile')}
              </p>
              <h2 className="mt-2 text-2xl font-bold uppercase tracking-widest text-white">{displayName}</h2>
              {!isOwnProfile && publicLinks.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {publicLinks.map(({ href, label, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-400 transition hover:text-white"
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center text-white transition hover:text-zinc-400"
            aria-label={t('profile.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-8 p-5 lg:p-8">
          {isLoading ? (
            <div className="flex items-center gap-3 border-t border-zinc-800 py-5 text-zinc-400">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
              {t('profile.loading')}
            </div>
          ) : null}

          {isOwnProfile && !isLoading ? (
            <form onSubmit={handleSave} className="border-t border-zinc-800 py-6">
              <label className="grid gap-2 text-xs font-bold uppercase tracking-widest text-white">
                {t('profile.displayName')}
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder={t('profile.displayNamePlaceholder')}
                  maxLength={MAX_PROFILE_NAME_LENGTH}
                />
              </label>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-xs font-bold uppercase tracking-widest text-white">
                  {t('profile.githubUrl')}
                  <input
                    value={githubUrl}
                    onChange={(event) => setGithubUrl(event.target.value)}
                    placeholder={t('profile.githubPlaceholder')}
                    maxLength={MAX_SOCIAL_URL_LENGTH}
                    className={githubError ? 'border-zinc-300 focus:border-zinc-300' : ''}
                  />
                  {githubError ? <p className="text-xs font-bold text-zinc-300">{githubError}</p> : null}
                </label>

                <label className="grid gap-2 text-xs font-bold uppercase tracking-widest text-white">
                  {t('profile.linkedinUrl')}
                  <input
                    value={linkedinUrl}
                    onChange={(event) => setLinkedinUrl(event.target.value)}
                    placeholder={t('profile.linkedinPlaceholder')}
                    maxLength={MAX_SOCIAL_URL_LENGTH}
                    className={linkedinError ? 'border-zinc-300 focus:border-zinc-300' : ''}
                  />
                  {linkedinError ? <p className="text-xs font-bold text-zinc-300">{linkedinError}</p> : null}
                </label>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {error ? <p className="text-sm font-bold text-zinc-300">{error}</p> : null}
                  {success ? <p className="text-sm font-bold text-white">{success}</p> : null}
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex h-12 items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-400 transition hover:text-white disabled:cursor-not-allowed disabled:text-zinc-700"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSaving ? t('profile.saving') : t('profile.save')}
                </button>
              </div>
            </form>
          ) : null}

          {!isOwnProfile && error ? (
            <p className="border-t border-zinc-800 py-5 text-sm font-bold text-zinc-300">
              {error}
            </p>
          ) : null}

          <section>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  {activeTab === 'saved' ? t('profile.savedProjects') : t('profile.publishedProjects')}
                </p>
                <h3 className="mt-2 text-xl font-bold uppercase tracking-widest text-white">{t('profile.assetsCount', { count: activeProjects.length })}</h3>
              </div>

              {isOwnProfile ? (
                <div className="inline-flex gap-5 border-t border-zinc-800 pt-3 sm:border-t-0 sm:pt-0">
                  {[
                    ['published', t('profile.myProjectsTab')],
                    ['saved', t('profile.savedProjectsTab')],
                  ].map(([tab, label]) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`text-xs font-bold uppercase tracking-widest transition ${
                        activeTab === tab ? 'text-white underline underline-offset-4' : 'text-zinc-500 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {isProjectListLoading ? (
              <div className="flex items-center gap-3 border-t border-zinc-800 py-5 text-zinc-400">
                <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                {t('profile.loadingSavedProjects')}
              </div>
            ) : null}

            {!isProjectListLoading && activeProjects.length ? (
              <div className="grid gap-6">
                {activeProjects.map((project) => (
                  <a
                    key={project.id}
                    href={safeGitHubRepositoryUrl(project.repository) || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group border-t border-zinc-800 py-5 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 overflow-hidden border border-zinc-800 bg-black">
                        {project.image || project.imageUrl ? (
                          <img
                            src={project.image || project.imageUrl}
                            alt={project.name}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover grayscale transition duration-300 group-hover:grayscale-0"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-black">
                            <Rocket className="h-6 w-6 text-zinc-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold uppercase tracking-widest text-white transition group-hover:text-sky-400">{project.name}</p>
                        <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-zinc-400">{project.summary}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : null}

            {!isProjectListLoading && !activeProjects.length ? (
              <div className="border-t border-zinc-800 py-10 text-center">
                <p className="font-bold uppercase tracking-widest text-white">
                  {activeTab === 'saved' ? t('profile.noSavedProjectsTitle') : t('profile.noProjectsTitle')}
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-400">
                  {activeTab === 'saved' ? t('profile.noSavedProjectsText') : t('profile.noProjectsText')}
                </p>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
