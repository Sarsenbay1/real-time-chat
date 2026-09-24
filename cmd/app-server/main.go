package main

import (
	"context"
	"log"

	"github.com/joho/godotenv"

	"real-time-chat/internal/app"
)

func main() {
	// Загружаем переменные из .env
	if err := godotenv.Load(); err != nil {
		log.Println("warning: .env file not found")
	}

	ctx := context.Background()

	// Подключаемся к PostgreSQL
	db, err := app.NewDB(ctx)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer db.Close()

	log.Println("database connected successfully")

}
