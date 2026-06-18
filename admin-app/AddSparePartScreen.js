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
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_COLORS } from '../constants/adminTheme';
import i18n from '../src/localization/i18n';

import { db } from '../src/config/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function AddSparePartScreen({ navigation }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');

  const handleAddPart = async () => {
    if (!name || !price || !quantity) {
      Alert.alert(
        i18n.t('common.error'),
        i18n.t('addSparePart.fillRequired')
      );
      return;
    }

    try {
      await addDoc(collection(db, 'spare_parts'), {
        name,
        price: Number(price),
        stock: Number(quantity),
        description: description || '',
        createdAt: new Date(),
      });

      Alert.alert(
        i18n.t('common.success'),
        i18n.t('addSparePart.success')
      );

      navigation.goBack();
    } catch (e) {
      console.log('Error adding part:', e);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={ADMIN_COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {i18n.t('addSparePart.title')}
        </Text>
      </View>

      {/* Form */}
      <View style={styles.card}>
        <Text style={styles.label}>
          {i18n.t('addSparePart.name')} *
        </Text>
        <TextInput
          style={styles.input}
          placeholder={i18n.t('addSparePart.namePlaceholder')}
          placeholderTextColor={ADMIN_COLORS.textLight}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>
          {i18n.t('addSparePart.price')} *
        </Text>
        <TextInput
          style={styles.input}
          placeholder={i18n.t('addSparePart.pricePlaceholder')}
          placeholderTextColor={ADMIN_COLORS.textLight}
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.label}>
          {i18n.t('addSparePart.quantity')} *
        </Text>
        <TextInput
          style={styles.input}
          placeholder={i18n.t('addSparePart.quantityPlaceholder')}
          placeholderTextColor={ADMIN_COLORS.textLight}
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
        />

        <Text style={styles.label}>
          {i18n.t('addSparePart.description')}
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={i18n.t('addSparePart.descriptionPlaceholder')}
          placeholderTextColor={ADMIN_COLORS.textLight}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity style={styles.button} onPress={handleAddPart}>
          <Ionicons name="add-circle" size={22} color="#000000" />
          <Text style={styles.buttonText}>
            {i18n.t('addSparePart.addButton')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ADMIN_COLORS.background,
  },
  header: {
    backgroundColor: ADMIN_COLORS.primary,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: ADMIN_COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  card: {
    backgroundColor: ADMIN_COLORS.surface,
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  label: {
    color: ADMIN_COLORS.textDark,
    fontSize: 15,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: ADMIN_COLORS.surfaceLight,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: ADMIN_COLORS.textDark,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: ADMIN_COLORS.primary,
    marginTop: 25,
    padding: 15,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});