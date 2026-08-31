import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProduct, createProduct, updateProduct } from "../src/api";
import { Product, ProductsResponse } from "../src/types";

// Schema de validação com Zod
const productSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres."),
  price: z
    .string()
    .min(1, "O preço é obrigatório.")
    .refine((val) => {
      const normalized = Number(val.replace(",", "."));
      return !isNaN(normalized) && normalized > 0;
    }, "O preço deve ser maior que 0."),
  category: z.string().min(1, "A categoria é obrigatória."),
  description: z.string().optional(),
});

// Tipo derivado do schema para uso no formulário
type ProductFormData = z.infer<typeof productSchema>;

// Tela responsável por criar ou editar um produto
export default function FormularioScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Busca dados caso esteja em modo de edição
  const { data: productData, isLoading: isLoadingProduct } = useQuery<Product>({
    queryKey: ["product", id],
    queryFn: () => getProduct(id!),
    enabled: isEditing,
  });

  // Configuração do React Hook Form com validação Zod
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      title: "",
      price: "0",
      category: "",
      description: "",
    },
  });

  // Preenche o formulário com os dados do produto quando em modo de edição
  useEffect(() => {
    if (productData) {
      reset({
        title: productData.title,
        price: String(productData.price),
        category: productData.category,
        description: productData.description || "",
      });
    }
  }, [productData, reset]);

  // Configuração da mutação para criar ou atualizar o produto
  const mutation = useMutation({
    mutationFn: (data: ProductFormData) => {
      const payload = {
        title: data.title,
        price: Number(data.price),
        category: data.category,
        description: data.description,
      };
      // Decide se vai criar ou atualizar com base no estado de edição
      if (isEditing && id) {
        return updateProduct(id, payload);
      }
      // Se não estiver editando, cria um novo produto
      return createProduct(payload as any);
    },
    // Atualiza o cache da lista de produtos após a mutação bem-sucedida
    onSuccess: (savedProduct) => {
      queryClient.setQueryData<ProductsResponse>(["products"], (oldData) => {
        if (!oldData) return oldData;
        if (isEditing) {
          return {
            ...oldData,
            products: oldData.products.map((item) =>
              item.id.toString() === id ? savedProduct : item
            ),
          };
        } else {
          return {
            ...oldData,
            products: [savedProduct, ...oldData.products],
          };
        }
      });
      Alert.alert("Sucesso", isEditing ? "Produto atualizado!" : "Produto criado!");
      router.back();
    },
    onError: () => {
      Alert.alert("Erro", "Não foi possível salvar o produto.");
    },
  });

  // Função chamada ao submeter o formulário, que dispara a mutação
  const onSubmit = (data: ProductFormData) => {
    mutation.mutate(data);
  };

  // Renderiza um indicador de carregamento enquanto os dados do produto estão sendo buscados em modo de edição
  if (isEditing && isLoadingProduct) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={["top"]}>
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  // Renderiza a tela do formulário para criar ou editar um produto
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.headerTitle}>
            {isEditing ? "Editar Produto" : "Novo Produto"}
          </Text>

          {/* Campo Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título</Text>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.title && styles.inputError]}
                  placeholder="Ex: Camiseta Básica"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholderTextColor="#888"
                />
              )}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
          </View>

          {/* Campo Price */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preço</Text>
            <Controller
              control={control}
              name="price"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.price && styles.inputError]}
                  placeholder="0.00"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={String(value ?? "")}
                  placeholderTextColor="#888"
                />
              )}
            />
            {errors.price && <Text style={styles.errorText}>{errors.price.message}</Text>}
          </View>

          {/* Campo Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoria</Text>
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.category && styles.inputError]}
                  placeholder="Ex: roupas"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholderTextColor="#888"
                />
              )}
            />
            {errors.category && <Text style={styles.errorText}>{errors.category.message}</Text>}
          </View>

          {/* Campo Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição (Opcional)</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Detalhes do produto..."
                  multiline
                  numberOfLines={4}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholderTextColor="#888"
                />
              )}
            />
          </View>

          {/* Botão de Envio */}
          <Pressable
            style={[styles.submitButton, mutation.isPending && styles.disabledButton]}
            onPress={handleSubmit(onSubmit)}
            disabled={mutation.isPending}
          >
            <Text style={styles.submitButtonText}>
              {mutation.isPending ? "Salvando..." : "Salvar Produto"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#8F839A" },
  flex: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#8F839A" },
  scrollContent: { padding: 20 },
  headerTitle: { fontSize: 22, fontWeight: "700", marginBottom: 20, color: "#6B4644" },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#6B4644", marginBottom: 6 }, 
  input: {
    height: 48,
    backgroundColor: "#A39EB5", 
    borderWidth: 1,
    borderColor: "#9C7176", 
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#6B4644", 
  },
  textArea: { height: 100, textAlignVertical: "top", paddingTop: 12 },
  inputError: { borderColor: "#D57C5C" },
  errorText: { color: "#6B4644", fontSize: 12, marginTop: 4, fontWeight: "600" },
  submitButton: {
    backgroundColor: "#6B4644", 
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  disabledButton: { opacity: 0.6 },
});