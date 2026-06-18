import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  I18nManager,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ADMIN_COLORS } from '../constants/adminTheme';
import i18n from '../src/localization/i18n';

import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

import { auth } from "../src/config/firebase";
import { apiRequest } from '../src/api/api';

const isRTL = I18nManager.isRTL;

export default function EditProfileScreen({ navigation }) {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [workingHours, setWorkingHours] = useState('');

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordLoading, setPasswordLoading] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {

    try {

      const user = auth.currentUser;
      const token = await user.getIdToken();

      const userData = await apiRequest(
        "/users/me",
        "GET",
        null,
        token
      );

      const workshopData = await apiRequest(
        "/workshop",
        "GET",
        null,
        token
      );

      setName(userData.name || '');
      setEmail(userData.email || '');

      setPhone(workshopData.phone || '');
      setLocation(workshopData.location || '');
      setWorkingHours(workshopData.workingHours || '');

    } catch (error) {

      console.log(
        "Fetch error:",
        error.message
      );
    }
  };

 
  
  const handleSave = async () => {

    try {

      const user = auth.currentUser;
      const token = await user.getIdToken();

      await apiRequest(
        "/users/me",
        "PUT",
        {
          name,
          email,
        },
        token
      );

      await apiRequest(
        "/workshop",
        "PUT",
        {
          phone,
          location,
          workingHours,
        },
        token
      );

      Alert.alert(
        i18n.t('common.success'),
        i18n.t('editProfile.savedSuccessfully')
      );

      navigation.goBack();

    } catch (error) {

      console.log(
        "Save error:",
        error.message
      );

      Alert.alert(
        i18n.t('common.error'),
        error.message
      );
    }
  };

 
  
  const handleChangePassword = async () => {

    if (!currentPassword) {

      Alert.alert(
        i18n.t('common.error'),
        i18n.t('editProfile.enterCurrentPassword')
      );

      return;
    }

    if (newPassword.length < 6) {

      Alert.alert(
        i18n.t('common.error'),
        i18n.t('editProfile.passwordMin')
      );

      return;
    }

    if (newPassword !== confirmPassword) {

      Alert.alert(
        i18n.t('common.error'),
        i18n.t('editProfile.passwordsDontMatch')
      );

      return;
    }

    setPasswordLoading(true);

    try {

      const user = auth.currentUser;

      const credential =
        EmailAuthProvider.credential(
          user.email,
          currentPassword
        );

      await reauthenticateWithCredential(
        user,
        credential
      );

      await updatePassword(
        user,
        newPassword
      );

      Alert.alert(
        i18n.t('common.success'),
        i18n.t('editProfile.passwordUpdated')
      );

      setPasswordModalVisible(false);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (error) {

      Alert.alert(
        i18n.t('common.error'),
        error.message
      );

    } finally {

      setPasswordLoading(false);
    }
  };

  return (

    <View style={styles.container}>

      <ScrollView showsVerticalScrollIndicator={false}>

        <LinearGradient
          colors={[
            ADMIN_COLORS.primary,
            ADMIN_COLORS.secondary,
          ]}
          style={styles.header}
        >

          <TouchableOpacity
            style={[
              styles.backBtn,
              {
                left: isRTL ? undefined : 20,
                right: isRTL ? 20 : undefined,
              },
            ]}
            onPress={() =>
              navigation.goBack()
            }
          >
            <Ionicons
              name={
                isRTL
                  ? "arrow-forward"
                  : "arrow-back"
              }
              size={24}
              color={ADMIN_COLORS.white}
            />
          </TouchableOpacity>

          <Text style={styles.title}>
            {i18n.t('editProfile.title')}
          </Text>

        </LinearGradient>

        <View style={styles.form}>

          <Input
            label={i18n.t('editProfile.fullName')}
            value={name}
            onChangeText={setName}
            icon="person"
          />

          <Input
            label={i18n.t('editProfile.email')}
            value={email}
            onChangeText={setEmail}
            icon="mail"
            keyboardType="email-address"
          />

          <Input
            label={i18n.t('editProfile.phone')}
            value={phone}
            onChangeText={setPhone}
            icon="call"
            keyboardType="phone-pad"
          />

          <Input
            label={i18n.t('editProfile.workshop')}
            value={location}
            onChangeText={setLocation}
            icon="location"
          />

          <Input
            label={i18n.t('profile.workingHours')}
            value={workingHours}
            onChangeText={setWorkingHours}
            icon="time"
          />

          {/* CHANGE PASSWORD BUTTON */}
          <TouchableOpacity
            style={[
              styles.passwordButton,
              {
                flexDirection:
                  isRTL
                    ? 'row-reverse'
                    : 'row',
              }
            ]}
            onPress={() =>
              setPasswordModalVisible(true)
            }
          >

            <Ionicons
              name="lock-closed"
              size={20}
              color={ADMIN_COLORS.white}
            />

            <Text style={styles.passwordButtonText}>
              {i18n.t('editProfile.changePassword')}
            </Text>

          </TouchableOpacity>

          {/* SAVE BUTTON */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                flexDirection:
                  isRTL
                    ? 'row-reverse'
                    : 'row',
              }
            ]}
            onPress={handleSave}
          >

            <Ionicons
              name="save"
              size={20}
              color={ADMIN_COLORS.black}
            />

            <Text style={styles.saveText}>
              {i18n.t('editProfile.save')}
            </Text>

          </TouchableOpacity>

        </View>

      </ScrollView>

      {/* PASSWORD MODAL */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() =>
          setPasswordModalVisible(false)
        }
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalContent}>

            <View
              style={[
                styles.modalHeader,
                {
                  flexDirection:
                    isRTL
                      ? 'row-reverse'
                      : 'row',
                }
              ]}
            >

              <Text style={styles.modalTitle}>
                {i18n.t('editProfile.changePassword')}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setPasswordModalVisible(false)
                }
              >

                <Ionicons
                  name="close"
                  size={24}
                  color="#333"
                />

              </TouchableOpacity>

            </View>

            {/* Current Password */}
            <Text
              style={[
                styles.modalLabel,
                {
                  textAlign:
                    isRTL
                      ? 'right'
                      : 'left',
                }
              ]}
            >
              {i18n.t('editProfile.currentPassword')}
            </Text>

            <View style={styles.passwordInputContainer}>

              <TextInput
                style={[
                  styles.modalInput,
                  {
                    textAlign:
                      isRTL
                        ? 'right'
                        : 'left',
                  }
                ]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrent}
                placeholder={i18n.t('editProfile.enterCurrentPasswordPlaceholder')}
                placeholderTextColor={ADMIN_COLORS.textLight}
              />

              <TouchableOpacity
                onPress={() =>
                  setShowCurrent(!showCurrent)
                }
                style={[
                  styles.eyeIcon,
                  {
                    right: isRTL ? undefined : 0,
                    left: isRTL ? 0 : undefined,
                  }
                ]}
              >

                <Ionicons
                  name={showCurrent ? 'eye-off' : 'eye'}
                  size={20}
                  color="#666"
                />

              </TouchableOpacity>

            </View>

            {/* New Password */}
            <Text
              style={[
                styles.modalLabel,
                {
                  textAlign:
                    isRTL
                      ? 'right'
                      : 'left',
                }
              ]}
            >
              {i18n.t('editProfile.newPassword')}
            </Text>

            <View style={styles.passwordInputContainer}>

              <TextInput
                style={[
                  styles.modalInput,
                  {
                    textAlign:
                      isRTL
                        ? 'right'
                        : 'left',
                  }
                ]}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNew}
                placeholder={i18n.t('editProfile.enterNewPasswordPlaceholder')}
                placeholderTextColor={ADMIN_COLORS.textLight}
              />

              <TouchableOpacity
                onPress={() =>
                  setShowNew(!showNew)
                }
                style={[
                  styles.eyeIcon,
                  {
                    right: isRTL ? undefined : 0,
                    left: isRTL ? 0 : undefined,
                  }
                ]}
              >

                <Ionicons
                  name={showNew ? 'eye-off' : 'eye'}
                  size={20}
                  color="#666"
                />

              </TouchableOpacity>

            </View>

            {/* Confirm Password */}
            <Text
              style={[
                styles.modalLabel,
                {
                  textAlign:
                    isRTL
                      ? 'right'
                      : 'left',
                }
              ]}
            >
              {i18n.t('editProfile.confirmPassword')}
            </Text>

            <View style={styles.passwordInputContainer}>

              <TextInput
                style={[
                  styles.modalInput,
                  {
                    textAlign:
                      isRTL
                        ? 'right'
                        : 'left',
                  }
                ]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                placeholder={i18n.t('editProfile.confirmPasswordPlaceholder')}
                placeholderTextColor={ADMIN_COLORS.textLight}
              />

              <TouchableOpacity
                onPress={() =>
                  setShowConfirm(!showConfirm)
                }
                style={[
                  styles.eyeIcon,
                  {
                    right: isRTL ? undefined : 0,
                    left: isRTL ? 0 : undefined,
                  }
                ]}
              >

                <Ionicons
                  name={showConfirm ? 'eye-off' : 'eye'}
                  size={20}
                  color="#666"
                />

              </TouchableOpacity>

            </View>

            <TouchableOpacity
              style={styles.changePasswordButton}
              onPress={handleChangePassword}
              disabled={passwordLoading}
            >

              {passwordLoading ? (

                <ActivityIndicator
                  size="small"
                  color="#fff"
                />

              ) : (

                <Text style={styles.changePasswordText}>
                  {i18n.t('editProfile.updatePassword')}
                </Text>

              )}

            </TouchableOpacity>

          </View>

        </View>

      </Modal>

    </View>
  );
}


function Input({
  label,
  value,
  onChangeText,
  icon,
  keyboardType = 'default',
}) {

  return (

    <View style={styles.inputWrapper}>

      <Text
        style={[
          styles.label,
          {
            textAlign:
              isRTL
                ? 'right'
                : 'left'
          }
        ]}
      >
        {label}
      </Text>

      <View
        style={[
          styles.inputBox,
          {
            flexDirection:
              isRTL
                ? 'row-reverse'
                : 'row',
          },
        ]}
      >

        <Ionicons
          name={icon}
          size={18}
          color={ADMIN_COLORS.textLight}
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          style={[
            styles.input,
            {
              textAlign:
                isRTL
                  ? 'right'
                  : 'left',

              writingDirection:
                isRTL
                  ? 'rtl'
                  : 'ltr',
            },
          ]}
          placeholderTextColor={ADMIN_COLORS.textLight}
        />

      </View>

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
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  backBtn: {
    position: 'absolute',
    top: 60,
    zIndex: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: ADMIN_COLORS.white,
    textAlign: 'center',
  },

  form: {
    padding: 20,
  },

  inputWrapper: {
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    marginBottom: 6,
    color: ADMIN_COLORS.textLight,
  },

  inputBox: {
    backgroundColor: ADMIN_COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: ADMIN_COLORS.textDark,
    marginHorizontal: 10,
  },

  saveButton: {
    backgroundColor: ADMIN_COLORS.primary,
    padding: 16,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  saveText: {
    color: ADMIN_COLORS.black,
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },

  passwordButton: {
    backgroundColor: '#404341',
    padding: 16,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  passwordButtonText: {
    color: ADMIN_COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: ADMIN_COLORS.surface,
    borderRadius: 20,
    padding: 20,
    width: '85%',
  },

  modalHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: ADMIN_COLORS.border,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ADMIN_COLORS.textDark,
  },

  modalLabel: {
    fontSize: 14,
    color: ADMIN_COLORS.textLight,
    marginBottom: 6,
    marginTop: 15,
  },

  modalInput: {
    backgroundColor: ADMIN_COLORS.background,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    flex: 1,
    color: ADMIN_COLORS.textDark,
  },

  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ADMIN_COLORS.background,
    borderRadius: 10,
  },

  eyeIcon: {
    padding: 12,
    position: 'absolute',
  },

  changePasswordButton: {
    backgroundColor: ADMIN_COLORS.primary,
    padding: 15,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },

  changePasswordText: {
    color: ADMIN_COLORS.black,
    fontSize: 16,
    fontWeight: '600',
  },

});