import { useState } from "react";
import type { DepositCreateDTO, GoalCreateDTO, GoalUpdateDTO } from "../interfaces/types";
import { postGoal, updateGoal as updateGoalApi, deleteGoal, type PostGoalResult, type UpdateGoalResult, type DeleteGoalResult, PostGoalDepositResult, postDeposit } from "./sendFinancialData";

export function useGoalActions() {
  const [loading, setLoading] = useState(false);

  async function addGoal(goal: GoalCreateDTO): Promise<PostGoalResult> {
    setLoading(true);
    const result = await postGoal(goal);
    setLoading(false);
    return result; // { success, data, error }
  }

  async function updateGoal(id: number, goal: GoalUpdateDTO): Promise<UpdateGoalResult> {
    setLoading(true);
    const result = await updateGoalApi(id, goal);
    setLoading(false);
    return result;
  }

  async function removeGoal(id: number): Promise<DeleteGoalResult> {
    setLoading(true);
    const result = await deleteGoal(id);
    setLoading(false);
    return result;
  }

  async function addGoalDeposit(goalId: number, deposit: DepositCreateDTO): Promise<PostGoalDepositResult> {
    setLoading(true);
    const result = await postDeposit(goalId, deposit);
    setLoading(false);
    return result;
  }

  return { 
    addGoal, 
    updateGoal, 
    removeGoal,
    addGoalDeposit,
    loading 
  };
}