export default {
  app: {
    name: "Oh My Cash",
    shortName: "OMC",
    tagline: "Tus finanzas, con claridad"
  },
  common: {
    cancel: "Cancelar",
    close: "Cerrar",
    loading: "Cargando",
    logout: "Cerrar sesión",
    menu: "Abrir menú",
    notAvailable: "—",
    retry: "Reintentar"
  },
  theme: {
    title: "Apariencia",
    current: "Apariencia: {theme}",
    light: "Claro",
    dark: "Oscuro",
    system: "Sistema"
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
    recurring: "Recurrentes",
    categories: "Categorías"
  },
  dashboard: {
    title: "Dashboard",
    subtitle: "Tu panorama financiero, en un solo lugar.",
    greeting: "Hola, {name}",
    summaryLabel: "Resumen financiero",
    metrics: {
      monthlyBalance: "Balance mensual",
      income: "Ingresos",
      expenses: "Gastos",
      projectedBalance: "Balance proyectado"
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
  user: {
    account: "Cuenta",
    signedInAs: "Sesión iniciada como",
    logoutFailed: "No pudimos cerrar tu sesión. Inténtalo de nuevo."
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
