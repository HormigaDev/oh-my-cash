-- create
insert into categories (user_id, name)
values ($1, $2)
returning id;

-- find-by-id
select
    id,
    user_id as "userId",
    name
from categories where id = $1;

-- find-by-name
select
    id,
    user_id as "userId",
    name
from categories where user_id = $1 and name = $2;

-- find
select id, name from categories where user_id = $1 order by id asc;

-- update
update categories
set name = $1
where user_id = $2 and id = $3;

-- delete
delete from categories
where user_id = $1 and id = $2;
