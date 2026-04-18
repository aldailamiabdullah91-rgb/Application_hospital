import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { appointmentService } from '../../services/api';
import CustomButton from '../../components/CustomButton';
import LoadingSpinner from '../../components/LoadingSpinner';

const AppointmentDetailScreen = ({ route, navigation }) => {
  const { appointmentId } = route.params;
  const { user } = useAuth();
  const { colors } = useTheme();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointment();
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      const res = await appointmentService.getById(appointmentId);
      setAppointment(res.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load appointment');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel Appointment', 'Are you sure you want to cancel this appointment?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await appointmentService.cancel(appointmentId);
            Alert.alert('Success', 'Appointment cancelled');
            fetchAppointment();
          } catch (error) {
            Alert.alert('Error', 'Failed to cancel appointment');
          }
        },
      },
    ]);
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await appointmentService.update(appointmentId, { status: newStatus });
      fetchAppointment();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!appointment) return null;

  const statusColors = {
    scheduled: colors.statusScheduled,
    confirmed: colors.statusConfirmed,
    in_progress: colors.statusInProgress,
    completed: colors.statusCompleted,
    cancelled: colors.statusCancelled,
    no_show: colors.danger,
  };
  const sColor = statusColors[appointment.status] || colors.textLight;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointment Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.statusCard, { backgroundColor: sColor + '15', borderColor: sColor }]}>
          <Ionicons name="information-circle" size={20} color={sColor} />
          <Text style={[styles.statusLabel, { color: sColor }]}>
            Status: {appointment.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Schedule</Text>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {new Date(appointment.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {appointment.startTime} - {appointment.endTime}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="flag-outline" size={18} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {appointment.type.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {appointment.doctor && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Doctor</Text>
            <View style={styles.personRow}>
              <View style={[styles.personAvatar, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="medical" size={22} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.personName, { color: colors.text }]}>{appointment.doctor.name}</Text>
                <Text style={[styles.personDetail, { color: colors.primary }]}>{appointment.doctor.specialty}</Text>
                {appointment.doctor.email && (
                  <Text style={[styles.personDetail, { color: colors.textSecondary }]}>{appointment.doctor.email}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {appointment.patient && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Patient</Text>
            <View style={styles.personRow}>
              <View style={[styles.personAvatar, { backgroundColor: colors.secondary + '20' }]}>
                <Ionicons name="person" size={22} color={colors.secondary} />
              </View>
              <View>
                <Text style={[styles.personName, { color: colors.text }]}>
                  {appointment.patient.firstName} {appointment.patient.lastName}
                </Text>
                <Text style={[styles.personDetail, { color: colors.primary }]}>{appointment.patient.fileNumber}</Text>
                <Text style={[styles.personDetail, { color: colors.textSecondary }]}>{appointment.patient.phone}</Text>
              </View>
            </View>
          </View>
        )}

        {appointment.reason && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Reason</Text>
            <Text style={[styles.reasonText, { color: colors.textSecondary }]}>{appointment.reason}</Text>
          </View>
        )}

        {appointment.notes && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notes</Text>
            <Text style={[styles.reasonText, { color: colors.textSecondary }]}>{appointment.notes}</Text>
          </View>
        )}

        {['admin', 'doctor', 'receptionist'].includes(user?.role) &&
          !['cancelled', 'completed'].includes(appointment.status) && (
            <View style={styles.actions}>
              {appointment.status === 'scheduled' && (
                <CustomButton
                  title="Confirm"
                  onPress={() => handleStatusUpdate('confirmed')}
                  variant="secondary"
                  icon={<Ionicons name="checkmark-circle" size={18} color="#FFF" />}
                  style={styles.actionBtn}
                />
              )}
              {appointment.status === 'confirmed' && (
                <CustomButton
                  title="Start Visit"
                  onPress={() => handleStatusUpdate('in_progress')}
                  icon={<Ionicons name="play-circle" size={18} color="#FFF" />}
                  style={styles.actionBtn}
                />
              )}
              {appointment.status === 'in_progress' && (
                <CustomButton
                  title="Complete"
                  onPress={() => handleStatusUpdate('completed')}
                  variant="secondary"
                  icon={<Ionicons name="checkmark-done" size={18} color="#FFF" />}
                  style={styles.actionBtn}
                />
              )}
              <CustomButton
                title="Cancel Appointment"
                onPress={handleCancel}
                variant="danger"
                icon={<Ionicons name="close-circle" size={18} color="#FFF" />}
                style={styles.actionBtn}
              />
            </View>
          )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: {},
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusLabel: { fontSize: 14, fontWeight: '700' },
  card: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  infoText: { fontSize: 14 },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  personAvatar: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  personName: { fontSize: 15, fontWeight: '600' },
  personDetail: { fontSize: 13, marginTop: 2 },
  reasonText: { fontSize: 14, lineHeight: 20 },
  actions: { marginTop: 16, gap: 10 },
  actionBtn: {},
});

export default AppointmentDetailScreen;
