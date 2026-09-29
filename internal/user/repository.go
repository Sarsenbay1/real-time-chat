package user

import (
	"context"
	"fmt"

	"github.com/google/uuid"
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

func (r *Repository) FindByID(
	ctx context.Context,
	id uuid.UUID,
) (*User, error) {
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
			WHERE id = $1
		`,
		id,
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

func (r *Repository) FindAll(
	ctx context.Context,
	params UserListParams,
) ([]*User, int, error) {
	fmt.Println(params)
	offset := (params.Page - 1) * params.Limit

	sortColumn := "created_at"
	switch params.SortBy {
	case "username":
		sortColumn = "username"
	case "email":
		sortColumn = "email"
	case "created_at":
		sortColumn = "created_at"
	}

	sortOrder := "DESC"
	if params.SortOrder == "asc" {
		sortOrder = "ASC"
	}

	fmt.Println(sortOrder)
	fmt.Println(sortColumn)

	search := "%" + params.Search + "%"

	countQuery := `
		SELECT COUNT(*)
		FROM users
		WHERE username ILIKE $1
		   OR email ILIKE $1
	`

	var total int

	err := r.db.QueryRow(
		ctx,
		countQuery,
		search,
	).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	query := fmt.Sprintf(`
		SELECT
			id,
			email,
			username,
			password_hash,
			avatar_id,
			created_at,
			updated_at
		FROM users
		WHERE username ILIKE $1
		   OR email ILIKE $1
		ORDER BY %s %s
		LIMIT $2
		OFFSET $3
	`, sortColumn, sortOrder)

	rows, err := r.db.Query(
		ctx,
		query,
		search,
		params.Limit,
		offset,
	)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	users := make([]*User, 0, params.Limit)

	for rows.Next() {
		var user User

		err := rows.Scan(
			&user.ID,
			&user.Email,
			&user.Username,
			&user.PasswordHash,
			&user.AvatarID,
			&user.CreatedAt,
			&user.UpdatedAt,
		)
		if err != nil {
			return nil, 0, err
		}

		users = append(users, &user)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return users, total, nil
}
