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

// TableOrdersHandler handles GET /api/orders (Protected) and POST /api/public/orders (Public)
func TableOrdersHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		// Only fetch active orders (not Paid or Cancelled), or order by created_at desc limit 50
		query := `SELECT id, table_number, customer_name, total, status, items, created_at FROM table_orders ORDER BY created_at DESC LIMIT 50`
		rows, err := config.DB.Query(query)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, false, "Gagal mengambil data pesanan meja", nil)
			return
		}
		defer rows.Close()

		var orders []models.TableOrder
		for rows.Next() {
			var o models.TableOrder
			var itemsJSON []byte
			if err := rows.Scan(&o.ID, &o.TableNumber, &o.CustomerName, &o.Total, &o.Status, &itemsJSON, &o.CreatedAt); err != nil {
				utils.WriteJSON(w, http.StatusInternalServerError, false, "Gagal memindai data pesanan meja", nil)
				return
			}
			o.ParseItems(itemsJSON)
			orders = append(orders, o)
		}

		utils.WriteJSON(w, http.StatusOK, true, "Pesanan meja berhasil diambil", orders)

	case "POST":
		// Public endpoint to submit a new table order
		var o models.TableOrder
		if err := json.NewDecoder(r.Body).Decode(&o); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, false, "Format JSON tidak valid", nil)
			return
		}

		itemsJSON, err := o.ItemsToJSON()
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, false, "Format item pesanan tidak valid", nil)
			return
		}

		o.Status = "Pending" // Default status

		query := `INSERT INTO table_orders (id, table_number, customer_name, total, status, items) VALUES ($1, $2, $3, $4, $5, $6) RETURNING created_at`
		err = config.DB.QueryRow(query, o.ID, o.TableNumber, o.CustomerName, o.Total, o.Status, itemsJSON).Scan(&o.CreatedAt)
		if err != nil {
			log.Printf("Gagal menyimpan pesanan baru: %v", err)
			utils.WriteJSON(w, http.StatusInternalServerError, false, "Gagal menyimpan pesanan baru", nil)
			return
		}

		utils.WriteJSON(w, http.StatusCreated, true, "Pesanan meja berhasil dikirim!", o)

	default:
		utils.WriteJSON(w, http.StatusMethodNotAllowed, false, "Metode HTTP tidak didukung", nil)
	}
}

// TableOrderStatusHandler handles PUT /api/orders/{id}/status
func TableOrderStatusHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "PUT" {
		utils.WriteJSON(w, http.StatusMethodNotAllowed, false, "Metode HTTP tidak didukung", nil)
		return
	}

	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 4 || parts[3] == "" {
		utils.WriteJSON(w, http.StatusBadRequest, false, "ID pesanan dibutuhkan", nil)
		return
	}
	id := parts[3]

	var payload struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, false, "Format JSON tidak valid", nil)
		return
	}

	query := `UPDATE table_orders SET status = $1 WHERE id = $2`
	result, err := config.DB.Exec(query, payload.Status, id)
	if err != nil {
		log.Printf("Gagal update status pesanan: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, false, "Gagal mengupdate status pesanan", nil)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.WriteJSON(w, http.StatusNotFound, false, "Pesanan tidak ditemukan", nil)
		return
	}

	utils.WriteJSON(w, http.StatusOK, true, "Status pesanan berhasil diperbarui!", map[string]string{"id": id, "status": payload.Status})
}

// PublicProductsHandler handles GET /api/public/products for the public catalog
func PublicProductsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		utils.WriteJSON(w, http.StatusMethodNotAllowed, false, "Metode HTTP tidak didukung", nil)
		return
	}

	// Sama persis dengan ProductsHandler GET tapi tanpa Auth
	rows, err := config.DB.Query("SELECT id, sku, name, price, cost, stock, category, COALESCE(image, ''), created_at FROM products ORDER BY name ASC")
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, false, "Gagal mengambil data produk publik", nil)
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

	utils.WriteJSON(w, http.StatusOK, true, "Katalog produk berhasil diambil", products)
}
