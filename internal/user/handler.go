package user

import (
	"encoding/json"
	"errors"
	"net/http"
	"real-time-chat/internal/utils"

	"github.com/google/uuid"
)

type Handler struct {
	userService *Service
	validator   *utils.Validator
}

func NewHandler(
	userService *Service,
	validator *utils.Validator,
) *Handler {
	return &Handler{
		userService: userService,
		validator:   validator,
	}
}

type UserResponse struct {
	ID       string     `json:"id"`
	Email    string     `json:"email"`
	Username string     `json:"username"`
	AvatarID *uuid.UUID `json:"avatar_id"`
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
		AvatarID: user.AvatarID,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(response); err != nil {
		return
	}
}

type UserListResponse struct {
	Items      []UserResponse `json:"items"`
	Pagination Pagination     `json:"pagination"`
}

type Pagination struct {
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}

func (h *Handler) GetUsers(w http.ResponseWriter, r *http.Request) {
	params, err := ParseUserListQuery(r)
	if err != nil {
		http.Error(
			w,
			err.Error(),
			http.StatusBadRequest,
		)
		return
	}

	if err := h.validator.Struct(params); err != nil {
		http.Error(
			w,
			"invalid query parameters",
			http.StatusBadRequest,
		)
		return
	}

	users, total, err := h.userService.FindAll(
		r.Context(),
		params,
	)
	if err != nil {
		http.Error(
			w,
			"failed to get users",
			http.StatusInternalServerError,
		)
		return
	}

	items := make([]UserResponse, 0, len(users))

	for _, user := range users {
		items = append(items, UserResponse{
			ID:       user.ID.String(),
			Email:    user.Email,
			Username: user.Username,
			AvatarID: user.AvatarID,
		})
	}

	totalPages := 0
	if total > 0 {
		totalPages = (total + params.Limit - 1) / params.Limit
	}

	response := UserListResponse{
		Items: items,
		Pagination: Pagination{
			Page:       params.Page,
			Limit:      params.Limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(response); err != nil {
		return
	}
}
