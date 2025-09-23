import { useState } from "react";
import type { AccountCreateDTO, AccountUpdateDTO, AccountDTO } from "../interfaces/types";
import { 
  postAccount, 
  updateAccount as updateAccountApi, 
  deleteAccount,
  getAccounts,
  type PostAccountResult, 
  type UpdateAccountResult, 
  type DeleteAccountResult
} from "./sendFinancialData";

export function useAccountActions() {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<AccountDTO[]>([]);

  async function fetchAccounts(): Promise<void> {
    setLoading(true);
    try {
      const result = await getAccounts();
      if (result.success && result.data) {
        setAccounts(result.data.content);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addAccount(account: AccountCreateDTO): Promise<PostAccountResult> {
    setLoading(true);
    const result = await postAccount(account);
    setLoading(false);
    return result;
  }

  async function updateAccount(id: number, account: AccountUpdateDTO): Promise<UpdateAccountResult> {
    setLoading(true);
    const result = await updateAccountApi(id, account);
    setLoading(false);
    return result;
  }

  async function removeAccount(id: number): Promise<DeleteAccountResult> {
    setLoading(true);
    const result = await deleteAccount(id);
    setLoading(false);
    return result;
  }

  return { 
    accounts,
    fetchAccounts,
    addAccount, 
    updateAccount, 
    removeAccount,
    loading 
  };
}
