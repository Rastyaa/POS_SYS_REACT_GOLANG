package utils

import (
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"time"

	"pos-backend/models"

	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte(getEnv("JWT_SECRET", "super-secret-key-senior-pos"))
var validate = validator.New()

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

// GenerateToken creates a new JWT token for a user
func GenerateToken(userID, username, role string) (string, error) {
	claims := jwt.MapClaims{
		"sub":      userID,
		"username": username,
		"role":     role,
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
		"iat":      time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// ValidateToken parses and validates a JWT token string
func ValidateToken(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

// WriteJSON sends a standardized JSON response
func WriteJSON(w http.ResponseWriter, status int, success bool, message string, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(models.APIResponse{
		Success: success,
		Message: message,
		Data:    data,
	})
}

// ValidateStruct validates request payload structure
func ValidateStruct(s interface{}) error {
	return validate.Struct(s)
}
