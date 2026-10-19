.PHONY: help dev staging prod dev-build staging-build prod-build \
	logs logs-wp logs-frontend logs-nginx down clean \
	backup-db restore-db sync-staging init-ssl install-backup-cron \
	shell-wp shell-db shell-frontend

# Environment for utility targets (logs/down/clean/shell-*). Override per run,
# e.g. `make logs ENV=prod` or `make down ENV=staging`. Defaults to dev so a
# bare `make down` doesn't silently target a base-only project (missing
# -f/--env-file), which emits "variable not set" warnings and can miss the stack.
ENV ?= dev
COMPOSE = docker compose -f docker-compose.yml -f docker-compose.$(ENV).yml --env-file .env.$(ENV)

# Default target - show help
help:
	@echo "=========================================="
	@echo "WordPress Headless CMS - Docker Commands"
	@echo "=========================================="
	@echo ""
	@echo "Environment Management:"
	@echo "  make dev              - Start development environment"
	@echo "  make staging          - Start staging environment"
	@echo "  make prod             - Start production environment"
	@echo ""
	@echo "Build Commands:"
	@echo "  make dev-build        - Build and start development"
	@echo "  make staging-build    - Build and start staging"
	@echo "  make prod-build       - Build and start production"
	@echo ""
	@echo "Utility Commands (scope with ENV=dev|staging|prod, default dev):"
	@echo "  make logs [ENV=]      - Show logs (all services)"
	@echo "  make logs-wp [ENV=]   - Show WordPress logs"
	@echo "  make logs-frontend    - Show frontend logs"
	@echo "  make down [ENV=]      - Stop all services"
	@echo "  make clean [ENV=]     - Stop and remove volumes"
	@echo ""
	@echo "Database Management:"
	@echo "  make backup-db ENV=dev    - Backup database (ENV: dev/staging/prod)"
	@echo "  make restore-db ENV=dev FILE=path/to/backup.sql.gz"
	@echo "  make sync-staging         - Sync production to staging"
	@echo ""
	@echo "Production Setup:"
	@echo "  make init-ssl         - Initialize SSL certificates (run once on VPS)"
	@echo "  make install-backup-cron - Install daily DB backup cron (run on VPS)"
	@echo ""

# Development environment
dev:
	@echo "Starting development environment..."
	docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev up -d

dev-build:
	@echo "Building and starting development environment..."
	docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev up --build

# Staging environment
staging:
	@echo "Starting staging environment..."
	docker compose -f docker-compose.yml -f docker-compose.staging.yml --env-file .env.staging up -d

staging-build:
	@echo "Building and starting staging environment..."
	docker compose -f docker-compose.yml -f docker-compose.staging.yml --env-file .env.staging up -d --build

# Production environment
prod:
	@echo "Starting production environment..."
	docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d

prod-build:
	@echo "Building and starting production environment..."
	docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d --build

# Logs (scope with ENV=dev|staging|prod, default dev)
logs:
	$(COMPOSE) logs -f

logs-wp:
	$(COMPOSE) logs -f wordpress

logs-frontend:
	$(COMPOSE) logs -f frontend

logs-nginx:
	$(COMPOSE) logs -f nginx

# Stop services (scope with ENV=dev|staging|prod, default dev)
down:
	@echo "Stopping all services for ENV=$(ENV)..."
	$(COMPOSE) down

# Clean everything (including volumes) (scope with ENV=dev|staging|prod)
clean:
	@echo "WARNING: This will delete all data in Docker volumes for ENV=$(ENV)!"
	@read -p "Are you sure? (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		$(COMPOSE) down -v; \
		echo "✓ Cleaned up"; \
	else \
		echo "Cancelled"; \
	fi

# Database backup
backup-db:
	@if [ -z "$(ENV)" ]; then \
		echo "Error: ENV parameter required. Usage: make backup-db ENV=dev"; \
		exit 1; \
	fi
	@bash scripts/backup-db.sh $(ENV)

# Database restore
restore-db:
	@if [ -z "$(ENV)" ] || [ -z "$(FILE)" ]; then \
		echo "Error: ENV and FILE parameters required."; \
		echo "Usage: make restore-db ENV=staging FILE=./backups/backup.sql.gz"; \
		exit 1; \
	fi
	@bash scripts/restore-db.sh $(ENV) $(FILE)

# Sync production to staging
sync-staging:
	@echo "Syncing production database to staging..."
	@bash scripts/sync-prod-to-staging.sh

# Initialize SSL certificates (production only, run once)
init-ssl:
	@echo "Initializing SSL certificates..."
	@bash scripts/init-ssl.sh

# Install daily DB backup cron job (run on the VPS; ENV defaults to prod)
install-backup-cron:
	@bash scripts/install-backup-cron.sh $(if $(filter command line,$(origin ENV)),$(ENV),prod)

# Shell access (scope with ENV=dev|staging|prod, default dev)
shell-wp:
	$(COMPOSE) exec wordpress bash

shell-db:
	$(COMPOSE) exec database bash

shell-frontend:
	$(COMPOSE) exec frontend sh
