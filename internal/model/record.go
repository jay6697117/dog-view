package model

import "time"

type Record struct {
	ID         int64     `json:"id"`
	Amount     float64   `json:"amount"`
	Type       string    `json:"type"` // "income" | "expense"
	CategoryID int64     `json:"categoryId"`
	Category   *Category `json:"category,omitempty"`
	Note       string    `json:"note"`
	Date       string    `json:"date"` // "2024-01-15"
	CreatedAt  time.Time `json:"createdAt"`
}
