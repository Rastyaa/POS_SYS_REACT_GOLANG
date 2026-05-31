package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"pos-backend/config"
	"pos-backend/models"
)

// ProductsHandler handles GET /api/products and POST /api/products
func ProductsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		rows, err := config.DB.Query("SELECT id, sku, name, price, cost, stock, category, COALESCE(image, ''), created_at FROM products ORDER BY name ASC")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var products []models.Product
		for rows.Next() {
			var p models.Product
			if err := rows.Scan(&p.ID, &p.SKU, &p.Name, &p.Price, &p.Cost, &p.Stock, &p.Category, &p.Image, &p.CreatedAt); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			products = append(products, p)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(products)

	case "POST":
		var p models.Product
		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		query := `INSERT INTO products (sku, name, price, cost, stock, category, image) 
                  VALUES ($1, $2, $3, $4, $5, $6, $7) 
                  RETURNING id, created_at`
		err := config.DB.QueryRow(query, p.SKU, p.Name, p.Price, p.Cost, p.Stock, p.Category, p.Image).Scan(&p.ID, &p.CreatedAt)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(p)

	default:
		http.Error(w, "Metode HTTP tidak didukung", http.StatusMethodNotAllowed)
	}
}

// ProductDetailHandler handles PUT /api/products/{id} and DELETE /api/products/{id}
func ProductDetailHandler(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 4 || parts[3] == "" {
		http.Error(w, "ID produk dibutuhkan", http.StatusBadRequest)
		return
	}
	id := parts[3]

	switch r.Method {
	case "PUT":
		var p models.Product
		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		query := `UPDATE products SET name = $1, sku = $2, price = $3, cost = $4, stock = $5, category = $6, image = $7 WHERE id = $8`
		_, err := config.DB.Exec(query, p.Name, p.SKU, p.Price, p.Cost, p.Stock, p.Category, p.Image, id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "updated"})

	case "DELETE":
		query := `DELETE FROM products WHERE id = $1`
		_, err := config.DB.Exec(query, id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})

	default:
		http.Error(w, "Metode HTTP tidak didukung", http.StatusMethodNotAllowed)
	}
}
