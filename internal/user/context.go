package user

import (
	"context"

	"github.com/google/uuid"
)

type contextKey string

const userIDKey contextKey = "user_id"

func WithUserID(
	ctx context.Context,
	userID uuid.UUID,
) context.Context {
	return context.WithValue(
		ctx,
		userIDKey,
		userID,
	)
}

func UserIDFromContext(
	ctx context.Context,
) (uuid.UUID, bool) {
	userID, ok := ctx.Value(userIDKey).(uuid.UUID)

	return userID, ok
}
