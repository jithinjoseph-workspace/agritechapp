import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  SectionList,
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

type HistoryFilter = 'today' | '7days' | '30days' | 'date';

type HistorySection = {
  title: string;
  data: VisibleHistoryEntry[];
};

type PreparedHistoryEntry = SensorSnapshotHistoryEntry & {
  dateKey: string;
  formattedDate: string;
  observedAtMs: number;
  sectionTitle: string;
  metrics: HistoryMetricMap;
};

type VisibleHistoryEntry = PreparedHistoryEntry & {
  displayNumber: number;
};

function formatDate(value: string) {
  const d = new Date(value);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  }).format(d);
}

function formatSectionDate(value: string) {
  const d = new Date(value);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

function formatSelectedDate(value: Date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(value);
}

function formatMonthTitle(value: Date) {
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(value);
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromDateKey(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getSectionTitle(value: string) {
  const entryDate = startOfDay(new Date(value));
  const today = startOfDay(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (entryDate.getTime() === today.getTime()) {
    return 'Today';
  }

  if (entryDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  return formatSectionDate(value);
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

const FILTERS: { key: HistoryFilter; label: string; days: number }[] = [
  { key: 'today', label: 'Today', days: 1 },
  { key: '7days', label: 'Last 7 days', days: 7 },
  { key: '30days', label: 'Last 30 days', days: 30 },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type HistoryCardProps = {
  item: VisibleHistoryEntry;
  blockName?: string;
};

const HistoryCard = React.memo(({ item, blockName }: HistoryCardProps) => {
  return (
    <View style={styles.histCard}>
      <View style={styles.histCardHeader}>
        <View>
          <Text style={styles.histDate}>{item.formattedDate}</Text>
          <Text style={styles.histBlock}>{blockName || 'Block'}</Text>
        </View>
        <View style={styles.entryBadge}>
          <Text style={styles.entryBadgeText}>#{item.displayNumber}</Text>
        </View>
      </View>

      <View style={styles.histDivider} />

      <View style={styles.chipGrid}>
        {METRIC_DEFS.map(def => {
          const val = item.metrics[def.key];
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
});

export const HistoryScreen: React.FC<HistoryScreenProps> = () => {
  const { activeBlock } = useFarm();
  const [entries, setEntries]       = useState<SensorSnapshotHistoryEntry[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>('7days');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDateKey, setSelectedDateKey] = useState(toDateKey(new Date()));
  const [calendarMonth, setCalendarMonth] = useState(startOfDay(new Date()));

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

  const preparedEntries = useMemo<PreparedHistoryEntry[]>(() => {
    return entries
      .map(entry => {
        const observedAt = new Date(entry.observed_at);
        return {
          ...entry,
          dateKey: toDateKey(observedAt),
          formattedDate: formatDate(entry.observed_at),
          observedAtMs: observedAt.getTime(),
          sectionTitle: getSectionTitle(entry.observed_at),
          metrics: buildMetrics(entry),
        };
      })
      .sort((a, b) => b.observedAtMs - a.observedAtMs);
  }, [entries]);

  const entryDateKeys = useMemo(() => {
    return new Set(preparedEntries.map(entry => entry.dateKey));
  }, [preparedEntries]);

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = Array(firstDay.getDay()).fill(null);

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(year, month, day));
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [calendarMonth]);

  const selectedDateLabel = useMemo(() => {
    return formatSelectedDate(fromDateKey(selectedDateKey));
  }, [selectedDateKey]);

  const visibleEntries = useMemo<VisibleHistoryEntry[]>(() => {
    let filteredEntries: PreparedHistoryEntry[];

    if (activeFilter === 'date') {
      filteredEntries = preparedEntries.filter(entry => entry.dateKey === selectedDateKey);
    } else {
      const selectedFilter = FILTERS.find(filter => filter.key === activeFilter) || FILTERS[1];
      const startDate = startOfDay(new Date());
      startDate.setDate(startDate.getDate() - selectedFilter.days + 1);
      const startMs = startDate.getTime();

      filteredEntries = preparedEntries.filter(entry => entry.observedAtMs >= startMs);
    }

    return filteredEntries.map((entry, index) => ({
      ...entry,
      displayNumber: index + 1,
    }));
  }, [activeFilter, preparedEntries, selectedDateKey]);

  const sections = useMemo<HistorySection[]>(() => {
    const grouped = new Map<string, VisibleHistoryEntry[]>();

    visibleEntries.forEach(entry => {
      const items = grouped.get(entry.sectionTitle) || [];
      items.push(entry);
      grouped.set(entry.sectionTitle, items);
    });

    return Array.from(grouped, ([title, data]) => ({ title, data }));
  }, [visibleEntries]);

  const renderItem = useCallback(({ item }: { item: VisibleHistoryEntry }) => (
    <HistoryCard item={item} blockName={activeBlock?.lanslu} />
  ), [activeBlock?.lanslu]);

  const changeCalendarMonth = (direction: -1 | 1) => {
    setCalendarMonth(current => new Date(current.getFullYear(), current.getMonth() + direction, 1));
  };

  const selectCalendarDate = (date: Date) => {
    setSelectedDateKey(toDateKey(date));
    setActiveFilter('date');
    setIsCalendarOpen(false);
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

      <View style={styles.filterRow}>
        {FILTERS.map(filter => {
          const isActive = activeFilter === filter.key;
          return (
            <Pressable
              key={filter.key}
              accessibilityRole="button"
              onPress={() => setActiveFilter(filter.key)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          accessibilityRole="button"
          onPress={() => setIsCalendarOpen(true)}
          style={[styles.filterChip, activeFilter === 'date' && styles.filterChipActive]}
        >
          <Text style={[styles.filterChipText, activeFilter === 'date' && styles.filterChipTextActive]}>
            {activeFilter === 'date' ? selectedDateLabel : 'Date'}
          </Text>
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={isCalendarOpen}
        onRequestClose={() => setIsCalendarOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsCalendarOpen(false)}>
          <Pressable style={styles.calendarPanel} onPress={() => {}}>
            <View style={styles.calendarHeader}>
              <Pressable
                accessibilityRole="button"
                onPress={() => changeCalendarMonth(-1)}
                style={styles.monthButton}
              >
                <Text style={styles.monthButtonText}>{'<'}</Text>
              </Pressable>
              <Text style={styles.calendarTitle}>{formatMonthTitle(calendarMonth)}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => changeCalendarMonth(1)}
                style={styles.monthButton}
              >
                <Text style={styles.monthButtonText}>{'>'}</Text>
              </Pressable>
            </View>

            <View style={styles.weekdayRow}>
              {WEEKDAYS.map(day => (
                <Text key={day} style={styles.weekdayText}>{day}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <View key={`empty-${index}`} style={styles.calendarDayCell} />;
                }

                const dateKey = toDateKey(date);
                const isSelected = dateKey === selectedDateKey;
                const hasEntries = entryDateKeys.has(dateKey);

                return (
                  <Pressable
                    key={dateKey}
                    accessibilityRole="button"
                    onPress={() => selectCalendarDate(date)}
                    style={[
                      styles.calendarDayCell,
                      isSelected && styles.calendarDaySelected,
                    ]}
                  >
                    <Text style={[styles.calendarDayText, isSelected && styles.calendarDayTextSelected]}>
                      {date.getDate()}
                    </Text>
                    {hasEntries && <View style={[styles.entryDot, isSelected && styles.entryDotSelected]} />}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Error banner */}
      {!!errorMessage && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      <SectionList
        sections={sections}
        keyExtractor={item => item.snapshot_id}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={40}
        windowSize={7}
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
              Save sensor readings from the Sensors tab or choose another date range.
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

  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dce7df',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
  },
  filterChipTextActive: {
    color: '#ffffff',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 27, 20, 0.34)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  calendarPanel: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#1f3b2f',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  calendarTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.onSurface,
  },
  monthButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f4f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekdayText: {
    width: '14.285%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '800',
    color: colors.onSurfaceVariant,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayCell: {
    width: '14.285%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  calendarDaySelected: {
    backgroundColor: colors.primary,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
  },
  calendarDayTextSelected: {
    color: '#ffffff',
  },
  entryDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.primary,
    marginTop: 3,
  },
  entryDotSelected: {
    backgroundColor: '#ffffff',
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
    paddingTop: 2,
    paddingBottom: 120,
    gap: 12,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.onSurfaceVariant,
    marginTop: 4,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
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
