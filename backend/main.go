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
	mux.HandleFunc("/api/products", handlers.ProductsHandler)
	mux.HandleFunc("/api/products/", handlers.ProductDetailHandler)
	mux.HandleFunc("/api/sales", handlers.SalesHandler)

	// Apply CORS middleware
	handler := middleware.CORS(mux)

	// 4. Start HTTP Server
	port := "8080"
	log.Printf("Backend POS Go berjalan di http://localhost:%s\n", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}
