package errors

import "errors"

var (
	ErrCategoryNotFound  = errors.New("分类不存在")
	ErrCategoryInUse     = errors.New("分类正在使用中，无法删除")
	ErrRecordNotFound    = errors.New("记录不存在")
	ErrInvalidAmount     = errors.New("金额无效")
	ErrInvalidDate       = errors.New("日期格式错误")
	ErrImportFailed      = errors.New("导入失败")
	ErrDuplicateCategory = errors.New("分类名称已存在")
)
