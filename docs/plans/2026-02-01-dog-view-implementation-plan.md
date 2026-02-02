# Dog View 个人收支记账工具实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一个基于 Go + Wails + React 的桌面个人收支记账应用，支持自定义分类、快捷记账、可视化分析。

**Architecture:** 经典分层架构，React UI 通过 Wails Bridge 调用 Go Service，Go 处理所有业务逻辑和 SQLite 数据库操作。前端使用 Zustand 状态管理，Recharts 图表可视化。

**Tech Stack:** Go 1.21+, Wails v2, React 18, TypeScript, SQLite, Zustand, Recharts, Vite

---

## Phase 1: 基础框架搭建

### Task 1.1: 初始化 Wails 项目

**Files:**
- Create: `main.go`
- Create: `app.go`
- Create: `wails.json`
- Create: `go.mod`

**Step 1: 安装 Wails CLI（如未安装）**

Run:
```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

**Step 2: 初始化 Wails 项目**

Run:
```bash
cd /Users/zhangjinhui/Desktop/dog-view
wails init -n dog-view -t react-ts
```

Expected: 生成完整的 Wails 项目结构

**Step 3: 验证项目结构**

Run:
```bash
ls -la /Users/zhangjinhui/Desktop/dog-view
```

Expected: 包含 `main.go`, `app.go`, `wails.json`, `frontend/` 等

**Step 4: 测试运行**

Run:
```bash
cd /Users/zhangjinhui/Desktop/dog-view && wails dev
```

Expected: 应用窗口启动成功

**Step 5: Commit**

```bash
git init
git add .
git commit -m "chore: init wails project with react-ts template"
```

---

### Task 1.2: 创建 Go 数据模型

**Files:**
- Create: `internal/model/category.go`
- Create: `internal/model/record.go`
- Create: `internal/model/stats.go`

**Step 1: 创建目录结构**

Run:
```bash
mkdir -p /Users/zhangjinhui/Desktop/dog-view/internal/{model,service,repository,export,errors}
```

**Step 2: 创建 Category 模型**

Create `internal/model/category.go`:
```go
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

// DefaultExpenseCategories 默认支出分类
var DefaultExpenseCategories = []Category{
	{Name: "餐饮", Icon: "🍜", Type: TypeExpense, SortOrder: 1},
	{Name: "交通", Icon: "🚇", Type: TypeExpense, SortOrder: 2},
	{Name: "购物", Icon: "🛒", Type: TypeExpense, SortOrder: 3},
	{Name: "娱乐", Icon: "🎮", Type: TypeExpense, SortOrder: 4},
	{Name: "居住", Icon: "🏠", Type: TypeExpense, SortOrder: 5},
	{Name: "医疗", Icon: "💊", Type: TypeExpense, SortOrder: 6},
	{Name: "学习", Icon: "📚", Type: TypeExpense, SortOrder: 7},
	{Name: "其他", Icon: "📦", Type: TypeExpense, SortOrder: 8},
}

// DefaultIncomeCategories 默认收入分类
var DefaultIncomeCategories = []Category{
	{Name: "工资", Icon: "💰", Type: TypeIncome, SortOrder: 1},
	{Name: "奖金", Icon: "🎁", Type: TypeIncome, SortOrder: 2},
	{Name: "投资", Icon: "📈", Type: TypeIncome, SortOrder: 3},
	{Name: "其他收入", Icon: "💸", Type: TypeIncome, SortOrder: 4},
}
```

**Step 3: 创建 Record 模型**

Create `internal/model/record.go`:
```go
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
```

**Step 4: 创建统计数据结构**

Create `internal/model/stats.go`:
```go
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
```

**Step 5: Commit**

```bash
git add internal/model/
git commit -m "feat: add data models for category, record and stats"
```

---

### Task 1.3: 创建错误定义

**Files:**
- Create: `internal/errors/errors.go`

**Step 1: 创建错误定义**

Create `internal/errors/errors.go`:
```go
package errors

import "errors"

var (
	ErrCategoryNotFound = errors.New("分类不存在")
	ErrCategoryInUse    = errors.New("分类正在使用中，无法删除")
	ErrRecordNotFound   = errors.New("记录不存在")
	ErrInvalidAmount    = errors.New("金额无效")
	ErrInvalidDate      = errors.New("日期格式错误")
	ErrImportFailed     = errors.New("导入失败")
	ErrDuplicateCategory = errors.New("分类名称已存在")
)
```

**Step 2: Commit**

```bash
git add internal/errors/
git commit -m "feat: add error definitions"
```

---

### Task 1.4: 实现 SQLite Repository

**Files:**
- Create: `internal/repository/sqlite.go`

**Step 1: 创建 SQLite Repository**

Create `internal/repository/sqlite.go`:
```go
package repository

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"time"

	"dog-view/internal/model"

	_ "github.com/mattn/go-sqlite3"
)

type SQLiteRepository struct {
	db *sql.DB
}

// getDBPath 获取数据库文件路径
func getDBPath() (string, error) {
	var baseDir string
	switch runtime.GOOS {
	case "darwin":
		homeDir, _ := os.UserHomeDir()
		baseDir = filepath.Join(homeDir, "Library", "Application Support", "DogView")
	case "windows":
		baseDir = filepath.Join(os.Getenv("APPDATA"), "DogView")
	default: // linux
		homeDir, _ := os.UserHomeDir()
		baseDir = filepath.Join(homeDir, ".local", "share", "DogView")
	}

	if err := os.MkdirAll(baseDir, 0755); err != nil {
		return "", err
	}

	return filepath.Join(baseDir, "data.db"), nil
}

// NewSQLiteRepository 创建 SQLite 仓库
func NewSQLiteRepository() (*SQLiteRepository, error) {
	dbPath, err := getDBPath()
	if err != nil {
		return nil, fmt.Errorf("获取数据库路径失败: %w", err)
	}

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("打开数据库失败: %w", err)
	}

	repo := &SQLiteRepository{db: db}
	if err := repo.InitSchema(); err != nil {
		return nil, fmt.Errorf("初始化数据库表失败: %w", err)
	}

	return repo, nil
}

// InitSchema 初始化数据库表
func (r *SQLiteRepository) InitSchema() error {
	schema := `
	CREATE TABLE IF NOT EXISTS categories (
		id          INTEGER PRIMARY KEY AUTOINCREMENT,
		name        TEXT NOT NULL UNIQUE,
		icon        TEXT,
		type        TEXT NOT NULL,
		sort_order  INTEGER DEFAULT 0,
		created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS records (
		id          INTEGER PRIMARY KEY AUTOINCREMENT,
		amount      DECIMAL(10,2) NOT NULL,
		type        TEXT NOT NULL,
		category_id INTEGER NOT NULL,
		note        TEXT,
		date        DATE NOT NULL,
		created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (category_id) REFERENCES categories(id)
	);

	CREATE INDEX IF NOT EXISTS idx_records_date ON records(date);
	CREATE INDEX IF NOT EXISTS idx_records_category ON records(category_id);
	`

	_, err := r.db.Exec(schema)
	if err != nil {
		return err
	}

	return r.initDefaultCategories()
}

// initDefaultCategories 初始化默认分类
func (r *SQLiteRepository) initDefaultCategories() error {
	// 检查是否已有分类
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM categories").Scan(&count)
	if err != nil {
		return err
	}

	if count > 0 {
		return nil // 已有数据，跳过初始化
	}

	// 插入默认支出分类
	for _, c := range model.DefaultExpenseCategories {
		_, err := r.db.Exec(
			"INSERT INTO categories (name, icon, type, sort_order) VALUES (?, ?, ?, ?)",
			c.Name, c.Icon, c.Type, c.SortOrder,
		)
		if err != nil {
			return err
		}
	}

	// 插入默认收入分类
	for _, c := range model.DefaultIncomeCategories {
		_, err := r.db.Exec(
			"INSERT INTO categories (name, icon, type, sort_order) VALUES (?, ?, ?, ?)",
			c.Name, c.Icon, c.Type, c.SortOrder,
		)
		if err != nil {
			return err
		}
	}

	return nil
}

// Close 关闭数据库连接
func (r *SQLiteRepository) Close() error {
	return r.db.Close()
}

// ============ Category 操作 ============

// ListCategories 获取分类列表
func (r *SQLiteRepository) ListCategories(recordType string) ([]model.Category, error) {
	query := "SELECT id, name, icon, type, sort_order, created_at FROM categories"
	args := []interface{}{}

	if recordType != "" {
		query += " WHERE type = ?"
		args = append(args, recordType)
	}
	query += " ORDER BY sort_order ASC"

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []model.Category
	for rows.Next() {
		var c model.Category
		err := rows.Scan(&c.ID, &c.Name, &c.Icon, &c.Type, &c.SortOrder, &c.CreatedAt)
		if err != nil {
			return nil, err
		}
		categories = append(categories, c)
	}

	return categories, nil
}

// CreateCategory 创建分类
func (r *SQLiteRepository) CreateCategory(c *model.Category) error {
	result, err := r.db.Exec(
		"INSERT INTO categories (name, icon, type, sort_order) VALUES (?, ?, ?, ?)",
		c.Name, c.Icon, c.Type, c.SortOrder,
	)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	c.ID = id
	return nil
}

// UpdateCategory 更新分类
func (r *SQLiteRepository) UpdateCategory(c *model.Category) error {
	_, err := r.db.Exec(
		"UPDATE categories SET name = ?, icon = ? WHERE id = ?",
		c.Name, c.Icon, c.ID,
	)
	return err
}

// DeleteCategory 删除分类
func (r *SQLiteRepository) DeleteCategory(id int64) error {
	// 检查是否有记录使用此分类
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM records WHERE category_id = ?", id).Scan(&count)
	if err != nil {
		return err
	}
	if count > 0 {
		return fmt.Errorf("分类正在使用中，无法删除")
	}

	_, err = r.db.Exec("DELETE FROM categories WHERE id = ?", id)
	return err
}

// UpdateCategoryOrder 更新分类排序
func (r *SQLiteRepository) UpdateCategoryOrder(ids []int64) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	for i, id := range ids {
		_, err := tx.Exec("UPDATE categories SET sort_order = ? WHERE id = ?", i+1, id)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

// ============ Record 操作 ============

// CreateRecord 创建记录
func (r *SQLiteRepository) CreateRecord(rec *model.Record) error {
	result, err := r.db.Exec(
		"INSERT INTO records (amount, type, category_id, note, date) VALUES (?, ?, ?, ?, ?)",
		rec.Amount, rec.Type, rec.CategoryID, rec.Note, rec.Date,
	)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	rec.ID = id
	return nil
}

// UpdateRecord 更新记录
func (r *SQLiteRepository) UpdateRecord(rec *model.Record) error {
	_, err := r.db.Exec(
		"UPDATE records SET amount = ?, category_id = ?, note = ?, date = ? WHERE id = ?",
		rec.Amount, rec.CategoryID, rec.Note, rec.Date, rec.ID,
	)
	return err
}

// DeleteRecord 删除记录
func (r *SQLiteRepository) DeleteRecord(id int64) error {
	_, err := r.db.Exec("DELETE FROM records WHERE id = ?", id)
	return err
}

// GetRecordByID 根据 ID 获取记录
func (r *SQLiteRepository) GetRecordByID(id int64) (*model.Record, error) {
	row := r.db.QueryRow(`
		SELECT r.id, r.amount, r.type, r.category_id, r.note, r.date, r.created_at,
		       c.id, c.name, c.icon, c.type
		FROM records r
		LEFT JOIN categories c ON r.category_id = c.id
		WHERE r.id = ?
	`, id)

	var rec model.Record
	var cat model.Category
	err := row.Scan(
		&rec.ID, &rec.Amount, &rec.Type, &rec.CategoryID, &rec.Note, &rec.Date, &rec.CreatedAt,
		&cat.ID, &cat.Name, &cat.Icon, &cat.Type,
	)
	if err != nil {
		return nil, err
	}

	rec.Category = &cat
	return &rec, nil
}

// ListRecordsByMonth 获取月度记录
func (r *SQLiteRepository) ListRecordsByMonth(year, month int) ([]model.Record, error) {
	startDate := fmt.Sprintf("%04d-%02d-01", year, month)
	endDate := fmt.Sprintf("%04d-%02d-31", year, month)

	rows, err := r.db.Query(`
		SELECT r.id, r.amount, r.type, r.category_id, r.note, r.date, r.created_at,
		       c.id, c.name, c.icon, c.type
		FROM records r
		LEFT JOIN categories c ON r.category_id = c.id
		WHERE r.date >= ? AND r.date <= ?
		ORDER BY r.date DESC, r.created_at DESC
	`, startDate, endDate)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var records []model.Record
	for rows.Next() {
		var rec model.Record
		var cat model.Category
		err := rows.Scan(
			&rec.ID, &rec.Amount, &rec.Type, &rec.CategoryID, &rec.Note, &rec.Date, &rec.CreatedAt,
			&cat.ID, &cat.Name, &cat.Icon, &cat.Type,
		)
		if err != nil {
			return nil, err
		}
		rec.Category = &cat
		records = append(records, rec)
	}

	return records, nil
}

// ============ 统计查询 ============

// GetMonthSummary 获取月度汇总
func (r *SQLiteRepository) GetMonthSummary(year, month int) (*model.MonthSummary, error) {
	startDate := fmt.Sprintf("%04d-%02d-01", year, month)
	endDate := fmt.Sprintf("%04d-%02d-31", year, month)

	var summary model.MonthSummary

	// 计算收入
	err := r.db.QueryRow(`
		SELECT COALESCE(SUM(amount), 0) FROM records
		WHERE type = 'income' AND date >= ? AND date <= ?
	`, startDate, endDate).Scan(&summary.TotalIncome)
	if err != nil {
		return nil, err
	}

	// 计算支出
	err = r.db.QueryRow(`
		SELECT COALESCE(SUM(amount), 0) FROM records
		WHERE type = 'expense' AND date >= ? AND date <= ?
	`, startDate, endDate).Scan(&summary.TotalExpense)
	if err != nil {
		return nil, err
	}

	summary.Balance = summary.TotalIncome - summary.TotalExpense
	return &summary, nil
}

// GetCategoryStats 获取分类统计
func (r *SQLiteRepository) GetCategoryStats(year, month int, recordType string) ([]model.CategoryStat, error) {
	startDate := fmt.Sprintf("%04d-%02d-01", year, month)
	endDate := fmt.Sprintf("%04d-%02d-31", year, month)

	// 先获取总金额
	var total float64
	err := r.db.QueryRow(`
		SELECT COALESCE(SUM(amount), 0) FROM records
		WHERE type = ? AND date >= ? AND date <= ?
	`, recordType, startDate, endDate).Scan(&total)
	if err != nil {
		return nil, err
	}

	rows, err := r.db.Query(`
		SELECT c.id, c.name, c.icon, COALESCE(SUM(r.amount), 0) as amount
		FROM categories c
		LEFT JOIN records r ON c.id = r.category_id
			AND r.date >= ? AND r.date <= ?
		WHERE c.type = ?
		GROUP BY c.id
		HAVING amount > 0
		ORDER BY amount DESC
	`, startDate, endDate, recordType)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stats []model.CategoryStat
	for rows.Next() {
		var s model.CategoryStat
		err := rows.Scan(&s.CategoryID, &s.CategoryName, &s.CategoryIcon, &s.Amount)
		if err != nil {
			return nil, err
		}
		if total > 0 {
			s.Percentage = (s.Amount / total) * 100
		}
		stats = append(stats, s)
	}

	return stats, nil
}

// GetMonthlyTrends 获取年度月趋势
func (r *SQLiteRepository) GetMonthlyTrends(year int) ([]model.MonthTrend, error) {
	trends := make([]model.MonthTrend, 12)

	for i := 1; i <= 12; i++ {
		month := fmt.Sprintf("%04d-%02d", year, i)
		trends[i-1] = model.MonthTrend{Month: month}

		startDate := fmt.Sprintf("%04d-%02d-01", year, i)
		endDate := fmt.Sprintf("%04d-%02d-31", year, i)

		// 收入
		r.db.QueryRow(`
			SELECT COALESCE(SUM(amount), 0) FROM records
			WHERE type = 'income' AND date >= ? AND date <= ?
		`, startDate, endDate).Scan(&trends[i-1].Income)

		// 支出
		r.db.QueryRow(`
			SELECT COALESCE(SUM(amount), 0) FROM records
			WHERE type = 'expense' AND date >= ? AND date <= ?
		`, startDate, endDate).Scan(&trends[i-1].Expense)
	}

	return trends, nil
}

// GetRecentRecords 获取最近 N 条记录
func (r *SQLiteRepository) GetRecentRecords(limit int) ([]model.Record, error) {
	rows, err := r.db.Query(`
		SELECT r.id, r.amount, r.type, r.category_id, r.note, r.date, r.created_at,
		       c.id, c.name, c.icon, c.type
		FROM records r
		LEFT JOIN categories c ON r.category_id = c.id
		ORDER BY r.date DESC, r.created_at DESC
		LIMIT ?
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var records []model.Record
	for rows.Next() {
		var rec model.Record
		var cat model.Category
		err := rows.Scan(
			&rec.ID, &rec.Amount, &rec.Type, &rec.CategoryID, &rec.Note, &rec.Date, &rec.CreatedAt,
			&cat.ID, &cat.Name, &cat.Icon, &cat.Type,
		)
		if err != nil {
			return nil, err
		}
		rec.Category = &cat
		records = append(records, rec)
	}

	return records, nil
}

// GetAllRecords 获取所有记录（用于导出）
func (r *SQLiteRepository) GetAllRecords() ([]model.Record, error) {
	rows, err := r.db.Query(`
		SELECT r.id, r.amount, r.type, r.category_id, r.note, r.date, r.created_at,
		       c.id, c.name, c.icon, c.type
		FROM records r
		LEFT JOIN categories c ON r.category_id = c.id
		ORDER BY r.date DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var records []model.Record
	for rows.Next() {
		var rec model.Record
		var cat model.Category
		err := rows.Scan(
			&rec.ID, &rec.Amount, &rec.Type, &rec.CategoryID, &rec.Note, &rec.Date, &rec.CreatedAt,
			&cat.ID, &cat.Name, &cat.Icon, &cat.Type,
		)
		if err != nil {
			return nil, err
		}
		rec.Category = &cat
		records = append(records, rec)
	}

	return records, nil
}

// GetCategoryByName 根据名称获取分类
func (r *SQLiteRepository) GetCategoryByName(name string) (*model.Category, error) {
	row := r.db.QueryRow("SELECT id, name, icon, type, sort_order, created_at FROM categories WHERE name = ?", name)

	var c model.Category
	err := row.Scan(&c.ID, &c.Name, &c.Icon, &c.Type, &c.SortOrder, &c.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}
```

**Step 2: 添加 SQLite 依赖**

Run:
```bash
cd /Users/zhangjinhui/Desktop/dog-view && go get github.com/mattn/go-sqlite3
```

**Step 3: Commit**

```bash
git add internal/repository/ go.mod go.sum
git commit -m "feat: implement SQLite repository with CRUD and stats queries"
```

---

### Task 1.5: 实现 Service 层

**Files:**
- Create: `internal/service/category.go`
- Create: `internal/service/record.go`

**Step 1: 创建 Category Service**

Create `internal/service/category.go`:
```go
package service

import (
	"dog-view/internal/model"
	"dog-view/internal/repository"
)

type CategoryService struct {
	repo *repository.SQLiteRepository
}

func NewCategoryService(repo *repository.SQLiteRepository) *CategoryService {
	return &CategoryService{repo: repo}
}

func (s *CategoryService) List(recordType string) ([]model.Category, error) {
	return s.repo.ListCategories(recordType)
}

func (s *CategoryService) Create(name, icon, recordType string) error {
	maxOrder := 0
	categories, _ := s.repo.ListCategories(recordType)
	for _, c := range categories {
		if c.SortOrder > maxOrder {
			maxOrder = c.SortOrder
		}
	}

	category := &model.Category{
		Name:      name,
		Icon:      icon,
		Type:      recordType,
		SortOrder: maxOrder + 1,
	}
	return s.repo.CreateCategory(category)
}

func (s *CategoryService) Update(id int64, name, icon string) error {
	return s.repo.UpdateCategory(&model.Category{
		ID:   id,
		Name: name,
		Icon: icon,
	})
}

func (s *CategoryService) Delete(id int64) error {
	return s.repo.DeleteCategory(id)
}

func (s *CategoryService) Reorder(ids []int64) error {
	return s.repo.UpdateCategoryOrder(ids)
}
```

**Step 2: 创建 Record Service**

Create `internal/service/record.go`:
```go
package service

import (
	"dog-view/internal/model"
	"dog-view/internal/repository"
)

type RecordService struct {
	repo *repository.SQLiteRepository
}

func NewRecordService(repo *repository.SQLiteRepository) *RecordService {
	return &RecordService{repo: repo}
}

func (s *RecordService) Create(amount float64, recordType string, categoryID int64, note, date string) error {
	record := &model.Record{
		Amount:     amount,
		Type:       recordType,
		CategoryID: categoryID,
		Note:       note,
		Date:       date,
	}
	return s.repo.CreateRecord(record)
}

func (s *RecordService) Update(id int64, amount float64, categoryID int64, note, date string) error {
	return s.repo.UpdateRecord(&model.Record{
		ID:         id,
		Amount:     amount,
		CategoryID: categoryID,
		Note:       note,
		Date:       date,
	})
}

func (s *RecordService) Delete(id int64) error {
	return s.repo.DeleteRecord(id)
}

func (s *RecordService) GetByID(id int64) (*model.Record, error) {
	return s.repo.GetRecordByID(id)
}

func (s *RecordService) ListByMonth(year, month int) ([]model.Record, error) {
	return s.repo.ListRecordsByMonth(year, month)
}

func (s *RecordService) GetMonthSummary(year, month int) (*model.MonthSummary, error) {
	return s.repo.GetMonthSummary(year, month)
}

func (s *RecordService) GetCategoryStats(year, month int) (*model.CategoryStatsResponse, error) {
	incomeStats, err := s.repo.GetCategoryStats(year, month, model.TypeIncome)
	if err != nil {
		return nil, err
	}

	expenseStats, err := s.repo.GetCategoryStats(year, month, model.TypeExpense)
	if err != nil {
		return nil, err
	}

	return &model.CategoryStatsResponse{
		IncomeStats:  incomeStats,
		ExpenseStats: expenseStats,
	}, nil
}

func (s *RecordService) GetTrendStats(year int) ([]model.MonthTrend, error) {
	return s.repo.GetMonthlyTrends(year)
}

func (s *RecordService) GetRecentRecords(limit int) ([]model.Record, error) {
	return s.repo.GetRecentRecords(limit)
}
```

**Step 3: Commit**

```bash
git add internal/service/
git commit -m "feat: implement category and record services"
```

---

### Task 1.6: 实现导入导出服务

**Files:**
- Create: `internal/export/csv.go`
- Create: `internal/export/json.go`
- Create: `internal/service/export.go`

**Step 1: 创建 CSV 处理**

Create `internal/export/csv.go`:
```go
package export

import (
	"encoding/csv"
	"fmt"
	"os"
	"strconv"

	"dog-view/internal/model"
)

// ExportCSV 导出记录到 CSV
func ExportCSV(records []model.Record, filePath string) error {
	file, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	// 写入 UTF-8 BOM（Excel 兼容）
	file.Write([]byte{0xEF, 0xBB, 0xBF})

	writer := csv.NewWriter(file)
	defer writer.Flush()

	// 写入表头
	header := []string{"date", "type", "category", "amount", "note"}
	if err := writer.Write(header); err != nil {
		return err
	}

	// 写入数据
	for _, r := range records {
		categoryName := ""
		if r.Category != nil {
			categoryName = r.Category.Name
		}
		row := []string{
			r.Date,
			r.Type,
			categoryName,
			fmt.Sprintf("%.2f", r.Amount),
			r.Note,
		}
		if err := writer.Write(row); err != nil {
			return err
		}
	}

	return nil
}

// CSVRecord CSV 导入记录结构
type CSVRecord struct {
	Date     string
	Type     string
	Category string
	Amount   float64
	Note     string
}

// ImportCSV 从 CSV 导入记录
func ImportCSV(filePath string) ([]CSVRecord, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	rows, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}

	if len(rows) < 2 {
		return nil, fmt.Errorf("CSV 文件为空或只有表头")
	}

	var records []CSVRecord
	for i, row := range rows[1:] { // 跳过表头
		if len(row) < 4 {
			return nil, fmt.Errorf("第 %d 行数据不完整", i+2)
		}

		amount, err := strconv.ParseFloat(row[3], 64)
		if err != nil {
			return nil, fmt.Errorf("第 %d 行金额格式错误", i+2)
		}

		note := ""
		if len(row) >= 5 {
			note = row[4]
		}

		records = append(records, CSVRecord{
			Date:     row[0],
			Type:     row[1],
			Category: row[2],
			Amount:   amount,
			Note:     note,
		})
	}

	return records, nil
}
```

**Step 2: 创建 JSON 处理**

Create `internal/export/json.go`:
```go
package export

import (
	"encoding/json"
	"os"
	"time"

	"dog-view/internal/model"
)

// ExportData JSON 导出数据结构
type ExportData struct {
	ExportDate string             `json:"exportDate"`
	Records    []ExportRecord     `json:"records"`
	Categories []ExportCategory   `json:"categories"`
}

type ExportRecord struct {
	Date     string  `json:"date"`
	Type     string  `json:"type"`
	Category string  `json:"category"`
	Amount   float64 `json:"amount"`
	Note     string  `json:"note"`
}

type ExportCategory struct {
	Name string `json:"name"`
	Icon string `json:"icon"`
	Type string `json:"type"`
}

// ExportJSON 导出记录到 JSON
func ExportJSON(records []model.Record, categories []model.Category, filePath string) error {
	data := ExportData{
		ExportDate: time.Now().Format(time.RFC3339),
		Records:    make([]ExportRecord, 0, len(records)),
		Categories: make([]ExportCategory, 0, len(categories)),
	}

	for _, r := range records {
		categoryName := ""
		if r.Category != nil {
			categoryName = r.Category.Name
		}
		data.Records = append(data.Records, ExportRecord{
			Date:     r.Date,
			Type:     r.Type,
			Category: categoryName,
			Amount:   r.Amount,
			Note:     r.Note,
		})
	}

	for _, c := range categories {
		data.Categories = append(data.Categories, ExportCategory{
			Name: c.Name,
			Icon: c.Icon,
			Type: c.Type,
		})
	}

	file, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	return encoder.Encode(data)
}

// ImportJSON 从 JSON 导入
func ImportJSON(filePath string) (*ExportData, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var data ExportData
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&data); err != nil {
		return nil, err
	}

	return &data, nil
}
```

**Step 3: 创建 Export Service**

Create `internal/service/export.go`:
```go
package service

import (
	"dog-view/internal/export"
	"dog-view/internal/model"
	"dog-view/internal/repository"
)

type ExportService struct {
	repo *repository.SQLiteRepository
}

func NewExportService(repo *repository.SQLiteRepository) *ExportService {
	return &ExportService{repo: repo}
}

func (s *ExportService) ExportToCSV(filePath string) error {
	records, err := s.repo.GetAllRecords()
	if err != nil {
		return err
	}
	return export.ExportCSV(records, filePath)
}

func (s *ExportService) ExportToJSON(filePath string) error {
	records, err := s.repo.GetAllRecords()
	if err != nil {
		return err
	}

	categories, err := s.repo.ListCategories("")
	if err != nil {
		return err
	}

	return export.ExportJSON(records, categories, filePath)
}

func (s *ExportService) ImportFromCSV(filePath string) (int, error) {
	csvRecords, err := export.ImportCSV(filePath)
	if err != nil {
		return 0, err
	}

	count := 0
	for _, csvRec := range csvRecords {
		// 查找或创建分类
		category, err := s.repo.GetCategoryByName(csvRec.Category)
		if err != nil {
			// 分类不存在，创建新分类
			category = &model.Category{
				Name: csvRec.Category,
				Icon: "📦",
				Type: csvRec.Type,
			}
			if err := s.repo.CreateCategory(category); err != nil {
				continue
			}
		}

		// 创建记录
		record := &model.Record{
			Date:       csvRec.Date,
			Type:       csvRec.Type,
			CategoryID: category.ID,
			Amount:     csvRec.Amount,
			Note:       csvRec.Note,
		}
		if err := s.repo.CreateRecord(record); err != nil {
			continue
		}
		count++
	}

	return count, nil
}

func (s *ExportService) ImportFromJSON(filePath string) (int, error) {
	data, err := export.ImportJSON(filePath)
	if err != nil {
		return 0, err
	}

	// 先导入分类
	categoryMap := make(map[string]int64)
	for _, c := range data.Categories {
		existing, err := s.repo.GetCategoryByName(c.Name)
		if err == nil {
			categoryMap[c.Name] = existing.ID
		} else {
			newCat := &model.Category{
				Name: c.Name,
				Icon: c.Icon,
				Type: c.Type,
			}
			if err := s.repo.CreateCategory(newCat); err == nil {
				categoryMap[c.Name] = newCat.ID
			}
		}
	}

	// 导入记录
	count := 0
	for _, r := range data.Records {
		categoryID, ok := categoryMap[r.Category]
		if !ok {
			continue
		}

		record := &model.Record{
			Date:       r.Date,
			Type:       r.Type,
			CategoryID: categoryID,
			Amount:     r.Amount,
			Note:       r.Note,
		}
		if err := s.repo.CreateRecord(record); err == nil {
			count++
		}
	}

	return count, nil
}
```

**Step 4: Commit**

```bash
git add internal/export/ internal/service/export.go
git commit -m "feat: implement CSV and JSON import/export services"
```

---

### Task 1.7: 更新 App.go 绑定层

**Files:**
- Modify: `app.go`

**Step 1: 替换 app.go 内容**

Replace `app.go`:
```go
package main

import (
	"context"

	"dog-view/internal/model"
	"dog-view/internal/repository"
	"dog-view/internal/service"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx             context.Context
	repo            *repository.SQLiteRepository
	categoryService *service.CategoryService
	recordService   *service.RecordService
	exportService   *service.ExportService
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// 初始化数据库
	repo, err := repository.NewSQLiteRepository()
	if err != nil {
		runtime.LogFatal(ctx, "数据库初始化失败: "+err.Error())
		return
	}
	a.repo = repo

	// 初始化服务
	a.categoryService = service.NewCategoryService(repo)
	a.recordService = service.NewRecordService(repo)
	a.exportService = service.NewExportService(repo)
}

// shutdown is called when the app closes
func (a *App) shutdown(ctx context.Context) {
	if a.repo != nil {
		a.repo.Close()
	}
}

// ============ 分类管理 ============

func (a *App) GetCategories(recordType string) ([]model.Category, error) {
	return a.categoryService.List(recordType)
}

func (a *App) CreateCategory(name, icon, recordType string) error {
	return a.categoryService.Create(name, icon, recordType)
}

func (a *App) UpdateCategory(id int64, name, icon string) error {
	return a.categoryService.Update(id, name, icon)
}

func (a *App) DeleteCategory(id int64) error {
	return a.categoryService.Delete(id)
}

func (a *App) ReorderCategories(ids []int64) error {
	return a.categoryService.Reorder(ids)
}

// ============ 记录管理 ============

func (a *App) CreateRecord(amount float64, recordType string, categoryID int64, note, date string) error {
	return a.recordService.Create(amount, recordType, categoryID, note, date)
}

func (a *App) UpdateRecord(id int64, amount float64, categoryID int64, note, date string) error {
	return a.recordService.Update(id, amount, categoryID, note, date)
}

func (a *App) DeleteRecord(id int64) error {
	return a.recordService.Delete(id)
}

func (a *App) GetRecordsByMonth(year, month int) ([]model.Record, error) {
	return a.recordService.ListByMonth(year, month)
}

func (a *App) GetRecentRecords(limit int) ([]model.Record, error) {
	return a.recordService.GetRecentRecords(limit)
}

// ============ 统计分析 ============

func (a *App) GetMonthSummary(year, month int) (*model.MonthSummary, error) {
	return a.recordService.GetMonthSummary(year, month)
}

func (a *App) GetCategoryStats(year, month int) (*model.CategoryStatsResponse, error) {
	return a.recordService.GetCategoryStats(year, month)
}

func (a *App) GetTrendStats(year int) ([]model.MonthTrend, error) {
	return a.recordService.GetTrendStats(year)
}

// ============ 导入导出 ============

func (a *App) ExportToCSV() (string, error) {
	filePath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "导出 CSV",
		DefaultFilename: "dog-view-export.csv",
		Filters: []runtime.FileFilter{
			{DisplayName: "CSV 文件", Pattern: "*.csv"},
		},
	})
	if err != nil || filePath == "" {
		return "", err
	}

	err = a.exportService.ExportToCSV(filePath)
	if err != nil {
		return "", err
	}
	return filePath, nil
}

func (a *App) ExportToJSON() (string, error) {
	filePath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "导出 JSON",
		DefaultFilename: "dog-view-export.json",
		Filters: []runtime.FileFilter{
			{DisplayName: "JSON 文件", Pattern: "*.json"},
		},
	})
	if err != nil || filePath == "" {
		return "", err
	}

	err = a.exportService.ExportToJSON(filePath)
	if err != nil {
		return "", err
	}
	return filePath, nil
}

func (a *App) ImportFromCSV() (int, error) {
	filePath, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "导入 CSV",
		Filters: []runtime.FileFilter{
			{DisplayName: "CSV 文件", Pattern: "*.csv"},
		},
	})
	if err != nil || filePath == "" {
		return 0, err
	}

	return a.exportService.ImportFromCSV(filePath)
}

func (a *App) ImportFromJSON() (int, error) {
	filePath, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "导入 JSON",
		Filters: []runtime.FileFilter{
			{DisplayName: "JSON 文件", Pattern: "*.json"},
		},
	})
	if err != nil || filePath == "" {
		return 0, err
	}

	return a.exportService.ImportFromJSON(filePath)
}
```

**Step 2: 更新 main.go**

Modify `main.go` to use correct lifecycle hooks:
```go
package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	app := NewApp()

	err := wails.Run(&options.App{
		Title:  "Dog View - 个人记账",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 255, G: 255, B: 255, A: 1},
		OnStartup:        app.startup,
		OnShutdown:       app.shutdown,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
```

**Step 3: Commit**

```bash
git add app.go main.go
git commit -m "feat: implement Wails binding layer with all API methods"
```

---

## Phase 2: 前端基础设施

### Task 2.1: 配置前端依赖

**Files:**
- Modify: `frontend/package.json`

**Step 1: 安装前端依赖**

Run:
```bash
cd /Users/zhangjinhui/Desktop/dog-view/frontend
npm install zustand recharts dayjs lucide-react
npm install -D @types/node
```

**Step 2: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "chore: add frontend dependencies"
```

---

### Task 2.2: 创建类型定义

**Files:**
- Create: `frontend/src/types/index.ts`

**Step 1: 创建类型定义**

Create `frontend/src/types/index.ts`:
```typescript
export interface Category {
  id: number;
  name: string;
  icon: string;
  type: 'income' | 'expense';
  sortOrder: number;
  createdAt: string;
}

export interface Record {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  categoryId: number;
  category?: Category;
  note: string;
  date: string;
  createdAt: string;
}

export interface MonthSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface CategoryStat {
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  amount: number;
  percentage: number;
}

export interface CategoryStatsResponse {
  incomeStats: CategoryStat[];
  expenseStats: CategoryStat[];
}

export interface MonthTrend {
  month: string;
  income: number;
  expense: number;
}

export type RecordType = 'income' | 'expense';
export type Theme = 'light' | 'dark';
```

**Step 2: Commit**

```bash
git add frontend/src/types/
git commit -m "feat: add TypeScript type definitions"
```

---

### Task 2.3: 创建 Zustand Store

**Files:**
- Create: `frontend/src/stores/useStore.ts`

**Step 1: 创建全局状态管理**

Create `frontend/src/stores/useStore.ts`:
```typescript
import { create } from 'zustand';
import type { Category, Record, MonthSummary, CategoryStatsResponse, MonthTrend, Theme, RecordType } from '../types';
import { GetCategories, GetRecordsByMonth, GetMonthSummary, GetCategoryStats, GetTrendStats, GetRecentRecords } from '../../wailsjs/go/main/App';

interface AppState {
  // 主题
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  // 当前选中的日期
  currentYear: number;
  currentMonth: number;
  setCurrentDate: (year: number, month: number) => void;

  // 分类
  categories: Category[];
  fetchCategories: (type?: RecordType) => Promise<void>;

  // 记录
  records: Record[];
  recentRecords: Record[];
  fetchRecords: () => Promise<void>;
  fetchRecentRecords: () => Promise<void>;

  // 统计
  monthSummary: MonthSummary | null;
  categoryStats: CategoryStatsResponse | null;
  trendStats: MonthTrend[];
  fetchMonthSummary: () => Promise<void>;
  fetchCategoryStats: () => Promise<void>;
  fetchTrendStats: () => Promise<void>;

  // 加载状态
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const now = new Date();

export const useStore = create<AppState>((set, get) => ({
  // 主题
  theme: (localStorage.getItem('theme') as Theme) || 'light',
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },

  // 当前日期
  currentYear: now.getFullYear(),
  currentMonth: now.getMonth() + 1,
  setCurrentDate: (year, month) => {
    set({ currentYear: year, currentMonth: month });
  },

  // 分类
  categories: [],
  fetchCategories: async (type) => {
    try {
      const categories = await GetCategories(type || '');
      set({ categories: categories || [] });
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  },

  // 记录
  records: [],
  recentRecords: [],
  fetchRecords: async () => {
    const { currentYear, currentMonth } = get();
    try {
      const records = await GetRecordsByMonth(currentYear, currentMonth);
      set({ records: records || [] });
    } catch (error) {
      console.error('获取记录失败:', error);
    }
  },
  fetchRecentRecords: async () => {
    try {
      const records = await GetRecentRecords(5);
      set({ recentRecords: records || [] });
    } catch (error) {
      console.error('获取最近记录失败:', error);
    }
  },

  // 统计
  monthSummary: null,
  categoryStats: null,
  trendStats: [],
  fetchMonthSummary: async () => {
    const { currentYear, currentMonth } = get();
    try {
      const summary = await GetMonthSummary(currentYear, currentMonth);
      set({ monthSummary: summary });
    } catch (error) {
      console.error('获取月度汇总失败:', error);
    }
  },
  fetchCategoryStats: async () => {
    const { currentYear, currentMonth } = get();
    try {
      const stats = await GetCategoryStats(currentYear, currentMonth);
      set({ categoryStats: stats });
    } catch (error) {
      console.error('获取分类统计失败:', error);
    }
  },
  fetchTrendStats: async () => {
    const { currentYear } = get();
    try {
      const trends = await GetTrendStats(currentYear);
      set({ trendStats: trends || [] });
    } catch (error) {
      console.error('获取趋势统计失败:', error);
    }
  },

  // 加载状态
  loading: false,
  setLoading: (loading) => set({ loading }),
}));
```

**Step 2: Commit**

```bash
git add frontend/src/stores/
git commit -m "feat: implement Zustand store for global state management"
```

---

### Task 2.4: 创建主题样式

**Files:**
- Create: `frontend/src/styles/themes.css`
- Create: `frontend/src/styles/global.css`

**Step 1: 创建主题 CSS**

Create `frontend/src/styles/themes.css`:
```css
:root {
  /* 浅色主题 */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-card: #ffffff;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --text-muted: #999999;
  --border-color: #e0e0e0;
  --income-color: #4caf50;
  --expense-color: #f44336;
  --accent-color: #2196f3;
  --hover-bg: #f0f0f0;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.12);
}

[data-theme='dark'] {
  /* 深色主题 */
  --bg-primary: #121212;
  --bg-secondary: #1e1e1e;
  --bg-card: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --text-muted: #666666;
  --border-color: #404040;
  --income-color: #66bb6a;
  --expense-color: #ef5350;
  --accent-color: #42a5f5;
  --hover-bg: #383838;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.4);
}
```

**Step 2: 创建全局样式**

Create `frontend/src/styles/global.css`:
```css
@import './themes.css';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  line-height: 1.5;
  transition: background-color 0.3s, color 0.3s;
}

button {
  cursor: pointer;
  border: none;
  background: none;
  font-family: inherit;
}

input, textarea, select {
  font-family: inherit;
  font-size: inherit;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

/* 通用卡片样式 */
.card {
  background-color: var(--bg-card);
  border-radius: 12px;
  box-shadow: var(--shadow);
  padding: 16px;
}

/* 金额样式 */
.amount-income {
  color: var(--income-color);
}

.amount-expense {
  color: var(--expense-color);
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--accent-color);
  color: white;
}

.btn-primary:hover {
  filter: brightness(1.1);
}

.btn-ghost {
  background-color: transparent;
  color: var(--text-secondary);
}

.btn-ghost:hover {
  background-color: var(--hover-bg);
}
```

**Step 3: 更新 App 入口**

Modify `frontend/src/main.tsx` to import global styles:
```typescript
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/global.css'

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

**Step 4: Commit**

```bash
git add frontend/src/styles/ frontend/src/main.tsx
git commit -m "feat: add theme system and global styles"
```

---

## Phase 3: 核心 UI 组件

### Task 3.1: 创建布局组件

**Files:**
- Create: `frontend/src/components/Layout/index.tsx`
- Create: `frontend/src/components/Layout/Sidebar.tsx`
- Create: `frontend/src/components/Layout/Layout.module.css`

**Step 1: 创建 Sidebar**

Create `frontend/src/components/Layout/Sidebar.tsx`:
```tsx
import { NavLink } from 'react-router-dom';
import { Home, List, BarChart3, Settings, Moon, Sun } from 'lucide-react';
import { useStore } from '../../stores/useStore';
import styles from './Layout.module.css';

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/records', icon: List, label: '记录' },
  { path: '/analysis', icon: BarChart3, label: '分析' },
  { path: '/settings', icon: Settings, label: '设置' },
];

export function Sidebar() {
  const { theme, toggleTheme } = useStore();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span>Dog View</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.themeToggle}>
        <button onClick={toggleTheme} className={styles.themeBtn}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          <span>{theme === 'light' ? '深色模式' : '浅色模式'}</span>
        </button>
      </div>
    </aside>
  );
}
```

**Step 2: 创建 Layout**

Create `frontend/src/components/Layout/index.tsx`:
```tsx
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import styles from './Layout.module.css';

export function Layout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
```

**Step 3: 创建 Layout CSS**

Create `frontend/src/components/Layout/Layout.module.css`:
```css
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 200px;
  background-color: var(--bg-card);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.logo {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent-color);
  padding: 16px 0;
  text-align: center;
}

.nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 16px;
}

.navItem {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s;
}

.navItem:hover {
  background-color: var(--hover-bg);
  color: var(--text-primary);
}

.navItem.active {
  background-color: var(--accent-color);
  color: white;
}

.themeToggle {
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.themeBtn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.themeBtn:hover {
  background-color: var(--hover-bg);
  color: var(--text-primary);
}

.main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
```

**Step 4: Commit**

```bash
git add frontend/src/components/Layout/
git commit -m "feat: implement Layout and Sidebar components"
```

---

### Task 3.2: 创建分类卡片组件

**Files:**
- Create: `frontend/src/components/CategoryCard/index.tsx`
- Create: `frontend/src/components/CategoryCard/CategoryCard.module.css`

**Step 1: 创建组件**

Create `frontend/src/components/CategoryCard/index.tsx`:
```tsx
import type { Category } from '../../types';
import styles from './CategoryCard.module.css';

interface CategoryCardProps {
  category: Category;
  selected?: boolean;
  onClick: () => void;
}

export function CategoryCard({ category, selected, onClick }: CategoryCardProps) {
  return (
    <button
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <span className={styles.icon}>{category.icon}</span>
      <span className={styles.name}>{category.name}</span>
    </button>
  );
}
```

**Step 2: 创建样式**

Create `frontend/src/components/CategoryCard/CategoryCard.module.css`:
```css
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background-color: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 80px;
}

.card:hover {
  border-color: var(--accent-color);
  transform: translateY(-2px);
}

.card.selected {
  border-color: var(--accent-color);
  background-color: var(--accent-color);
  color: white;
}

.icon {
  font-size: 28px;
}

.name {
  font-size: 12px;
  color: var(--text-secondary);
}

.card.selected .name {
  color: white;
}
```

**Step 3: Commit**

```bash
git add frontend/src/components/CategoryCard/
git commit -m "feat: implement CategoryCard component"
```

---

### Task 3.3: 创建金额输入组件

**Files:**
- Create: `frontend/src/components/AmountInput/index.tsx`
- Create: `frontend/src/components/AmountInput/AmountInput.module.css`

**Step 1: 创建组件**

Create `frontend/src/components/AmountInput/index.tsx`:
```tsx
import { useState, useRef, useEffect } from 'react';
import styles from './AmountInput.module.css';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  type: 'income' | 'expense';
}

export function AmountInput({ value, onChange, onConfirm, type }: AmountInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // 只允许数字和一个小数点，最多两位小数
    if (/^\d*\.?\d{0,2}$/.test(val)) {
      onChange(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value) {
      onConfirm();
    }
  };

  return (
    <div className={styles.container}>
      <span className={`${styles.symbol} ${type === 'income' ? styles.income : styles.expense}`}>
        {type === 'income' ? '+' : '-'} ¥
      </span>
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        className={styles.input}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="0.00"
      />
    </div>
  );
}
```

**Step 2: 创建样式**

Create `frontend/src/components/AmountInput/AmountInput.module.css`:
```css
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
}

.symbol {
  font-size: 32px;
  font-weight: 500;
}

.symbol.income {
  color: var(--income-color);
}

.symbol.expense {
  color: var(--expense-color);
}

.input {
  font-size: 48px;
  font-weight: 600;
  width: 200px;
  text-align: center;
  border: none;
  background: transparent;
  color: var(--text-primary);
  outline: none;
}

.input::placeholder {
  color: var(--text-muted);
}
```

**Step 3: Commit**

```bash
git add frontend/src/components/AmountInput/
git commit -m "feat: implement AmountInput component"
```

---

### Task 3.4: 创建记录列表组件

**Files:**
- Create: `frontend/src/components/RecordList/index.tsx`
- Create: `frontend/src/components/RecordList/RecordList.module.css`

**Step 1: 创建组件**

Create `frontend/src/components/RecordList/index.tsx`:
```tsx
import { Trash2 } from 'lucide-react';
import type { Record } from '../../types';
import styles from './RecordList.module.css';

interface RecordListProps {
  records: Record[];
  onEdit?: (record: Record) => void;
  onDelete?: (id: number) => void;
  showDate?: boolean;
}

// 按日期分组
function groupByDate(records: Record[]): Map<string, Record[]> {
  const groups = new Map<string, Record[]>();
  for (const record of records) {
    const list = groups.get(record.date) || [];
    list.push(record);
    groups.set(record.date, list);
  }
  return groups;
}

export function RecordList({ records, onEdit, onDelete, showDate = true }: RecordListProps) {
  if (!records || records.length === 0) {
    return (
      <div className={styles.empty}>
        <p>暂无记录</p>
      </div>
    );
  }

  const groups = groupByDate(records);

  return (
    <div className={styles.list}>
      {Array.from(groups.entries()).map(([date, items]) => (
        <div key={date} className={styles.group}>
          {showDate && <div className={styles.dateHeader}>{date}</div>}
          {items.map((record) => (
            <div
              key={record.id}
              className={styles.item}
              onClick={() => onEdit?.(record)}
            >
              <div className={styles.left}>
                <span className={styles.icon}>{record.category?.icon}</span>
                <div className={styles.info}>
                  <span className={styles.category}>{record.category?.name}</span>
                  {record.note && <span className={styles.note}>{record.note}</span>}
                </div>
              </div>
              <div className={styles.right}>
                <span
                  className={`${styles.amount} ${
                    record.type === 'income' ? styles.income : styles.expense
                  }`}
                >
                  {record.type === 'income' ? '+' : '-'}¥{record.amount.toFixed(2)}
                </span>
                {onDelete && (
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(record.id);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

**Step 2: 创建样式**

Create `frontend/src/components/RecordList/RecordList.module.css`:
```css
.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty {
  text-align: center;
  padding: 48px;
  color: var(--text-muted);
}

.group {
  background-color: var(--bg-card);
  border-radius: 12px;
  overflow: hidden;
}

.dateHeader {
  padding: 12px 16px;
  font-size: 14px;
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.item:hover {
  background-color: var(--hover-bg);
}

.item:not(:last-child) {
  border-bottom: 1px solid var(--border-color);
}

.left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon {
  font-size: 24px;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.category {
  font-weight: 500;
  color: var(--text-primary);
}

.note {
  font-size: 12px;
  color: var(--text-muted);
}

.right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.amount {
  font-weight: 600;
  font-size: 16px;
}

.amount.income {
  color: var(--income-color);
}

.amount.expense {
  color: var(--expense-color);
}

.deleteBtn {
  padding: 8px;
  border-radius: 8px;
  color: var(--text-muted);
  opacity: 0;
  transition: all 0.2s;
}

.item:hover .deleteBtn {
  opacity: 1;
}

.deleteBtn:hover {
  color: var(--expense-color);
  background-color: var(--hover-bg);
}
```

**Step 3: Commit**

```bash
git add frontend/src/components/RecordList/
git commit -m "feat: implement RecordList component"
```

---

### Task 3.5: 创建图表组件

**Files:**
- Create: `frontend/src/components/Charts/CategoryPieChart.tsx`
- Create: `frontend/src/components/Charts/TrendLineChart.tsx`
- Create: `frontend/src/components/Charts/BalanceBarChart.tsx`
- Create: `frontend/src/components/Charts/index.ts`

**Step 1: 创建饼图组件**

Create `frontend/src/components/Charts/CategoryPieChart.tsx`:
```tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { CategoryStat } from '../../types';

interface CategoryPieChartProps {
  data: CategoryStat[];
  type: 'income' | 'expense';
}

const COLORS = [
  '#2196f3', '#4caf50', '#ff9800', '#f44336', '#9c27b0',
  '#00bcd4', '#ffeb3b', '#795548', '#607d8b', '#e91e63',
];

export function CategoryPieChart({ data, type }: CategoryPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
        暂无数据
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="categoryName"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          label={({ categoryName, percentage }) =>
            `${categoryName} ${percentage.toFixed(1)}%`
          }
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => `¥${value.toFixed(2)}`}
          contentStyle={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fill: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}
        >
          ¥{total.toFixed(0)}
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
}
```

**Step 2: 创建趋势折线图**

Create `frontend/src/components/Charts/TrendLineChart.tsx`:
```tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { MonthTrend } from '../../types';

interface TrendLineChartProps {
  data: MonthTrend[];
}

export function TrendLineChart({ data }: TrendLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
        暂无数据
      </div>
    );
  }

  const formattedData = data.map((item) => ({
    ...item,
    month: item.month.slice(5), // "2024-01" -> "01"
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis
          dataKey="month"
          stroke="var(--text-secondary)"
          tickFormatter={(value) => `${parseInt(value)}月`}
        />
        <YAxis
          stroke="var(--text-secondary)"
          tickFormatter={(value) => `¥${value}`}
        />
        <Tooltip
          formatter={(value: number) => `¥${value.toFixed(2)}`}
          contentStyle={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="income"
          name="收入"
          stroke="var(--income-color)"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="expense"
          name="支出"
          stroke="var(--expense-color)"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

**Step 3: 创建柱状对比图**

Create `frontend/src/components/Charts/BalanceBarChart.tsx`:
```tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { MonthTrend } from '../../types';

interface BalanceBarChartProps {
  data: MonthTrend[];
}

export function BalanceBarChart({ data }: BalanceBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
        暂无数据
      </div>
    );
  }

  const formattedData = data.map((item) => ({
    ...item,
    month: item.month.slice(5),
    balance: item.income - item.expense,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis
          dataKey="month"
          stroke="var(--text-secondary)"
          tickFormatter={(value) => `${parseInt(value)}月`}
        />
        <YAxis
          stroke="var(--text-secondary)"
          tickFormatter={(value) => `¥${value}`}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            `¥${value.toFixed(2)}`,
            name === 'income' ? '收入' : name === 'expense' ? '支出' : '结余',
          ]}
          contentStyle={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Bar dataKey="income" name="收入" fill="var(--income-color)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="支出" fill="var(--expense-color)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

**Step 4: 创建导出文件**

Create `frontend/src/components/Charts/index.ts`:
```typescript
export { CategoryPieChart } from './CategoryPieChart';
export { TrendLineChart } from './TrendLineChart';
export { BalanceBarChart } from './BalanceBarChart';
```

**Step 5: Commit**

```bash
git add frontend/src/components/Charts/
git commit -m "feat: implement chart components with Recharts"
```

---

## Phase 4: 页面实现

### Task 4.1: 创建首页

**Files:**
- Create: `frontend/src/pages/Home/index.tsx`
- Create: `frontend/src/pages/Home/Home.module.css`

**Step 1: 创建首页组件**

Create `frontend/src/pages/Home/index.tsx`:
```tsx
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '../../stores/useStore';
import { RecordList } from '../../components/RecordList';
import { CategoryPieChart } from '../../components/Charts';
import { AddRecordModal } from '../../components/AddRecordModal';
import styles from './Home.module.css';

export function Home() {
  const {
    currentYear,
    currentMonth,
    monthSummary,
    categoryStats,
    recentRecords,
    fetchMonthSummary,
    fetchCategoryStats,
    fetchRecentRecords,
  } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchMonthSummary();
    fetchCategoryStats();
    fetchRecentRecords();
  }, [currentYear, currentMonth]);

  const refreshData = () => {
    fetchMonthSummary();
    fetchCategoryStats();
    fetchRecentRecords();
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>{currentYear}年{currentMonth}月</h1>
        <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          记一笔
        </button>
      </header>

      {/* 概览卡片 */}
      <div className={styles.summaryCards}>
        <div className={`${styles.summaryCard} ${styles.income}`}>
          <span className={styles.label}>收入</span>
          <span className={styles.value}>¥{monthSummary?.totalIncome.toFixed(2) || '0.00'}</span>
        </div>
        <div className={`${styles.summaryCard} ${styles.expense}`}>
          <span className={styles.label}>支出</span>
          <span className={styles.value}>¥{monthSummary?.totalExpense.toFixed(2) || '0.00'}</span>
        </div>
        <div className={`${styles.summaryCard} ${styles.balance}`}>
          <span className={styles.label}>结余</span>
          <span className={styles.value}>¥{monthSummary?.balance.toFixed(2) || '0.00'}</span>
        </div>
      </div>

      <div className={styles.content}>
        {/* 分类占比 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>支出分类</h2>
          <div className={styles.chartCard}>
            <CategoryPieChart
              data={categoryStats?.expenseStats || []}
              type="expense"
            />
          </div>
        </section>

        {/* 最近记录 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>最近记录</h2>
          <RecordList records={recentRecords} showDate={true} />
        </section>
      </div>

      {showAddModal && (
        <AddRecordModal
          onClose={() => setShowAddModal(false)}
          onSuccess={refreshData}
        />
      )}
    </div>
  );
}
```

**Step 2: 创建首页样式**

Create `frontend/src/pages/Home/Home.module.css`:
```css
.page {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h1 {
  font-size: 24px;
  font-weight: 600;
}

.addBtn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: var(--accent-color);
  color: white;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
}

.addBtn:hover {
  filter: brightness(1.1);
}

.summaryCards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.summaryCard {
  background-color: var(--bg-card);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: var(--shadow);
}

.summaryCard .label {
  font-size: 14px;
  color: var(--text-secondary);
}

.summaryCard .value {
  font-size: 24px;
  font-weight: 600;
}

.summaryCard.income .value {
  color: var(--income-color);
}

.summaryCard.expense .value {
  color: var(--expense-color);
}

.summaryCard.balance .value {
  color: var(--accent-color);
}

.content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sectionTitle {
  font-size: 18px;
  font-weight: 600;
}

.chartCard {
  background-color: var(--bg-card);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--shadow);
}
```

**Step 3: Commit**

```bash
git add frontend/src/pages/Home/
git commit -m "feat: implement Home page with summary and charts"
```

---

### Task 4.2: 创建记账弹窗组件

**Files:**
- Create: `frontend/src/components/AddRecordModal/index.tsx`
- Create: `frontend/src/components/AddRecordModal/AddRecordModal.module.css`

**Step 1: 创建弹窗组件**

Create `frontend/src/components/AddRecordModal/index.tsx`:
```tsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import dayjs from 'dayjs';
import { useStore } from '../../stores/useStore';
import { CategoryCard } from '../CategoryCard';
import { AmountInput } from '../AmountInput';
import { CreateRecord } from '../../../wailsjs/go/main/App';
import type { RecordType, Category } from '../../types';
import styles from './AddRecordModal.module.css';

interface AddRecordModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'type' | 'category' | 'amount';

export function AddRecordModal({ onClose, onSuccess }: AddRecordModalProps) {
  const { categories, fetchCategories } = useStore();

  const [step, setStep] = useState<Step>('type');
  const [recordType, setRecordType] = useState<RecordType>('expense');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories(recordType);
  }, [recordType]);

  const handleSelectType = (type: RecordType) => {
    setRecordType(type);
    setSelectedCategory(null);
    setStep('category');
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setStep('amount');
  };

  const handleConfirm = async () => {
    if (!selectedCategory || !amount) return;

    setLoading(true);
    try {
      await CreateRecord(
        parseFloat(amount),
        recordType,
        selectedCategory.id,
        note,
        date
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error('创建记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'amount') {
      setStep('category');
    } else if (step === 'category') {
      setStep('type');
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
          <h2>
            {step === 'type' && '选择类型'}
            {step === 'category' && '选择分类'}
            {step === 'amount' && '输入金额'}
          </h2>
          {step !== 'type' && (
            <button className={styles.backBtn} onClick={handleBack}>
              返回
            </button>
          )}
        </header>

        <div className={styles.content}>
          {/* 选择类型 */}
          {step === 'type' && (
            <div className={styles.typeSelector}>
              <button
                className={`${styles.typeBtn} ${styles.expense}`}
                onClick={() => handleSelectType('expense')}
              >
                支出
              </button>
              <button
                className={`${styles.typeBtn} ${styles.income}`}
                onClick={() => handleSelectType('income')}
              >
                收入
              </button>
            </div>
          )}

          {/* 选择分类 */}
          {step === 'category' && (
            <div className={styles.categoryGrid}>
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  selected={selectedCategory?.id === category.id}
                  onClick={() => handleSelectCategory(category)}
                />
              ))}
            </div>
          )}

          {/* 输入金额 */}
          {step === 'amount' && (
            <div className={styles.amountStep}>
              <div className={styles.selectedCategory}>
                <span className={styles.categoryIcon}>{selectedCategory?.icon}</span>
                <span className={styles.categoryName}>{selectedCategory?.name}</span>
              </div>

              <AmountInput
                value={amount}
                onChange={setAmount}
                onConfirm={handleConfirm}
                type={recordType}
              />

              <div className={styles.formGroup}>
                <label>备注（可选）</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="添加备注..."
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>日期</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={styles.input}
                />
              </div>

              <button
                className={styles.confirmBtn}
                onClick={handleConfirm}
                disabled={!amount || loading}
              >
                {loading ? '保存中...' : '确认记账'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: 创建样式**

Create `frontend/src/components/AddRecordModal/AddRecordModal.module.css`:
```css
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background-color: var(--bg-card);
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.header h2 {
  font-size: 18px;
  font-weight: 600;
}

.closeBtn,
.backBtn {
  padding: 8px;
  border-radius: 8px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.closeBtn:hover,
.backBtn:hover {
  background-color: var(--hover-bg);
  color: var(--text-primary);
}

.backBtn {
  font-size: 14px;
}

.content {
  padding: 20px;
}

.typeSelector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.typeBtn {
  padding: 32px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  color: white;
  transition: all 0.2s;
}

.typeBtn.expense {
  background-color: var(--expense-color);
}

.typeBtn.income {
  background-color: var(--income-color);
}

.typeBtn:hover {
  transform: scale(1.02);
}

.categoryGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.amountStep {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.selectedCategory {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background-color: var(--bg-secondary);
  border-radius: 12px;
}

.categoryIcon {
  font-size: 24px;
}

.categoryName {
  font-size: 16px;
  font-weight: 500;
}

.formGroup {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.formGroup label {
  font-size: 14px;
  color: var(--text-secondary);
}

.input {
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: var(--accent-color);
}

.confirmBtn {
  padding: 16px;
  background-color: var(--accent-color);
  color: white;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s;
}

.confirmBtn:hover:not(:disabled) {
  filter: brightness(1.1);
}

.confirmBtn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Step 3: Commit**

```bash
git add frontend/src/components/AddRecordModal/
git commit -m "feat: implement AddRecordModal component"
```

---

### Task 4.3: 创建记录页面

**Files:**
- Create: `frontend/src/pages/Records/index.tsx`
- Create: `frontend/src/pages/Records/Records.module.css`

**Step 1: 创建记录页面**

Create `frontend/src/pages/Records/index.tsx`:
```tsx
import { useEffect, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../stores/useStore';
import { RecordList } from '../../components/RecordList';
import { AddRecordModal } from '../../components/AddRecordModal';
import { DeleteRecord } from '../../../wailsjs/go/main/App';
import styles from './Records.module.css';

export function Records() {
  const {
    currentYear,
    currentMonth,
    setCurrentDate,
    records,
    fetchRecords,
  } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentDate(currentYear - 1, 12);
    } else {
      setCurrentDate(currentYear, currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentDate(currentYear + 1, 1);
    } else {
      setCurrentDate(currentYear, currentMonth + 1);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    try {
      await DeleteRecord(id);
      fetchRecords();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.monthSelector}>
          <button className={styles.navBtn} onClick={handlePrevMonth}>
            <ChevronLeft size={20} />
          </button>
          <span className={styles.currentMonth}>
            {currentYear}年{currentMonth}月
          </span>
          <button className={styles.navBtn} onClick={handleNextMonth}>
            <ChevronRight size={20} />
          </button>
        </div>
        <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          记一笔
        </button>
      </header>

      <div className={styles.content}>
        <RecordList
          records={records}
          onDelete={handleDelete}
        />
      </div>

      {showAddModal && (
        <AddRecordModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchRecords}
        />
      )}
    </div>
  );
}
```

**Step 2: 创建样式**

Create `frontend/src/pages/Records/Records.module.css`:
```css
.page {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.monthSelector {
  display: flex;
  align-items: center;
  gap: 16px;
}

.navBtn {
  padding: 8px;
  border-radius: 8px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.navBtn:hover {
  background-color: var(--hover-bg);
  color: var(--text-primary);
}

.currentMonth {
  font-size: 20px;
  font-weight: 600;
  min-width: 120px;
  text-align: center;
}

.addBtn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: var(--accent-color);
  color: white;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
}

.addBtn:hover {
  filter: brightness(1.1);
}

.content {
  /* RecordList 自带样式 */
}
```

**Step 3: Commit**

```bash
git add frontend/src/pages/Records/
git commit -m "feat: implement Records page with month navigation"
```

---

### Task 4.4: 创建分析页面

**Files:**
- Create: `frontend/src/pages/Analysis/index.tsx`
- Create: `frontend/src/pages/Analysis/Analysis.module.css`

**Step 1: 创建分析页面**

Create `frontend/src/pages/Analysis/index.tsx`:
```tsx
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../stores/useStore';
import { CategoryPieChart, TrendLineChart, BalanceBarChart } from '../../components/Charts';
import styles from './Analysis.module.css';

type ChartType = 'pie' | 'trend' | 'balance';
type StatsType = 'income' | 'expense';

export function Analysis() {
  const {
    currentYear,
    setCurrentDate,
    categoryStats,
    trendStats,
    fetchCategoryStats,
    fetchTrendStats,
  } = useStore();

  const [chartType, setChartType] = useState<ChartType>('pie');
  const [statsType, setStatsType] = useState<StatsType>('expense');

  useEffect(() => {
    fetchCategoryStats();
    fetchTrendStats();
  }, [currentYear]);

  const handlePrevYear = () => {
    setCurrentDate(currentYear - 1, 1);
  };

  const handleNextYear = () => {
    setCurrentDate(currentYear + 1, 1);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.yearSelector}>
          <button className={styles.navBtn} onClick={handlePrevYear}>
            <ChevronLeft size={20} />
          </button>
          <span className={styles.currentYear}>{currentYear}年</span>
          <button className={styles.navBtn} onClick={handleNextYear}>
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      {/* 图表类型切换 */}
      <div className={styles.chartTabs}>
        <button
          className={`${styles.tab} ${chartType === 'pie' ? styles.active : ''}`}
          onClick={() => setChartType('pie')}
        >
          分类占比
        </button>
        <button
          className={`${styles.tab} ${chartType === 'trend' ? styles.active : ''}`}
          onClick={() => setChartType('trend')}
        >
          月度趋势
        </button>
        <button
          className={`${styles.tab} ${chartType === 'balance' ? styles.active : ''}`}
          onClick={() => setChartType('balance')}
        >
          收支对比
        </button>
      </div>

      {/* 图表区域 */}
      <div className={styles.chartContainer}>
        {chartType === 'pie' && (
          <>
            <div className={styles.statsToggle}>
              <button
                className={`${styles.toggleBtn} ${statsType === 'expense' ? styles.active : ''}`}
                onClick={() => setStatsType('expense')}
              >
                支出
              </button>
              <button
                className={`${styles.toggleBtn} ${statsType === 'income' ? styles.active : ''}`}
                onClick={() => setStatsType('income')}
              >
                收入
              </button>
            </div>
            <CategoryPieChart
              data={statsType === 'expense' ? categoryStats?.expenseStats || [] : categoryStats?.incomeStats || []}
              type={statsType}
            />
          </>
        )}

        {chartType === 'trend' && (
          <TrendLineChart data={trendStats} />
        )}

        {chartType === 'balance' && (
          <BalanceBarChart data={trendStats} />
        )}
      </div>
    </div>
  );
}
```

**Step 2: 创建样式**

Create `frontend/src/pages/Analysis/Analysis.module.css`:
```css
.page {
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.yearSelector {
  display: flex;
  align-items: center;
  gap: 16px;
}

.navBtn {
  padding: 8px;
  border-radius: 8px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.navBtn:hover {
  background-color: var(--hover-bg);
  color: var(--text-primary);
}

.currentYear {
  font-size: 24px;
  font-weight: 600;
  min-width: 100px;
  text-align: center;
}

.chartTabs {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
}

.tab {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  color: var(--text-secondary);
  background-color: var(--bg-card);
  transition: all 0.2s;
}

.tab:hover {
  color: var(--text-primary);
}

.tab.active {
  background-color: var(--accent-color);
  color: white;
}

.chartContainer {
  background-color: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow);
}

.statsToggle {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.toggleBtn {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  transition: all 0.2s;
}

.toggleBtn.active {
  color: white;
}

.toggleBtn.active:first-child {
  background-color: var(--expense-color);
}

.toggleBtn.active:last-child {
  background-color: var(--income-color);
}
```

**Step 3: Commit**

```bash
git add frontend/src/pages/Analysis/
git commit -m "feat: implement Analysis page with charts"
```

---

### Task 4.5: 创建设置页面

**Files:**
- Create: `frontend/src/pages/Settings/index.tsx`
- Create: `frontend/src/pages/Settings/Settings.module.css`

**Step 1: 创建设置页面**

Create `frontend/src/pages/Settings/index.tsx`:
```tsx
import { useEffect, useState } from 'react';
import { Plus, Trash2, Download, Upload, Moon, Sun } from 'lucide-react';
import { useStore } from '../../stores/useStore';
import {
  CreateCategory,
  DeleteCategory,
  ExportToCSV,
  ExportToJSON,
  ImportFromCSV,
  ImportFromJSON,
} from '../../../wailsjs/go/main/App';
import type { RecordType } from '../../types';
import styles from './Settings.module.css';

export function Settings() {
  const { theme, toggleTheme, categories, fetchCategories } = useStore();

  const [activeTab, setActiveTab] = useState<RecordType>('expense');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories(activeTab);
  }, [activeTab]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    setLoading(true);
    try {
      await CreateCategory(
        newCategoryName.trim(),
        newCategoryIcon || '📦',
        activeTab
      );
      setNewCategoryName('');
      setNewCategoryIcon('');
      fetchCategories(activeTab);
    } catch (error) {
      console.error('创建分类失败:', error);
      alert('创建分类失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('确定要删除这个分类吗？')) return;

    try {
      await DeleteCategory(id);
      fetchCategories(activeTab);
    } catch (error: any) {
      alert(error.message || '删除失败');
    }
  };

  const handleExportCSV = async () => {
    try {
      const path = await ExportToCSV();
      if (path) {
        alert(`导出成功：${path}`);
      }
    } catch (error) {
      console.error('导出失败:', error);
    }
  };

  const handleExportJSON = async () => {
    try {
      const path = await ExportToJSON();
      if (path) {
        alert(`导出成功：${path}`);
      }
    } catch (error) {
      console.error('导出失败:', error);
    }
  };

  const handleImportCSV = async () => {
    try {
      const count = await ImportFromCSV();
      alert(`成功导入 ${count} 条记录`);
    } catch (error) {
      console.error('导入失败:', error);
    }
  };

  const handleImportJSON = async () => {
    try {
      const count = await ImportFromJSON();
      alert(`成功导入 ${count} 条记录`);
    } catch (error) {
      console.error('导入失败:', error);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>设置</h1>

      {/* 主题切换 */}
      <section className={styles.section}>
        <h2>外观</h2>
        <div className={styles.card}>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
              <span>主题模式</span>
            </div>
            <button className={styles.themeBtn} onClick={toggleTheme}>
              {theme === 'light' ? '浅色' : '深色'}
            </button>
          </div>
        </div>
      </section>

      {/* 分类管理 */}
      <section className={styles.section}>
        <h2>分类管理</h2>
        <div className={styles.card}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'expense' ? styles.active : ''}`}
              onClick={() => setActiveTab('expense')}
            >
              支出分类
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'income' ? styles.active : ''}`}
              onClick={() => setActiveTab('income')}
            >
              收入分类
            </button>
          </div>

          <div className={styles.categoryList}>
            {categories.map((cat) => (
              <div key={cat.id} className={styles.categoryItem}>
                <span className={styles.categoryIcon}>{cat.icon}</span>
                <span className={styles.categoryName}>{cat.name}</span>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteCategory(cat.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className={styles.addCategory}>
            <input
              type="text"
              placeholder="图标(emoji)"
              value={newCategoryIcon}
              onChange={(e) => setNewCategoryIcon(e.target.value)}
              className={styles.iconInput}
            />
            <input
              type="text"
              placeholder="分类名称"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className={styles.nameInput}
            />
            <button
              className={styles.addBtn}
              onClick={handleAddCategory}
              disabled={loading || !newCategoryName.trim()}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* 数据管理 */}
      <section className={styles.section}>
        <h2>数据管理</h2>
        <div className={styles.card}>
          <div className={styles.dataActions}>
            <div className={styles.actionGroup}>
              <h3><Download size={18} /> 导出数据</h3>
              <div className={styles.buttons}>
                <button className={styles.actionBtn} onClick={handleExportCSV}>
                  导出 CSV
                </button>
                <button className={styles.actionBtn} onClick={handleExportJSON}>
                  导出 JSON
                </button>
              </div>
            </div>
            <div className={styles.actionGroup}>
              <h3><Upload size={18} /> 导入数据</h3>
              <div className={styles.buttons}>
                <button className={styles.actionBtn} onClick={handleImportCSV}>
                  导入 CSV
                </button>
                <button className={styles.actionBtn} onClick={handleImportJSON}>
                  导入 JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
```

**Step 2: 创建样式**

Create `frontend/src/pages/Settings/Settings.module.css`:
```css
.page {
  max-width: 800px;
  margin: 0 auto;
}

.title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
}

.section {
  margin-bottom: 32px;
}

.section h2 {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.card {
  background-color: var(--bg-card);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--shadow);
}

.settingItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
}

.settingInfo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-primary);
}

.themeBtn {
  padding: 8px 16px;
  border-radius: 8px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 500;
  transition: all 0.2s;
}

.themeBtn:hover {
  background-color: var(--hover-bg);
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.tab:hover {
  color: var(--text-primary);
}

.tab.active {
  background-color: var(--accent-color);
  color: white;
}

.categoryList {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.categoryItem {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
}

.categoryIcon {
  font-size: 20px;
}

.categoryName {
  flex: 1;
  font-weight: 500;
}

.deleteBtn {
  padding: 8px;
  border-radius: 8px;
  color: var(--text-muted);
  opacity: 0;
  transition: all 0.2s;
}

.categoryItem:hover .deleteBtn {
  opacity: 1;
}

.deleteBtn:hover {
  color: var(--expense-color);
  background-color: var(--hover-bg);
}

.addCategory {
  display: flex;
  gap: 8px;
}

.iconInput {
  width: 60px;
  padding: 12px;
  text-align: center;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 16px;
}

.nameInput {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 16px;
}

.addBtn {
  padding: 12px;
  background-color: var(--accent-color);
  color: white;
  border-radius: 8px;
  transition: all 0.2s;
}

.addBtn:hover:not(:disabled) {
  filter: brightness(1.1);
}

.addBtn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dataActions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.actionGroup h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.buttons {
  display: flex;
  gap: 8px;
}

.actionBtn {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 500;
  transition: all 0.2s;
}

.actionBtn:hover {
  background-color: var(--hover-bg);
}
```

**Step 3: Commit**

```bash
git add frontend/src/pages/Settings/
git commit -m "feat: implement Settings page with category and data management"
```

---

### Task 4.6: 配置路由和入口

**Files:**
- Modify: `frontend/src/App.tsx`

**Step 1: 更新 App.tsx**

Replace `frontend/src/App.tsx`:
```tsx
import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Records } from './pages/Records';
import { Analysis } from './pages/Analysis';
import { Settings } from './pages/Settings';
import { useStore } from './stores/useStore';

function App() {
  const { theme } = useStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="records" element={<Records />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
```

**Step 2: 安装 react-router-dom（如果未安装）**

Run:
```bash
cd /Users/zhangjinhui/Desktop/dog-view/frontend
npm install react-router-dom
```

**Step 3: Commit**

```bash
git add frontend/src/App.tsx frontend/package.json frontend/package-lock.json
git commit -m "feat: configure React Router and app entry"
```

---

## Phase 5: 构建与测试

### Task 5.1: 验证构建

**Step 1: 构建前端**

Run:
```bash
cd /Users/zhangjinhui/Desktop/dog-view/frontend && npm run build
```

Expected: 构建成功，无错误

**Step 2: 运行 Wails 开发模式**

Run:
```bash
cd /Users/zhangjinhui/Desktop/dog-view && wails dev
```

Expected: 应用启动，显示完整 UI

**Step 3: 测试核心功能**

手动测试：
1. 添加一条支出记录
2. 添加一条收入记录
3. 查看首页统计数据
4. 切换月份查看记录
5. 查看分析图表
6. 添加自定义分类
7. 切换主题
8. 导出数据

**Step 4: 构建生产版本**

Run:
```bash
cd /Users/zhangjinhui/Desktop/dog-view && wails build
```

Expected: 在 `build/bin/` 目录生成可执行文件

**Step 5: Final Commit**

```bash
git add .
git commit -m "feat: complete Dog View v1.0 - personal finance tracker"
```

---

## 完成检查清单

- [ ] Wails 项目初始化
- [ ] Go 数据模型定义
- [ ] SQLite Repository 实现
- [ ] Service 层实现
- [ ] 导入导出功能
- [ ] Wails 绑定层
- [ ] 前端类型定义
- [ ] Zustand 状态管理
- [ ] 主题系统
- [ ] Layout 和 Sidebar
- [ ] CategoryCard 组件
- [ ] AmountInput 组件
- [ ] RecordList 组件
- [ ] 图表组件（饼图、折线图、柱状图）
- [ ] AddRecordModal 组件
- [ ] Home 页面
- [ ] Records 页面
- [ ] Analysis 页面
- [ ] Settings 页面
- [ ] 路由配置
- [ ] 构建测试

---

*计划版本: v1.0*
*预计任务数: 25 个步骤*
*预计完成时间: 4-6 小时*
