import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

export default function SettingsScreen() {
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState(true);
  const [appointments, setAppointments] = useState(true);
  const [billing, setBilling] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [backup, setBackup] = useState(false);
  const [language, setLanguage] = useState("English");

  const resetData = () => {
    Alert.alert("Reset Data", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Yes",
        onPress: () => {
          setNotifications(false);
          setAppointments(false);
          setBilling(false);
          setBackup(false);
          Alert.alert("All data reset");
        },
      },
    ]);
  };

  const logout = () => {
    Alert.alert("Logout", "Logged out successfully");
  };

  return (
    <SafeAreaView style={[s.safe, darkMode && { backgroundColor: "#111" }]}>
      <ScrollView>

        {/* HEADER */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.back}>←</Text>
          </TouchableOpacity>
          <Text style={s.title}>Settings</Text>
        </View>

        {/* PROFILE */}
        <View style={s.card}>
          <Text style={s.section}>Profile</Text>
          <Text>Name: Raveena</Text>
          <Text>Email: raveenasambyal@gmail.com</Text>
          <Text>Role: Admin</Text>
        </View>

        {/* NOTIFICATIONS */}
        <View style={s.card}>
          <Text style={s.section}>Notifications</Text>

          <View style={s.row}>
            <Text>App Notifications</Text>
            <Switch value={notifications} onValueChange={setNotifications} />
          </View>

          <View style={s.row}>
            <Text>Appointment Alerts</Text>
            <Switch value={appointments} onValueChange={setAppointments} />
          </View>

          <View style={s.row}>
            <Text>Billing Alerts</Text>
            <Switch value={billing} onValueChange={setBilling} />
          </View>
        </View>

        {/* APPEARANCE */}
        <View style={s.card}>
          <Text style={s.section}>Appearance</Text>

          <View style={s.row}>
            <Text>Dark Mode</Text>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>
        </View>

        {/* LANGUAGE */}
        <View style={s.card}>
          <Text style={s.section}>Language</Text>

          {["English", "Hindi", "Kannada"].map((lang) => (
            <TouchableOpacity key={lang} onPress={() => setLanguage(lang)}>
              <Text style={{ padding: 5 }}>
                {language === lang ? "✅ " : ""}{lang}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* BACKUP */}
        <View style={s.card}>
          <Text style={s.section}>Backup</Text>

          <View style={s.row}>
            <Text>Auto Backup</Text>
            <Switch value={backup} onValueChange={setBackup} />
          </View>
        </View>

        {/* RESET */}
        <View style={s.card}>
          <Text style={s.section}>Danger Zone</Text>

          <TouchableOpacity onPress={resetData}>
            <Text style={{ color: "red", marginTop: 5 }}>Reset All Data</Text>
          </TouchableOpacity>
        </View>

        {/* LOGOUT */}
        <View style={s.card}>
          <TouchableOpacity onPress={logout}>
            <Text style={{ color: "red" }}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* ABOUT */}
        <View style={s.card}>
          <Text style={s.section}>About</Text>
          <Text>Hospital Admin App</Text>
          <Text>Version 1.0.0</Text>
        </View>

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
    padding: 15,
    margin: 10,
    borderRadius: 10,
  },

  section: {
    fontWeight: "700",
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
});