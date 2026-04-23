import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

export default function BillingScreen() {
  const navigation = useNavigation();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);

  const [bills, setBills] = useState([
    {
      id: "1",
      patient: "Arjun",
      amount: 6000,
      status: "Paid",
      method: "UPI",
      date: "23 Apr",
      invoice: "INV-1001",
    },
    {
      id: "2",
      patient: "Priya",
      amount: 1500,
      status: "Pending",
      method: "Cash",
      date: "22 Apr",
      invoice: "INV-1002",
    },
  ]);

  const [patient, setPatient] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");

  const filtered = bills
    .filter((b) => {
      const matchSearch = b.patient
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchFilter = filter === "All" ? true : b.status === filter;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => Number(b.id) - Number(a.id));

  const addBill = () => {
    if (!patient || !amount || !method) return;

    const newBill = {
      id: Date.now().toString(),
      patient,
      amount: Number(amount),
      status: "Pending",
      method,
      date: "Today",
      invoice: `INV-${Math.floor(Math.random() * 10000)}`,
    };

    setBills([newBill, ...bills]);

    setPatient("");
    setAmount("");
    setMethod("");
    setModalVisible(false);
  };

  const toggleStatus = (id: string) => {
    setBills(
      bills.map((b) =>
        b.id === id
          ? { ...b, status: b.status === "Paid" ? "Pending" : "Paid" }
          : b
      )
    );
  };

  const deleteBill = (id: string) => {
    setBills(bills.filter((b) => b.id !== id));
  };

  const total = bills.reduce((sum, b) => sum + b.amount, 0);
  const paid = bills
    .filter((b) => b.status === "Paid")
    .reduce((s, b) => s + b.amount, 0);
  const pending = total - paid;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Billing</Text>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <Text>Total: ₹{total}</Text>
          <Text>Paid: ₹{paid}</Text>
          <Text>Pending: ₹{pending}</Text>
        </View>

        {/* FILTER */}
        <View style={styles.filterRow}>
          {["All", "Paid", "Pending"].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterBtn,
                filter === f && styles.activeFilter,
              ]}
            >
              <Text
                style={filter === f ? styles.activeText : styles.filterText}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SEARCH */}
        <TextInput
          placeholder="Search patient..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />

        {/* LIST */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        >
          {filtered.map((b) => (
            <View key={b.id} style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.name}>{b.patient}</Text>
                <Text>
                  {b.status === "Paid" ? "🟢 Paid" : "🔴 Pending"}
                </Text>
              </View>

              <Text
                style={[
                  styles.info,
                  b.amount > 5000 && {
                    color: "green",
                    fontWeight: "700",
                  },
                ]}
              >
                Amount: ₹{b.amount}
              </Text>

              <Text style={styles.info}>Method: {b.method}</Text>
              <Text style={styles.info}>Date: {b.date}</Text>
              <Text style={styles.info}>Invoice: {b.invoice}</Text>

              <View style={styles.actions}>
                <TouchableOpacity onPress={() => toggleStatus(b.id)}>
                  <Text style={styles.actionBtn}>Toggle</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => deleteBill(b.id)}>
                  <Text style={[styles.actionBtn, { color: "red" }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* ADD BUTTON */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addText}>+ Add Bill</Text>
        </TouchableOpacity>

        {/* MODAL */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalBg}>
            <View style={styles.modalBox}>
              <TouchableOpacity
                style={styles.close}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ fontSize: 18 }}>✕</Text>
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Add Bill</Text>

              <TextInput
                placeholder="Patient Name"
                value={patient}
                onChangeText={setPatient}
                style={styles.input}
              />
              <TextInput
                placeholder="Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                placeholder="Payment Method"
                value={method}
                onChangeText={setMethod}
                style={styles.input}
              />

              <TouchableOpacity style={styles.saveBtn} onPress={addBill}>
                <Text style={{ color: "#fff" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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