import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { dashboardService } from '../../services/api';
import StatCard from '../../components/StatCard';
import AppointmentCard from '../../components/AppointmentCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const [stats, setStats] = useState({});
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await dashboardService.getStats();
      setStats(res.data.data.stats);
      setRecentAppointments(res.data.data.recentAppointments);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getRoleLabel = () => {
    const labels = {
      admin: 'Administrator',
      doctor: 'Doctor',
      nurse: 'Nurse',
      receptionist: 'Receptionist',
      patient: 'Patient',
    };
    return labels[user?.role] || 'User';
  };

  const getRoleIcon = () => {
    const icons = {
      admin: 'shield-checkmark',
      doctor: 'medical',
      nurse: 'heart',
      receptionist: 'desktop',
      patient: 'person',
    };
    return icons[user?.role] || 'person';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      <View style={[styles.headerCard, { backgroundColor: colors.primary }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name}</Text>
            <View style={styles.roleBadge}>
              <Ionicons name={getRoleIcon()} size={12} color="#FFFFFF" />
              <Text style={styles.roleText}>{getRoleLabel()}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              style={styles.iconBtn}
            >
              <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
        <View style={styles.statsRow}>
          {stats.todayAppointments !== undefined && (
            <StatCard
              title="Today's Appts"
              value={stats.todayAppointments}
              icon="calendar"
              color={colors.primary}
            />
          )}
          {stats.totalPatients !== undefined && (
            <StatCard
              title="Total Patients"
              value={stats.totalPatients}
              icon="people"
              color={colors.secondary}
            />
          )}
        </View>
        <View style={styles.statsRow}>
          {stats.totalDoctors !== undefined && (
            <StatCard
              title="Active Doctors"
              value={stats.totalDoctors}
              icon="medical"
              color={colors.accent}
            />
          )}
          {stats.pendingAppointments !== undefined && (
            <StatCard
              title="Pending"
              value={stats.pendingAppointments}
              icon="time"
              color={colors.warning}
            />
          )}
          {stats.totalAppointments !== undefined && (
            <StatCard
              title="Total Appts"
              value={stats.totalAppointments}
              icon="calendar"
              color={colors.info}
            />
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Appointments</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AppointmentsTab')}>
            <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentAppointments.length > 0 ? (
          recentAppointments.map((apt) => (
            <AppointmentCard key={apt.id} appointment={apt} onPress={() => {}} />
          ))
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="calendar-outline" size={40} color={colors.textLight} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No recent appointments
            </Text>
          </View>
        )}
      </View>

      <View style={styles.quickActions}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {['admin', 'receptionist', 'doctor'].includes(user?.role) && (
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => navigation.navigate('PatientsTab')}
            >
              <Ionicons name="person-add" size={24} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.text }]}>Add Patient</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('AppointmentsTab')}
          >
            <Ionicons name="calendar" size={24} color={colors.secondary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Book Appointment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('ProfileTab')}
          >
            <Ionicons name="settings" size={24} color={colors.accent} />
            <Text style={[styles.actionText, { color: colors.text }]}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerCard: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  userName: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginTop: 2 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    gap: 4,
    alignSelf: 'flex-start',
  },
  roleText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsSection: { paddingHorizontal: 16, marginTop: -8 },
  statsRow: { flexDirection: 'row', marginBottom: 8 },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  viewAll: { fontSize: 14, fontWeight: '600' },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyText: { marginTop: 8, fontSize: 14 },
  quickActions: { paddingHorizontal: 16, marginTop: 16 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  actionText: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
});

export default DashboardScreen;
