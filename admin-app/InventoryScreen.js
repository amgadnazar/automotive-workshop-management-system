import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  I18nManager,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ADMIN_COLORS } from '../constants/adminTheme';
import i18n from '../src/localization/i18n';
import { apiRequest } from '../src/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOW_STOCK_THRESHOLD = 10;

export default function InventoryScreen({ navigation }) {

  const isRTL = I18nManager.isRTL;

  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);

  const [partName, setPartName] = useState('');
  const [partQuantity, setPartQuantity] = useState('');
  const [partPrice, setPartPrice] = useState('');
  const [partDescription, setPartDescription] = useState('');

 
  
  const fetchSpareParts = async () => {
    try {

      const token = await AsyncStorage.getItem('userToken');

      const data = await apiRequest(
        '/spare-parts',
        'GET',
        null,
        token
      );

      setSpareParts(data || []);

    } catch (error) {

      console.log('Error fetching spare parts:', error);

      Alert.alert(
        i18n.t('common.error'),
        'Failed to load spare parts'
      );

    } finally {

      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSpareParts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSpareParts();
  }, []);

  
  
  const deletePart = async (id, name) => {

    Alert.alert(
      i18n.t('spareParts.deleteTitle'),
      `${i18n.t('spareParts.deleteConfirm')} "${name}"؟`,
      [
        {
          text: i18n.t('common.cancel'),
          style: 'cancel'
        },

        {
          text: i18n.t('common.delete'),
          style: 'destructive',

          onPress: async () => {

            try {

              const token = await AsyncStorage.getItem('userToken');

              await apiRequest(
                `/spare-parts/${id}`,
                'DELETE',
                null,
                token
              );

              fetchSpareParts();

              Alert.alert(
                i18n.t('common.success'),
                isRTL
                  ? 'تم حذف القطعة بنجاح'
                  : 'Part deleted successfully'
              );

            } catch (error) {

              console.log('Error deleting part:', error);

              Alert.alert(
                i18n.t('common.error'),
                isRTL
                  ? 'فشل حذف القطعة'
                  : 'Failed to delete part'
              );
            }
          },
        },
      ]
    );
  };


  
  const openAddModal = () => {

    setIsEditing(false);

    setSelectedPart(null);

    setPartName('');
    setPartQuantity('');
    setPartPrice('');
    setPartDescription('');

    setModalVisible(true);
  };

 
  
  const openEditModal = (part) => {

    setIsEditing(true);

    setSelectedPart(part);

    setPartName(part.name || '');
    setPartQuantity(part.quantity?.toString() || '');
    setPartPrice(part.price?.toString() || '');
    setPartDescription(part.description || '');

    setModalVisible(true);
  };


  
  const savePart = async () => {

    if (!partName.trim()) {

      Alert.alert(
        i18n.t('common.error'),
        isRTL
          ? 'اسم القطعة مطلوب'
          : 'Part name is required'
      );

      return;
    }

    if (!partQuantity || parseInt(partQuantity) < 0) {

      Alert.alert(
        i18n.t('common.error'),
        isRTL
          ? 'الكمية غير صحيحة'
          : 'Valid quantity is required'
      );

      return;
    }

    if (!partPrice || parseFloat(partPrice) < 0) {

      Alert.alert(
        i18n.t('common.error'),
        isRTL
          ? 'السعر غير صحيح'
          : 'Valid price is required'
      );

      return;
    }

    try {

      const token = await AsyncStorage.getItem('userToken');

      const data = {
        name: partName.trim(),
        quantity: parseInt(partQuantity),
        price: parseFloat(partPrice),
        description: partDescription.trim(),
      };

      if (isEditing && selectedPart) {

        await apiRequest(
          `/spare-parts/${selectedPart.id}`,
          'PUT',
          data,
          token
        );

        Alert.alert(
          i18n.t('common.success'),
          isRTL
            ? 'تم تحديث القطعة بنجاح'
            : 'Part updated successfully'
        );

      } else {

        await apiRequest(
          '/spare-parts',
          'POST',
          data,
          token
        );

        Alert.alert(
          i18n.t('common.success'),
          isRTL
            ? 'تمت إضافة القطعة بنجاح'
            : 'Part added successfully'
        );
      }

      setModalVisible(false);

      fetchSpareParts();

    } catch (error) {

      console.log('Error saving part:', error);

      Alert.alert(
        i18n.t('common.error'),
        isRTL
          ? 'فشل حفظ القطعة'
          : 'Failed to save part'
      );
    }
  };

  
  
  const getInventoryStats = () => {

    const totalParts = spareParts.length;

    const totalQuantity =
      spareParts.reduce(
        (sum, part) => sum + (part.quantity || 0),
        0
      );

    const lowStockParts =
      spareParts.filter(
        part =>
          (part.quantity || 0) <= LOW_STOCK_THRESHOLD &&
          (part.quantity || 0) > 0
      );

    const outOfStockParts =
      spareParts.filter(
        part => (part.quantity || 0) === 0
      );

    return {
      totalParts,
      totalQuantity,
      lowStockParts,
      outOfStockParts
    };
  };

  const stats = getInventoryStats();


  
  const renderSparePart = ({ item }) => {

    const quantity = item.quantity || 0;

    const isLowStock =
      quantity <= LOW_STOCK_THRESHOLD &&
      quantity > 0;

    const isOutOfStock = quantity === 0;

    let stockStatusText = '';

    if (isOutOfStock) {

      stockStatusText = isRTL
        ? 'نفدت الكمية'
        : 'Out of Stock';

    } else if (isLowStock) {

      stockStatusText = isRTL
        ? `⚠️ متبقي ${quantity} فقط`
        : `⚠️ Only ${quantity} left`;
    }

    return (

      <View
        style={[
          styles.partCard,
          isLowStock && styles.lowStockCard,
          isOutOfStock && styles.outOfStockCard,

          isRTL && isLowStock && {
            borderLeftWidth: 0,
            borderRightWidth: 4,
            borderRightColor: '#f59e0b',
          },

          isRTL && isOutOfStock && {
            borderLeftWidth: 0,
            borderRightWidth: 4,
            borderRightColor: '#ef4444',
          },
        ]}
      >

        <View style={styles.partInfo}>

          <Text
            style={[
              styles.partName,
              { textAlign: isRTL ? 'right' : 'left' }
            ]}
          >
            {item.name}
          </Text>

          <Text
            style={[
              styles.partDescription,
              { textAlign: isRTL ? 'right' : 'left' }
            ]}
            numberOfLines={1}
          >
            {item.description ||
              (isRTL
                ? 'لا يوجد وصف'
                : 'No description')}
          </Text>

          <View
            style={[
              styles.partDetails,
              {
                flexDirection: isRTL ? 'row-reverse' : 'row',
              }
            ]}
          >

            <View
              style={[
                styles.stockInfo,
                {
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                }
              ]}
            >

              <Ionicons
                name="cube-outline"
                size={16}
                color={ADMIN_COLORS.textLight}
              />

              <Text
                style={[
                  styles.partQuantity,
                  (isLowStock || isOutOfStock) &&
                  styles.lowStockText
                ]}
              >
                {quantity}{' '}
                {isRTL
                  ? 'قطعة'
                  : quantity === 1
                  ? 'piece'
                  : 'pieces'}
              </Text>

            </View>

            <View
              style={[
                styles.priceInfo,
                {
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                }
              ]}
            >

              <Ionicons
                name="cash-outline"
                size={16}
                color={ADMIN_COLORS.textLight}
              />

              <Text style={styles.partPrice}>
                ${item.price?.toFixed(2) || '0.00'}
              </Text>

            </View>

          </View>

          {stockStatusText !== '' && (

            <Text
              style={[
                styles.stockWarning,
                isOutOfStock &&
                styles.outOfStockWarning,
                {
                  textAlign: isRTL ? 'right' : 'left'
                }
              ]}
            >
              {stockStatusText}
            </Text>
          )}

        </View>

        <View
          style={[
            styles.partActions,
            {
              flexDirection: isRTL ? 'row-reverse' : 'row'
            }
          ]}
        >

          <TouchableOpacity
            onPress={() => openEditModal(item)}
            style={styles.editButton}
          >
            <Ionicons
              name="create-outline"
              size={22}
              color={ADMIN_COLORS.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              deletePart(item.id, item.name)
            }
            style={styles.deleteButton}
          >
            <Ionicons
              name="trash-outline"
              size={22}
              color="#ef4444"
            />
          </TouchableOpacity>

        </View>

      </View>
    );
  };

  
  
  if (loading) {

    return (

      <View style={styles.centerContainer}>

        <ActivityIndicator
          size="large"
          color={ADMIN_COLORS.primary}
        />

      </View>
    );
  }

  return (

    <View style={styles.container}>

      <LinearGradient
        colors={[
          ADMIN_COLORS.primary,
          ADMIN_COLORS.secondary
        ]}
        style={styles.header}
      >

        <Text style={styles.title}>
          {i18n.t('adminTabs.Inventory')}
        </Text>

      </LinearGradient>

  {/* STATS */}
<View style={styles.statsContainer}>

  <View style={styles.statCard}>
    <Text style={styles.statNumber}>
      {stats.totalParts}
    </Text>

    <Text style={styles.statLabel}>
      {i18n.t('inventory.totalItems')}
    </Text>
  </View>

  <View style={styles.statCard}>
    <Text style={styles.statNumber}>
      {stats.totalQuantity}
    </Text>

    <Text style={styles.statLabel}>
      {i18n.t('inventory.totalQuantity')}
    </Text>
  </View>

  <View
    style={[
      styles.statCard,
      stats.lowStockParts.length > 0 &&
      styles.warningStat
    ]}
  >

    <Text
      style={[
        styles.statNumber,
        stats.lowStockParts.length > 0 &&
        styles.warningText
      ]}
    >
      {stats.lowStockParts.length}
    </Text>

    <Text style={styles.statLabel}>
      {i18n.t('inventory.lowStock')}
    </Text>

  </View>

  <View
    style={[
      styles.statCard,
      stats.outOfStockParts.length > 0 &&
      styles.dangerStat
    ]}
  >

    <Text
      style={[
        styles.statNumber,
        stats.outOfStockParts.length > 0 &&
        styles.dangerText
      ]}
    >
      {stats.outOfStockParts.length}
    </Text>

    <Text style={styles.statLabel}>
      {i18n.t('inventory.outOfStock')}
    </Text>

  </View>

</View>

      {/* ADD BUTTON */}
      <TouchableOpacity
        style={[
          styles.addButton,
          {
            flexDirection: isRTL ? 'row-reverse' : 'row'
          }
        ]}
        onPress={openAddModal}
      >

        <Ionicons
          name="add-circle"
          size={24}
          color="black"
        />

        <Text
          style={[
            styles.addButtonText,
            { color: 'black' }
          ]}
        >
          {i18n.t('addSparePart.addButton')}
        </Text>

      </TouchableOpacity>

      {/* LIST */}
      <FlatList
        data={spareParts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSparePart}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={

          <View style={styles.emptyContainer}>

            <Ionicons
              name="cube-outline"
              size={64}
              color={ADMIN_COLORS.textLight}
            />

            <Text style={styles.emptyText}>
              {isRTL
                ? 'لا توجد قطع غيار'
                : 'No spare parts found'}
            </Text>

            <Text style={styles.emptySubText}>
              {isRTL
                ? 'اضغط + لإضافة قطعة جديدة'
                : 'Tap "+" to add your first part'}
            </Text>

          </View>
        }
      />

      {/* MODAL */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() =>
          setModalVisible(false)
        }
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalContent}>

            <View
              style={[
                styles.modalHeader,
                {
                  flexDirection: isRTL ? 'row-reverse' : 'row'
                }
              ]}
            >

              <Text style={styles.modalTitle}>
                {isEditing
                  ? i18n.t('editSparePart.title')
                  : i18n.t('addSparePart.title')}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setModalVisible(false)
                }
              >

                <Ionicons
                  name="close"
                  size={24}
                  color={ADMIN_COLORS.textDark}
                />

              </TouchableOpacity>

            </View>

            <Text style={styles.inputLabel}>
              {i18n.t('addSparePart.name')} *
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  textAlign: isRTL ? 'right' : 'left'
                }
              ]}
              value={partName}
              onChangeText={setPartName}
              placeholder={i18n.t('addSparePart.namePlaceholder')}
              placeholderTextColor={ADMIN_COLORS.textLight}
            />

            <Text style={styles.inputLabel}>
              {i18n.t('addSparePart.quantity')} *
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  textAlign: isRTL ? 'right' : 'left'
                }
              ]}
              value={partQuantity}
              onChangeText={setPartQuantity}
              keyboardType="numeric"
              placeholder={i18n.t('addSparePart.quantityPlaceholder')}
              placeholderTextColor={ADMIN_COLORS.textLight}
            />

            <Text style={styles.inputLabel}>
              {i18n.t('addSparePart.price')} *
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  textAlign: isRTL ? 'right' : 'left'
                }
              ]}
              value={partPrice}
              onChangeText={setPartPrice}
              keyboardType="numeric"
              placeholder={i18n.t('addSparePart.pricePlaceholder')}
              placeholderTextColor={ADMIN_COLORS.textLight}
            />

            <Text style={styles.inputLabel}>
              {i18n.t('addSparePart.description')}
            </Text>

            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  textAlign: isRTL ? 'right' : 'left'
                }
              ]}
              value={partDescription}
              onChangeText={setPartDescription}
              placeholder={i18n.t('addSparePart.descriptionPlaceholder')}
              placeholderTextColor={ADMIN_COLORS.textLight}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={styles.saveModalButton}
              onPress={savePart}
            >

              <Text style={styles.saveModalText}>

                {isEditing
                  ? i18n.t('editSparePart.save')
                  : i18n.t('addSparePart.addButton')}

              </Text>

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
    backgroundColor: ADMIN_COLORS.background,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ADMIN_COLORS.background,
  },

  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: 'center',
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: ADMIN_COLORS.white,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: ADMIN_COLORS.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  warningStat: {
    backgroundColor: '#fef3c7',
  },

  dangerStat: {
    backgroundColor: '#fee2e2',
  },

  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ADMIN_COLORS.textDark,
  },

  warningText: {
    color: '#d97706',
  },

  dangerText: {
    color: '#ef4444',
  },

  statLabel: {
    fontSize: 12,
    color: ADMIN_COLORS.textLight,
    marginTop: 4,
    textAlign: 'center',
  },

  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ADMIN_COLORS.primary,
    margin: 16,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },

  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  partCard: {
    backgroundColor: ADMIN_COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  lowStockCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },

  outOfStockCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    opacity: 0.8,
  },

  partInfo: {
    flex: 1,
  },

  partName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ADMIN_COLORS.textDark,
  },

  partDescription: {
    fontSize: 13,
    color: ADMIN_COLORS.textLight,
    marginTop: 2,
  },

  partDetails: {
    marginTop: 8,
    gap: 16,
  },

  stockInfo: {
    alignItems: 'center',
    gap: 4,
  },

  priceInfo: {
    alignItems: 'center',
    gap: 4,
  },

  partQuantity: {
    fontSize: 14,
    color: ADMIN_COLORS.textDark,
  },

  lowStockText: {
    color: '#d97706',
    fontWeight: '600',
  },

  partPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: ADMIN_COLORS.primary,
  },

  stockWarning: {
    fontSize: 12,
    color: '#d97706',
    marginTop: 6,
  },

  outOfStockWarning: {
    color: '#ef4444',
  },

  partActions: {
    gap: 12,
  },

  editButton: {
    padding: 8,
  },

  deleteButton: {
    padding: 8,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },

  emptyText: {
    fontSize: 18,
    color: ADMIN_COLORS.textLight,
    marginTop: 16,
  },

  emptySubText: {
    fontSize: 14,
    color: ADMIN_COLORS.textLight,
    marginTop: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },

  modalContent: {
    backgroundColor: ADMIN_COLORS.surface,
    borderRadius: 16,
    padding: 20,
  },

  modalHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ADMIN_COLORS.textDark,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: ADMIN_COLORS.textDark,
    marginBottom: 6,
    marginTop: 12,
  },

  input: {
    backgroundColor: ADMIN_COLORS.background,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: ADMIN_COLORS.textDark,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
  },

  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },

  saveModalButton: {
    backgroundColor: ADMIN_COLORS.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },

  saveModalText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },

});