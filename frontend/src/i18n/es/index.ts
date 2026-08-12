export default {
  app: {
    name: "Oh My Cash",
    shortName: "OMC",
    tagline: "Tus finanzas, con claridad"
  },
  common: {
    cancel: "Cancelar",
    clearDate: "Borrar fecha",
    close: "Cerrar",
    done: "Listo",
    loading: "Cargando",
    logout: "Cerrar sesión",
    menu: "Abrir menú",
    notAvailable: "—",
    retry: "Reintentar"
  },
  theme: {
    title: "Apariencia",
    palette: "Tema de color",
    mode: "Modo de luminosidad",
    current: "Apariencia: {theme}",
    light: "Claro",
    dark: "Oscuro",
    system: "Sistema",
    contrastModeHint:
      "Los temas de alto contraste fijan su luminosidad para preservar la máxima legibilidad.",
    saveError:
      "La apariencia cambió en este dispositivo, pero no pudimos guardarla en tu cuenta.",
    names: {
      aurora: "Aurora",
      ocean: "Océano",
      royal: "Royal",
      orchid: "Orquídea",
      rose: "Rosa",
      sunset: "Atardecer",
      forest: "Bosque",
      graphite: "Grafito",
      coral: "Coral",
      nord: "Nord",
      "contrast-light": "Contraste claro",
      "contrast-dark": "Contraste oscuro"
    }
  },
  auth: {
    login: {
      eyebrow: "Bienvenido de nuevo",
      title: "Accede a tu espacio financiero",
      subtitle: "Consulta tu información en un entorno privado y seguro.",
      email: "Correo electrónico",
      password: "Contraseña",
      showPassword: "Mostrar contraseña",
      hidePassword: "Ocultar contraseña",
      submit: "Iniciar sesión",
      emailRequired: "Introduce tu correo electrónico.",
      emailInvalid: "Introduce un correo electrónico válido.",
      passwordRequired: "Introduce tu contraseña.",
      invalidCredentials: "El correo o la contraseña no son correctos.",
      unavailable:
        "No pudimos conectar con el servicio. Comprueba tu conexión e inténtalo de nuevo.",
      unexpectedError: "No pudimos iniciar sesión. Inténtalo de nuevo."
    },
    session: {
      unavailable:
        "No fue posible comprobar tu sesión. Puedes intentar iniciar sesión de nuevo."
    }
  },
  navigation: {
    label: "Navegación principal",
    dashboard: "Dashboard",
    transactions: "Movimientos",
    recurring: "Reglas",
    categories: "Categorías",
    account: "Mi cuenta"
  },
  dashboard: {
    title: "Dashboard",
    subtitle: "Tu panorama financiero mensual, en un solo lugar.",
    greeting: "Hola, {name}",
    summaryLabel: "Resumen financiero",
    metrics: {
      realBalance: "Balance real",
      globalBalance: "Balance global",
      globalBalanceCaption: "Acumulado de todos los movimientos pagados",
      globalProjectedBalance: "Balance global proyectado",
      globalProjectedBalanceCaption:
        "Balance acumulado al confirmar todos los movimientos pendientes estimados",
      incomeReceived: "Ingresos recibidos",
      expensesPaid: "Gastos pagados",
      projectedBalance: "Balance proyectado",
      savings: "Ahorro real: {rate}",
      projectedSavings: "Ahorro proyectado: {rate}",
      pending: "Pendiente: {amount}",
      incomplete: "Proyección incompleta"
    },
    month: {
      eyebrow: "Periodo",
      choose: "Seleccionar mes",
      start: "Mes inicial",
      end: "Mes final",
      previous: "Mes anterior",
      next: "Mes siguiente"
    },
    projection: {
      incomplete:
        "Hay {count} movimiento pendiente sin importe estimado. La proyección no está completa. | Hay {count} movimientos pendientes sin importe estimado. La proyección no está completa."
    },
    overdue: {
      notice:
        "Tienes {count} movimiento vencido pendiente. | Tienes {count} movimientos vencidos pendientes."
    },
    actions: {
      review: "Revisar movimientos",
      viewAll: "Ver todos"
    },
    charts: {
      cashFlow: {
        title: "Flujo del periodo",
        description:
          "Importes realizados frente al cierre proyectado del rango.",
        label: "Comparación de ingresos y gastos reales y proyectados",
        income: "Ingresos",
        expenses: "Gastos",
        actual: "Real",
        projected: "Proyectado"
      },
      spending: {
        title: "Distribución del gasto",
        description: "Composición proyectada por categoría.",
        label: "Distribución de gastos por categoría",
        empty: "Aún no hay gastos para representar."
      }
    },
    spending: {
      title: "Gastos por categoría",
      description: "Pagado y pendiente durante el periodo.",
      counts: "{paid} pagados · {pending} pendientes",
      projected: "Proyectado",
      empty: "No hay gastos pagados o pendientes en este mes."
    },
    pending: {
      title: "Próximos movimientos",
      description: "Ingresos y pagos aún pendientes.",
      noEstimate: "Sin estimar",
      noDate: "Sin fecha prevista",
      due: "Vence el {date}",
      overdue: "Venció el {date}",
      empty: "No tienes movimientos pendientes este mes."
    },
    activity: {
      title: "Actividad reciente",
      description: "Últimos movimientos confirmados del mes.",
      empty: "Todavía no hay movimientos pagados en este mes."
    },
    loadError: {
      title: "No pudimos cargar el dashboard",
      description:
        "Comprueba tu conexión e inténtalo de nuevo dentro de unos instantes."
    },
    empty: {
      title: "Tu panorama empieza aquí",
      description:
        "Cuando haya movimientos disponibles, encontrarás aquí tus métricas y actividad reciente."
    }
  },
  categories: {
    title: "Categorías",
    subtitle:
      "Organiza tus movimientos con categorías que se adapten a tus finanzas.",
    count: "{count} categoría | {count} categorías",
    actions: {
      create: "Nueva categoría",
      createFirst: "Crear primera categoría",
      open: "Opciones de {name}",
      edit: "Editar",
      archive: "Archivar"
    },
    filters: {
      label: "Buscar y filtrar categorías",
      search: "Buscar categoría",
      all: "Todas",
      clear: "Limpiar filtros"
    },
    kind: {
      expense: "Gasto",
      income: "Ingreso",
      both: "Ingreso y gasto"
    },
    form: {
      createEyebrow: "Nueva categoría",
      editEyebrow: "Editar categoría",
      createTitle: "Crea una categoría",
      editTitle: "Actualiza la categoría",
      name: "Nombre",
      nameRequired: "Introduce un nombre para la categoría.",
      nameTooLong: "El nombre no puede superar los 80 caracteres.",
      kind: "Tipo de movimiento",
      icon: "Icono",
      color: "Color",
      create: "Crear categoría",
      save: "Guardar cambios"
    },
    colors: {
      none: "Sin color",
      teal: "Verde azulado",
      emerald: "Esmeralda",
      cyan: "Cian",
      blue: "Azul",
      indigo: "Índigo",
      violet: "Violeta",
      amber: "Ámbar",
      rose: "Rosa"
    },
    icons: {
      none: "Sin icono",
      category: "Categoría",
      restaurant: "Alimentación",
      home: "Hogar",
      directions_car: "Transporte",
      shopping_bag: "Compras",
      health_and_safety: "Salud",
      school: "Educación",
      movie: "Entretenimiento",
      payments: "Pagos",
      savings: "Ahorro",
      work: "Trabajo"
    },
    empty: {
      title: "Aún no tienes categorías",
      description:
        "Crea tu primera categoría para empezar a organizar ingresos y gastos."
    },
    noResults: {
      title: "No encontramos categorías",
      description: "Prueba con otra búsqueda o elimina los filtros aplicados."
    },
    loadError: {
      title: "No pudimos cargar las categorías",
      description:
        "Comprueba tu conexión e inténtalo de nuevo dentro de unos instantes."
    },
    archive: {
      title: "Archivar categoría",
      description:
        "{name} dejará de aparecer entre tus categorías disponibles. Esta acción no elimina tus movimientos.",
      confirm: "Archivar"
    },
    feedback: {
      created: "Categoría creada.",
      updated: "Categoría actualizada.",
      archived: "Categoría archivada."
    },
    errors: {
      nameTaken: "Ya existe una categoría activa con ese nombre.",
      unavailable:
        "No pudimos conectar con el servicio. Comprueba tu conexión.",
      notFound: "La categoría ya no está disponible.",
      unexpected: "No pudimos guardar los cambios. Inténtalo de nuevo."
    }
  },
  recurring: {
    title: "Reglas recurrentes",
    subtitle: "Planifica los ingresos y pagos que se repiten cada mes.",
    count: "{count} regla | {count} reglas",
    actions: {
      create: "Nueva regla",
      createFirst: "Crear primera regla",
      manageCategories: "Gestionar categorías",
      open: "Opciones de {name}",
      edit: "Editar",
      deactivate: "Desactivar"
    },
    filters: {
      label: "Buscar y filtrar reglas recurrentes",
      search: "Buscar regla o categoría",
      all: "Todas",
      clear: "Limpiar filtros"
    },
    direction: {
      income: "Ingreso",
      expense: "Gasto"
    },
    amount: {
      fixed: "Importe fijo",
      variable: "Importe variable",
      range: "Entre {min} y {max}",
      from: "Desde {amount}",
      upTo: "Hasta {amount}",
      noRange: "Sin rango estimado"
    },
    schedule: {
      monthlyDay: "Cada mes, el día {day}",
      fromDate: "Desde {date}",
      dateRange: "Del {start} al {end}"
    },
    categoryUnavailable: "Categoría no disponible",
    form: {
      createEyebrow: "Nueva regla recurrente",
      editEyebrow: "Editar regla recurrente",
      createTitle: "Planifica un movimiento mensual",
      editTitle: "Actualiza la planificación",
      sections: {
        identity: "Movimiento",
        amount: "Importe",
        schedule: "Calendario"
      },
      name: "Nombre de la regla",
      nameRequired: "Introduce un nombre para la regla.",
      nameTooLong: "El nombre no puede superar los 120 caracteres.",
      direction: "Tipo de movimiento",
      category: "Categoría",
      categoryRequired: "Selecciona una categoría.",
      noCompatibleCategories: "No hay categorías compatibles",
      categoryRequiredForDirection:
        "Necesitas una categoría compatible con este tipo de movimiento.",
      manageCategories: "Crear categoría",
      amountMode: "Comportamiento del importe",
      fixedAmount: "Importe mensual",
      estimatedAmount: "Importe estimado (opcional)",
      minAmount: "Mínimo estimado (opcional)",
      maxAmount: "Máximo estimado (opcional)",
      variableHelp:
        "Usa el estimado para planificar y el rango para representar la variación esperada. El importe real se definirá al confirmar el movimiento.",
      amountInvalid:
        "Introduce un importe mayor que cero con un máximo de dos decimales.",
      rangeInvalid: "El mínimo no puede superar el máximo.",
      estimatedOutsideRange:
        "El estimado debe encontrarse entre el mínimo y el máximo.",
      dayOfMonth: "Día del mes",
      dayInvalid: "Introduce un día entre 1 y 31.",
      startsOn: "Fecha de inicio",
      endsOn: "Fecha de fin (opcional)",
      dateRequired: "Selecciona una fecha de inicio válida.",
      dateInvalid: "Selecciona una fecha válida.",
      dateRangeInvalid:
        "La fecha de fin no puede ser anterior a la fecha de inicio.",
      notes: "Notas (opcional)",
      create: "Crear regla",
      save: "Guardar cambios"
    },
    empty: {
      title: "Aún no tienes reglas recurrentes",
      description:
        "Añade tu salario, alquiler u otros movimientos mensuales para empezar a planificar.",
      noCategoriesTitle: "Primero crea una categoría",
      noCategoriesDescription:
        "Cada regla necesita una categoría compatible con su tipo de movimiento."
    },
    noResults: {
      title: "No encontramos reglas",
      description: "Prueba con otra búsqueda o elimina los filtros aplicados."
    },
    loadError: {
      title: "No pudimos cargar las reglas",
      description:
        "Comprueba tu conexión e inténtalo de nuevo dentro de unos instantes."
    },
    deactivate: {
      title: "Desactivar regla",
      description:
        "{name} dejará de generar planificación futura. Los movimientos existentes no se eliminan.",
      confirm: "Desactivar"
    },
    feedback: {
      created: "Regla recurrente creada.",
      updated: "Regla recurrente actualizada.",
      deactivated: "Regla recurrente desactivada."
    },
    errors: {
      unavailable:
        "No pudimos conectar con el servicio. Comprueba tu conexión.",
      notFound: "La regla o la categoría ya no está disponible.",
      invalid: "Revisa los datos de la regla e inténtalo de nuevo.",
      unexpected: "No pudimos guardar los cambios. Inténtalo de nuevo."
    }
  },
  transactions: {
    title: "Movimientos",
    subtitle:
      "Registra lo que entra y sale, y confirma tus pagos planificados.",
    count: "{count} movimiento | {count} movimientos",
    actions: {
      create: "Nuevo movimiento",
      createFirst: "Registrar primer movimiento",
      manageCategories: "Gestionar categorías",
      open: "Opciones de {name}",
      edit: "Editar",
      pay: "Marcar como pagado",
      confirmPayment: "Confirmar importe",
      skip: "Omitir este mes",
      cancel: "Cancelar movimiento"
    },
    direction: {
      income: "Ingreso",
      expense: "Gasto"
    },
    status: {
      pending: "Pendiente",
      paid: "Pagado",
      skipped: "Omitido",
      cancelled: "Cancelado"
    },
    source: {
      recurring: "Recurrente"
    },
    amount: {
      actual: "Importe real",
      expected: "Importe esperado",
      pendingDefinition: "Importe por definir"
    },
    date: {
      due: "Vence el {date}",
      occurred: "Realizado el {date}",
      scheduled: "Programado para el {date}",
      notRecorded: "Sin fecha registrada"
    },
    period: "Periodo: {date}",
    categoryUnavailable: "Categoría no disponible",
    month: {
      label: "Periodo de movimientos",
      eyebrow: "Periodo",
      choose: "Seleccionar mes",
      start: "Mes inicial",
      end: "Mes final",
      previous: "Mes anterior",
      next: "Mes siguiente",
      current: "Volver al mes actual"
    },
    materialization: {
      notice:
        "Cada mes conserva una copia independiente de sus reglas. Los cambios que hagas después en una regla sólo se aplicarán a periodos que aún no se hayan materializado."
    },
    summary: {
      label: "Resumen de movimientos",
      pending: "Pendientes",
      paid: "Pagados",
      total: "Total",
      income: "Ingresos pagados",
      expenses: "Gastos pagados",
      balance: "Balance del periodo"
    },
    filters: {
      label: "Buscar y filtrar movimientos",
      search: "Buscar movimiento o categoría",
      all: "Todos",
      clear: "Limpiar filtros"
    },
    form: {
      createEyebrow: "Nuevo movimiento",
      editEyebrow: "Editar movimiento",
      createTitle: "Registra un ingreso o gasto",
      editTitle: "Actualiza el movimiento",
      direction: "Tipo de movimiento",
      status: "Estado inicial",
      statusHelp: {
        pending:
          "Quedará abierto aunque la fecha ya haya pasado. Podrás confirmar el importe real más adelante.",
        paid: "Se registrará como realizado con el importe y la fecha indicados."
      },
      category: "Categoría",
      categoryRequired: "Selecciona una categoría.",
      noCompatibleCategories: "No hay categorías compatibles",
      categoryRequiredForDirection:
        "Necesitas una categoría compatible con este tipo de movimiento.",
      manageCategories: "Crear categoría",
      description: "Descripción",
      descriptionRequired: "Introduce una descripción.",
      descriptionTooLong: "La descripción no puede superar los 160 caracteres.",
      amount: "Importe real",
      expectedAmount: "Importe estimado",
      amountInvalid:
        "Introduce un importe mayor que cero con un máximo de dos decimales.",
      dueDate: "Fecha de vencimiento",
      dueDateInvalid: "Selecciona una fecha de vencimiento válida.",
      occurredAt: "Fecha y hora",
      dateInvalid: "Selecciona una fecha y hora válidas.",
      notes: "Notas (opcional)",
      create: "Registrar movimiento",
      save: "Guardar cambios"
    },
    pay: {
      eyebrow: "Confirmar movimiento",
      help: "Ajusta el importe para reflejar exactamente lo que pagaste o recibiste.",
      amount: "Importe real",
      occurredAt: "Fecha y hora reales",
      confirm: "Confirmar como pagado"
    },
    skip: {
      title: "Omitir este movimiento",
      description:
        "{name} quedará como omitido únicamente en este periodo. La regla recurrente seguirá activa.",
      confirm: "Omitir este periodo"
    },
    cancel: {
      title: "Cancelar movimiento",
      description:
        "{name} quedará cancelado y ya no podrá confirmarse como pagado.",
      confirm: "Cancelar movimiento"
    },
    empty: {
      title: "Aún no tienes movimientos",
      description:
        "Registra un ingreso o gasto manual. Los movimientos generados por tus reglas también aparecerán aquí.",
      noCategoriesTitle: "Primero crea una categoría",
      noCategoriesDescription:
        "Cada movimiento necesita una categoría compatible con su tipo."
    },
    noResults: {
      title: "No encontramos movimientos",
      description: "Prueba con otra búsqueda o elimina los filtros aplicados."
    },
    loadError: {
      title: "No pudimos cargar los movimientos",
      description:
        "Comprueba tu conexión e inténtalo de nuevo dentro de unos instantes."
    },
    feedback: {
      created: "Movimiento registrado.",
      updated: "Movimiento actualizado.",
      paid: "Movimiento confirmado con el importe real.",
      skip: "Movimiento omitido para este periodo.",
      cancel: "Movimiento cancelado."
    },
    errors: {
      unavailable:
        "No pudimos conectar con el servicio. Puedes reintentar sin duplicar el movimiento.",
      notFound: "El movimiento o la categoría ya no está disponible.",
      invalidState:
        "El movimiento cambió de estado y ya no admite esta operación.",
      idempotencyConflict:
        "Este intento ya se utilizó con otros datos. Revisa el movimiento antes de volver a enviarlo.",
      invalid: "Revisa los datos del movimiento e inténtalo de nuevo.",
      unexpected: "No pudimos completar la operación. Inténtalo de nuevo."
    }
  },
  user: {
    account: "Cuenta",
    manageAccount: "Gestionar cuenta",
    signedInAs: "Sesión iniciada como",
    logoutFailed: "No pudimos cerrar tu sesión. Inténtalo de nuevo."
  },
  account: {
    title: "Mi cuenta",
    subtitle:
      "Actualiza tu identidad, seguridad y preferencias de la aplicación.",
    profile: {
      title: "Perfil y preferencias",
      description:
        "Información utilizada para personalizar y presentar tus finanzas.",
      name: "Nombre",
      email: "Correo electrónico",
      save: "Guardar perfil"
    },
    preferences: {
      currency: "Moneda",
      language: "Idioma",
      timezone: "Zona horaria"
    },
    languages: {
      spanish: "Español",
      portuguese: "Portugués",
      english: "Inglés"
    },
    appearance: {
      title: "Apariencia",
      description: "Elige cómo quieres ver Oh My Cash."
    },
    security: {
      title: "Seguridad",
      description: "Al cambiar la contraseña se cerrarán tus sesiones activas.",
      currentPassword: "Contraseña actual",
      newPassword: "Nueva contraseña",
      confirmPassword: "Confirmar nueva contraseña",
      change: "Cambiar contraseña"
    },
    validation: {
      email: "Introduce un correo electrónico válido.",
      required: "Este campo es obligatorio.",
      passwordLength: "La contraseña debe tener al menos 12 caracteres.",
      passwordMatch: "Las contraseñas no coinciden."
    },
    feedback: {
      profile: "Perfil actualizado.",
      password: "Contraseña actualizada. Inicia sesión de nuevo."
    },
    errors: {
      emailTaken: "Ese correo electrónico ya está en uso.",
      currentPassword: "La contraseña actual no es correcta.",
      unexpected: "No pudimos guardar los cambios. Inténtalo de nuevo."
    }
  },
  adminUsers: {
    title: "Gestión de usuarios",
    subtitle: "Crea, recupera, actualiza o elimina cuentas de forma segura.",
    warning:
      "Área restringida. Cada cambio requiere confirmar la contraseña del administrador.",
    noName: "Sin nombre",
    createEyebrow: "Nueva cuenta",
    editEyebrow: "Editar cuenta",
    createTitle: "Crear usuario",
    editTitle: "Actualizar datos críticos",
    deleteEyebrow: "Eliminar cuenta",
    deleteTitle: "¿Eliminar este usuario?",
    deleteDescription:
      "Eliminarás permanentemente a {name} y todos sus datos. Esta acción no se puede deshacer.",
    roles: { admin: "Administrador", user: "Usuario" },
    actions: {
      create: "Crear usuario",
      edit: "Editar usuario",
      save: "Guardar cambios",
      delete: "Eliminar"
    },
    fields: {
      name: "Nombre",
      email: "Correo electrónico",
      password: "Contraseña inicial",
      newPassword: "Nueva contraseña (opcional)",
      confirmPassword: "Confirmar nueva contraseña",
      administratorPassword: "Contraseña del administrador"
    },
    feedback: { saved: "Cuenta guardada.", deleted: "Cuenta eliminada." },
    errors: {
      administratorPassword: "La contraseña del administrador no es correcta.",
      unexpected: "No pudimos completar esta operación. Inténtalo de nuevo."
    }
  },
  errors: {
    notFound: {
      code: "404",
      title: "Esta página no existe",
      description: "La dirección puede haber cambiado o ser incorrecta.",
      action: "Volver al inicio"
    }
  }
} as const;
