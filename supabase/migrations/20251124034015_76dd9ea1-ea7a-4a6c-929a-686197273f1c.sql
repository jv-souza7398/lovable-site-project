-- Create profiles table to store user data
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  cpf text,
  nome_completo text,
  email text,
  sexo text,
  telefone text,
  data_nascimento date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  primary key (id)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policies for profiles
create policy "Users can view their own profile" 
  on public.profiles 
  for select 
  using (auth.uid() = id);

create policy "Users can update their own profile" 
  on public.profiles 
  for update 
  using (auth.uid() = id);

create policy "Users can insert their own profile" 
  on public.profiles 
  for insert 
  with check (auth.uid() = id);

-- Function to create profile automatically on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, cpf, nome_completo, email, sexo, telefone, data_nascimento)
  values (
    new.id,
    new.raw_user_meta_data->>'cpf',
    new.raw_user_meta_data->>'nome_completo',
    new.raw_user_meta_data->>'email',
    new.raw_user_meta_data->>'sexo',
    new.raw_user_meta_data->>'telefone',
    (new.raw_user_meta_data->>'data_nascimento')::date
  );
  return new;
end;
$$;

-- Trigger to call function on user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for automatic timestamp updates
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at_column();