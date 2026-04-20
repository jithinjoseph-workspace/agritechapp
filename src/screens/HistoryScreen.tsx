import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService, SensorSnapshotHistoryEntry } from '../api/authService';
import { useFarm } from '../context/FarmContext';
import { HistoryScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';
import { AppIcon } from '../components/AppIcon';

interface HistoryMetricMap {
  moisture?: string;
  temperature?: string;
  humidity?: string;
  ph?: string;
  sunlight?: string;
  fertility?: string;
}

function formatDate(value: string) {
  const d = new Date(value);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  }).format(d);
}

function buildMetrics(entry: SensorSnapshotHistoryEntry): HistoryMetricMap {
  const m: HistoryMetricMap = {};
  entry.sensors.forEach(s => {
    const t = `${s.value} ${s.unit}`.trim();
    switch (s.sensor_type) {
      case 'soil_moisture':    m.moisture    = t; break;
      case 'soil_temperature': m.temperature = t; break;
      case 'humidity':         m.humidity    = t; break;
      case 'ph_level':         m.ph          = t; break;
      case 'sunlight':         m.sunlight    = t; break;
      case 'fertility':        m.fertility   = t; break;
    }
  });
  return m;
}

const METRIC_DEFS: { key: keyof HistoryMetricMap; label: string; icon: any }[] = [
  { key: 'moisture',    label: 'Moisture',   icon: 'moisture'    },
  { key: 'temperature', label: 'Temp.',      icon: 'temperature' },
  { key: 'humidity',    label: 'Humidity',   icon: 'humidity'    },
  { key: 'ph',          label: 'pH',         icon: 'ph'          },
  { key: 'sunlight',    label: 'Sunlight',   icon: 'sunlight'    },
  { key: 'fertility',   label: 'Fertility',  icon: 'fertility'   },
];

export const HistoryScreen: React.FC<HistoryScreenProps> = () => {
  const { activeBlock } = useFarm();
  const [entries, setEntries]       = useState<SensorSnapshotHistoryEntry[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (!activeBlock?.block_id) {
      setEntries([]);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }
    mode === 'refresh' ? setIsRefreshing(true) : setIsLoading(true);
    try {
      setErrorMessage(null);
      const res = await authService.getSnapshotHistory(activeBlock.block_id);
      setEntries(res.entries || []);
    } catch (e: any) {
      setErrorMessage(e?.response?.data?.detail || e?.message || 'Unable to load history.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeBlock?.block_id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const renderItem = ({ item, index }: { item: SensorSnapshotHistoryEntry; index: number }) => {
    const metrics = buildMetrics(item);
    return (
      <View style={styles.histCard}>
        {/* Card header */}
        <View style={styles.histCardHeader}>
          <View>
            <Text style={styles.histDate}>{formatDate(item.observed_at)}</Text>
            <Text style={styles.histBlock}>{activeBlock?.lanslu || 'Block'}</Text>
          </View>
          <View style={styles.entryBadge}>
            <Text style={styles.entryBadgeText}>#{entries.length - index}</Text>
          </View>
        </View>

        <View style={styles.histDivider} />

        {/* Metric chips */}
        <View style={styles.chipGrid}>
          {METRIC_DEFS.map(def => {
            const val = metrics[def.key];
            if (!val) return null;
            return (
              <View key={def.key} style={styles.metricChip}>
                <AppIcon
                  name={def.icon}
                  size={11}
                  color={colors.primary}
                  backgroundColor="transparent"
                />
                <View>
                  <Text style={styles.chipLabel}>{def.label}</Text>
                  <Text style={styles.chipValue}>{val}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading history…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageLabel}>History</Text>
        {!!activeBlock && (
          <View style={styles.blockPill}>
            <Text style={styles.blockPillText}>{activeBlock.lanslu}</Text>
          </View>
        )}
      </View>

      {/* Error banner */}
      {!!errorMessage && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      <FlatList
        data={entries}
        keyExtractor={item => item.snapshot_id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => load('refresh')}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <AppIcon name="history" size={24} color={colors.primary} backgroundColor="transparent" />
            </View>
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptyText}>
              Save sensor readings from the Sensors tab and they'll appear here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f2' },

  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  loadingText: {
    fontSize: 14, color: colors.onSurfaceVariant,
  },

  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 14,
  },
  pageLabel: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.onSurface,
    letterSpacing: 0.2,
  },
  blockPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.primaryContainer,
  },
  blockPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },

  errorBanner: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: colors.errorContainer,
    borderRadius: 14,
    padding: 12,
  },
  errorText: {
    color: colors.onErrorContainer,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  list: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 120,
    gap: 12,
  },

  /* History card */
  histCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#1f3b2f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  histCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.primary,
  },
  histDate: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  histBlock: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
  },
  entryBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  entryBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  histDivider: {
    height: 1,
    backgroundColor: '#f0f4f2',
  },

  /* Metric chips */
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
  },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '30%',
    backgroundColor: '#f0f4f2',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  chipLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 1,
  },
  chipValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurface,
  },

  /* Empty state */
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    paddingHorizontal: 30,
    gap: 12,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.onSurface,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    maxWidth: 260,
  },
});
