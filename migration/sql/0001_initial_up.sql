-- ===================================================
-- Oh My Cash (OMC)
-- ===================================================
-- Initial PostgreSQL Schema
-- ===================================================

begin;

create or replace function omc_set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create table users (
    id uuid primary key default uuidv7(),
    email text not null,
    password_hash text not null,

    display_name text,

    currency varchar(3) not null default 'BRL',
    timezone text not null default 'America/Sao_Paulo',
    locale text not null default 'es-ES',
    theme text not null default 'aurora',
    theme_mode text not null default 'system',
    role text not null default 'user',

    is_active boolean not null default true,

    password_changed_at timestamptz,
    last_login_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint users_email_normalized_chk
        check (email = lower(btrim(email))),

    constraint users_email_not_empty_chk
        check (length(btrim(email)) > 0),

    constraint users_currency_chk
        check (currency ~ '^[A-Z]{3}$'),

    constraint users_theme_chk
        check (
            theme in (
                'aurora', 'ocean', 'royal', 'orchid', 'rose',
                'sunset', 'forest', 'graphite', 'coral', 'nord',
                'contrast-light', 'contrast-dark'
            )
        ),

    constraint users_theme_mode_chk
        check (theme_mode in ('system', 'light', 'dark')),

    constraint users_role_chk
        check (role in ('admin', 'user'))
);

create unique index users_email_uq on users (email);

create trigger users_set_updated_at
before update on users
for each row
execute function omc_set_updated_at();

create table auth_sessions (
    id uuid primary key default uuidv7(),

    user_id uuid not null references users (id) on delete cascade,

    -- SHA-256(raw_session_token)
    -- The actual bearer token is never persisted
    token_hash bytea not null,

    user_agent text,
    ip_address text,

    created_at timestamptz not null default now(),
    last_seen_at timestamptz,
    expires_at timestamptz not null,
    revoked_at timestamptz,

    constraint auth_sessions_token_hash_length_chk
        check (octet_length(token_hash) = 32),

    constraint auth_sessions_expiration_chk
        check (expires_at > created_at)
);

create unique index auth_sessions_token_hash_uq
    on auth_sessions (token_hash);

create index auth_sessions_user_id_idx
    on auth_sessions (user_id);

create index auth_sessions_active_user_idx
    on auth_sessions (user_id, expires_at)
    where revoked_at is null;

create table categories (
    id uuid primary key default uuidv7(),

    user_id uuid not null references users (id) on delete cascade,
    name text not null,
    kind text not null default 'expense',

    icon text,
    color text,

    is_archived boolean not null default false,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint categories_name_not_empty_chk
        check (length(btrim(name)) > 0),

    constraint categories_kind_chk check (kind in ('expense', 'income', 'both'))
);

create unique index categories_active_name_uq
    on categories (user_id, lower(name))
    where is_archived = false;

create index categories_user_id_idx
    on categories (user_id);

create trigger categories_set_updated_at
before update on categories
for each row
execute function omc_set_updated_at();

create table recurring_rules (
    id uuid primary key default uuidv7(),

    user_id uuid not null references users (id) on delete cascade,
    category_id uuid not null references categories (id) on delete restrict,

    name text not null,
    direction text not null,
    amount_mode text not null,

    fixed_amount numeric(14,2),
    estimated_amount numeric(14,2),
    min_amount numeric(14,2),
    max_amount numeric(14,2),

    -- MVP solo soporta "monthly" por ahora
    frequency text not null default 'monthly',

    day_of_month smallint not null,

    starts_on date not null,
    ends_on date,

    is_active boolean not null default true,

    notes text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint recurring_rules_name_not_empty_chk
        check (length(btrim(name)) > 0),

    constraint recurring_rules_direction_chk
        check (direction in ('income', 'expense')),

    constraint recurring_rules_amount_mode_chk
        check (amount_mode in ('fixed', 'variable')),

    constraint recurring_rules_frequency_chk
        check (frequency in ('monthly')),

    constraint recurring_rules_day_of_month_chk
        check (day_of_month between 1 and 31),

    constraint recurring_rules_date_range_chk
        check (ends_on is null or ends_on >= starts_on),

    constraint recurring_rules_amount_shape_chk
        check (
            (
                amount_mode = 'fixed'
                and fixed_amount is not null
                and fixed_amount > 0
                and estimated_amount is null
                and min_amount is null
                and max_amount is null
            )
            or
            (
                amount_mode = 'variable'
                and fixed_amount is null
            )
        ),
    
    constraint recurring_rules_estimated_min_chk
        check (
            estimated_amount is null
            or min_amount is null
            or estimated_amount >= min_amount
        ),
    
    constraint recurring_rules_estimated_max_chk
        check (
            estimated_amount is null
            or max_amount is null
            or estimated_amount <= max_amount
        ),

    constraint recurring_rules_estimated_amount_chk
        check (
            estimated_amount is null
            or estimated_amount > 0
        ),

    constraint recurring_rules_min_amount_chk
        check (
            min_amount is null
            or min_amount > 0
        ),

    constraint recurring_rules_max_amount_chk
        check (
            max_amount is null
            or max_amount > 0
        ),

    constraint recurring_rules_variable_range_chk
        check (
            min_amount is null
            or max_amount is null
            or min_amount <= max_amount
        )
);

create index recurring_rules_user_id_idx
    on recurring_rules (user_id);

create index recurring_rules_active_user_idx
    on recurring_rules (user_id, starts_on, ends_on)
    where is_active = true;

create index recurring_rules_category_id_idx
    on recurring_rules (category_id);

create trigger recurring_rules_set_updated_at
before update on recurring_rules
for each row
execute function omc_set_updated_at();

create table transactions (
    id uuid primary key default uuidv7(),

    user_id uuid not null references users (id) on delete cascade,
    category_id uuid not null references categories (id) on delete restrict,

    recurring_rule_id uuid references recurring_rules (id) on delete restrict,

    -- Generado por PWA para operaciones de cliente idempotentes
    client_operation_id uuid,

    direction text not null,
    status text not null,

    description text not null,
    notes text,

    expected_amount numeric(14,2),
    actual_amount numeric(14,2),

    due_date date,

    recurrence_period date,

    occurred_at timestamptz,

    paid_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint transactions_description_not_empty_chk
        check (length(btrim(description)) > 0),

    constraint transactions_direction_chk
        check (direction in ('income', 'expense')),

    constraint transactions_status_chk
        check (
            status in (
                'pending',
                'paid',
                'skipped',
                'cancelled'
            )
        ),

    constraint transactions_expected_amount_chk
        check (
            expected_amount is null
            or expected_amount > 0
        ),

    constraint transactions_actual_amount_chk
        check (
            actual_amount is null
            or actual_amount > 0
        ),

    constraint transactions_paid_shape_chk
        check (
            status <> 'paid'
            or (
                actual_amount is not null
                and paid_at is not null
                and occurred_at is not null
            )
        ),

    constraint transactions_recurring_period_required_chk
        check (
            recurring_rule_id is null
            or recurrence_period is not null
        ),

    constraint transactions_recurrence_period_first_day_chk
        check (
            recurrence_period is null
            or extract(day from recurrence_period) = 1
        ),

    constraint transactions_unpaid_shape_chk
        check (
            status = 'paid'
            or (
                actual_amount is null
                and paid_at is null
                and occurred_at is null
                and due_date is not null
            )
        ),

    constraint transactions_skipped_recurring_chk
        check (
            status <> 'skipped'
            or recurring_rule_id is not null
        ),

    constraint transactions_recurrence_shape_chk
        check (
            (
                recurring_rule_id is null
                and recurrence_period is null
            )
            or
            (
                recurring_rule_id is not null
                and recurrence_period is not null
                and due_date is not null
            )
        )
);

create unique index transactions_recurring_period_uq
    on transactions (recurring_rule_id, recurrence_period)
    where recurring_rule_id is not null;

create unique index transactions_client_operation_uq
    on transactions (user_id, client_operation_id)
    where client_operation_id is not null;

create index transactions_user_occurred_at_idx
    on transactions (user_id, occurred_at desc);

create index transactions_user_due_date_idx
    on transactions (user_id, due_date);

create index transactions_user_status_idx
    on transactions (user_id, status);

create index transactions_user_category_idx
    on transactions (user_id, category_id);

create index transactions_recurring_rule_idx
    on transactions (recurring_rule_id);

create trigger transactions_set_updated_at
before update on transactions
for each row
execute function omc_set_updated_at();

commit;
