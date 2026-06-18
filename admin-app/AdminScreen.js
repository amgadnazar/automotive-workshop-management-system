import React from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export default function AdminScreen({ children }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
});
