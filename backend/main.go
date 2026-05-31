package main

import (
	"log"
	"net/http"

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
	
	// Public Routes
	mux.HandleFunc("/api/auth/login", handlers.LoginHandler)

	// Protected Routes (Require valid JWT)
	mux.Handle("/api/products", middleware.AuthProtect(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			// POST /api/products requires Administrator role
			middleware.RequireRole("Administrator", http.HandlerFunc(handlers.ProductsHandler)).ServeHTTP(w, r)
		} else {
			// GET /api/products is accessible by Cashier & Admin
			handlers.ProductsHandler(w, r)
		}
	})))

	mux.Handle("/api/products/", middleware.AuthProtect(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "PUT" || r.Method == "DELETE" {
			// PUT/DELETE /api/products/{id} requires Administrator role
			middleware.RequireRole("Administrator", http.HandlerFunc(handlers.ProductDetailHandler)).ServeHTTP(w, r)
		} else {
			handlers.ProductDetailHandler(w, r)
		}
	})))

	mux.Handle("/api/sales", middleware.AuthProtect(http.HandlerFunc(handlers.SalesHandler)))

	// Apply CORS middleware
	handler := middleware.CORS(mux)

	// 4. Start HTTP Server
	port := "8080"
	log.Printf("Backend POS Go berjalan di http://localhost:%s\n", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}
