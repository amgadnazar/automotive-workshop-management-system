import React, { useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

import i18n from "../src/localization/i18n";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../src/config/firebase";


export default function LoginScreen({
  navigation,
}) {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const isRTL =
    i18n.locale.startsWith("ar");


 
  const getPushToken =
    async () => {

      try {

        if (
          Constants.appOwnership ===
          "expo"
        ) {

          console.log(
            "Expo Go detected → skip push"
          );

          return null;
        }

        const permission =
          await Notifications
            .requestPermissionsAsync();


        if (
          permission.status !==
          "granted"
        ) {

          console.log(
            "Permission denied"
          );

          return null;
        }

        const token =
          (
            await Notifications
              .getDevicePushTokenAsync()
          ).data;

        console.log(
          "FCM TOKEN:",
          token
        );

        return token;

      } catch (error) {

        console.log(
          "Push token error:",
          error.message
        );

        return null;
      }
    };



  const handleLogin =
    async () => {

      if (
        !email ||
        !password
      ) {

        Alert.alert(
          i18n.t(
            "common.error"
          ),
          i18n.t(
            "login.enterCredentials"
          )
        );

        return;
      }

      try {

        const credential =
          await signInWithEmailAndPassword(
            auth,
            email.trim(),
            password
          );

        const user =
          credential.user;


        const authToken =
          await user.getIdToken();

        await AsyncStorage.setItem(
          "userToken",
          authToken
        );

        console.log(
          "LOGIN TOKEN SAVED"
        );


        const pushToken =
          await getPushToken();


        if (
          pushToken
        ) {

          const userRef =
            doc(
              db,
              "users", 
              user.uid
            );


          await setDoc(
            userRef,
            {
              email:
                user.email,

              uid:
                user.uid,

              fcmToken:
                pushToken,

              updatedAt:
                new Date()
                  .toISOString(),
            },
            {
              merge: true,
            }
          );

          console.log(
            "FCM saved"
          );


          const snapshot =
            await getDoc(
              userRef
            );

          console.log(
            "Firestore data:",
            snapshot.data()
          );
        }


        navigation.replace(
          "MainApp"
        );

      } catch (error) {

        console.log(
          "Login error:",
          error
        );

        Alert.alert(
          "Login failed",
          error.message
        );
      }
    };


  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        {i18n.t(
          "login.title"
        )}
      </Text>


      <TextInput
        style={[
          styles.input,
          {
            textAlign:
              isRTL
                ? "right"
                : "left",

            writingDirection:
              isRTL
                ? "rtl"
                : "ltr",
          },
        ]}
        placeholder={
          i18n.t(
            "login.email"
          )
        }
        value={email}
        onChangeText={
          setEmail
        }
      />


      <TextInput
        style={[
          styles.input,
          {
            textAlign:
              isRTL
                ? "right"
                : "left",

            writingDirection:
              isRTL
                ? "rtl"
                : "ltr",
          },
        ]}
        placeholder={
          i18n.t(
            "login.password"
          )
        }
        secureTextEntry
        value={password}
        onChangeText={
          setPassword
        }
      />


      <TouchableOpacity
        style={styles.button}
        onPress={
          handleLogin
        }
      >

        <Text
          style={
            styles.buttonText
          }
        >
          {i18n.t(
            "login.login"
          )}
        </Text>

      </TouchableOpacity>
<TouchableOpacity
  onPress={() =>
    navigation.navigate("ForgetPassword")
  }
>
  <Text style={styles.linkText}>
    Forgot Password?
  </Text>
</TouchableOpacity>

<TouchableOpacity
  onPress={() =>
    navigation.navigate("CreateAccount")
  }
>
  <Text style={styles.linkText}>
    Create Account
  </Text>
</TouchableOpacity>
    </View>
  );
}


const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
      backgroundColor:
        "#fff",
    },

    title: {
      fontSize: 26,
      fontWeight:
        "bold",
      color:
        "#007AFF",
      marginBottom: 20,
    },

    input: {
      width: "80%",
      borderWidth: 1,
      borderColor:
        "#ccc",
      padding: 10,
      borderRadius: 8,
      marginBottom: 15,
    },

    button: {
      backgroundColor:
        "#007AFF",
      padding: 12,
      borderRadius: 8,
      width: "80%",
      alignItems:
        "center",
    },

    buttonText: {
      color:
        "#fff",
      fontWeight:
        "bold",
      fontSize: 16,
    },
    linkText: {
  color: "#007AFF",
  marginTop: 15,
  fontSize: 16,
  fontWeight: "500",
},
  });