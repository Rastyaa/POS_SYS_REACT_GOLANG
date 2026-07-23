package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"pos-backend/config"
	"pos-backend/handlers"
	"pos-backend/middleware"
)

func main() {
	// 1. Load environment variables from .env
	config.LoadEnv(".env")

	// 2. Initialize and verify DB connection
	config.Connect()
	defer config.DB.Close()

	// 3. Configure HTTP routing
	mux := http.NewServeMux()
	
	// Create rate limiters
	// Global rate limiter: 100 req per minute per IP
	// Login rate limiter: 10 req per minute per IP
	// For simplicity, we apply global to all except login
	
	// Public Routes
	mux.Handle("/api/auth/login", middleware.RateLimit(10, 60*time.Second)(http.HandlerFunc(handlers.LoginHandler)))
	mux.Handle("/api/public/products", middleware.RateLimit(100, 60*time.Second)(http.HandlerFunc(handlers.PublicProductsHandler)))
	mux.Handle("/api/public/orders", middleware.RateLimit(50, 60*time.Second)(http.HandlerFunc(handlers.TableOrdersHandler)))

	// Protected Routes (Require valid JWT)
	mux.Handle("/api/products", middleware.RateLimit(200, 60*time.Second)(middleware.AuthProtect(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			// POST /api/products requires Administrator role
			middleware.RequireRole("Administrator", http.HandlerFunc(handlers.ProductsHandler)).ServeHTTP(w, r)
		} else {
			// GET /api/products is accessible by Cashier & Admin
			handlers.ProductsHandler(w, r)
		}
	}))))

	mux.Handle("/api/products/", middleware.RateLimit(100, 60*time.Second)(middleware.AuthProtect(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "PUT" || r.Method == "DELETE" {
			// PUT/DELETE /api/products/{id} requires Administrator role
			middleware.RequireRole("Administrator", http.HandlerFunc(handlers.ProductDetailHandler)).ServeHTTP(w, r)
		} else {
			handlers.ProductDetailHandler(w, r)
		}
	}))))

	mux.Handle("/api/sales", middleware.RateLimit(100, 60*time.Second)(middleware.AuthProtect(http.HandlerFunc(handlers.SalesHandler))))
	mux.Handle("/api/orders", middleware.RateLimit(100, 60*time.Second)(middleware.AuthProtect(http.HandlerFunc(handlers.TableOrdersHandler))))
	mux.Handle("/api/orders/", middleware.RateLimit(100, 60*time.Second)(middleware.AuthProtect(http.HandlerFunc(handlers.TableOrderStatusHandler))))

	// Apply CORS and Security Headers middleware globally
	handler := middleware.SecurityHeaders(middleware.CORS(mux))

	// 4. Start HTTP Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Backend POS Go berjalan di http://localhost:%s\n", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}
