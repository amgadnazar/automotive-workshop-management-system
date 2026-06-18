import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  I18nManager,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';
import i18n from '../src/localization/i18n';
import { apiRequest } from '../src/api/api';

export default function ServicesScreen({ navigation }) {

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

 
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      const data = await apiRequest('/services', 'GET', null, token);

      setServices(data);

    } catch (error) {
      console.log("Load services error:", error);
    } finally {
      setLoading(false);
    }
  };

  
  const renderService = ({ item }) => (
    <View style={styles.card}>
      <Ionicons name="construct" size={42} color={COLORS.primary} />

      <Text style={styles.serviceName}>
        {item.name}
      </Text>

      <Text style={styles.description}>
        {item.description || 'No description'}
      </Text>

      <Text style={styles.price}>
        ${item.price}
      </Text>

      <View style={styles.durationRow}>
        <Ionicons name="time-outline" size={16} color={COLORS.textLight} />
        <Text style={styles.durationText}>
          {item.duration} {i18n.t('minutes')}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.bookButton}
        onPress={() =>
          navigation.navigate('ServiceDetails', {
            service: {
              ...item,
              title: item.name,
              description: item.description,
              duration: item.duration,
            },
          })
        }
      >
        <Text style={styles.bookText}>
          {i18n.t('viewDetails')}
        </Text>
      </TouchableOpacity>
    </View>
  );


  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 100 }} />
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>
          {i18n.t('ourServices')}
        </Text>
      </LinearGradient>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={renderService}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: 'bold',
  },
  list: {
    padding: 20,
    paddingTop: 10,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    alignItems: 'center',
    elevation: 4,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    color: COLORS.textDark,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginVertical: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  durationText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.textLight,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 10,
  },
  bookText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});