import { useState } from "react";
import type { IncomeSourceCreateDTO, IncomeSourceUpdateDTO, IncomeSourceDTO } from "../interfaces/types";
import { 
  postIncomeSource, 
  updateIncomeSource as updateIncomeSourceApi, 
  deleteIncomeSource,
  getIncomeSources,
  type PostIncomeSourceResult, 
  type UpdateIncomeSourceResult, 
  type DeleteIncomeSourceResult
} from "./sendFinancialData";

export function useIncomeSourceActions() {
  const [loading, setLoading] = useState(false);
  const [incomeSources, setIncomeSources] = useState<IncomeSourceDTO[]>([]);

  async function fetchIncomeSources(): Promise<void> {
    setLoading(true);
    try {
      const result = await getIncomeSources();
      if (result.success && result.data) {
        setIncomeSources(result.data.content);
      }
    } catch (error) {
      console.error('Error fetching income sources:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addIncomeSource(source: IncomeSourceCreateDTO): Promise<PostIncomeSourceResult> {
    setLoading(true);
    const result = await postIncomeSource(source);
    setLoading(false);
    return result;
  }

  async function updateIncomeSource(id: number, source: IncomeSourceUpdateDTO): Promise<UpdateIncomeSourceResult> {
    setLoading(true);
    const result = await updateIncomeSourceApi(id, source);
    setLoading(false);
    return result;
  }

  async function removeIncomeSource(id: number): Promise<DeleteIncomeSourceResult> {
    setLoading(true);
    const result = await deleteIncomeSource(id);
    setLoading(false);
    return result;
  }

  return { 
    incomeSources,
    fetchIncomeSources,
    addIncomeSource, 
    updateIncomeSource, 
    removeIncomeSource,
    loading 
  };
}
