package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	_ "github.com/lib/pq"
)

var db *sql.DB

type Product struct {
	ID        string    `json:"id"`
	SKU       string    `json:"sku"`
	Name      string    `json:"name"`
	Price     float64   `json:"price"`
	Cost      float64   `json:"cost"`
	Stock     int       `json:"stock"`
	Category  string    `json:"category"`
	Image     string    `json:"image"`
	CreatedAt time.Time `json:"created_at"`
}

type SaleItem struct {
	ID        string  `json:"id,omitempty"`
	SaleID    string  `json:"sale_id,omitempty"`
	ProductID string  `json:"product_id"`
	Name      string  `json:"name"`
	Price     float64 `json:"price"`
	Quantity  int     `json:"quantity"`
	Subtotal  float64 `json:"subtotal"`
}

type Sale struct {
	ID              string     `json:"id"`
	Cashier         string     `json:"cashier"`
	Subtotal        float64    `json:"subtotal"`
	DiscountPercent float64    `json:"discount_percent"`
	DiscountAmount  float64    `json:"discount_amount"`
	TaxAmount       float64    `json:"tax_amount"`
	Total           float64    `json:"total"`
	Profit          float64    `json:"profit"`
	PaymentMethod   string     `json:"payment_method"`
	CashReceived    float64    `json:"cash_received"`
	Change          float64    `json:"change"`
	Timestamp       time.Time  `json:"timestamp"`
	Items           []SaleItem `json:"items"`
}

func main() {
	// 1. Get database URI connection string (Standard Supabase Postgres URI)
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		// Fallback local/dev string (change this with your actual Supabase Connection String)
		connStr = "postgres://postgres.lzosmhordeickitecbzp:YOUR_DATABASE_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
		log.Println("WARNING: DATABASE_URL env not set. Using default connection string placeholder.")
	}

	// 2. Open DB connection
	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Gagal inisialisasi koneksi database: %v", err)
	}
	defer db.Close()

	// Verify connection
	err = db.Ping()
	if err != nil {
		log.Printf("Gagal ping ke database Supabase (Periksa password/koneksi Anda): %v", err)
	} else {
		log.Println("Berhasil terhubung ke database Supabase PostgreSQL!")
	}

	// 3. Routing
	mux := http.NewServeMux()
	mux.HandleFunc("/api/products", productsHandler)
	mux.HandleFunc("/api/products/", productDetailHandler)
	mux.HandleFunc("/api/sales", salesHandler)

	// Apply CORS middleware
	handler := corsMiddleware(mux)

	// 4. Start Server
	port := "8080"
	log.Printf("Backend POS Go berjalan di http://localhost:%s\n", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}

// CORS Middleware to allow React Frontend to connect
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Handles /api/products
func productsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		rows, err := db.Query("SELECT id, sku, name, price, cost, stock, category, COALESCE(image, ''), created_at FROM products ORDER BY name ASC")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var products []Product
		for rows.Next() {
			var p Product
			if err := rows.Scan(&p.ID, &p.SKU, &p.Name, &p.Price, &p.Cost, &p.Stock, &p.Category, &p.Image, &p.CreatedAt); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			products = append(products, p)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(products)

	case "POST":
		var p Product
		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		query := `INSERT INTO products (sku, name, price, cost, stock, category, image) 
                  VALUES ($1, $2, $3, $4, $5, $6, $7) 
                  RETURNING id, created_at`
		err := db.QueryRow(query, p.SKU, p.Name, p.Price, p.Cost, p.Stock, p.Category, p.Image).Scan(&p.ID, &p.CreatedAt)
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

// Handles /api/products/{id} for PUT and DELETE
func productDetailHandler(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 4 || parts[3] == "" {
		http.Error(w, "ID produk dibutuhkan", http.StatusBadRequest)
		return
	}
	id := parts[3]

	switch r.Method {
	case "PUT":
		var p Product
		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		query := `UPDATE products SET name = $1, sku = $2, price = $3, cost = $4, stock = $5, category = $6, image = $7 WHERE id = $8`
		_, err := db.Exec(query, p.Name, p.SKU, p.Price, p.Cost, p.Stock, p.Category, p.Image, id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "updated"})

	case "DELETE":
		query := `DELETE FROM products WHERE id = $1`
		_, err := db.Exec(query, id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})

	default:
		http.Error(w, "Metode HTTP tidak didukung", http.StatusMethodNotAllowed)
	}
}

// Handles /api/sales (Checkout & Get History)
func salesHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		// Fetch Header
		salesQuery := `SELECT id, cashier, subtotal, discount_percent, discount_amount, tax_amount, total, profit, payment_method, cash_received, change, timestamp FROM sales ORDER BY timestamp DESC`
		sRows, err := db.Query(salesQuery)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer sRows.Close()

		var sales []Sale
		for sRows.Next() {
			var s Sale
			if err := sRows.Scan(&s.ID, &s.Cashier, &s.Subtotal, &s.DiscountPercent, &s.DiscountAmount, &s.TaxAmount, &s.Total, &s.Profit, &s.PaymentMethod, &s.CashReceived, &s.Change, &s.Timestamp); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			// Fetch Items for this Sale
			itemsQuery := `SELECT product_id, name, price, quantity, subtotal FROM sale_items WHERE sale_id = $1`
			iRows, err := db.Query(itemsQuery, s.ID)
			if err == nil {
				var items []SaleItem
				for iRows.Next() {
					var item SaleItem
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
		var s Sale
		if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Use transaction to ensure atomicity
		tx, err := db.Begin()
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
