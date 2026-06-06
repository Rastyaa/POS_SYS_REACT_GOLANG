package models

import "time"

// SaleItem represents an item within a Sale transaction
type SaleItem struct {
	ID        string  `json:"id,omitempty"`
	SaleID    string  `json:"sale_id,omitempty"`
	ProductID string  `json:"product_id"`
	Name      string  `json:"name"`
	Price     float64 `json:"price"`
	Quantity  int     `json:"quantity"`
	Subtotal  float64 `json:"subtotal"`
}

// Sale represents a POS checkout sale record
type Sale struct {
	ID              string     `json:"id"`
	Cashier         string     `json:"cashier"`
	CustomerName    string     `json:"customer_name"`
	TableNumber     string     `json:"table_number"`
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
