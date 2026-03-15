-- Maruvayil Sree ShivaParvathy Temple - Database Schema
-- Run this in your Supabase SQL editor

-- profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  full_name_ml text,
  phone text,
  address text,
  member_since timestamptz default now(),
  is_active_member boolean default false,
  created_at timestamptz default now()
);

-- family_members table
create table family_members (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  name_malayalam text,
  relationship text not null,
  birth_date date,
  birth_star text,
  rashi text,
  notes text,
  include_in_pooja boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS policies
alter table profiles enable row level security;
alter table family_members enable row level security;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "Users can manage own family members" on family_members for all using (auth.uid() = user_id);

-- Function to auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile automatically
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Updated_at trigger for family_members
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_family_members_updated_at
  before update on family_members
  for each row execute procedure update_updated_at_column();
