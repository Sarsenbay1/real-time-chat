# 1. Подтягиваем переменные из .env файла, если он существует
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

# Константы путей
MIGRATIONS_DIR=migrations
GOOSE_BIN=$(HOME)/go/bin/goose

# Запуск бэкенда
run:
	go run ./cmd/app-server

# Запуск базы данных в Docker
db-up:
	docker compose up -d

# Создание новой миграции (например: make migrate-create name=add_users)
migrate-create:
	$(GOOSE_BIN) -dir $(MIGRATIONS_DIR) create $(name) sql

# Накатить все миграции (Динамическая строка подключения)
migrate-up:
	$(GOOSE_BIN) -dir $(MIGRATIONS_DIR) postgres "postgres://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@localhost:$(POSTGRES_PORT)/$(POSTGRES_DB)?sslmode=disable" up

# Откатить миграцию
migrate-down:
	$(GOOSE_BIN) -dir $(MIGRATIONS_DIR) postgres "postgres://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@localhost:$(POSTGRES_PORT)/$(POSTGRES_DB)?sslmode=disable" down

# Проверить статус миграций
migrate-status:
	$(GOOSE_BIN) -dir $(MIGRATIONS_DIR) postgres "postgres://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@localhost:$(POSTGRES_PORT)/$(POSTGRES_DB)?sslmode=disable" status
