export namespace model {
	
	export class Category {
	    id: number;
	    name: string;
	    icon: string;
	    type: string;
	    sortOrder: number;
	    // Go type: time
	    createdAt: any;
	
	    static createFrom(source: any = {}) {
	        return new Category(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.icon = source["icon"];
	        this.type = source["type"];
	        this.sortOrder = source["sortOrder"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CategoryStat {
	    categoryId: number;
	    categoryName: string;
	    categoryIcon: string;
	    amount: number;
	    percentage: number;
	
	    static createFrom(source: any = {}) {
	        return new CategoryStat(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.categoryId = source["categoryId"];
	        this.categoryName = source["categoryName"];
	        this.categoryIcon = source["categoryIcon"];
	        this.amount = source["amount"];
	        this.percentage = source["percentage"];
	    }
	}
	export class CategoryStatsResponse {
	    incomeStats: CategoryStat[];
	    expenseStats: CategoryStat[];
	
	    static createFrom(source: any = {}) {
	        return new CategoryStatsResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.incomeStats = this.convertValues(source["incomeStats"], CategoryStat);
	        this.expenseStats = this.convertValues(source["expenseStats"], CategoryStat);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class MonthSummary {
	    totalIncome: number;
	    totalExpense: number;
	    balance: number;
	
	    static createFrom(source: any = {}) {
	        return new MonthSummary(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.totalIncome = source["totalIncome"];
	        this.totalExpense = source["totalExpense"];
	        this.balance = source["balance"];
	    }
	}
	export class MonthTrend {
	    month: string;
	    income: number;
	    expense: number;
	
	    static createFrom(source: any = {}) {
	        return new MonthTrend(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.month = source["month"];
	        this.income = source["income"];
	        this.expense = source["expense"];
	    }
	}
	export class Record {
	    id: number;
	    amount: number;
	    type: string;
	    categoryId: number;
	    category?: Category;
	    note: string;
	    date: string;
	    // Go type: time
	    createdAt: any;
	
	    static createFrom(source: any = {}) {
	        return new Record(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.amount = source["amount"];
	        this.type = source["type"];
	        this.categoryId = source["categoryId"];
	        this.category = this.convertValues(source["category"], Category);
	        this.note = source["note"];
	        this.date = source["date"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

