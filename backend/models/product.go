package models

import "time"

// Product represents the catalog product model
type Product struct {
	ID        string    `json:"id"`
	SKU       string    `json:"sku" validate:"required"`
	Name      string    `json:"name" validate:"required"`
	Price     float64   `json:"price" validate:"required,gt=0"`
	Cost      float64   `json:"cost" validate:"required,gte=0"`
	Stock     int       `json:"stock" validate:"gte=0"`
	Category  string    `json:"category" validate:"required"`
	Image     string    `json:"image"`
	CreatedAt time.Time `json:"created_at"`
}
