package export

import (
	"encoding/json"
	"os"
	"time"

	"dog-view/internal/model"
)

// ExportData JSON 导出数据结构
type ExportData struct {
	ExportDate string           `json:"exportDate"`
	Records    []ExportRecord   `json:"records"`
	Categories []ExportCategory `json:"categories"`
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
