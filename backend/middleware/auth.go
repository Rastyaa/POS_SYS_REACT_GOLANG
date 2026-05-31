package middleware

import (
	"context"
	"net/http"
	"strings"

	"pos-backend/utils"
)

type contextKey string

const (
	UserSubKey      contextKey = "user_sub"
	UsernameKey     contextKey = "username"
	UserRoleKey     contextKey = "user_role"
)

// AuthProtect is a middleware to enforce valid JWT authentication
func AuthProtect(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			utils.WriteJSON(w, http.StatusUnauthorized, false, "Akses ditolak: Token tidak ditemukan!", nil)
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			utils.WriteJSON(w, http.StatusUnauthorized, false, "Akses ditolak: Format token invalid!", nil)
			return
		}

		claims, err := utils.ValidateToken(parts[1])
		if err != nil {
			utils.WriteJSON(w, http.StatusUnauthorized, false, "Akses ditolak: Token kedaluwarsa atau tidak valid!", nil)
			return
		}

		// Inject user details into request context
		ctx := r.Context()
		ctx = context.WithValue(ctx, UserSubKey, claims["sub"])
		ctx = context.WithValue(ctx, UsernameKey, claims["username"])
		ctx = context.WithValue(ctx, UserRoleKey, claims["role"])

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// RequireRole restricts access to specific user roles
func RequireRole(role string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userRole, ok := r.Context().Value(UserRoleKey).(string)
		if !ok || userRole != role {
			utils.WriteJSON(w, http.StatusForbidden, false, "Akses ditolak: Hak akses tidak memadai!", nil)
			return
		}
		next.ServeHTTP(w, r)
	})
}
