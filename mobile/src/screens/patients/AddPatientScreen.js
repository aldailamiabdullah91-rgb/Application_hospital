import React, { useState } from 'react';
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
import { patientService } from '../../services/api';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['male', 'female'];

const AddPatientScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    phone: '',
    email: '',
    nationalId: '',
    bloodType: '',
    allergies: '',
    chronicDiseases: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!form.dateOfBirth.trim()) newErrors.dateOfBirth = 'Date of birth is required (YYYY-MM-DD)';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = {
        ...form,
        dateOfBirth: new Date(form.dateOfBirth).toISOString(),
      };
      Object.keys(data).forEach((key) => {
        if (data[key] === '') delete data[key];
      });
      await patientService.create(data);
      Alert.alert('Success', 'Patient created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create patient';
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>New Patient</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>

        <CustomInput
          label="First Name *"
          value={form.firstName}
          onChangeText={(v) => updateField('firstName', v)}
          placeholder="Enter first name"
          icon="person-outline"
          error={errors.firstName}
        />
        <CustomInput
          label="Last Name *"
          value={form.lastName}
          onChangeText={(v) => updateField('lastName', v)}
          placeholder="Enter last name"
          icon="person-outline"
          error={errors.lastName}
        />
        <CustomInput
          label="Date of Birth * (YYYY-MM-DD)"
          value={form.dateOfBirth}
          onChangeText={(v) => updateField('dateOfBirth', v)}
          placeholder="1990-01-15"
          icon="calendar-outline"
          error={errors.dateOfBirth}
        />

        <Text style={[styles.label, { color: colors.text }]}>Gender *</Text>
        <View style={styles.optionsRow}>
          {GENDERS.map((g) => (
            <TouchableOpacity
              key={g}
              style={[
                styles.optionBtn,
                {
                  borderColor: form.gender === g ? colors.primary : colors.border,
                  backgroundColor: form.gender === g ? colors.primary + '15' : colors.inputBg,
                },
              ]}
              onPress={() => updateField('gender', g)}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: form.gender === g ? colors.primary : colors.textSecondary },
                ]}
              >
                {g === 'male' ? 'Male' : 'Female'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <CustomInput
          label="Phone *"
          value={form.phone}
          onChangeText={(v) => updateField('phone', v)}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          icon="call-outline"
          error={errors.phone}
        />
        <CustomInput
          label="Email"
          value={form.email}
          onChangeText={(v) => updateField('email', v)}
          placeholder="Enter email"
          keyboardType="email-address"
          icon="mail-outline"
        />
        <CustomInput
          label="National ID"
          value={form.nationalId}
          onChangeText={(v) => updateField('nationalId', v)}
          placeholder="Enter national ID"
          icon="card-outline"
        />
        <CustomInput
          label="Address"
          value={form.address}
          onChangeText={(v) => updateField('address', v)}
          placeholder="Enter address"
          icon="location-outline"
        />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Medical Information</Text>

        <Text style={[styles.label, { color: colors.text }]}>Blood Type</Text>
        <View style={styles.optionsRow}>
          {BLOOD_TYPES.map((bt) => (
            <TouchableOpacity
              key={bt}
              style={[
                styles.bloodBtn,
                {
                  borderColor: form.bloodType === bt ? colors.danger : colors.border,
                  backgroundColor: form.bloodType === bt ? colors.danger + '15' : colors.inputBg,
                },
              ]}
              onPress={() => updateField('bloodType', form.bloodType === bt ? '' : bt)}
            >
              <Text
                style={[
                  styles.bloodText,
                  { color: form.bloodType === bt ? colors.danger : colors.textSecondary },
                ]}
              >
                {bt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <CustomInput
          label="Allergies"
          value={form.allergies}
          onChangeText={(v) => updateField('allergies', v)}
          placeholder="e.g., Penicillin, Sulfa drugs"
          icon="alert-circle-outline"
          multiline
        />
        <CustomInput
          label="Chronic Diseases"
          value={form.chronicDiseases}
          onChangeText={(v) => updateField('chronicDiseases', v)}
          placeholder="e.g., Diabetes, Hypertension"
          icon="fitness-outline"
          multiline
        />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Emergency Contact</Text>
        <CustomInput
          label="Contact Name"
          value={form.emergencyContact}
          onChangeText={(v) => updateField('emergencyContact', v)}
          placeholder="Emergency contact name"
          icon="person-outline"
        />
        <CustomInput
          label="Contact Phone"
          value={form.emergencyPhone}
          onChangeText={(v) => updateField('emergencyPhone', v)}
          placeholder="Emergency contact phone"
          keyboardType="phone-pad"
          icon="call-outline"
        />

        <CustomInput
          label="Notes"
          value={form.notes}
          onChangeText={(v) => updateField('notes', v)}
          placeholder="Additional notes..."
          icon="document-text-outline"
          multiline
          numberOfLines={3}
        />

        <CustomButton
          title="Create Patient"
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
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  optionText: { fontSize: 14, fontWeight: '600' },
  bloodBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    minWidth: 50,
    alignItems: 'center',
  },
  bloodText: { fontSize: 13, fontWeight: '700' },
  submitBtn: { marginTop: 24 },
});

export default AddPatientScreen;
