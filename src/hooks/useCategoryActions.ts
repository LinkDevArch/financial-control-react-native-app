import { useState } from "react";
import type { CategoryCreateDTO, CategoryUpdateDTO, CategoryDTO } from "../interfaces/types";
import { 
  postCategory, 
  updateCategory as updateCategoryApi, 
  deleteCategory,
  getCategories,
  type PostCategoryResult, 
  type UpdateCategoryResult, 
  type DeleteCategoryResult
} from "./sendFinancialData";

export function useCategoryActions() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);

  async function fetchCategories(): Promise<void> {
    setLoading(true);
    try {
      const result = await getCategories();
      if (result.success && result.data) {
        setCategories(result.data.content);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addCategory(category: CategoryCreateDTO): Promise<PostCategoryResult> {
    setLoading(true);
    const result = await postCategory(category);
    setLoading(false);
    return result;
  }

  async function updateCategory(id: number, category: CategoryUpdateDTO): Promise<UpdateCategoryResult> {
    setLoading(true);
    const result = await updateCategoryApi(id, category);
    setLoading(false);
    return result;
  }

  async function removeCategory(id: number): Promise<DeleteCategoryResult> {
    setLoading(true);
    const result = await deleteCategory(id);
    setLoading(false);
    return result;
  }

  return { 
    categories,
    fetchCategories,
    addCategory, 
    updateCategory, 
    removeCategory,
    loading 
  };
}
