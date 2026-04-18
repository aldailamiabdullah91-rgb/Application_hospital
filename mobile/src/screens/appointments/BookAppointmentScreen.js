import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { appointmentService, userService, patientService } from '../../services/api';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const APPOINTMENT_TYPES = [
  { key: 'consultation', label: 'Consultation', icon: 'chatbubbles-outline' },
  { key: 'follow_up', label: 'Follow-up', icon: 'repeat-outline' },
  { key: 'emergency', label: 'Emergency', icon: 'alert-circle-outline' },
];

const BookAppointmentScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [form, setForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    type: 'consultation',
    reason: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [doctorsRes, patientsRes] = await Promise.all([
        userService.getDoctors(),
        patientService.getAll({ limit: 100 }),
      ]);
      setDoctors(doctorsRes.data.data);
      setPatients(patientsRes.data.data);
    } catch (error) {
      console.error('Fetch data error:', error);
    }
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const newErrors = {};
    if (!selectedPatient) newErrors.patient = 'Patient is required';
    if (!selectedDoctor) newErrors.doctor = 'Doctor is required';
    if (!form.date) newErrors.date = 'Date is required (YYYY-MM-DD)';
    if (!form.startTime) newErrors.startTime = 'Start time is required (HH:MM)';
    if (!form.endTime) newErrors.endTime = 'End time is required (HH:MM)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await appointmentService.create({
        patientId: selectedPatient.id,
        doctorId: selectedDoctor.id,
        date: new Date(form.date).toISOString(),
        startTime: form.startTime,
        endTime: form.endTime,
        type: form.type,
        reason: form.reason || undefined,
        notes: form.notes || undefined,
      });
      Alert.alert('Success', 'Appointment booked successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to book appointment';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Book Appointment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Patient</Text>
        {errors.patient && <Text style={[styles.error, { color: colors.danger }]}>{errors.patient}</Text>}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
          {patients.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.selectorCard,
                {
                  borderColor: selectedPatient?.id === p.id ? colors.primary : colors.border,
                  backgroundColor: selectedPatient?.id === p.id ? colors.primary + '10' : colors.card,
                },
              ]}
              onPress={() => setSelectedPatient(p)}
            >
              <Text style={[styles.selectorName, { color: colors.text }]}>
                {p.firstName} {p.lastName}
              </Text>
              <Text style={[styles.selectorSub, { color: colors.textLight }]}>{p.fileNumber}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Doctor</Text>
        {errors.doctor && <Text style={[styles.error, { color: colors.danger }]}>{errors.doctor}</Text>}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
          {doctors.map((d) => (
            <TouchableOpacity
              key={d.id}
              style={[
                styles.selectorCard,
                {
                  borderColor: selectedDoctor?.id === d.id ? colors.primary : colors.border,
                  backgroundColor: selectedDoctor?.id === d.id ? colors.primary + '10' : colors.card,
                },
              ]}
              onPress={() => setSelectedDoctor(d)}
            >
              <Text style={[styles.selectorName, { color: colors.text }]}>{d.name}</Text>
              <Text style={[styles.selectorSub, { color: colors.primary }]}>{d.specialty}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appointment Type</Text>
        <View style={styles.typeRow}>
          {APPOINTMENT_TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.typeBtn,
                {
                  borderColor: form.type === t.key ? colors.primary : colors.border,
                  backgroundColor: form.type === t.key ? colors.primary + '15' : colors.inputBg,
                },
              ]}
              onPress={() => updateField('type', t.key)}
            >
              <Ionicons
                name={t.icon}
                size={20}
                color={form.type === t.key ? colors.primary : colors.textLight}
              />
              <Text
                style={[
                  styles.typeText,
                  { color: form.type === t.key ? colors.primary : colors.textSecondary },
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Date & Time</Text>
        <CustomInput
          label="Date * (YYYY-MM-DD)"
          value={form.date}
          onChangeText={(v) => updateField('date', v)}
          placeholder="2025-01-15"
          icon="calendar-outline"
          error={errors.date}
        />
        <View style={styles.timeRow}>
          <View style={{ flex: 1 }}>
            <CustomInput
              label="Start Time * (HH:MM)"
              value={form.startTime}
              onChangeText={(v) => updateField('startTime', v)}
              placeholder="09:00"
              icon="time-outline"
              error={errors.startTime}
            />
          </View>
          <View style={{ flex: 1 }}>
            <CustomInput
              label="End Time * (HH:MM)"
              value={form.endTime}
              onChangeText={(v) => updateField('endTime', v)}
              placeholder="09:30"
              icon="time-outline"
              error={errors.endTime}
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Additional Info</Text>
        <CustomInput
          label="Reason for Visit"
          value={form.reason}
          onChangeText={(v) => updateField('reason', v)}
          placeholder="Describe the reason for this appointment"
          icon="document-text-outline"
          multiline
        />
        <CustomInput
          label="Notes"
          value={form.notes}
          onChangeText={(v) => updateField('notes', v)}
          placeholder="Additional notes..."
          icon="create-outline"
          multiline
        />

        <CustomButton
          title="Book Appointment"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, marginTop: 12 },
  error: { fontSize: 12, marginBottom: 6 },
  selectorScroll: { marginBottom: 8 },
  selectorCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginRight: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  selectorName: { fontSize: 14, fontWeight: '600' },
  selectorSub: { fontSize: 11, marginTop: 2 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  typeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  typeText: { fontSize: 12, fontWeight: '600' },
  timeRow: { flexDirection: 'row', gap: 12 },
  submitBtn: { marginTop: 24 },
});

export default BookAppointmentScreen;
