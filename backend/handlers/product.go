package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"pos-backend/config"
	"pos-backend/models"
	"pos-backend/utils"
)

// ProductsHandler handles GET /api/products and POST /api/products
func ProductsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		rows, err := config.DB.Query("SELECT id, sku, name, price, cost, stock, category, COALESCE(image, ''), created_at FROM products ORDER BY name ASC")
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, false, "Gagal mengambil data produk", nil)
			return
		}
		defer rows.Close()

		var products []models.Product
		for rows.Next() {
			var p models.Product
			if err := rows.Scan(&p.ID, &p.SKU, &p.Name, &p.Price, &p.Cost, &p.Stock, &p.Category, &p.Image, &p.CreatedAt); err != nil {
				utils.WriteJSON(w, http.StatusInternalServerError, false, "Gagal memindai data produk", nil)
				return
			}
			products = append(products, p)
		}

		utils.WriteJSON(w, http.StatusOK, true, "Data produk berhasil diambil", products)

	case "POST":
		var p models.Product
		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, false, "Format JSON tidak valid", nil)
			return
		}

		// Validate payload
		if err := utils.ValidateStruct(&p); err != nil {
			log.Printf("Validasi produk gagal: %v", err)
			utils.WriteJSON(w, http.StatusBadRequest, false, "Payload produk tidak valid", nil)
			return
		}

		query := `INSERT INTO products (sku, name, price, cost, stock, category, image) 
                  VALUES ($1, $2, $3, $4, $5, $6, $7) 
                  RETURNING id, created_at`
		err := config.DB.QueryRow(query, p.SKU, p.Name, p.Price, p.Cost, p.Stock, p.Category, p.Image).Scan(&p.ID, &p.CreatedAt)
		if err != nil {
			log.Printf("Gagal menyimpan produk: %v", err)
			utils.WriteJSON(w, http.StatusInternalServerError, false, "Gagal menyimpan produk baru", nil)
			return
		}

		utils.WriteJSON(w, http.StatusCreated, true, "Produk berhasil ditambahkan!", p)

	default:
		utils.WriteJSON(w, http.StatusMethodNotAllowed, false, "Metode HTTP tidak didukung", nil)
	}
}

// ProductDetailHandler handles PUT /api/products/{id} and DELETE /api/products/{id}
func ProductDetailHandler(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 4 || parts[3] == "" {
		utils.WriteJSON(w, http.StatusBadRequest, false, "ID produk dibutuhkan", nil)
		return
	}
	id := parts[3]

	switch r.Method {
	case "PUT":
		var p models.Product
		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, false, "Format JSON tidak valid", nil)
			return
		}

		// Validate payload
		if err := utils.ValidateStruct(&p); err != nil {
			log.Printf("Validasi produk gagal: %v", err)
			utils.WriteJSON(w, http.StatusBadRequest, false, "Payload produk tidak valid", nil)
			return
		}

		query := `UPDATE products SET name = $1, sku = $2, price = $3, cost = $4, stock = $5, category = $6, image = $7 WHERE id = $8`
		result, err := config.DB.Exec(query, p.Name, p.SKU, p.Price, p.Cost, p.Stock, p.Category, p.Image, id)
		if err != nil {
			log.Printf("Gagal update produk: %v", err)
			utils.WriteJSON(w, http.StatusInternalServerError, false, "Gagal mengupdate produk", nil)
			return
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			utils.WriteJSON(w, http.StatusNotFound, false, "Produk tidak ditemukan", nil)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "Produk berhasil diperbarui!", p)

	case "DELETE":
		query := `DELETE FROM products WHERE id = $1`
		result, err := config.DB.Exec(query, id)
		if err != nil {
			log.Printf("Gagal menghapus produk: %v", err)
			utils.WriteJSON(w, http.StatusInternalServerError, false, "Gagal menghapus produk", nil)
			return
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			utils.WriteJSON(w, http.StatusNotFound, false, "Produk tidak ditemukan", nil)
			return
		}

		utils.WriteJSON(w, http.StatusOK, true, "Produk berhasil dihapus!", map[string]string{"id": id})

	default:
		utils.WriteJSON(w, http.StatusMethodNotAllowed, false, "Metode HTTP tidak didukung", nil)
	}
}
