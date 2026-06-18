import React, { useState } from 'react';
import { apiRequest } from '../src/api/api';

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import i18n from '../src/localization/i18n';

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../src/config/firebase';

const isRTL = i18n.locale.startsWith('ar');

export default function CreateAccountScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState(null);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');


const handleCreateAccount = async () => {
  if (!name || !email || !password || !gender) {
    Alert.alert(
      i18n.t('common.error'),
      i18n.t('createAccount.fillRequired')
    );
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await updateProfile(userCredential.user, {
      displayName: name,
    });

    const token = await userCredential.user.getIdToken();

    console.log("REGISTER TOKEN:", token); 

    await apiRequest(
      "/users/profile", 
      "POST",
      {
        name,
        phone,
      },
      token
    );

    Alert.alert(
      i18n.t('common.success'),
      i18n.t('createAccount.success')
    );

    navigation.replace('Login');

  } catch (error) {
    console.log(error);
    Alert.alert("Error", error.message);
  }
};

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>{i18n.t('createAccount.title')}</Text>

      <Input
        icon="person"
        placeholder={i18n.t('createAccount.fullName')}
        value={name}
        onChangeText={setName}
      />

      <Input
        icon="mail"
        placeholder={i18n.t('createAccount.email')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Input
        icon="lock-closed"
        placeholder={i18n.t('createAccount.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Input
        icon="calendar"
        placeholder={i18n.t('createAccount.birthdate')}
        value={birthdate}
        onChangeText={setBirthdate}
      />

      <Input
        icon="call"
        placeholder={i18n.t('createAccount.phone')}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Input
        icon="location"
        placeholder={i18n.t('createAccount.address')}
        value={address}
        onChangeText={setAddress}
      />

      {/* Gender */}
      <View style={styles.genderContainer}>
        <Text style={styles.genderLabel}>
          {i18n.t('createAccount.gender')}
        </Text>

        <View style={styles.genderButtons}>
          <GenderButton
            label={i18n.t('createAccount.male')}
            selected={gender === 'male'}
            onPress={() => setGender('male')}
          />

          <GenderButton
            label={i18n.t('createAccount.female')}
            selected={gender === 'female'}
            onPress={() => setGender('female')}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
        <Text style={styles.buttonText}>
          {i18n.t('createAccount.create')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.loginText}>
          {i18n.t('createAccount.haveAccount')}{' '}
          <Text style={styles.loginLink}>
            {i18n.t('createAccount.login')}
          </Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Input({ icon, ...props }) {
  return (
    <View style={styles.inputContainer}>
      <Ionicons name={icon} size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
      <TextInput {...props} style={styles.input} />
    </View>
  );
}

function GenderButton({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.genderButton, selected && styles.genderButtonSelected]}
    >
      <Text style={[styles.genderButtonText, selected && styles.genderButtonTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 30,
    textAlign: 'center',
    paddingTop: 50,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 15,
    elevation: 2,
  },
  input: {
    fontSize: 16,
    flex: 1,
  },
  genderContainer: {
    marginBottom: 20,
  },
  genderLabel: {
    marginBottom: 8,
  },
  genderButtons: {
    flexDirection: 'row',
  },
  genderButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 10,
  },
  genderButtonSelected: {
    backgroundColor: COLORS.primary,
  },
  genderButtonText: {
    color: COLORS.primary,
  },
  genderButtonTextSelected: {
    color: '#fff',
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loginText: {
    textAlign: 'center',
    marginTop: 25,
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});