import React, {
  useEffect,
  useState,
} from "react";

import AsyncStorage
from "@react-native-async-storage/async-storage";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  I18nManager,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  LinearGradient,
} from "expo-linear-gradient";

import {
  COLORS,
} from "../constants/theme";

import {
  apiRequest,
} from "../src/api/api";

import i18n
from "../src/localization/i18n";

const isRTL =
  I18nManager.isRTL;

export default function NotificationsScreen() {

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {

    loadNotifications();

  }, []);

  const loadNotifications =
    async () => {

      try {

        const token =
          await AsyncStorage.getItem(
            "userToken"
          );

        const data =
          await apiRequest(
            "/notifications/my-notifications",
            "GET",
            null,
            token
          );

        setNotifications(data);

      } catch (error) {

        console.log(
          "Notification error:",
          error
        );

      } finally {

        setLoading(false);
      }
    };

 

  const cancelAppointment =
    async (appointmentId) => {

      try {

        const token =
          await AsyncStorage.getItem(
            "userToken"
          );

        await apiRequest(
          `/appointments/${appointmentId}/cancel`,
          "PATCH",
          {},
          token
        );

        Alert.alert(
          i18n.t("success"),
          i18n.t(
            "notifications.appointmentCancelled"
          )
        );

        loadNotifications();

      } catch (e) {

        console.log(e);

        Alert.alert(
          i18n.t("error"),
          i18n.t(
            "notifications.cancelFailed"
          )
        );
      }
    };



  const canCancel =
    (cancelAllowedUntil) => {

      if (!cancelAllowedUntil)
        return false;

      return (
        new Date() <
        new Date(cancelAllowedUntil)
      );
    };

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

    <View style={styles.container}>

      {/* HEADER */}

      <LinearGradient
        colors={[
          COLORS.primary,
          COLORS.secondary,
        ]}
        style={styles.header}
      >

        <Text style={styles.headerTitle}>
          {i18n.t(
            "notifications.title"
          )}
        </Text>

      </LinearGradient>

      {/* LIST */}

      <FlatList
        data={notifications}

        keyExtractor={(item) =>
          item.id.toString()
        }

        contentContainerStyle={{
          padding: 15,
        }}

        ListEmptyComponent={

          <View style={styles.emptyBox}>

            <Ionicons
              name="notifications-off-outline"
              size={60}
              color="#999"
            />

            <Text style={styles.emptyText}>
              {i18n.t(
                "notifications.empty"
              )}
            </Text>

          </View>
        }

        renderItem={({ item }) => (

          <View
            style={[
              styles.card,
              {
                flexDirection:
                  isRTL
                    ? "row-reverse"
                    : "row",
              }
            ]}
          >

            {/* ICON */}

            <View
              style={[
                styles.iconBox,
                {
                  marginRight:
                    isRTL ? 0 : 12,

                  marginLeft:
                    isRTL ? 12 : 0,
                }
              ]}
            >

              <Ionicons
                name="notifications"
                size={24}
                color="#fff"
              />

            </View>

            {/* CONTENT */}

            <View style={{ flex: 1 }}>

              <Text
                style={[
                  styles.title,
                  {
                    textAlign:
                      isRTL
                        ? "right"
                        : "left",
                  }
                ]}
              >
                {item.title}
              </Text>

              <Text
                style={[
                  styles.body,
                  {
                    textAlign:
                      isRTL
                        ? "right"
                        : "left",
                  }
                ]}
              >
                {item.body}
              </Text>

              <View style={styles.infoBox}>

                <Text
                  style={[
                    styles.infoText,
                    {
                      textAlign:
                        isRTL
                          ? "right"
                          : "left",
                    }
                  ]}
                >
                  {i18n.t("service")}:
                  {" "}
                  {item.serviceName}
                </Text>

                <Text
                  style={[
                    styles.infoText,
                    {
                      textAlign:
                        isRTL
                          ? "right"
                          : "left",
                    }
                  ]}
                >
                  {i18n.t("date")}:
                  {" "}
                  {item.date}
                </Text>

                <Text
                  style={[
                    styles.infoText,
                    {
                      textAlign:
                        isRTL
                          ? "right"
                          : "left",
                    }
                  ]}
                >
                  {i18n.t(
                    "notifications.time"
                  )}:
                  {" "}
                  {item.time}
                </Text>

                <Text
                  style={[
                    styles.infoText,
                    {
                      textAlign:
                        isRTL
                          ? "right"
                          : "left",
                    }
                  ]}
                >
                  {i18n.t("status")}:
                  {" "}

                  {i18n.t(
                    `bookings.status.${item.status}`
                  )}
                </Text>

              </View>

              {/* CANCEL BUTTON */}

              {item.status === "accepted" &&
              item.appointmentId &&
              canCancel(
                item.cancelAllowedUntil
              ) && (

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() =>
                    cancelAppointment(
                      item.appointmentId
                    )
                  }
                >

                  <Text
                    style={styles.cancelBtnText}
                  >
                    {i18n.t(
                      "notifications.cancelAppointment"
                    )}
                  </Text>

                </TouchableOpacity>
              )}

              <Text
                style={[
                  styles.date,
                  {
                    textAlign:
                      isRTL
                        ? "right"
                        : "left",
                  }
                ]}
              >

                {item.createdAt
                  ? new Date(
                      item.createdAt
                    ).toLocaleString()
                  : ""}

              </Text>

            </View>

          </View>
        )}
      />

    </View>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        COLORS.background,
    },

    loader: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    header: {
      paddingTop: 60,
      paddingBottom: 30,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 25,
      borderBottomRightRadius: 25,
    },

    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#fff",
      textAlign: isRTL
        ? "right"
        : "left",
    },

    card: {
      backgroundColor: "#fff",
      borderRadius: 18,
      padding: 16,
      marginBottom: 15,
      alignItems: "flex-start",
      elevation: 3,
    },

    iconBox: {
      width: 45,
      height: 45,
      borderRadius: 50,
      backgroundColor:
        COLORS.primary,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    title: {
      fontSize: 16,
      fontWeight: "bold",
      color:
        COLORS.textDark,
    },

    body: {
      fontSize: 14,
      color:
        COLORS.textLight,
      marginTop: 4,
      lineHeight: 20,
    },

    infoBox: {
      marginTop: 10,
    },

    infoText: {
      fontSize: 13,
      color: "#555",
      marginBottom: 4,
    },

    date: {
      fontSize: 12,
      color: "#999",
      marginTop: 10,
    },

    emptyBox: {
      marginTop: 80,
      alignItems: "center",
    },

    emptyText: {
      marginTop: 15,
      fontSize: 16,
      color: "#999",
    },

    cancelBtn: {
      backgroundColor: "#ef4444",
      marginTop: 14,
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: "center",
    },

    cancelBtnText: {
      color: "#fff",
      fontWeight: "bold",
    },
  });