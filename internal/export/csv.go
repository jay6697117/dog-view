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
