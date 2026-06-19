import React, { useEffect } from "react";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo Push Token:", token);
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export default function App() {
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          // Attempt to send token to backend if user is logged in
          const userToken = await SecureStore.getItemAsync("userToken");
          if (userToken) {
            // Note: Update URL in production
            await fetch("http://localhost:5000/api/users/device-token", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
              },
              body: JSON.stringify({ deviceToken: token }),
            });
            console.log("Device token updated on backend.");
          }
        }
      } catch (error) {
        console.error("Error setting up push notifications:", error);
      }
    };

    setupNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" backgroundColor="#0A0A0F" />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
