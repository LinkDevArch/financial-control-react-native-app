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
  DollarSign,
} from "lucide-react-native";
import { IncomeSourceDTO } from "../../../src/interfaces/types";
import { useIncomeSourceActions } from "../../../src/hooks/useIncomeSourceActions";
import { useActionSheets } from "../../../src/hooks/useActionSheets";
import ActionSheet from "../../../src/components/ActionSheet";
import ConfirmationModal from "../../../src/components/ConfirmationModal";
import Header from "../../../src/components/Header";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function IncomeSourcesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<IncomeSourceDTO | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const insets = useSafeAreaInsets();

  const {
    incomeSources,
    loading,
    fetchIncomeSources,
    removeIncomeSource: removeSourceAction,
  } = useIncomeSourceActions();

  const { actionSheetVisible, showActionSheet, hideActionSheet } =
    useActionSheets();

  const filteredSources = incomeSources.filter((source) =>
    source.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchIncomeSources();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleAddSource = () => {
    router.push("/(protected)/(stacks)/add-income-source");
  };

  const handleSourcePress = (source: IncomeSourceDTO) => {
    setSelectedSource(source);
    showActionSheet();
  };

  const handleEditSource = () => {
    if (selectedSource) {
      hideActionSheet();
      router.push({
        pathname: "/(protected)/(stacks)/edit-income-source",
        params: {
          sourceId: selectedSource.id,
          sourceName: selectedSource.name,
        },
      });
    }
  };

  const handleDeleteSource = () => {
    hideActionSheet();
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedSource) {
      const success = await removeSourceAction(selectedSource.id);
      if (success) {
        setShowDeleteModal(false);
        setSelectedSource(null);
        fetchIncomeSources(); // Refrescar lista
      }
    }
  };

  const renderSourceItem = ({ item }: { item: IncomeSourceDTO }) => (
    <TouchableOpacity
      style={styles.sourceCard}
      onPress={() => handleSourcePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.sourceIcon}>
        <DollarSign color="#10B981" size={24} />
      </View>

      <View style={styles.sourceContent}>
        <Text style={styles.sourceName}>{item.name}</Text>
      </View>

      <TouchableOpacity
        style={styles.moreButton}
        onPress={() => handleSourcePress(item)}
      >
        <MoreVertical color="#666" size={20} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const actionSheetOptions = [
    {
      title: "Editar fuente de ingreso",
      icon: <Edit3 color="#4A90E2" size={20} />,
      onPress: handleEditSource,
      color: "#4A90E2",
    },
    {
      title: "Eliminar fuente de ingreso",
      icon: <Trash2 color="#EF4444" size={20} />,
      onPress: handleDeleteSource,
      color: "#EF4444",
      destructive: true,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Header
        title="Fuentes"
        showBackButton={true}
        showConfig={false}
        customSection={
          <TouchableOpacity onPress={handleAddSource} style={styles.addButton}>
            <Plus color="#10B981" size={24} />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search color="#666" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar fuentes de ingreso..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              Cargando fuentes de ingreso...
            </Text>
          </View>
        ) : filteredSources.length === 0 ? (
          <View style={styles.emptyContainer}>
            <DollarSign color="#ccc" size={48} />
            <Text style={styles.emptyTitle}>
              {searchQuery
                ? "No se encontraron fuentes"
                : "No hay fuentes de ingreso"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? "Prueba con otros términos de búsqueda"
                : "Agrega tu primera fuente de ingreso para organizar tus ingresos"}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.addFirstButton}
                onPress={handleAddSource}
              >
                <Text style={styles.addFirstButtonText}>
                  Agregar fuente de ingreso
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredSources}
            renderItem={renderSourceItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <ActionSheet
        visible={actionSheetVisible}
        onClose={hideActionSheet}
        title={selectedSource?.name || ""}
        options={actionSheetOptions}
      />

      <ConfirmationModal
        visible={showDeleteModal}
        title="Eliminar fuente de ingreso"
        message={`¿Estás seguro de que deseas eliminar la fuente de ingreso "${selectedSource?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedSource(null);
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
    backgroundColor: "#10B981",
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
  sourceCard: {
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
  sourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
  },
  sourceContent: {
    flex: 1,
    marginLeft: 16,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  moreButton: {
    padding: 8,
  },
});
