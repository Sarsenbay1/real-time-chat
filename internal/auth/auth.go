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
)

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
