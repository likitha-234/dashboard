import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import DashboardScreen from '../screens/DashboardScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PatientsScreen from '../screens/PatientsScreen';
import DoctorsScreen from '../screens/DoctorsScreen';
import BillingScreen from '../screens/BillingScreen';
import PharmacyScreen from '../screens/PharmacyScreen';
import CalendarScreen from '../screens/CalendarScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabScreens() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#F3F4F6',
          height: 64,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text> }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>📅</Text> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text> }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs"        component={TabScreens} />
      <Stack.Screen name="Patients"    component={PatientsScreen} />
      <Stack.Screen name="Doctors"     component={DoctorsScreen} />
      <Stack.Screen name="Billing"     component={BillingScreen} />
      <Stack.Screen name="Pharmacy"    component={PharmacyScreen} />
      <Stack.Screen name="Calendar"    component={CalendarScreen} />
      <Stack.Screen name="Settings"    component={SettingsScreen} />
    </Stack.Navigator>
  );
}

/**
 * ─── UPDATE YOUR mockData.ts ───────────────────────────────────────────────
 * Make sure your menuItems array in data/mockData.ts includes Calendar:
 *
 * export const menuItems = [
 *   { id: '1', label: 'Dashboard', icon: '🏠' },
 *   { id: '2', label: 'Appointments', icon: '📅' },
 *   { id: '3', label: 'Patients', icon: '👥' },
 *   { id: '4', label: 'Doctors', icon: '👨‍⚕️' },
 *   { id: '5', label: 'Reports', icon: '📊' },
 *   { id: '6', label: 'Calendar', icon: '🗓️' },   // ← ADD THIS
 *   { id: '7', label: 'Billing', icon: '💳' },
 *   { id: '8', label: 'Pharmacy', icon: '💊' },
 *   { id: '9', label: 'Settings', icon: '⚙️' },
 * ];
 */
