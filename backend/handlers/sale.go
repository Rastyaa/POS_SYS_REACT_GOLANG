package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"pos-backend/config"
	"pos-backend/middleware"
	"pos-backend/models"
	"pos-backend/utils"
)

// SalesHandler handles GET /api/sales and POST /api/sales
func SalesHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		salesQuery := `SELECT id, cashier, customer_name, table_number, subtotal, discount_percent, discount_amount, tax_amount, total, profit, payment_method, cash_received, change, timestamp FROM sales ORDER BY timestamp DESC`
		sRows, err := config.DB.Query(salesQuery)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, false, "Gagal mengambil riwayat transaksi", nil)
			return
		}
		defer sRows.Close()

		var sales []models.Sale
		for sRows.Next() {
			var s models.Sale
			var customerName, tableNumber *string
			if err := sRows.Scan(&s.ID, &s.Cashier, &customerName, &tableNumber, &s.Subtotal, &s.DiscountPercent, &s.DiscountAmount, &s.TaxAmount, &s.Total, &s.Profit, &s.PaymentMethod, &s.CashReceived, &s.Change, &s.Timestamp); err != nil {
				utils.WriteJSON(w, http.StatusInternalServerError, false, "Gagal memindai riwayat transaksi", nil)
				return
			}
			if customerName != nil { s.CustomerName = *customerName }
			if tableNumber != nil { s.TableNumber = *tableNumber }

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

		utils.WriteJSON(w, http.StatusOK, true, "Data transaksi berhasil diambil", sales)

	case "POST":
		var s models.Sale
		if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, false, "Format JSON tidak valid", nil)
			return
		}

		// Inject cashier username from JWT claims context
		if username, ok := r.Context().Value(middleware.UsernameKey).(string); ok {
			s.Cashier = username
		}

		// Use transaction to ensure database atomicity
		tx, err := config.DB.Begin()
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, false, "Gagal memulai transaksi database", nil)
			return
		}
		defer tx.Rollback()

		// 1. Insert header
		saleInsert := `INSERT INTO sales (id, cashier, customer_name, table_number, subtotal, discount_percent, discount_amount, tax_amount, total, profit, payment_method, cash_received, change, timestamp) 
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`
		_, err = tx.Exec(saleInsert, s.ID, s.Cashier, s.CustomerName, s.TableNumber, s.Subtotal, s.DiscountPercent, s.DiscountAmount, s.TaxAmount, s.Total, s.Profit, s.PaymentMethod, s.CashReceived, s.Change, s.Timestamp)
		if err != nil {
			log.Printf("Gagal menyimpan detail penjualan: %v", err)
			utils.WriteJSON(w, http.StatusInternalServerError, false, "Gagal menyimpan detail penjualan", nil)
			return
		}

		// 2. Insert items and update stock
		for _, item := range s.Items {
			// Insert sale item
			itemInsert := `INSERT INTO sale_items (sale_id, product_id, name, price, quantity, subtotal) VALUES ($1, $2, $3, $4, $5, $6)`
			_, err = tx.Exec(itemInsert, s.ID, item.ProductID, item.Name, item.Price, item.Quantity, item.Subtotal)
			if err != nil {
				log.Printf("Gagal menyimpan item penjualan: %v", err)
				utils.WriteJSON(w, http.StatusInternalServerError, false, "Gagal menyimpan item penjualan", nil)
				return
			}

			// Update product stock
			stockUpdate := `UPDATE products SET stock = GREATEST(0, stock - $1) WHERE id = $2`
			_, err = tx.Exec(stockUpdate, item.Quantity, item.ProductID)
			if err != nil {
				log.Printf("Gagal memperbarui stok barang: %v", err)
				utils.WriteJSON(w, http.StatusInternalServerError, false, "Gagal memperbarui stok barang", nil)
				return
			}
		}

		// Commit transaction
		if err := tx.Commit(); err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, false, "Gagal mengesahkan transaksi database", nil)
			return
		}

		utils.WriteJSON(w, http.StatusCreated, true, "Transaksi berhasil diproses!", s)

	default:
		utils.WriteJSON(w, http.StatusMethodNotAllowed, false, "Metode HTTP tidak didukung", nil)
	}
}
