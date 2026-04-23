import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

export default function PharmacyScreen() {
  const navigation = useNavigation();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);

  const [medicines, setMedicines] = useState([
    { id: "1", name: "Paracetamol", stock: 50, price: 10, expiry: "Dec 2026" },
    { id: "2", name: "Insulin", stock: 5, price: 300, expiry: "Aug 2025" },
    { id: "3", name: "Aspirin", stock: 0, price: 20, expiry: "Jan 2025" },
    { id: "4", name: "Amoxicillin", stock: 25, price: 45, expiry: "Nov 2026" },
    { id: "5", name: "Cetrizine", stock: 12, price: 15, expiry: "Oct 2025" },
  ]);

  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [expiry, setExpiry] = useState("");

  // STATUS
  const getStatus = (stock: number) => {
    if (stock === 0) return "Out";
    if (stock < 10) return "Low";
    return "In";
  };

  // FILTER
  const filtered = medicines.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const status = getStatus(m.stock);

    const matchFilter =
      filter === "All"
        ? true
        : filter === "In Stock"
        ? status === "In"
        : filter === "Low Stock"
        ? status === "Low"
        : status === "Out";

    return matchSearch && matchFilter;
  });

  // ADD
  const addMedicine = () => {
    if (!name || !stock || !price || !expiry) return;

    const newMed = {
      id: Date.now().toString(),
      name,
      stock: Number(stock),
      price: Number(price),
      expiry,
    };

    setMedicines([newMed, ...medicines]);

    setName("");
    setStock("");
    setPrice("");
    setExpiry("");
    setModalVisible(false);
  };

  // UPDATE STOCK
  const updateStock = (id: string, change: number) => {
    setMedicines(
      medicines.map((m) =>
        m.id === id
          ? { ...m, stock: Math.max(0, m.stock + change) }
          : m
      )
    );
  };

  // DELETE
  const deleteMedicine = (id: string) => {
    setMedicines(medicines.filter((m) => m.id !== id));
  };

  const total = medicines.length;
  const low = medicines.filter((m) => m.stock > 0 && m.stock < 10).length;
  const out = medicines.filter((m) => m.stock === 0).length;

  return (
    <SafeAreaView style={s.safe}>
      <View style={{ flex: 1 }}>

        {/* HEADER */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.back}>←</Text>
          </TouchableOpacity>
          <Text style={s.title}>Pharmacy</Text>
        </View>

        {/* STATS */}
        <View style={s.statsRow}>
          <Text>Total: {total}</Text>
          <Text>Low: {low}</Text>
          <Text>Out: {out}</Text>
        </View>

        {/* FILTER */}
        <View style={s.filterRow}>
          {["All", "In Stock", "Low Stock", "Out"].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[s.filterBtn, filter === f && s.activeFilter]}
            >
              <Text style={filter === f ? s.activeText : s.filterText}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SEARCH */}
        <TextInput
          placeholder="Search medicine..."
          value={search}
          onChangeText={setSearch}
          style={s.search}
        />

        {/* LIST */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          {filtered.map((m) => {
            const status = getStatus(m.stock);

            return (
              <View key={m.id} style={s.card}>
                <View style={s.rowBetween}>
                  <Text style={s.name}>{m.name}</Text>
                  <Text>
                    {status === "In" && "🟢"}
                    {status === "Low" && "🟡"}
                    {status === "Out" && "🔴"}
                  </Text>
                </View>

                <Text style={s.info}>Stock: {m.stock}</Text>
                <Text style={s.info}>Price: ₹{m.price}</Text>
                <Text style={s.info}>Expiry: {m.expiry}</Text>

                <View style={s.actions}>
                  <TouchableOpacity onPress={() => updateStock(m.id, 1)}>
                    <Text style={s.actionBtn}>+1</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => updateStock(m.id, -1)}>
                    <Text style={s.actionBtn}>-1</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => deleteMedicine(m.id)}>
                    <Text style={[s.actionBtn, { color: "red" }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* ADD BUTTON */}
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text style={s.addText}>+ Add Medicine</Text>
        </TouchableOpacity>

        {/* MODAL */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={s.modalBg}
          >
            <View style={s.modalBox}>
              <TouchableOpacity
                style={s.close}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ fontSize: 18 }}>✕</Text>
              </TouchableOpacity>

              <Text style={s.modalTitle}>Add Medicine</Text>

              <TextInput
                placeholder="Name"
                value={name}
                onChangeText={setName}
                style={s.input}
              />
              <TextInput
                placeholder="Stock"
                value={stock}
                onChangeText={setStock}
                keyboardType="numeric"
                style={s.input}
              />
              <TextInput
                placeholder="Price"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                style={s.input}
              />
              <TextInput
                placeholder="Expiry"
                value={expiry}
                onChangeText={setExpiry}
                style={s.input}
              />

              <TouchableOpacity style={s.saveBtn} onPress={addMedicine}>
                <Text style={{ color: "#fff" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#EEF4FF" },

  header: {
    padding: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },

  back: { fontSize: 22, marginRight: 10 },
  title: { fontSize: 20, fontWeight: "700" },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  filterBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },

  activeFilter: { backgroundColor: "#2563EB" },
  filterText: { color: "#333" },
  activeText: { color: "#fff" },

  search: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 10,
    borderRadius: 10,
  },

  card: {
    backgroundColor: "#E8F1FF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  name: { fontWeight: "700", fontSize: 16 },
  info: { color: "#444", marginTop: 2 },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  actionBtn: { color: "#2563EB" },

  addBtn: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  addText: { color: "#fff", fontWeight: "700" },

  modalBg: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  modalBox: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },

  close: {
    position: "absolute",
    right: 10,
    top: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },

  saveBtn: {
    backgroundColor: "#2563EB",
    padding: 12,
    marginTop: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});