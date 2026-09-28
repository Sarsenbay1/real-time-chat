package user

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type UserRepository interface {
	FindByEmail(ctx context.Context, email string) (*User, error)
	FindByID(ctx context.Context, id uuid.UUID) (*User, error)
	Create(ctx context.Context, user *User) error
}

type PasswordHasher interface {
	Hash(password string) (string, error)
	Compare(password, hash string) error
}

type Service struct {
	repo   UserRepository
	hasher PasswordHasher
}

func NewService(repo UserRepository, hasher PasswordHasher) *Service {
	return &Service{
		repo:   repo,
		hasher: hasher,
	}
}

var ErrUserNotFound = errors.New("user not found")

func (s *Service) FindByEmail(ctx context.Context, email string) (*User, error) {
	user, err := s.repo.FindByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrUserNotFound
		}

		return nil, err
	}

	return user, nil
}

func (s *Service) FindByID(
	ctx context.Context,
	id uuid.UUID,
) (*User, error) {
	user, err := s.repo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrUserNotFound
		}

		return nil, err
	}

	return user, nil
}

func (s *Service) Create(
	ctx context.Context,
	email string,
	username string,
	password string,
) (*User, error) {
	passwordHash, err := s.hasher.Hash(password)
	if err != nil {
		return nil, err
	}

	user := &User{
		Email:        email,
		Username:     username,
		PasswordHash: passwordHash,
	}

	if err := s.repo.Create(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}
