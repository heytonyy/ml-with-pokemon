# Makefile for Vite React TypeScript Docker App

# Variables
APP_NAME := my-vite-app
DEV_SERVICE := app-dev
PROD_SERVICE := app-prod
DEV_PORT := 5173
PROD_PORT := 80

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Default target
.DEFAULT_GOAL := help

##@ Help
help: ## Display this help message
	@echo "$(GREEN)Available commands:$(NC)"
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development
dev: ## Start development server with hot reload
	@echo "$(GREEN)Starting development server...$(NC)"
	docker-compose --profile dev up --build

dev-detached: ## Start development server in detached mode
	@echo "$(GREEN)Starting development server in background...$(NC)"
	docker-compose --profile dev up --build -d

dev-logs: ## Show development server logs
	docker-compose logs -f $(DEV_SERVICE)

dev-shell: ## Access development container shell
	docker-compose exec $(DEV_SERVICE) sh

dev-stop: ## Stop development server
	@echo "$(YELLOW)Stopping development server...$(NC)"
	docker-compose --profile dev down

dev-restart: dev-stop dev ## Restart development server

##@ Production
build: ## Build production image
	@echo "$(GREEN)Building production image...$(NC)"
	docker build -t $(APP_NAME) .

prod: build ## Build and run production server
	@echo "$(GREEN)Starting production server...$(NC)"
	docker-compose --profile prod up --build

prod-detached: build ## Build and run production server in detached mode
	@echo "$(GREEN)Starting production server in background...$(NC)"
	docker-compose --profile prod up --build -d

prod-logs: ## Show production server logs
	docker-compose logs -f $(PROD_SERVICE)

prod-shell: ## Access production container shell
	docker-compose exec $(PROD_SERVICE) sh

prod-stop: ## Stop production server
	@echo "$(YELLOW)Stopping production server...$(NC)"
	docker-compose --profile prod down

prod-restart: prod-stop prod ## Restart production server

##@ Docker Management
images: ## List Docker images
	docker images | grep -E "($(APP_NAME)|node|nginx)"

containers: ## List running containers
	docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

clean: ## Remove stopped containers and unused images
	@echo "$(YELLOW)Cleaning up Docker resources...$(NC)"
	docker-compose --profile dev down --remove-orphans
	docker-compose --profile prod down --remove-orphans
	docker system prune -f

clean-all: ## Remove all containers, images, and volumes (WARNING: destructive)
	@echo "$(RED)WARNING: This will remove ALL containers, images, and volumes!$(NC)"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	docker-compose --profile dev down --volumes --remove-orphans
	docker-compose --profile prod down --volumes --remove-orphans
	docker rmi $(APP_NAME) 2>/dev/null || true
	docker system prune -af --volumes

rebuild: clean build ## Clean and rebuild production image

##@ Testing & Quality
test: ## Run tests in development container
	docker-compose --profile dev exec $(DEV_SERVICE) npm test

lint: ## Run linter in development container
	docker-compose --profile dev exec $(DEV_SERVICE) npm run lint

type-check: ## Run TypeScript type checking
	docker-compose --profile dev exec $(DEV_SERVICE) npm run type-check

format: ## Format code using prettier
	docker-compose --profile dev exec $(DEV_SERVICE) npm run format

##@ Utilities
status: ## Show status of all services
	@echo "$(GREEN)Service Status:$(NC)"
	@docker-compose ps
	@echo "\n$(GREEN)Port Information:$(NC)"
	@echo "Development: http://localhost:$(DEV_PORT)"
	@echo "Production:  http://localhost:$(PROD_PORT)"

install: ## Install dependencies (run when package.json changes)
	@echo "$(GREEN)Installing dependencies...$(NC)"
	docker-compose --profile dev run --rm $(DEV_SERVICE) npm install

update: ## Update dependencies
	@echo "$(GREEN)Updating dependencies...$(NC)"
	docker-compose --profile dev run --rm $(DEV_SERVICE) npm update

deps: ## Show dependency information
	docker-compose --profile dev run --rm $(DEV_SERVICE) npm list

outdated: ## Check for outdated dependencies
	docker-compose --profile dev run --rm $(DEV_SERVICE) npm outdated

##@ Quick Actions
up: dev ## Quick start development (alias for dev)

down: ## Stop all services
	@echo "$(YELLOW)Stopping all services...$(NC)"
	docker-compose --profile dev down
	docker-compose --profile prod down

restart: down dev ## Restart all services

logs: ## Show logs for all services
	docker-compose logs -f

##@ Advanced
multi-build: ## Build for multiple architectures (useful for deployment)
	@echo "$(GREEN)Building multi-architecture image...$(NC)"
	docker buildx build --platform linux/amd64,linux/arm64 -t $(APP_NAME) .

export: ## Export production image as tar file
	@echo "$(GREEN)Exporting production image...$(NC)"
	docker save $(APP_NAME) | gzip > $(APP_NAME).tar.gz
	@echo "Image exported as $(APP_NAME).tar.gz"

import: ## Import production image from tar file
	@echo "$(GREEN)Importing production image...$(NC)"
	docker load < $(APP_NAME).tar.gz

health-check: ## Check if services are healthy
	@echo "$(GREEN)Health Check:$(NC)"
	@curl -f http://localhost:$(DEV_PORT) > /dev/null 2>&1 && echo "✓ Development server is running" || echo "✗ Development server is not responding"
	@curl -f http://localhost:$(PROD_PORT) > /dev/null 2>&1 && echo "✓ Production server is running" || echo "✗ Production server is not responding"

# Phony targets
.PHONY: help dev dev-detached dev-logs dev-shell dev-stop dev-restart \
        build prod prod-detached prod-logs prod-shell prod-stop prod-restart \
        images containers clean clean-all rebuild \
        test lint type-check format \
        status install update deps outdated \
        up down restart logs \
        multi-build export import health-check