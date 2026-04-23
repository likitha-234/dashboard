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
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PatientsScreen() {
  const navigation = useNavigation();

  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const [patients, setPatients] = useState([
    { id: "1", name: "Arjun Kumar", age: "30", condition: "Fever", doctor: "Dr. Ravi", date: "23 Apr", status: "Active" },
    { id: "2", name: "Priya Sharma", age: "25", condition: "Diabetes", doctor: "Dr. Meena", date: "22 Apr", status: "Under Review" },
    { id: "3", name: "Meena Rao", age: "40", condition: "BP", doctor: "Dr. Kiran", date: "21 Apr", status: "Recovered" },
  ]);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [condition, setCondition] = useState("");

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addPatient = () => {
    if (!name || !age || !condition) return;

    const newPatient = {
      id: Date.now().toString(),
      name,
      age,
      condition,
      doctor: "Dr. Assigned",
      date: "Today",
      status: "Active",
    };

    setPatients([newPatient, ...patients]);

    setName("");
    setAge("");
    setCondition("");
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={{ flex: 1 }}>

        {/* HEADER */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.back}>←</Text>
          </TouchableOpacity>
          <Text style={s.title}>Patients</Text>
        </View>

        {/* SEARCH */}
        <TextInput
          placeholder="Search patients..."
          value={search}
          onChangeText={setSearch}
          style={s.search}
        />

        {/* LIST */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
          keyboardShouldPersistTaps="handled"
        >
          {filtered.map((p) => (
            <View key={p.id} style={s.card}>

              <View style={s.rowBetween}>
                <Text style={s.name}>{p.name}</Text>
                <Text style={[
                  s.status,
                  p.status === "Active" && s.active,
                  p.status === "Under Review" && s.review,
                  p.status === "Recovered" && s.recovered,
                ]}>
                  {p.status}
                </Text>
              </View>

              <Text style={s.info}>Age: {p.age}</Text>
              <Text style={s.info}>Condition: {p.condition}</Text>
              <Text style={s.info}>Doctor: {p.doctor}</Text>
              <Text style={s.info}>Visited: {p.date}</Text>

            </View>
          ))}
        </ScrollView>

        {/* ADD BUTTON */}
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text style={s.addText}>+ Add Patient</Text>
        </TouchableOpacity>

        {/* MODAL */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={s.modalBg}>
            <View style={s.modalBox}>
              <Text style={s.modalTitle}>Add Patient</Text>

              <TextInput
                placeholder="Name"
                value={name}
                onChangeText={setName}
                style={s.input}
              />
              <TextInput
                placeholder="Age"
                value={age}
                onChangeText={setAge}
                style={s.input}
              />
              <TextInput
                placeholder="Condition"
                value={condition}
                onChangeText={setCondition}
                style={s.input}
              />

              <TouchableOpacity style={s.saveBtn} onPress={addPatient}>
                <Text style={{ color: "#fff" }}>Save</Text>
              </TouchableOpacity>

            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#EEF4FF" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    elevation: 2,
  },

  back: { fontSize: 22, marginRight: 10 },

  title: { fontSize: 20, fontWeight: "700" },

  search: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 12,
    borderRadius: 10,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  // 🔵 LIGHT BLUE CARD
  card: {
    backgroundColor: "#E8F1FF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
  },

  name: { fontSize: 16, fontWeight: "700" },

  info: { color: "#444", marginTop: 2 },

  status: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: "600",
  },

  active: { backgroundColor: "#D1FAE5", color: "#065F46" },
  review: { backgroundColor: "#FEF3C7", color: "#92400E" },
  recovered: { backgroundColor: "#DBEAFE", color: "#1E40AF" },

  addBtn: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 12,
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