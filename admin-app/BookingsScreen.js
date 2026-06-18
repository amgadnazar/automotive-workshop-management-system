import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  I18nManager,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ADMIN_COLORS } from '../constants/adminTheme';
import i18n from '../src/localization/i18n';
import { apiRequest } from '../src/api/api';

const isRTL = I18nManager.isRTL;

const TIME_SLOTS = ['09:00', '11:00', '13:00', '15:00', '17:00'];

export default function BookingsScreen() {

  const [bookings, setBookings] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [workshopName, setWorkshopName] = useState('Auto Workshop');
  const [loading, setLoading] = useState(true);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

 
  
  const fetchWorkshop = async () => {
    try {

      const token = await AsyncStorage.getItem('userToken');

      const data = await apiRequest(
        '/workshop',
        'GET',
        null,
        token
      );

      if (data?.name) {
        setWorkshopName(data.name);
      } else if (data?.location) {
        setWorkshopName(data.location);
      }

    } catch (err) {

      console.log('Error fetching workshop:', err);
    }
  };


  
  const fetchBookings = async () => {

    try {

      const token = await AsyncStorage.getItem('userToken');

      const data = await apiRequest(
        '/appointments',
        'GET',
        null,
        token
      );

      const processedBookings = (data || []).map((booking) => ({
        ...booking,
        workshopName:
          booking.workshopName || workshopName,
      }));

      setBookings(processedBookings);

    } catch (err) {

      console.log('Error fetching bookings:', err);
    }
  };

  
  
  const fetchEngineers = async () => {

    try {

      const token = await AsyncStorage.getItem('userToken');

      const data = await apiRequest(
        '/engineers',
        'GET',
        null,
        token
      );

      setEngineers(data || []);

    } catch (err) {

      console.log('Error fetching engineers:', err);
    }
  };

  
  
  useEffect(() => {

    const load = async () => {

      setLoading(true);

      await fetchWorkshop();
      await fetchBookings();
      await fetchEngineers();

      setLoading(false);
    };

    load();

  }, []);

 
  
  const updateBooking = async (id, updates) => {

    try {

      const token = await AsyncStorage.getItem('userToken');

      await apiRequest(
        `/appointments/${id}`,
        'PATCH',
        updates,
        token
      );

      await fetchBookings();

    } catch (err) {

      console.log('Update error:', err);
    }
  };

 
  
  const acceptBooking = async () => {

    if (!selectedEngineer || !selectedTime) {

      alert(
        isRTL
          ? 'الرجاء اختيار مهندس ووقت'
          : 'Please select engineer and time'
      );

      return;
    }

    await updateBooking(selectedBooking.id, {
      status: 'accepted',
      engineer: selectedEngineer.name,
      engineerId: selectedEngineer.id,
      time: selectedTime,
    });

    setModalVisible(false);
    setSelectedBooking(null);
    setSelectedEngineer(null);
    setSelectedTime(null);
  };

  
  
  const rejectBooking = async (id) => {

    await updateBooking(id, {
      status: 'rejected',
    });
  };


  
  const markNoShow = async (id) => {

    await updateBooking(id, {
      status: 'no-show',
    });
  };

  
  
  const getStatusColor = (status) => {

    switch (status) {

      case 'accepted':
        return '#22c55e';

      case 'no-show':
        return '#f59e0b';

      case 'rejected':
        return '#ef4444';

      default:
        return '#aaa';
    }
  };


  
  const getStatusText = (status) => {

    switch (status) {

      case 'accepted':
        return i18n.t('bookings.status.accepted');

      case 'no-show':
        return i18n.t('bookings.status.no-show');

      case 'rejected':
        return i18n.t('bookings.status.rejected');

      default:
        return i18n.t('bookings.status.pending');
    }
  };

  
  
  const renderItem = ({ item }) => (

    <View style={styles.card}>

      <View style={styles.cardContent}>

        <Text
          style={[
            styles.customer,
            { textAlign: isRTL ? 'right' : 'left' }
          ]}
        >
          {item.customerName || 'Customer'}
        </Text>

        <Text
          style={[
            styles.details,
            { textAlign: isRTL ? 'right' : 'left' }
          ]}
        >
          {item.serviceName}
        </Text>

        <Text
          style={[
            styles.workshopName,
            { textAlign: isRTL ? 'right' : 'left' }
          ]}
        >
          {workshopName}
        </Text>

        <Text
          style={[
            styles.details,
            { textAlign: isRTL ? 'right' : 'left' }
          ]}
        >
          {item.date} • {item.time}
        </Text>

        {item.status && (

          <Text
            style={[
              styles.status,
              {
                color: getStatusColor(item.status),
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {getStatusText(item.status)}

            {item.engineer
              ? ` • ${item.engineer}`
              : ''}
          </Text>
        )}

      </View>

      <View
        style={[
          styles.actions,
          {
            marginLeft: isRTL ? 0 : 12,
            marginRight: isRTL ? 12 : 0,
          }
        ]}
      >

        {item.status === 'pending' && (
          <>

            <TouchableOpacity
              onPress={() => {
                setSelectedBooking(item);
                setModalVisible(true);
              }}
            >
              <Ionicons
                name="checkmark-circle"
                size={28}
                color="#22c55e"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => rejectBooking(item.id)}
            >
              <Ionicons
                name="close-circle"
                size={28}
                color="#ef4444"
              />
            </TouchableOpacity>

          </>
        )}

        {item.status === 'accepted' && (

          <TouchableOpacity
            onPress={() => markNoShow(item.id)}
          >
            <Ionicons
              name="alert-circle"
              size={28}
              color="#f59e0b"
            />
          </TouchableOpacity>
        )}

      </View>

    </View>
  );

 
  
  if (loading) {

    return (

      <View style={styles.center}>

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

        <Text
          style={[
            styles.title,
            {
              textAlign: isRTL ? 'right' : 'left',
            }
          ]}
        >
          {i18n.t('bookings.title')}
        </Text>

      </LinearGradient>

      {/* BOOKINGS LIST */}
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={renderItem}
        ListEmptyComponent={

          <View style={styles.emptyContainer}>

            <Ionicons
              name="calendar-outline"
              size={70}
              color={ADMIN_COLORS.textLight}
            />

            <Text style={styles.emptyText}>
              {isRTL
                ? 'لا توجد طلبات حجز'
                : 'No booking requests'}
            </Text>

          </View>
        }
      />

      {/* MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalCard}>

            <Text
              style={[
                styles.modalTitle,
                {
                  textAlign: isRTL ? 'right' : 'left',
                }
              ]}
            >
              {i18n.t('bookings.assignEngineer')}
            </Text>

            {engineers.length === 0 ? (

              <Text style={styles.noEngineers}>
                {isRTL
                  ? 'لا يوجد مهندسين'
                  : 'No engineers available'}
              </Text>

            ) : (

              engineers.map((eng) => (

                <TouchableOpacity
                  key={eng.id}
                  style={[
                    styles.engineerItem,
                    selectedEngineer?.id === eng.id &&
                    styles.selected
                  ]}
                  onPress={() =>
                    setSelectedEngineer(eng)
                  }
                >

                  <Text
                    style={[
                      styles.engineerName,
                      {
                        textAlign:
                          isRTL ? 'right' : 'left',
                      }
                    ]}
                  >
                    {eng.name}
                  </Text>

                </TouchableOpacity>
              ))
            )}

            <Text
              style={[
                styles.modalTitle,
                {
                  textAlign: isRTL ? 'right' : 'left',
                }
              ]}
            >
              {i18n.t('bookings.selectTime')}
            </Text>

            {TIME_SLOTS.map((time) => (

              <TouchableOpacity
                key={time}
                style={[
                  styles.engineerItem,
                  selectedTime === time &&
                  styles.selected
                ]}
                onPress={() => setSelectedTime(time)}
              >

                <Text style={styles.engineerName}>
                  {time}
                </Text>

              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={acceptBooking}
              style={styles.confirmBtn}
            >

              <Text style={styles.confirmText}>
                {i18n.t('bookings.confirm')}
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                setModalVisible(false)
              }
              style={styles.cancelBtn}
            >

              <Text style={styles.cancelText}>
                {i18n.t('bookings.cancel')}
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

  header: {
    paddingTop: 60,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },

  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: ADMIN_COLORS.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,

    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },

  cardContent: {
    flex: 1,
  },

  customer: {
    fontSize: 17,
    fontWeight: 'bold',
    color: ADMIN_COLORS.textDark,
  },

  details: {
    fontSize: 14,
    color: ADMIN_COLORS.textLight,
    marginTop: 4,
  },

  workshopName: {
    fontSize: 14,
    color: ADMIN_COLORS.primary,
    marginTop: 4,
    fontWeight: '700',
  },

  status: {
    marginTop: 8,
    fontWeight: '700',
    fontSize: 13,
  },

  actions: {
    justifyContent: 'center',
    gap: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },

  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 10,
    color: '#333',
  },

  engineerItem: {
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  engineerName: {
    fontSize: 15,
    color: '#333',
  },

  selected: {
    backgroundColor: '#e0e7ff',
    borderRadius: 10,
  },

  confirmBtn: {
    backgroundColor: ADMIN_COLORS.primary,
    padding: 14,
    borderRadius: 14,
    marginTop: 18,
    alignItems: 'center',
  },

  confirmText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
  },

  cancelBtn: {
    marginTop: 14,
    alignItems: 'center',
  },

  cancelText: {
    color: '#999',
    fontSize: 15,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyContainer: {
    alignItems: 'center',
    marginTop: 70,
  },

  emptyText: {
    marginTop: 12,
    color: ADMIN_COLORS.textLight,
    fontSize: 16,
  },

  noEngineers: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 10,
  },

});