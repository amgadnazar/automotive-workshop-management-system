import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ADMIN_COLORS } from '../constants/adminTheme';
import i18n from '../src/localization/i18n';

import { apiRequest } from "../src/api/api";
import { auth } from "../src/config/firebase";

const isRTL = i18n.locale.startsWith('ar');

export default function DashboardScreen({ navigation }) {


  const [stats, setStats] = useState([
    { id: '1', key: 'todayBookings', value: '0', icon: 'calendar' },
    { id: '2', key: 'pendingJobs', value: '0', icon: 'time' },
    { id: '3', key: 'completed', value: '0', icon: 'checkmark-done' },
  ]);

  const [engineers, setEngineers] = useState([]);
  const [offers, setOffers] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingEngineer, setEditingEngineer] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerTitle, setOfferTitle] = useState('');
  const [offerDesc, setOfferDesc] = useState('');


  const getToken = async () => {
    const user = auth.currentUser;
    return await user.getIdToken();
    
  };


  const fetchDashboard = async () => {
    try {
      const token = await getToken();
      console.log(
  "FRESH TOKEN:",
  token
);
      const data = await apiRequest("/dashboard", "GET", null, token);

      setStats([
        { id: '1', key: 'todayBookings', value: String(data.todayBookings), icon: 'calendar' },
        { id: '2', key: 'pendingJobs', value: String(data.pendingJobs), icon: 'time' },
        { id: '3', key: 'completed', value: String(data.completed), icon: 'checkmark-done' },
      ]);
    } catch (e) {
      console.log(e.message);
    }
  };

  const fetchEngineers = async () => {
    try {
      const token = await getToken();
      const data = await apiRequest("/engineers", "GET", null, token);
      setEngineers(Array.isArray(data) ? data : data.engineers || []);
    } catch (e) {
      console.log(e.message);
    }
  };

  const fetchOffers = async () => {
    try {
      const token = await getToken();
      const data = await apiRequest("/offers", "GET", null, token);
      setOffers(data);
    } catch (e) {
      console.log(e.message);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchEngineers();
    fetchOffers();
  }, []);


  const openAdd = () => {
    setEditingEngineer(null);
    setName('');
    setRole('');
    setModalVisible(true);
  };

  const openEdit = (eng) => {
    setEditingEngineer(eng);
    setName(eng.name);
    setRole(eng.role);
    setModalVisible(true);
  };

  const saveEngineer = async () => {
    try {
      const token = await getToken();

      if (editingEngineer) {
        await apiRequest(`/engineers/${editingEngineer.id}`, "PUT", { name, role }, token);
      } else {
        await apiRequest("/engineers", "POST", { name, role }, token);
      }

      setModalVisible(false);
      fetchEngineers();
    } catch (e) {
      console.log(e.message);
    }
  };

  const deleteEngineer = async (id) => {
    try {
      const token = await getToken();
      await apiRequest(`/engineers/${id}`, "DELETE", null, token);
      fetchEngineers();
    } catch (e) {
      console.log(e.message);
    }
  };


  const openAddOffer = () => {
    setEditingOffer(null);
    setOfferTitle('');
    setOfferDesc('');
    setOfferModalVisible(true);
  };

  const openEditOffer = (offer) => {
    setEditingOffer(offer);
    setOfferTitle(offer.title);
    setOfferDesc(offer.description);
    setOfferModalVisible(true);
  };

  const saveOffer = async () => {
    try {
      const token = await getToken();

      if (editingOffer) {
        await apiRequest(`/offers/${editingOffer.id}`, "PUT", {
          title: offerTitle,
          description: offerDesc,
        }, token);
      } else {
        await apiRequest("/offers", "POST", {
          title: offerTitle,
          description: offerDesc,
        }, token);
      }

      setOfferModalVisible(false);
      fetchOffers();
    } catch (e) {
      console.log(e.message);
    }
  };

  const deleteOffer = async (id) => {
    try {
      const token = await getToken();
      await apiRequest(`/offers/${id}`, "DELETE", null, token);
      fetchOffers();
    } catch (e) {
      console.log(e.message);
    }
  };


  const ModalBox = ({ children, onCancel }) => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>
        {children}
        {onCancel && (
          <TouchableOpacity onPress={onCancel} style={{ marginTop: 10 }}>
            <Text style={{ color: ADMIN_COLORS.textLight, textAlign: 'center' }}>
              {i18n.t('common.cancel')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const PrimaryBtn = ({ text, onPress }) => (
    <TouchableOpacity style={styles.saveBtn} onPress={onPress}>
      <Text style={styles.saveText}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <LinearGradient colors={[ADMIN_COLORS.primary, ADMIN_COLORS.secondary]} style={styles.header}>
          <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>
            {i18n.t('admin.dashboard.title')}
          </Text>
        </LinearGradient>

        {/* STATS */}
        <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
          {i18n.t('admin.dashboard.todayOverview')}
        </Text>

        <FlatList
          data={stats}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 15 }}
          renderItem={({ item }) => (
            <View style={styles.statCard}>
              <Ionicons name={item.icon} size={30} color={ADMIN_COLORS.white} />
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statTitle}>
                {i18n.t(`admin.dashboard.stats.${item.key}`)}
              </Text>
            </View>
          )}
        />

        {/* RATING BUTTON */}
        <TouchableOpacity style={styles.ratingBtn} onPress={() => navigation.navigate('Ratings')}>
          <Ionicons name="star" size={22} color={ADMIN_COLORS.black} />
          <Text style={styles.ratingText}>{i18n.t('common.viewRatings')}</Text>
        </TouchableOpacity>

        {/* ENGINEERS */}
        <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={styles.sectionTitle}>{i18n.t('admin.dashboard.engineers')}</Text>
          <TouchableOpacity onPress={openAdd}>
            <Ionicons name="add-circle" size={28} color={ADMIN_COLORS.primary} />
          </TouchableOpacity>
        </View>

        {engineers.map(eng => (
          <View key={eng.id} style={[styles.card, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity onPress={() => openEdit(eng)}>
              <Text style={styles.cardTitle}>{eng.name}</Text>
              <Text style={styles.cardSub}>{eng.role}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteEngineer(eng.id)}>
              <Ionicons name="trash" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))}

        {/* OFFERS */}
        <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={styles.sectionTitle}>{i18n.t('admin.dashboard.offersPromotions')}</Text>
          <TouchableOpacity onPress={openAddOffer}>
            <Ionicons name="add-circle" size={28} color={ADMIN_COLORS.primary} />
          </TouchableOpacity>
        </View>

        {offers.map(offer => (
          <View key={offer.id} style={[styles.card, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity onPress={() => openEditOffer(offer)}>
              <Text style={styles.cardTitle}>{offer.title}</Text>
              <Text style={styles.cardSub}>{offer.description}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteOffer(offer.id)}>
              <Ionicons name="trash" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ENGINEER MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <ModalBox onCancel={() => setModalVisible(false)}>
          <TextInput
            placeholder={i18n.t('admin.engineer.name')}
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor={ADMIN_COLORS.textLight}
          />
          <TextInput
            placeholder={i18n.t('admin.engineer.role')}
            value={role}
            onChangeText={setRole}
            style={styles.input}
            placeholderTextColor={ADMIN_COLORS.textLight}
          />
          <PrimaryBtn text={i18n.t('common.save')} onPress={saveEngineer} />
        </ModalBox>
      </Modal>

      {/* OFFER MODAL */}
      <Modal visible={offerModalVisible} transparent animationType="fade">
        <ModalBox onCancel={() => setOfferModalVisible(false)}>
          <TextInput
            placeholder={i18n.t('admin.offer.title')}
            value={offerTitle}
            onChangeText={setOfferTitle}
            style={styles.input}
            placeholderTextColor={ADMIN_COLORS.textLight}
          />
          <TextInput
            placeholder={i18n.t('admin.offer.description')}
            value={offerDesc}
            onChangeText={setOfferDesc}
            style={styles.input}
            placeholderTextColor={ADMIN_COLORS.textLight}
          />
          <PrimaryBtn text={i18n.t('common.saveOffer')} onPress={saveOffer} />
        </ModalBox>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ADMIN_COLORS.background },
  header: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  title: { fontSize: 28, fontWeight: 'bold', color: ADMIN_COLORS.white },
  sectionHeader: { justifyContent: 'space-between', marginHorizontal: 20, marginTop: 25, alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginVertical: 12, color: ADMIN_COLORS.textDark, padding:5},
  statCard: { backgroundColor: ADMIN_COLORS.surfaceLight, width: 200, padding: 20, marginRight: 15, borderRadius: 16 },
  statValue: { color: ADMIN_COLORS.white, fontSize: 22, fontWeight: 'bold' },
  statTitle: { color: ADMIN_COLORS.textLight, fontSize: 13 },
  card: { backgroundColor: ADMIN_COLORS.surface, marginHorizontal: 20, marginTop: 10, padding: 14, borderRadius: 14, justifyContent: 'space-between' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: ADMIN_COLORS.textDark },
  cardSub: { fontSize: 13, color: ADMIN_COLORS.textLight, marginTop: 4 },
  ratingBtn: { backgroundColor: ADMIN_COLORS.primary, marginHorizontal: 20, marginTop: 20, padding: 16, borderRadius: 14, flexDirection: 'row', justifyContent: 'center' },
  ratingText: { marginLeft: 8, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: ADMIN_COLORS.surface, borderRadius: 18, padding: 20 },
  input: { backgroundColor: ADMIN_COLORS.surfaceLight,color:'white', padding: 12, borderRadius: 12, marginBottom: 12 },
  saveBtn: { backgroundColor: ADMIN_COLORS.primary, padding: 14, borderRadius: 12, alignItems: 'center' },
  saveText: { fontWeight: '600', fontSize: 16 },
});