import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  TextInput,
  ActivityIndicator,
  ScrollView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';
import i18n from '../src/localization/i18n';
import { auth } from '../src/config/firebase';
import { apiRequest } from '../src/api/api';
import { getFirestore, collection, getDocs, limit, query, orderBy } from 'firebase/firestore';
import { getApp } from 'firebase/app';

export default function AboutScreen() {
  const [rating, setRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [complaint, setComplaint] = useState('');
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [workshopData, setWorkshopData] = useState({
    address: 'Loading...',
    phone: 'Loading...',
    workingHours: 'Loading...',
    workingHoursShort: 'Loading...',
    googleMapLink: 'https://www.google.com/maps',
  });
  const [workshopLoading, setWorkshopLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      await getUserName();
      await fetchWorkshopData();
      await fetchRecentComplaints();
    };
    initialize();
  }, []);

  const getUserName = async () => {
    const user = auth.currentUser;
    if (user) {
      let name = user.displayName;
      if (!name && user.email) {
        name = user.email.split('@')[0];
      }
      if (!name) {
        name = user.uid.substring(0, 8);
      }
      setUserName(name);
    }
  };

  const fetchWorkshopData = async () => {
  try {
    setWorkshopLoading(true);

    const data = await apiRequest(
      "/workshop",
      "GET"
    );

    console.log("📦 Workshop:", data);

    setWorkshopData({
      address: data.location || '',
      phone: data.phone || '',
      workingHours: data.workingHours || '',
      workingHoursShort: data.workingHours || '',
      googleMapLink:
        data.googleMapsLink || '',
    });

  } catch (error) {
    console.log(
      "❌ Workshop fetch error:",
      error
    );
  } finally {
    setWorkshopLoading(false);
  }
};

 
  const formatComplaintDate = (dateValue) => {
    if (!dateValue) return '';
    
    try {

      if (dateValue && typeof dateValue.toDate === 'function') {
        const date = dateValue.toDate();
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-GB');
        }
      }
      
     
      if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-GB');
        }
      }
      
      
      if (dateValue && typeof dateValue === 'object' && 'seconds' in dateValue) {
        const date = new Date(dateValue.seconds * 1000);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-GB');
        }
      }
      
      return '';
    } catch (error) {
      console.log('Date parsing error:', error);
      return '';
    }
  };


  const fetchRecentComplaints = async () => {
    try {
      const app = getApp();
      const db = getFirestore(app);
      const complaintsRef = collection(db, 'complaints');
      const complaintsQuery = query(complaintsRef, orderBy('createdAt', 'desc'), limit(10));
      const querySnapshot = await getDocs(complaintsQuery);
      
      const complaintsList = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        
       
        let dateValue = data.createdAt || data.date || data.timestamp;
        let formattedDate = formatComplaintDate(dateValue);
        
  
        if (!formattedDate) {
          formattedDate = new Date().toLocaleDateString('en-GB');
        }
        
        complaintsList.push({
          id: doc.id,
          customerName: data.customerName || data.customerId || 'Unknown',
          message: data.message,
          date: formattedDate,
        });
      });
      
      setRecentComplaints(complaintsList);
      console.log('📋 Complaints loaded:', complaintsList.length);
    } catch (error) {
      console.log('Error fetching complaints:', error);
    }
  };

  const openLocation = () => {
    Linking.openURL(workshopData.googleMapLink);
  };

  const callComplaints = () => {
    Linking.openURL(`tel:${workshopData.phone}`);
  };

  const handleRating = async (value) => {
    setRating(value);
    setRatingLoading(true);
    
    try {
      const user = auth.currentUser;
      const token = await user?.getIdToken();
      
      if (!token) {
        Alert.alert('Error', 'Please login to rate');
        setRatingLoading(false);
        return;
      }

      const ratingData = {
        rating: value,
        comment: `${userName} rated the app ${value} stars`,
      };

      console.log('📤 Sending app rating:', ratingData);

      await apiRequest('/ratings/rating', 'POST', ratingData, token);

      Alert.alert(
        i18n.t('about.thankYou'),
        i18n.t('about.ratingMessage', { value })
      );
    } catch (error) {
      console.log('Rating error:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    } finally {
      setRatingLoading(false);
    }
  };

  const showWorkingHours = () => {
    Alert.alert(
      i18n.t('about.workingHours'),
      workshopData.workingHours
    );
  };

  const submitComplaint = async () => {
    if (!complaint.trim()) {
      Alert.alert(
        i18n.t('common.error'),
        i18n.t('about.complaintEmpty')
      );
      return;
    }

    setComplaintLoading(true);

    try {
      const user = auth.currentUser;
      const token = await user?.getIdToken();
      
      if (!token) {
        Alert.alert('Error', 'Please login to submit complaint');
        setComplaintLoading(false);
        return;
      }

      const complaintData = {
        message: complaint.trim(),
        customerName: userName,
        customerId: user.uid,
      };

      console.log('📤 Sending complaint:', complaintData);

      await apiRequest('/ratings/complaint', 'POST', complaintData, token);

      Alert.alert(
        i18n.t('about.complaintSent'),
        i18n.t('about.complaintSentDesc')
      );

      setComplaint('');
      
      await fetchRecentComplaints();
      
    } catch (error) {
      console.log('Complaint error:', error);
      Alert.alert('Error', 'Failed to submit complaint. Please try again.');
    } finally {
      setComplaintLoading(false);
    }
  };

  const renderComplaintItem = ({ item }) => (
    <View style={styles.recentComplaintItem}>
      <View style={styles.recentComplaintHeader}>
        <Ionicons name="person-circle" size={22} color={COLORS.primary} />
        <Text style={styles.recentComplaintName}>{item.customerName}</Text>
        <Text style={styles.recentComplaintDate}>{item.date}</Text>
      </View>
      <Text style={styles.recentComplaintMessage}>{item.message}</Text>
    </View>
  );

  const isLoading = ratingLoading || complaintLoading || workshopLoading;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>
          {i18n.t('about.title')}
        </Text>
      </LinearGradient>

      <TouchableOpacity style={styles.card} onPress={openLocation}>
        <Ionicons name="location" size={26} color={COLORS.primary} />
        <View style={styles.textBox}>
          <Text style={styles.cardTitle}>
            {i18n.t('about.location')}
          </Text>
          <Text style={styles.cardSub}>
            {workshopData.address}
          </Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color={COLORS.textLight} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={showWorkingHours}>
        <Ionicons name="time" size={26} color={COLORS.primary} />
        <View style={styles.textBox}>
          <Text style={styles.cardTitle}>
            {i18n.t('about.workingHours')}
          </Text>
          <Text style={styles.cardSub}>
            {workshopData.workingHoursShort}
          </Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color={COLORS.textLight} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={callComplaints}>
        <Ionicons name="call" size={26} color={COLORS.primary} />
        <View style={styles.textBox}>
          <Text style={styles.cardTitle}>
            {i18n.t('about.complaintsNumber')}
          </Text>
          <Text style={styles.cardSub}>{workshopData.phone}</Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color={COLORS.textLight} />
      </TouchableOpacity>

      <View style={styles.ratingCard}>
        <Text style={styles.ratingTitle}>
          {i18n.t('about.rateApp')}
        </Text>

        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity 
              key={star} 
              onPress={() => handleRating(star)}
              disabled={ratingLoading}
            >
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={36}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          ))}
        </View>
        
        {ratingLoading && (
          <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 10 }} />
        )}
      </View>

      <View style={styles.complaintCard}>
        <Text style={styles.complaintTitle}>
          {i18n.t('about.sendComplaint')}
        </Text>

        <TextInput
          style={styles.complaintInput}
          placeholder={i18n.t('about.complaintPlaceholder')}
          placeholderTextColor={COLORS.textLight}
          multiline
          value={complaint}
          onChangeText={setComplaint}
          editable={!complaintLoading}
        />

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={submitComplaint}
          disabled={complaintLoading}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.gradientButton}
          >
            {complaintLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.submitText}>
                  {i18n.t('common.send')}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

     
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: { color: COLORS.white, fontSize: 26, fontWeight: 'bold' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 25,
    padding: 20,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  textBox: { marginLeft: 15, flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark },
  cardSub: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  ratingCard: {
    backgroundColor: COLORS.white,
    margin: 20,
    padding: 25,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ratingTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: COLORS.textDark },
  starsRow: { flexDirection: 'row', gap: 12 },
  complaintCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  complaintTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: COLORS.textDark },
  complaintInput: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#FAFAFA',
    textAlignVertical: 'top',
    fontSize: 14,
  },
  submitButton: { marginTop: 15, borderRadius: 12, overflow: 'hidden' },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  submitText: { color: '#fff', fontSize: 16, marginLeft: 8, fontWeight: '600' },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  recentComplaintsCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recentComplaintsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLORS.textDark,
  },
  recentComplaintItem: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  recentComplaintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  recentComplaintName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginLeft: 6,
    flex: 1,
  },
  recentComplaintDate: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  recentComplaintMessage: {
    fontSize: 13,
    color: COLORS.textDark,
    lineHeight: 18,
    paddingLeft: 28,
  },
});