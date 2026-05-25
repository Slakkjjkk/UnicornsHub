import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import AddProjectModal from './components/AddProjectModal.jsx';
import AuthModal from './components/AuthModal.jsx';
import Filters from './components/Filters.jsx';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import ProfileModal from './components/ProfileModal.jsx';
import ProjectCard from './components/ProjectCard.jsx';
import ProjectDetailsModal from './components/ProjectDetailsModal.jsx';
import { isSupabaseConfigured, supabase } from './lib/supabaseClient.js';
import { addProject, deleteProject, fetchProjects, toggleSaveProject } from './services/projectService.js';
import { ensureProfile } from './services/profileService.js';
import { getSafeErrorMessage } from './utils/errors.js';

function userFacingError(message) {
  const error = new Error(message);
  error.isSafeForUser = true;
  return error;
}

export default function App() {
  const { t } = useTranslation();
  const feedRef = useRef(null);
  const pageSize = 6;
  const [projects, setProjects] = useState([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStack, setSelectedStack] = useState('Todos');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Todos');
  const [sortBy, setSortBy] = useState('recentes');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState('');

  const loadProjects = useCallback(async () => {
    setIsProjectsLoading(true);
    setProjectsError('');

    try {
      const projectData = await fetchProjects(sortBy, user?.id, currentPage, pageSize);
      setProjects(projectData.projects);
      setTotalProjects(projectData.total);
    } catch (error) {
      setProjects([]);
      setTotalProjects(0);
      setProjectsError(getSafeErrorMessage(error, t, 'app.projectLoadError'));
    } finally {
      setIsProjectsLoading(false);
    }
  }, [currentPage, sortBy, t, user?.id]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStack, selectedDifficulty, sortBy]);

  useEffect(() => {
    setSelectedProject((currentProject) => {
      if (!currentProject) {
        return null;
      }

      return projects.find((project) => project.id === currentProject.id) || currentProject;
    });
  }, [projects]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return undefined;
    }

    const channel = supabase
      .channel('projects-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        loadProjects();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'saved_projects' }, () => {
        loadProjects();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadProjects]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsAuthLoading(false);
      return undefined;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        const sessionUser = data.session?.user || null;
        setUser(sessionUser);
        if (sessionUser) {
          ensureProfile(sessionUser)
            .then(setProfile)
            .catch(() => setProfile(null));
        }
        setIsAuthLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user || null;
      setUser(sessionUser);
      setIsAuthLoading(false);

      if (sessionUser) {
        setIsAuthModalOpen(false);
        ensureProfile(sessionUser)
          .then(setProfile)
          .catch(() => setProfile(null));
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const stacks = useMemo(() => {
    return [...new Set(projects.flatMap((project) => project.stack))].sort();
  }, [projects]);

  const difficulties = useMemo(() => {
    return [...new Set(projects.map((project) => project.difficulty))].sort();
  }, [projects]);

  const visibleProjects = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return projects.filter((project) => {
      const searchableText = [
        project.name,
        project.repository,
        project.owner,
        project.profiles?.full_name,
        project.summary,
        project.stopPoint,
        project.needs,
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(normalizedSearch) ||
        project.stack.some((tag) => tag.toLowerCase().includes(normalizedSearch));

      const matchesStack = selectedStack === 'Todos' || project.stack.includes(selectedStack);
      const matchesDifficulty = selectedDifficulty === 'Todos' || project.difficulty === selectedDifficulty;

      return matchesSearch && matchesStack && matchesDifficulty;
    });
  }, [projects, searchTerm, selectedStack, selectedDifficulty]);

  const totalPages = Math.max(1, Math.ceil(totalProjects / pageSize));
  const canGoPrevious = currentPage > 1 && !isProjectsLoading;
  const canGoNext = currentPage < totalPages && !isProjectsLoading;

  const getVerifiedUser = useCallback(async () => {
    if (!isSupabaseConfigured || !user?.id) {
      return null;
    }

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user?.id || data.user.id !== user.id) {
      setUser(null);
      setProfile(null);
      return null;
    }

    return data.user;
  }, [user?.id]);

  const handleAddProject = useCallback(async (project) => {
    const verifiedUser = await getVerifiedUser();

    if (!verifiedUser) {
      setIsAddModalOpen(false);
      setIsAuthModalOpen(true);
      throw userFacingError(t('app.loginRequired'));
    }

    await addProject(project, verifiedUser.id);
    await loadProjects();
  }, [getVerifiedUser, loadProjects, t]);

  const handleToggleSave = useCallback(async (projectId) => {
    const verifiedUser = await getVerifiedUser();

    if (!verifiedUser) {
      setIsAuthModalOpen(true);
      throw userFacingError(t('projectCard.saveLoginRequired'));
    }

    const result = await toggleSaveProject(projectId, verifiedUser.id);

    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              is_saved: result.is_saved,
              adoptions_count: result.adoptions_count,
            }
          : project
      )
    );

    setSelectedProject((currentProject) =>
      currentProject?.id === projectId
        ? {
            ...currentProject,
            is_saved: result.is_saved,
            adoptions_count: result.adoptions_count,
          }
        : currentProject
    );
  }, [getVerifiedUser, t]);

  const handleDeleteProject = useCallback(async (projectId) => {
    const verifiedUser = await getVerifiedUser();
    const targetProject = projects.find((project) => project.id === projectId);

    if (!verifiedUser || targetProject?.userId !== verifiedUser.id) {
      throw userFacingError(t('app.unauthorizedAction'));
    }

    await deleteProject(projectId, verifiedUser.id);
    setProjects((currentProjects) => currentProjects.filter((project) => project.id !== projectId));
    setSelectedProject((currentProject) => (currentProject?.id === projectId ? null : currentProject));
    setTotalProjects((currentTotal) => Math.max(0, currentTotal - 1));
  }, [getVerifiedUser, projects, t]);

  const handlePageChange = useCallback((nextPage) => {
    setCurrentPage(nextPage);
    window.requestAnimationFrame(() => {
      feedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const handleLogout = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      return;
    }

    setIsAuthLoading(true);
    await supabase.auth.signOut();
    setIsAuthLoading(false);
  }, []);

  const handleOpenAddProject = useCallback(async () => {
    const verifiedUser = await getVerifiedUser();

    if (!verifiedUser) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsAddModalOpen(true);
  }, [getVerifiedUser]);

  const handleOpenProfile = useCallback((profileId) => {
    if (!profileId) {
      return;
    }

    setActiveProfileId(profileId);
    setIsProfileModalOpen(true);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedStack('Todos');
    setSelectedDifficulty('Todos');
  }, []);

  const handleProfileUpdated = useCallback((updatedProfile) => {
    setProfile(updatedProfile);
    loadProjects();
  }, [loadProjects]);

  return (
    <div className="min-h-screen overflow-hidden bg-black font-jetbrains-mono text-zinc-400">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4200,
          style: {
            background: '#000000',
            color: '#fff',
            border: '1px solid #27272a',
            borderRadius: '0',
            boxShadow: 'none',
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 600,
          },
          success: {
            iconTheme: {
              primary: '#38bdf8',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#f4f4f5',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="relative">
        <Header
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onOpenAddProject={handleOpenAddProject}
          user={user}
          profile={profile}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenProfile={() => handleOpenProfile(user?.id)}
          onLogout={handleLogout}
          isAuthLoading={isAuthLoading}
        />

        <Hero />

        <Filters
          stacks={stacks}
          difficulties={difficulties}
          selectedStack={selectedStack}
          selectedDifficulty={selectedDifficulty}
          onStackChange={setSelectedStack}
          onDifficultyChange={setSelectedDifficulty}
          onClearFilters={clearFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <main ref={feedRef} className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t('app.sectionEyebrow')}</p>
              <h2 className="mt-3 text-2xl font-bold uppercase tracking-widest text-white">{t('app.sectionTitle')}</h2>
            </div>
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              {isProjectsLoading
                ? t('common.loadingProjects')
                : t('common.projectCount', { count: visibleProjects.length })}
            </p>
          </div>

          {projectsError ? (
            <div className="border-t border-zinc-800 py-6 text-zinc-400">
              <p className="font-bold uppercase tracking-widest text-white">{t('app.dbErrorTitle')}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{projectsError}</p>
            </div>
          ) : null}

          {!projectsError && isProjectsLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-96 animate-pulse border border-zinc-800"
                />
              ))}
            </div>
          ) : null}

          {!projectsError && !isProjectsLoading && visibleProjects.length ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  currentUser={user}
                  onOpenProfile={handleOpenProfile}
                  onOpenDetails={setSelectedProject}
                  onToggleSave={handleToggleSave}
                  onDeleteProject={handleDeleteProject}
                />
              ))}
            </div>
          ) : null}

          {!projectsError && !isProjectsLoading && totalProjects > pageSize ? (
            <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-6 sm:flex-row">
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                {t('pagination.pageIndicator', { current: currentPage, total: totalPages })}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!canGoPrevious}
                  className="px-0 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:text-zinc-400 disabled:cursor-not-allowed disabled:text-zinc-700"
                >
                  {t('pagination.previous')}
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!canGoNext}
                  className="px-0 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:text-zinc-400 disabled:cursor-not-allowed disabled:text-zinc-700"
                >
                  {t('pagination.next')}
                </button>
              </div>
            </div>
          ) : null}

          {!projectsError && !isProjectsLoading && !visibleProjects.length ? (
            <div className="border-t border-zinc-800 py-16 text-center">
              <p className="text-2xl font-bold uppercase tracking-widest text-white">{t('app.emptyTitle')}</p>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-500">
                {t('app.emptyText')}
              </p>
            </div>
          ) : null}
        </main>

        <Footer />

        <AddProjectModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddProject={handleAddProject}
        />

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

        <ProjectDetailsModal
          project={selectedProject}
          currentUser={user}
          onClose={() => setSelectedProject(null)}
          onOpenProfile={handleOpenProfile}
          onToggleSave={handleToggleSave}
          onDeleteProject={handleDeleteProject}
        />

        <ProfileModal
          isOpen={isProfileModalOpen}
          profileId={activeProfileId}
          currentUser={user}
          projects={projects}
          onClose={() => setIsProfileModalOpen(false)}
          onProfileUpdated={handleProfileUpdated}
        />
      </div>
    </div>
  );
}
