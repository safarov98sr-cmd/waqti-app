-- Запусти этот SQL в Supabase → SQL Editor

create table if not exists tasks (
  id          uuid    default gen_random_uuid() primary key,
  device_id   text    not null,
  title       text    not null,
  priority    text    not null default 'medium'
                check (priority in ('high', 'medium', 'low')),
  done        boolean not null default false,
  date        date    not null default current_date,
  created_at  timestamptz not null default now()
);

create index if not exists idx_tasks_device_date
  on tasks (device_id, date);

-- Row Level Security (opional для MVP — разреши всё)
alter table tasks enable row level security;

create policy "anon full access"
  on tasks for all
  using (true)
  with check (true);
