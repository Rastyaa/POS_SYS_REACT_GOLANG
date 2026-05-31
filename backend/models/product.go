package models

import "time"

// Product represents the catalog product model
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
