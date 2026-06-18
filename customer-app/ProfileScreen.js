import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

import { apiRequest } from '../src/api/api';
import { getAuth } from 'firebase/auth';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleLogout = () => {
    navigation.replace('Login');
  };
const fetchProfile = async () => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.log("No user logged in");
      return;
    }

    const token = await currentUser.getIdToken();

    console.log("TOKEN USED:", token);

    const data = await apiRequest(
      "/users/me",
      "GET",
      null,
      token
    );

    setUser(data);
  } catch (error) {
    console.log("Error loading data:", error.message);
  } finally {
    setLoading(false);
  }
};
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={70} color={COLORS.white} />
        </View>

        <Text style={styles.name}>Amjad Nazar</Text>
        <Text style={styles.email}>amjad@example.com</Text>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>+249 912 345 678</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name="location-outline"
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.infoText}>Khartoum, Sudan</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsCard}>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => navigation.navigate('ServiceHistory')}
        >
          <Ionicons name="time-outline" size={22} color={COLORS.primary} />
          <Text style={styles.actionText}>Service History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionRow}
          onPress={handleEditProfile}
        >
          <Ionicons name="create-outline" size={22} color={COLORS.primary} />
          <Text style={styles.actionText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color={COLORS.white} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: COLORS.white,
    margin: 20,
    borderRadius: 16,
    alignItems: 'center',
    padding: 20,
    elevation: 4,
  },
  avatarContainer: {
    backgroundColor: COLORS.primary,
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  email: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 15,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.textDark,
  },
  actionsCard: {
    backgroundColor: COLORS.white,
    margin: 20,
    borderRadius: 16,
    elevation: 3,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionText: {
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});