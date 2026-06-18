import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import i18n from '../src/localization/i18n';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../src/api/api';

export default function ServiceHistoryScreen({ navigation }) {

  const [history, setHistory] = useState([]);

 
  const loadHistory = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      const data = await apiRequest('/appointments/my', 'GET', null, token);

      const formatted = data.map(item => ({
        id: item.id,
        serviceKey: item.serviceName || 'service',
        date: item.date,
        price: `$${item.price || 0}`,
        status:
          item.status === 'approved' || item.status === 'accepted'
            ? 'completed'
            : item.status === 'rejected'
            ? 'cancelled'
            : 'pending',
        engineer: item.engineer || 'N/A',
        details: item.note || '',
      }));

      setHistory(formatted);

    } catch (error) {
      console.log("History error:", error);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

 

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.serviceName}>
          {item.serviceKey}
        </Text>

        <Text
          style={[
            styles.status,
            item.status === 'completed'
              ? styles.completed
              : item.status === 'cancelled'
              ? styles.cancelled
              : styles.pending,
          ]}
        >
          {i18n.t(`serviceHistory.status.${item.status}`)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.date}>
          {i18n.t('serviceHistory.date')}: {item.date}
        </Text>
        <Text style={styles.price}>{item.price}</Text>
      </View>

      <TouchableOpacity
        style={styles.detailsBtn}
        onPress={() =>
          navigation.navigate('ServiceHistoryDetails', {
            serviceItem: item,
          })
        }
      >
        <Ionicons
          name="receipt-outline"
          size={18}
          color={COLORS.primary}
        />
        <Text style={styles.detailsText}>
          {i18n.t('serviceHistory.viewDetails')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={history}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 0 }}
      ListHeaderComponent={
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.header}
        >
          <Text
            style={[
              styles.title,
              { textAlign: I18nManager.isRTL ? 'right' : 'left' },
            ]}
          >
            {i18n.t('serviceHistory.title')}
          </Text>
        </LinearGradient>
      }
      ListEmptyComponent={
        <Text style={styles.emptyText}>
          {i18n.t('serviceHistory.empty')}
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  date: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 6,
  },
  status: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  completed: {
    backgroundColor: '#E6F4EA',
    color: '#2E7D32',
  },
  cancelled: {
    backgroundColor: '#FDECEA',
    color: '#C62828',
  },
  pending: {
    backgroundColor: '#FFF4E5',
    color: '#F57C00',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  detailsText: {
    marginLeft: 6,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: COLORS.textLight,
  },
});