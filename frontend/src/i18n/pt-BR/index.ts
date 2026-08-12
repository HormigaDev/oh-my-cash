export default {
  app: { name: "Oh My Cash", shortName: "OMC", tagline: "Suas finanças com clareza" },
  common: { cancel: "Cancelar", clearDate: "Limpar data", close: "Fechar", done: "Concluído", loading: "Carregando", logout: "Sair", menu: "Abrir menu", notAvailable: "—", retry: "Tentar novamente" },
  theme: {
    title: "Aparência", palette: "Tema de cores", mode: "Modo de luminosidade", current: "Aparência: {theme}", light: "Claro", dark: "Escuro", system: "Sistema",
    contrastModeHint: "Os temas de alto contraste fixam a luminosidade para preservar a máxima legibilidade.",
    saveError: "A aparência mudou neste dispositivo, mas não foi possível salvá-la na sua conta.",
    names: { aurora: "Aurora", ocean: "Oceano", royal: "Royal", orchid: "Orquídea", rose: "Rosa", sunset: "Pôr do sol", forest: "Floresta", graphite: "Grafite", coral: "Coral", nord: "Nord", "contrast-light": "Contraste claro", "contrast-dark": "Contraste escuro" }
  },
  auth: {
    login: { eyebrow: "Boas-vindas de volta", title: "Acesse seu espaço financeiro", subtitle: "Consulte suas informações em um ambiente privado e seguro.", email: "E-mail", password: "Senha", showPassword: "Mostrar senha", hidePassword: "Ocultar senha", submit: "Entrar", emailRequired: "Informe seu e-mail.", emailInvalid: "Informe um e-mail válido.", passwordRequired: "Informe sua senha.", invalidCredentials: "O e-mail ou a senha estão incorretos.", unavailable: "Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.", unexpectedError: "Não foi possível entrar. Tente novamente." },
    session: { unavailable: "Não foi possível verificar sua sessão. Você pode tentar entrar novamente." }
  },
  navigation: { label: "Navegação principal", dashboard: "Dashboard", transactions: "Movimentações", recurring: "Regras", categories: "Categorias", account: "Minha conta" },
  dashboard: {
    title: "Dashboard", subtitle: "Seu panorama financeiro mensal em um só lugar.", greeting: "Olá, {name}", summaryLabel: "Resumo financeiro",
    metrics: { realBalance: "Saldo real", globalBalance: "Saldo global", globalBalanceCaption: "Acumulado de todas as movimentações pagas", globalProjectedBalance: "Saldo global projetado", globalProjectedBalanceCaption: "Saldo acumulado ao confirmar todas as movimentações pendentes estimadas", incomeReceived: "Receitas recebidas", expensesPaid: "Despesas pagas", projectedBalance: "Saldo projetado", savings: "Economia real: {rate}", projectedSavings: "Economia projetada: {rate}", pending: "Pendente: {amount}", incomplete: "Projeção incompleta" },
    month: { eyebrow: "Período", choose: "Selecionar mês", start: "Mês inicial", end: "Mês final", previous: "Mês anterior", next: "Próximo mês" },
    projection: { incomplete: "Há {count} movimentação pendente sem valor estimado. A projeção está incompleta. | Há {count} movimentações pendentes sem valor estimado. A projeção está incompleta." },
    overdue: { notice: "Você tem {count} movimentação pendente vencida. | Você tem {count} movimentações pendentes vencidas." },
    actions: { review: "Revisar movimentações", viewAll: "Ver todas" },
    charts: {
      cashFlow: { title: "Fluxo do período", description: "Valores realizados em comparação com o fechamento projetado do intervalo.", label: "Comparação de receitas e despesas reais e projetadas", income: "Receitas", expenses: "Despesas", actual: "Real", projected: "Projetado" },
      spending: { title: "Distribuição das despesas", description: "Composição projetada por categoria.", label: "Distribuição das despesas por categoria", empty: "Ainda não há despesas para representar." }
    },
    spending: { title: "Despesas por categoria", description: "Pagas e pendentes durante o período.", counts: "{paid} pagas · {pending} pendentes", projected: "Projetado", empty: "Não há despesas pagas ou pendentes neste mês." },
    pending: { title: "Próximas movimentações", description: "Receitas e pagamentos ainda pendentes.", noEstimate: "Sem estimativa", noDate: "Sem data prevista", due: "Vence em {date}", overdue: "Venceu em {date}", empty: "Você não tem movimentações pendentes neste mês." },
    activity: { title: "Atividade recente", description: "Últimas movimentações confirmadas do mês.", empty: "Ainda não há movimentações pagas neste mês." },
    loadError: { title: "Não foi possível carregar o dashboard", description: "Verifique sua conexão e tente novamente em instantes." },
    empty: { title: "Seu panorama começa aqui", description: "Quando houver movimentações, você encontrará aqui suas métricas e atividades recentes." }
  },
  categories: {
    title: "Categorias", subtitle: "Organize suas movimentações com categorias adequadas às suas finanças.", count: "{count} categoria | {count} categorias",
    actions: { create: "Nova categoria", createFirst: "Criar primeira categoria", open: "Opções de {name}", edit: "Editar", archive: "Arquivar" },
    filters: { label: "Buscar e filtrar categorias", search: "Buscar categoria", all: "Todas", clear: "Limpar filtros" },
    kind: { expense: "Despesa", income: "Receita", both: "Receita e despesa" },
    form: { createEyebrow: "Nova categoria", editEyebrow: "Editar categoria", createTitle: "Crie uma categoria", editTitle: "Atualize a categoria", name: "Nome", nameRequired: "Informe um nome para a categoria.", nameTooLong: "O nome não pode ultrapassar 80 caracteres.", kind: "Tipo de movimentação", icon: "Ícone", color: "Cor", create: "Criar categoria", save: "Salvar alterações" },
    colors: { none: "Sem cor", teal: "Verde-azulado", emerald: "Esmeralda", cyan: "Ciano", blue: "Azul", indigo: "Índigo", violet: "Violeta", amber: "Âmbar", rose: "Rosa" },
    icons: { none: "Sem ícone", category: "Categoria", restaurant: "Alimentação", home: "Casa", directions_car: "Transporte", shopping_bag: "Compras", health_and_safety: "Saúde", school: "Educação", movie: "Entretenimento", payments: "Pagamentos", savings: "Economia", work: "Trabalho" },
    empty: { title: "Você ainda não tem categorias", description: "Crie sua primeira categoria para começar a organizar receitas e despesas." },
    noResults: { title: "Nenhuma categoria encontrada", description: "Tente outra busca ou remova os filtros aplicados." },
    loadError: { title: "Não foi possível carregar as categorias", description: "Verifique sua conexão e tente novamente em instantes." },
    archive: { title: "Arquivar categoria", description: "{name} deixará de aparecer entre suas categorias disponíveis. Isso não exclui suas movimentações.", confirm: "Arquivar" },
    feedback: { created: "Categoria criada.", updated: "Categoria atualizada.", archived: "Categoria arquivada." },
    errors: { nameTaken: "Já existe uma categoria ativa com esse nome.", unavailable: "Não foi possível conectar ao serviço. Verifique sua conexão.", notFound: "A categoria não está mais disponível.", unexpected: "Não foi possível salvar as alterações. Tente novamente." }
  },
  recurring: {
    title: "Regras recorrentes", subtitle: "Planeje receitas e pagamentos que se repetem todo mês.", count: "{count} regra | {count} regras",
    actions: { create: "Nova regra", createFirst: "Criar primeira regra", manageCategories: "Gerenciar categorias", open: "Opções de {name}", edit: "Editar", deactivate: "Desativar" },
    filters: { label: "Buscar e filtrar regras recorrentes", search: "Buscar regra ou categoria", all: "Todas", clear: "Limpar filtros" },
    direction: { income: "Receita", expense: "Despesa" },
    amount: { fixed: "Valor fixo", variable: "Valor variável", range: "Entre {min} e {max}", from: "A partir de {amount}", upTo: "Até {amount}", noRange: "Sem faixa estimada" },
    schedule: { monthlyDay: "Todo mês, no dia {day}", fromDate: "A partir de {date}", dateRange: "De {start} a {end}" },
    categoryUnavailable: "Categoria indisponível",
    form: {
      createEyebrow: "Nova regra recorrente", editEyebrow: "Editar regra recorrente", createTitle: "Planeje uma movimentação mensal", editTitle: "Atualize o planejamento",
      sections: { identity: "Movimentação", amount: "Valor", schedule: "Calendário" },
      name: "Nome da regra", nameRequired: "Informe um nome para a regra.", nameTooLong: "O nome não pode ultrapassar 120 caracteres.", direction: "Tipo de movimentação", category: "Categoria", categoryRequired: "Selecione uma categoria.", noCompatibleCategories: "Não há categorias compatíveis", categoryRequiredForDirection: "Você precisa de uma categoria compatível com este tipo de movimentação.", manageCategories: "Criar categoria", amountMode: "Comportamento do valor", fixedAmount: "Valor mensal", estimatedAmount: "Valor estimado (opcional)", minAmount: "Mínimo estimado (opcional)", maxAmount: "Máximo estimado (opcional)", variableHelp: "Use a estimativa para planejar e a faixa para representar a variação esperada. O valor real será definido ao confirmar a movimentação.", amountInvalid: "Informe um valor maior que zero com no máximo duas casas decimais.", rangeInvalid: "O mínimo não pode superar o máximo.", estimatedOutsideRange: "A estimativa deve estar entre o mínimo e o máximo.", dayOfMonth: "Dia do mês", dayInvalid: "Informe um dia entre 1 e 31.", startsOn: "Data de início", endsOn: "Data de término (opcional)", dateRequired: "Selecione uma data de início válida.", dateInvalid: "Selecione uma data válida.", dateRangeInvalid: "A data de término não pode ser anterior à data de início.", notes: "Observações (opcional)", create: "Criar regra", save: "Salvar alterações"
    },
    empty: { title: "Você ainda não tem regras recorrentes", description: "Adicione seu salário, aluguel ou outras movimentações mensais para começar a planejar.", noCategoriesTitle: "Primeiro crie uma categoria", noCategoriesDescription: "Cada regra precisa de uma categoria compatível com seu tipo de movimentação." },
    noResults: { title: "Nenhuma regra encontrada", description: "Tente outra busca ou remova os filtros aplicados." },
    loadError: { title: "Não foi possível carregar as regras", description: "Verifique sua conexão e tente novamente em instantes." },
    deactivate: { title: "Desativar regra", description: "{name} deixará de gerar planejamentos futuros. As movimentações existentes não serão excluídas.", confirm: "Desativar" },
    feedback: { created: "Regra recorrente criada.", updated: "Regra recorrente atualizada.", deactivated: "Regra recorrente desativada." },
    errors: { unavailable: "Não foi possível conectar ao serviço. Verifique sua conexão.", notFound: "A regra ou categoria não está mais disponível.", invalid: "Revise os dados da regra e tente novamente.", unexpected: "Não foi possível salvar as alterações. Tente novamente." }
  },
  transactions: {
    title: "Movimentações", subtitle: "Registre o que entra e sai e confirme seus pagamentos planejados.", count: "{count} movimentação | {count} movimentações",
    actions: { create: "Nova movimentação", createFirst: "Registrar primeira movimentação", manageCategories: "Gerenciar categorias", open: "Opções de {name}", edit: "Editar", pay: "Marcar como pago", confirmPayment: "Confirmar valor", skip: "Ignorar este mês", cancel: "Cancelar movimentação" },
    direction: { income: "Receita", expense: "Despesa" },
    status: { pending: "Pendente", paid: "Pago", skipped: "Ignorado", cancelled: "Cancelado" },
    source: { recurring: "Recorrente" },
    amount: { actual: "Valor real", expected: "Valor esperado", pendingDefinition: "Valor a definir" },
    date: { due: "Vence em {date}", occurred: "Realizado em {date}", scheduled: "Programado para {date}", notRecorded: "Sem data registrada" },
    period: "Período: {date}", categoryUnavailable: "Categoria indisponível",
    month: { label: "Período das movimentações", eyebrow: "Período", choose: "Selecionar mês", start: "Mês inicial", end: "Mês final", previous: "Mês anterior", next: "Próximo mês", current: "Voltar ao mês atual" },
    materialization: { notice: "Cada mês mantém uma cópia independente das regras. Alterações posteriores em uma regra só se aplicam aos períodos que ainda não foram materializados." },
    summary: { label: "Resumo das movimentações", pending: "Pendentes", paid: "Pagas", total: "Total", income: "Receitas pagas", expenses: "Despesas pagas", balance: "Saldo do período" },
    filters: { label: "Buscar e filtrar movimentações", search: "Buscar movimentação ou categoria", all: "Todas", clear: "Limpar filtros" },
    form: {
      createEyebrow: "Nova movimentação", editEyebrow: "Editar movimentação", createTitle: "Registre uma receita ou despesa", editTitle: "Atualize a movimentação", direction: "Tipo de movimentação", status: "Estado inicial",
      statusHelp: { pending: "Permanecerá em aberto mesmo que a data já tenha passado. Você poderá confirmar o valor real depois.", paid: "Será registrada como realizada com o valor e a data informados." },
      category: "Categoria", categoryRequired: "Selecione uma categoria.", noCompatibleCategories: "Não há categorias compatíveis", categoryRequiredForDirection: "Você precisa de uma categoria compatível com este tipo de movimentação.", manageCategories: "Criar categoria", description: "Descrição", descriptionRequired: "Informe uma descrição.", descriptionTooLong: "A descrição não pode ultrapassar 160 caracteres.", amount: "Valor real", expectedAmount: "Valor estimado", amountInvalid: "Informe um valor maior que zero com no máximo duas casas decimais.", dueDate: "Data de vencimento", dueDateInvalid: "Selecione uma data de vencimento válida.", occurredAt: "Data e hora", dateInvalid: "Selecione uma data e hora válidas.", notes: "Observações (opcional)", create: "Registrar movimentação", save: "Salvar alterações"
    },
    pay: { eyebrow: "Confirmar movimentação", help: "Ajuste o valor para refletir exatamente o que você pagou ou recebeu.", amount: "Valor real", occurredAt: "Data e hora reais", confirm: "Confirmar como pago" },
    skip: { title: "Ignorar esta movimentação", description: "{name} será ignorada somente neste período. A regra recorrente continuará ativa.", confirm: "Ignorar este período" },
    cancel: { title: "Cancelar movimentação", description: "{name} será cancelada e não poderá mais ser confirmada como paga.", confirm: "Cancelar movimentação" },
    empty: { title: "Você ainda não tem movimentações", description: "Registre manualmente uma receita ou despesa. As movimentações geradas pelas regras também aparecerão aqui.", noCategoriesTitle: "Primeiro crie uma categoria", noCategoriesDescription: "Cada movimentação precisa de uma categoria compatível com seu tipo." },
    noResults: { title: "Nenhuma movimentação encontrada", description: "Tente outra busca ou remova os filtros aplicados." },
    loadError: { title: "Não foi possível carregar as movimentações", description: "Verifique sua conexão e tente novamente em instantes." },
    feedback: { created: "Movimentação registrada.", updated: "Movimentação atualizada.", paid: "Movimentação confirmada com o valor real.", skip: "Movimentação ignorada neste período.", cancel: "Movimentação cancelada." },
    errors: { unavailable: "Não foi possível conectar ao serviço. Você pode tentar novamente sem duplicar a movimentação.", notFound: "A movimentação ou categoria não está mais disponível.", invalidState: "O estado da movimentação mudou e esta operação não está mais disponível.", idempotencyConflict: "Esta tentativa já foi usada com outros dados. Revise a movimentação antes de enviá-la novamente.", invalid: "Revise os dados da movimentação e tente novamente.", unexpected: "Não foi possível concluir a operação. Tente novamente." }
  },
  user: { account: "Conta", manageAccount: "Gerenciar conta", signedInAs: "Sessão iniciada como", logoutFailed: "Não foi possível encerrar sua sessão. Tente novamente." },
  account: {
    title: "Minha conta", subtitle: "Atualize sua identidade, segurança e preferências do aplicativo.",
    profile: { title: "Perfil e preferências", description: "Informações usadas para personalizar e apresentar suas finanças.", name: "Nome", email: "E-mail", save: "Salvar perfil" },
    preferences: { currency: "Moeda", language: "Idioma", timezone: "Fuso horário" },
    languages: { spanish: "Espanhol", portuguese: "Português", english: "Inglês" },
    appearance: { title: "Aparência", description: "Escolha como você quer ver o Oh My Cash." },
    security: { title: "Segurança", description: "Ao alterar a senha, suas sessões ativas serão encerradas.", currentPassword: "Senha atual", newPassword: "Nova senha", confirmPassword: "Confirmar nova senha", change: "Alterar senha" },
    validation: { email: "Informe um e-mail válido.", required: "Este campo é obrigatório.", passwordLength: "A senha deve ter pelo menos 12 caracteres.", passwordMatch: "As senhas não coincidem." },
    feedback: { profile: "Perfil atualizado.", password: "Senha atualizada. Entre novamente." },
    errors: { emailTaken: "Este e-mail já está em uso.", currentPassword: "A senha atual está incorreta.", unexpected: "Não foi possível salvar as alterações. Tente novamente." }
  },
  errors: { notFound: { code: "404", title: "Esta página não existe", description: "O endereço pode ter mudado ou estar incorreto.", action: "Voltar ao início" } }
} as const;
