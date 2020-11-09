import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from './Pages/Home';
import CategoriesScreen from './Pages/Categories';
import channelsScreen from './Pages/channels';
import API from './Libs/API';

API_ = new API();
function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings!</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

const StackNav = createStackNavigator(
  {
    TabNavigator: {
      screen: AppTabNavigator,
      navigationOptions: {
        headerMode: "none",
        header: null
      }
    },
    channelsScreen: {
      screen: channelsScreen,
      navigationOptions: {
        headerMode: "none",
        header: null
      }
    },
  },
  {
    initialRouteName: "TabNavigator"
  }
);

function MyTabs() {
  return (
    <StackNav.Navigator
      screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused
                ? 'ios-home'
                : 'ios-home';
            } else if (route.name === 'Channels') {
              iconName = focused ? 'ios-tv' : 'ios-tv';
            }

            // You can return any component that you like here!
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
        tabBarOptions={{
          activeTintColor: 'tomato',
          inactiveTintColor: 'gray',
          size : 20
        }}
    >
      <StackNav.Screen style={{fontSize:20}} name="Home" component={HomeScreen} />
      <StackNav.Screen style={{fontSize:20}}  name="Channels" component={CategoriesScreen} />
    </StackNav.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <MyTabs />
    </NavigationContainer>
  );
}