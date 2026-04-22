import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useFarm } from '../context/FarmContext';
import { colors } from '../theme/colors';
import { AppIcon } from '../components/AppIcon';
import { getBlockDisplayName } from '../utils/blockDisplay';

export const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { farmData } = useFarm();

  const displayName = farmData?.name || user?.name || user?.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const email = farmData?.email || user?.email || '';
  const role = farmData?.role || '';
  const farmName = farmData?.farm_name || '';
  const location = farmData?.farm_location || '';
  const blockCount = farmData?.blocks?.length ?? 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {/* ── Hero Header ──────────────────────────────── */}
      <View style={styles.hero}>
        {/* Decorative background orbs */}
        <View style={styles.heroBlobTL} />
        <View style={styles.heroBlobBR} />

        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        {/* Avatar */}
        <View style={styles.heroAvatarWrap}>
          <View style={styles.heroAvatarRing}>
            <View style={styles.heroAvatar}>
              <Text style={styles.heroInitials}>{initials}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.heroName}>{displayName}</Text>
        {!!email && <Text style={styles.heroEmail}>{email}</Text>}

        {!!role && (
          <View style={styles.heroRoleBadge}>
            <Text style={styles.heroRoleText}>{role}</Text>
          </View>
        )}
      </View>

      {/* ── Scrollable body ──────────────────────────── */}
      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick stats row */}
        <View style={styles.statsRow}>
          <StatCard icon="brand" label="Farm" value={farmName || '—'} />
          <StatCard icon="location" label="Location" value={location || '—'} />
          <StatCard icon="dashboard" label="Blocks" value={blockCount ? `${blockCount}` : '—'} />
        </View>

        {/* Account section */}
        <SectionLabel text="Account" />
        <View style={styles.card}>
          <CardRow
            icon="mail"
            iconBg={colors.primaryContainer}
            label="Email Address"
            value={email || '—'}
          />
          {!!role && (
            <>
              <RowDivider />
              <CardRow
                icon="brand"
                iconBg={colors.primaryContainer}
                label="Role"
                value={role}
                valueCapitalize
              />
            </>
          )}
        </View>

        {/* Farm section */}
        <SectionLabel text="Farm" />
        <View style={styles.card}>
          <CardRow
            icon="brand"
            iconBg={colors.primaryContainer}
            label="Farm Name"
            value={farmName || '—'}
          />
          <RowDivider />
          <CardRow
            icon="location"
            iconBg={colors.primaryContainer}
            label="Location"
            value={location || '—'}
          />
          <RowDivider />
          <CardRow
            icon="dashboard"
            iconBg={colors.primaryContainer}
            label="Total Blocks"
            value={blockCount ? `${blockCount} block${blockCount > 1 ? 's' : ''}` : '—'}
          />
        </View>

        {/* Blocks section */}
        {farmData?.blocks && farmData.blocks.length > 0 && (
          <>
            <SectionLabel text="Blocks" />
            {farmData.blocks.map((block, index) => {
              const blockName = getBlockDisplayName(farmData.blocks, block);
              return (
                <View
                  key={block.block_id}
                  style={[styles.blockCard, index > 0 && { marginTop: 12 }]}
                >
                {/* Block header bar */}
                <View style={styles.blockBar}>
                  <View style={styles.blockBarLeft}>
                    <View style={styles.blockNumber}>
                      <Text style={styles.blockNumberText}>{index + 1}</Text>
                    </View>
                    <View>
                      <Text style={styles.blockBarName}>{blockName}</Text>
                      <Text style={styles.blockBarCrop}>{block.crop}</Text>
                    </View>
                  </View>
                  {!!block.area_ha && (
                    <View style={styles.blockAreaBadge}>
                      <Text style={styles.blockAreaText}>{block.area_ha} ha</Text>
                    </View>
                  )}
                </View>

                {/* Block detail chips */}
                <View style={styles.blockChips}>
                  {!!block.crop && (
                    <Chip icon="brand" label="Crop" value={block.crop} />
                  )}
                  {!!block.area_ha && (
                    <Chip icon="sensors" label="Area" value={`${block.area_ha} ha`} />
                  )}
                  {!!block.timezone && (
                    <Chip icon="timer" label="Timezone" value={block.timezone.replace('_', ' ')} />
                  )}
                  {!!block.description && (
                    <Chip icon="history" label="Notes" value={block.description} wide />
                  )}
                </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
};

/* ─── Sub-components ─────────────────────────────────────── */

const SectionLabel = ({ text }: { text: string }) => (
  <Text style={styles.sectionLabel}>{text}</Text>
);

const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <View style={styles.statCard}>
    <AppIcon name={icon} size={14} color={colors.primary} backgroundColor={colors.primaryContainer} />
    <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const CardRow = ({
  icon,
  iconBg,
  label,
  value,
  valueCapitalize,
}: {
  icon: any;
  iconBg: string;
  label: string;
  value: string;
  valueCapitalize?: boolean;
}) => (
  <View style={styles.cardRow}>
    <View style={styles.cardRowIcon}>
      <AppIcon name={icon} size={15} color={colors.primary} backgroundColor={iconBg} />
    </View>
    <View style={styles.cardRowText}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={[styles.cardValue, valueCapitalize && { textTransform: 'capitalize' }]}>
        {value}
      </Text>
    </View>
  </View>
);

const RowDivider = () => <View style={styles.rowDivider} />;

const Chip = ({
  icon,
  label,
  value,
  wide,
}: {
  icon: any;
  label: string;
  value: string;
  wide?: boolean;
}) => (
  <View style={[styles.chip, wide && styles.chipWide]}>
    <AppIcon name={icon} size={11} color={colors.primary} backgroundColor="transparent" />
    <View>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={styles.chipValue}>{value}</Text>
    </View>
  </View>
);

/* ─── Styles ─────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f0f4f2',
  },

  /* Hero */
  hero: {
    backgroundColor: colors.primary,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroBlobTL: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -80,
    left: -60,
  },
  heroBlobBR: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -50,
    right: -40,
  },
  backBtn: {
    alignSelf: 'flex-start',
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 6,
  },
  backArrow: {
    fontSize: 26,
    color: '#ffffff',
    lineHeight: 28,
    marginTop: -2,
    fontWeight: '300',
  },
  heroAvatarWrap: {
    marginBottom: 16,
  },
  heroAvatarRing: {
    padding: 4,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  heroInitials: {
    fontSize: 34,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
  heroName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 5,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  heroEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 14,
    textAlign: 'center',
  },
  heroRoleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  heroRoleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'capitalize',
    letterSpacing: 0.5,
  },

  /* Body */
  body: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  /* Stats row */
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#1f3b2f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurface,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* Section label */
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 4,
  },

  /* Card */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#1f3b2f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
  },
  cardRowIcon: {},
  cardRowText: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  cardValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onSurface,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#f0f4f2',
    marginLeft: 64,
  },

  /* Block card */
  blockCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#1f3b2f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 0,
  },
  blockBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  blockBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  blockNumber: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  blockNumberText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  blockBarName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  blockBarCrop: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 1,
    fontWeight: '500',
  },
  blockAreaBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  blockAreaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },

  /* Chips inside block */
  blockChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 14,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    width: '47%',
    backgroundColor: '#f0f4f2',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipWide: {
    width: '97%',
  },
  chipLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  chipValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.onSurface,
  },
});
