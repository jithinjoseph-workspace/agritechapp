import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  ProfileScreen: undefined;
};

export type BottomTabParamList = {
  DashboardTab: undefined;
  SensorTab: undefined;
  InsightsTab: undefined;
  ProfileTab: undefined;
};

// Screen props for stack navigator
export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

// Screen props for screens inside bottom tabs
export type DashboardScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'DashboardTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type SensorScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'SensorTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type HistoryScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'InsightsTab'>,
  NativeStackScreenProps<RootStackParamList>
>;
