create table if not exists users (
    id serial primary key,
    name varchar(100) not null,
    email varchar(100) unique,
    password text not null,
    status varchar(8) check (status in ('active', 'inactive', 'deleted')) default 'active',
    created_at timestamp default CURRENT_TIMESTAMP,
    updated_at timestamp default CURRENT_TIMESTAMP
);

create table if not exists transactions (
    id serial primary key,
    type varchar(10) check (type in ('income', 'expense')),
    user_id integer not null,
    amount numeric(15,2),
    transaction_date date default CURRENT_DATE,
    description text,
    created_at timestamp default CURRENT_TIMESTAMP,
    updated_at timestamp default CURRENT_TIMESTAMP,
    foreign key (user_id) references users (id)
);

create table if not exists categories (
    id serial primary key,
    user_id integer not null,
    name varchar(100),
    foreign key (user_id) references users (id)
);

create table if not exists transactions_categories (
    transaction_id integer not null,
    category_id integer not null,
    primary key (transaction_id, category_id),
    foreign key (transaction_id) references transactions (id) on delete cascade,
    foreign key (category_id) references categories (id) on delete cascade
);

create or replace function update_updated_at()
returns trigger as $$
begin
    if old.* is distinct from new.* and old.updated_at is not distinct from new.updated_at then
        new.updated_at = now();
    end if;
    return new;
end;
$$ language plpgsql;

create trigger trigger_update_users_updated_at
before update on users
for each row
execute function update_updated_at();

create trigger trigger_update_transactions_updated_at
before update on transactions
for each row
execute function update_updated_at();