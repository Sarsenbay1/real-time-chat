package auth

import (
	"context"
	"errors"
	"fmt"
	"time"

	"real-time-chat/internal/user"
	"real-time-chat/internal/utils"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type SessionStore interface {
	Set(ctx context.Context, token string, userID uuid.UUID, ttl time.Duration) error
	Get(ctx context.Context, token string) (uuid.UUID, error)
	Delete(ctx context.Context, token string) error
}

var ErrSessionNotFound = errors.New("session not found")

type RedisSessionStore struct {
	client   *redis.Client
	tokenKey string
}

func NewRedisSessionStore(client *redis.Client, tokenKey string) *RedisSessionStore {
	return &RedisSessionStore{
		client:   client,
		tokenKey: tokenKey,
	}
}

func (s *RedisSessionStore) key(token string) string {
	return s.tokenKey + ":" + token
}

func (s *RedisSessionStore) Set(
	ctx context.Context,
	token string,
	userID uuid.UUID,
	ttl time.Duration,
) error {
	return s.client.Set(
		ctx,
		s.key(token),
		userID.String(),
		ttl,
	).Err()
}

func (s *RedisSessionStore) Get(
	ctx context.Context,
	token string,
) (uuid.UUID, error) {
	value, err := s.client.Get(
		ctx,
		s.key(token),
	).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return uuid.Nil, ErrSessionNotFound
		}

		return uuid.Nil, err
	}

	userID, err := uuid.Parse(value)
	if err != nil {
		return uuid.Nil, fmt.Errorf("parse session user id: %w", err)
	}

	return userID, nil
}

func (s *RedisSessionStore) Delete(
	ctx context.Context,
	token string,
) error {
	return s.client.Del(
		ctx,
		s.key(token),
	).Err()
}

type JWTManager struct {
	secret []byte
	ttl    time.Duration
}

type Claims struct {
	UserID uuid.UUID `json:"user_id"`
	jwt.RegisteredClaims
}

func NewJWTManager(secret string, ttl time.Duration) *JWTManager {
	return &JWTManager{
		secret: []byte(secret),
		ttl:    ttl,
	}
}

func (m *JWTManager) Generate(userID uuid.UUID) (string, error) {
	now := time.Now()

	claims := Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(m.ttl)),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	}

	token := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		claims,
	)

	return token.SignedString(m.secret)
}

func (m *JWTManager) Validate(tokenString string) (uuid.UUID, error) {
	var claims Claims

	token, err := jwt.ParseWithClaims(
		tokenString,
		&claims,
		func(token *jwt.Token) (any, error) {
			if token.Method != jwt.SigningMethodHS256 {
				return nil, fmt.Errorf(
					"unexpected signing method: %v",
					token.Header["alg"],
				)
			}

			return m.secret, nil
		},
	)
	if err != nil {
		return uuid.Nil, err
	}

	if !token.Valid {
		return uuid.Nil, errors.New("invalid token")
	}

	return claims.UserID, nil
}

type AuthService struct {
	userService    *user.Service
	passwordHasher *utils.PasswordHasher
	jwtManager     *JWTManager
}

func NewService(
	userService *user.Service,
	passwordHasher *utils.PasswordHasher,
	sessionStore SessionStore,
	jwtManager *JWTManager,
) *AuthService {
	return &AuthService{
		userService:    userService,
		passwordHasher: passwordHasher,
		jwtManager:     jwtManager,
	}
}

type AuthResult struct {
	Token string
	User  *user.User
}

func (s *AuthService) Register(
	ctx context.Context,
	email string,
	username string,
	password string,
) (*AuthResult, error) {
	newUser, err := s.userService.Create(
		ctx,
		email,
		username,
		password,
	)
	if err != nil {
		return nil, err
	}

	token, err := s.jwtManager.Generate(newUser.ID)
	if err != nil {
		return nil, fmt.Errorf("generate access token: %w", err)
	}

	return &AuthResult{
		Token: token,
		User:  newUser,
	}, nil
}

func (s *AuthService) Login(
	ctx context.Context,
	email string,
	password string,
) (*AuthResult, error) {
	existingUser, err := s.userService.FindByEmail(ctx, email)
	if err != nil {
		return nil, err
	}

	if err := s.passwordHasher.Compare(
		password,
		existingUser.PasswordHash,
	); err != nil {
		return nil, errors.New("invalid email or password")
	}

	token, err := s.jwtManager.Generate(existingUser.ID)
	if err != nil {
		return nil, fmt.Errorf("generate access token: %w", err)
	}

	return &AuthResult{
		Token: token,
		User:  existingUser,
	}, nil
}
