import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const { colors } = useTheme();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = 'Name is required';
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Min 6 characters';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        role: 'patient',
      });
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed.';
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
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <Ionicons name="person-add" size={32} color="#FFFFFF" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Register as a patient
          </Text>
        </View>

        <View style={styles.form}>
          <CustomInput
            label="Full Name"
            value={form.name}
            onChangeText={(v) => updateField('name', v)}
            placeholder="Enter your full name"
            icon="person-outline"
            error={errors.name}
          />
          <CustomInput
            label="Email"
            value={form.email}
            onChangeText={(v) => updateField('email', v)}
            placeholder="Enter your email"
            keyboardType="email-address"
            icon="mail-outline"
            error={errors.email}
          />
          <CustomInput
            label="Phone (optional)"
            value={form.phone}
            onChangeText={(v) => updateField('phone', v)}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            icon="call-outline"
          />
          <CustomInput
            label="Password"
            value={form.password}
            onChangeText={(v) => updateField('password', v)}
            placeholder="Create a password"
            secureTextEntry
            icon="lock-closed-outline"
            error={errors.password}
          />
          <CustomInput
            label="Confirm Password"
            value={form.confirmPassword}
            onChangeText={(v) => updateField('confirmPassword', v)}
            placeholder="Confirm your password"
            secureTextEntry
            icon="lock-closed-outline"
            error={errors.confirmPassword}
          />

          <CustomButton title="Register" onPress={handleRegister} loading={loading} style={styles.btn} />
          <CustomButton
            title="Already have an account? Sign In"
            onPress={() => navigation.goBack()}
            variant="ghost"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 32 },
  header: { alignItems: 'center', marginBottom: 32 },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 26, fontWeight: '700' },
  subtitle: { fontSize: 14, marginTop: 4 },
  form: { marginBottom: 20 },
  btn: { marginTop: 8, marginBottom: 12 },
});

export default RegisterScreen;
