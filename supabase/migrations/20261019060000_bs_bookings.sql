-- Be Sanatan bookings (isolated inside SalesAutoCall project: only new bs_* objects)
create schema if not exists bs_private;
revoke all on schema bs_private from public, anon;
grant usage on schema bs_private to authenticated;

create table public.bs_admins (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);
alter table public.bs_admins enable row level security;
insert into public.bs_admins(email) values ('musicofmajor@gmail.com');

create or replace function bs_private.bs_is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.bs_admins a where a.email = lower(coalesce(auth.jwt()->>'email',''))) $$;
revoke all on function bs_private.bs_is_admin() from public, anon;
grant execute on function bs_private.bs_is_admin() to authenticated;

create table public.bs_bookings (
  id uuid primary key default gen_random_uuid(),
  booking_ref text unique not null check (booking_ref ~ '^BS-[0-9]{6}-[A-Z0-9]{4,8}$'),
  created_at timestamptz not null default now(),
  seva text not null check (char_length(seva) between 1 and 200),
  package text check (char_length(package) <= 200),
  quantity int check (quantity between 1 and 100000),
  amount int not null check (amount > 0 and amount <= 10000000),
  sankalp_name text not null check (char_length(sankalp_name) between 1 and 200),
  gotra text check (char_length(gotra) <= 100),
  phone text not null check (phone ~ '^[6-9][0-9]{9}$'),
  preferred_date date,
  message text check (char_length(message) <= 2000),
  screenshot_path text check (screenshot_path like 'bookings/%' and char_length(screenshot_path) <= 300),
  status text not null default 'pending' check (status in ('pending','verified','completed','rejected')),
  admin_note text check (char_length(admin_note) <= 2000)
);
create index bs_bookings_created_idx on public.bs_bookings (created_at desc);
alter table public.bs_bookings enable row level security;

revoke all on public.bs_bookings from public, anon, authenticated;
revoke all on public.bs_admins from public, anon, authenticated;
grant insert on public.bs_bookings to anon;
grant select, update on public.bs_bookings to authenticated;
grant select on public.bs_admins to authenticated;

create policy bs_bookings_anon_insert on public.bs_bookings for insert to anon
  with check (status = 'pending' and admin_note is null and screenshot_path is not null);
create policy bs_bookings_admin_select on public.bs_bookings for select to authenticated
  using ((select bs_private.bs_is_admin()));
create policy bs_bookings_admin_update on public.bs_bookings for update to authenticated
  using ((select bs_private.bs_is_admin())) with check ((select bs_private.bs_is_admin()));
create policy bs_admins_admin_select on public.bs_admins for select to authenticated
  using ((select bs_private.bs_is_admin()));

-- private bucket for payment screenshots
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bs-payment-screenshots','bs-payment-screenshots', false, 5242880,
        array['image/jpeg','image/png','image/webp','image/heic','image/heif','image/gif']);

create policy bs_screens_anon_insert on storage.objects for insert to anon
  with check (bucket_id = 'bs-payment-screenshots' and name like 'bookings/%');
create policy bs_screens_admin_select on storage.objects for select to authenticated
  using (bucket_id = 'bs-payment-screenshots' and (select bs_private.bs_is_admin()));
