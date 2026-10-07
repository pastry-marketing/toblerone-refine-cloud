alter table public.ranking_runs
  add column if not exists result_title text,
  add column if not exists result_domain text,
  add column if not exists result_snippet text,
  add column if not exists result_page_number int,
  add column if not exists result_position_on_page int;