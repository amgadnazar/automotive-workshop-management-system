import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  I18nManager,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ADMIN_COLORS } from '../constants/adminTheme';
import i18n from '../src/localization/i18n';

import { useEffect, useState } from 'react';

import { auth } from '../src/config/firebase';
import { apiRequest } from '../src/api/api';

export default function ProfileScreen({ navigation }) {
  const isRTL = i18n.locale.startsWith('ar');

  const [user, setUser] = useState(null);
  const [workshopData, setWorkshopData] = useState(null); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = auth.currentUser;
        const token = await currentUser.getIdToken();

        const userData = await apiRequest(
          "/users/me",
          "GET",
          null,
          token
        );

        const workshop = await apiRequest(
          "/workshop",
          "GET",
          null,
          token
        );

        setUser(userData);
        setWorkshopData(workshop);

      } catch (e) {
        console.log("Profile error:", e.message);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      i18n.t('profile.logoutTitle'),
      i18n.t('profile.logoutMessage'),
      [
        { text: i18n.t('profile.cancel'), style: 'cancel' },
        {
          text: i18n.t('profile.logout'),
          style: 'destructive',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'AdminLogin' }],
            });
          },
        },
      ]
    );
  };

  const toggleLanguage = () => {
    const newLocale = isRTL ? 'en' : 'ar';
    i18n.locale = newLocale;
    I18nManager.forceRTL(newLocale === 'ar');
    navigation.reset({ index: 0, routes: [{ name: 'Profile' }] });
  };

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[ADMIN_COLORS.primary, ADMIN_COLORS.secondary]}
          style={styles.header}
        >
          <View style={styles.avatarWrapper}>
            <Ionicons name="person" size={60} color={ADMIN_COLORS.white} />
          </View>

          <Text style={[styles.name, { textAlign: isRTL ? 'right' : 'left' }]}>
            {user?.name || "Admin User"}
          </Text>

          <Text style={[styles.role, { textAlign: isRTL ? 'right' : 'left' }]}>
            {i18n.t('profile.role')}
          </Text>

          <TouchableOpacity style={styles.langBtn} onPress={toggleLanguage}>
            <Text style={styles.langText}>
              {isRTL ? 'English' : 'العربية'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.infoCard}>
          {/* EMAIL stays from user */}
          <InfoRow
            icon="mail"
            label={i18n.t('profile.email')}
            value={user?.email || '...'}
            isRTL={isRTL}
          />

          {/* PHONE from workshop */}
          <InfoRow
            icon="call"
            label={i18n.t('profile.phone')}
            value={workshopData?.phone || '...'}
            isRTL={isRTL}
          />

          {/* WORKSHOP NAME from workshop */}
          <InfoRow
            icon="location"
            label={i18n.t('profile.workshop')}
            value={workshopData?.location || '...'}
            isRTL={isRTL}
          />

          {/*  WORKING HOURS */}
          <InfoRow
            icon="time"
            label={i18n.t('profile.workingHours') || 'Working Hours'}
            value={workshopData?.workingHours || '...'}
            isRTL={isRTL}
          />

          <InfoRow
            icon="people"
            label={i18n.t('profile.Users')}
            value={i18n.t('profile.Managesystemusers')}
            isRTL={isRTL}
            onPress={() => navigation.navigate('UsersScreen')}
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="create" size={20} color="#000" />
            <Text style={styles.actionText}>
              {i18n.t('profile.editProfile')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#000000" />
            <Text style={styles.actionText}>
              {i18n.t('profile.logout')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value, isRTL, onPress }) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.infoRow,
        { flexDirection: isRTL ? 'row-reverse' : 'row' },
      ]}
    >
      <Ionicons name={icon} size={20} color={ADMIN_COLORS.primary} />

      <View
        style={{
          marginLeft: isRTL ? 0 : 12,
          marginRight: isRTL ? 12 : 0,
          flex: 1,
        }}
      >
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>

      {onPress && (
        <Ionicons
          name={isRTL ? 'chevron-back' : 'chevron-forward'}
          size={18}
          color={ADMIN_COLORS.textLight}
        />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ADMIN_COLORS.background },
  header: {
    paddingTop: 70,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: ADMIN_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: { fontSize: 22, fontWeight: 'bold', color: ADMIN_COLORS.white },
  role: { fontSize: 14, color: ADMIN_COLORS.textLight, marginTop: 4 },

  langBtn: {
    marginTop: 12,
    backgroundColor: ADMIN_COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  langText: { color: ADMIN_COLORS.textDark, fontWeight: '600' },

  infoCard: {
    backgroundColor: ADMIN_COLORS.surface,
    margin: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
  },
  infoRow: { alignItems: 'center', paddingVertical: 12 },
  infoLabel: { fontSize: 13, color: ADMIN_COLORS.textLight },
  infoValue: { fontSize: 15, fontWeight: '600', color: ADMIN_COLORS.textDark, marginTop: 2 },

  actions: { paddingHorizontal: 20, marginTop: 10, gap: 12 },
  actionButton: {
    backgroundColor: ADMIN_COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
  },
  logoutButton: { backgroundColor: '#ef4444' },
  actionText: { color: '#000000', marginLeft: 8, fontSize: 16, fontWeight: '600' },
});