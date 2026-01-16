.PHONY: help dev staging prod dev-build staging-build prod-build logs down clean backup-db restore-db sync-staging init-ssl

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
	@echo "Utility Commands:"
	@echo "  make logs             - Show logs (all services)"
	@echo "  make logs-wp          - Show WordPress logs"
	@echo "  make logs-frontend    - Show frontend logs"
	@echo "  make down             - Stop all services"
	@echo "  make clean            - Stop and remove volumes"
	@echo ""
	@echo "Database Management:"
	@echo "  make backup-db ENV=dev    - Backup database (ENV: dev/staging/prod)"
	@echo "  make restore-db ENV=dev FILE=path/to/backup.sql.gz"
	@echo "  make sync-staging         - Sync production to staging"
	@echo ""
	@echo "Production Setup:"
	@echo "  make init-ssl         - Initialize SSL certificates (run once on VPS)"
	@echo ""

# Development environment
dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev up

dev-build:
	@echo "Building and starting development environment..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev up --build

# Staging environment
staging:
	@echo "Starting staging environment..."
	docker-compose -f docker-compose.yml -f docker-compose.staging.yml --env-file .env.staging up -d

staging-build:
	@echo "Building and starting staging environment..."
	docker-compose -f docker-compose.yml -f docker-compose.staging.yml --env-file .env.staging up -d --build

# Production environment
prod:
	@echo "Starting production environment..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d

prod-build:
	@echo "Building and starting production environment..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d --build

# Logs
logs:
	docker-compose logs -f

logs-wp:
	docker-compose logs -f wordpress

logs-frontend:
	docker-compose logs -f frontend

logs-nginx:
	docker-compose logs -f nginx

# Stop services
down:
	@echo "Stopping all services..."
	docker-compose down

# Clean everything (including volumes)
clean:
	@echo "WARNING: This will delete all data in Docker volumes!"
	@read -p "Are you sure? (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		docker-compose down -v; \
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

# Shell access
shell-wp:
	docker-compose exec wordpress bash

shell-db:
	docker-compose exec database bash

shell-frontend:
	docker-compose exec frontend sh
