import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  I18nManager,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS } from '../constants/theme';
import i18n from '../src/localization/i18n';

import { auth } from '../src/config/firebase';
import { apiRequest } from '../src/api/api';


export default function SparePartDetailsScreen({
  route,
  navigation,
}) {

  const { part } = route.params;

  const [loading, setLoading] =
    useState(false);

  const [modalVisible, setModalVisible] =
    useState(false);

  const [quantity, setQuantity] =
    useState("1");

  const [note, setNote] =
    useState("");


  const handleOrder = async () => {

    if (!quantity || Number(quantity) <= 0) {

      Alert.alert(
        "Error",
        "Please enter a valid quantity"
      );

      return;
    }

    try {

      setLoading(true);

      const user =
        auth.currentUser;

      if (!user) {

        Alert.alert(
          "Error",
          "Please login first"
        );

        return;
      }

      const token =
        await user.getIdToken();


      const orderData = {

        partName:
          part.name,

        quantity:
          Number(quantity),

        note:
          note.trim(),

        status:
          "pending",
      };


      console.log(
        "📤 Sending order:",
        orderData
      );


      await apiRequest(
        "/spare-part-orders",
        "POST",
        orderData,
        token
      );


      setModalVisible(false);

      Alert.alert(
        "Success",
        "Order placed successfully"
      );


      navigation.goBack();


    } catch (error) {

      console.log(
        "Order error:",
        error
      );

      Alert.alert(
        "Error",
        error.message
      );

    } finally {

      setLoading(false);
    }
  };


  return (
    <>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* Header */}
        <LinearGradient
          colors={[
            COLORS.primary,
            COLORS.secondary,
          ]}
          style={styles.header}
        >

          <TouchableOpacity
            onPress={() =>
              navigation.goBack()
            }
          >

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
            {i18n.t('sparePartDetails')}
          </Text>

        </LinearGradient>



        {/* Content */}
        <View style={styles.card}>

          <Ionicons
            name="construct"
            size={70}
            color={COLORS.primary}
          />

          <Text style={styles.partName}>
            {part.name}
          </Text>

          <Text style={styles.partPrice}>
            {'$'+part.price}
          </Text>

          <Text style={styles.description}>
            {
              part.description ||
              i18n.t(
                'sparePartDescription'
              )
            }
          </Text>


          <View style={styles.infoRow}>

            <Ionicons
              name="checkmark-circle"
              size={20}
              color={COLORS.primary}
            />

            <Text style={styles.infoText}>
              {
                i18n.t(
                  'originalQuality'
                )
              }
            </Text>

          </View>


          <View style={styles.infoRow}>

            <Ionicons
              name="time"
              size={20}
              color={COLORS.primary}
            />

            <Text style={styles.infoText}>
              {
                i18n.t(
                  'availableImmediately'
                )
              }
            </Text>

          </View>



          {/* ORDER BUTTON */}
          <TouchableOpacity
            style={styles.buyButton}
            onPress={() =>
              setModalVisible(true)
            }
          >

            <Ionicons
              name="cart"
              size={22}
              color={COLORS.white}
            />

            <Text style={styles.buyText}>
              {
                i18n.t(
                  'requestThisPart'
                )
              }
            </Text>

          </TouchableOpacity>

        </View>

      </ScrollView>



      {/* MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalBox}>

            <Text style={styles.modalTitle}>
              Confirm Order
            </Text>


            {/* Quantity */}
            <Text style={styles.label}>
              Quantity *
            </Text>

            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              style={styles.input}
              placeholder="Enter quantity"
            />


            {/* Note */}
            <Text style={styles.label}>
              Note (Optional)
            </Text>

            <TextInput
              value={note}
              onChangeText={setNote}
              style={styles.input}
              placeholder="Any note..."
              multiline
            />


            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleOrder}
              disabled={loading}
            >

              {
                loading
                  ? (
                    <ActivityIndicator
                      color="#fff"
                    />
                  )
                  : (
                    <Text style={styles.confirmText}>
                      Confirm Order
                    </Text>
                  )
              }

            </TouchableOpacity>


            <TouchableOpacity
              onPress={() =>
                setModalVisible(false)
              }
            >

              <Text style={styles.cancelText}>
                Cancel
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>
    </>
  );
}



const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        COLORS.background,
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
      color:
        COLORS.white,
      marginTop: 15,
    },

    card: {
      backgroundColor:
        COLORS.white,
      margin: 20,
      padding: 25,
      borderRadius: 20,
      alignItems: 'center',
      elevation: 4,
    },

    partName: {
      fontSize: 22,
      fontWeight: 'bold',
      marginTop: 15,
      color:
        COLORS.textDark,
    },

    partPrice: {
      fontSize: 18,
      color:
        COLORS.primary,
      marginVertical: 10,
    },

    description: {
      textAlign: 'center',
      color:
        COLORS.textLight,
      marginVertical: 15,
      lineHeight: 22,
    },

    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },

    infoText: {
      marginLeft: 8,
      color:
        COLORS.textDark,
    },

    buyButton: {
      marginTop: 25,
      backgroundColor:
        COLORS.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 30,
      borderRadius: 14,
      minWidth: 220,
    },

    buyText: {
      color:
        COLORS.white,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.4)",
      justifyContent: 'center',
      padding: 20,
    },

    modalBox: {
      backgroundColor:
        COLORS.white,
      borderRadius: 20,
      padding: 20,
    },

    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      color:
        COLORS.textDark,
    },

    label: {
      marginBottom: 8,
      marginTop: 12,
      color:
        COLORS.textDark,
    },

    input: {
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 12,
      padding: 12,
    },

    confirmButton: {
      backgroundColor:
        COLORS.primary,
      marginTop: 25,
      borderRadius: 12,
      padding: 15,
      alignItems: 'center',
    },

    confirmText: {
      color:
        COLORS.white,
      fontWeight: 'bold',
      fontSize: 16,
    },

    cancelText: {
      textAlign: 'center',
      marginTop: 15,
      color: "gray",
    },

  });