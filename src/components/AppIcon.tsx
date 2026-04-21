import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

export type AppIconName =
  | 'dashboard'
  | 'sensors'
  | 'history'
  | 'settings'
  | 'location'
  | 'expand'
  | 'check'
  | 'brand'
  | 'mail'
  | 'lock'
  | 'show'
  | 'hide'
  | 'arrow'
  | 'ph'
  | 'temperature'
  | 'moisture'
  | 'sunlight'
  | 'humidity'
  | 'fertility'
  | 'sync'
  | 'notifications'
  | 'timer'
  | 'logout';

interface AppIconProps {
  name: AppIconName;
  size?: number;
  color?: string;
  backgroundColor?: string;
  bordered?: boolean;
  style?: ViewStyle;
}

export function AppIcon({
  name,
  size = 18,
  color = colors.primary,
  backgroundColor = 'transparent',
  bordered = false,
  style,
}: AppIconProps) {
  const boxSize = Math.max(18, Math.round(size * 1.45));

  return (
    <View
      style={[
        styles.container,
        {
          width: boxSize,
          height: boxSize,
          borderRadius: Math.round(boxSize / 2.8),
          backgroundColor,
          borderWidth: bordered ? 1 : 0,
          borderColor: bordered ? colors.outlineVariant : 'transparent',
        },
        style,
      ]}
    >
      {renderIcon(name, color)}
    </View>
  );
}

function renderIcon(name: AppIconName, color: string) {
  switch (name) {
    case 'dashboard':
      return (
        <>
          <View style={[styles.square, { left: 4, top: 4, borderColor: color }]} />
          <View style={[styles.square, { right: 4, top: 4, borderColor: color }]} />
          <View style={[styles.square, { left: 4, bottom: 4, borderColor: color }]} />
          <View style={[styles.square, { right: 4, bottom: 4, borderColor: color }]} />
        </>
      );
    case 'sensors':
      return (
        <>
          <View style={[styles.sensorBar, { left: 5, height: 8, backgroundColor: color }]} />
          <View style={[styles.sensorBar, { left: 10, height: 12, backgroundColor: color }]} />
          <View style={[styles.sensorBar, { left: 15, height: 6, backgroundColor: color }]} />
          <View style={[styles.sensorDot, { backgroundColor: color }]} />
        </>
      );
    case 'history':
    case 'timer':
      return (
        <>
          <View style={[styles.clockCircle, { borderColor: color }]} />
          <View style={[styles.clockHandShort, { backgroundColor: color }]} />
          <View style={[styles.clockHandLong, { backgroundColor: color }]} />
        </>
      );
    case 'settings':
      return (
        <>
          <View style={[styles.gearCore, { borderColor: color }]} />
          <View style={[styles.gearToothVertical, { backgroundColor: color }]} />
          <View style={[styles.gearToothVertical, { backgroundColor: color, transform: [{ rotate: '90deg' }] }]} />
          <View style={[styles.gearToothDiagonal, { backgroundColor: color, transform: [{ rotate: '45deg' }] }]} />
          <View style={[styles.gearToothDiagonal, { backgroundColor: color, transform: [{ rotate: '-45deg' }] }]} />
        </>
      );
    case 'location':
      return (
        <>
          <View style={[styles.pinCircle, { borderColor: color }]} />
          <View style={[styles.pinDot, { backgroundColor: color }]} />
          <View style={[styles.pinStem, { backgroundColor: color }]} />
        </>
      );
    case 'expand':
      return <Text style={[styles.expandGlyph, { color }]}>▾</Text>;
    case 'check':
      return (
        <>
          <View style={[styles.checkLeft, { backgroundColor: color }]} />
          <View style={[styles.checkRight, { backgroundColor: color }]} />
        </>
      );
    case 'brand':
      return (
        <>
          <View style={[styles.brandStem, { backgroundColor: color }]} />
          <View style={[styles.brandLeafLeft, { borderColor: color }]} />
          <View style={[styles.brandLeafRight, { borderColor: color }]} />
        </>
      );
    case 'mail':
      return (
        <>
          <View style={[styles.mailBody, { borderColor: color }]} />
          <View style={[styles.mailFlapLeft, { backgroundColor: color }]} />
          <View style={[styles.mailFlapRight, { backgroundColor: color }]} />
        </>
      );
    case 'lock':
      return (
        <>
          <View style={[styles.lockBody, { borderColor: color }]} />
          <View style={[styles.lockShackle, { borderColor: color }]} />
        </>
      );
    case 'show':
      return (
        <>
          <View style={[styles.eyeOutline, { borderColor: color }]} />
          <View style={[styles.eyePupil, { backgroundColor: color }]} />
        </>
      );
    case 'hide':
      return (
        <>
          <View style={[styles.eyeOutline, { borderColor: color }]} />
          <View style={[styles.eyeSlash, { backgroundColor: color }]} />
        </>
      );
    case 'arrow':
      return (
        <>
          <View style={[styles.arrowLine, { backgroundColor: color }]} />
          <View style={[styles.arrowHeadTop, { backgroundColor: color }]} />
          <View style={[styles.arrowHeadBottom, { backgroundColor: color }]} />
        </>
      );
    case 'ph':
      return (
        <>
          <View style={[styles.flaskBody, { borderColor: color }]} />
          <View style={[styles.flaskNeck, { backgroundColor: color }]} />
        </>
      );
    case 'temperature':
      return (
        <>
          <View style={[styles.thermoStem, { borderColor: color }]} />
          <View style={[styles.thermoBulb, { borderColor: color }]} />
          <View style={[styles.thermoFill, { backgroundColor: color }]} />
        </>
      );
    case 'moisture':
      return (
        <>
          <View style={[styles.dropTop, { borderColor: color }]} />
          <View style={[styles.dropBottom, { borderColor: color }]} />
        </>
      );
    case 'sunlight':
      return (
        <>
          <View style={[styles.sunCore, { borderColor: color }]} />
          <View style={[styles.sunRayVertical, { backgroundColor: color }]} />
          <View style={[styles.sunRayVertical, { backgroundColor: color, transform: [{ rotate: '90deg' }] }]} />
          <View style={[styles.sunRayDiagonal, { backgroundColor: color, transform: [{ rotate: '45deg' }] }]} />
          <View style={[styles.sunRayDiagonal, { backgroundColor: color, transform: [{ rotate: '-45deg' }] }]} />
        </>
      );
    case 'humidity':
      return (
        <>
          <View style={[styles.cloudCircleLeft, { borderColor: color }]} />
          <View style={[styles.cloudCircleRight, { borderColor: color }]} />
          <View style={[styles.cloudBase, { borderColor: color }]} />
        </>
      );
    case 'fertility':
      return (
        <>
          <View style={[styles.leafShape, { borderColor: color }]} />
          <View style={[styles.leafVein, { backgroundColor: color }]} />
        </>
      );
    case 'sync':
      return (
        <>
          <View style={[styles.syncArcTop, { borderTopColor: color, borderLeftColor: color }]} />
          <View style={[styles.syncArcBottom, { borderBottomColor: color, borderRightColor: color }]} />
          <View style={[styles.syncArrowTop, { backgroundColor: color }]} />
          <View style={[styles.syncArrowBottom, { backgroundColor: color }]} />
        </>
      );
    case 'notifications':
      return (
        <>
          <View style={[styles.bellDome, { borderColor: color }]} />
          <View style={[styles.bellBase, { backgroundColor: color }]} />
          <View style={[styles.bellClapper, { backgroundColor: color }]} />
        </>
      );
    case 'logout':
      return (
        <>
          <View style={[styles.logoutDoor, { borderColor: color }]} />
          <View style={[styles.logoutLine, { backgroundColor: color }]} />
          <View style={[styles.logoutHeadTop, { backgroundColor: color }]} />
          <View style={[styles.logoutHeadBottom, { backgroundColor: color }]} />
        </>
      );
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  square: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderWidth: 1.6,
    borderRadius: 2,
  },
  sensorBar: {
    position: 'absolute',
    bottom: 6,
    width: 3,
    borderRadius: 3,
  },
  sensorDot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 2,
    top: 5,
    right: 5,
  },
  clockCircle: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderWidth: 1.6,
    borderRadius: 999,
  },
  clockHandShort: {
    position: 'absolute',
    width: 2,
    height: 5,
    borderRadius: 2,
    top: 7,
  },
  clockHandLong: {
    position: 'absolute',
    width: 5,
    height: 2,
    borderRadius: 2,
    top: 10,
    left: 11,
  },
  gearCore: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderWidth: 1.6,
    borderRadius: 999,
  },
  gearToothVertical: {
    position: 'absolute',
    width: 2,
    height: 18,
    borderRadius: 2,
  },
  gearToothDiagonal: {
    position: 'absolute',
    width: 2,
    height: 18,
    borderRadius: 2,
  },
  pinCircle: {
    position: 'absolute',
    width: 11,
    height: 11,
    borderWidth: 1.6,
    borderRadius: 999,
    top: 4,
  },
  pinDot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 999,
    top: 8,
  },
  pinStem: {
    position: 'absolute',
    width: 2,
    height: 6,
    borderRadius: 2,
    top: 13,
  },
  expandGlyph: {
    fontSize: 16,
    lineHeight: 16,
    fontWeight: '700',
  },
  checkLeft: {
    position: 'absolute',
    width: 2,
    height: 6,
    borderRadius: 2,
    transform: [{ rotate: '-35deg' }],
    left: 9,
    top: 10,
  },
  checkRight: {
    position: 'absolute',
    width: 2,
    height: 11,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
    left: 14,
    top: 6,
  },
  brandStem: {
    position: 'absolute',
    width: 2,
    height: 10,
    borderRadius: 2,
    top: 9,
  },
  brandLeafLeft: {
    position: 'absolute',
    width: 8,
    height: 12,
    borderWidth: 1.5,
    borderRadius: 8,
    borderTopRightRadius: 0,
    transform: [{ rotate: '-35deg' }],
    left: 5,
    top: 3,
  },
  brandLeafRight: {
    position: 'absolute',
    width: 8,
    height: 12,
    borderWidth: 1.5,
    borderRadius: 8,
    borderTopLeftRadius: 0,
    transform: [{ rotate: '35deg' }],
    right: 5,
    top: 3,
  },
  mailBody: {
    position: 'absolute',
    width: 16,
    height: 12,
    borderWidth: 1.5,
    borderRadius: 2,
  },
  mailFlapLeft: {
    position: 'absolute',
    width: 2,
    height: 10,
    borderRadius: 2,
    transform: [{ rotate: '55deg' }],
    left: 9,
  },
  mailFlapRight: {
    position: 'absolute',
    width: 2,
    height: 10,
    borderRadius: 2,
    transform: [{ rotate: '-55deg' }],
    right: 9,
  },
  lockBody: {
    position: 'absolute',
    width: 13,
    height: 10,
    borderWidth: 1.5,
    borderRadius: 3,
    top: 10,
  },
  lockShackle: {
    position: 'absolute',
    width: 9,
    height: 8,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    top: 4,
  },
  eyeOutline: {
    position: 'absolute',
    width: 16,
    height: 10,
    borderWidth: 1.5,
    borderRadius: 10,
  },
  eyePupil: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 999,
  },
  eyeSlash: {
    position: 'absolute',
    width: 2,
    height: 16,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  arrowLine: {
    position: 'absolute',
    width: 12,
    height: 2,
    borderRadius: 2,
  },
  arrowHeadTop: {
    position: 'absolute',
    width: 2,
    height: 6,
    borderRadius: 2,
    right: 6,
    top: 7,
    transform: [{ rotate: '45deg' }],
  },
  arrowHeadBottom: {
    position: 'absolute',
    width: 2,
    height: 6,
    borderRadius: 2,
    right: 6,
    bottom: 7,
    transform: [{ rotate: '-45deg' }],
  },
  flaskBody: {
    position: 'absolute',
    width: 12,
    height: 13,
    borderWidth: 1.5,
    borderRadius: 4,
    top: 7,
    transform: [{ rotate: '8deg' }],
  },
  flaskNeck: {
    position: 'absolute',
    width: 5,
    height: 2,
    borderRadius: 2,
    top: 5,
  },
  thermoStem: {
    position: 'absolute',
    width: 5,
    height: 12,
    borderWidth: 1.5,
    borderRadius: 4,
    top: 4,
  },
  thermoBulb: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderWidth: 1.5,
    borderRadius: 999,
    bottom: 3,
  },
  thermoFill: {
    position: 'absolute',
    width: 2,
    height: 9,
    borderRadius: 2,
    top: 7,
  },
  dropTop: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderWidth: 1.5,
    borderRadius: 7,
    borderBottomRightRadius: 0,
    transform: [{ rotate: '45deg' }],
    top: 3,
  },
  dropBottom: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    transform: [{ rotate: '45deg' }],
    top: 10,
  },
  sunCore: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderWidth: 1.5,
    borderRadius: 999,
  },
  sunRayVertical: {
    position: 'absolute',
    width: 2,
    height: 18,
    borderRadius: 2,
  },
  sunRayDiagonal: {
    position: 'absolute',
    width: 2,
    height: 18,
    borderRadius: 2,
  },
  cloudCircleLeft: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderWidth: 1.5,
    borderRadius: 999,
    left: 5,
    top: 8,
  },
  cloudCircleRight: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderWidth: 1.5,
    borderRadius: 999,
    right: 4,
    top: 6,
  },
  cloudBase: {
    position: 'absolute',
    width: 14,
    height: 7,
    borderWidth: 1.5,
    borderRadius: 7,
    bottom: 5,
  },
  leafShape: {
    position: 'absolute',
    width: 11,
    height: 15,
    borderWidth: 1.5,
    borderRadius: 10,
    borderTopLeftRadius: 0,
    transform: [{ rotate: '-35deg' }],
  },
  leafVein: {
    position: 'absolute',
    width: 2,
    height: 11,
    borderRadius: 2,
    transform: [{ rotate: '-35deg' }],
  },
  syncArcTop: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 999,
    top: 3,
    left: 4,
    transform: [{ rotate: '20deg' }],
  },
  syncArcBottom: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 999,
    bottom: 3,
    right: 4,
    transform: [{ rotate: '20deg' }],
  },
  syncArrowTop: {
    position: 'absolute',
    width: 2,
    height: 5,
    borderRadius: 2,
    top: 4,
    right: 6,
    transform: [{ rotate: '55deg' }],
  },
  syncArrowBottom: {
    position: 'absolute',
    width: 2,
    height: 5,
    borderRadius: 2,
    bottom: 4,
    left: 6,
    transform: [{ rotate: '55deg' }],
  },
  bellDome: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    top: 5,
  },
  bellBase: {
    position: 'absolute',
    width: 12,
    height: 2,
    borderRadius: 2,
    bottom: 6,
  },
  bellClapper: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 999,
    bottom: 3,
  },
  logoutDoor: {
    position: 'absolute',
    width: 8,
    height: 14,
    borderWidth: 1.5,
    borderRadius: 2,
    left: 4,
  },
  logoutLine: {
    position: 'absolute',
    width: 9,
    height: 2,
    borderRadius: 2,
    right: 4,
  },
  logoutHeadTop: {
    position: 'absolute',
    width: 2,
    height: 6,
    borderRadius: 2,
    right: 4,
    top: 7,
    transform: [{ rotate: '45deg' }],
  },
  logoutHeadBottom: {
    position: 'absolute',
    width: 2,
    height: 6,
    borderRadius: 2,
    right: 4,
    bottom: 7,
    transform: [{ rotate: '-45deg' }],
  },
});
