export default {
  app: {
    name: "Oh My Cash",
    shortName: "OMC",
    tagline: "Your finances, clearly"
  },
  common: {
    cancel: "Cancel",
    clearDate: "Clear date",
    close: "Close",
    done: "Done",
    loading: "Loading",
    logout: "Log out",
    menu: "Open menu",
    notAvailable: "—",
    retry: "Try again"
  },
  theme: {
    title: "Appearance",
    palette: "Color theme",
    mode: "Brightness mode",
    current: "Appearance: {theme}",
    light: "Light",
    dark: "Dark",
    system: "System",
    contrastModeHint:
      "High-contrast themes lock their brightness to preserve maximum readability.",
    saveError:
      "The appearance changed on this device, but we couldn't save it to your account.",
    names: {
      aurora: "Aurora",
      ocean: "Ocean",
      royal: "Royal",
      orchid: "Orchid",
      rose: "Rose",
      sunset: "Sunset",
      forest: "Forest",
      graphite: "Graphite",
      coral: "Coral",
      nord: "Nord",
      "contrast-light": "Light contrast",
      "contrast-dark": "Dark contrast"
    }
  },
  auth: {
    login: {
      eyebrow: "Welcome back",
      title: "Access your financial space",
      subtitle: "View your information in a private and secure environment.",
      email: "Email address",
      password: "Password",
      showPassword: "Show password",
      hidePassword: "Hide password",
      submit: "Log in",
      emailRequired: "Enter your email address.",
      emailInvalid: "Enter a valid email address.",
      passwordRequired: "Enter your password.",
      invalidCredentials: "The email or password is incorrect.",
      unavailable:
        "We couldn't connect to the service. Check your connection and try again.",
      unexpectedError: "We couldn't log you in. Try again."
    },
    session: {
      unavailable:
        "We couldn't verify your session. You can try logging in again."
    }
  },
  navigation: {
    label: "Main navigation",
    dashboard: "Dashboard",
    transactions: "Transactions",
    recurring: "Rules",
    categories: "Categories",
    account: "My account"
  },
  dashboard: {
    title: "Dashboard",
    subtitle: "Your monthly financial picture, all in one place.",
    greeting: "Hello, {name}",
    summaryLabel: "Financial summary",
    metrics: {
      realBalance: "Actual balance",
      globalBalance: "Global balance",
      globalBalanceCaption: "Accumulated total of all paid transactions",
      globalProjectedBalance: "Projected global balance",
      globalProjectedBalanceCaption:
        "Accumulated balance after confirming every estimated pending transaction",
      incomeReceived: "Income received",
      expensesPaid: "Expenses paid",
      projectedBalance: "Projected balance",
      savings: "Actual savings: {rate}",
      projectedSavings: "Projected savings: {rate}",
      pending: "Pending: {amount}",
      incomplete: "Incomplete projection"
    },
    month: {
      eyebrow: "Period",
      choose: "Select month",
      start: "Start month",
      end: "End month",
      previous: "Previous month",
      next: "Next month"
    },
    projection: {
      incomplete:
        "There is {count} pending transaction without an estimated amount. The projection is incomplete. | There are {count} pending transactions without an estimated amount. The projection is incomplete."
    },
    overdue: {
      notice:
        "You have {count} overdue pending transaction. | You have {count} overdue pending transactions."
    },
    actions: { review: "Review transactions", viewAll: "View all" },
    charts: {
      cashFlow: {
        title: "Period cash flow",
        description:
          "Completed amounts compared with the projected close of the range.",
        label: "Comparison of actual and projected income and expenses",
        income: "Income",
        expenses: "Expenses",
        actual: "Actual",
        projected: "Projected"
      },
      spending: {
        title: "Expense distribution",
        description: "Projected composition by category.",
        label: "Expense distribution by category",
        empty: "There are no expenses to chart yet."
      }
    },
    spending: {
      title: "Expenses by category",
      description: "Paid and pending during the period.",
      counts: "{paid} paid · {pending} pending",
      projected: "Projected",
      empty: "There are no paid or pending expenses this month."
    },
    pending: {
      title: "Upcoming transactions",
      description: "Income and payments that are still pending.",
      noEstimate: "No estimate",
      noDate: "No due date",
      due: "Due on {date}",
      overdue: "Was due on {date}",
      empty: "You have no pending transactions this month."
    },
    activity: {
      title: "Recent activity",
      description: "Latest confirmed transactions for the month.",
      empty: "There are no paid transactions this month yet."
    },
    loadError: {
      title: "We couldn't load the dashboard",
      description: "Check your connection and try again in a moment."
    },
    empty: {
      title: "Your overview starts here",
      description:
        "Once transactions are available, you'll find your metrics and recent activity here."
    }
  },
  categories: {
    title: "Categories",
    subtitle: "Organize transactions with categories that fit your finances.",
    count: "{count} category | {count} categories",
    actions: {
      create: "New category",
      createFirst: "Create first category",
      open: "Options for {name}",
      edit: "Edit",
      archive: "Archive"
    },
    filters: {
      label: "Search and filter categories",
      search: "Search category",
      all: "All",
      clear: "Clear filters"
    },
    kind: { expense: "Expense", income: "Income", both: "Income and expense" },
    form: {
      createEyebrow: "New category",
      editEyebrow: "Edit category",
      createTitle: "Create a category",
      editTitle: "Update category",
      name: "Name",
      nameRequired: "Enter a category name.",
      nameTooLong: "The name cannot exceed 80 characters.",
      kind: "Transaction type",
      icon: "Icon",
      color: "Color",
      create: "Create category",
      save: "Save changes"
    },
    colors: {
      none: "No color",
      teal: "Teal",
      emerald: "Emerald",
      cyan: "Cyan",
      blue: "Blue",
      indigo: "Indigo",
      violet: "Violet",
      amber: "Amber",
      rose: "Rose"
    },
    icons: {
      none: "No icon",
      category: "Category",
      restaurant: "Food",
      home: "Home",
      directions_car: "Transportation",
      shopping_bag: "Shopping",
      health_and_safety: "Health",
      school: "Education",
      movie: "Entertainment",
      payments: "Payments",
      savings: "Savings",
      work: "Work"
    },
    empty: {
      title: "You don't have any categories yet",
      description:
        "Create your first category to start organizing income and expenses."
    },
    noResults: {
      title: "No categories found",
      description: "Try another search or remove the applied filters."
    },
    loadError: {
      title: "We couldn't load the categories",
      description: "Check your connection and try again in a moment."
    },
    archive: {
      title: "Archive category",
      description:
        "{name} will no longer appear among your available categories. This does not delete your transactions.",
      confirm: "Archive"
    },
    feedback: {
      created: "Category created.",
      updated: "Category updated.",
      archived: "Category archived."
    },
    errors: {
      nameTaken: "An active category with that name already exists.",
      unavailable: "We couldn't connect to the service. Check your connection.",
      notFound: "The category is no longer available.",
      unexpected: "We couldn't save the changes. Try again."
    }
  },
  recurring: {
    title: "Recurring rules",
    subtitle: "Plan income and payments that repeat every month.",
    count: "{count} rule | {count} rules",
    actions: {
      create: "New rule",
      createFirst: "Create first rule",
      manageCategories: "Manage categories",
      open: "Options for {name}",
      edit: "Edit",
      deactivate: "Deactivate"
    },
    filters: {
      label: "Search and filter recurring rules",
      search: "Search rule or category",
      all: "All",
      clear: "Clear filters"
    },
    direction: { income: "Income", expense: "Expense" },
    amount: {
      fixed: "Fixed amount",
      variable: "Variable amount",
      range: "Between {min} and {max}",
      from: "From {amount}",
      upTo: "Up to {amount}",
      noRange: "No estimated range"
    },
    schedule: {
      monthlyDay: "Every month, on day {day}",
      fromDate: "From {date}",
      dateRange: "From {start} to {end}"
    },
    categoryUnavailable: "Category unavailable",
    form: {
      createEyebrow: "New recurring rule",
      editEyebrow: "Edit recurring rule",
      createTitle: "Plan a monthly transaction",
      editTitle: "Update the plan",
      sections: {
        identity: "Transaction",
        amount: "Amount",
        schedule: "Schedule"
      },
      name: "Rule name",
      nameRequired: "Enter a rule name.",
      nameTooLong: "The name cannot exceed 120 characters.",
      direction: "Transaction type",
      category: "Category",
      categoryRequired: "Select a category.",
      noCompatibleCategories: "No compatible categories",
      categoryRequiredForDirection:
        "You need a category compatible with this transaction type.",
      manageCategories: "Create category",
      amountMode: "Amount behavior",
      fixedAmount: "Monthly amount",
      estimatedAmount: "Estimated amount (optional)",
      minAmount: "Estimated minimum (optional)",
      maxAmount: "Estimated maximum (optional)",
      variableHelp:
        "Use the estimate for planning and the range to represent expected variation. The actual amount will be set when confirming the transaction.",
      amountInvalid:
        "Enter an amount greater than zero with no more than two decimal places.",
      rangeInvalid: "The minimum cannot exceed the maximum.",
      estimatedOutsideRange:
        "The estimate must be between the minimum and maximum.",
      dayOfMonth: "Day of month",
      dayInvalid: "Enter a day between 1 and 31.",
      startsOn: "Start date",
      endsOn: "End date (optional)",
      dateRequired: "Select a valid start date.",
      dateInvalid: "Select a valid date.",
      dateRangeInvalid: "The end date cannot be before the start date.",
      notes: "Notes (optional)",
      create: "Create rule",
      save: "Save changes"
    },
    empty: {
      title: "You don't have recurring rules yet",
      description:
        "Add your salary, rent, or other monthly transactions to start planning.",
      noCategoriesTitle: "Create a category first",
      noCategoriesDescription:
        "Each rule needs a category compatible with its transaction type."
    },
    noResults: {
      title: "No rules found",
      description: "Try another search or remove the applied filters."
    },
    loadError: {
      title: "We couldn't load the rules",
      description: "Check your connection and try again in a moment."
    },
    deactivate: {
      title: "Deactivate rule",
      description:
        "{name} will stop generating future plans. Existing transactions will not be deleted.",
      confirm: "Deactivate"
    },
    feedback: {
      created: "Recurring rule created.",
      updated: "Recurring rule updated.",
      deactivated: "Recurring rule deactivated."
    },
    errors: {
      unavailable: "We couldn't connect to the service. Check your connection.",
      notFound: "The rule or category is no longer available.",
      invalid: "Review the rule data and try again.",
      unexpected: "We couldn't save the changes. Try again."
    }
  },
  transactions: {
    title: "Transactions",
    subtitle:
      "Record what comes in and goes out, and confirm your planned payments.",
    count: "{count} transaction | {count} transactions",
    actions: {
      create: "New transaction",
      createFirst: "Record first transaction",
      manageCategories: "Manage categories",
      open: "Options for {name}",
      edit: "Edit",
      pay: "Mark as paid",
      confirmPayment: "Confirm amount",
      skip: "Skip this month",
      cancel: "Cancel transaction"
    },
    direction: { income: "Income", expense: "Expense" },
    status: {
      pending: "Pending",
      paid: "Paid",
      skipped: "Skipped",
      cancelled: "Cancelled"
    },
    source: { recurring: "Recurring" },
    amount: {
      actual: "Actual amount",
      expected: "Expected amount",
      pendingDefinition: "Amount not set"
    },
    date: {
      due: "Due on {date}",
      occurred: "Completed on {date}",
      scheduled: "Scheduled for {date}",
      notRecorded: "No date recorded"
    },
    period: "Period: {date}",
    categoryUnavailable: "Category unavailable",
    month: {
      label: "Transaction period",
      eyebrow: "Period",
      choose: "Select month",
      start: "Start month",
      end: "End month",
      previous: "Previous month",
      next: "Next month",
      current: "Return to current month"
    },
    materialization: {
      notice:
        "Each month keeps an independent copy of its rules. Changes made later to a rule only apply to periods that have not been materialized yet."
    },
    summary: {
      label: "Transaction summary",
      pending: "Pending",
      paid: "Paid",
      total: "Total",
      income: "Paid income",
      expenses: "Paid expenses",
      balance: "Period balance"
    },
    filters: {
      label: "Search and filter transactions",
      search: "Search transaction or category",
      all: "All",
      clear: "Clear filters"
    },
    form: {
      createEyebrow: "New transaction",
      editEyebrow: "Edit transaction",
      createTitle: "Record income or an expense",
      editTitle: "Update transaction",
      direction: "Transaction type",
      status: "Initial status",
      statusHelp: {
        pending:
          "It will remain open even if the date has passed. You can confirm the actual amount later.",
        paid: "It will be recorded as completed with the specified amount and date."
      },
      category: "Category",
      categoryRequired: "Select a category.",
      noCompatibleCategories: "No compatible categories",
      categoryRequiredForDirection:
        "You need a category compatible with this transaction type.",
      manageCategories: "Create category",
      description: "Description",
      descriptionRequired: "Enter a description.",
      descriptionTooLong: "The description cannot exceed 160 characters.",
      amount: "Actual amount",
      expectedAmount: "Estimated amount",
      amountInvalid:
        "Enter an amount greater than zero with no more than two decimal places.",
      dueDate: "Due date",
      dueDateInvalid: "Select a valid due date.",
      occurredAt: "Date and time",
      dateInvalid: "Select a valid date and time.",
      notes: "Notes (optional)",
      create: "Record transaction",
      save: "Save changes"
    },
    pay: {
      eyebrow: "Confirm transaction",
      help: "Adjust the amount to exactly reflect what you paid or received.",
      amount: "Actual amount",
      occurredAt: "Actual date and time",
      confirm: "Confirm as paid"
    },
    skip: {
      title: "Skip this transaction",
      description:
        "{name} will be skipped only for this period. The recurring rule will remain active.",
      confirm: "Skip this period"
    },
    cancel: {
      title: "Cancel transaction",
      description:
        "{name} will be cancelled and can no longer be confirmed as paid.",
      confirm: "Cancel transaction"
    },
    empty: {
      title: "You don't have any transactions yet",
      description:
        "Record income or an expense manually. Transactions generated by your rules will also appear here.",
      noCategoriesTitle: "Create a category first",
      noCategoriesDescription:
        "Each transaction needs a category compatible with its type."
    },
    noResults: {
      title: "No transactions found",
      description: "Try another search or remove the applied filters."
    },
    loadError: {
      title: "We couldn't load the transactions",
      description: "Check your connection and try again in a moment."
    },
    feedback: {
      created: "Transaction recorded.",
      updated: "Transaction updated.",
      paid: "Transaction confirmed with the actual amount.",
      skip: "Transaction skipped for this period.",
      cancel: "Transaction cancelled."
    },
    errors: {
      unavailable:
        "We couldn't connect to the service. You can retry without duplicating the transaction.",
      notFound: "The transaction or category is no longer available.",
      invalidState:
        "The transaction status changed and this operation is no longer available.",
      idempotencyConflict:
        "This attempt was already used with different data. Review the transaction before submitting it again.",
      invalid: "Review the transaction data and try again.",
      unexpected: "We couldn't complete the operation. Try again."
    }
  },
  user: {
    account: "Account",
    manageAccount: "Manage account",
    signedInAs: "Signed in as",
    logoutFailed: "We couldn't log you out. Try again."
  },
  account: {
    title: "My account",
    subtitle: "Update your identity, security, and application preferences.",
    profile: {
      title: "Profile and preferences",
      description: "Information used to personalize and present your finances.",
      name: "Name",
      email: "Email address",
      save: "Save profile"
    },
    preferences: {
      currency: "Currency",
      language: "Language",
      timezone: "Time zone"
    },
    languages: {
      spanish: "Spanish",
      portuguese: "Portuguese",
      english: "English"
    },
    appearance: {
      title: "Appearance",
      description: "Choose how you want Oh My Cash to look."
    },
    security: {
      title: "Security",
      description: "Changing your password will close your active sessions.",
      currentPassword: "Current password",
      newPassword: "New password",
      confirmPassword: "Confirm new password",
      change: "Change password"
    },
    validation: {
      email: "Enter a valid email address.",
      required: "This field is required.",
      passwordLength: "The password must be at least 12 characters.",
      passwordMatch: "The passwords do not match."
    },
    feedback: {
      profile: "Profile updated.",
      password: "Password updated. Log in again."
    },
    errors: {
      emailTaken: "That email address is already in use.",
      currentPassword: "The current password is incorrect.",
      unexpected: "We couldn't save the changes. Try again."
    }
  },
  adminUsers: {
    title: "User management",
    subtitle: "Create, recover, update, or delete accounts securely.",
    warning:
      "Restricted area. Every change requires confirmation with the administrator password.",
    noName: "No name",
    createEyebrow: "New account",
    editEyebrow: "Edit account",
    createTitle: "Create user",
    editTitle: "Update critical details",
    deleteEyebrow: "Delete account",
    deleteTitle: "Delete this user?",
    deleteDescription:
      "You will permanently delete {name} and all of their data. This action cannot be undone.",
    roles: { admin: "Administrator", user: "User" },
    actions: {
      create: "Create user",
      edit: "Edit user",
      save: "Save changes",
      delete: "Delete"
    },
    fields: {
      name: "Name",
      email: "Email address",
      password: "Initial password",
      newPassword: "New password (optional)",
      confirmPassword: "Confirm new password",
      administratorPassword: "Administrator password"
    },
    feedback: { saved: "Account saved.", deleted: "Account deleted." },
    errors: {
      administratorPassword: "The administrator password is incorrect.",
      unexpected: "We couldn't complete this operation. Try again."
    }
  },
  errors: {
    notFound: {
      code: "404",
      title: "This page doesn't exist",
      description: "The address may have changed or be incorrect.",
      action: "Return home"
    }
  }
} as const;
