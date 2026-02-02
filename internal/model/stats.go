package model

// MonthSummary 月度汇总
type MonthSummary struct {
	TotalIncome  float64 `json:"totalIncome"`
	TotalExpense float64 `json:"totalExpense"`
	Balance      float64 `json:"balance"`
}

// CategoryStat 分类统计（饼图数据）
type CategoryStat struct {
	CategoryID   int64   `json:"categoryId"`
	CategoryName string  `json:"categoryName"`
	CategoryIcon string  `json:"categoryIcon"`
	Amount       float64 `json:"amount"`
	Percentage   float64 `json:"percentage"`
}

// MonthTrend 月度趋势（折线图数据）
type MonthTrend struct {
	Month   string  `json:"month"` // "2024-01"
	Income  float64 `json:"income"`
	Expense float64 `json:"expense"`
}

// CategoryStatsResponse 分类统计响应
type CategoryStatsResponse struct {
	IncomeStats  []CategoryStat `json:"incomeStats"`
	ExpenseStats []CategoryStat `json:"expenseStats"`
}
