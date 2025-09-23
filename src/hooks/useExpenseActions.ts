import { useState } from "react";
import type { ExpenseCreateDTO } from "../interfaces/types";
import { postExpense } from "./sendFinancialData";
import { deleteExpense } from "./sendFinancialData";

export function useExpenseActions() {
  const [loading, setLoading] = useState(false);

  async function addExpense(expense: ExpenseCreateDTO) {
    setLoading(true);
    const result = await postExpense(expense);
    setLoading(false);
    return result; // { success, data, error }
  }

  async function removeExpense(id: number) {
    setLoading(true);
    const result = await deleteExpense(id);
    setLoading(false);
    return result; // { success, data, error }
  }

  return { addExpense, removeExpense, loading };
}
