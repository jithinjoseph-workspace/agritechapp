import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const IconPlaceholder = ({ name, color, size }: { name: string, color: string, size: number }) => (
  <Text style={{ color, fontSize: size, fontWeight: 'bold' }}>
    {name === 'expand_more' ? '🔽' : 
     name === 'location_on' ? '📍' : 
     name === 'check_circle' ? '✅' : ''}
  </Text>
);

import { useAuth } from '../context/AuthContext';
import { useFarm } from '../context/FarmContext';

export const GlobalHeader = () => {
  const insets = useSafeAreaInsets();
  const { farmData, activeBlock, setActiveBlockById } = useFarm();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!farmData || !activeBlock) return null;

  return (
    <>
      <View style={[styles.topAppBar, { paddingTop: insets.top + 16 }]}>
        <View style={styles.topAppBarLeft}>
          <IconPlaceholder name="location_on" color={colors.secondary} size={18} />
          <View>
            <Text style={styles.headerSubtitle}>{farmData.farm_name.toUpperCase()}</Text>
            <TouchableOpacity 
              style={styles.dropdownSelector} 
              onPress={() => setIsDropdownOpen(true)}
            >
              <Text style={styles.headerTitle}>{activeBlock.crop} - {activeBlock.lanslu}</Text>
              <IconPlaceholder name="expand_more" color={colors.secondary} size={20} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.profileImageContainer}>
          <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9yhccCSgb2Hj2oG4QryhDc8rA0DtSUFHJMnaEmWmnNF09vRc51UjQw9qj2lZ5SvxhOVOe1D1OKaus1pKHtlXsRGfPA6kno5JAjiV-jaGY1Rt6JFuZPX64Bi_FxCDhG9z2nhXSAA1ka602ixlHV7r5rXufPuJbcgq1rjMgoO-j1OjNQa8BprBi1nDxbQ1Q9tYXyVCQxiws3qq2a1_1Z8lxbyMq2mQYOY2_BZXgfTPCQYsSdi3iPKY0P46k1i14hLLywCDWnDYYvCVY' }} 
            style={styles.profileImage} 
          />
        </View>
      </View>

      {/* Block Dropdown Selector Modal */}
      <Modal visible={isDropdownOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setIsDropdownOpen(false)} activeOpacity={1}>
          <View style={[styles.dropdownMenu, { marginTop: insets.top + 50 }]}>
            {farmData.blocks.map((block) => (
              <TouchableOpacity 
                key={block.block_id} 
                style={[styles.dropdownItem, activeBlock.block_id === block.block_id && styles.dropdownItemActive]}
                onPress={() => {
                  setActiveBlockById(block.block_id);
                  setIsDropdownOpen(false);
                }}
              >
                <Text style={[styles.dropdownItemText, activeBlock.block_id === block.block_id && {color: colors.primary, fontWeight: '800'}]}>
                  {block.crop} - {block.lanslu}
                </Text>
                {activeBlock.block_id === block.block_id && <IconPlaceholder name="check_circle" color={colors.primary} size={16} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  topAppBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingBottom: 16, backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  topAppBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerSubtitle: { fontSize: 10, color: colors.outline, fontWeight: 'bold', letterSpacing: 1 },
  dropdownSelector: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: -2 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.primary },
  profileImageContainer: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
  profileImage: { width: '100%', height: '100%' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'flex-start', paddingHorizontal: 24 },
  dropdownMenu: { backgroundColor: '#fff', borderRadius: 16, padding: 8, elevation: 12, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 12 },
  dropdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8 },
  dropdownItemActive: { backgroundColor: 'rgba(1, 45, 29, 0.05)' },
  dropdownItemText: { fontSize: 16, color: colors.onSurfaceVariant, fontWeight: '500' },
});
