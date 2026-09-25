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
