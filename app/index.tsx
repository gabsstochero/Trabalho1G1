import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { getProducts } from "../src/api";
import { Product, ProductsResponse } from "../src/types";

// Tela responsável por mostrar a lista de produtos
export default function ListaScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Busca os produtos da API usando React Query
  const { data, isLoading, isError, refetch, isRefetching } = useQuery<ProductsResponse>({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  // Extrai a lista de produtos do resultado da query, garantindo que seja um array
  const products = data?.products ?? [];

  // Categorias derivadas dinamicamente com useMemo
  const categories = useMemo(() => {
    const cats = products.map((item) => item.category);
    return Array.from(new Set(cats));
  }, [products]);

  // Filtragem combinada por busca e categoria
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  // Renderização condicional com base no estado da query
  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={["top"]}>
        <ActivityIndicator size="large" color="#6B4644" />
      </SafeAreaView>
    );
  }

  // Se houver um erro ou a lista de produtos estiver vazia, exibe uma mensagem apropriada
  if (isError) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={["top"]}>
        <Text style={styles.errorText}>Erro ao carregar os produtos.</Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Tentar de novo</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // Renderiza a lista de produtos com busca e filtro de categorias
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Barra de Busca e Atalho para Novo Produto */}
      <View style={styles.headerRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produto..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#888"
        />
        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/novo" as any)}
        >
          <Text style={styles.addButtonText}>＋</Text>
        </Pressable>
      </View>

      {/* Filtro de Categorias (Chips) */}
      <View style={styles.chipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Pressable
            style={[styles.chip, selectedCategory === null && styles.chipActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.chipText, selectedCategory === null && styles.chipTextActive]}>
              Todos
            </Text>
          </Pressable>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              style={[styles.chip, selectedCategory === cat && styles.chipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Lista de Produtos */}
      <FlatList<Product>
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        refreshing={isRefetching}
        onRefresh={refetch}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum produto encontrado.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/produto/${item.id}` as any)}
          >
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.cardCategory}>{item.category}</Text>
              <Text style={styles.cardPrice}>R$ {item.price.toFixed(2)}</Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#8F839A" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#8F839A" },
  headerRow: { flexDirection: "row", padding: 16, gap: 12 },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: "#A39EB5",
    borderWidth: 1,
    borderColor: "#9C7176", 
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#6B4644", 
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: "#D57C5C", 
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontSize: 24, fontWeight: "600" },
  chipsContainer: { paddingHorizontal: 16, marginBottom: 12, maxHeight: 40 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#A39EB5", 
    borderRadius: 20,
    marginRight: 8,
    height: 36,
    justifyContent: "center",
  },
  chipActive: { backgroundColor: "#6B4644" }, 
  chipText: { color: "#6B4644", fontSize: 14 },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#9C7176",
  },
  thumbnail: { width: 60, height: 60, borderRadius: 6, backgroundColor: "#ddd" },
  cardInfo: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#6B4644" }, 
  cardCategory: { fontSize: 12, color: "#98615A", marginTop: 2, textTransform: "uppercase" }, 
  cardPrice: { fontSize: 14, fontWeight: "700", color: "#6B4644", marginTop: 6 },
  errorText: { fontSize: 16, color: "#D57C5C", marginBottom: 12, textAlign: "center", fontWeight: "600" },
  retryButton: { backgroundColor: "#6B4644", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
  retryButtonText: { color: "#fff", fontWeight: "600" },
  emptyContainer: { padding: 40, alignItems: "center" },
  emptyText: { color: "#fff", fontSize: 16 },
});