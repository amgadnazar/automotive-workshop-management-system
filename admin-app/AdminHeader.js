import React from 'react';
import { Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export default function AdminHeader({ title }) {
  return <Text style={styles.title}>{title}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
});
