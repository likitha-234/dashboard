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

export default function DoctorsScreen() {
  const navigation = useNavigation();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  const [doctors, setDoctors] = useState<any[]>([
    {
      id: "1",
      name: "Dr. Ravi",
      specialty: "Cardiology",
      experience: "8 yrs",
      status: "Available",
      lastActive: "10:30 AM",
      nextSlot: "2:30 PM",
      patients: [
        { id: "p1", name: "Arjun", condition: "Fever" },
        { id: "p2", name: "Riya", condition: "BP" },
      ],
    },
    {
      id: "2",
      name: "Dr. Meena",
      specialty: "Dermatology",
      experience: "5 yrs",
      status: "Busy",
      lastActive: "9:15 AM",
      nextSlot: "4:00 PM",
      patients: [
        { id: "p3", name: "Kiran", condition: "Skin Allergy" },
      ],
    },
  ]);

  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState("");

  // FILTER + SEARCH
  const filtered = doctors.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "All" ? true : d.status === filter;

    return matchSearch && matchFilter;
  });

  // ADD
  const addDoctor = () => {
    if (!name || !specialty || !experience) return;

    const newDoctor = {
      id: Date.now().toString(),
      name,
      specialty,
      experience,
      status: "Available",
      lastActive: "Now",
      nextSlot: "TBD",
      patients: [],
    };

    setDoctors([newDoctor, ...doctors]);

    setName("");
    setSpecialty("");
    setExperience("");
    setModalVisible(false);
  };

  // TOGGLE STATUS
  const toggleStatus = (id: string) => {
    setDoctors(doctors.map(d =>
      d.id === id
        ? { ...d, status: d.status === "Available" ? "Busy" : "Available" }
        : d
    ));
  };

  // DELETE
  const deleteDoctor = (id: string) => {
    setDoctors(doctors.filter(d => d.id !== id));
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={{ flex: 1 }}>

        {/* ===== PATIENT VIEW ===== */}
        {selectedDoctor ? (
          <>
            <View style={s.header}>
              <TouchableOpacity onPress={() => setSelectedDoctor(null)}>
                <Text style={s.back}>←</Text>
              </TouchableOpacity>
              <Text style={s.title}>{selectedDoctor.name} Patients</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
              {selectedDoctor.patients.length === 0 ? (
                <Text>No patients assigned</Text>
              ) : (
                selectedDoctor.patients.map((p: any) => (
                  <View key={p.id} style={s.card}>
                    <Text style={s.name}>{p.name}</Text>
                    <Text style={s.info}>{p.condition}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </>
        ) : (
          <>
            {/* ===== MAIN SCREEN ===== */}
            <View style={s.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={s.back}>←</Text>
              </TouchableOpacity>
              <Text style={s.title}>Doctors</Text>
            </View>

            {/* STATS */}
            <View style={s.statsRow}>
              <Text>Total: {doctors.length}</Text>
              <Text>Available: {doctors.filter(d => d.status === "Available").length}</Text>
              <Text>Busy: {doctors.filter(d => d.status === "Busy").length}</Text>
            </View>

            {/* FILTER */}
            <View style={s.filterRow}>
              {["All", "Available", "Busy"].map((f) => (
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
              placeholder="Search doctor..."
              value={search}
              onChangeText={setSearch}
              style={s.search}
            />

            {/* LIST */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
            >
              {filtered.map((d) => (
                <View key={d.id} style={s.card}>

                  <TouchableOpacity onPress={() => setSelectedDoctor(d)}>
                    <Text style={s.name}>{d.name}</Text>
                  </TouchableOpacity>

                  <View style={s.rowBetween}>
                    <Text style={s.info}>{d.specialty}</Text>
                    <Text>
                      {d.status === "Available" ? "🟢" : "🔴"} {d.status}
                    </Text>
                  </View>

                  <Text style={s.info}>Experience: {d.experience}</Text>
                  <Text style={s.info}>Patients: {d.patients.length}</Text>
                  <Text style={s.info}>Next Slot: {d.nextSlot}</Text>
                  <Text style={s.lastActive}>Last Active: {d.lastActive}</Text>

                  <View style={s.actions}>
                    <TouchableOpacity onPress={() => toggleStatus(d.id)}>
                      <Text style={s.actionBtn}>Toggle</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => deleteDoctor(d.id)}>
                      <Text style={[s.actionBtn, { color: "red" }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>

                </View>
              ))}
            </ScrollView>

            {/* ADD BUTTON */}
            <TouchableOpacity style={s.addBtn} onPress={() => setModalVisible(true)}>
              <Text style={s.addText}>+ Add Doctor</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ===== MODAL ===== */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={s.modalBg}>
            <View style={s.modalBox}>

              <TouchableOpacity style={s.close} onPress={() => setModalVisible(false)}>
                <Text style={{ fontSize: 18 }}>✕</Text>
              </TouchableOpacity>

              <Text style={s.modalTitle}>Add Doctor</Text>

              <TextInput placeholder="Name" value={name} onChangeText={setName} style={s.input} />
              <TextInput placeholder="Specialty" value={specialty} onChangeText={setSpecialty} style={s.input} />
              <TextInput placeholder="Experience" value={experience} onChangeText={setExperience} style={s.input} />

              <TouchableOpacity style={s.saveBtn} onPress={addDoctor}>
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
  header: { padding: 16, backgroundColor: "#fff", flexDirection: "row", alignItems: "center" },
  back: { fontSize: 22, marginRight: 10 },
  title: { fontSize: 20, fontWeight: "700" },
  statsRow: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
  filterRow: { flexDirection: "row", justifyContent: "space-around" },
  filterBtn: { padding: 8, borderRadius: 8, backgroundColor: "#E5E7EB" },
  activeFilter: { backgroundColor: "#2563EB" },
  filterText: { color: "#333" },
  activeText: { color: "#fff" },
  search: { backgroundColor: "#fff", margin: 16, padding: 10, borderRadius: 10 },
  card: { backgroundColor: "#E8F1FF", padding: 16, borderRadius: 12, marginBottom: 12 },
  name: { fontWeight: "700", fontSize: 16 },
  info: { color: "#444", marginTop: 2 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  lastActive: { marginTop: 5, fontSize: 12, color: "#666" },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  actionBtn: { color: "#2563EB" },
  addBtn: { position: "absolute", bottom: 20, left: 20, right: 20, backgroundColor: "#2563EB", padding: 15, borderRadius: 10, alignItems: "center" },
  addText: { color: "#fff", fontWeight: "700" },
  modalBg: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)" },
  modalBox: { backgroundColor: "#fff", margin: 20, padding: 20, borderRadius: 12 },
  close: { position: "absolute", right: 10, top: 10 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 10, marginVertical: 5, borderRadius: 8 },
  saveBtn: { backgroundColor: "#2563EB", padding: 12, marginTop: 10, borderRadius: 8, alignItems: "center" },
});