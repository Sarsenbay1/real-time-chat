package auth

import (
	"net/http"

	"real-time-chat/internal/user"
)

func (s *AuthService) RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		cookie, err := r.Cookie(s.jwtManager.tokenKey)

		if err != nil {
			http.Error(
				w,
				"authentication required",
				http.StatusUnauthorized,
			)
			return
		}

		userID, err := s.jwtManager.Validate(cookie.Value)
		if err != nil {
			http.Error(
				w,
				"invalid or expired token",
				http.StatusUnauthorized,
			)
			return
		}

		ctx := user.WithUserID(
			r.Context(),
			userID,
		)

		next.ServeHTTP(
			w,
			r.WithContext(ctx),
		)
	})
}
