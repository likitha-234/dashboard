import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
  const navigation = useNavigation();

  const [isActive, setIsActive] = useState(true);

  const [name, setName] = useState("Raveena");
  const [email] = useState("raveenasamyal@gmail.com");
  const [phone, setPhone] = useState("9876543210");
  const [department, setDepartment] = useState("Administration");

  const [editModal, setEditModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);

  const [newPassword, setNewPassword] = useState("");

  const logout = () => {
    Alert.alert("Logout", "Logged out successfully");
  };

  const saveProfile = () => {
    setEditModal(false);
  };

  const changePassword = () => {
    setPasswordModal(false);
    setNewPassword("");
    Alert.alert("Success", "Password changed");
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView>

        {/* HEADER */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.back}>←</Text>
          </TouchableOpacity>
          <Text style={s.title}>Profile</Text>
        </View>

        {/* BASIC INFO */}
        <View style={s.card}>
          <Text style={s.name}>{name}</Text>
          <Text>{email}</Text>
          <Text>Role: Admin</Text>
          <Text>ID: EMP-1023</Text>
        </View>

        {/* CONTACT */}
        <View style={s.card}>
          <Text style={s.section}>Contact</Text>
          <Text>Phone: {phone}</Text>
          <Text>Department: {department}</Text>
        </View>

        {/* PERMISSIONS */}
        <View style={s.card}>
          <Text style={s.section}>Permissions</Text>
          <Text>✔ Manage Doctors</Text>
          <Text>✔ Manage Billing</Text>
          <Text>✔ View Patients</Text>
        </View>

        {/* STATUS */}
        <View style={s.card}>
          <Text style={s.section}>Status</Text>
          <View style={s.row}>
            <Text>{isActive ? "Active" : "Offline"}</Text>
            <Switch value={isActive} onValueChange={setIsActive} />
          </View>
        </View>

        {/* ACTIVITY */}
        <View style={s.card}>
          <Text style={s.section}>Activity</Text>
          <Text>Last Login: Today 10:30 AM</Text>
          <Text>Last Action: Updated billing</Text>
        </View>

        {/* LOGIN HISTORY */}
        <View style={s.card}>
          <Text style={s.section}>Login History</Text>
          <Text>Today - 10:30 AM</Text>
          <Text>Yesterday - 6:00 PM</Text>
        </View>

        {/* DEVICE */}
        <View style={s.card}>
          <Text style={s.section}>Device</Text>
          <Text>Android Device</Text>
        </View>

        {/* ACTIONS */}
        <View style={s.card}>
          <TouchableOpacity onPress={() => setEditModal(true)}>
            <Text style={s.link}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setPasswordModal(true)}>
            <Text style={s.link}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={logout}>
            <Text style={[s.link, { color: "red" }]}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* EDIT MODAL */}
        <Modal visible={editModal} transparent animationType="slide">
          <View style={s.modalBg}>
            <View style={s.modalBox}>

              <TouchableOpacity style={s.close} onPress={() => setEditModal(false)}>
                <Text>✕</Text>
              </TouchableOpacity>

              <Text style={s.modalTitle}>Edit Profile</Text>

              <TextInput value={name} onChangeText={setName} style={s.input}/>
              <TextInput value={phone} onChangeText={setPhone} style={s.input}/>
              <TextInput value={department} onChangeText={setDepartment} style={s.input}/>

              <TouchableOpacity style={s.saveBtn} onPress={saveProfile}>
                <Text style={{ color: "#fff" }}>Save</Text>
              </TouchableOpacity>

            </View>
          </View>
        </Modal>

        {/* PASSWORD MODAL */}
        <Modal visible={passwordModal} transparent animationType="slide">
          <View style={s.modalBg}>
            <View style={s.modalBox}>

              <TouchableOpacity style={s.close} onPress={() => setPasswordModal(false)}>
                <Text>✕</Text>
              </TouchableOpacity>

              <Text style={s.modalTitle}>Change Password</Text>

              <TextInput
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                style={s.input}
              />

              <TouchableOpacity style={s.saveBtn} onPress={changePassword}>
                <Text style={{ color: "#fff" }}>Update</Text>
              </TouchableOpacity>

            </View>
          </View>
        </Modal>

      </ScrollView>
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
  },

  back: { fontSize: 22, marginRight: 10 },
  title: { fontSize: 20, fontWeight: "700" },

  card: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },

  name: { fontSize: 18, fontWeight: "700" },

  section: { fontWeight: "700", marginBottom: 5 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },

  link: { marginTop: 10, color: "#2563EB" },

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