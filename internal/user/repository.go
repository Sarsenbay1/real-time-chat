package user

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{
		db: db,
	}
}

func (r *Repository) FindByEmail(ctx context.Context, email string) (*User, error) {
	row := r.db.QueryRow(
		ctx,
		`
			SELECT
				id,
				email,
				username,
				password_hash,
				avatar_id,
				created_at,
				updated_at
			FROM users
			WHERE email = $1
		`,
		email,
	)

	var user User

	err := row.Scan(
		&user.ID,
		&user.Email,
		&user.Username,
		&user.PasswordHash,
		&user.AvatarID,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *Repository) Create(ctx context.Context, user *User) error {
	row := r.db.QueryRow(
		ctx,
		`
			INSERT INTO users (
				email,
				username,
				password_hash,
				avatar_id
			)
			VALUES ($1, $2, $3, $4)
			RETURNING
				id,
				created_at,
				updated_at
		`,
		user.Email,
		user.Username,
		user.PasswordHash,
		user.AvatarID,
	)

	err := row.Scan(
		&user.ID,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		return err
	}

	return nil
}
