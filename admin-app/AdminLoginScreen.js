import React, { useState } from 'react';
import { apiRequest } from "../src/api/api";
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  I18nManager,
} from 'react-native';

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../src/config/firebase";

import colors from '../theme/colors';
import i18n from '../src/localization/i18n';

const isRTL = I18nManager.isRTL;

export default function AdminLoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert("Error", "Please enter email and password");
    return;
  }

  try {

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    const user = userCredential.user;


    const token = await user.getIdToken();


    await AsyncStorage.setItem("userToken", token);


    const userData = await apiRequest(
      "/users/admin/me",
      "GET",
      null,
      token
    );


    if (userData.role !== "admin") {
      await AsyncStorage.removeItem("userToken");

      Alert.alert(
        "Access Denied",
        "You are not authorized to access the admin panel"
      );
      return;
    }

  
    navigation.replace("AdminMain");

  } catch (error) {
    console.log("Login error:", error.code);

    await AsyncStorage.removeItem("userToken");

    let message = "Something went wrong. Please try again.";

    switch (error.code) {
      case "auth/invalid-email":
        message = "Invalid email format";
        break;

      case "auth/user-not-found":
        message = "No account found with this email";
        break;

      case "auth/wrong-password":
      case "auth/invalid-credential":
        message = "Incorrect email or password";
        break;

      case "auth/too-many-requests":
        message = "Too many attempts. Try again later";
        break;

      case "auth/network-request-failed":
        message = "Check your internet connection";
        break;

      default:
        message = "Login failed. Please try again";
    }

    Alert.alert("Login Failed", message);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {i18n.t('adminLogin.title')}
      </Text>

      <TextInput
        placeholder={i18n.t('adminLogin.email')}
        placeholderTextColor={colors.mutedText}
        style={[
          styles.input,
          {
            textAlign: isRTL ? 'right' : 'left',
            writingDirection: isRTL ? 'rtl' : 'ltr',
          },
        ]}
        onChangeText={setEmail}
        value={email}
      />

      <TextInput
        placeholder={i18n.t('adminLogin.password')}
        placeholderTextColor={colors.mutedText}
        style={[
          styles.input,
          {
            textAlign: isRTL ? 'right' : 'left',
            writingDirection: isRTL ? 'rtl' : 'ltr',
          },
        ]}
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>
          {i18n.t('adminLogin.login')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: 20,
  },

  title: {
    padding: 50,
    color: colors.text,
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 40,
    alignSelf: 'center',
  },

  input: {
    backgroundColor: colors.card,
    color: colors.text,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },

  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 100,
    alignItems: 'center',
    alignSelf: 'center',
    width: 150,
  },

  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});