import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function PatientsScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>← Back</Text></TouchableOpacity>
        <Text style={s.title}>Patients</Text>
      </View>
      <View style={s.body}><Text style={s.soon}>Coming soon 🏥</Text></View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe:   { flex:1, backgroundColor:'#F1F5F9' },
  header: { flexDirection:'row', alignItems:'center', gap:12, padding:16, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor:'#E5E7EB' },
  back:   { fontSize:14, color:'#2563EB', fontWeight:'600' },
  title:  { fontSize:18, fontWeight:'700', color:'#111827' },
  body:   { flex:1, alignItems:'center', justifyContent:'center' },
  soon:   { fontSize:18, color:'#6B7280' },
});