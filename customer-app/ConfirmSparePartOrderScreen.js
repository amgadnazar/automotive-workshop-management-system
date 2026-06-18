import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  I18nManager,
  Alert,
  TextInput,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS } from '../constants/theme';

export default function ConfirmSparePartOrderScreen({
  route,
  navigation,
}) {
  const { part } = route.params;

  const [note, setNote] = useState('');

  const handleConfirm = () => {
    console.log("Customer note:", note);


    Alert.alert(
      "Success",
      "Spare part order created successfully"
    );

    navigation.goBack();
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name={
              I18nManager.isRTL
                ? 'arrow-forward'
                : 'arrow-back'
            }
            size={26}
            color={COLORS.white}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Confirm Spare Part Order
        </Text>
      </LinearGradient>

      {/* Content */}
      <View style={styles.card}>

  <View style={styles.topSection}>
    <Ionicons
      name="construct"
      size={70}
      color={COLORS.primary}
    />

    <Text style={styles.partName}>
      {part.name}
    </Text>

    <Text style={styles.price}>
      ${part.price}
    </Text>

    <Text style={styles.description}>
      {part.description || "No description"}
    </Text>

    <View style={styles.infoRow}>
      <Ionicons
        name="cube-outline"
        size={20}
        color={COLORS.primary}
      />

      <Text style={styles.infoText}>
        Stock: {part.stock}
      </Text>
    </View>
  </View>


  <View style={styles.noteContainer}>
    <Text style={styles.noteLabel}>
      Add a note
    </Text>

    <TextInput
      style={styles.noteInput}
      placeholder="Write anything for the admin..."
      placeholderTextColor={COLORS.textLight}
      value={note}
      onChangeText={setNote}
      multiline
      textAlignVertical="top"
    />
  </View>


  <TouchableOpacity
    style={styles.confirmButton}
    onPress={handleConfirm}
  >
    <Ionicons
      name="checkmark-circle"
      size={22}
      color={COLORS.white}
    />

    <Text style={styles.confirmText}>
      Confirm Order
    </Text>
  </TouchableOpacity>


      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
topSection: {
  alignItems: 'center',
},
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 15,
  },

  card: {
    backgroundColor: COLORS.white,
    margin: 20,
    
    padding: 25,
    borderRadius: 20,
    elevation: 4,
  },

  partName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 15,
    color: COLORS.textDark,
    textAlign: 'center',
  },

  price: {
    fontSize: 18,
    color: COLORS.primary,
    marginVertical: 10,
    textAlign: 'center',
  },

  description: {
    textAlign: 'center',
    color: COLORS.textLight,
    marginVertical: 15,
    lineHeight: 22,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'center',
  },

  infoText: {
    marginLeft: 8,
    color: COLORS.textDark,
  },

  noteContainer: {
    marginTop: 25,
  },

  noteLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 10,
  },

  noteInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 14,
    padding: 15,
    minHeight: 100,
    fontSize: 15,
    color: COLORS.textDark,
  },

  confirmButton: {
    marginTop: 30,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },

  confirmText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});