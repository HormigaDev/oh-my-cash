-- create
insert into users (name, email, password)
values ($1, $2, $3)
returning id;

-- find-by-id
select
    id,
    name,
    email,
    status,
    created_at as "createdAt",
    updated_at as "updatedAt"
from users where id = $1 and status != 'deleted';

-- update
update users set {{column}} = $2 where id = $1;

-- update-partial
update users
set {{setters}}
where id = $1;

-- find-by-email
select
    id,
    password
from users where email = $1 and status = 'active';

-- delete
update users
set
    status = 'deleted',
    email = null
where id = $1;

-- set
update users
set
    name = $2,
    email = $3
where id = $1 and status = 'active';