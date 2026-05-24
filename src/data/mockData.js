export const mockProjects = [
  {
    id: 'uh-aurora-ci',
    name: 'Aurora CI Dashboard',
    repository: 'github.com/felipeandrade/aurora-ci-dashboard',
    imageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    owner: 'Felipe Andrade',
    status: 'Buscando Mantenedor',
    difficulty: 'Avancado',
    stack: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
    stars: 842,
    issues: 37,
    lastCommit: '2025-10-18',
    summary: 'Painel de observabilidade para pipelines CI/CD com timeline, logs filtraveis e alertas por webhook.',
    stopPoint:
      'O backend ja recebe eventos de GitHub Actions e GitLab CI, mas a camada de agregacao de metricas ainda precisa ser otimizada. O gargalo atual esta nas consultas de historico e no modelo de retencao para grandes organizacoes.',
    needs:
      'Alguem com experiencia em PostgreSQL, filas e dashboards operacionais para estabilizar o modulo de metricas e publicar a primeira versao SaaS self-hosted.',
  },
  {
    id: 'uh-ledgerkit',
    name: 'LedgerKit',
    repository: 'github.com/marinahorta/ledgerkit',
    imageUrl:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    owner: 'Marina Horta',
    status: 'Buscando Mantenedor',
    difficulty: 'Intermediario',
    stack: ['TypeScript', 'Fastify', 'Prisma', 'SQLite'],
    stars: 514,
    issues: 22,
    lastCommit: '2025-07-04',
    summary: 'Motor financeiro open-source para conciliacao simples, trilha de auditoria e exportacao contabil.',
    stopPoint:
      'A API principal esta documentada e coberta por testes unitarios, mas a importacao OFX/CSV ainda tem inconsistencias em bancos brasileiros. O projeto precisa de normalizadores melhores e exemplos de integracao.',
    needs:
      'Mantenedor focado em qualidade de dados, design de APIs e documentacao para transformar o pacote em uma biblioteca confiavel para pequenos ERPs.',
  },
  {
    id: 'uh-vector-notes',
    name: 'Vector Notes',
    repository: 'github.com/renatolima/vector-notes',
    imageUrl:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    owner: 'Renato Lima',
    status: 'Buscando Mantenedor',
    difficulty: 'Avancado',
    stack: ['Python', 'FastAPI', 'React', 'Qdrant'],
    stars: 1290,
    issues: 64,
    lastCommit: '2025-11-29',
    summary: 'Base pessoal de conhecimento com busca semantica, embeddings locais e editor markdown colaborativo.',
    stopPoint:
      'O prototipo funciona localmente, mas falta separar o worker de indexacao, melhorar o controle de permissoes e criar migracoes previsiveis para colecoes vetoriais existentes.',
    needs:
      'Pessoa ou time interessado em IA aplicada, seguranca de dados e experiencia de editor para levar o projeto ate um release estavel.',
  },
  {
    id: 'uh-packetlens',
    name: 'PacketLens',
    repository: 'github.com/lucasfontes/packetlens',
    imageUrl:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    owner: 'Lucas Fontes',
    status: 'Buscando Mantenedor',
    difficulty: 'Especialista',
    stack: ['Rust', 'Tauri', 'Svelte', 'SQLite'],
    stars: 2318,
    issues: 89,
    lastCommit: '2025-09-11',
    summary: 'Aplicativo desktop para inspecao leve de trafego local, snapshots e anotacoes de debugging.',
    stopPoint:
      'A captura basica esta solida no Linux, mas Windows e macOS precisam de ajustes no empacotamento e permissoes. A interface tambem precisa de uma estrategia melhor para grandes volumes de pacotes.',
    needs:
      'Mantenedor com experiencia em Rust, rede e apps desktop multiplataforma para fechar o suporte cross-platform.',
  },
  {
    id: 'uh-formforge',
    name: 'FormForge',
    repository: 'github.com/biancasantos/formforge',
    imageUrl:
      'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80',
    owner: 'Bianca Santos',
    status: 'Buscando Mantenedor',
    difficulty: 'Iniciante',
    stack: ['Vue', 'Firebase', 'Tailwind CSS'],
    stars: 276,
    issues: 12,
    lastCommit: '2026-01-15',
    summary: 'Construtor de formularios internos com regras condicionais, temas e exportacao de respostas.',
    stopPoint:
      'O fluxo visual ja cria formularios simples, mas faltam validacoes compostas, templates reutilizaveis e uma camada clara de permissoes entre editores e respondentes.',
    needs:
      'Boa oportunidade para quem quer evoluir um produto pequeno, melhorar UX de formularios e organizar regras de negocio no frontend.',
  },
  {
    id: 'uh-cachepilot',
    name: 'CachePilot',
    repository: 'github.com/thiagoramos/cachepilot',
    imageUrl:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    owner: 'Thiago Ramos',
    status: 'Buscando Mantenedor',
    difficulty: 'Intermediario',
    stack: ['Go', 'Redis', 'Kubernetes'],
    stars: 701,
    issues: 31,
    lastCommit: '2025-08-22',
    summary: 'Operador Kubernetes para padronizar politicas de cache, limites e invalidacoes controladas.',
    stopPoint:
      'O controller cria recursos basicos e aplica configuracoes no Redis, mas ainda faltam reconciliacao robusta, testes end-to-end e documentacao para cenarios de rollback.',
    needs:
      'Mantenedor com pratica em Kubernetes operators e infraestrutura para amadurecer o projeto em ambientes de staging reais.',
  },
];
