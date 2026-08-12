export default {
  app: {
    name: "Oh My Cash",
    shortName: "OMC",
    tagline: "Tus finanzas, con claridad"
  },
  common: {
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
    dashboard: "Dashboard"
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
