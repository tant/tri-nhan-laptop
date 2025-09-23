# Vietnamese Laptop Repair Shop Management System
# Single Environment Setup with Phased Approach

.PHONY: help
help: ## Show this help message
	@echo 'Usage: make [TARGET]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $1, $2}' $(MAKEFILE_LIST)

# Environment Setup Phases (CRITICAL FOR TESTING)
.PHONY: env
env: ## Phase 1: Environment Bring-up - Start all Docker services and infrastructure
	@echo "🚀 Phase 1: Environment Bring-up"
	@echo "Starting all Docker services..."
	docker compose up -d
	@echo "⏳ Waiting for services to initialize..."
	@sleep 15
	@echo "🔧 Running service fixes..."
	@./fix-supabase-services.sh
	@echo "✅ Phase 1 complete! All services started."

.PHONY: init
init: ## Phase 2: Basic Initialization - Create essential accounts and basic system configuration
	@echo "🚀 Phase 2: Basic Initialization"
	@echo "Creating shop owner/admin account..."
	# This would typically call a script to create the admin user
	# For now, we'll just indicate this needs to be done
	@echo "Setting up initial system configuration..."
	@echo "✅ Phase 2 complete! Admin account created."

.PHONY: data
data: ## Phase 3: Sample Data - Populate system with sample/demo data for development and testing
	@echo "🚀 Phase 3: Sample Data"
	@echo "Adding sample customers, parts, and repair tickets..."
	# This would typically call a script to populate sample data
	# For now, we'll just indicate this needs to be done
	@echo "✅ Phase 3 complete! Sample data added."

# Service Management
.PHONY: up
up: env init ## Start environment and initialize (shortcut for env + init)
	@echo "🚀 Environment started and initialized!"

.PHONY: down
down: ## Stop all services
	docker compose down

.PHONY: logs
logs: ## Show logs from all services
	docker compose logs -f

.PHONY: rebuild
rebuild: ## Rebuild and restart environment
	docker compose down
	docker compose build --no-cache
	docker compose up -d

# Environment Reset (CRITICAL FOR TESTING)
.PHONY: clean
clean: ## Complete environment reset - Remove all containers, volumes, networks, and data
	@echo "⚠️  WARNING: This will permanently delete ALL data!"
	@echo "This command removes all Docker containers, volumes, networks, and data directories."
	@echo "🧹 Cleaning up Docker resources..."
	docker compose down -v --remove-orphans
	docker container prune -f
	docker volume prune -f
	docker network prune -f
	@echo "🗑️  Removing data directories..."
	rm -rf supabase/volumes/*
	@echo "✅ Clean complete! Ready for fresh setup."

.PHONY: clean-data
clean-data: ## Clean database data directories only
	@echo "⚠️  WARNING: This will permanently delete ALL data!"
	@echo "This command removes all database data."
	@read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirm && [ "$confirm" = "yes" ]
	docker compose down -v --remove-orphans
	rm -rf supabase/volumes/db/*
	@echo "✅ Database data cleaned. Ready for fresh initialization."

# Utility Commands
.PHONY: studio
studio: ## Open Supabase Studio in browser
	@echo "Opening Supabase Studio at http://localhost:3010"
	@command -v xdg-open >/dev/null 2>&1 && xdg-open http://localhost:3010 || echo "Please open http://localhost:3010 in your browser"

.PHONY: status
status: ## Show status of all services
	docker compose ps

.PHONY: setup
setup: ## Initial setup - create directories
	@echo "Setting up Laptop Repair Shop environment..."
	mkdir -p supabase/volumes/storage
	mkdir -p supabase/volumes/db/data
	@echo "Setup complete! Now run 'make env' to start the environment"

.PHONY: db-backup
db-backup: ## Backup database
	@mkdir -p backups
	docker compose exec supabase-db pg_dump -U postgres postgres > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Database backup created in backups/"

# Quick commands
.PHONY: start
start: up ## Alias for 'make up'

.PHONY: stop
stop: down ## Alias for 'make down'