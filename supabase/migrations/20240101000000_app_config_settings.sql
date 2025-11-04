create schema if not exists app_config;

create or replace function app_config.require_setting(setting_name text)
returns text
language plpgsql
security definer
as $$
declare
  setting_value text;
begin
  setting_value := current_setting(setting_name, true);

  if setting_value is not null and length(trim(setting_value)) > 0 then
    return setting_value;
  end if;

  begin
    setting_value := vault.decrypted_secret(setting_name);
  exception when others then
    setting_value := null;
  end;

  if setting_value is null or length(trim(setting_value)) = 0 then
    raise exception using
      message = format('Missing runtime setting %%s', setting_name),
      hint = format('Set the database parameter "%%s" or store it in Vault before applying this migration.', setting_name);
  end if;

  return setting_value;
end;
$$;

create or replace function app_config.supabase_base_url()
returns text
language plpgsql
security definer
as $$
begin
  return format('https://%s.supabase.co', app_config.require_setting('app.settings.supabase_project_ref'));
end;
$$;

create or replace function app_config.supabase_service_role_bearer()
returns text
language plpgsql
security definer
as $$
begin
  return format('Bearer %s', app_config.require_setting('app.settings.supabase_service_role_key'));
end;
$$;

create or replace function app_config.supabase_functions_base_url()
returns text
language plpgsql
security definer
as $$
begin
  return format('https://%s.functions.supabase.co', app_config.require_setting('app.settings.supabase_project_ref'));
end;
$$;
