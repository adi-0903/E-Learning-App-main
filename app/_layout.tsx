import React from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import RootApp from './index';

export default function RootLayout() {
  return (
    <>
      <RootApp />
      <StatusBar style="auto" />
    </>
  );
}
