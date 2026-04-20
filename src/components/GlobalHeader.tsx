import React, { useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { useFarm } from '../context/FarmContext';
import { useAuth } from '../context/AuthContext';
import { AppIcon } from './AppIcon';
import { RootStackParamList } from '../navigation/types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const GlobalHeader = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();

  const { farmData, activeBlock, setActiveBlockById } = useFarm();
  const { user, logout } = useAuth();

  const [isBlockDropdownOpen, setIsBlockDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;
  const translateY = useRef(new Animated.Value(-8)).current;

  const openUserMenu = () => {
    setIsUserMenuOpen(true);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 130, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const closeUserMenu = (cb?: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.94, duration: 150, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -8, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setIsUserMenuOpen(false);
      cb?.();
    });
  };

  const handleViewProfile = () => closeUserMenu(() => navigation.navigate('ProfileScreen'));
  const handleLogoutTap = () => closeUserMenu(() => setIsLogoutConfirmOpen(true));
  const handleConfirmLogout = async () => {
    setIsLogoutConfirmOpen(false);
    await logout();
  };

  if (!farmData || !activeBlock) return null;

  const displayName = farmData?.name || user?.name || user?.email?.split('@')[0] || 'User';
  const firstName = displayName.split(' ')[0];
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {/* ╔══════════════════════════════════════╗
          ║          TOP APP BAR                 ║
          ╚══════════════════════════════════════╝ */}
      <View style={[styles.bar, { paddingTop: insets.top + 10 }]}>

        {/* Left — farm + block selector */}
        <View style={styles.barLeft}>
          <View style={styles.farmIconWrap}>
            <AppIcon
              name="location"
              size={16}
              color={colors.primary}
              backgroundColor={colors.primaryContainer}
            />
          </View>
          <View style={styles.farmText}>
            <Text style={styles.farmName} numberOfLines={1}>{farmData.farm_name}</Text>
            <TouchableOpacity
              style={styles.blockSelector}
              onPress={() => setIsBlockDropdownOpen(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.blockLabel} numberOfLines={1}>
                {activeBlock.crop}
                <Text style={styles.blockSep}> · </Text>
                {activeBlock.lanslu}
              </Text>
              <View style={styles.chevronWrap}>
                <AppIcon name="expand" size={11} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Vertical divider */}
        <View style={styles.barDivider} />

        {/* Right — user chip */}
        <TouchableOpacity
          style={styles.userChip}
          onPress={openUserMenu}
          activeOpacity={0.8}
        >
          <View style={styles.userTextCol}>
            <Text style={styles.greetText}>Hello 👋</Text>
            <Text style={styles.userNameText} numberOfLines={1}>{firstName}</Text>
          </View>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* ╔══════════════════════════════════════╗
          ║       BLOCK DROPDOWN MODAL           ║
          ╚══════════════════════════════════════╝ */}
      <Modal visible={isBlockDropdownOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.scrim}
          onPress={() => setIsBlockDropdownOpen(false)}
          activeOpacity={1}
        >
          <View style={[styles.dropdown, { marginTop: insets.top + 58 }]}>
            <Text style={styles.dropdownHeader}>Select Block</Text>
            {farmData.blocks.map(block => {
              const isActive = activeBlock.block_id === block.block_id;
              return (
                <TouchableOpacity
                  key={block.block_id}
                  style={[styles.dropdownItem, isActive && styles.dropdownItemActive]}
                  onPress={() => { setActiveBlockById(block.block_id); setIsBlockDropdownOpen(false); }}
                  activeOpacity={0.75}
                >
                  <View style={styles.dropdownItemInner}>
                    <Text style={[styles.dropdownItemName, isActive && styles.dropdownNameActive]}>
                      {block.lanslu}
                    </Text>
                    <Text style={styles.dropdownItemCrop}>{block.crop}</Text>
                  </View>
                  {isActive && (
                    <AppIcon
                      name="check"
                      size={13}
                      color={colors.primary}
                      backgroundColor={colors.primaryContainer}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ╔══════════════════════════════════════╗
          ║         USER MENU MODAL              ║
          ╚══════════════════════════════════════╝ */}
      <Modal visible={isUserMenuOpen} transparent animationType="none">
        <TouchableOpacity style={styles.scrim} onPress={() => closeUserMenu()} activeOpacity={1}>
          <Animated.View
            style={[
              styles.userMenu,
              { marginTop: insets.top + 58, opacity: fadeAnim, transform: [{ scale: scaleAnim }, { translateY }] },
            ]}
          >
            {/* Menu identity header */}
            <View style={styles.menuHeader}>
              <View style={styles.menuAvatar}>
                <Text style={styles.menuAvatarText}>{initials}</Text>
              </View>
              <View style={styles.menuHeaderText}>
                <Text style={styles.menuName}>{displayName}</Text>
                {!!(farmData?.email || user?.email) && (
                  <Text style={styles.menuEmail} numberOfLines={1}>
                    {farmData?.email || user?.email}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.menuDivider} />

            {/* View Profile — NO arrow */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleViewProfile}
              activeOpacity={0.72}
            >
              <AppIcon
                name="settings"
                size={15}
                color={colors.primary}
                backgroundColor={colors.primaryContainer}
              />
              <Text style={styles.menuItemText}>View Profile</Text>
            </TouchableOpacity>

            <View style={styles.menuItemDivider} />

            {/* Logout */}
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={handleLogoutTap}
              activeOpacity={0.72}
            >
              <AppIcon
                name="logout"
                size={15}
                color={colors.error}
                backgroundColor={colors.errorContainer}
              />
              <Text style={[styles.menuItemText, { color: colors.error }]}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* ╔══════════════════════════════════════╗
          ║     LOGOUT CONFIRMATION MODAL        ║
          ╚══════════════════════════════════════╝ */}
      <Modal visible={isLogoutConfirmOpen} transparent animationType="fade">
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIconCircle}>
              <AppIcon name="logout" size={22} color={colors.error} backgroundColor="transparent" />
            </View>
            <Text style={styles.confirmTitle}>Log Out?</Text>
            <Text style={styles.confirmBody}>
              You'll be signed out of your account and will need to log in again to access your farm.
            </Text>
            <View style={styles.confirmRow}>
              <TouchableOpacity
                style={styles.confirmCancel}
                onPress={() => setIsLogoutConfirmOpen(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmLogout}
                onPress={handleConfirmLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmLogoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

/* ─── Styles ──────────────────────────────────────────────── */
const styles = StyleSheet.create({
  /* Top bar */
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    ...Platform.select({
      android: { elevation: 4 },
      ios: {
        shadowColor: '#1f3b2f',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
    }),
  },
  barLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 8,
  },
  farmIconWrap: {},
  farmText: {
    flex: 1,
  },
  farmName: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 3,
  },
  blockSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  blockLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.onSurface,
    letterSpacing: 0.1,
  },
  blockSep: {
    color: colors.onSurfaceVariant,
    fontWeight: '400',
  },
  chevronWrap: {
    marginTop: 1,
  },

  /* Vertical divider */
  barDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.outlineVariant,
    marginHorizontal: 8,
  },

  /* User chip */
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userTextCol: {
    alignItems: 'flex-end',
  },
  greetText: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  userNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurface,
    maxWidth: 80,
  },
  avatarWrap: {
    padding: 2,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.primaryContainer,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.4,
  },

  /* Scrim */
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(16,24,40,0.22)',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
  },

  /* Block dropdown */
  dropdown: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: '#1f3b2f',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 14,
  },
  dropdownHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 18,
    marginHorizontal: 8,
    borderRadius: 12,
  },
  dropdownItemActive: {
    backgroundColor: colors.surfaceContainerLow,
  },
  dropdownItemInner: {},
  dropdownItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 2,
  },
  dropdownNameActive: {
    color: colors.primary,
  },
  dropdownItemCrop: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },

  /* User menu */
  userMenu: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    overflow: 'hidden',
    minWidth: 230,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: '#1f3b2f',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 18,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.primary,
  },
  menuAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  menuAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  menuHeaderText: {
    flex: 1,
  },
  menuName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  menuEmail: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  menuItemLast: {
    // no bottom border needed
  },
  menuItemDivider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginHorizontal: 18,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
  },

  /* Logout confirmation */
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(16,24,40,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  confirmCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.22,
    shadowRadius: 40,
    elevation: 22,
  },
  confirmIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.onSurface,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  confirmBody: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  confirmRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmCancel: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
  },
  confirmCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onSurface,
  },
  confirmLogout: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: colors.error,
    alignItems: 'center',
  },
  confirmLogoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
