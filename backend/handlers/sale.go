package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"pos-backend/config"
	"pos-backend/models"
)

// SalesHandler handles GET /api/sales and POST /api/sales
func SalesHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		salesQuery := `SELECT id, cashier, subtotal, discount_percent, discount_amount, tax_amount, total, profit, payment_method, cash_received, change, timestamp FROM sales ORDER BY timestamp DESC`
		sRows, err := config.DB.Query(salesQuery)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer sRows.Close()

		var sales []models.Sale
		for sRows.Next() {
			var s models.Sale
			if err := sRows.Scan(&s.ID, &s.Cashier, &s.Subtotal, &s.DiscountPercent, &s.DiscountAmount, &s.TaxAmount, &s.Total, &s.Profit, &s.PaymentMethod, &s.CashReceived, &s.Change, &s.Timestamp); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			// Fetch Items for this Sale
			itemsQuery := `SELECT product_id, name, price, quantity, subtotal FROM sale_items WHERE sale_id = $1`
			iRows, err := config.DB.Query(itemsQuery, s.ID)
			if err == nil {
				var items []models.SaleItem
				for iRows.Next() {
					var item models.SaleItem
					if err := iRows.Scan(&item.ProductID, &item.Name, &item.Price, &item.Quantity, &item.Subtotal); err == nil {
						items = append(items, item)
					}
				}
				iRows.Close()
				s.Items = items
			}

			sales = append(sales, s)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(sales)

	case "POST":
		var s models.Sale
		if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Use transaction to ensure database atomicity
		tx, err := config.DB.Begin()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer tx.Rollback()

		// 1. Insert header
		saleInsert := `INSERT INTO sales (id, cashier, subtotal, discount_percent, discount_amount, tax_amount, total, profit, payment_method, cash_received, change, timestamp) 
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`
		_, err = tx.Exec(saleInsert, s.ID, s.Cashier, s.Subtotal, s.DiscountPercent, s.DiscountAmount, s.TaxAmount, s.Total, s.Profit, s.PaymentMethod, s.CashReceived, s.Change, s.Timestamp)
		if err != nil {
			http.Error(w, fmt.Sprintf("Gagal insert header penjualan: %v", err), http.StatusInternalServerError)
			return
		}

		// 2. Insert items and update stock
		for _, item := range s.Items {
			// Insert sale item
			itemInsert := `INSERT INTO sale_items (sale_id, product_id, name, price, quantity, subtotal) VALUES ($1, $2, $3, $4, $5, $6)`
			_, err = tx.Exec(itemInsert, s.ID, item.ProductID, item.Name, item.Price, item.Quantity, item.Subtotal)
			if err != nil {
				http.Error(w, fmt.Sprintf("Gagal insert item: %v", err), http.StatusInternalServerError)
				return
			}

			// Update product stock
			stockUpdate := `UPDATE products SET stock = GREATEST(0, stock - $1) WHERE id = $2`
			_, err = tx.Exec(stockUpdate, item.Quantity, item.ProductID)
			if err != nil {
				http.Error(w, fmt.Sprintf("Gagal update stock produk: %v", err), http.StatusInternalServerError)
				return
			}
		}

		// Commit transaction
		if err := tx.Commit(); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(s)

	default:
		http.Error(w, "Metode HTTP tidak didukung", http.StatusMethodNotAllowed)
	}
}
