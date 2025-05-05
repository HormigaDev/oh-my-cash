-- find
select
    t.id,
    t.type,
    t.amount,
    t.transaction_date as "date",
    t.description,
    coalesce(cat.categories, ARRAY[]::jsonb[]) as categories,
    t.created_at as "createdAt",
    t.updated_at as "updatedAt"
from transactions t
left join (
    select
        tc.transaction_id,
        array_agg(
            jsonb_build_object(
                'id', c.id,
                'name', c.name
            )
        ) as categories
    from transactions_categories tc
    inner join categories c on c.id = tc.category_id
    group by tc.transaction_id
) as cat on cat.transaction_id = t.id
inner join transactions_categories tc on t.id = tc.transaction_id
inner join categories c on c.id = tc.category_id
where t.user_id = $1
and (
    not exists(
        select 1
        from unnest($2::int[]) as filter_cat_id
    )
    or exists (
        select 1
        from transactions_categories tc2
        where tc2.transaction_id = t.id and tc2.category_id = any($2::int[])
    )
)
{{conditions}}
order by {{column}} {{order}}
limit {{limit}} offset {{page}};

-- find-by-id
select
    id,
    type,
    amount,
    user_id as "userId",
    transaction_date as "date",
    description,
    created_at as "createdAt",
    updated_at as "updatedAt"
from transactions where id = $1;

-- create
insert into transactions (user_id, type, amount, transaction_date, description)
values ($1, $2, $3, $4, $5) returning id;

-- add-to-category
insert into transactions_categories (transaction_id, category_id)
values ($1, $2);

-- update
update transactions
set {{setters}}
where user_id = $1 and id = $2;

-- update-category
update transactions_categories
set category_id = $1
where transaction_id = $2;

-- delete
delete from transactions
where user_id = $1 and id = $2;