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
