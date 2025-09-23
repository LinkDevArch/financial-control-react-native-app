import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Alert,
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
  Tag,
} from "lucide-react-native";
import { CategoryDTO } from "../../../src/interfaces/types";
import { useCategoryActions } from "../../../src/hooks/useCategoryActions";
import { useActionSheets } from "../../../src/hooks/useActionSheets";
import ActionSheet from "../../../src/components/ActionSheet";
import ConfirmationModal from "../../../src/components/ConfirmationModal";
import Header from "../../../src/components/Header";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CategoriesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryDTO | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const insets = useSafeAreaInsets();

  const {
    categories,
    loading,
    fetchCategories,
    removeCategory: removeCategoryAction,
  } = useCategoryActions();

  const { actionSheetVisible, showActionSheet, hideActionSheet } =
    useActionSheets();

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleAddCategory = () => {
    router.push("/(protected)/(stacks)/add-category");
  };

  const handleCategoryPress = (category: CategoryDTO) => {
    setSelectedCategory(category);
    showActionSheet();
  };

  const handleEditCategory = () => {
    if (selectedCategory) {
      hideActionSheet();
      router.push({
        pathname: "/(protected)/(stacks)/edit-category",
        params: {
          categoryId: selectedCategory.id,
          categoryName: selectedCategory.name,
        },
      });
    }
  };

  const handleDeleteCategory = () => {
    hideActionSheet();
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedCategory) {
      const success = await removeCategoryAction(selectedCategory.id);
      if (success) {
        setShowDeleteModal(false);
        setSelectedCategory(null);
        fetchCategories(); // Refrescar lista
      }
    }
  };

  const renderCategoryItem = ({ item }: { item: CategoryDTO }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.categoryIcon}>
        <Tag color="#4A90E2" size={24} />
      </View>

      <View style={styles.categoryContent}>
        <Text style={styles.categoryName}>{item.name}</Text>
      </View>

      <TouchableOpacity
        style={styles.moreButton}
        onPress={() => handleCategoryPress(item)}
      >
        <MoreVertical color="#666" size={20} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const actionSheetOptions = [
    {
      title: "Editar categoría",
      icon: <Edit3 color="#4A90E2" size={20} />,
      onPress: handleEditCategory,
      color: "#4A90E2",
    },
    {
      title: "Eliminar categoría",
      icon: <Trash2 color="#EF4444" size={20} />,
      onPress: handleDeleteCategory,
      color: "#EF4444",
      destructive: true,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Header
        title="Categorias"
        showBackButton={true}
        showConfig={false}
        customSection={
          <TouchableOpacity
            onPress={handleAddCategory}
            style={styles.addButton}
          >
            <Plus color="#4A90E2" size={24} />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search color="#666" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar categorías..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando categorías...</Text>
          </View>
        ) : filteredCategories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Tag color="#ccc" size={48} />
            <Text style={styles.emptyTitle}>
              {searchQuery
                ? "No se encontraron categorías"
                : "No hay categorías"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? "Prueba con otros términos de búsqueda"
                : "Agrega tu primera categoría para organizar tus transacciones"}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.addFirstButton}
                onPress={handleAddCategory}
              >
                <Text style={styles.addFirstButtonText}>Agregar categoría</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredCategories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <ActionSheet
        visible={actionSheetVisible}
        onClose={hideActionSheet}
        title={selectedCategory?.name || ""}
        options={actionSheetOptions}
      />

      <ConfirmationModal
        visible={showDeleteModal}
        title="Eliminar categoría"
        message={`¿Estás seguro de que deseas eliminar la categoría "${selectedCategory?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedCategory(null);
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
    backgroundColor: "#4A90E2",
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
  categoryCard: {
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
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f0f8ff",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryContent: {
    flex: 1,
    marginLeft: 16,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  categoryDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  categoryType: {
    fontSize: 12,
    color: "#4A90E2",
    marginTop: 4,
    fontWeight: "500",
  },
  moreButton: {
    padding: 8,
  },
});
