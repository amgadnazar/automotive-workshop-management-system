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
import i18n from '../src/localization/i18n';

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isRTL = I18nManager.isRTL;

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(i18n.t('error'), i18n.t('fillAllFields'));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(i18n.t('error'), i18n.t('passwordMinLength'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(i18n.t('error'), i18n.t('passwordNotMatch'));
      return;
    }

    Alert.alert(i18n.t('success'), i18n.t('passwordChanged'));
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name={isRTL ? 'arrow-forward' : 'arrow-back'}
            size={26}
            color="#fff"
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            { marginLeft: isRTL ? 0 : 15, marginRight: isRTL ? 15 : 0 },
          ]}
        >
          {i18n.t('changePassword')}
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>{i18n.t('currentPassword')}</Text>
        <TextInput
          style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />

        <Text style={styles.label}>{i18n.t('newPassword')}</Text>
        <TextInput
          style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <Text style={styles.label}>{i18n.t('confirmPassword')}</Text>
        <TextInput
          style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          style={[styles.button, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          onPress={handleChangePassword}
        >
          <Ionicons name="lock-closed-outline" size={20} color="#fff" />
          <Text style={[styles.buttonText, { marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }]}>
            {i18n.t('updatePassword')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    elevation: 2,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
