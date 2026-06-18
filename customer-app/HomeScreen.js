import React, {
  useEffect,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  LinearGradient,
} from 'expo-linear-gradient';

import {
  COLORS,
} from '../constants/theme';

import i18n from '../src/localization/i18n';

import {
  apiRequest,
} from '../src/api/api';

export default function HomeScreen({
  navigation,
}) {

  const [
    services,
    setServices,
  ] = useState([]);

  const [
    promotions,
    setPromotions,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {

    const loadData =
      async () => {

      try {

        const token =
          await AsyncStorage.getItem(
            "userToken"
          );

        const servicesData =
          await apiRequest(
            '/services',
            'GET',
            null,
            token
          );

        const promotionsData =
          await apiRequest(
            '/promotions',
            'GET',
            null,
            token
          );

        setServices(
          servicesData
        );

        setPromotions(
          promotionsData
        );

      } catch (error) {

        console.log(
          'Error loading data:',
          error
        );

      } finally {

        setLoading(false);
      }
    };

    loadData();

  }, []);

  if (loading) {

    return (
      <View style={styles.loader}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />
      </View>
    );
  }

  return (

    <FlatList

      data={services}

      keyExtractor={(item) =>
        item.id
      }

      numColumns={3}

      showsVerticalScrollIndicator={false}

     

      ListHeaderComponent={
        <>

          {/* HEADER */}
          <LinearGradient
            colors={[
              COLORS.primary,
              COLORS.secondary,
            ]}
            style={styles.header}
          >

            <View
              style={styles.headerRow}
            >

              <Text
                style={styles.title}
              >
                {i18n.t(
                  'home.appTitle'
                )}
              </Text>

              {/* NOTIFICATIONS */}
              <TouchableOpacity
                style={
                  styles.notificationButton
                }

                onPress={() =>
                  navigation.navigate(
                    'Notifications'
                  )
                }
              >
                <Ionicons
                  name="notifications-outline"
                  size={28}
                  color={COLORS.white}
                />
              </TouchableOpacity>

            </View>

          </LinearGradient>

          {/* QUICK ACTIONS */}
          <View
            style={
              styles.quickActions
            }
          >

            <TouchableOpacity
              style={
                styles.actionButton
              }

              onPress={() =>
                navigation.navigate(
                  'Booking'
                )
              }
            >

              <Ionicons
                name="calendar"
                size={24}
                color={COLORS.white}
              />

              <Text
                style={
                  styles.actionText
                }
              >
                {i18n.t(
                  'home.bookNow'
                )}
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.actionButton
              }

              onPress={() =>
                navigation.navigate(
                  'About'
                )
              }
            >

              <Ionicons
                name="information-circle"
                size={24}
                color={COLORS.white}
              />

              <Text
                style={
                  styles.actionText
                }
              >
                {i18n.t(
                  'home.aboutUs'
                )}
              </Text>

            </TouchableOpacity>

          </View>

          {/* PROMOTIONS */}
          <Text
            style={
              styles.sectionTitle
            }
          >
            {i18n.t(
              'home.promotions'
            )}
          </Text>

          <FlatList

            data={promotions}

            horizontal

            showsHorizontalScrollIndicator={false}

            keyExtractor={(item) =>
              item.id
            }

            renderItem={({ item }) => (

              <View
                style={
                  styles.promoCard
                }
              >

                <Ionicons
                  name={
                    item.icon ||
                    'pricetag'
                  }
                  size={32}
                  color={COLORS.white}
                />

                <Text
                  style={
                    styles.promoTitle
                  }
                >
                  {item.title}
                </Text>

                <Text
                  style={
                    styles.promoDesc
                  }
                >
                  {item.description}
                </Text>

              </View>
            )}

            contentContainerStyle={{
              paddingHorizontal: 15,
            }}
          />

          {/* SERVICES TITLE */}
          <Text
            style={
              styles.sectionTitle
            }
          >
            {i18n.t(
              'home.availableServices'
            )}
          </Text>

        </>
      }

     

      columnWrapperStyle={{

        justifyContent:
          'space-between',

        paddingHorizontal: 10,
      }}

      renderItem={({ item }) => (

        <TouchableOpacity

          style={
            styles.gridCard
          }

          onPress={() =>

            navigation.navigate(
              'ServiceDetails',
              {
                service: {

                  ...item,

                  title:
                    item.name,

                  description:
                    item.description,

                  duration:
                    item.duration,
                },
              }
            )
          }
        >

          <Ionicons
            name="construct"
            size={32}
            color={COLORS.primary}
          />

          <Text
            style={
              styles.cardTitle
            }
          >
            {item.name}
          </Text>

          <Text
            style={
              styles.cardPrice
            }
          >
            ${item.price}
          </Text>

        </TouchableOpacity>
      )}

      contentContainerStyle={{
        paddingBottom: 30,
      }}
    />
  );
}



const styles =
  StyleSheet.create({

    loader: {
      flex: 1,
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    header: {
      paddingTop: 60,
      paddingBottom: 40,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 25,
      borderBottomRightRadius: 25,
    },

    headerRow: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
    },

    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: COLORS.white,
    },

    notificationButton: {
      padding: 6,
    },

    quickActions: {
      flexDirection: 'row',
      justifyContent:
        'space-around',
      marginVertical: 20,
    },

    actionButton: {
      backgroundColor:
        COLORS.primary,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 12,
    },

    actionText: {
      color: COLORS.white,
      marginLeft: 8,
      fontSize: 16,
    },

    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      marginLeft: 20,
      marginVertical: 10,
      color: COLORS.textDark,
    },

    /* GRID */
    gridCard: {
      backgroundColor:
        COLORS.white,
      flex: 1,
      margin: 5,
      padding: 15,
      borderRadius: 16,
      alignItems: 'center',
      elevation: 4,
    },

    cardTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      marginTop: 8,
      textAlign: 'center',
    },

    cardPrice: {
      fontSize: 14,
      color:
        COLORS.textLight,
      marginTop: 5,
    },

    promoCard: {
      backgroundColor:
        COLORS.primary,
      width: 220,
      padding: 20,
      marginRight: 15,
      borderRadius: 16,
    },

    promoTitle: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 10,
    },

    promoDesc: {
      color: COLORS.white,
      fontSize: 13,
      marginTop: 5,
    },
  });