package user

import (
	"encoding/json"
	"net/http"
)

type Handler struct {
	userService *Service
}

func NewHandler(userService *Service) *Handler {
	return &Handler{
		userService: userService,
	}
}

type UserResponse struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Username string `json:"username"`
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	userID, ok := UserIDFromContext(r.Context())
	if !ok {
		http.Error(
			w,
			"user not authenticated",
			http.StatusUnauthorized,
		)
		return
	}

	user, err := h.userService.FindByID(
		r.Context(),
		userID,
	)
	if err != nil {
		if err == ErrUserNotFound {
			http.Error(
				w,
				"user not found",
				http.StatusNotFound,
			)
			return
		}

		http.Error(
			w,
			"failed to get user",
			http.StatusInternalServerError,
		)
		return
	}

	response := UserResponse{
		ID:       user.ID.String(),
		Email:    user.Email,
		Username: user.Username,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(response); err != nil {
		return
	}
}
