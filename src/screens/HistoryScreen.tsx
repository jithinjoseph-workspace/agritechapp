import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';
import { HistoryScreenProps } from '../navigation/types';

interface HistoryItem {
  id: string;
  date: string;
  event: string;
  details: string;
}

const mockHistory: HistoryItem[] = [
  { id: '1', date: 'Today, 08:30 AM', event: 'Watering Triggered', details: 'Moisture dropped to 38%, auto-irrigation activated.' },
  { id: '2', date: 'Yesterday, 04:15 PM', event: 'Temperature Alert', details: 'Temp increased to 32°C. Ventilation system activated.' },
  { id: '3', date: 'Oct 23, 10:00 AM', event: 'Fertilization Completed', details: 'Nitrogen levels replenished based on schedule.' },
  { id: '4', date: 'Oct 21, 09:20 AM', event: 'System Check', details: 'All sensors calibrated and working nominally.' },
];

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const renderItem = ({ item }: { item: HistoryItem }) => (
    <Card style={styles.historyCard}>
      <Text style={styles.date}>{item.date}</Text>
      <Text style={styles.event}>{item.event}</Text>
      <Text style={styles.details}>{item.details}</Text>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Action History</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Back</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.onSurface,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: 24,
    gap: 16,
  },
  historyCard: {
    padding: 16,
  },
  date: {
    fontSize: 12,
    color: colors.outline,
    marginBottom: 4,
  },
  event: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 6,
  },
  details: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
});
