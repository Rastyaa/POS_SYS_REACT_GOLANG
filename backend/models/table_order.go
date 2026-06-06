package models

import (
	"encoding/json"
	"time"
)

// TableOrderItem represents an item in a table order
type TableOrderItem struct {
	ProductID string  `json:"product_id"`
	Name      string  `json:"name"`
	Price     float64 `json:"price"`
	Quantity  int     `json:"quantity"`
	Subtotal  float64 `json:"subtotal"`
}

// TableOrder represents an incoming order from a customer table
type TableOrder struct {
	ID           string           `json:"id"`
	TableNumber  string           `json:"table_number"`
	CustomerName string           `json:"customer_name,omitempty"`
	Total        float64          `json:"total"`
	Status       string           `json:"status"` // "Pending", "Served", "Paid", "Cancelled"
	Items        []TableOrderItem `json:"items"`
	CreatedAt    time.Time        `json:"created_at"`
}

// ToJSONB converts items to JSON bytes for storage
func (to *TableOrder) ItemsToJSON() ([]byte, error) {
	return json.Marshal(to.Items)
}

// FromJSONB parses items from JSON bytes
func (to *TableOrder) ParseItems(data []byte) error {
	return json.Unmarshal(data, &to.Items)
}
