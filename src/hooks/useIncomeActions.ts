import { useState } from "react";
import type { IncomeCreateDTO } from "../interfaces/types";
import { postIncome, deleteIncome } from "./sendFinancialData";

export function useIncomeActions() {
  const [loading, setLoading] = useState(false);

  async function addIncome(income: IncomeCreateDTO) {
    setLoading(true);
    const result = await postIncome(income);
    setLoading(false);
    return result; // { success, data, error }
  }

  async function removeIncome(id: number) {
    setLoading(true);
    const result = await deleteIncome(id);
    setLoading(false);
    return result; // { success, data, error }
  }

  return { addIncome, removeIncome, loading };
}