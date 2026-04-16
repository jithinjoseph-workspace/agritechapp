import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../theme/colors';

// Replaced placeholder with real MaterialIcons

const DisplayStatCard = ({ iconName, iconBg, iconColor, title, value, changeText, changeIcon, isError }: any) => (
  <View style={styles.statCard}>
    <View style={styles.statHeader}>
      <View style={{ backgroundColor: iconBg, padding: 8, borderRadius: 8 }}>
        <Icon name={iconName.replace(/_/g, '-')} color={iconColor} size={18} />
      </View>
      <Text style={styles.statName}>{title}</Text>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <View style={styles.changeTextRow}>
      <Icon name={changeIcon.replace(/_/g, '-')} color={isError ? colors.error : colors.secondary} size={12} />
      <Text style={isError ? styles.statChangeError : styles.statChangeNeutral}>{changeText}</Text>
    </View>
  </View>
);

// Removed BlockCard component

export const DashboardScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Quick Stats Bento Grid - All Sensors Display */}
        <View style={styles.quickStatsGrid}>
          <DisplayStatCard
            iconName="water_drop" iconBg="rgba(1, 45, 29, 0.1)" iconColor={colors.primary}
            title="MOISTURE" value="42.8%" changeText="-2.4% vs Yesterday" changeIcon="trending_down" isError={true}
          />
          <DisplayStatCard
            iconName="device_thermostat" iconBg="rgba(0, 108, 72, 0.1)" iconColor={colors.secondary}
            title="TEMP" value="24°C" changeText="+1.2% vs Avg" changeIcon="trending_up" isError={false}
          />
          <DisplayStatCard
            iconName="humidity_low" iconBg="rgba(0, 69, 45, 0.1)" iconColor={colors.tertiary}
            title="HUMIDITY" value="68%" changeText="Stable" changeIcon="remove" isError={false}
          />
          <DisplayStatCard
            iconName="science" iconBg="rgba(176, 241, 204, 0.4)" iconColor={colors.tertiary}
            title="pH LEVEL" value="6.4" changeText="Target: 6.2-6.8" changeIcon="check_circle" isError={false}
          />
          <DisplayStatCard
            iconName="wb_sunny" iconBg="rgba(255, 218, 106, 0.2)" iconColor="#D97706"
            title="SUNLIGHT" value="850 W/m²" changeText="Optimal" changeIcon="trending_up" isError={false}
          />
          <DisplayStatCard
            iconName="compost" iconBg="rgba(1, 45, 29, 0.1)" iconColor={colors.primary}
            title="FERTILITY" value="78 EC" changeText="Stable" changeIcon="remove" isError={false}
          />

          {/* New Farm Mapping Card - Hidden for now */}
          {/* <TouchableOpacity
            style={[styles.statCard, { backgroundColor: colors.primary, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
            onPress={() => navigation.navigate('Mapping')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 12 }}>
                <Icon name="map" color="#fff" size={24} />
              </View>
              <View>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Farm Boundaries</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Map your blocks & areas</Text>
              </View>
            </View>
            <Icon name="chevron-right" color="#fff" size={24} />
          </TouchableOpacity> */}

          {/* Adding bottom padding so nothing hides behind bottom bar */}
          <View style={{ height: 48, width: '100%' }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 120, gap: 32 },

  quickStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 },
  statCard: { width: '47%', backgroundColor: colors.surfaceContainerLowest, borderRadius: 24, padding: 24, elevation: 4 },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  statIconContainerPrimary: { backgroundColor: 'rgba(1, 45, 29, 0.1)', padding: 8, borderRadius: 8 },
  statIconContainerSecondary: { backgroundColor: 'rgba(0, 108, 72, 0.1)', padding: 8, borderRadius: 8 },
  statName: { fontSize: 11, fontWeight: 'bold', color: colors.onSurfaceVariant, flexShrink: 1, flexWrap: 'wrap' },
  statValue: { fontSize: 32, fontWeight: '900', color: colors.primary, marginBottom: 8 },
  changeTextRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statChangeError: { fontSize: 9, fontWeight: 'bold', color: colors.error, flexShrink: 1 },
  statChangeNeutral: { fontSize: 9, fontWeight: 'bold', color: colors.secondary, flexShrink: 1 },
});
