import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  I18nManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';
import i18n from '../src/localization/i18n';

import { apiRequest } from '../src/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OrderSparePartScreen() {
  const [partName, setPartName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = async () => {
    if (!partName || !quantity) {
      Alert.alert(
        i18n.t('error'),
        i18n.t('orderSparePartError')
      );
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");

      await apiRequest(
        "/spare-part-orders",
        "POST",
        {
          partName,
          quantity: Number(quantity),
          note,
        },
        token
      );

      Alert.alert(
        i18n.t('orderSubmitted'),
        `${i18n.t('partName')}: ${partName}\n` +
        `${i18n.t('quantity')}: ${quantity}\n` +
        `${i18n.t('note')}: ${note || i18n.t('none')}`
      );

      setPartName('');
      setQuantity('');
      setNote('');

    } catch (error) {
      console.log("Order error:", error.message);

      Alert.alert(
        i18n.t('error'),
        error.message || "Something went wrong"
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>
          {i18n.t('orderSparePart')}
        </Text>
      </LinearGradient>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>{i18n.t('partName')}</Text>
        <TextInput
          style={styles.input}
          placeholder={i18n.t('partNamePlaceholder')}
          value={partName}
          onChangeText={setPartName}
        />

        <Text style={styles.label}>{i18n.t('quantity')}</Text>
        <TextInput
          style={styles.input}
          placeholder={i18n.t('quantityPlaceholder')}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />

        <Text style={styles.label}>{i18n.t('noteOptional')}</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder={i18n.t('notePlaceholder')}
          value={note}
          onChangeText={setNote}
          multiline
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.gradientButton}
          >
            <Ionicons name="send" size={22} color="#fff" />
            <Text style={styles.submitText}>
              {i18n.t('submitOrder')}
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
    color: COLORS.white,
    fontSize: 26,
    fontWeight: 'bold',
  },
  form: {
    backgroundColor: COLORS.white,
    margin: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginTop: 15,
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
  submitButton: {
    marginTop: 25,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 8,
    fontWeight: '600',
  },
});