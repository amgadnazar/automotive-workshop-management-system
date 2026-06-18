import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  I18nManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { COLORS } from '../constants/theme';
import i18n from '../src/localization/i18n';

export default function BookingScreen() {
  const [service, setService] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());

  const openDatePicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      mode: 'datetime',
      is24Hour: true,
      onChange: (_event, selectedDate) => {
        if (selectedDate) setDate(selectedDate);
      },
    });
  };

  const handleSubmit = () => {
    if (!service.trim()) {
      Alert.alert(i18n.t('error'), i18n.t('enterService'));
      return;
    }

    Alert.alert(
      i18n.t('bookingConfirmed'),
      `${i18n.t('service')}: ${service}\n${i18n.t('date')}: ${date.toLocaleString()}\n${i18n.t('note')}: ${note || i18n.t('none')}`
    );

    setService('');
    setNote('');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>
          {i18n.t('bookService')}
        </Text>
      </LinearGradient>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>{i18n.t('serviceType')}</Text>
        <TextInput
          style={styles.input}
          placeholder={i18n.t('servicePlaceholder')}
          value={service}
          onChangeText={setService}
          textAlign={I18nManager.isRTL ? 'right' : 'left'}
        />

        <Text style={styles.label}>{i18n.t('dateTime')}</Text>
        <TouchableOpacity style={styles.dateButton} onPress={openDatePicker}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
          <Text style={styles.dateText}>{date.toLocaleString()}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>{i18n.t('noteOptional')}</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder={i18n.t('notePlaceholder')}
          value={note}
          onChangeText={setNote}
          multiline
          textAlignVertical="top"
          textAlign={I18nManager.isRTL ? 'right' : 'left'}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.gradientButton}
          >
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text style={styles.submitText}>
              {i18n.t('confirmBooking')}
            </Text>
          </LinearGradient>
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
    marginHorizontal: 20,
    marginTop: -30,
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateText: {
    fontSize: 16,
    marginLeft: 10,
    color: COLORS.textDark,
  },
  submitButton: {
    marginTop: 30,
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
