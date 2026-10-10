import { AnalysisResult, PaginatedAnalyses } from "../schemas/analysis";
import { AuthUser } from "../schemas/auth";

export const MOCK_USERS: AuthUser[] = [
  {
    id: "usr_ops_01",
    nome: "Alexandre Santos",
    email: "analista@opspilot.ai",
    cargo: "Especialista em Triagem & Incidentes",
  },
];

export const MOCK_ANALYSES: AnalysisResult[] = [
  {
    id: "anl_891234",
    relato:
      "Clientes reportando erro 502 Bad Gateway intermitente no checkout desde as 14:20 após deploy da release v3.4. O volume de chamados de suporte aumentou 300% na última hora e carrinhos estão sendo abandonados.",
    tom: "formal",
    canal: "ticket",
    diagnostico:
      "Degradação severa no serviço de checkout após deploy de microsserviço com vazamento de conexão no pool do PostgreSQL, provocando timeout nos pods do Kubernetes.",
    categoria: "Infraestrutura & Pagamentos",
    prioridade: "critica",
    sentimento: "urgente",
    confianca: 94,
    requerRevisaoHumana: false,
    planoDeAcao: [
      {
        ordem: 1,
        titulo: "Rollback Imediato da Release v3.4",
        descricao:
          "Reverter deploy do pod checkout-service para a tag v3.3.9 estável no cluster de produção.",
        responsavelSugerido: "Engenharia DevOps / SRE",
        prazoSugerido: "15 minutos",
      },
      {
        ordem: 2,
        titulo: "Drenagem e Reinicialização do Pool de Conexões",
        descricao:
          "Executar restart escalonado do PgBouncer para liberar conexões travadas em estado idle-in-transaction.",
        responsavelSugerido: "DBA / Infra",
        prazoSugerido: "30 minutos",
      },
      {
        ordem: 3,
        titulo: "Comunicação de Incidente no Statuspage",
        descricao:
          "Publicar informe operacional aos clientes e manter suporte de prontidão com template de resposta rápida.",
        responsavelSugerido: "Coordenador de Incidentes",
        prazoSugerido: "Imediato",
      },
    ],
    informacoesFaltantes: [
      "ID do commit exato que gerou o deploy v3.4",
      "Métricas de latência p99 do banco primário",
    ],
    riscosIdentificados: [
      "Perda de faturamento direto durante a janela de pico",
      "Impacto na reputação e churn de clientes B2B",
      "Sobrecarga dos atendentes de atendimento ao cliente",
    ],
    respostaSugerida:
      "Olá equipe,\n\nIdentificamos a causa raiz da instabilidade no checkout associada ao deploy v3.4. O procedimento de rollback emergencial já foi acionado junto ao time de SRE. Previsão de normalização em 25 minutos. Manteremos este canal atualizado.",
    dataCriacao: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    usuarioId: "usr_ops_01",
  },
  {
    id: "anl_891235",
    relato:
      "O cliente corporativo Acme Corp enviou e-mail solicitando esclarecimento sobre cobrança duplicada na fatura de Março. O tom do e-mail é de insatisfação moderada e ameaçam cancelar o contrato caso não seja estornado até amanhã.",
    tom: "empatico",
    canal: "email",
    diagnostico:
      "Cobrança duplicada identificada decorrente de retry assíncrono no webhook do gateway de pagamento, gerando duas transações aprovadas para a mesma fatura.",
    categoria: "Faturamento & Financeiro",
    prioridade: "alta",
    sentimento: "negativo",
    confianca: 89,
    requerRevisaoHumana: true,
    planoDeAcao: [
      {
        ordem: 1,
        titulo: "Validação do Log de Faturamento",
        descricao:
          "Confirmar no dashboard do gateway as duas transações correlacionadas à fatura #49281.",
        responsavelSugerido: "Analista Financeiro",
        prazoSugerido: "1 hora",
      },
      {
        ordem: 2,
        titulo: "Processamento do Estorno Imediato",
        descricao:
          "Emitir o estorno da segunda cobrança e gerar comprovante bancário em PDF.",
        responsavelSugerido: "Financeiro / Contas a Receber",
        prazoSugerido: "2 horas",
      },
      {
        ordem: 3,
        titulo: "Envio de Resposta Personalizada",
        descricao:
          "Responder com pedido formal de desculpas, comprovante em anexo e crédito de cortesia na próxima fatura.",
        responsavelSugerido: "Customer Success Executivo",
        prazoSugerido: "Hoje",
      },
    ],
    informacoesFaltantes: [
      "ID da fatura específica mencionada no e-mail",
      "Nome do contato financeiro da Acme Corp",
    ],
    riscosIdentificados: [
      "Risco iminente de churn de conta corporativa de alto valor",
      "Contestação bancária (chargeback) com penalidade de taxa",
    ],
    respostaSugerida:
      "Prezada equipe Acme Corp,\n\nPedimos sinceras desculpas pelo inconveniente. Confirmamos que uma inconsistência momentânea ocasionou o débito duplicado. O estorno de R$ 14.850,00 já foi processado e segue comprovante em anexo. Como consideração pela confiança, aplicamos um desconto de 10% no ciclo seguinte.",
    dataCriacao: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    usuarioId: "usr_ops_01",
  },
  {
    id: "anl_891236",
    relato:
      "Equipe de logística reporta lentidão no app de leitura de código de barras nos centros de distribuição CD-01 e CD-03 durante o turno da manhã.",
    tom: "neutro",
    canal: "chat",
    diagnostico:
      "Sobrecarga na API de sincronização de estoque dos coletores de dados devido a requisições sem paginação geradas por nova versão do firmware.",
    categoria: "Operações & Logística",
    prioridade: "media",
    sentimento: "neutro",
    confianca: 82,
    requerRevisaoHumana: false,
    planoDeAcao: [
      {
        ordem: 1,
        titulo: "Ajustar Rate Limiter da API de Coletores",
        descricao:
          "Habilitar cache distribuído Redis para consultas frequentes de SKUs nos CDs afetados.",
        responsavelSugerido: "Tech Lead Backend",
        prazoSugerido: "Hoje",
      },
      {
        ordem: 2,
        titulo: "Instruir Supervisores dos CDs",
        descricao:
          "Divulgar procedimento de contingência manual enquanto o cache é propagado.",
        responsavelSugerido: "Coordenação Operacional",
        prazoSugerido: "30 minutos",
      },
    ],
    informacoesFaltantes: [
      "Versão do aplicativo instalada nos coletores físicos",
    ],
    riscosIdentificados: [
      "Atraso no despacho de remessas diárias para transportadoras",
    ],
    respostaSugerida:
      "Time CD-01 e CD-03, identificamos lentidão no endpoint de sync. Aplicamos uma otimização no cache central e a latência deve estabilizar nos próximos minutos. Por favor, avisem se o problema persistir.",
    dataCriacao: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    usuarioId: "usr_ops_01",
  },
  {
    id: "anl_891237",
    relato:
      "Dúvida rotineira do departamento de compras sobre política de aprovação de notas fiscais acima de R$ 50.000 para fornecedores de TI.",
    tom: "formal",
    canal: "reuniao",
    diagnostico:
      "Esclarecimento sobre a matriz de alçadas e governança de suprimentos corporativos vigente na política interna.",
    categoria: "Governança & Compliance",
    prioridade: "baixa",
    sentimento: "positivo",
    confianca: 96,
    requerRevisaoHumana: false,
    planoDeAcao: [
      {
        ordem: 1,
        titulo: "Compartilhamento do Documento de Política de Alçadas",
        descricao:
          "Enviar link da Wiki corporativa com fluxo de aprovação de diretoria para compras acima de 50k.",
        responsavelSugerido: "Analista de Governança",
        prazoSugerido: "1 dia útil",
      },
    ],
    informacoesFaltantes: [],
    riscosIdentificados: [
      "Inconformidade em auditoria caso processo não seja registrado no ERP",
    ],
    respostaSugerida:
      "Prezados, notas fiscais que superam o limite de R$ 50.000,00 requerem validação dupla no ERP (Gerência + Diretoria de TI). O formulário padrão e as instruções estão disponíveis na página de Políticas Internas.",
    dataCriacao: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    usuarioId: "usr_ops_01",
  },
];

// In-memory array for mock mutations during session
let inMemoryAnalyses: AnalysisResult[] = [...MOCK_ANALYSES];

export function getMockAnalyses(filters?: {
  q?: string;
  prioridade?: string;
  categoria?: string;
  page?: number;
  limit?: number;
}): PaginatedAnalyses {
  let filtered = [...inMemoryAnalyses];

  if (filters?.q) {
    const qLower = filters.q.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.relato.toLowerCase().includes(qLower) ||
        a.diagnostico.toLowerCase().includes(qLower) ||
        a.categoria.toLowerCase().includes(qLower)
    );
  }

  if (filters?.prioridade && filters.prioridade !== "todas") {
    filtered = filtered.filter((a) => a.prioridade === filters.prioridade);
  }

  if (filters?.categoria && filters.categoria !== "todas") {
    filtered = filtered.filter((a) =>
      a.categoria.toLowerCase().includes(filters.categoria!.toLowerCase())
    );
  }

  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}

export function getMockAnalysisById(id: string): AnalysisResult | null {
  return inMemoryAnalyses.find((a) => a.id === id) || null;
}

export function createMockAnalysis(data: {
  relato: string;
  tom: "formal" | "neutro" | "empatico";
  canal: "email" | "chat" | "ticket" | "reuniao" | "outro";
  urgenciaUsuario?: number;
  contextoAdicional?: string;
}): AnalysisResult {
  // Determine severity and category based on keywords
  const text = (data.relato + " " + (data.contextoAdicional || "")).toLowerCase();
  let prioridade: "critica" | "alta" | "media" | "baixa" = "media";
  let sentimento: "urgente" | "negativo" | "neutro" | "positivo" = "neutro";
  let categoria = "Operações Gerais";
  let requerRevisaoHumana = false;

  if (text.includes("502") || text.includes("queda") || text.includes("parou") || text.includes("urgente") || text.includes("fora do ar")) {
    prioridade = "critica";
    sentimento = "urgente";
    categoria = "Infraestrutura & Disponibilidade";
  } else if (text.includes("fatura") || text.includes("cobrança") || text.includes("cancelar") || text.includes("pagamento")) {
    prioridade = "alta";
    sentimento = "negativo";
    categoria = "Faturamento & Financeiro";
    requerRevisaoHumana = true;
  } else if (text.includes("lentidão") || text.includes("demora") || text.includes("estoque") || text.includes("erro")) {
    prioridade = "media";
    sentimento = "neutro";
    categoria = "Operações & Logística";
  } else {
    prioridade = "baixa";
    sentimento = "positivo";
    categoria = "Atendimento ao Cliente";
  }

  if (data.urgenciaUsuario && data.urgenciaUsuario >= 4) {
    if (prioridade === "media" || prioridade === "baixa") {
      prioridade = "alta";
    }
  }

  const newAnalysis: AnalysisResult = {
    id: `anl_${Date.now().toString(36)}`,
    relato: data.relato,
    tom: data.tom,
    canal: data.canal,
    diagnostico: `Diagnóstico automatizado OpsPilot: Identificado padrão em ${categoria.toLowerCase()} com impacto na continuidade de processos. A severidade foi classificada como ${prioridade.toUpperCase()} com base no histórico de ocorrências.`,
    categoria,
    prioridade,
    sentimento,
    confianca: Math.floor(85 + Math.random() * 12),
    requerRevisaoHumana,
    planoDeAcao: [
      {
        ordem: 1,
        titulo: "Triagem Técnica Inicial",
        descricao: "Isolar o escopo do problema e acionar a equipe responsável pelo domínio.",
        responsavelSugerido: "Plantão Operacional",
        prazoSugerido: "30 minutos",
      },
      {
        ordem: 2,
        titulo: "Mitigação e Execução de Procedimento",
        descricao: "Aplicar a correção recomendada e monitorar indicadores de sucesso.",
        responsavelSugerido: "Time Especialista",
        prazoSugerido: "2 horas",
      },
      {
        ordem: 3,
        titulo: "Comunicação e Fechamento com Solicitante",
        descricao: "Fornecer feedback claro adotando tom " + data.tom + " no canal " + data.canal + ".",
        responsavelSugerido: "Analista de Atendimento",
        prazoSugerido: "Hoje",
      },
    ],
    informacoesFaltantes: [
      "Identificador único da transação ou recurso afetado",
      "Timestamp exato do primeiro sintoma percebido",
    ],
    riscosIdentificados: [
      "Potencial escalada de insatisfação caso a resposta exceda o SLA",
      "Impacto colateral em fluxos correlatos",
    ],
    respostaSugerida:
      data.tom === "formal"
        ? `Prezado(a),\n\nAgradecemos o contato. Nossa equipe de operações registrou a ocorrência referente a ${categoria.toLowerCase()} e o procedimento padrão já foi iniciado sob a prioridade ${prioridade}. Manteremos você informado(a) das etapas de resolução.`
        : data.tom === "empatico"
        ? `Olá! Compreendemos perfeitamente o impacto dessa situação no seu dia a dia e estamos dedicando atenção prioritária para resolver isso o mais rápido possível. Nossa equipe já está atuando e entraremos em contato com atualizações em breve.`
        : `Olá. Registramos sua solicitação de ${categoria.toLowerCase()}. A equipe técnica já foi acionada para diagnóstico e correção. Seguiremos com atualizações por este mesmo canal.`,
    dataCriacao: new Date().toISOString(),
    usuarioId: "usr_ops_01",
  };

  // Prepend to array
  inMemoryAnalyses = [newAnalysis, ...inMemoryAnalyses];
  return newAnalysis;
}
