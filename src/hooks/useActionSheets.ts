import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import type { ExpenseDTO, IncomeDTO } from '../interfaces/types';
import { useExpenseActions } from './useExpenseActions';
import { useIncomeActions } from './useIncomeActions';

// Hook para manejar acciones de gastos en ActionSheet
export function useExpenseActionSheet(onRefresh?: () => void) {
  const [selectedExpense, setSelectedExpense] = useState<ExpenseDTO | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const { removeExpense, loading } = useExpenseActions();

  const openActionSheet = (expense: ExpenseDTO) => {
    setSelectedExpense(expense);
    setShowActionSheet(true);
  };

  const closeActionSheet = () => {
    setShowActionSheet(false);
    setSelectedExpense(null);
  };

  const handleEdit = () => {
    if (selectedExpense) {
      // Navegar a pantalla de edición con los datos del gasto
      router.push({
        pathname: '/(protected)/(stacks)/edit-expense',
        params: { 
          editMode: 'true',
          expenseId: selectedExpense.id.toString(),
          description: selectedExpense.description,
          amount: selectedExpense.amount.toString(),
          categoryId: selectedExpense.categoryId.toString(),
          categoryName: selectedExpense.categoryName,
          date: selectedExpense.creationDate,
        }
      });
    }
  };

  const handleDelete = () => {
    if (selectedExpense && !loading) {
      Alert.alert(
        'Eliminar Gasto',
        `¿Estás seguro de que deseas eliminar el gasto "${selectedExpense.description}" por $${selectedExpense.amount.toLocaleString()}?\n\nEsta acción no se puede deshacer.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Eliminar', 
            style: 'destructive',
            onPress: async () => {
              try {
                const result = await removeExpense(selectedExpense.id);
                
                if (result.success) {
                  Alert.alert('Éxito', 'El gasto ha sido eliminado correctamente.');
                  
                  // Refrescar los datos si se proporciona la función
                  if (onRefresh) {
                    onRefresh();
                  }
                } else {
                  Alert.alert(
                    'Error', 
                    result.error?.join('\n') || 'No se pudo eliminar el gasto.'
                  );
                }
                
              } catch (error) {
                console.error('Error al eliminar gasto:', error);
                Alert.alert('Error', 'Ocurrió un error inesperado. Intenta nuevamente.');
              }
            }
          }
        ]
      );
    }
  };

  return {
    selectedExpense,
    showActionSheet,
    loading,
    openActionSheet,
    closeActionSheet,
    handleEdit,
    handleDelete,
  };
}

// Hook para manejar acciones de ingresos en ActionSheet
export function useIncomeActionSheet(onRefresh?: () => void) {
  const [selectedIncome, setSelectedIncome] = useState<IncomeDTO | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const { removeIncome, loading } = useIncomeActions();

  const openActionSheet = (income: IncomeDTO) => {
    setSelectedIncome(income);
    setShowActionSheet(true);
  };

  const closeActionSheet = () => {
    setShowActionSheet(false);
    setSelectedIncome(null);
  };

  const handleEdit = () => {
    if (selectedIncome) {
      // Navegar a la pantalla de edición con el ID del ingreso
      router.push({
        pathname: '/(protected)/(stacks)/edit-income',
        params: { 
          incomeId: selectedIncome.id.toString(),
          description: selectedIncome.description,
          amount: selectedIncome.amount.toString(),
          sourceName: selectedIncome.sourceName,
          accountName: selectedIncome.accountName,
          date: selectedIncome.creationDate,
        }
      });
    }
  };

  const handleDelete = () => {
    if (selectedIncome && !loading) {
      Alert.alert(
        'Eliminar Ingreso',
        `¿Estás seguro de que deseas eliminar el ingreso "${selectedIncome.description}" por $${selectedIncome.amount.toLocaleString()}?\n\nEsta acción no se puede deshacer.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Eliminar', 
            style: 'destructive',
            onPress: async () => {
              try {
                const result = await removeIncome(selectedIncome.id);
                
                if (result.success) {
                  Alert.alert('Éxito', 'El ingreso ha sido eliminado correctamente.');
                  
                  // Refrescar los datos si se proporciona la función
                  if (onRefresh) {
                    onRefresh();
                  }
                } else {
                  Alert.alert(
                    'Error', 
                    result.error?.join('\n') || 'No se pudo eliminar el ingreso.'
                  );
                }
                
              } catch (error) {
                console.error('Error al eliminar ingreso:', error);
                Alert.alert('Error', 'Ocurrió un error inesperado. Intenta nuevamente.');
              }
            }
          }
        ]
      );
    }
  };

  return {
    selectedIncome,
    showActionSheet,
    loading,
    openActionSheet,
    closeActionSheet,
    handleEdit,
    handleDelete,
  };
}

// Hook genérico para manejar ActionSheets
export function useActionSheets() {
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  const showActionSheet = () => {
    setActionSheetVisible(true);
  };

  const hideActionSheet = () => {
    setActionSheetVisible(false);
  };

  return {
    actionSheetVisible,
    showActionSheet,
    hideActionSheet,
  };
}
