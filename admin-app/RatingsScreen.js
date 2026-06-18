import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getAuth } from 'firebase/auth';
import { ADMIN_COLORS } from '../constants/adminTheme';
import i18n from '../src/localization/i18n';

const isRTL = i18n.locale.startsWith('ar');

const API_BASE_URL = 'http://10.0.2.2:5000/api/ratings';

const getFirebaseToken = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

async function fetchFromAPI(endpoint) {
  try {
    const token = await getFirebaseToken();
    if (!token) {
      console.log('No user logged in');
      return null;
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (response.status === 401) {
      console.log('Token invalid or expired');
      return null;
    }
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API fetch error:', error);
    return null;
  }
}

function calculateAppRating(ratingsData) {
  const appRatings = ratingsData.filter(rating => !rating.engineerId || rating.type === 'app_rating');
  
  if (appRatings.length === 0) {
    return { average: 0, totalReviews: 0 };
  }
  
  const sum = appRatings.reduce((acc, item) => acc + (item.rating || 0), 0);
  const average = sum / appRatings.length;
  
  return {
    average: average,
    totalReviews: appRatings.length
  };
}

function transformEngineerRatings(ratingsData) {
  const engineerRatings = ratingsData.filter(rating => rating.engineerId && rating.engineerId !== 'app');
  
  const engineerMap = new Map();
  engineerRatings.forEach(rating => {
    const engineerId = rating.engineerId;
    const engineerName = rating.engineerName || `Engineer ${engineerId}`;
    const ratingValue = rating.rating || 0;
    
    if (!engineerMap.has(engineerId)) {
      engineerMap.set(engineerId, {
        id: engineerId,
        name: engineerName,
        ratingSum: 0,
        reviewCount: 0
      });
    }
    const eng = engineerMap.get(engineerId);
    eng.ratingSum += ratingValue;
    eng.reviewCount += 1;
  });
  
  return Array.from(engineerMap.values()).map(eng => ({
    id: eng.id,
    name: eng.name,
    rating: eng.reviewCount > 0 ? eng.ratingSum / eng.reviewCount : 0,
    reviews: eng.reviewCount
  }));
}

function formatDate(dateValue) {
  if (!dateValue) return '';
  
  try {
    
    if (dateValue && typeof dateValue.toDate === 'function') {
      const date = dateValue.toDate();
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-GB');
      }
    }
    
    if (typeof dateValue === 'string') {
      if (dateValue.includes('new Date()')) {
        return new Date().toLocaleDateString('en-GB');
      }
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
    
    if (dateValue instanceof Date) {
      if (!isNaN(dateValue.getTime())) {
        return dateValue.toLocaleDateString('en-GB');
      }
    }
    
    if (typeof dateValue === 'number') {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-GB');
      }
    }
    
    return '';
  } catch (error) {
    console.log('Date parsing error:', error);
    return '';
  }
}

function transformComplaints(complaintsData) {
  if (!complaintsData) return [];
  
  console.log('📋 Raw complaints data:', JSON.stringify(complaintsData[0], null, 2));
  
  return complaintsData.map(complaint => {

    let dateValue = complaint.createdAt || complaint.date || complaint.timestamp;
    let formattedDate = formatDate(dateValue);
    
    if (!formattedDate) {
      formattedDate = new Date().toLocaleDateString('en-GB');
    }
    
    return {
  id: complaint.id,
  customerId: complaint.customerId, 
  customerName: complaint.customerName || complaint.customerId || 'Unknown',
  message: complaint.message || '',
  date: formattedDate
};
  });
}

function Stars({ value }) {
  return (
    <View style={{ flexDirection: 'row', marginTop: 4 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={`star-${i}`}
          name={i <= Math.round(value) ? 'star' : 'star-outline'}
          size={18}
          color="#facc15"
          style={{ marginRight: 2 }}
        />
      ))}
    </View>
  );
}


export default function RatingsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [appRating, setAppRating] = useState({ average: 0, totalReviews: 0 });
  const [engineerRatings, setEngineerRatings] = useState([]);
  const [customerComplaints, setCustomerComplaints] = useState([]);

  const loadData = useCallback(async () => {
    try {

      const ratingsData = await fetchFromAPI('/');
      
      if (ratingsData && Array.isArray(ratingsData)) {
        const appStats = calculateAppRating(ratingsData);
        setAppRating({
          average: appStats.average,
          totalReviews: appStats.totalReviews
        });
        
        const engineers = transformEngineerRatings(ratingsData);
        setEngineerRatings(engineers);
      }
      

      const complaintsData = await fetchFromAPI('/complaints');
      if (complaintsData && Array.isArray(complaintsData)) {
        const complaints = transformComplaints(complaintsData);
        setCustomerComplaints(complaints);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <View style={[styles.root, styles.centerLoading]}>
        <ActivityIndicator size="large" color={ADMIN_COLORS.primary} />
      </View>
    );
  }
const contactCustomer = async (customerId) => {
  try {
    const userData = await fetchFromAPI(
      `/user-email/${customerId}`
    );

    if (!userData?.email) {
      Alert.alert(
        "Error",
        "Email not found"
      );
      return;
    }

    const emailUrl =
      `mailto:${userData.email}`;

    await Linking.openURL(
      emailUrl
    );

  } catch (error) {
    console.log(
      "Contact error:",
      error
    );

    Alert.alert(
      "Error",
      "Cannot open email"
    );
  }
};
  return (
    <View style={styles.root}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* HEADER */}
        <LinearGradient
          colors={[ADMIN_COLORS.primary, ADMIN_COLORS.secondary]}
          style={styles.header}
        >
          <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>
            {i18n.t('admin.ratings.title')}
          </Text>
        </LinearGradient>

        {/* ===== APP RATING SECTION ===== */}
        <View style={styles.appRatingCard}>
          <View style={styles.appRatingIcon}>
            <Ionicons name="logo-google-playstore" size={32} color={ADMIN_COLORS.primary} />
          </View>
          <Text style={styles.appRatingTitle}>التطبيق</Text>
          <Text style={styles.appRatingValue}>
            {appRating.average.toFixed(1)}
          </Text>
          <Stars value={appRating.average} />
          <Text style={styles.reviewCount}>
            {appRating.totalReviews} {i18n.t('common.reviews')}
          </Text>
        </View>

        {/* ===== ENGINEER RATINGS SECTION ===== */}
        <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
          {i18n.t('admin.ratings.engineerRatings')}
        </Text>

        {engineerRatings.length === 0 ? (
          <Text key="empty-engineers" style={styles.emptyText}>
            No engineer ratings yet
          </Text>
        ) : (
          engineerRatings.map((eng) => (
            <View key={`engineer-${eng.id}`} style={styles.engineerCard}>
              <View style={styles.engineerInfo}>
                <Ionicons name="person" size={28} color={ADMIN_COLORS.primary} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.engineerName}>{eng.name}</Text>
                  <Stars value={eng.rating} />
                  <Text style={styles.reviewCount}>
                    {eng.reviews} {i18n.t('common.reviews')}
                  </Text>
                </View>
              </View>
              <Text style={styles.engineerRating}>
                {eng.rating.toFixed(1)}
              </Text>
            </View>
          ))
        )}

        {/* ===== CUSTOMER COMPLAINTS SECTION ===== */}
        <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
          {i18n.t('admin.ratings.customerComplaints')}
        </Text>

        {customerComplaints.length === 0 ? (
          <Text key="empty-complaints" style={styles.emptyText}>
            No complaints yet
          </Text>
        ) : (
          customerComplaints.map((item) => (
            <View key={`complaint-${item.id}`} style={styles.complaintCard}>
              <View style={styles.complaintHeader}>
                <TouchableOpacity
  onPress={() =>
    contactCustomer(
          item.customerId 
    )
  }
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  }}
>
  <Ionicons
    name="person-circle"
    size={24}
    color={ADMIN_COLORS.primary}
  />

  <View style={styles.complaintInfo}>
    <Text
      style={styles.customerName}
    >
      {item.customerName}
    </Text>
  </View>
</TouchableOpacity>
                <View style={styles.complaintInfo}>
                 
                </View>
                <Text style={styles.complaintDate}>{item.date || 'No date'}</Text>
              </View>
              <Text style={styles.complaintMessage}>{item.message}</Text>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ADMIN_COLORS.background,
  },
  centerLoading: {
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: 'bold',
    color: ADMIN_COLORS.white,
  },
  appRatingCard: {
    backgroundColor: ADMIN_COLORS.surface,
    margin: 20,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
  },
  appRatingIcon: {
    marginBottom: 8,
  },
  appRatingTitle: {
    fontSize: 14,
    color: ADMIN_COLORS.textLight,
    marginBottom: 4,
  },
  appRatingValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: ADMIN_COLORS.textDark,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 20,
    marginTop: 24,
    marginBottom: 12,
    color: ADMIN_COLORS.textDark,
  },
  engineerCard: {
    backgroundColor: ADMIN_COLORS.surface,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
  },
  engineerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  engineerName: {
    fontSize: 16,
    fontWeight: '600',
    color: ADMIN_COLORS.textDark,
  },
  engineerRating: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ADMIN_COLORS.textDark,
  },
  reviewCount: {
    fontSize: 12,
    color: ADMIN_COLORS.textLight,
    marginTop: 4,
  },
  complaintCard: {
    backgroundColor: ADMIN_COLORS.surface,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
  },
  complaintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  complaintInfo: {
    flex: 1,
    marginLeft: 8,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: ADMIN_COLORS.textDark,
  },
  customerId: {
    fontSize: 10,
    color: ADMIN_COLORS.textLight,
    marginTop: 2,
  },
  complaintDate: {
    fontSize: 11,
    color: ADMIN_COLORS.textLight,
  },
  complaintMessage: {
    fontSize: 14,
    color: ADMIN_COLORS.textDark,
    lineHeight: 20,
    marginTop: 8,
    paddingLeft: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: ADMIN_COLORS.textLight,
    marginTop: 20,
    marginBottom: 20,
    fontSize: 14,
  },
});