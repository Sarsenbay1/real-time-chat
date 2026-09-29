package auth

import (
	"encoding/json"
	"net/http"
	"real-time-chat/internal/utils"
)

type Handler struct {
	authService *AuthService
	validator   *utils.Validator
}

func NewHandler(authService *AuthService, validator *utils.Validator) *Handler {
	return &Handler{
		authService: authService,
		validator:   validator,
	}
}

type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Username string `json:"username" validate:"required,min=3,max=30"`
	Password string `json:"password" validate:"required,min=8"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password"`
}

type UserResponse struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Username string `json:"username"`
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var request RegisterRequest

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(
			w,
			"invalid request body",
			http.StatusBadRequest,
		)
		return
	}

	if err := h.validator.Struct(request); err != nil {
		http.Error(
			w,
			"invalid request data",
			http.StatusBadRequest,
		)
		return
	}

	result, err := h.authService.Register(
		r.Context(),
		request.Email,
		request.Username,
		request.Password,
	)
	if err != nil {
		http.Error(
			w,
			"failed to register user",
			http.StatusInternalServerError,
		)
		return
	}

	h.setAuthCookie(w, result.Token, 0)

	response := UserResponse{
		ID:       result.User.ID.String(),
		Email:    result.User.Email,
		Username: result.User.Username,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	if err := json.NewEncoder(w).Encode(response); err != nil {
		return
	}
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var request LoginRequest

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(
			w,
			"invalid request body",
			http.StatusBadRequest,
		)
		return
	}

	if err := h.validator.Struct(request); err != nil {
		http.Error(
			w,
			"invalid request data",
			http.StatusBadRequest,
		)
		return
	}

	result, err := h.authService.Login(
		r.Context(),
		request.Email,
		request.Password,
	)
	if err != nil {
		http.Error(
			w,
			"invalid email or password",
			http.StatusUnauthorized,
		)
		return
	}

	h.setAuthCookie(w, result.Token, 0)

	response := UserResponse{
		ID:       result.User.ID.String(),
		Email:    result.User.Email,
		Username: result.User.Username,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(response); err != nil {
		return
	}
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	h.setAuthCookie(w, "", -1)

	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) setAuthCookie(
	w http.ResponseWriter,
	token string,
	maxAge int,
) {
	http.SetCookie(w, &http.Cookie{
		Name:     h.authService.jwtManager.tokenKey,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   maxAge,
	})
}
