create schema clarify_health;
revoke all on schema clarify_health from public, anon;
grant usage on schema clarify_health to authenticated, service_role;

create table clarify_health.providers (
 id uuid primary key default gen_random_uuid(),
 code text not null unique check (code ~ '^[a-z][a-z0-9_]*$'),
 display_name text not null,
 created_at timestamptz not null default now()
);
insert into clarify_health.providers(code,display_name) values
 ('apple_health','Apple Health'),('whoop','WHOOP'),('health_connect','Health Connect'),
 ('garmin','Garmin'),('fitbit','Fitbit'),('manual','Manual'),('demo','Demo');

create table clarify_health.metric_types (
 id uuid primary key default gen_random_uuid(),
 code text not null unique,
 display_name text not null,
 canonical_unit text not null,
 description text not null,
 unique(code,canonical_unit)
);
insert into clarify_health.metric_types(code,display_name,canonical_unit,description) values
 ('sleep_duration','Sleep duration','s','Time asleep; do not substitute time in bed.'),
 ('hrv_rmssd','HRV RMSSD','ms','RMSSD only; sampling protocol and device remain significant.'),
 ('hrv_sdnn','HRV SDNN','ms','SDNN is not interchangeable with RMSSD.'),
 ('resting_heart_rate','Resting heart rate','bpm','Preserve vendor resting-heart-rate methodology.'),
 ('steps','Steps','count','Interval count; overlapping providers must not be summed.'),
 ('workout_duration','Workout duration','s','Elapsed workout interval.');

create table clarify_health.profiles (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null unique references auth.users(id) on delete cascade,
 display_name text,
 timezone text,
 onboarding_completed_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table clarify_health.data_sources (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 provider_code text not null references clarify_health.providers(code),
 external_account_id text,
 label text,
 status text not null default 'disconnected' check (status in ('disconnected','connected','revoked','error')),
 last_synced_at timestamptz,
 metadata jsonb not null default '{}' check (jsonb_typeof(metadata)='object'),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(id,user_id), unique(id,user_id,provider_code)
);
create unique index data_sources_account_unique on clarify_health.data_sources(user_id,provider_code,external_account_id) where external_account_id is not null;
create table clarify_health.devices (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 data_source_id uuid not null,
 external_id text,
 manufacturer text,
 model text,
 hardware_version text,
 software_version text,
 metadata jsonb not null default '{}' check (jsonb_typeof(metadata)='object'),
 created_at timestamptz not null default now(),
 unique(id,user_id,data_source_id),
 foreign key(data_source_id,user_id) references clarify_health.data_sources(id,user_id)
);
create unique index devices_external_unique on clarify_health.devices(user_id,data_source_id,external_id) where external_id is not null;

create table clarify_health.metric_source_periods (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 metric_type text not null references clarify_health.metric_types(code),
 data_source_id uuid not null,
 device_id uuid,
 measurement_method text not null check (length(trim(measurement_method))>0),
 effective_from timestamptz not null default now(),
 effective_to timestamptz,
 reason text,
 created_at timestamptz not null default now(),
 check(effective_to is null or effective_to>effective_from),
 unique(id,user_id,metric_type),
 foreign key(data_source_id,user_id) references clarify_health.data_sources(id,user_id),
 foreign key(device_id,user_id,data_source_id) references clarify_health.devices(id,user_id,data_source_id)
);
create unique index one_current_source_per_metric on clarify_health.metric_source_periods(user_id,metric_type) where effective_to is null;
create index source_period_history on clarify_health.metric_source_periods(user_id,metric_type,effective_from desc);

create table clarify_health.health_samples (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 provider_code text not null references clarify_health.providers(code),
 data_source_id uuid not null,
 device_id uuid,
 metric_type text not null,
 value double precision not null check(value>=0 and value<'Infinity'::double precision),
 unit text not null,
 start_at timestamptz not null,
 end_at timestamptz,
 timezone text,
 external_id text check(external_id is null or length(trim(external_id))>0),
 measurement_method text not null check(length(trim(measurement_method))>0),
 ingested_at timestamptz not null default now(),
 metadata jsonb not null default '{}' check(jsonb_typeof(metadata)='object'),
 unique(id,user_id),
 check(end_at is null or end_at>=start_at),
 foreign key(metric_type,unit) references clarify_health.metric_types(code,canonical_unit),
 foreign key(data_source_id,user_id,provider_code) references clarify_health.data_sources(id,user_id,provider_code),
 foreign key(device_id,user_id,data_source_id) references clarify_health.devices(id,user_id,data_source_id)
);
create index health_samples_series on clarify_health.health_samples(user_id,metric_type,start_at desc);
create index health_samples_source_series on clarify_health.health_samples(user_id,data_source_id,metric_type,measurement_method,start_at desc);
create index health_samples_device on clarify_health.health_samples(device_id,user_id,data_source_id) where device_id is not null;
create unique index health_samples_external_unique on clarify_health.health_samples(user_id,data_source_id,metric_type,measurement_method,external_id) where external_id is not null;

create table clarify_health.daily_metrics (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 provider_code text not null references clarify_health.providers(code),
 data_source_id uuid not null,
 device_id uuid,
 metric_type text not null,
 value double precision not null check(value>=0 and value<'Infinity'::double precision),
 unit text not null,
 start_at timestamptz not null,
 end_at timestamptz,
 timezone text,
 external_id text check(external_id is null or length(trim(external_id))>0),
 measurement_method text not null check(length(trim(measurement_method))>0),
 ingested_at timestamptz not null default now(),
 metadata jsonb not null default '{}' check(jsonb_typeof(metadata)='object'),
 local_date date not null,
 aggregation text not null check(aggregation in ('sum','mean','median','min','max','last')),
 algorithm_version text not null,
 sample_count integer not null check(sample_count>0),
 check(timezone is not null),
 unique(id,user_id),
 check(end_at is null or end_at>=start_at),
 foreign key(metric_type,unit) references clarify_health.metric_types(code,canonical_unit),
 foreign key(data_source_id,user_id,provider_code) references clarify_health.data_sources(id,user_id,provider_code),
 foreign key(device_id,user_id,data_source_id) references clarify_health.devices(id,user_id,data_source_id)
);
create index daily_metrics_series on clarify_health.daily_metrics(user_id,metric_type,start_at desc);
create index daily_metrics_source_series on clarify_health.daily_metrics(user_id,data_source_id,metric_type,measurement_method,start_at desc);
create index daily_metrics_device on clarify_health.daily_metrics(device_id,user_id,data_source_id) where device_id is not null;
create unique index daily_metrics_external_unique on clarify_health.daily_metrics(user_id,data_source_id,metric_type,measurement_method,external_id) where external_id is not null;
create unique index daily_metrics_bucket on clarify_health.daily_metrics (user_id,data_source_id,device_id,metric_type,measurement_method,local_date,timezone,aggregation,algorithm_version) nulls not distinct;

create table clarify_health.sleep_sessions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 provider_code text not null references clarify_health.providers(code),
 data_source_id uuid not null,
 device_id uuid,
 metric_type text not null,
 value double precision not null check(value>=0 and value<'Infinity'::double precision),
 unit text not null,
 start_at timestamptz not null,
 end_at timestamptz,
 timezone text,
 external_id text check(external_id is null or length(trim(external_id))>0),
 measurement_method text not null check(length(trim(measurement_method))>0),
 ingested_at timestamptz not null default now(),
 metadata jsonb not null default '{}' check(jsonb_typeof(metadata)='object'),
 check(metric_type='sleep_duration' and unit='s'),
 check(end_at is not null and end_at>start_at),
 check(value<=extract(epoch from end_at-start_at)),
 unique(id,user_id),
 check(end_at is null or end_at>=start_at),
 foreign key(metric_type,unit) references clarify_health.metric_types(code,canonical_unit),
 foreign key(data_source_id,user_id,provider_code) references clarify_health.data_sources(id,user_id,provider_code),
 foreign key(device_id,user_id,data_source_id) references clarify_health.devices(id,user_id,data_source_id)
);
create index sleep_sessions_series on clarify_health.sleep_sessions(user_id,metric_type,start_at desc);
create index sleep_sessions_source_series on clarify_health.sleep_sessions(user_id,data_source_id,metric_type,measurement_method,start_at desc);
create index sleep_sessions_device on clarify_health.sleep_sessions(device_id,user_id,data_source_id) where device_id is not null;
create unique index sleep_sessions_external_unique on clarify_health.sleep_sessions(user_id,data_source_id,metric_type,measurement_method,external_id) where external_id is not null;

create table clarify_health.workouts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 provider_code text not null references clarify_health.providers(code),
 data_source_id uuid not null,
 device_id uuid,
 metric_type text not null,
 value double precision not null check(value>=0 and value<'Infinity'::double precision),
 unit text not null,
 start_at timestamptz not null,
 end_at timestamptz,
 timezone text,
 external_id text check(external_id is null or length(trim(external_id))>0),
 measurement_method text not null check(length(trim(measurement_method))>0),
 ingested_at timestamptz not null default now(),
 metadata jsonb not null default '{}' check(jsonb_typeof(metadata)='object'),
 activity_type text not null,
 check(metric_type='workout_duration' and unit='s'),
 check(end_at is not null and end_at>start_at),
 check(value<=extract(epoch from end_at-start_at)),
 unique(id,user_id),
 check(end_at is null or end_at>=start_at),
 foreign key(metric_type,unit) references clarify_health.metric_types(code,canonical_unit),
 foreign key(data_source_id,user_id,provider_code) references clarify_health.data_sources(id,user_id,provider_code),
 foreign key(device_id,user_id,data_source_id) references clarify_health.devices(id,user_id,data_source_id)
);
create index workouts_series on clarify_health.workouts(user_id,metric_type,start_at desc);
create index workouts_source_series on clarify_health.workouts(user_id,data_source_id,metric_type,measurement_method,start_at desc);
create index workouts_device on clarify_health.workouts(device_id,user_id,data_source_id) where device_id is not null;
create unique index workouts_external_unique on clarify_health.workouts(user_id,data_source_id,metric_type,measurement_method,external_id) where external_id is not null;

create table clarify_health.journal_factors (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 name text not null check(length(trim(name)) between 1 and 100),
 value_type text not null check(value_type in ('boolean','number','text')),
 unit text,
 archived_at timestamptz,
 created_at timestamptz not null default now(),
 unique(id,user_id), unique(user_id,name)
);
create table clarify_health.journal_entries (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 recorded_at timestamptz not null default now(),
 timezone text,
 mood text check(mood in ('low','okay','good','great')),
 body text not null check(length(body)<=10000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(id,user_id)
);
create index journal_entries_timeline on clarify_health.journal_entries(user_id,recorded_at desc);
create table clarify_health.journal_entry_factors (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 entry_id uuid not null,
 factor_id uuid not null,
 value jsonb not null check(jsonb_typeof(value) in ('boolean','number','string')),
 unique(entry_id,factor_id),
 foreign key(entry_id,user_id) references clarify_health.journal_entries(id,user_id) on delete cascade,
 foreign key(factor_id,user_id) references clarify_health.journal_factors(id,user_id)
);
create table clarify_health.baselines (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 source_period_id uuid not null,
 metric_type text not null,
 unit text not null,
 window_start timestamptz not null,
 window_end timestamptz not null check(window_end>window_start),
 center double precision check(center>=0 and center<'Infinity'::double precision),
 lower_bound double precision,
 upper_bound double precision,
 sample_count integer not null default 0 check(sample_count>=0),
 status text not null default 'pending' check(status in ('pending','calibrating','ready','stale')),
 algorithm_version text not null,
 computed_at timestamptz not null default now(),
 metadata jsonb not null default '{}' check(jsonb_typeof(metadata)='object'),
 check(status<>'ready' or (center is not null and sample_count>=7)),
 check(lower_bound is null or (lower_bound>=0 and lower_bound<'Infinity'::double precision)),
 check(upper_bound is null or (upper_bound>=0 and upper_bound<'Infinity'::double precision)),
 check(lower_bound is null or upper_bound is null or lower_bound<=upper_bound),
 unique(id,user_id), unique(user_id,source_period_id,window_end,algorithm_version),
 foreign key(source_period_id,user_id,metric_type) references clarify_health.metric_source_periods(id,user_id,metric_type),
 foreign key(metric_type,unit) references clarify_health.metric_types(code,canonical_unit)
);
create index baselines_period_latest on clarify_health.baselines(user_id,source_period_id,computed_at desc);
create table clarify_health.daily_scores (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 local_date date not null,
 timezone text not null,
 score_type text not null,
 value double precision check(value between 0 and 100),
 status text not null check(status in ('insufficient_data','calibrating','ready','stale')),
 algorithm_version text not null,
 computed_at timestamptz not null default now(),
 metadata jsonb not null default '{}' check(jsonb_typeof(metadata)='object'),
 check(status<>'ready' or value is not null),
 unique(id,user_id), unique(user_id,local_date,timezone,score_type,algorithm_version)
);
create table clarify_health.daily_score_baselines (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 score_id uuid not null,
 baseline_id uuid not null,
 unique(score_id,baseline_id),
 foreign key(score_id,user_id) references clarify_health.daily_scores(id,user_id) on delete cascade,
 foreign key(baseline_id,user_id) references clarify_health.baselines(id,user_id)
);
create table clarify_health.insights (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 baseline_id uuid,
 title text not null,
 body text not null,
 algorithm_version text not null,
 generated_at timestamptz not null default now(),
 expires_at timestamptz,
 metadata jsonb not null default '{}' check(jsonb_typeof(metadata)='object'),
 foreign key(baseline_id,user_id) references clarify_health.baselines(id,user_id)
);
create index insights_timeline on clarify_health.insights(user_id,generated_at desc);
create table clarify_health.ai_conversations (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(id,user_id)
);
create table clarify_health.ai_messages (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 conversation_id uuid not null,
 role text not null check(role in ('user','assistant','system')),
 content text not null check(length(content) between 1 and 32000),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}' check(jsonb_typeof(metadata)='object'),
 foreign key(conversation_id,user_id) references clarify_health.ai_conversations(id,user_id) on delete cascade
);
create index ai_messages_conversation on clarify_health.ai_messages(user_id,conversation_id,created_at,id);

create function clarify_health.touch_updated_at() returns trigger language plpgsql security invoker set search_path='' as $$
begin new.updated_at=now(); return new; end; $$;
create function clarify_health.validate_source_period() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP='UPDATE' and (new.user_id,new.metric_type,new.data_source_id,new.device_id,new.measurement_method,new.effective_from)
   is distinct from (old.user_id,old.metric_type,old.data_source_id,old.device_id,old.measurement_method,old.effective_from) then
   raise exception 'Source identity is immutable; start a new comparison period';
 end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.user_id::text || ':' || new.metric_type,0));
 if exists(select 1 from clarify_health.metric_source_periods p where p.user_id=new.user_id and p.metric_type=new.metric_type and p.id<>new.id
   and tstzrange(p.effective_from,p.effective_to,'[)') && tstzrange(new.effective_from,new.effective_to,'[)')) then
   raise exception 'Primary source periods cannot overlap';
 end if;
 return new;
end; $$;
create trigger validate_source_period before insert or update on clarify_health.metric_source_periods for each row execute function clarify_health.validate_source_period();

create function clarify_health.set_primary_source(p_metric_type text,p_data_source_id uuid,p_device_id uuid,p_measurement_method text,p_reason text default null)
returns uuid language plpgsql security invoker set search_path='' as $$
declare v_user uuid:=auth.uid(); v_current clarify_health.metric_source_periods; v_id uuid; v_time timestamptz;
begin
 if v_user is null then raise exception 'Authentication required' using errcode='42501'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user::text || ':' || p_metric_type,0));
 select * into v_current from clarify_health.metric_source_periods where user_id=v_user and metric_type=p_metric_type and effective_to is null for update;
 if found and (v_current.data_source_id,v_current.device_id,v_current.measurement_method) is not distinct from (p_data_source_id,p_device_id,p_measurement_method) then return v_current.id; end if;
 v_time:=clock_timestamp();
 if v_current.id is not null then
   v_time:=greatest(v_time,v_current.effective_from+interval '1 microsecond');
   update clarify_health.metric_source_periods set effective_to=v_time where id=v_current.id;
 end if;
 insert into clarify_health.metric_source_periods(user_id,metric_type,data_source_id,device_id,measurement_method,effective_from,reason)
 values(v_user,p_metric_type,p_data_source_id,p_device_id,p_measurement_method,v_time,p_reason) returning id into v_id;
 return v_id;
end; $$;

alter table clarify_health.providers enable row level security;
alter table clarify_health.providers force row level security;
revoke all on clarify_health.providers from public,anon,authenticated;
grant select on clarify_health.providers to authenticated;
grant all on clarify_health.providers to service_role;
create policy catalog_read on clarify_health.providers for select to authenticated using(true);

alter table clarify_health.metric_types enable row level security;
alter table clarify_health.metric_types force row level security;
revoke all on clarify_health.metric_types from public,anon,authenticated;
grant select on clarify_health.metric_types to authenticated;
grant all on clarify_health.metric_types to service_role;
create policy catalog_read on clarify_health.metric_types for select to authenticated using(true);

alter table clarify_health.profiles enable row level security;
alter table clarify_health.profiles force row level security;
revoke all on clarify_health.profiles from public,anon,authenticated;
grant select on clarify_health.profiles to authenticated;
grant all on clarify_health.profiles to service_role;
create index profiles_owner on clarify_health.profiles(user_id);
create policy own_read on clarify_health.profiles for select to authenticated using((select auth.uid())=user_id);
grant insert,update,delete on clarify_health.profiles to authenticated;
create policy own_insert on clarify_health.profiles for insert to authenticated with check((select auth.uid())=user_id);
create policy own_update on clarify_health.profiles for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy own_delete on clarify_health.profiles for delete to authenticated using((select auth.uid())=user_id);

alter table clarify_health.data_sources enable row level security;
alter table clarify_health.data_sources force row level security;
revoke all on clarify_health.data_sources from public,anon,authenticated;
grant select on clarify_health.data_sources to authenticated;
grant all on clarify_health.data_sources to service_role;
create index data_sources_owner on clarify_health.data_sources(user_id);
create policy own_read on clarify_health.data_sources for select to authenticated using((select auth.uid())=user_id);
grant insert,update,delete on clarify_health.data_sources to authenticated;
create policy own_insert on clarify_health.data_sources for insert to authenticated with check((select auth.uid())=user_id);
create policy own_update on clarify_health.data_sources for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy own_delete on clarify_health.data_sources for delete to authenticated using((select auth.uid())=user_id);

alter table clarify_health.devices enable row level security;
alter table clarify_health.devices force row level security;
revoke all on clarify_health.devices from public,anon,authenticated;
grant select on clarify_health.devices to authenticated;
grant all on clarify_health.devices to service_role;
create index devices_owner on clarify_health.devices(user_id);
create policy own_read on clarify_health.devices for select to authenticated using((select auth.uid())=user_id);
grant insert,update,delete on clarify_health.devices to authenticated;
create policy own_insert on clarify_health.devices for insert to authenticated with check((select auth.uid())=user_id);
create policy own_update on clarify_health.devices for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy own_delete on clarify_health.devices for delete to authenticated using((select auth.uid())=user_id);

alter table clarify_health.metric_source_periods enable row level security;
alter table clarify_health.metric_source_periods force row level security;
revoke all on clarify_health.metric_source_periods from public,anon,authenticated;
grant select on clarify_health.metric_source_periods to authenticated;
grant all on clarify_health.metric_source_periods to service_role;
create index metric_source_periods_owner on clarify_health.metric_source_periods(user_id);
create policy own_read on clarify_health.metric_source_periods for select to authenticated using((select auth.uid())=user_id);
grant insert,update,delete on clarify_health.metric_source_periods to authenticated;
create policy own_insert on clarify_health.metric_source_periods for insert to authenticated with check((select auth.uid())=user_id);
create policy own_update on clarify_health.metric_source_periods for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy own_delete on clarify_health.metric_source_periods for delete to authenticated using((select auth.uid())=user_id);

alter table clarify_health.health_samples enable row level security;
alter table clarify_health.health_samples force row level security;
revoke all on clarify_health.health_samples from public,anon,authenticated;
grant select on clarify_health.health_samples to authenticated;
grant all on clarify_health.health_samples to service_role;
create index health_samples_owner on clarify_health.health_samples(user_id);
create policy own_read on clarify_health.health_samples for select to authenticated using((select auth.uid())=user_id);
grant insert,update,delete on clarify_health.health_samples to authenticated;
create policy own_insert on clarify_health.health_samples for insert to authenticated with check((select auth.uid())=user_id);
create policy own_update on clarify_health.health_samples for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy own_delete on clarify_health.health_samples for delete to authenticated using((select auth.uid())=user_id);

alter table clarify_health.daily_metrics enable row level security;
alter table clarify_health.daily_metrics force row level security;
revoke all on clarify_health.daily_metrics from public,anon,authenticated;
grant select on clarify_health.daily_metrics to authenticated;
grant all on clarify_health.daily_metrics to service_role;
create index daily_metrics_owner on clarify_health.daily_metrics(user_id);
create policy own_read on clarify_health.daily_metrics for select to authenticated using((select auth.uid())=user_id);

alter table clarify_health.sleep_sessions enable row level security;
alter table clarify_health.sleep_sessions force row level security;
revoke all on clarify_health.sleep_sessions from public,anon,authenticated;
grant select on clarify_health.sleep_sessions to authenticated;
grant all on clarify_health.sleep_sessions to service_role;
create index sleep_sessions_owner on clarify_health.sleep_sessions(user_id);
create policy own_read on clarify_health.sleep_sessions for select to authenticated using((select auth.uid())=user_id);
grant insert,update,delete on clarify_health.sleep_sessions to authenticated;
create policy own_insert on clarify_health.sleep_sessions for insert to authenticated with check((select auth.uid())=user_id);
create policy own_update on clarify_health.sleep_sessions for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy own_delete on clarify_health.sleep_sessions for delete to authenticated using((select auth.uid())=user_id);

alter table clarify_health.workouts enable row level security;
alter table clarify_health.workouts force row level security;
revoke all on clarify_health.workouts from public,anon,authenticated;
grant select on clarify_health.workouts to authenticated;
grant all on clarify_health.workouts to service_role;
create index workouts_owner on clarify_health.workouts(user_id);
create policy own_read on clarify_health.workouts for select to authenticated using((select auth.uid())=user_id);
grant insert,update,delete on clarify_health.workouts to authenticated;
create policy own_insert on clarify_health.workouts for insert to authenticated with check((select auth.uid())=user_id);
create policy own_update on clarify_health.workouts for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy own_delete on clarify_health.workouts for delete to authenticated using((select auth.uid())=user_id);

alter table clarify_health.journal_factors enable row level security;
alter table clarify_health.journal_factors force row level security;
revoke all on clarify_health.journal_factors from public,anon,authenticated;
grant select on clarify_health.journal_factors to authenticated;
grant all on clarify_health.journal_factors to service_role;
create index journal_factors_owner on clarify_health.journal_factors(user_id);
create policy own_read on clarify_health.journal_factors for select to authenticated using((select auth.uid())=user_id);
grant insert,update,delete on clarify_health.journal_factors to authenticated;
create policy own_insert on clarify_health.journal_factors for insert to authenticated with check((select auth.uid())=user_id);
create policy own_update on clarify_health.journal_factors for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy own_delete on clarify_health.journal_factors for delete to authenticated using((select auth.uid())=user_id);

alter table clarify_health.journal_entries enable row level security;
alter table clarify_health.journal_entries force row level security;
revoke all on clarify_health.journal_entries from public,anon,authenticated;
grant select on clarify_health.journal_entries to authenticated;
grant all on clarify_health.journal_entries to service_role;
create index journal_entries_owner on clarify_health.journal_entries(user_id);
create policy own_read on clarify_health.journal_entries for select to authenticated using((select auth.uid())=user_id);
grant insert,update,delete on clarify_health.journal_entries to authenticated;
create policy own_insert on clarify_health.journal_entries for insert to authenticated with check((select auth.uid())=user_id);
create policy own_update on clarify_health.journal_entries for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy own_delete on clarify_health.journal_entries for delete to authenticated using((select auth.uid())=user_id);

alter table clarify_health.journal_entry_factors enable row level security;
alter table clarify_health.journal_entry_factors force row level security;
revoke all on clarify_health.journal_entry_factors from public,anon,authenticated;
grant select on clarify_health.journal_entry_factors to authenticated;
grant all on clarify_health.journal_entry_factors to service_role;
create index journal_entry_factors_owner on clarify_health.journal_entry_factors(user_id);
create policy own_read on clarify_health.journal_entry_factors for select to authenticated using((select auth.uid())=user_id);
grant insert,update,delete on clarify_health.journal_entry_factors to authenticated;
create policy own_insert on clarify_health.journal_entry_factors for insert to authenticated with check((select auth.uid())=user_id);
create policy own_update on clarify_health.journal_entry_factors for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy own_delete on clarify_health.journal_entry_factors for delete to authenticated using((select auth.uid())=user_id);

alter table clarify_health.baselines enable row level security;
alter table clarify_health.baselines force row level security;
revoke all on clarify_health.baselines from public,anon,authenticated;
grant select on clarify_health.baselines to authenticated;
grant all on clarify_health.baselines to service_role;
create index baselines_owner on clarify_health.baselines(user_id);
create policy own_read on clarify_health.baselines for select to authenticated using((select auth.uid())=user_id);

alter table clarify_health.daily_scores enable row level security;
alter table clarify_health.daily_scores force row level security;
revoke all on clarify_health.daily_scores from public,anon,authenticated;
grant select on clarify_health.daily_scores to authenticated;
grant all on clarify_health.daily_scores to service_role;
create index daily_scores_owner on clarify_health.daily_scores(user_id);
create policy own_read on clarify_health.daily_scores for select to authenticated using((select auth.uid())=user_id);

alter table clarify_health.daily_score_baselines enable row level security;
alter table clarify_health.daily_score_baselines force row level security;
revoke all on clarify_health.daily_score_baselines from public,anon,authenticated;
grant select on clarify_health.daily_score_baselines to authenticated;
grant all on clarify_health.daily_score_baselines to service_role;
create index daily_score_baselines_owner on clarify_health.daily_score_baselines(user_id);
create policy own_read on clarify_health.daily_score_baselines for select to authenticated using((select auth.uid())=user_id);

alter table clarify_health.insights enable row level security;
alter table clarify_health.insights force row level security;
revoke all on clarify_health.insights from public,anon,authenticated;
grant select on clarify_health.insights to authenticated;
grant all on clarify_health.insights to service_role;
create index insights_owner on clarify_health.insights(user_id);
create policy own_read on clarify_health.insights for select to authenticated using((select auth.uid())=user_id);

alter table clarify_health.ai_conversations enable row level security;
alter table clarify_health.ai_conversations force row level security;
revoke all on clarify_health.ai_conversations from public,anon,authenticated;
grant select on clarify_health.ai_conversations to authenticated;
grant all on clarify_health.ai_conversations to service_role;
create index ai_conversations_owner on clarify_health.ai_conversations(user_id);
create policy own_read on clarify_health.ai_conversations for select to authenticated using((select auth.uid())=user_id);
grant insert,update,delete on clarify_health.ai_conversations to authenticated;
create policy own_insert on clarify_health.ai_conversations for insert to authenticated with check((select auth.uid())=user_id);
create policy own_update on clarify_health.ai_conversations for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy own_delete on clarify_health.ai_conversations for delete to authenticated using((select auth.uid())=user_id);

alter table clarify_health.ai_messages enable row level security;
alter table clarify_health.ai_messages force row level security;
revoke all on clarify_health.ai_messages from public,anon,authenticated;
grant select on clarify_health.ai_messages to authenticated;
grant all on clarify_health.ai_messages to service_role;
create index ai_messages_owner on clarify_health.ai_messages(user_id);
create policy own_read on clarify_health.ai_messages for select to authenticated using((select auth.uid())=user_id);
grant insert,update,delete on clarify_health.ai_messages to authenticated;
create policy own_insert on clarify_health.ai_messages for insert to authenticated with check((select auth.uid())=user_id and role='user');
create policy own_update on clarify_health.ai_messages for update to authenticated using((select auth.uid())=user_id and role='user') with check((select auth.uid())=user_id and role='user');
create policy own_delete on clarify_health.ai_messages for delete to authenticated using((select auth.uid())=user_id and role='user');
create trigger touch_updated_at before update on clarify_health.profiles for each row execute function clarify_health.touch_updated_at();
create trigger touch_updated_at before update on clarify_health.data_sources for each row execute function clarify_health.touch_updated_at();
create trigger touch_updated_at before update on clarify_health.journal_entries for each row execute function clarify_health.touch_updated_at();
create trigger touch_updated_at before update on clarify_health.ai_conversations for each row execute function clarify_health.touch_updated_at();

create index periods_source_fk on clarify_health.metric_source_periods(data_source_id,user_id);
create index periods_device_fk on clarify_health.metric_source_periods(device_id,user_id,data_source_id) where device_id is not null;
create index devices_source_fk on clarify_health.devices(data_source_id,user_id);
create index factors_entry_fk on clarify_health.journal_entry_factors(entry_id,user_id);
create index factors_factor_fk on clarify_health.journal_entry_factors(factor_id,user_id);
create index score_baseline_fk on clarify_health.daily_score_baselines(baseline_id,user_id);
create index score_parent_fk on clarify_health.daily_score_baselines(score_id,user_id);
create index insight_baseline_fk on clarify_health.insights(baseline_id,user_id) where baseline_id is not null;

create function clarify_health.validate_timezone() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if new.timezone is not null and not exists(select 1 from pg_catalog.pg_timezone_names where name=new.timezone) then raise exception 'Unknown timezone'; end if;
 return new;
end; $$;
create function clarify_health.validate_factor_value() returns trigger language plpgsql security invoker set search_path='' as $$
declare expected text;
begin
 select case value_type when 'text' then 'string' else value_type end into expected from clarify_health.journal_factors where id=new.factor_id and user_id=new.user_id;
 if expected is null or jsonb_typeof(new.value)<>expected then raise exception 'Factor value does not match its definition'; end if;
 return new;
end; $$;
create trigger validate_factor_value before insert or update on clarify_health.journal_entry_factors for each row execute function clarify_health.validate_factor_value();
create function clarify_health.validate_baseline_period() returns trigger language plpgsql security invoker set search_path='' as $$
declare p clarify_health.metric_source_periods;
begin
 select * into p from clarify_health.metric_source_periods where id=new.source_period_id and user_id=new.user_id;
 if not found or new.window_start<p.effective_from or (p.effective_to is not null and new.window_end>p.effective_to) then raise exception 'Baseline window must stay within its source period'; end if;
 return new;
end; $$;
create trigger validate_baseline_period before insert or update on clarify_health.baselines for each row execute function clarify_health.validate_baseline_period();
create trigger validate_timezone before insert or update on clarify_health.profiles for each row execute function clarify_health.validate_timezone();
create trigger validate_timezone before insert or update on clarify_health.health_samples for each row execute function clarify_health.validate_timezone();
create trigger validate_timezone before insert or update on clarify_health.daily_metrics for each row execute function clarify_health.validate_timezone();
create trigger validate_timezone before insert or update on clarify_health.sleep_sessions for each row execute function clarify_health.validate_timezone();
create trigger validate_timezone before insert or update on clarify_health.workouts for each row execute function clarify_health.validate_timezone();
create trigger validate_timezone before insert or update on clarify_health.journal_entries for each row execute function clarify_health.validate_timezone();
create trigger validate_timezone before insert or update on clarify_health.daily_scores for each row execute function clarify_health.validate_timezone();

revoke execute on function clarify_health.touch_updated_at(), clarify_health.validate_source_period(), clarify_health.set_primary_source(text,uuid,uuid,text,text), clarify_health.validate_timezone(), clarify_health.validate_factor_value(), clarify_health.validate_baseline_period() from public, anon;
grant execute on function clarify_health.touch_updated_at(), clarify_health.validate_source_period(), clarify_health.set_primary_source(text,uuid,uuid,text,text), clarify_health.validate_timezone(), clarify_health.validate_factor_value(), clarify_health.validate_baseline_period() to authenticated;