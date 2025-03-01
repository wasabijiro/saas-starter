.PHONY: start-db
start-db:
	supabase start

.PHONY: stop-db
stop-db:
	supabase stop --no-backup

.PHONY: reset-db
reset-db:
	supabase db reset

.PHONY: migration-new
migration-new:
	supabase migration new

.PHONY: pull-db
pull-db:
	supabase db pull

.PHONY: push-db
push-db:
	supabase db push

.PHONY: supabase-status
supabase-status:
	supabase status

.PHONY: list-migration
list-migration:
	supabase migration list
