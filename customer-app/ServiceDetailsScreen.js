import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  I18nManager,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';
import i18n from '../src/localization/i18n';
import { apiRequest } from '../src/api/api';

export default function ServiceDetailsScreen({ route, navigation }) {
  const { service } = route.params;


  const handleBooking = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      await apiRequest('/appointments', 'POST', {
        serviceId: service.id,
        serviceName: service.title,
        price: service.price,
        date: new Date().toISOString().split('T')[0], 
        time: "10:00", 
      }, token);

      Alert.alert("Success", "Booking created successfully");

      navigation.goBack();

    } catch (error) {
      console.log("Booking error:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'}
            size={26}
            color={COLORS.white}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {service.title}
        </Text>
      </LinearGradient>

      <View style={styles.card}>
        <Ionicons name={service.icon || "construct"} size={60} color={COLORS.primary} />

        <Text style={styles.title}>{service.title}</Text>
        <Text style={styles.price}>{'$'+service.price}</Text>

        <View style={styles.durationRow}>
          <Ionicons name="time-outline" size={18} color={COLORS.textLight} />
          <Text style={styles.durationText}>
            {i18n.t('estimatedDuration')}: {service.duration + ' Minutes'}
          </Text>
        </View>

        <Text style={styles.description}>
  {service.description}
</Text>

        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBooking}   
        >
          <Text style={styles.bookText}>
            {i18n.t('bookThisService')}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  card: {
    backgroundColor: COLORS.white,
    margin: 20,
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginTop: 15,
    textAlign: 'center',
  },
  price: {
    fontSize: 18,
    color: COLORS.primary,
    marginVertical: 6,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  durationText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.textLight,
  },
  description: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    marginVertical: 15,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  bookText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});