import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';

import { COLORS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../src/localization/i18n';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../src/api/api';

export default function ServiceHistoryDetailsScreen({ route }) {
  const { serviceItem } = route.params;

  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const [engineerId, setEngineerId] = useState(null); 

  const hasEngineer =
    serviceItem.engineer && serviceItem.engineer !== 'N/A';

 
  useEffect(() => {
    console.log('SERVICE ITEM:', serviceItem); 

    if (serviceItem.engineerId) {
      setEngineerId(serviceItem.engineerId);
    }
    else if (serviceItem.engineer) {
      fetchEngineerIdByName(serviceItem.engineer);
    }
  }, []);

  const fetchEngineerIdByName = async (name) => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      const engineers = await apiRequest('/engineers', 'GET', null, token);

      const found = engineers.find(
        (e) => e.name?.toLowerCase() === name?.toLowerCase()
      );

      if (found) {
        setEngineerId(found.id);
      } else {
        console.log('Engineer not found');
      }
    } catch (e) {
      console.log('Error fetching engineers:', e);
    }
  };

  
  const submitRating = async () => {
    if (!rating) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (!engineerId) {
      Alert.alert('Error', 'This service has no engineer assigned');
      return;
    }

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('userToken');

      await apiRequest(
  '/ratings/rating',
  'POST',
  {
    engineerId: engineerId,
    engineerName: serviceItem.engineer || "Unknown", 
    rating: Number(rating),
    comment: '',
  },
  token
);

      Alert.alert('Success', 'Rating submitted');

    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>
          {i18n.t('serviceDetails')}
        </Text>
      </LinearGradient>

      <View style={styles.detailsCard}>
        <Text style={styles.label}>{i18n.t('serviceName')}</Text>
        <Text style={styles.value}>{serviceItem.serviceKey}</Text>

        <Text style={styles.label}>{i18n.t('date')}</Text>
        <Text style={styles.value}>{serviceItem.date}</Text>

        <Text style={styles.label}>{i18n.t('price')}</Text>
        <Text style={styles.value}>{serviceItem.price}</Text>

        <Text style={styles.label}>{i18n.t('status')}</Text>
        <Text
          style={[
            styles.value,
            serviceItem.status === 'completed'
              ? styles.completed
              : serviceItem.status === 'cancelled'
              ? styles.cancelled
              : styles.pending,
          ]}
        >
          {i18n.t(`serviceHistory.status.${serviceItem.status}`)}
        </Text>

        <Text style={styles.label}>{i18n.t('engineer')}</Text>
        <Text style={styles.value}>{serviceItem.engineer}</Text>

        <Text style={styles.label}>{i18n.t('details')}</Text>
        <Text style={styles.value}>{serviceItem.details}</Text>

        {/* RATING */}
        {hasEngineer && (
          <>
            <Text style={styles.label}>Rate Engineer</Text>

            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={28}
                    color="#F59E0B"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.rateBtn}
              onPress={submitRating}
              disabled={loading}
            >
              <Text style={styles.rateText}>
                {loading ? 'Submitting...' : 'Submit Rating'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
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
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.white },
  detailsCard: {
    backgroundColor: COLORS.white,
    margin: 20,
    padding: 20,
    borderRadius: 14,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginTop: 15,
  },
  value: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 4,
  },
  completed: { color: '#2E7D32' },
  cancelled: { color: '#C62828' },
  pending: { color: '#F57C00' },

  starsRow: { flexDirection: 'row', marginTop: 10, gap: 6 },
  rateBtn: {
    backgroundColor: COLORS.primary,
    marginTop: 15,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  rateText: { color: '#fff', fontWeight: '600' },
});