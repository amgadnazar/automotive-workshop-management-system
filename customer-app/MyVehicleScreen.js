import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  I18nManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';
import i18n from '../src/localization/i18n';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../src/api/api';

export default function MyVehicleScreen() {
  const [vehicle, setVehicle] = useState({
    brand: '',
    model: '',
    year: '',
    plate: '',
    color: '',
    fuel: '',
  });

  const [loading, setLoading] = useState(false);

  
  const fetchVehicle = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      const data = await apiRequest(
  '/vehicles',
  'GET',
  null,
  token
);

      if (data) {
        setVehicle({
          brand: data.brand || '',
          model: data.model || '',
          year: data.year || '',
          plate: data.plate || '',
          color: data.color || '',
          fuel: data.fuel || '',
        });
      }

    } catch (e) {
      console.log('Vehicle fetch error:', e.message);
    }
  };

  useEffect(() => {
    fetchVehicle();
  }, []);

  
  const handleSave = async () => {
    if (!vehicle.brand || !vehicle.model || !vehicle.year) {
      Alert.alert('Error', 'Brand, Model and Year are required');
      return;
    }

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('userToken');

      await apiRequest(
        '/vehicles',
        'POST',
        vehicle,
        token
      );

      Alert.alert(
        i18n.t('myVehicle.savedTitle'),
        i18n.t('myVehicle.savedMessage')
      );

    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>
          {i18n.t('myVehicle.title')}
        </Text>
      </LinearGradient>

      <View style={styles.card}>
        <View style={styles.iconBox}>
          <Ionicons
            name="car-sport-outline"
            size={48}
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.sectionTitle}>
          {i18n.t('myVehicle.sectionTitle')}
        </Text>

        <Text style={styles.label}>{i18n.t('myVehicle.brand')}</Text>
        <TextInput
          style={styles.input}
          value={vehicle.brand}
          onChangeText={(text) => setVehicle({ ...vehicle, brand: text })}
          placeholder={i18n.t('myVehicle.brandPlaceholder')}
          textAlign={I18nManager.isRTL ? 'right' : 'left'}
        />

        <Text style={styles.label}>{i18n.t('myVehicle.model')}</Text>
        <TextInput
          style={styles.input}
          value={vehicle.model}
          onChangeText={(text) => setVehicle({ ...vehicle, model: text })}
          placeholder={i18n.t('myVehicle.modelPlaceholder')}
          textAlign={I18nManager.isRTL ? 'right' : 'left'}
        />

        <Text style={styles.label}>{i18n.t('myVehicle.year')}</Text>
        <TextInput
          style={styles.input}
          value={vehicle.year}
          onChangeText={(text) => setVehicle({ ...vehicle, year: text })}
          keyboardType="numeric"
          placeholder={i18n.t('myVehicle.yearPlaceholder')}
          textAlign={I18nManager.isRTL ? 'right' : 'left'}
        />

        <Text style={styles.label}>{i18n.t('myVehicle.plate')}</Text>
        <TextInput
          style={styles.input}
          value={vehicle.plate}
          onChangeText={(text) => setVehicle({ ...vehicle, plate: text })}
          placeholder={i18n.t('myVehicle.platePlaceholder')}
          textAlign={I18nManager.isRTL ? 'right' : 'left'}
        />

        <Text style={styles.label}>{i18n.t('myVehicle.color')}</Text>
        <TextInput
          style={styles.input}
          value={vehicle.color}
          onChangeText={(text) => setVehicle({ ...vehicle, color: text })}
          placeholder={i18n.t('myVehicle.colorPlaceholder')}
          textAlign={I18nManager.isRTL ? 'right' : 'left'}
        />

        <Text style={styles.label}>{i18n.t('myVehicle.fuel')}</Text>
        <TextInput
          style={styles.input}
          value={vehicle.fuel}
          onChangeText={(text) => setVehicle({ ...vehicle, fuel: text })}
          placeholder={i18n.t('myVehicle.fuelPlaceholder')}
          textAlign={I18nManager.isRTL ? 'right' : 'left'}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.saveGradient}
          >
            <Ionicons name="save-outline" size={22} color="#fff" />
            <Text style={styles.saveText}>
              {loading ? 'Saving...' : i18n.t('myVehicle.save')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  card: {
    backgroundColor: COLORS.white,
    margin: 20,
    borderRadius: 18,
    padding: 20,
    elevation: 4,
  },
  iconBox: {
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 15,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  saveBtn: {
    marginTop: 30,
    borderRadius: 14,
    overflow: 'hidden',
  },
  saveGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  saveText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 8,
  },
});