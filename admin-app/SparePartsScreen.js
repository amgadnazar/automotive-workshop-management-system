import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

import { ADMIN_COLORS } from '../constants/adminTheme';
import i18n from '../src/localization/i18n';

import { auth } from '../src/config/firebase';
import { apiRequest } from '../src/api/api';

import {
  collection,
  getDocs,
} from 'firebase/firestore';

import { db } from '../src/config/firebase';

const isRTL =
  i18n.locale.startsWith(
    'ar'
  );

export default function SparePartsScreen({
  navigation,
}) {
  const [parts, setParts] =
    useState([]);

  const [
    requests,
    setRequests,
  ] = useState([]);

  const [
    selectedRequest,
    setSelectedRequest,
  ] = useState(null);

  const [
    modalVisible,
    setModalVisible,
  ] = useState(false);

  const [search, setSearch] =
    useState('');


  
  const fetchData =
    async () => {
      try {

        const snapshot =
          await getDocs(
            collection(
              db,
              'spare_parts'
            )
          );

        const partsData =
          snapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );

        setParts(
          partsData
        );


        const user =
          auth.currentUser;

        const token =
          await user.getIdToken();

        const ordersData =
          await apiRequest(
            "/admin/spare-part-orders",
            "GET",
            null,
            token
          );

        console.log(
          "📦 Orders Data:",
          ordersData
        );

        
const usersSnapshot = await getDocs(
  collection(db, 'users')
);

const usersMap = {};

usersSnapshot.forEach((doc) => {
  usersMap[doc.id] = doc.data();
});

console.log("👥 Users Map:", usersMap);


        const formattedOrders =
  ordersData.map((item) => {

    const userData =
      usersMap[item.customerId] || {};

    console.log(
      "📱 User Data:",
      item.customerId,
      userData
    );

    return {
      id: item.id,

      customer:
        item.customerName ||
        userData.name ||
        item.customerId ||
        "Unknown",

      phone:
        userData.phone ||
        userData.phoneNumber ||
        userData.mobile ||
        "-",

      part:
        item.partName || "-",

      quantity:
        item.quantity || 0,

      car:
        item.brand &&
        item.model
          ? `${item.brand} ${item.model}`
          : "-",

      date:
        item.createdAt
          ? new Date(
              item.createdAt
            ).toLocaleDateString()
          : "-",

      note:
        item.note || "",

      status:
        item.status ||
        "pending",
    };
  });

        setRequests(
          formattedOrders
        );

      } catch (e) {
        console.log(
          "Fetch error:",
          e.message
        );
      }
    };


  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );


  
  const filteredParts =
    parts.filter(
      (item) =>
        (
          item.name || ""
        )
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );


  
  const approveRequest =
    async () => {
      try {
        const user =
          auth.currentUser;

        const token =
          await user.getIdToken();

        await apiRequest(
          `/admin/spare-part-orders/${selectedRequest.id}/status`,
          "PUT",
          {
            status:
              "approved",
          },
          token
        );

        await fetchData();

        setModalVisible(
          false
        );

        setSelectedRequest(
          null
        );

      } catch (e) {
        console.log(
          "Approve error:",
          e.message
        );
      }
    };


  
  const rejectRequest =
    async (id) => {
      try {
        const user =
          auth.currentUser;

        const token =
          await user.getIdToken();

        await apiRequest(
          `/admin/spare-part-orders/${id}/status`,
          "PUT",
          {
            status:
              "rejected",
          },
          token
        );

        await fetchData();

      } catch (e) {
        console.log(
          "Reject error:",
          e.message
        );
      }
    };


  
  const deletePart = (
    id
  ) => {
    Alert.alert(
      i18n.t(
        'spareParts.deleteTitle'
      ),

      i18n.t(
        'spareParts.deleteConfirm'
      ),

      [
        {
          text:
            i18n.t(
              'common.cancel'
            ),
          style:
            'cancel',
        },

        {
          text:
            i18n.t(
              'common.delete'
            ),

          style:
            'destructive',

          onPress:
            () =>
              setParts(
                (
                  prev
                ) =>
                  prev.filter(
                    (
                      p
                    ) =>
                      p.id !==
                      id
                  )
              ),
        },
      ]
    );
  };


  
  const renderPart = ({
    item,
  }) => {
    if (
      item.type ===
      'add'
    ) {
      return (
        <TouchableOpacity
          style={
            styles.addCard
          }
          onPress={() =>
            navigation.navigate(
              'AddSparePart'
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
              'spareParts.addNew'
            )}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View
        style={
          styles.partCard
        }
      >
        <Ionicons
          name="construct"
          size={28}
          color={
            ADMIN_COLORS.primary
          }
        />

        <Text
          style={
            styles.partName
          }
        >
          {item.name}
        </Text>

        <Text
          style={
            styles.partPrice
          }
        >
          $
          {item.price}
        </Text>

        <View
          style={
            styles.partActions
          }
        >
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                'EditSparePart',
                {
                  part:
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
              deletePart(
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


 
  
const renderRequest = ({
  item,
}) => (
  <View
    style={
      styles.requestCard
    }
  >
    <View
      style={{
        flex: 1,
      }}
    >

      {/* CUSTOMER NAME */}
<Text
  style={styles.customer}
>
   {item.customer}
</Text>

{/* CAR NAME */}
<Text
  style={[
    styles.details,
    {
      marginTop: 4,
      fontWeight: '600',
      color: ADMIN_COLORS.textDark,
    },
  ]}
>
  {item.car}
</Text>

      {/* ORDER NAME */}
      <Text
        style={
          styles.details
          }
      >
        Order: {item.part}
      </Text>

      {/* QUANTITY */}
      <Text
        style={
          styles.details
        }
      >
        Quantity: {item.quantity}
      </Text>

      {/* DATE */}
      <Text
        style={
          styles.details
        }
      >
        Date: {item.date}
      </Text>

      {/* NOTE */}
      {!!item.note && (
        <Text
          style={
            styles.details
          }
        >
          Note: {item.note}
        </Text>
      )}

      {/* PHONE */}
      <Text
        style={
          styles.details
        }
      >
       Customer's phone: {item.phone}
      </Text>

      {/* STATUS */}
      {item.status !==
        'pending' && (
        <Text
          style={[
            styles.status,
            {
              color:
                item.status ===
                'approved'
                  ? '#22c55e'
                  : '#ef4444',
            },
          ]}
        >
          {i18n.t(
            `spareParts.status.${item.status}`
          )}
        </Text>
      )}
    </View>

    {/* ACTIONS */}
    {item.status ===
      'pending' && (
      <View
        style={
          styles.actions
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
            size={26}
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
            size={26}
            color="#ef4444"
          />
        </TouchableOpacity>
      </View>
    )}
  </View>
);


  const partsWithAddCard =
    [
      {
        id: 'add',
        type: 'add',
      },

      ...(search
        ? filteredParts
        : parts),
    ];


  return (
    <View
      style={
        styles.container
      }
    >
      <FlatList
        data={
          requests
        }
        keyExtractor={(
          item
        ) => item.id}
        renderItem={
          renderRequest
        }
        ListHeaderComponent={
          <>
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
                        ? 'right'
                        : 'left',
                  },
                ]}
              >
                {i18n.t(
                  'spareParts.title'
                )}
              </Text>
            </LinearGradient>

            <Text
              style={
                styles.sectionTitle
              }
            >
              {i18n.t(
                'spareParts.searchTitle'
              )}
            </Text>

            <View
              style={
                styles.searchBox
              }
            >
              <Ionicons
                name="search"
                size={20}
                color={
                  ADMIN_COLORS.textLight
                }
              />

              <TextInput
                placeholder={i18n.t(
                  'spareParts.searchPlaceholder'
                )}
                placeholderTextColor={
                  ADMIN_COLORS.textLight
                }
                value={
                  search
                }
                onChangeText={
                  setSearch
                }
                style={
                  styles.searchInput
                }
              />
            </View>

            <Text
              style={
                styles.sectionTitle
              }
            >
              {i18n.t(
                'spareParts.available'
              )}
            </Text>

            <FlatList
              data={
                partsWithAddCard
              }
              keyExtractor={(
                item
              ) => item.id}
              renderItem={
                renderPart
              }
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={{
                paddingHorizontal: 20,
              }}
            />

            <Text
              style={
                styles.sectionTitle
              }
            >
              {i18n.t(
                'spareParts.requests'
              )}
            </Text>
          </>
        }
      />

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
                'spareParts.approveQuestion'
              )}
            </Text>

            <TouchableOpacity
              style={
                styles.confirmBtn
              }
              onPress={
                approveRequest
              }
            >
              <Text
                style={
                  styles.confirmText
                }
              >
                {i18n.t(
                  'spareParts.approve'
                )}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.cancelBtn
              }
              onPress={() =>
                setModalVisible(
                  false
                )
              }
            >
              <Text
                style={
                  styles.cancelText
                }
              >
                {i18n.t(
                  'common.cancel'
                )}
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
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: ADMIN_COLORS.white,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 20,
    marginVertical: 12,
    color: ADMIN_COLORS.textDark,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ADMIN_COLORS.surface,
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 12,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
    color: ADMIN_COLORS.textDark,
  },
  partCard: {
    backgroundColor: ADMIN_COLORS.surface,
    padding: 16,
    marginRight: 15,
    borderRadius: 16,
    alignItems: 'center',
    width: 160,
  },
  partName: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: 'bold',
    color: ADMIN_COLORS.textDark,
  },
  partPrice: {
    fontSize: 14,
    color: ADMIN_COLORS.textLight,
    marginTop: 4,
  },
  partActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  addCard: {
    backgroundColor: ADMIN_COLORS.surface,
    padding: 16,
    marginRight: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: ADMIN_COLORS.primary,
  },
  addText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: ADMIN_COLORS.primary,
  },
  requestCard: {
    backgroundColor: ADMIN_COLORS.surfaceLight,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  customer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ADMIN_COLORS.textDark,
  },
  details: {
    fontSize: 14,
    color: ADMIN_COLORS.textLight,
    marginTop: 2,
  },
  status: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: ADMIN_COLORS.surface,
    borderRadius: 18,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: ADMIN_COLORS.textDark,
  },
  confirmBtn: {
    backgroundColor: '#22c55e',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelBtn: {
    marginTop: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: ADMIN_COLORS.textLight,
  },
});