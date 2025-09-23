import axios, { AxiosRequestConfig } from "axios";
import { ApiService } from "../services/ApiService";
import type { 
  DepositCreateDTO, 
  ExpenseCreateDTO, 
  GoalCreateDTO, 
  GoalUpdateDTO, 
  IncomeCreateDTO, 
  DebtCreateDTO, 
  DebtUpdateDTO, 
  DebtPaymentCreateDTO,
  CategoryCreateDTO,
  CategoryUpdateDTO,
  CategoryResponse,
  IncomeSourceCreateDTO,
  IncomeSourceUpdateDTO,
  IncomeSourceResponse,
  AccountCreateDTO,
  AccountUpdateDTO,
  AccountResponse
} from "../interfaces/types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const ENDPOINTS = {
  expenses: `${API_BASE_URL}/auth/expenses`,
  incomes: `${API_BASE_URL}/auth/incomes`,
  goals: `${API_BASE_URL}/auth/goals`,
  debts: `${API_BASE_URL}/auth/debts`,
  categories: `${API_BASE_URL}/auth/categories`,
  incomeSources: `${API_BASE_URL}/auth/income-sources`,
  accounts: `${API_BASE_URL}/auth/accounts`,
} as const;

// Función para obtener configuración de axios con headers actualizados
const getAxiosConfig = (): AxiosRequestConfig => ({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Obtener instancia configurada de Axios
const apiClient = ApiService.getInstance();

// Interfaz genérica para resultados de API
export interface ApiResult<T = any> {
  success: boolean;
  data?: T;
  error?: string[];
}

export type PostExpenseResult = ApiResult;
export type UpdateExpenseResult = ApiResult;
export type DeleteExpenseResult = ApiResult;
export type PostIncomeResult = ApiResult;
export type UpdateIncomeResult = ApiResult;
export type DeleteIncomeResult = ApiResult;
export type PostGoalResult = ApiResult;
export type UpdateGoalResult = ApiResult;
export type DeleteGoalResult = ApiResult;
export type PostGoalDepositResult = ApiResult;
export type PostDebtResult = ApiResult;
export type UpdateDebtResult = ApiResult;
export type DeleteDebtResult = ApiResult;
export type PostDebtPaymentResult = ApiResult;
export type GetDebtPaymentsResult = ApiResult;

// Categories
export type PostCategoryResult = ApiResult;
export type UpdateCategoryResult = ApiResult;
export type DeleteCategoryResult = ApiResult;

// Income Sources
export type PostIncomeSourceResult = ApiResult;
export type UpdateIncomeSourceResult = ApiResult;
export type DeleteIncomeSourceResult = ApiResult;

// Accounts
export type PostAccountResult = ApiResult;
export type UpdateAccountResult = ApiResult;
export type DeleteAccountResult = ApiResult;

function handleApiError(error: any, operation: string): { success: false; error: string[] } {
  if (process.env.NODE_ENV !== "production") {
    console.group(`🚨 Error en ${operation}`);
    console.error("Error completo:", error);
    console.error("URL:", error.config?.url);
    console.error("Método:", error.config?.method);
    console.groupEnd();
  }

  // Timeout específico
  if (error.code === "ECONNABORTED" || error.message?.toLowerCase().includes("timeout")) {
    return {
      success: false,
      error: ["El servidor tardó en responder. Intenta de nuevo."],
    };
  }

  // Error de red (sin conexión)
  if (!error.response) {
    return {
      success: false,
      error: ["Sin conexión a internet. Verifica tu conexión."],
    };
  }

  // Errores de respuesta del servidor con códigos específicos
  const { data, status } = error.response;
  
  // Error 401 - No autorizado
  if (status === 401) {
    return {
      success: false,
      error: ["Sesión expirada. Por favor, inicia sesión nuevamente."],
    };
  }

  // Error 403 - Prohibido
  if (status === 403) {
    return {
      success: false,
      error: ["No tienes permisos para realizar esta acción."],
    };
  }

  // Error 404 - No encontrado
  if (status === 404) {
    return {
      success: false,
      error: ["El recurso solicitado no fue encontrado."],
    };
  }

  // Error 500 - Error del servidor
  if (status >= 500) {
    return {
      success: false,
      error: ["Error interno del servidor. Intenta más tarde."],
    };
  }

  // Procesar errores de datos del servidor
  if (data) {
    if (typeof data.errorCode === "string") {
      return { success: false, error: [data.errorCode] };
    }
    if (Array.isArray(data.errors)) {
      return { success: false, error: data.errors };
    }
    if (typeof data.errors === "string") {
      return { success: false, error: [data.errors] };
    }
    if (data.message) {
      return { success: false, error: [data.message] };
    }
  }

  // Error genérico con más contexto
  return { 
    success: false, 
    error: [`Error inesperado en ${operation}. Código: ${status || 'desconocido'}`] 
  };
}

// Función genérica para llamadas API con retry automático
async function makeApiCall<T>(
  apiCall: () => Promise<any>,
  operation: string,
  retries: number = 0
): Promise<ApiResult<T>> {
  try {
    const response = await apiCall();
    return { success: true, data: response.data };
  } catch (error: any) {
    if (retries < 1 && (!error.response || error.code === "ECONNABORTED")) {
      console.log(`🔄 Reintentando ${operation}...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return makeApiCall(apiCall, operation, retries + 1);
    }
    
    return handleApiError(error, operation);
  }
}

// Función helper para operaciones batch
export async function batchApiCalls<T>(
  calls: Array<() => Promise<ApiResult<T>>>,
  operation: string
): Promise<ApiResult<T[]>> {
  try {
    const results = await Promise.allSettled(calls.map(call => call()));
    const successful: T[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success && result.value.data) {
        successful.push(result.value.data);
      } else if (result.status === 'fulfilled' && !result.value.success) {
        errors.push(...(result.value.error || [`Error en operación ${index + 1}`]));
      } else {
        errors.push(`Error en operación ${index + 1}`);
      }
    });

    if (errors.length > 0) {
      return { success: false, error: errors };
    }

    return { success: true, data: successful };
  } catch (error) {
    return { success: false, error: [`Error en operación batch: ${operation}`] };
  }
}

// ==================== EXPENSES ====================

export async function postExpense(data: ExpenseCreateDTO): Promise<PostExpenseResult> {
  return makeApiCall(
    () => apiClient.post(ENDPOINTS.expenses, data, getAxiosConfig()),
    "crear gasto"
  );
}

export async function updateExpense(id: number, data: ExpenseCreateDTO): Promise<UpdateExpenseResult> {
  return makeApiCall(
    () => apiClient.put(`${ENDPOINTS.expenses}/${id}`, data, getAxiosConfig()),
    "actualizar gasto"
  );
}

export async function deleteExpense(id: number): Promise<DeleteExpenseResult> {
  return makeApiCall(
    () => apiClient.delete(`${ENDPOINTS.expenses}/${id}`, getAxiosConfig()),
    "eliminar gasto"
  );
}

// ==================== INCOMES ====================

export async function postIncome(data: IncomeCreateDTO): Promise<PostIncomeResult> {
  return makeApiCall(
    () => apiClient.post(ENDPOINTS.incomes, data, getAxiosConfig()),
    "crear ingreso"
  );
}

export async function updateIncome(id: number, data: IncomeCreateDTO): Promise<UpdateIncomeResult> {
  return makeApiCall(
    () => apiClient.put(`${ENDPOINTS.incomes}/${id}`, data, getAxiosConfig()),
    "actualizar ingreso"
  );
}

export async function deleteIncome(id: number): Promise<DeleteIncomeResult> {
  return makeApiCall(
    () => apiClient.delete(`${ENDPOINTS.incomes}/${id}`, getAxiosConfig()),
    "eliminar ingreso"
  );
}

// ==================== GOALS ====================

export async function postGoal(data: GoalCreateDTO): Promise<PostGoalResult> {
  return makeApiCall(
    () => apiClient.post(ENDPOINTS.goals, data, getAxiosConfig()),
    "crear meta"
  );
}

export async function updateGoal(id: number, data: GoalUpdateDTO): Promise<UpdateGoalResult> {
  return makeApiCall(
    () => apiClient.put(`${ENDPOINTS.goals}/${id}`, data, getAxiosConfig()),
    "actualizar meta"
  );
}

export async function deleteGoal(id: number): Promise<DeleteGoalResult> {
  return makeApiCall(
    () => apiClient.delete(`${ENDPOINTS.goals}/${id}`, getAxiosConfig()),
    "crear meta"
  );
}

// DEPOSITS

export async function postDeposit(id: number, data: DepositCreateDTO): Promise<PostGoalDepositResult> {
  return makeApiCall(
    () => apiClient.post(`${ENDPOINTS.goals}/deposit/${id}`, data, getAxiosConfig()),
    "crear deposito"
  );
}

// // ==================== BATCH OPERATIONS ====================

// // Operaciones batch para mejorar rendimiento
// export async function postMultipleExpenses(expenses: ExpenseCreateDTO[][]): Promise<ApiResult<any[]>> {
//   const calls = postExpense(expenses);
//   return batchApiCalls(calls, "crear múltiples gastos");
// }

// export async function postMultipleIncomes(incomes: IncomeCreateDTO[][]): Promise<ApiResult<any[]>> {
//   const calls = incomes.map(incomeGroup => 
//     () => postIncome(incomeGroup)
//   );
//   return batchApiCalls(calls, "crear múltiples ingresos");
// }

// ==================== UTILITY FUNCTIONS ====================

// Función para validar datos antes de enviar
export function validateExpenseData(data: ExpenseCreateDTO[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!Array.isArray(data) || data.length === 0) {
    errors.push("Debe proporcionar al menos un gasto");
  }
  
  data.forEach((expense, index) => {
    if (!expense.amount || expense.amount <= 0) {
      errors.push(`Gasto ${index + 1}: El monto debe ser mayor a 0`);
    }
    if (!expense.description?.trim()) {
      errors.push(`Gasto ${index + 1}: La descripción es requerida`);
    }
  });
  
  return { valid: errors.length === 0, errors };
}

export function validateIncomeData(data: IncomeCreateDTO[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!Array.isArray(data) || data.length === 0) {
    errors.push("Debe proporcionar al menos un ingreso");
  }
  
  data.forEach((income, index) => {
    if (!income.amount || income.amount <= 0) {
      errors.push(`Ingreso ${index + 1}: El monto debe ser mayor a 0`);
    }
    if (!income.description?.trim()) {
      errors.push(`Ingreso ${index + 1}: La descripción es requerida`);
    }
  });
  
  return { valid: errors.length === 0, errors };
}

// ===============================
// DEBT OPERATIONS
// ===============================

function validateDebtData(debt: DebtCreateDTO): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!debt.description?.trim()) {
    errors.push("La descripción es requerida");
  }
  if (!debt.initialAmount || debt.initialAmount <= 0) {
    errors.push("El monto inicial debe ser mayor a 0");
  }
  if (!debt.creditorName?.trim()) {
    errors.push("El nombre del acreedor es requerido");
  }
  if (!debt.type?.trim()) {
    errors.push("El tipo de deuda es requerido");
  }
  if (!debt.startDate?.trim()) {
    errors.push("La fecha de inicio es requerida");
  }
  if (!debt.dueDate?.trim()) {
    errors.push("La fecha de vencimiento es requerida");
  }
  
  return { valid: errors.length === 0, errors };
}

function validateDebtPaymentData(payment: DebtPaymentCreateDTO): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!payment.amount || payment.amount <= 0) {
    errors.push("El monto del pago debe ser mayor a 0");
  }
  if (!payment.paymentDate?.trim()) {
    errors.push("La fecha de pago es requerida");
  }
  
  return { valid: errors.length === 0, errors };
}

export async function postDebt(debt: DebtCreateDTO): Promise<PostDebtResult> {
  const validation = validateDebtData(debt);
  if (!validation.valid) {
    return { success: false, error: validation.errors };
  }
  
  return makeApiCall(
    () => apiClient.post(ENDPOINTS.debts, debt, getAxiosConfig()),
    "Crear deuda"
  );
}

export async function updateDebt(id: number, debt: DebtUpdateDTO): Promise<UpdateDebtResult> {
  const validation = validateDebtData({ ...debt, startDate: new Date().toISOString().split('T')[0] });
  if (!validation.valid) {
    return { success: false, error: validation.errors };
  }
  
  return makeApiCall(
    () => apiClient.put(`${ENDPOINTS.debts}/${id}`, debt, getAxiosConfig()),
    "Actualizar deuda"
  );
}

export async function deleteDebt(id: number): Promise<DeleteDebtResult> {
  return makeApiCall(
    () => apiClient.delete(`${ENDPOINTS.debts}/${id}`, getAxiosConfig()),
    "Eliminar deuda"
  );
}

export async function postDebtPayment(debtId: number, payment: DebtPaymentCreateDTO): Promise<PostDebtPaymentResult> {
  const validation = validateDebtPaymentData(payment);
  if (!validation.valid) {
    return { success: false, error: validation.errors };
  }
  
  return makeApiCall(
    () => apiClient.post(`${ENDPOINTS.debts}/${debtId}/payment`, payment, getAxiosConfig()),
    "Registrar pago de deuda"
  );
}

export async function getDebtPayments(debtId: number, page: number = 0, size: number = 10): Promise<GetDebtPaymentsResult> {
  return makeApiCall(
    () => apiClient.get(`${ENDPOINTS.debts}/${debtId}/payments`, {
      ...getAxiosConfig(),
      params: { page, size }
    }),
    "Obtener pagos de deuda"
  );
}

// ===============================
// CATEGORY OPERATIONS
// ===============================

function validateCategoryData(category: CategoryCreateDTO): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!category.name?.trim()) {
    errors.push("El nombre de la categoría es requerido");
  } else if (category.name.trim().length < 2) {
    errors.push("El nombre debe tener al menos 2 caracteres");
  } else if (category.name.trim().length > 50) {
    errors.push("El nombre no puede exceder 50 caracteres");
  }
  
  return { valid: errors.length === 0, errors };
}

export async function postCategory(category: CategoryCreateDTO): Promise<PostCategoryResult> {
  const validation = validateCategoryData(category);
  if (!validation.valid) {
    return { success: false, error: validation.errors };
  }
  
  return makeApiCall(
    () => apiClient.post(ENDPOINTS.categories, category, getAxiosConfig()),
    "Crear categoría"
  );
}

export async function updateCategory(id: number, category: CategoryUpdateDTO): Promise<UpdateCategoryResult> {
  const validation = validateCategoryData(category);
  if (!validation.valid) {
    return { success: false, error: validation.errors };
  }
  
  return makeApiCall(
    () => apiClient.put(`${ENDPOINTS.categories}/${id}`, category, getAxiosConfig()),
    "Actualizar categoría"
  );
}

export async function deleteCategory(id: number): Promise<DeleteCategoryResult> {
  return makeApiCall(
    () => apiClient.delete(`${ENDPOINTS.categories}/${id}`, getAxiosConfig()),
    "Eliminar categoría"
  );
}

export async function getCategories(page: number = 0, size: number = 10): Promise<ApiResult<CategoryResponse>> {
  return makeApiCall(
    () => apiClient.get(ENDPOINTS.categories, {
      ...getAxiosConfig(),
      params: { page, size }
    }),
    "Obtener categorías"
  );
}

// ===============================
// INCOME SOURCE OPERATIONS
// ===============================

function validateIncomeSourceData(source: IncomeSourceCreateDTO): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!source.name?.trim()) {
    errors.push("El nombre de la fuente de ingreso es requerido");
  } else if (source.name.trim().length < 2) {
    errors.push("El nombre debe tener al menos 2 caracteres");
  } else if (source.name.trim().length > 50) {
    errors.push("El nombre no puede exceder 50 caracteres");
  }
  
  return { valid: errors.length === 0, errors };
}

export async function postIncomeSource(source: IncomeSourceCreateDTO): Promise<PostIncomeSourceResult> {
  const validation = validateIncomeSourceData(source);
  if (!validation.valid) {
    return { success: false, error: validation.errors };
  }
  
  return makeApiCall(
    () => apiClient.post(ENDPOINTS.incomeSources, source, getAxiosConfig()),
    "Crear fuente de ingreso"
  );
}

export async function updateIncomeSource(id: number, source: IncomeSourceUpdateDTO): Promise<UpdateIncomeSourceResult> {
  const validation = validateIncomeSourceData(source);
  if (!validation.valid) {
    return { success: false, error: validation.errors };
  }
  
  return makeApiCall(
    () => apiClient.put(`${ENDPOINTS.incomeSources}/${id}`, source, getAxiosConfig()),
    "Actualizar fuente de ingreso"
  );
}

export async function deleteIncomeSource(id: number): Promise<DeleteIncomeSourceResult> {
  return makeApiCall(
    () => apiClient.delete(`${ENDPOINTS.incomeSources}/${id}`, getAxiosConfig()),
    "Eliminar fuente de ingreso"
  );
}

export async function getIncomeSources(page: number = 0, size: number = 10): Promise<ApiResult<IncomeSourceResponse>> {
  return makeApiCall(
    () => apiClient.get(ENDPOINTS.incomeSources, {
      ...getAxiosConfig(),
      params: { page, size }
    }),
    "Obtener fuentes de ingreso"
  );
}

// ===============================
// ACCOUNT OPERATIONS
// ===============================

function validateAccountData(account: AccountCreateDTO): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!account.name?.trim()) {
    errors.push("El nombre de la cuenta es requerido");
  } else if (account.name.trim().length < 2) {
    errors.push("El nombre debe tener al menos 2 caracteres");
  } else if (account.name.trim().length > 50) {
    errors.push("El nombre no puede exceder 50 caracteres");
  }
  
  return { valid: errors.length === 0, errors };
}

export async function postAccount(account: AccountCreateDTO): Promise<PostAccountResult> {
  const validation = validateAccountData(account);
  if (!validation.valid) {
    return { success: false, error: validation.errors };
  }
  
  return makeApiCall(
    () => apiClient.post(ENDPOINTS.accounts, account, getAxiosConfig()),
    "Crear cuenta"
  );
}

export async function updateAccount(id: number, account: AccountUpdateDTO): Promise<UpdateAccountResult> {
  const validation = validateAccountData(account);
  if (!validation.valid) {
    return { success: false, error: validation.errors };
  }
  
  return makeApiCall(
    () => apiClient.put(`${ENDPOINTS.accounts}/${id}`, account, getAxiosConfig()),
    "Actualizar cuenta"
  );
}

export async function deleteAccount(id: number): Promise<DeleteAccountResult> {
  return makeApiCall(
    () => apiClient.delete(`${ENDPOINTS.accounts}/${id}`, getAxiosConfig()),
    "Eliminar cuenta"
  );
}

export async function getAccounts(page: number = 0, size: number = 10): Promise<ApiResult<AccountResponse>> {
  return makeApiCall(
    () => apiClient.get(ENDPOINTS.accounts, {
      ...getAxiosConfig(),
      params: { page, size }
    }),
    "Obtener cuentas"
  );
}
