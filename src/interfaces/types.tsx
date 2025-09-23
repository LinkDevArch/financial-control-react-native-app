// User Info

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  enable: boolean;
  createdAt: string;
}

//Reporte

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
}

export interface Report {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
  topExpenseCategories: CategorySummary[];
  topIncomeCategories: CategorySummary[];
}

//Deudas

export interface RecentPayment {
  id: number;
  amount: number;
  paymentDate: string;
  notes: string;
  debtId: number;
}

export interface Debt {
  id: number;
  description: string;
  initialAmount: number;
  currentAmount: number;
  interestRate: number;
  type: string;
  creditorName: string;
  startDate: string;
  dueDate: string;
  status: string;
  createdAt: string;
  paymentProgress: number;
}

// Paginación

export interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface DebtResponse {
  content: Debt[];
  page: PageInfo;
}

export interface DebtCreateDTO {
  description: string;
  initialAmount: number;
  interestRate: number;
  type: string;
  creditorName: string;
  startDate: string;
  dueDate: string;
}

export interface DebtUpdateDTO {
  description: string;
  initialAmount: number;
  interestRate: number;
  type: string;
  creditorName: string;
  dueDate: string;
}

export interface DebtPaymentCreateDTO {
  amount: number;
  paymentDate: string;
  notes: string;
}

export interface DebtPaymentResponse {
  content: RecentPayment[];
  page: PageInfo;
}

// Goals

export interface Goal {
  id: number;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  targetDate: string;
  status: string;
  createdAt: string;
  progressPercentage: number;
}

export interface GoalCreateDTO {
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  targetDate: string;
}

export interface GoalUpdateDTO {
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  targetDate: string;
  status: string;
}

export interface GoalResponse {
  content: Goal[];
  page: PageInfo;
}

export interface Deposit {
  id: number;
  amount: number;
  createdAt: string;
  goalId: number;
}

export interface DepositCreateDTO {
  amount: number;
}

export interface DepositResponse {
  content: Deposit[];
  page: PageInfo;
}

// Recent Transactions

export interface TransactionResponse {
  transactionType: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

// Expenses

export interface ExpenseDTO {
  id: number;
  description: string;
  amount: number;
  creationDate: string;
  categoryId: number;
  categoryName: string;
}

export interface ExpenseCreateDTO {
  description: string;
  amount: number;
  creationDate: string;
  categoryName: string;
}

export interface ExpensesResponse {
  content: ExpenseDTO[];
  page: PageInfo;
}

// Incomes

export interface IncomeDTO {
  id: number;
  description: string;
  amount: number;
  creationDate: string;
  sourceName: string;
  accountName: string;
}

export interface IncomeCreateDTO {
  description: string;
  amount: number;
  creationDate: string;
  sourceName: string;
  accountName: string;
}

export interface IncomesResponse {
  content: IncomeDTO[];
  page: PageInfo;
}

// Category

export interface CategoryDTO {
  id: number;
  name: string;
}

export interface CategoryCreateDTO {
  name: string;
}

export interface CategoryUpdateDTO {
  name: string;
}

export interface CategoryResponse {
  content: CategoryDTO[];
  page: PageInfo;
}

// Income Source

export interface IncomeSourceDTO {
  id: number;
  name: string;
}

export interface IncomeSourceCreateDTO {
  name: string;
}

export interface IncomeSourceUpdateDTO {
  name: string;
}

export interface IncomeSourceResponse {
  content: IncomeSourceDTO[];
  page: PageInfo;
}

// Accounts

export interface AccountDTO {
  id: number;
  name: string;
}

export interface AccountCreateDTO {
  name: string;
}

export interface AccountUpdateDTO {
  name: string;
}

export interface AccountResponse {
  content: AccountDTO[];
  page: PageInfo;
}

// Incomes Vs Expense

export interface MonthData {
  income: number;
  expenses: number;
  balance: number;
}

export interface MonthlyComparison {
  [key: string]: MonthData; // formato "YYYY-MM"
}

export interface IncomesVsExpensesResponse {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  savingsRate: number;
  monthlyComparison: MonthlyComparison;
}
