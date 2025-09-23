import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { ApiService } from '../services/ApiService';
import type { UserInfo, Report, DebtResponse, GoalResponse, DepositResponse, TransactionResponse, ExpensesResponse, IncomesResponse, CategoryResponse, IncomeSourceResponse, AccountResponse, IncomesVsExpensesResponse } from '../interfaces/types';

// Cliente API configurado
const apiClient = ApiService.getInstance();
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

interface UseFinancialDataOptions {
  fetchUserInfo?: boolean;
  fetchReport?: boolean;
  fetchDebts?: boolean;
  fetchGoals?: boolean;
  fetchDeposits?: boolean;
  fetchTransactions?: boolean;
  fetchExpenses?: boolean;
  fetchIncomes?: boolean;
  fetchCategories?: boolean;
  fetchIncomeSources?: boolean;
  fetchAccounts?: boolean;
  fetchIncomesVsExpenses?: boolean;
  disableCache?: boolean;

  debtsSize?: number;
  debtsSortBy?: string;
  debtsPage?: number;
  debtsDirection?: string;

  goalsSize?: number;
  goalsSortBy?: string;
  goalsPage?: number;
  goalsDirection?: string;

  depositsGoalId?: number;
  depositsSize?: number;
  depositsSortBy?: string;
  depositsPage?: number;
  depositsDirection?: string; 

  expensesFilterType?: string;
  expensesYear?: number;
  expensesMonth?: number;
  expensesPage?: number;
  expensesSize?: number;
  expensesSortBy?: string;
  expensesDirection?: string;

  incomesFilterType?: string;
  incomesYear?: number;
  incomesMonth?: number;
  incomesSourceName?: string;
  incomesAccountType?: string;
  incomesPage?: number;
  incomesSize?: number;
  incomesSortBy?: string;
  incomesDirection?: string;

  categoriesPage?: number;
  categoriesSize?: number;
  categoriesSortBy?: string;
  categoriesDirection?: string;

  incomeSourcePage?: number;
  incomeSourceSize?: number;
  incomeSourceSortBy?: string;
  incomeSourceDirection?: string;

  accountsPage?: number;
  accountsSize?: number;
  accountsSortBy?: string;
  accountsDirection?: string;

  incomesVsExpensesPeriod?: string;
  incomesVsExpensesMonths?: number;
}

// Cache global para datos
const dataCache = {
  userInfo: null as UserInfo | null,
  report: null as Report | null,
  debts: null as DebtResponse | null,
  goals: null as GoalResponse | null,
  deposits: {} as Record<number, DepositResponse>, // Cache específico por goalId
  transactions: null as TransactionResponse[] | null,
  expenses: null as ExpensesResponse | null,
  incomes: null as IncomesResponse | null,
  categories: null as CategoryResponse | null,
  incomeSources: null as IncomeSourceResponse | null,
  accounts: null as AccountResponse | null,
  incomesVsExpenses: null as IncomesVsExpensesResponse | null,

  // Cache timestamps específicos por ID para entidades que lo requieran
  depositsCacheTime: {} as Record<number, number>,
  
  // TEMPLATE para agregar nuevas entidades con caché por ID:
  // entityName: {} as Record<number, EntityType>,
  // entityNameCacheTime: {} as Record<number, number>,

  lastFetchTime: 0
};

// Tiempo de expiración de caché (5 minutos)
const CACHE_EXPIRY = 5 * 60 * 1000;

// Funciones utilitarias para manejo de caché por ID (escalable para futuras entidades)
const getCacheByIdKey = <T>(cacheObject: Record<number, T>, id: number): T | null => {
  return cacheObject[id] || null;
};

const setCacheByIdKey = <T>(cacheObject: Record<number, T>, id: number, data: T): void => {
  cacheObject[id] = data;
};

const clearCacheByIdKey = <T>(cacheObject: Record<number, T>, id?: number): void => {
  if (id !== undefined) {
    delete cacheObject[id];
  } else {
    // Limpiar todo el cache si no se especifica ID
    Object.keys(cacheObject).forEach(key => delete cacheObject[Number(key)]);
  }
};

const isCacheValidById = (cacheTimeObject: Record<number, number>, id: number): boolean => {
  const cacheTime = cacheTimeObject[id];
  return cacheTime ? (Date.now() - cacheTime) < CACHE_EXPIRY : false;
};

const setCacheTimeById = (cacheTimeObject: Record<number, number>, id: number): void => {
  cacheTimeObject[id] = Date.now();
};

// Función para limpiar el cache
export const clearFinancialDataCache = () => {
  dataCache.userInfo = null;
  dataCache.report = null;
  dataCache.debts = null;
  dataCache.goals = null;
  clearCacheByIdKey(dataCache.deposits); // Limpiar todos los deposits
  clearCacheByIdKey(dataCache.depositsCacheTime); // Limpiar todos los timestamps de deposits
  dataCache.transactions = null;
  dataCache.expenses = null;
  dataCache.incomes = null;
  dataCache.categories = null;
  dataCache.incomeSources = null;
  dataCache.accounts = null;
  dataCache.incomesVsExpenses = null;

  dataCache.lastFetchTime = 0;
};

// Función específica para limpiar caché de deposits por goalId
export const clearDepositsCache = (goalId?: number) => {
  clearCacheByIdKey(dataCache.deposits, goalId);
  clearCacheByIdKey(dataCache.depositsCacheTime, goalId);
};

// Función genérica para futuras entidades que necesiten caché por ID
// Ejemplo de uso: export const clearEntityCache = <T>(cacheObj: Record<number, T>, timeObj: Record<number, number>, id?: number) => {...}
export const createCacheByIdManager = <T>() => {
  return {
    get: (cacheObject: Record<number, T>, id: number): T | null => getCacheByIdKey(cacheObject, id),
    set: (cacheObject: Record<number, T>, id: number, data: T): void => setCacheByIdKey(cacheObject, id, data),
    clear: (cacheObject: Record<number, T>, id?: number): void => clearCacheByIdKey(cacheObject, id),
    isValid: (cacheTimeObject: Record<number, number>, id: number): boolean => isCacheValidById(cacheTimeObject, id),
    setTime: (cacheTimeObject: Record<number, number>, id: number): void => setCacheTimeById(cacheTimeObject, id)
  };
};

export const useFinancialData = (options: UseFinancialDataOptions = {}) => {
  const { 
    fetchUserInfo = false, 
    fetchReport = false, 
    fetchDebts = false, 
    fetchGoals = false,
    fetchDeposits = false,
    fetchTransactions = false,
    fetchExpenses = false,
    fetchIncomes = false,
    fetchCategories = false,
    fetchIncomeSources = false,
    fetchAccounts = false,
    fetchIncomesVsExpenses = false,
  } = options;
  
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [debts, setDebts] = useState<DebtResponse | null>(null);
  const [goals, setGoals] = useState<GoalResponse | null>(null);
  const [deposits, setDeposits] = useState<DepositResponse | null>(null);
  const [transactions, setTransactions] = useState<TransactionResponse[] | null>(null);
  const [expenses, setExpenses] = useState<ExpensesResponse | null>(null);
  const [incomes, setIncomes] = useState<IncomesResponse | null>(null);
  const [categories, setCategories] = useState<CategoryResponse | null>(null);
  const [incomeSources, setIncomeSources] = useState<IncomeSourceResponse | null>(null);
  const [accounts, setAccounts] = useState<AccountResponse | null>(null);
  const [incomesVsExpenses, setIncomesVsExpenses] = useState<IncomesVsExpensesResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    // Comprobar si la caché es válida y tiene menos de 5 minutos
    const now = Date.now();
    const isCacheValid = now - dataCache.lastFetchTime < CACHE_EXPIRY;

    // Si la caché es válida y no está deshabilitada, usar datos del caché
    if (isCacheValid && !options.disableCache) {
      if (fetchUserInfo && dataCache.userInfo) setUserInfo(dataCache.userInfo);
      if (fetchReport && dataCache.report) setReport(dataCache.report);
      if (fetchDebts && dataCache.debts) setDebts(dataCache.debts);
      if (fetchGoals && dataCache.goals) setGoals(dataCache.goals);
      
      // Manejo especial para deposits que requieren goalId específico
      if (fetchDeposits && options.depositsGoalId) {
        const goalId = options.depositsGoalId;
        const cachedDeposits = getCacheByIdKey(dataCache.deposits, goalId);
        const isCachedDepositsValid = isCacheValidById(dataCache.depositsCacheTime, goalId);
        
        if (cachedDeposits && isCachedDepositsValid) {
          setDeposits(cachedDeposits);
        }
      }
      
      if (fetchTransactions && dataCache.transactions) setTransactions(dataCache.transactions);
      if (fetchExpenses && dataCache.expenses) setExpenses(dataCache.expenses);
      if (fetchIncomes && dataCache.incomes) setIncomes(dataCache.incomes);
      if (fetchCategories && dataCache.categories) setCategories(dataCache.categories);
      if (fetchIncomeSources && dataCache.incomeSources) setIncomeSources(dataCache.incomeSources);
      if (fetchAccounts && dataCache.accounts) setAccounts(dataCache.accounts);
      if (fetchIncomesVsExpenses && dataCache.incomesVsExpenses) setIncomesVsExpenses(dataCache.incomesVsExpenses);
      
      const depositsGoalId = options.depositsGoalId;
      const cachedDepositsForGoal = depositsGoalId ? getCacheByIdKey(dataCache.deposits, depositsGoalId) : null;
      const isDepositsCachedValid = depositsGoalId ? isCacheValidById(dataCache.depositsCacheTime, depositsGoalId) : false;
      
      const allDataCached = 
        (!fetchUserInfo || dataCache.userInfo) &&
        (!fetchReport || dataCache.report) &&
        (!fetchDebts || dataCache.debts) &&
        (!fetchGoals || dataCache.goals) &&
        (!fetchDeposits || (cachedDepositsForGoal && isDepositsCachedValid)) &&
        (!fetchTransactions || dataCache.transactions) &&
        (!fetchExpenses || dataCache.expenses) &&
        (!fetchIncomes || dataCache.incomes) &&
        (!fetchCategories || dataCache.categories) &&
        (!fetchIncomeSources || dataCache.incomeSources) &&
        (!fetchAccounts || dataCache.accounts) &&
        (!fetchIncomesVsExpenses || dataCache.incomesVsExpenses);
        
      if (allDataCached) {
        setLoading(false);
        return;
      }
    }

    try {
      const promises = [];
      
      if (fetchUserInfo) promises.push(apiClient.get(`/auth/users/me`));
      if (fetchReport) promises.push(apiClient.get(`/auth/reports/monthly-summary`));
      if (fetchDebts) {
        const params = {
          page: options.debtsPage ?? 0,
          size: options.debtsSize ?? 20,
          sortBy: options.debtsSortBy || 'createdAt',
          direction: options.debtsDirection || 'desc',
        }
        promises.push(apiClient.get(`/auth/debts`, { params }));
      }
      if (fetchGoals) {
        const params = {
          page: options.goalsPage ?? 0,
          size: options.goalsSize ?? 20,
          sortBy: options.goalsSortBy || 'createdAt',
          direction: options.goalsDirection || 'desc',
        }
        promises.push(apiClient.get(`/auth/goals`, { params }));
      }
      if (fetchDeposits) {
        const params = {
          page: options.depositsPage ?? 0,
          size: options.depositsSize ?? 20,
          sortBy: options.depositsSortBy || 'createdAt',
          direction: options.depositsDirection || 'desc',
        }
        const goalId = options.depositsGoalId
        console.log("El id desde financial data: "+goalId+" tipo: "+typeof(goalId))
        promises.push(apiClient.get(`/auth/goals/deposit/${goalId}`, { params }));
      }
      if (fetchTransactions) promises.push(apiClient.get(`/auth/reports/recent-transactions`));
      if (fetchExpenses) {
        const params = {
          type: options.expensesFilterType || 'MONTH',
          year: options.expensesYear,
          month: options.expensesMonth,
          page: options.expensesPage ?? 0,
          size: options.expensesSize ?? 20,
          sortBy: options.expensesSortBy || 'creationDate',
          direction: options.expensesDirection || 'asc',
        };
        promises.push(apiClient.get(`/auth/expenses/filter`, { params }));
      }
      if (fetchIncomes) {
        const params = {
          type: options.incomesFilterType || 'MONTH',
          year: options.incomesYear,
          month: options.incomesMonth,
          sourceName: options.incomesSourceName,
          accountType: options.incomesAccountType,
          page: options.incomesPage ?? 0,
          size: options.incomesSize ?? 20,
          sortBy: options.incomesSortBy || 'creationDate',
          direction: options.incomesDirection || 'asc',
        };
        promises.push(apiClient.get(`/auth/incomes/filter`, { params }));
      }
      if (fetchCategories) {
        const params = {
          page: options.categoriesPage ?? 0,
          size: options.categoriesSize ?? 20,
          sortBy: options.categoriesSortBy || 'name',
          direction: options.categoriesDirection || 'asc',
        };
        promises.push(apiClient.get(`/auth/categories`, { params }));
      }
      if (fetchIncomeSources) {
        const params = {
          page: options.incomeSourcePage ?? 0,
          size: options.incomeSourceSize ?? 20,
          sortBy: options.incomeSourceSortBy || 'name',
          direction: options.incomeSourceDirection || 'asc',
        };
        promises.push(apiClient.get(`/auth/income-sources`, { params }));
      }
      if (fetchAccounts) {
        const params = {
          page: options.accountsPage ?? 0,
          size: options.accountsSize ?? 20,
          sortBy: options.accountsSortBy || 'name',
          direction: options.accountsDirection || 'asc',
        };
        promises.push(apiClient.get(`/auth/accounts`, { params }));
      }
      if (fetchIncomesVsExpenses) {
        const params = {
          months: options.incomesVsExpensesMonths ?? 6,
          period: options.incomesVsExpensesPeriod ?? new Date().toISOString().slice(0, 7)
        };
        promises.push(apiClient.get(`/auth/reports/income-vs-expense`, { params }))
      }

      const responses = await Promise.all(promises);
      let responseIndex = 0;

      if (fetchUserInfo) {
        const userData = responses[responseIndex++].data;
        setUserInfo(userData);
        dataCache.userInfo = userData;
      }

      if (fetchReport) {
        const reportData = responses[responseIndex++].data;
        setReport(reportData);
        dataCache.report = reportData;
      }

      if (fetchDebts) {
        const debtsData = responses[responseIndex++].data;
        setDebts(debtsData);
        dataCache.debts = debtsData;
      }

      if (fetchGoals) {
        const goalsData = responses[responseIndex++].data;
        setGoals(goalsData);
        dataCache.goals = goalsData;
      }

      if (fetchDeposits) {
        const depositsData = responses[responseIndex++].data;
        const goalId = options.depositsGoalId;
        
        setDeposits(depositsData);
        
        // Guardar en caché específico por goalId si se proporciona
        if (goalId) {
          setCacheByIdKey(dataCache.deposits, goalId, depositsData);
          setCacheTimeById(dataCache.depositsCacheTime, goalId);
        }
      }

      if (fetchTransactions) {
        const transactionsData = responses[responseIndex++].data;
        setTransactions(transactionsData);
        dataCache.transactions = transactionsData;
      }

      if (fetchExpenses) {
        const expensesData = responses[responseIndex++].data;
        setExpenses(expensesData);
        dataCache.expenses = expensesData;
      }

      if (fetchIncomes) {
        const incomesData = responses[responseIndex++].data;
        setIncomes(incomesData);
        dataCache.incomes = incomesData;
      }

      if (fetchCategories) {
        const categoriesData = responses[responseIndex++].data;
        setCategories(categoriesData);
        dataCache.categories = categoriesData;
      }

      if (fetchIncomeSources) {
        const incomeSourcesData = responses[responseIndex++].data;
        setIncomeSources(incomeSourcesData);
        dataCache.incomeSources = incomeSourcesData;
      }

      if (fetchAccounts) {
        const accountsData = responses[responseIndex++].data;
        setAccounts(accountsData);
        dataCache.accounts = accountsData;
      }

      if (fetchIncomesVsExpenses) {
        const incomesVsExpensesData = responses[responseIndex++].data;
        setIncomesVsExpenses(incomesVsExpensesData);
        dataCache.incomesVsExpenses = incomesVsExpensesData;
      }

      // Actualizar timestamp del caché
      dataCache.lastFetchTime = Date.now();

    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [
    fetchUserInfo, fetchReport, fetchDebts, fetchGoals, fetchDeposits, fetchTransactions, 
    fetchExpenses, fetchIncomes, fetchCategories, fetchIncomeSources, fetchAccounts, 
    fetchIncomesVsExpenses,
    options.expensesPage, options.incomesPage, options.categoriesPage, 
    options.incomeSourcePage, options.accountsPage,
    options.incomesVsExpensesPeriod, options.incomesVsExpensesMonths
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Función para forzar refresh
  const refreshData = useCallback(async () => {
    clearFinancialDataCache();
    await fetchData();
  }, [fetchData]);

  // Valores calculados
  const debtsValueSummary = debts?.content?.reduce((sum: number, debt: any) => sum + debt.currentAmount, 0) || 0;
  const goalsSummary = () => {
    return goals?.content?.length || 0;
  }

  return {
    userInfo,
    report,
    debts,
    goals,
    deposits,
    transactions,
    expenses,
    incomes,
    categories,
    incomeSources,
    accounts,
    incomesVsExpenses,
    loading,
    debtsValueSummary,
    goalsSummary,
    refreshData,
  };
};
