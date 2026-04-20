import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService, SensorSnapshotHistoryEntry } from '../api/authService';
import { Card } from '../components/Card';
import { useFarm } from '../context/FarmContext';
import { HistoryScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';

interface HistoryMetricMap {
  moisture?: string;
  temperature?: string;
  humidity?: string;
  ph?: string;
  sunlight?: string;
  fertility?: string;
}

function formatObservedAt(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function buildMetricMap(entry: SensorSnapshotHistoryEntry): HistoryMetricMap {
  const metrics: HistoryMetricMap = {};

  entry.sensors.forEach(sensor => {
    const text = `${sensor.value} ${sensor.unit}`.trim();

    switch (sensor.sensor_type) {
      case 'soil_moisture':
        metrics.moisture = text;
        break;
      case 'soil_temperature':
        metrics.temperature = text;
        break;
      case 'humidity':
        metrics.humidity = text;
        break;
      case 'ph_level':
        metrics.ph = text;
        break;
      case 'sunlight':
        metrics.sunlight = text;
        break;
      case 'fertility':
        metrics.fertility = text;
        break;
      default:
        break;
    }
  });

  return metrics;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = () => {
  const { activeBlock } = useFarm();
  const [entries, setEntries] = useState<SensorSnapshotHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadHistory = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (!activeBlock?.block_id) {
      setEntries([]);
      setErrorMessage('Select a block from the dashboard to view sensor history.');
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (mode === 'refresh') {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      setErrorMessage(null);
      const response = await authService.getSnapshotHistory(activeBlock.block_id);
      setEntries(response.entries || []);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail ||
          error?.message ||
          'Unable to load sensor history right now.',
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeBlock?.block_id]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory]),
  );

  const renderItem = ({ item }: { item: SensorSnapshotHistoryEntry }) => {
    const metrics = buildMetricMap(item);

    return (
      <Card style={styles.historyCard}>
        <Text style={styles.date}>{formatObservedAt(item.observed_at)}</Text>
        <Text style={styles.event}>Manual sensor entry</Text>
        <Text style={styles.blockLabel}>{activeBlock?.lanslu || activeBlock?.crop || 'Selected block'}</Text>

        <View style={styles.metricGrid}>
          <Text style={styles.metricText}>Moisture: {metrics.moisture || '-'}</Text>
          <Text style={styles.metricText}>Temp: {metrics.temperature || '-'}</Text>
          <Text style={styles.metricText}>Humidity: {metrics.humidity || '-'}</Text>
          <Text style={styles.metricText}>pH: {metrics.ph || '-'}</Text>
          <Text style={styles.metricText}>Sunlight: {metrics.sunlight || '-'}</Text>
          <Text style={styles.metricText}>Fertility: {metrics.fertility || '-'}</Text>
        </View>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.stateText}>Loading block history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>{activeBlock?.lanslu || activeBlock?.crop || 'No block selected'}</Text>
      </View>

      {errorMessage ? (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{errorMessage}</Text>
        </View>
      ) : null}

      <FlatList
        data={entries}
        keyExtractor={item => item.snapshot_id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadHistory('refresh')}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No sensor entries yet</Text>
            <Text style={styles.emptyText}>
              Save observations from the Sensors tab for this block and they will appear here.
            </Text>
          </View>
        }
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.onSurface,
  },
  subtitle: {
    marginTop: 6,
    color: colors.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 14,
    paddingBottom: 120,
  },
  historyCard: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
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
  blockLabel: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginBottom: 12,
  },
  metricGrid: {
    gap: 6,
  },
  metricText: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  stateText: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 8,
  },
  emptyText: {
    maxWidth: 280,
    textAlign: 'center',
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
  messageBox: {
    marginHorizontal: 24,
    marginBottom: 8,
    backgroundColor: colors.errorContainer,
    borderRadius: 12,
    padding: 12,
  },
  messageText: {
    color: colors.onErrorContainer,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
