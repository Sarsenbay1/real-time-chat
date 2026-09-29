package user

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/google/uuid"
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

	h.getUser(w, r, userID)
}

func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
	userID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		http.Error(
			w,
			"invalid user id",
			http.StatusBadRequest,
		)
		return
	}

	h.getUser(w, r, userID)
}
func (h *Handler) getUser(
	w http.ResponseWriter,
	r *http.Request,
	userID uuid.UUID,
) {
	user, err := h.userService.FindByID(
		r.Context(),
		userID,
	)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
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
