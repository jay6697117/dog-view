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

// Ensure time package is used
var _ = time.Now
