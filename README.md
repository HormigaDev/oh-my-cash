# Oh My Cash

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Rust](https://img.shields.io/badge/backend-Rust-000000?logo=rust&style=for-the-badge)](https://www.rust-lang.org/)
[![Vue 3](https://img.shields.io/badge/frontend-Vue%203-42b883?logo=vuedotjs&logoColor=white&style=for-the-badge)](https://vuejs.org/)
[![Quasar](https://img.shields.io/badge/UI-Quasar-1976D2?logo=quasar&logoColor=white&style=for-the-badge)](https://quasar.dev/)
[![Support the project](https://img.shields.io/badge/Support-PayPal-00457C?logo=paypal&logoColor=white&style=for-the-badge)](https://www.paypal.com/donate/?hosted_button_id=UCL7EE2G44KPQ)

Oh My Cash (OMC) is a self-hosted personal finance application for tracking income, expenses, recurring payments, and period projections without handing private financial data to a third party.

If this project is useful to you, you can support its development through [PayPal](https://www.paypal.com/donate/?hosted_button_id=UCL7EE2G44KPQ).

</div>

## Table of Contents

- [Why Oh My Cash?](#why-oh-my-cash)
- [What It Does](#what-it-does)
- [How It Works](#how-it-works)
- [Technology](#technology)
- [Self-Hosting on a VPS](#self-hosting-on-a-vps)
    - [Prerequisites](#prerequisites)
    - [1. Clone the Project](#1-clone-the-project)
    - [2. Create the Database](#2-create-the-database)
    - [3. Configure the Backend](#3-configure-the-backend)
    - [4. Configure HTTPS](#4-configure-https)
    - [5. Deploy](#5-deploy)
    - [6. Create the First Administrator](#6-create-the-first-administrator)
    - [Operations](#operations)
- [License](#license)
- [Support](#support)

## Why Oh My Cash?

Oh My Cash started as a personal need: keeping finances organized without accepting the compromises common in third-party finance applications.

Financial information is sensitive. Many hosted services monetize user data, restrict essential features behind subscriptions, or impose limits that make their free plans impractical. With spare capacity on a personal VPS, building a self-hosted alternative became the more comfortable choice.

The Rust backend was not selected primarily for performance. It was a practical way to gain real-world experience while learning the language more deeply. The frontend uses Vue 3, Quasar, the Composition API, and TypeScript: a stack already familiar enough to keep the project focused on the product rather than on relearning frontend fundamentals.

## What It Does

- Records income and expenses, whether already paid or still pending.
- Allows pending transactions to use past or future target dates without treating them as paid.
- Organizes transactions with customizable categories, colors, and icons.
- Creates recurring rules for fixed amounts and variable estimates, including optional minimum and maximum values.
- Preserves historical recurring transactions when a rule changes in a later month.
- Supports month ranges in the dashboard and transaction history.
- Shows confirmed period results, period projections, and the global balance of paid transactions.
- Highlights overdue payments and links directly to a filtered, sortable transaction view.
- Paginates transactions, recurring rules, and administrator user lists to keep large accounts manageable.
- Provides charts for cash flow and category spending.
- Supports user-managed currency, language, timezone, profile, password, and appearance preferences.
- Uses localized currency symbols throughout monetary values and inputs.
- Includes administrator-only account creation, recovery, editing, and deletion.
- Offers Spanish, Brazilian Portuguese, and English interfaces.
- Includes multiple color themes with light and dark palettes, system-mode detection, and dedicated high-contrast themes.

## How It Works

Each transaction is paid, pending, skipped, or cancelled. Pending transactions may include an estimated amount and a target date, allowing OMC to calculate a projection without confusing an expected payment with a completed one. A past target date does not automatically mark a transaction as paid.

Recurring rules describe monthly income or expenses. OMC persists only the current month and the immediately following month when either is requested. More distant months are calculated virtually instead of being inserted into the database. This prevents large date-range queries from creating thousands of records.

Once a month has been materialized, its transaction remains independent from later changes to the rule. For example, increasing a salary rule for September does not rewrite the value already recorded for August.

The dashboard combines confirmed activity with known pending estimates for the selected period. It also shows a global balance calculated exclusively from paid transactions across all recorded activity. Future virtual transactions contribute to period projections without changing that global balance or creating database records.

Overdue transactions can be opened directly from the dashboard, filtered across the complete paginated result set, and ordered by target date in ascending or descending order.

## Technology

| Area       | Stack                                                   |
| ---------- | ------------------------------------------------------- |
| Backend    | Rust, Axum, SeaORM, PostgreSQL                          |
| Frontend   | Vue 3, Quasar, Composition API, TypeScript              |
| Runtime    | systemd, Nginx                                          |
| Deployment | Bare-metal VPS deployment with incremental Cargo builds |

## Self-Hosting on a VPS

OMC is designed for a Linux VPS using a bare-metal backend service. Docker is not required for the current deployment flow.

### Prerequisites

Before installing OMC, prepare a VPS with:

- A Linux distribution using systemd, such as Ubuntu or Debian.
- A domain name pointing to the VPS.
- PostgreSQL and a database/user for OMC.
- Nginx.
- Git.
- Rust and Cargo, with the version declared in [`rust-toolchain.toml`](rust-toolchain.toml).
- Node.js and pnpm.
- `rsync`, `curl`, and Certbot or another way to provision TLS certificates.
- A user allowed to run the required `sudo` commands.

The deployment script also creates a restricted system user named `omc` when necessary.

### 1. Clone the Project

Choose a directory owned by your deployment user and clone the repository:

```bash
git clone https://github.com/HormigaDev/oh-my-cash.git
cd oh-my-cash
```

### 2. Create the Database

Create a PostgreSQL role and database. Choose a strong password and replace the placeholders below:

```bash
sudo -u postgres createuser --pwprompt omc
sudo -u postgres createdb --owner=omc omc
```

### 3. Configure the Backend

Create the protected environment file expected by systemd and the deployment script:

```bash
sudo install -d -m 0750 /etc/omc
sudo nano /etc/omc/backend.env
```

Use the following as a starting point:

```dotenv
APP_ENV=production
APP_BIND=127.0.0.1:8383
DATABASE_URL=postgres://omc:REPLACE_WITH_A_STRONG_PASSWORD@127.0.0.1:5432/omc
SESSION_COOKIE_NAME=omc_session
SESSION_TTL_DAYS=30
SESSION_COOKIE_SECURE=true
```

Protect the file because it contains database credentials:

```bash
sudo chown root:omc /etc/omc/backend.env
sudo chmod 0640 /etc/omc/backend.env
```

### 4. Configure HTTPS

The provided Nginx configuration expects certificates to already exist for your domain. Obtain them before the first deployment, for example with Certbot:

```bash
sudo certbot certonly --nginx -d cash.example.com
```

Replace `cash.example.com` with your domain.

### 5. Deploy

Run the deployment script from the repository root:

```bash
./deploy.sh cash.example.com
```

The script will:

1. Install and validate frontend dependencies.
2. Build the PWA.
3. Build the Rust backend and migration binary incrementally.
4. Publish versioned frontend and backend releases.
5. Run pending database migrations.
6. Install and enable `omc.service`.
7. Restart the backend and verify `/health/ready`.
8. Configure and reload Nginx.

The backend service is enabled at boot and restarts automatically after a failure. Subsequent deployments reuse Cargo build artifacts, which makes them substantially faster than rebuilding a Docker image from scratch.

### 6. Create the First Administrator

After the first deployment, create the initial administrator account:

```bash
cargo run --release --bin omc-user -- admin@example.com --admin
```

The command prompts for a password. Administrator access enables the user-management area, where accounts can be created, recovered, updated, or deleted.

### Operations

Check backend status:

```bash
sudo systemctl status omc.service
```

Follow backend logs:

```bash
sudo journalctl -u omc.service -f
```

Restart the backend manually:

```bash
sudo systemctl restart omc.service
```

Redeploy after updating the repository:

```bash
git pull
./deploy.sh cash.example.com
```

## License

Oh My Cash is released under the [MIT License](LICENSE).

## Support

If you enjoy using Oh My Cash and would like to support its continued development, you can donate through [PayPal](https://www.paypal.com/donate/?hosted_button_id=UCL7EE2G44KPQ).

[![Support the project](https://img.shields.io/badge/Support-PayPal-00457C?logo=paypal&logoColor=white)](https://www.paypal.com/donate/?hosted_button_id=UCL7EE2G44KPQ)
