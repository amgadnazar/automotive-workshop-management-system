import React, { useState, useEffect } from 'react';

import { ActivityIndicator } from 'react-native';

import { apiRequest } from '../src/api/api';
import { getAuth } from 'firebase/auth';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  I18nManager,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import i18n from '../src/localization/i18n';

export default function ProfileScreen({ navigation }) {
  useEffect(() => {
  fetchProfile();
}, []);
  const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

const fetchProfile = async () => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.log("❌ No Firebase user");
      return;
    }

    const token = await currentUser.getIdToken();

    if (!token) {
      console.log("❌ Token is null");
      return;
    }

    console.log("✅ TOKEN SENT:", token);

    const data = await apiRequest(
      "/users/me",
      "GET",
      null,
      token
    );

    setUser(data);

  } catch (error) {
    console.log("Profile error:", error.message);
  } finally {
    setLoading(false);
  }
};


  const [lang, setLang] = useState(i18n.locale);

  const switchLanguage = async () => {
    const newLang = lang === 'en' ? 'ar' : 'en';
    i18n.locale = newLang;
    setLang(newLang);
    await AsyncStorage.setItem('APP_LANGUAGE', newLang);

    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' }],
    });
  };

  const handleLogout = () => {
    Alert.alert(
      i18n.t('profile.logout'),
      i18n.t('profile.logoutConfirm'),
      [
        { text: i18n.t('profile.cancel'), style: 'cancel' },
        {
          text: i18n.t('profile.logout'),
          style: 'destructive',
          onPress: () => navigation.replace('Login'),
        },
      ]
    );
  };
if (loading) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}
  return (
    <ScrollView style={styles.container}>

      {/* Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <Text style={styles.title}>{i18n.t('profile.title')}</Text>
      </LinearGradient>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
          style={styles.profileImage}
        />
<Text style={styles.name}>
  {user?.name || "No Name"}
</Text>
<Text style={styles.email}>
  {user?.email || "No Email"}
</Text>
      </View>

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('MyVehicle')}>
          <Ionicons name="car-outline" size={22} color={COLORS.primary} />
          <Text style={styles.actionText}>{i18n.t('profile.myVehicle')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ServiceHistory')}>
          <Ionicons name="time-outline" size={22} color={COLORS.primary} />
          <Text style={styles.actionText}>{i18n.t('profile.serviceHistory')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('EditProfile')}>
          <Ionicons name="create-outline" size={22} color={COLORS.primary} />
          <Text style={styles.actionText}>{i18n.t('profile.editProfile')}</Text>
        </TouchableOpacity>

        {/* Language Switch */}
        <TouchableOpacity style={styles.actionButton} onPress={switchLanguage}>
          <Ionicons name="language-outline" size={22} color={COLORS.primary} />
          <Text style={styles.actionText}>
            {lang === 'en' ? 'العربية' : 'English'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#fff" />
        <Text style={styles.logoutText}>{i18n.t('profile.logout')}</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.white },
  profileCard: {
    backgroundColor: COLORS.white,
    margin: 20,
    borderRadius: 16,
    alignItems: 'center',
    padding: 20,
  },
  profileImage: { width: 90, height: 90, borderRadius: 45, marginBottom: 10 },
  name: { fontSize: 20, fontWeight: 'bold' },
  email: { fontSize: 14, color: COLORS.textLight },
  actionsSection: {
    backgroundColor: COLORS.white,
    margin: 20,
    borderRadius: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionText: { marginStart: 12, fontSize: 16 },
  logoutButton: {
    backgroundColor: '#FF3B30',
    margin: 20,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutText: { color: '#fff', marginStart: 8, fontWeight: '600' },
});
