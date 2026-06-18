import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
 Modal,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ADMIN_COLORS } from '../constants/adminTheme';
import i18n from '../src/localization/i18n';
import { apiRequest } from '../src/api/api';

const isRTL = i18n.locale.startsWith('ar');

const TIME_SLOTS = [
  '09:00',
  '11:00',
  '13:00',
  '15:00',
  '17:00',
];

export default function ServicesScreen({
  navigation,
  route,
}) {
  const [services, setServices] =
    useState([]);

  const [requests, setRequests] =
    useState([]);

  const [engineers, setEngineers] =
    useState([]);

  const [
    selectedRequest,
    setSelectedRequest,
  ] = useState(null);

  const [
    selectedEngineer,
    setSelectedEngineer,
  ] = useState(null);

  const [
    selectedTime,
    setSelectedTime,
  ] = useState(null);

  const [
    modalVisible,
    setModalVisible,
  ] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData =
    async () => {
      try {
        const token =
          await AsyncStorage.getItem(
            "userToken"
          );

        const servicesData =
          await apiRequest(
            "/services",
            "GET",
            null,
            token
          );

        const bookingsData =
          await apiRequest(
            "/admin-appointments",
            "GET",
            null,
            token
          );

        const engineersData =
          await apiRequest(
            "/engineers",
            "GET",
            null,
            token
          );

        setServices(
          servicesData
        );

        setRequests(
          bookingsData
        );

        setEngineers(
          engineersData
        );

      } catch (
        error
      ) {
        console.log(
          "Load error:",
          error
        );
      }
    };

  useEffect(() => {
    if (
      route?.params
        ?.updatedService
    ) {
      loadData();

      navigation.setParams({
        updatedService:
          undefined,
      });
    }
  }, [
    route?.params
      ?.updatedService,
  ]);

 const acceptRequest = async () => {

  if (!selectedEngineer || !selectedTime) {
    Alert.alert(
      "Error",
      "Select engineer and time"
    );
    return;
  }

  try {

    const token =
      await AsyncStorage.getItem(
        "userToken"
      );

    await apiRequest(
      `/appointments/${selectedRequest.id}`,
      "PATCH",
      {
        status: "accepted",
        engineer: selectedEngineer.name,
        engineerId: selectedEngineer.id,
        time: selectedTime,
      },
      token
    );

    console.log(
      "✅ appointment updated"
    );

    setModalVisible(false);

    setSelectedRequest(null);

    setSelectedEngineer(null);

    setSelectedTime(null);

    await loadData();

  } catch (e) {

    console.log(
      "Accept error:",
      e
    );

    Alert.alert(
      "Error",
      "Something went wrong"
    );
  }
};

  const rejectRequest =
  async (id) => {

    Alert.alert(
      "Reject Appointment",
      "Are you sure you want to reject this appointment?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Reject",
          style: "destructive",

          onPress: async () => {

            try {

              const token =
                await AsyncStorage.getItem(
                  "userToken"
                );

              await apiRequest(
                `/appointments/${id}`,
                "PATCH",
                {
                  status:
                    "rejected",
                },
                token
              );

              loadData();

            } catch (e) {

              console.log(e);

              Alert.alert(
                "Error",
                "Failed to reject appointment"
              );
            }
          },
        },
      ]
    );
  };

  const markNoShow =
    async (id) => {
      try {
        const token =
          await AsyncStorage.getItem(
            "userToken"
          );

        await apiRequest(
          `/appointments/${id}`,
          "PATCH",
          {
            status:
              "no-show",
          },
          token
        );

        loadData();

      } catch (e) {
        console.log(
          e
        );
      }
    };

  const getStatusColor =
    (status) => {
      switch (status) {
        case "accepted":
          return "#22c55e";

        case "no-show":
          return "#f59e0b";

        case "rejected":
          return "#ef4444";

        default:
          return "#999";
      }
    };

  const deleteService =
    (id) => {
      Alert.alert(
        i18n.t(
          "admin.services.deleteServiceTitle"
        ),

        i18n.t(
          "admin.services.deleteServiceMessage"
        ),

        [
          {
            text:
              i18n.t(
                "common.cancel"
              ),

            style:
              "cancel",
          },

          {
            text:
              i18n.t(
                "common.delete"
              ),

            style:
              "destructive",

            onPress:
              async () => {
                try {
                  const token =
                    await AsyncStorage.getItem(
                      "userToken"
                    );

                  await apiRequest(
                    `/services/${id}`,
                    "DELETE",
                    null,
                    token
                  );

                  loadData();

                } catch (
                  e
                ) {
                  console.log(
                    e
                  );
                }
              },
          },
        ]
      );
    };

  const servicesWithAddCard =
    [
      {
        id: "add",
        type: "add",
      },

      ...services,
    ];

  const renderService =
    ({
      item,
    }) => {
      if (
        item.type ===
        "add"
      ) {
        return (
          <TouchableOpacity
            style={
              styles.addCard
            }

            onPress={() =>
              navigation.navigate(
                "AddService"
              )
            }
          >
            <Ionicons
              name="add"
              size={42}
              color={
                ADMIN_COLORS.primary
              }
            />

            <Text
              style={
                styles.addText
              }
            >
              {i18n.t(
                "admin.services.addNew"
              )}
            </Text>
          </TouchableOpacity>
        );
      }

      return (
        <View
          style={
            styles.card
          }
        >
          <Ionicons
            name="construct"
            size={36}
            color={
              ADMIN_COLORS.primary
            }
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
            $
            {item.price}
          </Text>

          <Text
            style={
              styles.cardDuration
            }
          >
            ⏱{" "}
            {
              item.duration
            }{" "}
            {i18n.t(
              "admin.services.minutes"
            )}
          </Text>

          <View
            style={
              styles.cardActions
            }
          >
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(
                  "EditService",
                  {
                    service:
                      item,
                  }
                )
              }
            >
              <Ionicons
                name="create"
                size={18}
                color={
                  ADMIN_COLORS.textLight
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                deleteService(
                  item.id
                )
              }
            >
              <Ionicons
                name="trash"
                size={18}
                color="#ef4444"
              />
            </TouchableOpacity>
          </View>
        </View>
      );
    };

  const renderRequest =
    ({
      item,
    }) => (
      <View
        style={
          styles.requestCard
        }
      >
        <View>
          <Text
            style={
              styles.cardTitle
            }
          >
            {
              item.customerName
            }
          </Text>

          <Text
            style={
              styles.cardPrice
            }
          >
            {
              item.serviceName
            }
          </Text>

          <Text
            style={
              styles.cardPrice
            }
          >
            {item.brand &&
            item.model
              ? `${item.brand} ${item.model}`
              : "-"}
          </Text>

          <Text
            style={
              styles.cardPrice
            }
          >
            {item.createdAt
              ? new Date(
                  item.createdAt
                ).toLocaleDateString()
              : "-"}
          </Text>

          {/* UPDATED STATUS */}
          {item.status && (
            <Text
              style={[
                styles.status,
                {
                  color:
                    getStatusColor(
                      item.status
                    ),
                },
              ]}
            >
              {item.status}
              {item.engineer
                ? ` • ${item.engineer}`
                : ""}
            </Text>
          )}
        </View>

        {/* Pending buttons */}
        {item.status ===
          "pending" && (
          <View
            style={
              styles.requestActions
            }
          >
            <TouchableOpacity
              onPress={() => {
                setSelectedRequest(
                  item
                );

                setModalVisible(
                  true
                );
              }}
            >
              <Ionicons
                name="checkmark-circle"
                size={22}
                color="#22c55e"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                rejectRequest(
                  item.id
                )
              }
            >
              <Ionicons
                name="close-circle"
                size={22}
                color="#ef4444"
              />
            </TouchableOpacity>
          </View>
        )}

        {/* No Show button */}
        {item.status ===
          "accepted" && (
          <TouchableOpacity
            onPress={() =>
              markNoShow(
                item.id
              )
            }
          >
            <Ionicons
              name="alert-circle"
              size={24}
              color="#f59e0b"
            />
          </TouchableOpacity>
        )}
      </View>
    );

  return (
    <View
      style={
        styles.container
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
      >
        <LinearGradient
          colors={[
            ADMIN_COLORS.primary,
            ADMIN_COLORS.secondary,
          ]}

          style={
            styles.header
          }
        >
          <Text
            style={[
              styles.title,
              {
                textAlign:
                  isRTL
                    ? "right"
                    : "left",
              },
            ]}
          >
            {i18n.t(
              "admin.services.title"
            )}
          </Text>
        </LinearGradient>

        <Text
          style={
            styles.sectionTitle
          }
        >
          {i18n.t(
            "admin.services.existingServices"
          )}
        </Text>

        <FlatList
          data={
            servicesWithAddCard
          }

          keyExtractor={(
            item
          ) => item.id}

          horizontal

          renderItem={
            renderService
          }
        />

        <View
          style={
            styles.divider
          }
        />

        <Text
          style={
            styles.sectionTitle
          }
        >
          {i18n.t(
            "admin.services.incomingRequests"
          )}
        </Text>

        <FlatList
          data={
            requests
          }

          keyExtractor={(
            item
          ) => item.id}

          scrollEnabled={
            false
          }

          renderItem={
            renderRequest
          }
        />
      </ScrollView>

      <Modal
        visible={
          modalVisible
        }

        transparent

        animationType="fade"
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.modalCard
            }
          >
            <Text
              style={
                styles.modalTitle
              }
            >
              {i18n.t(
                "bookings.assignEngineer"
              )}
            </Text>

            {engineers.map(
              (eng) => (
                <TouchableOpacity
                  key={
                    eng.id
                  }

                  style={[
                    styles.engineerItem,

                    selectedEngineer?.id ===
                      eng.id &&
                      styles.selected,
                  ]}

                  onPress={() =>
                    setSelectedEngineer(
                      eng
                    )
                  }
                >
                  <Text
                    style={
                      styles.engineerName
                    }
                  >
                    {
                      eng.name
                    }
                  </Text>
                </TouchableOpacity>
              )
            )}

            <Text
              style={
                styles.modalTitle
              }
            >
              {i18n.t(
                "bookings.selectTime"
              )}
            </Text>

            {TIME_SLOTS.map(
              (
                time
              ) => (
                <TouchableOpacity
                  key={
                    time
                  }

                  style={[
                    styles.engineerItem,

                    selectedTime ===
                      time &&
                      styles.selected,
                  ]}

                  onPress={() =>
                    setSelectedTime(
                      time
                    )
                  }
                >
                  <Text
                    style={
                      styles.engineerName
                    }
                  >
                    {
                      time
                    }
                  </Text>
                </TouchableOpacity>
              )
            )}

            <TouchableOpacity
              onPress={
                acceptRequest
              }

              style={
                styles.confirmBtn
              }
            >
              <Text
                style={
                  styles.confirmText
                }
              >
                {i18n.t(
                  "bookings.confirm"
                )}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                setModalVisible(
                  false
                )
              }

              style={
                styles.cancelBtn
              }
            >
              <Text
                style={
                  styles.cancelText
                }
              >
                {i18n.t(
                  "bookings.cancel"
                )}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        ADMIN_COLORS.background,
    },

    header: {
      paddingTop: 60,
      paddingBottom: 40,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 25,
      borderBottomRightRadius: 25,
    },

    title: {
      fontSize: 28,
      fontWeight:
        "bold",
      color:
        ADMIN_COLORS.white,
    },

    sectionTitle: {
      fontSize: 20,
      fontWeight:
        "600",
      marginLeft: 20,
      marginVertical: 15,
      color:
        ADMIN_COLORS.textDark,
    },

    card: {
      backgroundColor:
        ADMIN_COLORS.surface,
      padding: 20,
      marginRight: 15,
      borderRadius: 16,
      alignItems:
        "center",
      width: 160,
    },

    cardTitle: {
      fontSize: 16,
      fontWeight:
        "bold",
      marginTop: 10,
      color:
        ADMIN_COLORS.textDark,
    },

    cardPrice: {
      fontSize: 14,
      color:
        ADMIN_COLORS.textLight,
      marginTop: 4,
    },

    cardDuration: {
      fontSize: 13,
      color:
        ADMIN_COLORS.textLight,
      marginTop: 4,
    },

    cardActions: {
      flexDirection:
        "row",
      gap: 12,
      marginTop: 12,
    },

    addCard: {
      backgroundColor:
        ADMIN_COLORS.surface,
      padding: 20,
      marginRight: 15,
      borderRadius: 16,
      alignItems:
        "center",
      justifyContent:
        "center",
      width: 160,
      borderWidth: 2,
      borderStyle:
        "dashed",
      borderColor:
        ADMIN_COLORS.primary,
    },

    addText: {
      marginTop: 8,
      fontSize: 14,
      fontWeight:
        "600",
      color:
        ADMIN_COLORS.primary,
    },

    divider: {
      height: 1,
      backgroundColor:
        ADMIN_COLORS.border,
      marginHorizontal: 20,
      marginVertical: 10,
    },

    requestCard: {
      backgroundColor:
        ADMIN_COLORS.surfaceLight,
      padding: 16,
      marginBottom: 12,
      borderRadius: 16,
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      borderWidth: 1,
      borderColor:
        ADMIN_COLORS.border,
    },

    requestActions: {
      flexDirection:
        "row",
      gap: 12,
    },

    status: {
      marginTop: 6,
      fontSize: 13,
      fontWeight:
        "600",
    },

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.5)",
      justifyContent:
        "center",
      padding: 20,
    },

    modalCard: {
      backgroundColor:
        ADMIN_COLORS.surface,
      borderRadius: 18,
      padding: 20,
    },

    modalTitle: {
      fontSize: 18,
      fontWeight:
        "bold",
      color: "#999",
      marginVertical: 10,
    },

    engineerItem: {
      paddingVertical: 10,
    },

    engineerName: {
      fontSize: 15,
      color: "#fff",
    },

    selected: {
      backgroundColor:
        "#676363",
      borderRadius: 8,
      paddingHorizontal: 10,
    },

    confirmBtn: {
      backgroundColor:
        "#007AFF",
      padding: 12,
      borderRadius: 12,
      marginTop: 15,
      alignItems:
        "center",
    },

    confirmText: {
      color: "#fff",
      fontWeight:
        "600",
    },

    cancelBtn: {
      marginTop: 12,
      alignItems:
        "center",
    },

    cancelText: {
      color: "#999",
    },
  });