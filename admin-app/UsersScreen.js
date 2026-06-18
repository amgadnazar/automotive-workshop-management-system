import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ADMIN_COLORS } from '../constants/adminTheme';
import i18n from '../src/localization/i18n';

import { auth } from '../src/config/firebase';
import { apiRequest } from '../src/api/api';

export default function UsersScreen() {

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const user = auth.currentUser;
        const token = await user.getIdToken();

        const data = await apiRequest(
          "/users",
          "GET",
          null,
          token
        );

        const usersList = data.map((u) => ({
          id: u.id || u._id || u.uid,
          name: u.name || "No Name",
          email: u.email || "No Email",
          blocked: u.isBlocked || false,
        }));

        setUsers(usersList);

      } catch (error) {
        console.log("Fetch users error:", error.message);
      }
    };

    fetchUsers();
  }, []);

  const blockedUsers = users.filter((u) => u.blocked);
  const activeUsers = users.filter((u) => !u.blocked);

  const blockUser = (id) => {
    Alert.alert(
      i18n.t('users.blockTitle'),
      i18n.t('users.blockMessage'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('users.block'),
          style: 'destructive',
          onPress: async () => {
            try {
              const user = auth.currentUser;
              const token = await user.getIdToken();

              await apiRequest(
                `/users/${id}/block`,
                "PATCH",
                null,
                token
              );

              setUsers((prev) =>
                prev.map((u) =>
                  u.id === id ? { ...u, blocked: true } : u
                )
              );

            } catch (e) {
              console.log("Block error:", e.message);
            }
          },
        },
      ]
    );
  };

  const unblockUser = (id) => {
    Alert.alert(
      i18n.t('users.unblockTitle'),
      i18n.t('users.unblockMessage'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('users.unblock'),
          onPress: async () => {
            try {
              const user = auth.currentUser;
              const token = await user.getIdToken();

              await apiRequest(
                `/users/${id}/unblock`,
                "PATCH",
                null,
                token
              );

              setUsers((prev) =>
                prev.map((u) =>
                  u.id === id ? { ...u, blocked: false } : u
                )
              );

            } catch (e) {
              console.log("Unblock error:", e.message);
            }
          },
        },
      ]
    );
  };

  const renderUser = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>

      {item.blocked ? (
        <TouchableOpacity
          style={[styles.actionBtn, styles.unblockBtn]}
          onPress={() => unblockUser(item.id)}
        >
          <Text style={styles.btnText}>
            {i18n.t('users.unblock')}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.actionBtn, styles.blockBtn]}
          onPress={() => blockUser(item.id)}
        >
          <Text style={styles.btnText}>
            {i18n.t('users.block')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[ADMIN_COLORS.primary, ADMIN_COLORS.secondary]}
          style={styles.header}
        >
          <Text style={styles.title}>
            {i18n.t('users.title')}
          </Text>
        </LinearGradient>

        <Text style={styles.sectionTitle}>
          {i18n.t('users.blockedUsers')}
        </Text>

        {blockedUsers.length === 0 ? (
          <Text style={styles.emptyText}>
            {i18n.t('users.noBlocked')}
          </Text>
        ) : (
          <FlatList
            data={blockedUsers}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            renderItem={renderUser}
          />
        )}

        <Text style={styles.sectionTitle}>
          {i18n.t('users.activeUsers')}
        </Text>

        <FlatList
          data={activeUsers}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
          }}
          renderItem={renderUser}
        />
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ADMIN_COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: ADMIN_COLORS.white,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 20,
    marginTop: 25,
    marginBottom: 10,
    color: ADMIN_COLORS.textDark,
  },
  emptyText: {
    marginLeft: 20,
    color: ADMIN_COLORS.textLight,
  },
  card: {
    backgroundColor: ADMIN_COLORS.surface,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ADMIN_COLORS.textDark,
  },
  email: {
    fontSize: 13,
    color: ADMIN_COLORS.textLight,
    marginTop: 4,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  blockBtn: {
    backgroundColor: '#ef4444',
  },
  unblockBtn: {
    backgroundColor: '#22c55e',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});