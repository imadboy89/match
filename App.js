import * as React from 'react';
import { Text, View, StyleSheet, ToastAndroid,Platform,AlertIOS } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from './Pages/Home';
import CategoriesScreen from './Pages/Categories';
import ChannelsScreen from './Pages/Channels';
import ChannelScreen from './Pages/Channel';
import API from './Libs/API';

notifyMessage = function(msg: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT)
  } else if (Platform.OS === 'ios'){
    AlertIOS.alert(msg);
  } else{
    alert(msg);
  }
}

API_ = new API();
function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings!</Text>
    </View>
  );
}

const StackNav = createBottomTabNavigator();
const ChannelsStack = createStackNavigator();


function ChannelsStackScreen() {
  return (
    <ChannelsStack.Navigator>
      <ChannelsStack.Screen name="ChannelsCat" component={CategoriesScreen} />
      <ChannelsStack.Screen name="Channels" component={ChannelsScreen} />
      <ChannelsStack.Screen name="Channel" component={ChannelScreen} />
    </ChannelsStack.Navigator>
  );
}


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
      <StackNav.Screen style={{fontSize:20}} name="Channels" component={ChannelsStackScreen} />
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