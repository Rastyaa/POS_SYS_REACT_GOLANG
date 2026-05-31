package models

import "time"

// User represents the user account model
type User struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	Password  string    `json:"-"` // Omit password from JSON responses
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

// LoginRequest represents the payload for authentication request
type LoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

// LoginResponse represents the output payload on successful login
type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

// APIResponse is the standard wrapper for all API responses
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}
