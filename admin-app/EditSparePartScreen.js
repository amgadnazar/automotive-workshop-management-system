import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ADMIN_COLORS } from '../constants/adminTheme';
import i18n from '../src/localization/i18n';
import { apiRequest } from '../src/api/api';

const isRTL = i18n.locale.startsWith('ar');

export default function EditSparePartScreen({
  route,
  navigation,
}) {
  const { part } = route.params;

  const [name, setName] = useState(part.name || '');

  const [price, setPrice] = useState(
    String(part.price || '')
  );

  const [quantity, setQuantity] = useState(
    String(
      part.quantity || part.stock || ''
    )
  );

  const [description, setDescription] =
    useState(
      part.description || ''
    );

  const [loading, setLoading] =
    useState(false);


  const handleSave = async () => {
    if (!name || !price || !quantity) {
      Alert.alert(
        "Error",
        "Please fill all required fields"
      );
      return;
    }

    try {
      setLoading(true);

      const token =
        await AsyncStorage.getItem(
          "userToken"
        );

      await apiRequest(
        `/spare-parts/${part.id}`,
        "PUT",
        {
          name,
          price: Number(price),
          quantity: Number(quantity), 
          description,
        },
        token
      );

      Alert.alert(
        "Success",
        "Spare part updated successfully"
      );

      navigation.goBack();

    } catch (error) {
      console.log(
        "Update error:",
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
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      <LinearGradient
        colors={[
          ADMIN_COLORS.primary,
          ADMIN_COLORS.secondary,
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
              isRTL
                ? "arrow-forward"
                : "arrow-back"
            }
            size={26}
            color={
              ADMIN_COLORS.white
            }
          />
        </TouchableOpacity>

        <Text
          style={
            styles.headerTitle
          }
        >
          Edit Spare Part
        </Text>

      </LinearGradient>


      <View style={styles.card}>

        <Text style={styles.label}>
          Name *
        </Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
        />


        <Text style={styles.label}>
          Price *
        </Text>

        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />


        <Text style={styles.label}>
          Quantity *
        </Text>

        <TextInput
          style={styles.input}
          value={quantity}
          onChangeText={
            setQuantity
          }
          keyboardType="numeric"
        />


        <Text style={styles.label}>
          Description
        </Text>

        <TextInput
          style={[
            styles.input,
            styles.textArea,
          ]}
          value={
            description
          }
          onChangeText={
            setDescription
          }
          multiline
        />


        <TouchableOpacity
          style={styles.button}
          onPress={
            handleSave
          }
          disabled={
            loading
          }
        >
          <Ionicons
            name="checkmark-circle"
            size={22}
            color="#000000"
          />

          <Text
            style={
              styles.buttonText
            }
          >
            {
              loading
                ? "Saving..."
                : "Save Changes"
            }
          </Text>

        </TouchableOpacity>

      </View>

    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      ADMIN_COLORS.background,
  },

  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerTitle: {
    color:
      ADMIN_COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 15,
  },

  card: {
    backgroundColor:
      ADMIN_COLORS.surface,
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },

  label: {
    fontSize: 15,
    marginTop: 12,
    marginBottom: 6,
    color:
      ADMIN_COLORS.textDark,
  },

  input: {
    backgroundColor:
      ADMIN_COLORS.surfaceLight,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color:
      ADMIN_COLORS.textDark,
  },

  textArea: {
    height: 100,
    textAlignVertical:
      'top',
  },

  button: {
    backgroundColor:
      ADMIN_COLORS.primary,
    marginTop: 25,
    padding: 15,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent:
      'center',
    alignItems:
      'center',
  },

  buttonText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});