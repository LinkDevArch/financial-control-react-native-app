import { useState } from "react";
import type { DebtCreateDTO, DebtUpdateDTO, DebtPaymentCreateDTO } from "../interfaces/types";
import { 
  postDebt, 
  updateDebt as updateDebtApi, 
  deleteDebt, 
  postDebtPayment,
  getDebtPayments,
  type PostDebtResult, 
  type UpdateDebtResult, 
  type DeleteDebtResult,
  type PostDebtPaymentResult,
  type GetDebtPaymentsResult
} from "./sendFinancialData";

export function useDebtActions() {
  const [loading, setLoading] = useState(false);

  async function addDebt(debt: DebtCreateDTO): Promise<PostDebtResult> {
    setLoading(true);
    const result = await postDebt(debt);
    setLoading(false);
    return result;
  }

  async function updateDebt(id: number, debt: DebtUpdateDTO): Promise<UpdateDebtResult> {
    setLoading(true);
    const result = await updateDebtApi(id, debt);
    setLoading(false);
    return result;
  }

  async function removeDebt(id: number): Promise<DeleteDebtResult> {
    setLoading(true);
    const result = await deleteDebt(id);
    setLoading(false);
    return result;
  }

  async function addDebtPayment(debtId: number, payment: DebtPaymentCreateDTO): Promise<PostDebtPaymentResult> {
    setLoading(true);
    const result = await postDebtPayment(debtId, payment);
    setLoading(false);
    return result;
  }

  async function getPayments(debtId: number, page: number = 0, size: number = 10): Promise<GetDebtPaymentsResult> {
    setLoading(true);
    const result = await getDebtPayments(debtId, page, size);
    setLoading(false);
    return result;
  }

  return { 
    addDebt, 
    updateDebt, 
    removeDebt,
    addDebtPayment,
    getPayments,
    loading 
  };
}
