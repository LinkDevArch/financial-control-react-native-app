import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import {
  ChevronLeft,
  Plus,
  Search,
  MoreVertical,
  Edit3,
  Trash2,
  CreditCard,
} from "lucide-react-native";
import { AccountDTO } from "../../../src/interfaces/types";
import { useAccountActions } from "../../../src/hooks/useAccountActions";
import { useActionSheets } from "../../../src/hooks/useActionSheets";
import ActionSheet from "../../../src/components/ActionSheet";
import ConfirmationModal from "../../../src/components/ConfirmationModal";
import Header from "../../../src/components/Header";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AccountsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<AccountDTO | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const insets = useSafeAreaInsets();

  const {
    accounts,
    loading,
    fetchAccounts,
    removeAccount: removeAccountAction,
  } = useAccountActions();

  const { actionSheetVisible, showActionSheet, hideActionSheet } =
    useActionSheets();

  const filteredAccounts = accounts.filter((account) =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleAddAccount = () => {
    router.push("/(protected)/(stacks)/add-account");
  };

  const handleAccountPress = (account: AccountDTO) => {
    setSelectedAccount(account);
    showActionSheet();
  };

  const handleEditAccount = () => {
    if (selectedAccount) {
      hideActionSheet();
      router.push({
        pathname: "/(protected)/(stacks)/edit-account",
        params: {
          accountId: selectedAccount.id,
          accountName: selectedAccount.name,
        },
      });
    }
  };

  const handleDeleteAccount = () => {
    hideActionSheet();
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedAccount) {
      const success = await removeAccountAction(selectedAccount.id);
      if (success) {
        setShowDeleteModal(false);
        setSelectedAccount(null);
        fetchAccounts(); // Refrescar lista
      }
    }
  };

  const renderAccountItem = ({ item }: { item: AccountDTO }) => (
    <TouchableOpacity
      style={styles.accountCard}
      onPress={() => handleAccountPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.accountIcon}>
        <CreditCard color="#8B5CF6" size={24} />
      </View>

      <View style={styles.accountContent}>
        <Text style={styles.accountName}>{item.name}</Text>
      </View>

      <TouchableOpacity
        style={styles.moreButton}
        onPress={() => handleAccountPress(item)}
      >
        <MoreVertical color="#666" size={20} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const actionSheetOptions = [
    {
      title: "Editar cuenta",
      icon: <Edit3 color="#4A90E2" size={20} />,
      onPress: handleEditAccount,
      color: "#4A90E2",
    },
    {
      title: "Eliminar cuenta",
      icon: <Trash2 color="#EF4444" size={20} />,
      onPress: handleDeleteAccount,
      color: "#EF4444",
      destructive: true,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Header
        title="Cuentas"
        showBackButton={true}
        showConfig={false}
        customSection={
          <TouchableOpacity onPress={handleAddAccount} style={styles.addButton}>
            <Plus color="#8B5CF6" size={24} />
          </TouchableOpacity>
        }
      />

      {/* <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft color="#333" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Cuentas</Text>
        <TouchableOpacity onPress={handleAddAccount} style={styles.addButton}>
          <Plus color="#8B5CF6" size={24} />
        </TouchableOpacity>
      </View> */}

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search color="#666" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar cuentas..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando cuentas...</Text>
          </View>
        ) : filteredAccounts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <CreditCard color="#ccc" size={48} />
            <Text style={styles.emptyTitle}>
              {searchQuery ? "No se encontraron cuentas" : "No hay cuentas"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? "Prueba con otros términos de búsqueda"
                : "Agrega tu primera cuenta para organizar tus finanzas"}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.addFirstButton}
                onPress={handleAddAccount}
              >
                <Text style={styles.addFirstButtonText}>Agregar cuenta</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredAccounts}
            renderItem={renderAccountItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <ActionSheet
        visible={actionSheetVisible}
        onClose={hideActionSheet}
        title={selectedAccount?.name || ""}
        options={actionSheetOptions}
      />

      <ConfirmationModal
        visible={showDeleteModal}
        title="Eliminar cuenta"
        message={`¿Estás seguro de que deseas eliminar la cuenta "${selectedAccount?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedAccount(null);
        }}
        confirmButtonColor="#EF4444"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  content: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
  },
  addFirstButton: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  addFirstButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContainer: {
    padding: 20,
  },
  accountCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#faf5ff",
    justifyContent: "center",
    alignItems: "center",
  },
  accountContent: {
    flex: 1,
    marginLeft: 16,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  moreButton: {
    padding: 8,
  },
});
