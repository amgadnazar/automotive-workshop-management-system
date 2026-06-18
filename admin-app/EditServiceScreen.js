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

export default function EditServiceScreen({ navigation, route }) {
  const service = route?.params?.service;

  if (!service) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>
          {i18n.t('admin.services.noData')}
        </Text>
      </View>
    );
  }

  const [name, setName] = useState(service.name || '');
  const [price, setPrice] = useState(
    service.price ? String(service.price) : ''
  );

  const [duration, setDuration] = useState(
    service.duration ? String(service.duration) : ''
  );

  const [description, setDescription] = useState(
    service.description || ''
  );

  const [loading, setLoading] = useState(false);

  const saveChanges = async () => {
    if (!name || !price || !duration) {
      Alert.alert(
        "Error",
        "Please fill all required fields"
      );
      return;
    }

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("userToken");

      await apiRequest(
        `/services/${service.id}`,
        'PUT',
        {
          name: name,
          price: Number(price),
          duration: Number(duration),
          description: description || '',
        },
        token
      );

      Alert.alert(
        "Success",
        "Service updated successfully"
      );

      navigation.goBack();

    } catch (error) {
      console.log("Update error:", error);

      Alert.alert(
        "Error",
        error.message || "Something went wrong"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <LinearGradient
          colors={[
            ADMIN_COLORS.primary,
            ADMIN_COLORS.secondary,
          ]}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name={
                isRTL
                  ? "arrow-forward"
                  : "arrow-back"
              }
              size={26}
              color="#fff"
            />
          </TouchableOpacity>

          <Text
            style={[
              styles.title,
              {
                textAlign: isRTL
                  ? 'right'
                  : 'center',
              },
            ]}
          >
            {i18n.t('admin.services.editService')}
          </Text>
        </LinearGradient>


        {/* FORM */}
        <View style={styles.card}>

          <Text style={styles.label}>
            {i18n.t('admin.services.name')} *
          </Text>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholderTextColor={
              ADMIN_COLORS.textLight
            }
          />


          <Text style={styles.label}>
            {i18n.t('admin.services.price')} *
          </Text>

          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
            placeholderTextColor={
              ADMIN_COLORS.textLight
            }
          />


          <Text style={styles.label}>
            Duration (minutes) *
          </Text>

          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
            placeholderTextColor={
              ADMIN_COLORS.textLight
            }
          />


          <Text style={styles.label}>
            {i18n.t('admin.services.description')}
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.textArea,
            ]}
            multiline
            value={description}
            onChangeText={setDescription}
            placeholderTextColor={
              ADMIN_COLORS.textLight
            }
          />


          {/* SAVE */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveChanges}
            disabled={loading}
          >
            <Ionicons
              name="checkmark-circle"
              size={22}
              color="#383838"
            />

            <Text style={styles.saveText}>
              {
                loading
                  ? "Saving..."
                  : i18n.t(
                      'common.saveChanges'
                    )
              }
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
    backgroundColor:
      ADMIN_COLORS.background,
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
    backgroundColor:
      ADMIN_COLORS.surface,
    margin: 20,
    padding: 20,
    borderRadius: 20,
  },

  label: {
    fontSize: 14,
    color:
      ADMIN_COLORS.textLight,
    marginBottom: 6,
    marginTop: 14,
  },

  input: {
    backgroundColor:
      ADMIN_COLORS.surfaceLight,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color:
      ADMIN_COLORS.textDark,
  },

  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  saveButton: {
    backgroundColor:
      ADMIN_COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});