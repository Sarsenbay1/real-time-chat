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
	"github.com/redis/go-redis/v9"

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

	// Redis

	redisPort, err := strconv.Atoi(os.Getenv("REDIS_PORT"))
	if err != nil {
		log.Fatalf("invalid REDIS_PORT: %v", err)
	}

	redisClient := redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf(
			"%s:%d",
			os.Getenv("REDIS_HOST"),
			redisPort,
		),
	})

	defer redisClient.Close()

	if err := redisClient.Ping(ctx).Err(); err != nil {
		log.Fatalf("failed to connect to redis: %v", err)
	}

	log.Println("redis connected successfully")

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

	jwtManager := auth.NewJWTManager(
		jwtSecret,
		jwtTTL,
	)

	// Session store

	tokenKey := os.Getenv("JWT_TOKEN_KEY")
	if tokenKey == "" {
		log.Fatal("JWT_TOKEN_KEY is required")
	}

	sessionStore := auth.NewRedisSessionStore(
		redisClient,
		tokenKey,
	)

	// Auth

	authService := auth.NewService(
		userService,
		passwordHasher,
		sessionStore,
		jwtManager,
	)

	log.Println("auth service initialized")
	log.Printf("jwt ttl: %s", jwtTTL)

	authHandler := auth.NewHandler(authService)
	mux := http.NewServeMux()

	mux.HandleFunc("POST /auth/register", authHandler.Register)
	mux.HandleFunc("POST /auth/login", authHandler.Login)
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
