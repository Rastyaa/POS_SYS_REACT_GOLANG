package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"pos-backend/config"
	"pos-backend/models"
	"pos-backend/utils"

	"golang.org/x/crypto/bcrypt"
)

// LoginHandler handles POST /api/auth/login
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		utils.WriteJSON(w, http.StatusMethodNotAllowed, false, "Method tidak diperbolehkan", nil)
		return
	}

	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, false, "Payload JSON tidak valid", nil)
		return
	}

	// Validate inputs
	if err := utils.ValidateStruct(&req); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, false, "Username dan password wajib diisi", nil)
		return
	}

	// Query user from db
	var u models.User
	query := "SELECT id, username, password, role, created_at FROM users WHERE username = $1"
	err := config.DB.QueryRow(query, req.Username).Scan(&u.ID, &u.Username, &u.Password, &u.Role, &u.CreatedAt)

	if err == sql.ErrNoRows {
		utils.WriteJSON(w, http.StatusUnauthorized, false, "Username atau password salah", nil)
		return
	} else if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, false, "Gagal memproses autentikasi ke database", nil)
		return
	}

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(req.Password))
	if err != nil {
		utils.WriteJSON(w, http.StatusUnauthorized, false, "Username atau password salah", nil)
		return
	}

	// Generate JWT
	token, err := utils.GenerateToken(u.ID, u.Username, u.Role)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, false, "Gagal membuat token akses", nil)
		return
	}

	// Respond with token and user profile
	utils.WriteJSON(w, http.StatusOK, true, "Login berhasil!", models.LoginResponse{
		Token: token,
		User:  u,
	})
}
