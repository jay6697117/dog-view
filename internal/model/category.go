package model

import "time"

type Category struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Icon      string    `json:"icon"`
	Type      string    `json:"type"` // "income" | "expense"
	SortOrder int       `json:"sortOrder"`
	CreatedAt time.Time `json:"createdAt"`
}

// RecordType constants
const (
	TypeIncome  = "income"
	TypeExpense = "expense"
)

// DefaultExpenseCategories 默认支出分类（空，用户自定义）
var DefaultExpenseCategories = []Category{}

// DefaultIncomeCategories 默认收入分类（空，用户自定义）
var DefaultIncomeCategories = []Category{}
