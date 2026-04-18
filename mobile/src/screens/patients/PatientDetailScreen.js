import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const InfoRow = ({ label, value, icon, colors }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLabel}>
      {icon && <Ionicons name={icon} size={16} color={colors.textLight} />}
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    </View>
    <Text style={[styles.value, { color: colors.text }]}>{value || '-'}</Text>
  </View>
);

const SectionHeader = ({ title, colors }) => (
  <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
);

const PatientDetailScreen = ({ route, navigation }) => {
  const { patientId } = route.params;
  const { colors } = useTheme();
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchPatient();
  }, [patientId]);

  const fetchPatient = async () => {
    try {
      const res = await patientService.getById(patientId);
      setPatient(res.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load patient details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!patient) return null;

  const age = Math.floor(
    (new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)
  );

  const tabs = [
    { key: 'info', label: 'Info', icon: 'information-circle-outline' },
    { key: 'medical', label: 'Medical', icon: 'medkit-outline' },
    { key: 'vitals', label: 'Vitals', icon: 'pulse-outline' },
    { key: 'appointments', label: 'Appts', icon: 'calendar-outline' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Text style={styles.initials}>
              {patient.firstName[0]}{patient.lastName[0]}
            </Text>
          </View>
          <Text style={styles.patientName}>{patient.firstName} {patient.lastName}</Text>
          <Text style={styles.fileNum}>{patient.fileNumber}</Text>
          <View style={styles.headerBadges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{patient.gender === 'male' ? 'Male' : 'Female'}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{age} years</Text>
            </View>
            {patient.bloodType && (
              <View style={[styles.badge, { backgroundColor: 'rgba(239,68,68,0.3)' }]}>
                <Text style={styles.badgeText}>{patient.bloodType}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={18}
              color={activeTab === tab.key ? colors.primary : colors.textLight}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab.key ? colors.primary : colors.textLight },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'info' && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SectionHeader title="Personal Information" colors={colors} />
            <InfoRow label="Phone" value={patient.phone} icon="call-outline" colors={colors} />
            <InfoRow label="Email" value={patient.email} icon="mail-outline" colors={colors} />
            <InfoRow label="National ID" value={patient.nationalId} icon="card-outline" colors={colors} />
            <InfoRow label="Address" value={patient.address} icon="location-outline" colors={colors} />
            <InfoRow
              label="Date of Birth"
              value={new Date(patient.dateOfBirth).toLocaleDateString()}
              icon="calendar-outline"
              colors={colors}
            />

            <SectionHeader title="Emergency Contact" colors={colors} />
            <InfoRow label="Contact" value={patient.emergencyContact} icon="person-outline" colors={colors} />
            <InfoRow label="Phone" value={patient.emergencyPhone} icon="call-outline" colors={colors} />

            <SectionHeader title="Medical Info" colors={colors} />
            <InfoRow label="Allergies" value={patient.allergies} icon="alert-circle-outline" colors={colors} />
            <InfoRow label="Chronic Diseases" value={patient.chronicDiseases} icon="fitness-outline" colors={colors} />
            {patient.notes && (
              <InfoRow label="Notes" value={patient.notes} icon="document-text-outline" colors={colors} />
            )}
          </View>
        )}

        {activeTab === 'medical' && (
          <View>
            {patient.medicalRecords?.length > 0 ? (
              patient.medicalRecords.map((record) => (
                <View
                  key={record.id}
                  style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.recordHeader}>
                    <Text style={[styles.diagnosis, { color: colors.text }]}>{record.diagnosis}</Text>
                    <Text style={[styles.recordDate, { color: colors.textLight }]}>
                      {new Date(record.visitDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={[styles.doctorLabel, { color: colors.primary }]}>{record.doctorName}</Text>
                  {record.symptoms && (
                    <InfoRow label="Symptoms" value={record.symptoms} colors={colors} />
                  )}
                  {record.treatment && (
                    <InfoRow label="Treatment" value={record.treatment} colors={colors} />
                  )}
                  {record.medications && (
                    <InfoRow label="Medications" value={record.medications} colors={colors} />
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="medkit-outline" size={40} color={colors.textLight} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No medical records</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'vitals' && (
          <View>
            {patient.vitalSigns?.length > 0 ? (
              patient.vitalSigns.map((vs) => (
                <View
                  key={vs.id}
                  style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <Text style={[styles.vitalDate, { color: colors.textSecondary }]}>
                    {new Date(vs.recordedAt).toLocaleString()} - {vs.recordedBy}
                  </Text>
                  <View style={styles.vitalsGrid}>
                    {vs.temperature && (
                      <View style={styles.vitalItem}>
                        <Ionicons name="thermometer-outline" size={18} color={colors.danger} />
                        <Text style={[styles.vitalValue, { color: colors.text }]}>{vs.temperature}°C</Text>
                        <Text style={[styles.vitalLabel, { color: colors.textLight }]}>Temp</Text>
                      </View>
                    )}
                    {vs.bloodPressureSys && (
                      <View style={styles.vitalItem}>
                        <Ionicons name="heart-outline" size={18} color={colors.danger} />
                        <Text style={[styles.vitalValue, { color: colors.text }]}>
                          {vs.bloodPressureSys}/{vs.bloodPressureDia}
                        </Text>
                        <Text style={[styles.vitalLabel, { color: colors.textLight }]}>BP</Text>
                      </View>
                    )}
                    {vs.heartRate && (
                      <View style={styles.vitalItem}>
                        <Ionicons name="pulse-outline" size={18} color={colors.primary} />
                        <Text style={[styles.vitalValue, { color: colors.text }]}>{vs.heartRate}</Text>
                        <Text style={[styles.vitalLabel, { color: colors.textLight }]}>HR</Text>
                      </View>
                    )}
                    {vs.oxygenSaturation && (
                      <View style={styles.vitalItem}>
                        <Ionicons name="water-outline" size={18} color={colors.info} />
                        <Text style={[styles.vitalValue, { color: colors.text }]}>{vs.oxygenSaturation}%</Text>
                        <Text style={[styles.vitalLabel, { color: colors.textLight }]}>SpO2</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="pulse-outline" size={40} color={colors.textLight} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No vital signs recorded</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'appointments' && (
          <View>
            {patient.appointments?.length > 0 ? (
              patient.appointments.map((apt) => (
                <View
                  key={apt.id}
                  style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.recordHeader}>
                    <Text style={[styles.diagnosis, { color: colors.text }]}>
                      {new Date(apt.date).toLocaleDateString()} | {apt.startTime}-{apt.endTime}
                    </Text>
                    <View style={[styles.statusPill, { backgroundColor: colors[`status${apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}`] + '20' }]}>
                      <Text style={{ fontSize: 11, color: colors[`status${apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}`], fontWeight: '600' }}>
                        {apt.status}
                      </Text>
                    </View>
                  </View>
                  {apt.doctor && (
                    <Text style={[styles.doctorLabel, { color: colors.primary }]}>
                      {apt.doctor.name} - {apt.doctor.specialty}
                    </Text>
                  )}
                  {apt.reason && <Text style={[styles.reason, { color: colors.textSecondary }]}>{apt.reason}</Text>}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={40} color={colors.textLight} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No appointments</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 44, paddingBottom: 20, paddingHorizontal: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  backBtn: { marginBottom: 12 },
  headerContent: { alignItems: 'center' },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  initials: { color: '#FFF', fontSize: 22, fontWeight: '700' },
  patientName: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  fileNum: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  headerBadges: { flexDirection: 'row', gap: 8, marginTop: 10 },
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: 4 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', gap: 4 },
  tabText: { fontSize: 12, fontWeight: '600' },
  content: { padding: 16 },
  card: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.05)' },
  infoLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontSize: 13 },
  value: { fontSize: 13, fontWeight: '500', maxWidth: '55%', textAlign: 'right' },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  diagnosis: { fontSize: 14, fontWeight: '600', flex: 1 },
  recordDate: { fontSize: 11, marginLeft: 8 },
  doctorLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  reason: { fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  statusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  vitalDate: { fontSize: 12, marginBottom: 10 },
  vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  vitalItem: { alignItems: 'center', minWidth: 70 },
  vitalValue: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  vitalLabel: { fontSize: 10, marginTop: 2 },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { marginTop: 8, fontSize: 14 },
});

export default PatientDetailScreen;
