import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProduct, deleteProduct } from "../../src/api";
import { Product, ProductsResponse } from "../../src/types";

// Tela responsável por mostrar os detalhes de um produto
export default function DetalheScreen() {
  // Obtém o ID do produto a partir dos parâmetros da URL
  const { id } = useLocalSearchParams<{ id: string }>();
  // Configura o roteador e o cliente de cache do React Query
  const router = useRouter();
  // Configura o cliente de cache do React Query
  const queryClient = useQueryClient();

  // Busca os detalhes do produto usando o ID
  const { data: product, isLoading, isError } = useQuery<Product>({
    queryKey: ["product", id],
    //Define uma chave única para o cache do produto com base no ID
    queryFn: () => getProduct(id),
  });

  // Configura a mutação para excluir o produto
  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(id),
    onSuccess: () => {
      // Atualiza o cache da lista removendo o item excluído
      queryClient.setQueryData<ProductsResponse>(["products"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          products: oldData.products.filter((item) => item.id.toString() !== id),
        };
      });
      router.back();
    },
    onError: () => {
      Alert.alert("Erro", "Não foi possível excluir o produto.");
    },
  });

  // Função para lidar com a exclusão do produto, mostrando um alerta de confirmação
  const handleDelete = () => {
    Alert.alert("Excluir", "Tem certeza que deseja excluir este produto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => deleteMutation.mutate(),
      },
    ]);
  };

  // Renderiza a tela com base no estado da busca e da mutação
  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={["top"]}>
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  // Se houver um erro ou o produto não for encontrado, exibe uma mensagem de erro
  if (isError || !product) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={["top"]}>
        <Text style={styles.errorText}>Produto não encontrado.</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // Renderiza os detalhes do produto, incluindo imagem, categoria, título, preço e descrição
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={{ uri: product.thumbnail || (product.images && product.images[0]) }}
          style={styles.image}
        />
        <View style={styles.content}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>R$ {product.price.toFixed(2)}</Text>
          <Text style={styles.descriptionHeader}>Descrição</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>
      </ScrollView>

      {/* Rodapé com botões de Editar e Excluir */}
      <View style={styles.footer}>
        <Pressable
          style={styles.editButton}
          onPress={() => router.push({ pathname: "/novo", params: { id: product.id } } as any)}
        >
          <Text style={styles.editButtonText}>Editar</Text>
        </Pressable>
        <Pressable
          style={[styles.deleteButton, deleteMutation.isPending && styles.disabledButton]}
          onPress={handleDelete}
          disabled={deleteMutation.isPending}
        >
          <Text style={styles.deleteButtonText}>
            {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#8F839A" }, 
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#8F839A" },
  scrollContent: { paddingBottom: 100 },
  image: { width: "100%", height: 300, backgroundColor: "#A39EB5" }, 
  content: { padding: 20 },
  category: { fontSize: 12, color: "#98615A", textTransform: "uppercase", fontWeight: "600" },
  title: { fontSize: 24, fontWeight: "700", color: "#6B4644", marginTop: 4 }, 
  price: { fontSize: 20, fontWeight: "700", color: "#6B4644", marginTop: 12 }, 
  descriptionHeader: { fontSize: 16, fontWeight: "600", color: "#6B4644", marginTop: 24, marginBottom: 8 },
  description: { fontSize: 14, color: "#332930", lineHeight: 22 }, 
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#A39EB5", 
    borderTopWidth: 1,
    borderColor: "#9C7176", 
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#6B4644", 
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  deleteButton: {
    flex: 1,
    backgroundColor: "#D57C5C", 
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  disabledButton: { opacity: 0.6 },
  errorText: { fontSize: 16, color: "#6B4644", marginBottom: 12, fontWeight: "600" },
  backButton: { backgroundColor: "#6B4644", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
  backButtonText: { color: "#fff", fontWeight: "600" },
});