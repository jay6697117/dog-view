# 个人收支记账工具设计文档

> 项目名称：Dog View
> 技术栈：Go + Wails + React
> 创建日期：2026-02-01

---

## 1. 项目概述

### 1.1 核心定位
事后记录型个人月度收支记账工具，专注于：
- 手动录入每月消费记录
- 多维度可视化分析（分类占比、时间趋势、收支对比）
- 自定义分类管理

### 1.2 设计原则
- **简单优先**：V1 只做核心功能，不加额外特性
- **快速录入**：卡片快捷式，两步完成记账
- **本地优先**：SQLite 存储，支持导入导出备份

---

## 2. 项目结构

```
dog-view/
├── main.go                 # Wails 入口
├── app.go                  # 应用主结构，暴露给前端的方法
├── wails.json              # Wails 配置
│
├── internal/
│   ├── model/              # 数据模型
│   │   ├── record.go       # 记账记录
│   │   └── category.go     # 分类
│   ├── service/            # 业务逻辑
│   │   ├── record.go       # 记录增删改查、统计
│   │   └── category.go     # 分类管理
│   ├── repository/         # 数据库操作
│   │   └── sqlite.go       # SQLite 实现
│   └── export/             # 导入导出
│       ├── csv.go          # CSV 处理
│       └── json.go         # JSON 处理
│
├── frontend/
│   ├── src/
│   │   ├── components/     # UI 组件
│   │   │   ├── CategoryCard/
│   │   │   ├── RecordList/
│   │   │   ├── AmountInput/
│   │   │   ├── Charts/
│   │   │   └── ThemeToggle/
│   │   ├── pages/          # 页面
│   │   │   ├── Home/
│   │   │   ├── Records/
│   │   │   ├── Analysis/
│   │   │   └── Settings/
│   │   ├── hooks/          # 自定义 hooks
│   │   ├── stores/         # 状态管理 (Zustand)
│   │   ├── styles/         # 主题样式
│   │   └── utils/          # 工具函数
│   ├── index.html
│   └── package.json
│
└── build/                  # 构建产物
```

---

## 3. 数据模型

### 3.1 SQLite 表结构

```sql
-- 分类表
CREATE TABLE categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    icon        TEXT,           -- emoji 或图标名
    type        TEXT NOT NULL,  -- 'income' | 'expense'
    sort_order  INTEGER DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 记账记录表
CREATE TABLE records (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    amount      DECIMAL(10,2) NOT NULL,
    type        TEXT NOT NULL,  -- 'income' | 'expense'
    category_id INTEGER NOT NULL,
    note        TEXT,           -- 备注（可选）
    date        DATE NOT NULL,  -- 消费日期
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 索引优化查询
CREATE INDEX idx_records_date ON records(date);
CREATE INDEX idx_records_category ON records(category_id);
```

### 3.2 Go 模型定义

```go
// internal/model/category.go
type Category struct {
    ID        int64     `json:"id"`
    Name      string    `json:"name"`
    Icon      string    `json:"icon"`
    Type      string    `json:"type"` // "income" | "expense"
    SortOrder int       `json:"sortOrder"`
    CreatedAt time.Time `json:"createdAt"`
}

// internal/model/record.go
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

### 3.3 默认分类预设

首次启动时初始化默认分类：

**支出分类**：
| 图标 | 名称 |
|------|------|
| 🍜 | 餐饮 |
| 🚇 | 交通 |
| 🛒 | 购物 |
| 🎮 | 娱乐 |
| 🏠 | 居住 |
| 💊 | 医疗 |
| 📚 | 学习 |
| 📦 | 其他 |

**收入分类**：
| 图标 | 名称 |
|------|------|
| 💰 | 工资 |
| 🎁 | 奖金 |
| 📈 | 投资 |
| 💸 | 其他收入 |

---

## 4. Go 服务层设计

### 4.1 Service 接口

```go
// internal/service/category.go
type CategoryService interface {
    List(recordType string) ([]model.Category, error)
    Create(category *model.Category) error
    Update(category *model.Category) error
    Delete(id int64) error
    Reorder(ids []int64) error
}

// internal/service/record.go
type RecordService interface {
    // CRUD
    Create(record *model.Record) error
    Update(record *model.Record) error
    Delete(id int64) error
    GetByID(id int64) (*model.Record, error)

    // 查询
    ListByMonth(year, month int) ([]model.Record, error)

    // 统计
    GetMonthSummary(year, month int) (*MonthSummary, error)
    GetCategoryStats(year, month int) ([]CategoryStat, error)
    GetTrendStats(year int) ([]MonthTrend, error)
}
```

### 4.2 统计数据结构

```go
// 月度汇总
type MonthSummary struct {
    TotalIncome  float64 `json:"totalIncome"`
    TotalExpense float64 `json:"totalExpense"`
    Balance      float64 `json:"balance"`
}

// 分类统计（饼图数据）
type CategoryStat struct {
    CategoryID   int64   `json:"categoryId"`
    CategoryName string  `json:"categoryName"`
    CategoryIcon string  `json:"categoryIcon"`
    Amount       float64 `json:"amount"`
    Percentage   float64 `json:"percentage"`
}

// 月度趋势（折线图数据）
type MonthTrend struct {
    Month   string  `json:"month"` // "2024-01"
    Income  float64 `json:"income"`
    Expense float64 `json:"expense"`
}
```

### 4.3 Repository 层

```go
// internal/repository/sqlite.go
type SQLiteRepository struct {
    db *sql.DB
}

func NewSQLiteRepository(dbPath string) (*SQLiteRepository, error)
func (r *SQLiteRepository) InitSchema() error
func (r *SQLiteRepository) InitDefaultCategories() error

// Category 操作
func (r *SQLiteRepository) ListCategories(recordType string) ([]model.Category, error)
func (r *SQLiteRepository) CreateCategory(c *model.Category) error
func (r *SQLiteRepository) UpdateCategory(c *model.Category) error
func (r *SQLiteRepository) DeleteCategory(id int64) error

// Record 操作
func (r *SQLiteRepository) CreateRecord(rec *model.Record) error
func (r *SQLiteRepository) UpdateRecord(rec *model.Record) error
func (r *SQLiteRepository) DeleteRecord(id int64) error
func (r *SQLiteRepository) GetRecordByID(id int64) (*model.Record, error)
func (r *SQLiteRepository) ListRecordsByMonth(year, month int) ([]model.Record, error)

// 统计查询
func (r *SQLiteRepository) GetMonthSummary(year, month int) (*MonthSummary, error)
func (r *SQLiteRepository) GetCategoryStats(year, month int, recordType string) ([]CategoryStat, error)
func (r *SQLiteRepository) GetMonthlyTrends(year int) ([]MonthTrend, error)
```

---

## 5. Wails 绑定层

### 5.1 App 结构

```go
// app.go
type App struct {
    ctx             context.Context
    categoryService service.CategoryService
    recordService   service.RecordService
    exportService   service.ExportService
}

func NewApp() *App
func (a *App) Startup(ctx context.Context)
func (a *App) Shutdown(ctx context.Context)
```

### 5.2 暴露给前端的方法

```go
// 分类管理
func (a *App) GetCategories(recordType string) ([]model.Category, error)
func (a *App) CreateCategory(name, icon, recordType string) error
func (a *App) UpdateCategory(id int64, name, icon string) error
func (a *App) DeleteCategory(id int64) error
func (a *App) ReorderCategories(ids []int64) error

// 记录管理
func (a *App) CreateRecord(amount float64, recordType string, categoryID int64, note, date string) error
func (a *App) UpdateRecord(id int64, amount float64, categoryID int64, note, date string) error
func (a *App) DeleteRecord(id int64) error
func (a *App) GetRecordsByMonth(year, month int) ([]model.Record, error)

// 统计分析
func (a *App) GetMonthSummary(year, month int) (*MonthSummary, error)
func (a *App) GetCategoryStats(year, month int) (*CategoryStatsResponse, error)
func (a *App) GetTrendStats(year int) ([]MonthTrend, error)

// 导入导出
func (a *App) ExportToCSV(year, month int) (string, error)
func (a *App) ExportToJSON(year, month int) (string, error)
func (a *App) ImportFromCSV(filePath string) error
func (a *App) ImportFromJSON(filePath string) error

// 系统
func (a *App) SelectExportPath() (string, error)  // 打开文件选择对话框
func (a *App) SelectImportFile() (string, error)
```

---

## 6. 前端设计

### 6.1 页面结构

```
┌─────────────────────────────────────────┐
│  Sidebar        │     Main Content      │
│  ┌───────────┐  │                       │
│  │ 📊 首页   │  │                       │
│  │ 📝 记录   │  │                       │
│  │ 📈 分析   │  │                       │
│  │ ⚙️ 设置   │  │                       │
│  └───────────┘  │                       │
│                 │                       │
│  ┌───────────┐  │                       │
│  │ 🌙 主题   │  │                       │
│  └───────────┘  │                       │
└─────────────────────────────────────────┘
```

### 6.2 页面功能

#### 首页 (Home)
- 当月收支概览卡片（总收入、总支出、结余）
- 快捷记账入口
- 本月分类占比环形图
- 最近 5 条记录

#### 记录页 (Records)
- 月份选择器
- 记录列表（按日期分组）
- 左滑删除、点击编辑
- 底部浮动「+」按钮触发记账

#### 分析页 (Analysis)
- 月份/年份切换
- 分类占比饼图（支出/收入切换）
- 月度趋势折线图
- 收支对比柱状图

#### 设置页 (Settings)
- 分类管理（增删改、拖拽排序）
- 数据导出（CSV/JSON）
- 数据导入
- 主题切换

### 6.3 核心组件

#### CategoryCard - 分类卡片
```tsx
interface CategoryCardProps {
  category: Category;
  selected?: boolean;
  onClick: () => void;
}
```
- 展示图标 + 名称
- 选中态高亮
- 网格布局展示

#### AmountInput - 金额输入
```tsx
interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
}
```
- 大字体数字显示
- 数字键盘（可选）
- 回车确认

#### RecordList - 记录列表
```tsx
interface RecordListProps {
  records: Record[];
  onEdit: (record: Record) => void;
  onDelete: (id: number) => void;
}
```
- 按日期分组
- 显示分类图标、金额、备注
- 支出红色、收入绿色

### 6.4 记账流程

```
┌─────────────────────────────────────┐
│         选择类型                     │
│   ┌─────────┐    ┌─────────┐        │
│   │  支出   │    │  收入   │        │
│   └─────────┘    └─────────┘        │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│         选择分类                     │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│  │ 🍜 │ │ 🚇 │ │ 🛒 │ │ 🎮 │       │
│  │餐饮│ │交通│ │购物│ │娱乐│       │
│  └────┘ └────┘ └────┘ └────┘       │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│  │ 🏠 │ │ 💊 │ │ 📚 │ │ 📦 │       │
│  │居住│ │医疗│ │学习│ │其他│       │
│  └────┘ └────┘ └────┘ └────┘       │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│         输入金额                     │
│                                     │
│           ¥ 35.00                   │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 备注（可选）                 │    │
│  └─────────────────────────────┘    │
│                                     │
│  日期: 2024-01-15  ▼                │
│                                     │
│         [ 确认记账 ]                 │
└─────────────────────────────────────┘
```

---

## 7. 可视化图表

使用 **Recharts** 库实现图表。

### 7.1 分类占比饼图

```tsx
// components/Charts/CategoryPieChart.tsx
interface CategoryPieChartProps {
  data: CategoryStat[];
  type: 'income' | 'expense';
}
```

特性：
- 环形图样式
- 中心显示总金额
- 图例显示分类名称和百分比
- 点击扇区高亮显示明细

### 7.2 月度趋势图

```tsx
// components/Charts/TrendLineChart.tsx
interface TrendLineChartProps {
  data: MonthTrend[];
  year: number;
}
```

特性：
- 双折线（收入/支出）
- X 轴: 月份 (1-12)
- Y 轴: 金额
- Tooltip 显示具体数值
- 支持切换年份

### 7.3 收支对比柱状图

```tsx
// components/Charts/BalanceBarChart.tsx
interface BalanceBarChartProps {
  data: MonthTrend[];
  year: number;
}
```

特性：
- 双柱对比（收入绿 / 支出红）
- 显示每月结余金额
- 鼠标悬停显示详情

---

## 8. 主题系统

### 8.1 CSS 变量定义

```css
/* styles/themes.css */
:root {
  /* 浅色主题 */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-card: #ffffff;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
  --income-color: #4caf50;
  --expense-color: #f44336;
  --accent-color: #2196f3;
}

[data-theme='dark'] {
  /* 深色主题 */
  --bg-primary: #121212;
  --bg-secondary: #1e1e1e;
  --bg-card: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --border-color: #404040;
  --income-color: #66bb6a;
  --expense-color: #ef5350;
  --accent-color: #42a5f5;
}
```

### 8.2 主题切换 Hook

```tsx
// hooks/useTheme.ts
function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // 读取系统偏好或本地存储
    const savedTheme = localStorage.getItem('theme');
    const systemPrefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(savedTheme || (systemPrefers ? 'dark' : 'light'));
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return { theme, toggleTheme };
}
```

---

## 9. 导入导出

### 9.1 CSV 格式

```csv
date,type,category,amount,note
2024-01-15,expense,餐饮,35.00,午餐外卖
2024-01-15,expense,交通,5.00,地铁
2024-01-16,income,工资,15000.00,1月工资
```

### 9.2 JSON 格式

```json
{
  "exportDate": "2024-02-01T10:00:00Z",
  "records": [
    {
      "date": "2024-01-15",
      "type": "expense",
      "category": "餐饮",
      "amount": 35.00,
      "note": "午餐外卖"
    }
  ],
  "categories": [
    {
      "name": "餐饮",
      "icon": "🍜",
      "type": "expense"
    }
  ]
}
```

### 9.3 导入逻辑

1. 解析文件，验证格式
2. 匹配分类名称（不存在则创建）
3. 检查重复记录（同日期+同金额+同分类）
4. 提示用户确认导入数量
5. 批量插入

---

## 10. 错误处理

### 10.1 Go 层错误

```go
// internal/errors/errors.go
var (
    ErrCategoryNotFound   = errors.New("分类不存在")
    ErrCategoryInUse      = errors.New("分类正在使用中，无法删除")
    ErrRecordNotFound     = errors.New("记录不存在")
    ErrInvalidAmount      = errors.New("金额无效")
    ErrInvalidDate        = errors.New("日期格式错误")
    ErrImportFailed       = errors.New("导入失败")
)
```

### 10.2 前端错误展示

- Toast 通知显示错误信息
- 表单验证错误内联显示
- 网络/系统错误全局 Error Boundary

---

## 11. 技术选型

### 11.1 Go 依赖

| 依赖 | 用途 |
|------|------|
| github.com/wailsapp/wails/v2 | 桌面应用框架 |
| github.com/mattn/go-sqlite3 | SQLite 驱动 |

### 11.2 前端依赖

| 依赖 | 用途 |
|------|------|
| react | UI 框架 |
| react-router-dom | 路由 |
| zustand | 状态管理（轻量） |
| recharts | 图表库 |
| dayjs | 日期处理 |
| lucide-react | 图标库 |

### 11.3 开发工具

| 工具 | 用途 |
|------|------|
| Vite | 前端构建 |
| TypeScript | 类型安全 |
| ESLint + Prettier | 代码规范 |

---

## 12. 实现里程碑

### Phase 1: 基础框架
- [ ] Wails 项目初始化
- [ ] SQLite 数据库初始化
- [ ] 基础数据模型和 Repository

### Phase 2: 核心功能
- [ ] 分类管理 CRUD
- [ ] 记录管理 CRUD
- [ ] 月度记录列表

### Phase 3: 记账体验
- [ ] 卡片快捷式录入 UI
- [ ] 收入/支出切换
- [ ] 日期选择器

### Phase 4: 可视化分析
- [ ] 月度汇总卡片
- [ ] 分类占比饼图
- [ ] 月度趋势折线图
- [ ] 收支对比柱状图

### Phase 5: 辅助功能
- [ ] 主题切换
- [ ] CSV/JSON 导出
- [ ] CSV/JSON 导入

### Phase 6: 打磨优化
- [ ] 错误处理完善
- [ ] UI 细节调整
- [ ] 性能优化

---

## 附录 A: 数据库文件位置

```go
// 默认存储路径
// macOS: ~/Library/Application Support/DogView/data.db
// Windows: %APPDATA%/DogView/data.db
// Linux: ~/.local/share/DogView/data.db
```

---

## 附录 B: 快捷键规划 (可选未来功能)

| 快捷键 | 功能 |
|--------|------|
| `Cmd/Ctrl + N` | 新建记录 |
| `Cmd/Ctrl + ,` | 打开设置 |
| `Cmd/Ctrl + E` | 导出数据 |

---

*文档版本: v1.0*
*最后更新: 2026-02-01*
