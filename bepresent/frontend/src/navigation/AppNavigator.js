import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View } from "react-native";

import { useAuth } from "../context/AuthContext";
import { COLORS, FONT } from "../constants";

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import HomeScreen from "../screens/HomeScreen";
import FocusScreen from "../screens/FocusScreen";
import StatsScreen from "../screens/StatsScreen";
import LeaderboardScreen from "../screens/LeaderboardScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: "🏠",
  Focus: "⚡",
  Stats: "📊",
  Leaderboard: "🏆",
  Profile: "👤",
};

function TabIcon({ name, focused }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>
      {TAB_ICONS[name]}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.bgCard,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 10,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: FONT.xs, fontWeight: "600" },
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Focus" component={FocusScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 40 }}>⏳</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : !user.onboardingComplete ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
