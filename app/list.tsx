import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";

type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

const API_URLS = [
  "https://jsonplaceholder.typicode.com/todos?_limit=5",
  "https://dummyjson.com/todos?limit=5",
  "https://fakestoreapi.com/products?limit=5",
];

const List = () => {
  const [data, setData] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apiSource, setApiSource] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    for (const url of API_URLS) {
      try {
        console.log(`Trying API: ${url}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.log(`API ${url} returned status: ${response.status}`);
          continue; // Thử API tiếp theo
        }

        const json = await response.json();
        console.log(`Success with API: ${url}`);

        // Xử lý data tùy API
        let processedData: Todo[] = [];

        if (url.includes("fakestoreapi")) {
          // Chuyển đổi products sang todo format
          processedData = json.map((product: any, index: number) => ({
            userId: 1,
            id: product.id || index + 1,
            title: product.title || product.name || `Item ${index + 1}`,
            completed: Math.random() > 0.5,
          }));
        } else if (url.includes("dummyjson")) {
          // Dummyjson trả về { todos: [...] }
          processedData = json.todos || json || [];
          // Đảm bảo data có đúng format
          processedData = processedData.map((item: any) => ({
            userId: item.userId || 1,
            id: item.id || 0,
            title: item.todo || item.title || "No title",
            completed: item.completed || false,
          }));
        } else {
          // JSONPlaceholder
          processedData = Array.isArray(json) ? json : [];
        }

        setData(processedData);
        setApiSource(url);
        setLoading(false);
        return; // Thành công, dừng vòng lặp

      } catch (err: any) {
        console.log(`Failed ${url}:`, err.message || err);
        // Tiếp tục thử API tiếp theo
      }
    }

    // Nếu tất cả API đều fail, dùng mock data
    console.log("All APIs failed, using mock data");
    setData([
      { userId: 1, id: 1, title: "delectus aut autem", completed: false },
      { userId: 1, id: 2, title: "quis ut nam facilis et officia qui", completed: false },
      { userId: 1, id: 3, title: "fugiat veniam minus", completed: false },
      { userId: 1, id: 4, title: "et porro tempora", completed: true },
      { userId: 1, id: 5, title: "laboriosam mollitia et enim quasi adipisci quia provident illum", completed: false },
    ]);
    setApiSource("Mock Data (API unavailable)");
    setError("Could not connect to any API. Showing offline data.");
    setLoading(false);
  };

  const retryFetch = () => {
    fetchData();
  };

  const renderItem = ({ item }: { item: Todo }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.id}>ID: {item.id}</Text>
        <View style={[
          styles.statusBadge,
          item.completed ? styles.completedBadge : styles.pendingBadge
        ]}>
          <Text style={styles.statusText}>
            {item.completed ? "✓ Completed" : "◼ Pending"}
          </Text>
        </View>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.userId}>User ID: {item.userId}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E2B070" />
          <Text style={styles.loadingText}>Loading todos...</Text>
          <Text style={styles.tryingText}>Trying multiple APIs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Todo List</Text>
        <Text style={styles.headerSubtitle}>
          Source: {apiSource.replace('https://', '').split('/')[0]}
          {error && " (Offline Mode)"}
        </Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.refreshButton} onPress={retryFetch}>
            <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
          </TouchableOpacity>
          
          {error && (
            <TouchableOpacity 
              style={[styles.refreshButton, { backgroundColor: '#d4edda', marginLeft: 10 }]} 
              onPress={() => setError(null)}
            >
              <Text style={[styles.refreshButtonText, { color: '#155724' }]}>
                Hide Error
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚠️ Connection Issue</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.fallbackText}>
            You can still use the app with offline data
          </Text>
        </View>
      )}

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          data.length > 0 ? (
            <Text style={styles.resultCount}>
              Showing {data.length} items
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No todos found</Text>
            <TouchableOpacity style={styles.retryButton} onPress={retryFetch}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#E2B070",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#d4a657",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 5,
  },
  refreshButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
  },
  refreshButtonText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  id: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  title: {
    fontSize: 16,
    color: "#444",
    marginBottom: 8,
    lineHeight: 22,
  },
  userId: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: "#d4edda",
  },
  pendingBadge: {
    backgroundColor: "#fff3cd",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  tryingText: {
    marginTop: 8,
    fontSize: 12,
    color: "#888",
    fontStyle: 'italic',
  },
  errorContainer: {
    backgroundColor: "#fff3cd",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ffeaa7",
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#856404",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#856404",
    marginBottom: 8,
  },
  fallbackText: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
  },
  resultCount: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    fontStyle: 'italic',
  },
  retryButton: {
    backgroundColor: "#E2B070",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
    width: 120,
  },
  retryButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
    marginBottom: 20,
  },
});

export default List;