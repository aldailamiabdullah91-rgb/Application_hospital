import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const PatientCard = ({ patient, onPress }) => {
  const { colors } = useTheme();

  const getInitials = () => {
    return `${patient.firstName[0]}${patient.lastName[0]}`.toUpperCase();
  };

  const age = Math.floor(
    (new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)
  );

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
        <Text style={[styles.initials, { color: colors.primary }]}>{getInitials()}</Text>
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>
          {patient.firstName} {patient.lastName}
        </Text>
        <View style={styles.row}>
          <Text style={[styles.fileNumber, { color: colors.primary }]}>{patient.fileNumber}</Text>
          <Text style={[styles.separator, { color: colors.textLight }]}>|</Text>
          <Text style={[styles.detail, { color: colors.textSecondary }]}>
            {patient.gender === 'male' ? 'M' : 'F'}, {age}y
          </Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="call-outline" size={12} color={colors.textLight} />
          <Text style={[styles.phone, { color: colors.textSecondary }]}>{patient.phone}</Text>
        </View>
        {patient.bloodType && (
          <View style={[styles.bloodBadge, { backgroundColor: colors.danger + '15' }]}>
            <Text style={[styles.bloodText, { color: colors.danger }]}>{patient.bloodType}</Text>
          </View>
        )}
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  initials: {
    fontSize: 18,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  fileNumber: {
    fontSize: 12,
    fontWeight: '600',
  },
  separator: {
    fontSize: 10,
  },
  detail: {
    fontSize: 12,
  },
  phone: {
    fontSize: 12,
  },
  bloodBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  bloodText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export default PatientCard;
