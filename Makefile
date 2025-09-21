# Laptop Repair Shop - Docker Compose Commands

.PHONY: help
help: ## Show this help message
	@echo 'Usage: make [TARGET]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Production Commands
.PHONY: up
up: ## Start production environment (React + Supabase)
	docker compose --env-file .env up -d

.PHONY: down
down: ## Stop all services
	docker compose --env-file .env down

.PHONY: logs
logs: ## Show logs from all services
	docker compose --env-file .env logs -f

.PHONY: rebuild
rebuild: ## Rebuild and restart production environment
	docker compose --env-file .env down
	docker compose --env-file .env build --no-cache
	docker compose --env-file .env up -d

# Development Commands
.PHONY: dev
dev: ## Start development environment (React dev server + Supabase)
	docker compose -f docker-compose.dev.yml --env-file .env up -d || true
	@echo "⏳ Waiting for services to initialize..."
	@sleep 10
	@echo "🔧 Running service fixes..."
	@./fix-supabase-services.sh

.PHONY: dev-down
dev-down: ## Stop development environment
	docker compose -f docker-compose.dev.yml --env-file .env down

.PHONY: backend-only
backend-only: ## Start only Supabase services (for local React development)
	docker compose -f docker-compose.dev.yml --env-file .env up -d db-dev auth-dev rest-dev kong-dev storage-dev studio-dev meta-dev realtime-dev functions-dev imgproxy-dev || true
	@echo "⏳ Waiting for services to initialize..."
	@sleep 10
	@echo "🔧 Running service fixes..."
	@./fix-supabase-services.sh
	@echo ""
	@echo "🎯 Supabase services running! Now run 'pnpm dev' for local React development"
	@echo "🌐 React will be available at: http://localhost:5173"

.PHONY: dev-logs
dev-logs: ## Show development logs
	docker compose -f docker-compose.dev.yml --env-file .env logs -f

.PHONY: fix-services
fix-services: ## Fix common Supabase service issues
	@./fix-supabase-services.sh

# Database Commands
.PHONY: db-reset
db-reset: ## Reset database (WARNING: This will delete all data!)
	docker compose --env-file .env down -v
	docker compose -f docker-compose.dev.yml --env-file .env down -v
	@echo "Database reset complete! Run 'make dev' or 'make up' to start fresh."

.PHONY: db-backup
db-backup: ## Backup database (production)
	@mkdir -p backups
	docker compose --env-file .env exec db pg_dump -U postgres postgres > backups/backup_prod_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Production database backup created in backups/"

.PHONY: db-backup-dev
db-backup-dev: ## Backup development database
	@mkdir -p backups
	docker compose -f docker-compose.dev.yml --env-file .env exec db-dev pg_dump -U postgres postgres > backups/backup_dev_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Development database backup created in backups/"

# Supabase Studio
.PHONY: studio
studio: ## Open Supabase Studio in browser
	@echo "Opening Supabase Studio at http://localhost:3010"
	@command -v xdg-open >/dev/null 2>&1 && xdg-open http://localhost:3010 || echo "Please open http://localhost:3010 in your browser"

# Utility Commands
.PHONY: clean
clean: ## Clean up Docker resources (keeps images)
	docker compose --env-file .env down -v --remove-orphans
	docker compose -f docker-compose.dev.yml --env-file .env down -v --remove-orphans
	docker container prune -f
	docker volume prune -f
	docker network prune -f

.PHONY: clean-data
clean-data: ## Clean database data directories (force fresh init)
	docker compose --env-file .env down -v --remove-orphans
	docker compose -f docker-compose.dev.yml --env-file .env down -v --remove-orphans
	docker run --rm -v "$$(pwd)/supabase/volumes/db:/data" alpine:latest sh -c "rm -rf /data/data /data/data-dev && mkdir -p /data/data /data/data-dev && chown -R 1000:1000 /data/data /data/data-dev"
	@echo "Database data cleaned. Ready for fresh initialization."

.PHONY: fix-permissions
fix-permissions: ## Fix ownership of database volumes (run after containers create files)
	docker run --rm -v "$$(pwd)/supabase/volumes/db:/data" alpine:latest chown -R 1000:1000 /data/data /data/data-dev
	@echo "Database permissions fixed. Directories can now be deleted without sudo."

.PHONY: status
status: ## Show status of all services (development)
	docker compose -f docker-compose.dev.yml --env-file .env ps

.PHONY: status-prod
status-prod: ## Show status of production services
	docker compose --env-file .env ps


# Environment setup
.PHONY: setup
setup: ## Initial setup - create directories and install dependencies
	@echo "Setting up Laptop Repair Shop environment..."
	mkdir -p supabase/volumes/storage
	mkdir -p supabase/volumes/db/data
	mkdir -p supabase/volumes/db/data-dev
	@echo "Setup complete! Now run 'make dev' to start development environment"


# Quick commands
.PHONY: start
start: dev ## Alias for 'make dev'

.PHONY: stop
stop: dev-down ## Alias for 'make dev-down'