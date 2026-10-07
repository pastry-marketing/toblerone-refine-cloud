alter table public.ranking_runs
  add column result_title text,
  add column result_snippet text,
  add column result_domain text,
  add column result_page_number integer check (result_page_number is null or result_page_number >= 1),
  add column result_position_on_page integer check (
    result_position_on_page is null
    or result_position_on_page between 1 and 10
  );

comment on column public.ranking_runs.result_title is
  'Organic Google result title captured when the tracked domain was found.';
comment on column public.ranking_runs.result_snippet is
  'Organic Google result snippet captured when the tracked domain was found.';
comment on column public.ranking_runs.result_domain is
  'Normalized domain of the exact organic result that ranked.';
comment on column public.ranking_runs.result_page_number is
  'One-based Google results page where the tracked result appeared.';
comment on column public.ranking_runs.result_position_on_page is
  'One-based organic result position within the Google results page.';
