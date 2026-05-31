.PHONY: start stop restart logs clean \
        test test-frontend test-backend \
        build dev help

# ── Docker (full stack) ────────────────────────────────────────────────────────

## start     — build images and start all services (DB + backend + frontend)
start:
	docker compose up --build

## stop      — stop all containers (data kept)
stop:
	docker compose down

## restart   — rebuild and restart everything
restart:
	docker compose down
	docker compose up --build

## logs      — follow logs for all services
logs:
	docker compose logs -f

## clean     — stop containers and delete all data (DB volume wiped)
clean:
	docker compose down -v

# ── Tests ─────────────────────────────────────────────────────────────────────

## test      — run frontend + backend tests
test: test-frontend test-backend

## test-frontend  — run Vitest (131 tests, no server needed)
test-frontend:
	npm test

## test-backend   — run JUnit / MockMvc tests (no Postgres needed)
test-backend:
	cd backend && ./mvnw test -q

# ── Local dev (without Docker) ────────────────────────────────────────────────

## build     — install npm dependencies
build:
	npm install

## dev       — start Vite dev server (requires backend already running)
dev:
	npm run dev

# ── Help ──────────────────────────────────────────────────────────────────────

## help      — list all available commands
help:
	@echo ""
	@echo "Usage: make <command>"
	@echo ""
	@grep -E '^##' Makefile | sed 's/## /  /'
	@echo ""
