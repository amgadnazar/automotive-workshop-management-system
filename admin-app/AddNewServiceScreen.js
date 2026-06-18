import React, { useState } from 'react'; 
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ADMIN_COLORS } from '../constants/adminTheme';
import i18n from '../src/localization/i18n';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../src/api/api';

const isRTL = i18n.locale.startsWith('ar');

export default function AddNewServiceScreen({ navigation }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = async () => {
    if (!name || !price || !duration) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");

      await apiRequest('/services', 'POST', {
        name: name,
        price: Number(price),
        duration: Number(duration),
        description: description || '',
      }, token);

      Alert.alert("Success", "Service added successfully");

      navigation.goBack();

    } catch (error) {
      console.log(error);
      Alert.alert("Error", error.message || "Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <LinearGradient
          colors={[ADMIN_COLORS.primary, ADMIN_COLORS.secondary]}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name={isRTL ? "arrow-forward" : "arrow-back"}
              size={26}
              color="#fff"
            />
          </TouchableOpacity>

          <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'center' }]}>
            {i18n.t('admin.services.addService')}
          </Text>
        </LinearGradient>

        {/* FORM */}
        <View style={styles.card}>
          <Text style={styles.label}>
            {i18n.t('admin.services.name')} *
          </Text>
          <TextInput
            placeholder={i18n.t('admin.services.namePlaceholder')}
            placeholderTextColor={ADMIN_COLORS.textLight}
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <Text style={styles.label}>
            {i18n.t('admin.services.price')} *
          </Text>
          <TextInput
            style={styles.input}
            placeholder={i18n.t('admin.services.pricePlaceholder')}
            placeholderTextColor={ADMIN_COLORS.textLight}
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />

          <Text style={styles.label}>
            Duration (minutes) *
          </Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={ADMIN_COLORS.textLight}
            placeholder="30"
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
          />

          <Text style={styles.label}>
            {i18n.t('admin.services.description')}
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={i18n.t('admin.services.descriptionPlaceholder')}
            placeholderTextColor={ADMIN_COLORS.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* SAVE */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark-circle" size={22} color="#383838" />
            <Text style={styles.saveText}>
              {i18n.t('common.saveService')}
            </Text>
          </TouchableOpacity>
        </View>
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
    color: '#fff',
    marginTop: 20,
  },
  card: {
    backgroundColor: ADMIN_COLORS.surface,
    margin: 20,
    padding: 20,
    borderRadius: 20,
  },
  label: {
    fontSize: 14,
    color: ADMIN_COLORS.textLight,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: ADMIN_COLORS.surfaceLight,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: ADMIN_COLORS.textDark,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: ADMIN_COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    marginTop: 30,
  },
  saveText: {
    color: '#383838',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});