import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  I18nManager,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';
import i18n from '../src/localization/i18n';

import { apiRequest } from '../src/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SparePartsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadParts = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");

        const data = await apiRequest(
          "/spare-parts",
          "GET",
          null,
          token
        );

        setParts(data);

      } catch (error) {
        console.log("Error loading spare parts:", error.message);
      } finally {
        setLoading(false);
      }
    };

    loadParts();
  }, []);

  const filteredParts = parts.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>
            {i18n.t('spareParts.title')}
          </Text>
        </LinearGradient>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>
          {i18n.t('spareParts.title')}
        </Text>
      </LinearGradient>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={COLORS.textLight} />
        <TextInput
          placeholder={i18n.t('spareParts.search')}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          textAlign={I18nManager.isRTL ? 'right' : 'left'}
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredParts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('SparePartDetails', { part: item })
            }
          >
            <Ionicons name="construct" size={26} color={COLORS.primary} />
            <View style={styles.cardText}>
              <Text style={styles.partName}>
                {item.name}
              </Text>
              <Text style={styles.partPrice}>
                ${item.price}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {i18n.t('spareParts.empty')}
          </Text>
        }
      />

      {/* Order Button */}
      <TouchableOpacity
        style={styles.orderButton}
        onPress={() => navigation.navigate('OrderSparePart')}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.gradientButton}
        >
          <Ionicons name="cart-outline" size={22} color="#fff" />
          <Text style={styles.orderText}>
            {i18n.t('spareParts.order')}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 35,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: 20,
    padding: 14,
    borderRadius: 14,
    elevation: 4,
  },
  searchInput: {
    marginStart: 10,
    fontSize: 16,
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 18,
    borderRadius: 16,
    elevation: 3,
  },
  cardText: {
    marginStart: 15,
  },
  partName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  partPrice: {
    marginTop: 4,
    fontSize: 14,
    color: COLORS.primary,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
    color: COLORS.textLight,
  },
  orderButton: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  orderText: {
    color: '#fff',
    fontSize: 16,
    marginStart: 8,
    fontWeight: '600',
  }, 
});