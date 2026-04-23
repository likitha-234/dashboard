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

export default function AppointmentsScreen() {
  const navigation = useNavigation();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);

  const [appointments, setAppointments] = useState([
    {
      id: "1",
      patient: "Arjun",
      doctor: "Dr. Ravi",
      time: "10:30 AM",
      date: "23 Apr",
      status: "Completed",
    },
    {
      id: "2",
      patient: "Priya",
      doctor: "Dr. Meena",
      time: "12:00 PM",
      date: "23 Apr",
      status: "Upcoming",
    },
    {
      id: "3",
      patient: "Kiran",
      doctor: "Dr. Ravi",
      time: "2:30 PM",
      date: "23 Apr",
      status: "Cancelled",
    },
  ]);

  const [patient, setPatient] = useState("");
  const [doctor, setDoctor] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  // 🔍 FILTER + SEARCH
  const filtered = appointments.filter((a) => {
    const matchSearch =
      a.patient.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "All" ? true : a.status === filter;

    return matchSearch && matchFilter;
  });

  // ➕ ADD
  const addAppointment = () => {
    if (!patient || !doctor || !time || !date) return;

    const newAppointment = {
      id: Date.now().toString(),
      patient,
      doctor,
      time,
      date,
      status: "Upcoming",
    };

    setAppointments([newAppointment, ...appointments]);

    setPatient("");
    setDoctor("");
    setTime("");
    setDate("");
    setModalVisible(false);
  };

  // 🔁 STATUS TOGGLE
  const toggleStatus = (id: string) => {
    setAppointments(
      appointments.map((a) =>
        a.id === id
          ? {
              ...a,
              status:
                a.status === "Upcoming"
                  ? "Completed"
                  : a.status === "Completed"
                  ? "Cancelled"
                  : "Upcoming",
            }
          : a
      )
    );
  };

  // 🗑 DELETE
  const deleteAppointment = (id: string) => {
    setAppointments(appointments.filter((a) => a.id !== id));
  };

  // 📊 STATS
  const total = appointments.length;
  const upcoming = appointments.filter((a) => a.status === "Upcoming").length;
  const completed = appointments.filter((a) => a.status === "Completed").length;

  return (
    <SafeAreaView style={s.safe}>
      <View style={{ flex: 1 }}>

        {/* HEADER */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.back}>←</Text>
          </TouchableOpacity>
          <Text style={s.title}>Appointments</Text>
        </View>

        {/* STATS */}
        <View style={s.statsRow}>
          <Text>Total: {total}</Text>
          <Text>Upcoming: {upcoming}</Text>
          <Text>Completed: {completed}</Text>
        </View>

        {/* FILTER */}
        <View style={s.filterRow}>
          {["All", "Upcoming", "Completed", "Cancelled"].map((f) => (
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
          placeholder="Search patient / doctor..."
          value={search}
          onChangeText={setSearch}
          style={s.search}
        />

        {/* LIST */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        >
          {filtered.map((a) => (
            <View key={a.id} style={s.card}>

              <View style={s.rowBetween}>
                <Text style={s.name}>{a.patient}</Text>
                <Text>
                  {a.status === "Upcoming" && "🟡 Upcoming"}
                  {a.status === "Completed" && "🟢 Completed"}
                  {a.status === "Cancelled" && "🔴 Cancelled"}
                </Text>
              </View>

              <Text style={s.info}>Doctor: {a.doctor}</Text>
              <Text style={s.info}>Time: {a.time}</Text>
              <Text style={s.info}>Date: {a.date}</Text>

              <View style={s.actions}>
                <TouchableOpacity onPress={() => toggleStatus(a.id)}>
                  <Text style={s.actionBtn}>Change Status</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => deleteAppointment(a.id)}>
                  <Text style={[s.actionBtn, { color: "red" }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          ))}
        </ScrollView>

        {/* ADD BUTTON */}
        <TouchableOpacity style={s.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={s.addText}>+ Add Appointment</Text>
        </TouchableOpacity>

        {/* MODAL */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={s.modalBg}>
            <View style={s.modalBox}>

              <TouchableOpacity style={s.close} onPress={() => setModalVisible(false)}>
                <Text style={{ fontSize: 18 }}>✕</Text>
              </TouchableOpacity>

              <Text style={s.modalTitle}>Add Appointment</Text>

              <TextInput placeholder="Patient Name" value={patient} onChangeText={setPatient} style={s.input}/>
              <TextInput placeholder="Doctor Name" value={doctor} onChangeText={setDoctor} style={s.input}/>
              <TextInput placeholder="Time (e.g. 10:30 AM)" value={time} onChangeText={setTime} style={s.input}/>
              <TextInput placeholder="Date (e.g. 23 Apr)" value={date} onChangeText={setDate} style={s.input}/>

              <TouchableOpacity style={s.saveBtn} onPress={addAppointment}>
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