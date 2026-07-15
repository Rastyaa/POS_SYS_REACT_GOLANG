package config

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
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
		return
	}
	
	log.Println("SUCCESS: Berhasil terhubung ke database Supabase PostgreSQL!")
	
	// Run auto migrations
	migrateAndSeedUsers()
	MigrateProducts()
	MigrateAndSeedProducts()
	MigrateTableOrders()
	MigrateSales()
}

func migrateAndSeedUsers() {
	// 1. Create users table if it doesn't exist
	schema := `
	CREATE TABLE IF NOT EXISTS users (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		username VARCHAR(100) UNIQUE NOT NULL,
		password VARCHAR(255) NOT NULL,
		role VARCHAR(50) NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`
	_, err := DB.Exec(schema)
	if err != nil {
		log.Fatalf("Gagal memigrasikan tabel users: %v", err)
	}

	// 2. Check if users are seeded
	var count int
	err = DB.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		log.Printf("Gagal membaca jumlah user: %v", err)
		return
	}

	if count == 0 {
		log.Println("Database users kosong. Melakukan seeding data default...")
		seedUser("admin", "admin", "Administrator")
		seedUser("cashier", "cashier", "Cashier")
		log.Println("Seeding user berhasil!")
	}
}

func seedUser(username, plainPassword, role string) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(plainPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Gagal melakukan hashing password: %v", err)
	}

	_, err = DB.Exec("INSERT INTO users (username, password, role) VALUES ($1, $2, $3) ON CONFLICT (username) DO NOTHING", username, string(hashedPassword), role)
	if err != nil {
		log.Fatalf("Gagal melakukan seeding user %s: %v", username, err)
	}
}

// MigrateTableOrders creates the table_orders table if it doesn't exist
func MigrateTableOrders() {
	schema := `
	CREATE TABLE IF NOT EXISTS table_orders (
		id VARCHAR(50) PRIMARY KEY,
		table_number VARCHAR(10) NOT NULL,
		customer_name VARCHAR(100),
		total NUMERIC(15,2) NOT NULL,
		status VARCHAR(20) NOT NULL DEFAULT 'Pending',
		items JSONB NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`
	_, err := DB.Exec(schema)
	if err != nil {
		log.Fatalf("Gagal memigrasikan tabel table_orders: %v", err)
	}
	log.Println("Migrasi tabel table_orders berhasil!")
}

// MigrateSales ensures the sales table has all required columns
func MigrateSales() {
	_, _ = DB.Exec("ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100);")
	_, _ = DB.Exec("ALTER TABLE sales ADD COLUMN IF NOT EXISTS table_number VARCHAR(20);")
	log.Println("Migrasi tabel sales (customer_name, table_number) berhasil!")
}

// MigrateProducts ensures the products table exists with all required columns
func MigrateProducts() {
	schema := `
	CREATE TABLE IF NOT EXISTS products (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		sku VARCHAR(50) UNIQUE NOT NULL,
		name VARCHAR(255) NOT NULL,
		price NUMERIC(15,2) NOT NULL,
		cost NUMERIC(15,2) NOT NULL DEFAULT 0,
		stock INT NOT NULL DEFAULT 0,
		category VARCHAR(100) NOT NULL,
		image TEXT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`
	_, err := DB.Exec(schema)
	if err != nil {
		log.Fatalf("Gagal memigrasikan tabel products: %v", err)
	}
	_, _ = DB.Exec("ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;")
	log.Println("Migrasi tabel products (description) berhasil!")
}
