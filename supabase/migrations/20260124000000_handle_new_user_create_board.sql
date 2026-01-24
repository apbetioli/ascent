-- Create a single default board when a user is created. Boards are created ONLY here,
-- not on boards page visit or elsewhere, to avoid duplicates.

create or replace function handle_new_user()
returns trigger as $$
begin
  -- Create profile
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    new.raw_user_meta_data->>'avatar_url'
  );

  -- Create single default board for the new user
  insert into public.boards (user_id, name, theme)
  values (new.id, 'My Goals', 'default');

  return new;
end;
$$ language plpgsql security definer;
