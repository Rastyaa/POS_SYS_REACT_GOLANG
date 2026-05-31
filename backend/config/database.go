package config

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

// DB is the global database connection pool
var DB *sql.DB

// Connect initializes the database connection
func Connect() {
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		log.Fatal("DATABASE_URL tidak diset di environment variables!")
	}

	var err error
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Gagal inisialisasi koneksi database: %v", err)
	}

	// Verify database connection is alive
	err = DB.Ping()
	if err != nil {
		log.Printf("WARNING: Gagal terhubung/ping ke database Supabase: %v", err)
		log.Printf("Silakan periksa kembali kredensial database Anda di file .env")
	} else {
		log.Println("SUCCESS: Berhasil terhubung ke database Supabase PostgreSQL!")
	}
}
