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
