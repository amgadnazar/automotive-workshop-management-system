import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import i18n from '../src/localization/i18n';

export default function ForgetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const handleReset = () => {
    if (!email) {
      Alert.alert(i18n.t('common.error'), i18n.t('forgetPassword.enterEmail'));
      return;
    }

    Alert.alert(
      i18n.t('forgetPassword.successTitle'),
      i18n.t('forgetPassword.successMessage')
    );

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {i18n.t('forgetPassword.title')}
      </Text>

      <Text style={styles.subtitle}>
        {i18n.t('forgetPassword.subtitle')}
      </Text>

      <TextInput
        style={styles.input}
        placeholder={i18n.t('forgetPassword.emailPlaceholder')}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>
          {i18n.t('forgetPassword.sendButton')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>
          {i18n.t('forgetPassword.backToLogin')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backText: {
    marginTop: 20,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});
