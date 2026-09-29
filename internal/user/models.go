package user

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID
	Email        string
	Username     string
	PasswordHash string
	AvatarID     *uuid.UUID
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type UserListParams struct {
	Page      int `validate:"min=1"`
	Limit     int `validate:"min=1,max=100"`
	Search    string
	SortBy    string `validate:"oneof=username email created_at"`
	SortOrder string `validate:"oneof=asc desc"`
}
