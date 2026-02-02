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
