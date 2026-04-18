import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import CustomButton from '../../components/CustomButton';

const MenuItem = ({ icon, label, value, onPress, colors, danger }) => (
  <TouchableOpacity
    style={[styles.menuItem, { borderColor: colors.border }]}
    onPress={onPress}
    disabled={!onPress}
  >
    <View style={[styles.menuIcon, { backgroundColor: (danger ? colors.danger : colors.primary) + '15' }]}>
      <Ionicons name={icon} size={20} color={danger ? colors.danger : colors.primary} />
    </View>
    <View style={styles.menuContent}>
      <Text style={[styles.menuLabel, { color: danger ? colors.danger : colors.text }]}>{label}</Text>
      {value && <Text style={[styles.menuValue, { color: colors.textSecondary }]}>{value}</Text>}
    </View>
    {onPress && <Ionicons name="chevron-forward" size={18} color={colors.textLight} />}
  </TouchableOpacity>
);

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const getRoleColor = () => {
    const roleColors = {
      admin: '#EF4444',
      doctor: '#3B82F6',
      nurse: '#10B981',
      receptionist: '#F59E0B',
      patient: '#8B5CF6',
    };
    return roleColors[user?.role] || colors.primary;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.profileCard, { backgroundColor: colors.primary }]}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={[styles.rolePill, { backgroundColor: getRoleColor() }]}>
          <Text style={styles.roleText}>
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </Text>
        </View>
        {user?.specialty && (
          <Text style={styles.specialty}>{user?.specialty}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACCOUNT</Text>
        <View style={[styles.menuGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MenuItem
            icon="person-outline"
            label="Full Name"
            value={user?.name}
            colors={colors}
          />
          <MenuItem
            icon="mail-outline"
            label="Email"
            value={user?.email}
            colors={colors}
          />
          {user?.phone && (
            <MenuItem
              icon="call-outline"
              label="Phone"
              value={user?.phone}
              colors={colors}
            />
          )}
          {user?.specialty && (
            <MenuItem
              icon="medical-outline"
              label="Specialty"
              value={user?.specialty}
              colors={colors}
            />
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PREFERENCES</Text>
        <View style={[styles.menuGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.menuItem, { borderColor: colors.border }]}
            onPress={toggleTheme}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuLabel, { color: colors.text }]}>Dark Mode</Text>
              <Text style={[styles.menuValue, { color: colors.textSecondary }]}>
                {isDark ? 'On' : 'Off'}
              </Text>
            </View>
            <View style={[styles.toggle, { backgroundColor: isDark ? colors.primary : colors.border }]}>
              <View
                style={[
                  styles.toggleDot,
                  { transform: [{ translateX: isDark ? 16 : 0 }] },
                ]}
              />
            </View>
          </TouchableOpacity>
          <MenuItem
            icon="notifications-outline"
            label="Notifications"
            onPress={() => navigation.navigate('Notifications')}
            colors={colors}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ABOUT</Text>
        <View style={[styles.menuGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MenuItem
            icon="information-circle-outline"
            label="Version"
            value="1.0.0"
            colors={colors}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            colors={colors}
          />
        </View>
      </View>

      <View style={styles.logoutSection}>
        <CustomButton
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          icon={<Ionicons name="log-out-outline" size={20} color="#FFFFFF" />}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textLight }]}>
          Medix Pro v1.0.0
        </Text>
        <Text style={[styles.footerText, { color: colors.textLight }]}>
          Hospital Management System
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileCard: {
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#FFFFFF', fontSize: 28, fontWeight: '700' },
  userName: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
  userEmail: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  rolePill: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  roleText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  specialty: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 6 },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  menuGroup: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 0.5,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '600' },
  menuValue: { fontSize: 12, marginTop: 2 },
  toggle: { width: 40, height: 24, borderRadius: 12, padding: 2 },
  toggleDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF' },
  logoutSection: { paddingHorizontal: 16, marginTop: 32 },
  footer: { alignItems: 'center', paddingVertical: 24 },
  footerText: { fontSize: 12 },
});

export default ProfileScreen;
