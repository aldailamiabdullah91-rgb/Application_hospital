import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const statusConfig = {
  scheduled: { label: 'Scheduled', icon: 'time-outline' },
  confirmed: { label: 'Confirmed', icon: 'checkmark-circle-outline' },
  in_progress: { label: 'In Progress', icon: 'pulse-outline' },
  completed: { label: 'Completed', icon: 'checkmark-done-outline' },
  cancelled: { label: 'Cancelled', icon: 'close-circle-outline' },
  no_show: { label: 'No Show', icon: 'alert-circle-outline' },
};

const AppointmentCard = ({ appointment, onPress }) => {
  const { colors } = useTheme();
  const status = statusConfig[appointment.status] || statusConfig.scheduled;

  const getStatusColor = () => {
    const map = {
      scheduled: colors.statusScheduled,
      confirmed: colors.statusConfirmed,
      in_progress: colors.statusInProgress,
      completed: colors.statusCompleted,
      cancelled: colors.statusCancelled,
      no_show: colors.danger,
    };
    return map[appointment.status] || colors.textLight;
  };

  const statusColor = getStatusColor();
  const dateStr = new Date(appointment.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.statusBar, { backgroundColor: statusColor }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={14} color={colors.primary} />
            <Text style={[styles.time, { color: colors.primary }]}>
              {appointment.startTime} - {appointment.endTime}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Ionicons name={status.icon} size={12} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>{status.label}</Text>
          </View>
        </View>

        <Text style={[styles.date, { color: colors.textSecondary }]}>{dateStr}</Text>

        {appointment.patient && (
          <View style={styles.row}>
            <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.info, { color: colors.text }]}>
              {appointment.patient.firstName} {appointment.patient.lastName}
            </Text>
            <Text style={[styles.fileNumber, { color: colors.textLight }]}>
              {appointment.patient.fileNumber}
            </Text>
          </View>
        )}

        {appointment.doctor && (
          <View style={styles.row}>
            <Ionicons name="medical-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.info, { color: colors.text }]}>{appointment.doctor.name}</Text>
            {appointment.doctor.specialty && (
              <Text style={[styles.specialty, { color: colors.textLight }]}>
                {appointment.doctor.specialty}
              </Text>
            )}
          </View>
        )}

        {appointment.reason && (
          <Text style={[styles.reason, { color: colors.textSecondary }]} numberOfLines={1}>
            {appointment.reason}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  statusBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  info: {
    fontSize: 13,
    fontWeight: '500',
  },
  fileNumber: {
    fontSize: 11,
    marginLeft: 'auto',
  },
  specialty: {
    fontSize: 11,
    marginLeft: 4,
  },
  reason: {
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
  },
});

export default AppointmentCard;
