package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"

	"real-time-chat/internal/app"
	"real-time-chat/internal/auth"
	"real-time-chat/internal/user"
	"real-time-chat/internal/utils"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("warning: .env file not found")
	}

	ctx := context.Background()

	// PostgreSQL

	db, err := app.NewDB(ctx)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer db.Close()

	log.Println("database connected successfully")

	// Password hashing

	bcryptCost, err := strconv.Atoi(os.Getenv("BCRYPT_SALT_ROUNDS"))
	if err != nil {
		log.Fatalf("invalid BCRYPT_SALT_ROUNDS: %v", err)
	}

	passwordHasher := utils.NewPasswordHasher(bcryptCost)

	// User

	userRepository := user.NewRepository(db)

	userService := user.NewService(
		userRepository,
		passwordHasher,
	)

	log.Println("user service initialized")

	// JWT

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET is required")
	}

	jwtTTL, err := parseDuration(os.Getenv("JWT_EXPIRES_IN"))
	if err != nil {
		log.Fatalf("invalid JWT_EXPIRES_IN: %v", err)
	}

	jwtTokenKey := os.Getenv("JWT_TOKEN_KEY")
	if jwtTokenKey == "" {
		log.Fatal("JWT_TOKEN_KEY is required")
	}

	jwtManager := auth.NewJWTManager(
		jwtSecret,
		jwtTTL,
		jwtTokenKey,
	)

	// Auth

	authService := auth.NewService(
		userService,
		passwordHasher,
		jwtManager,
	)
	validator := utils.NewValidator()

	log.Println("auth service initialized")
	log.Printf("jwt ttl: %s", jwtTTL)

	// HTTP

	authHandler := auth.NewHandler(authService, validator)
	userHandler := user.NewHandler(
		userService,
		validator,
	)
	mux := http.NewServeMux()

	mux.HandleFunc("POST /auth/register", authHandler.Register)
	mux.HandleFunc("POST /auth/login", authHandler.Login)
	mux.HandleFunc("POST /auth/logout", authHandler.Logout)

	mux.Handle(
		"GET /users/me",
		authService.RequireAuth(
			http.HandlerFunc(userHandler.Me),
		),
	)

	mux.Handle(
		"GET /users/{id}",
		authService.RequireAuth(
			http.HandlerFunc(userHandler.GetUser),
		),
	)

	mux.Handle(
		"GET /users",
		authService.RequireAuth(
			http.HandlerFunc(userHandler.GetUsers),
		),
	)

	server := &http.Server{
		Addr:    ":" + os.Getenv("PORT"),
		Handler: mux,
	}

	log.Printf("server started on %s", server.Addr)

	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}

func parseDuration(value string) (time.Duration, error) {
	value = strings.TrimSpace(value)

	if value == "" {
		return 0, fmt.Errorf("duration is empty")
	}

	if strings.HasSuffix(value, "d") {
		daysString := strings.TrimSuffix(value, "d")

		days, err := strconv.Atoi(daysString)
		if err != nil {
			return 0, fmt.Errorf("invalid days duration: %w", err)
		}

		if days <= 0 {
			return 0, fmt.Errorf("duration must be greater than zero")
		}

		return time.Duration(days) * 24 * time.Hour, nil
	}

	duration, err := time.ParseDuration(value)
	if err != nil {
		return 0, fmt.Errorf("parse duration: %w", err)
	}

	if duration <= 0 {
		return 0, fmt.Errorf("duration must be greater than zero")
	}

	return duration, nil
}
