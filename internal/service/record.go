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
