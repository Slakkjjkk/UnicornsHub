import { useEffect, useMemo, useState } from 'react';
import AddProjectModal from './components/AddProjectModal.jsx';
import Filters from './components/Filters.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import ProjectCard from './components/ProjectCard.jsx';
import ProjectModal from './components/ProjectModal.jsx';
import { mockProjects } from './data/mockData.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';

export default function App() {
  const [projects, setProjects] = useLocalStorage('unicorns-hub-projects', mockProjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStack, setSelectedStack] = useState('Todos');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Todos');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const projectsWithImages = projects.map((project) => {
      if (project.imageUrl) {
        return project;
      }

      const mockProject = mockProjects.find((item) => item.id === project.id);
      return mockProject?.imageUrl ? { ...project, imageUrl: mockProject.imageUrl } : project;
    });

    const hasMissingImages = projectsWithImages.some((project, index) => project.imageUrl !== projects[index].imageUrl);

    if (hasMissingImages) {
      setProjects(projectsWithImages);
    }
  }, [projects, setProjects]);

  const stacks = useMemo(() => {
    return [...new Set(projects.flatMap((project) => project.stack))].sort();
  }, [projects]);

  const difficulties = useMemo(() => {
    return [...new Set(projects.map((project) => project.difficulty))].sort();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !normalizedSearch ||
        [project.name, project.repository, project.owner, project.summary, project.stopPoint, project.needs]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch) ||
        project.stack.some((tag) => tag.toLowerCase().includes(normalizedSearch));

      const matchesStack = selectedStack === 'Todos' || project.stack.includes(selectedStack);
      const matchesDifficulty = selectedDifficulty === 'Todos' || project.difficulty === selectedDifficulty;

      return matchesSearch && matchesStack && matchesDifficulty;
    });
  }, [projects, searchTerm, selectedStack, selectedDifficulty]);

  const openProjects = projects.filter((project) => project.status === 'Buscando Mantenedor').length;
  const adoptingProjects = projects.filter((project) => project.status === 'Em Processo de Adocao').length;

  function handleAddProject(project) {
    setProjects((currentProjects) => [project, ...currentProjects]);
  }

  function clearFilters() {
    setSelectedStack('Todos');
    setSelectedDifficulty('Todos');
  }

  return (
    <div className="min-h-screen bg-transparent text-zinc-100">
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenAddProject={() => setIsAddModalOpen(true)}
      />

      <Hero totalProjects={projects.length} openProjects={openProjects} adoptingProjects={adoptingProjects} />

      <Filters
        stacks={stacks}
        difficulties={difficulties}
        selectedStack={selectedStack}
        selectedDifficulty={selectedDifficulty}
        onStackChange={setSelectedStack}
        onDifficultyChange={setSelectedDifficulty}
        onClearFilters={clearFilters}
      />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Projetos para adocao</h2>
            <p className="mt-2 text-sm text-zinc-400">
              {filteredProjects.length} resultado{filteredProjects.length === 1 ? '' : 's'} encontrado
              {filteredProjects.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {filteredProjects.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} onSelect={setSelectedProject} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-zinc-900/80 p-12 text-center shadow-2xl shadow-black/20 ring-1 ring-white/10">
            <p className="text-xl font-bold text-white">Nenhum projeto encontrado</p>
            <p className="mt-3 text-sm text-zinc-400">
              Ajuste a busca, limpe os filtros ou doe um novo projeto para aumentar o catalogo.
            </p>
          </div>
        )}
      </main>

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddProject={handleAddProject}
      />
    </div>
  );
}
