import React, { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useFarm } from '../context/FarmContext';
import { AppIcon } from './AppIcon';

export const GlobalHeader = () => {
  const insets = useSafeAreaInsets();
  const { farmData, activeBlock, setActiveBlockById } = useFarm();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!farmData || !activeBlock) {
    return null;
  }

  return (
    <>
      <View style={[styles.topAppBar, { paddingTop: insets.top + 12 }]}>
        <View style={styles.topAppBarLeft}>
          <AppIcon
            name="location"
            size={18}
            color={colors.primary}
            backgroundColor={colors.primaryContainer}
            style={styles.headerIcon}
          />
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerSubtitle}>{farmData.farm_name}</Text>
            <TouchableOpacity
              style={styles.dropdownSelector}
              onPress={() => setIsDropdownOpen(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.headerTitle}>
                {activeBlock.crop} | {activeBlock.lanslu}
              </Text>
              <AppIcon name="expand" size={14} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.profileImageContainer}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9yhccCSgb2Hj2oG4QryhDc8rA0DtSUFHJMnaEmWmnNF09vRc51UjQw9qj2lZ5SvxhOVOe1D1OKaus1pKHtlXsRGfPA6kno5JAjiV-jaGY1Rt6JFuZPX64Bi_FxCDhG9z2nhXSAA1ka602ixlHV7r5rXufPuJbcgq1rjMgoO-j1OjNQa8BprBi1nDxbQ1Q9tYXyVCQxiws3qq2a1_1Z8lxbyMq2mQYOY2_BZXgfTPCQYsSdi3iPKY0P46k1i14hLLywCDWnDYYvCVY',
            }}
            style={styles.profileImage}
          />
        </View>
      </View>

      <Modal visible={isDropdownOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setIsDropdownOpen(false)} activeOpacity={1}>
          <View style={[styles.dropdownMenu, { marginTop: insets.top + 54 }]}>
            {farmData.blocks.map(block => {
              const isActive = activeBlock.block_id === block.block_id;

              return (
                <TouchableOpacity
                  key={block.block_id}
                  style={[styles.dropdownItem, isActive && styles.dropdownItemActive]}
                  onPress={() => {
                    setActiveBlockById(block.block_id);
                    setIsDropdownOpen(false);
                  }}
                >
                  <View>
                    <Text style={[styles.dropdownItemTitle, isActive && styles.dropdownItemTitleActive]}>{block.lanslu}</Text>
                    <Text style={styles.dropdownItemSubtitle}>{block.crop}</Text>
                  </View>
                  {isActive ? (
                    <AppIcon
                      name="check"
                      size={15}
                      color={colors.primary}
                      backgroundColor={colors.primaryContainer}
                    />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  topAppBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: 'rgba(244, 246, 248, 0.98)',
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  topAppBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTextBlock: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginRight: 8,
  },
  profileImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 24, 40, 0.18)',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
  },
  dropdownMenu: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  dropdownItemActive: {
    backgroundColor: colors.surfaceContainerLow,
  },
  dropdownItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onSurface,
  },
  dropdownItemTitleActive: {
    color: colors.primary,
  },
  dropdownItemSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
});
