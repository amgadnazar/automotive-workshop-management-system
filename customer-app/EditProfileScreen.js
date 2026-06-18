import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  I18nManager,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../src/localization/i18n';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';

export default function EditProfileScreen({ navigation, route }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isRTL = I18nManager.isRTL;

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        Alert.alert('Error', 'No user logged in');
        navigation.goBack();
        return;
      }

      setUserId(currentUser.uid);
      setEmail(currentUser.email || '');

      const app = getApp();
      const db = getFirestore(app);
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("📦 User data from Firestore:", userData);
        
        setName(userData?.name || userData?.displayName || '');
        setPhone(userData?.phone || '');
        setLocation(userData?.address || userData?.location || '');
      } else {
        console.log("No user document found, using default values");
        setName(currentUser.displayName || '');
      }
    } catch (error) {
      console.log("Error fetching user data:", error.message);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setLoading(true);

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        Alert.alert('Error', 'No user logged in');
        setLoading(false);
        return;
      }

      const app = getApp();
      const db = getFirestore(app);
      const userRef = doc(db, 'users', currentUser.uid);

      const updateData = {
        name: name.trim(),
        phone: phone.trim(),
        address: location.trim(),
        updatedAt: new Date().toISOString(),
      };

      console.log("📤 Updating user data in Firestore:", updateData);

      await updateDoc(userRef, updateData);

      try {
        await currentUser.updateProfile({
          displayName: name.trim()
        });
        console.log("✅ Display name updated in Auth");
      } catch (authError) {
        console.log("Could not update displayName in Auth:", authError.message);
      }

      Alert.alert('Success', 'Profile updated successfully');
      
      navigation.goBack();
    } catch (error) {
      console.log("Error updating profile:", error.message);
      Alert.alert('Error', 'Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    if (!newPassword) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setPasswordLoading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user || !user.email) {
        Alert.alert('Error', 'No user logged in');
        setPasswordLoading(false);
        return;
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      await reauthenticateWithCredential(user, credential);
      
      await updatePassword(user, newPassword);

      Alert.alert('Success', 'Password changed successfully!');

      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (error) {
      console.log('Password change error:', error.code, error.message);
      
      if (error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Current password is incorrect');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Error', 'New password is too weak. Please use at least 6 characters');
      } else if (error.code === 'auth/requires-recent-login') {
        Alert.alert('Error', 'Please login again to change password');
      } else {
        Alert.alert('Error', error.message || 'Failed to change password');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
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
          {i18n.t('editProfile') || 'Edit Profile'}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.label}>{i18n.t('fullName') || 'Full Name'}</Text>
          <TextInput
            style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
            value={name}
            onChangeText={setName}
            placeholder={i18n.t('fullNamePlaceholder') || 'Enter your full name'}
          />

          <Text style={styles.label}>{i18n.t('email') || 'Email'}</Text>
          <TextInput
            style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
            value={email}
            editable={false}
            placeholder="Email"
          />

          <Text style={styles.label}>{i18n.t('phone') || 'Phone'}</Text>
          <TextInput
            style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder={i18n.t('phonePlaceholder') || 'Enter your phone number'}
          />

          <Text style={styles.label}>{i18n.t('location') || 'Location'}</Text>
          <TextInput
            style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
            value={location}
            onChangeText={setLocation}
            placeholder={i18n.t('locationPlaceholder') || 'Enter your location'}
          />

          <TouchableOpacity
            style={[styles.saveButton, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={[styles.saveText, { marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }]}>
                  {i18n.t('saveChanges') || 'Save Changes'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Change Password Button */}
          <TouchableOpacity
            style={[styles.passwordButton, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
            onPress={() => setPasswordModalVisible(true)}
          >
            <Ionicons name="lock-closed-outline" size={20} color="#fff" />
            <Text style={[styles.saveText, { marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }]}>
              {i18n.t('changePassword') || 'Change Password'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/*  Modal لتغيير كلمة المرور */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Current Password */}
            <Text style={styles.modalLabel}>Current Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.modalInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrent}
                placeholder="Enter current password"
                placeholderTextColor="#999"
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeIcon}>
                <Ionicons name={showCurrent ? 'eye-off' : 'eye'} size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* New Password */}
            <Text style={styles.modalLabel}>New Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.modalInput}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNew}
                placeholder="Enter new password"
                placeholderTextColor="#999"
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeIcon}>
                <Ionicons name={showNew ? 'eye-off' : 'eye'} size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <Text style={styles.modalLabel}>Confirm New Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.modalInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                placeholder="Confirm new password"
                placeholderTextColor="#999"
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>
                <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.changePasswordButton}
              onPress={handleChangePassword}
              disabled={passwordLoading}
            >
              {passwordLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.changePasswordText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingBottom: 40,
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
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  passwordButton: {
    backgroundColor: '#404341',
    padding: 15,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    marginTop: 15,
  },
  modalInput: {
    backgroundColor: '#f5f6fa',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    flex: 1,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
    borderRadius: 10,
  },
  eyeIcon: {
    padding: 12,
    position: 'absolute',
    right: 0,
  },
  changePasswordButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  changePasswordText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});