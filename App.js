import * as React from 'react';
import { Text, View, StyleSheet, ToastAndroid,Platform,Alert  , I18nManager } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import API from './Libs/API';
import HomeScreen from './Pages/Home';
import CategoriesScreen from './Pages/Categories';
import ChannelsScreen from './Pages/Channels';
import ChannelScreen from './Pages/Channel';
import FSScreen from './Pages/FS';
import Matchcreen from './Pages/Match';



/*
if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true);
}
*/
let screenHeader = {
  headerStyle: {
    backgroundColor: '#4b6584',
    height: 50,
    },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold',
    },
  headerTitleAlign: 'center'
  }

notifyMessage = function(msg: string,title: string) {

    Alert.alert(
      title!=undefined ? title : "Message",
      msg,
      [
        { text: "OK", onPress: () => console.log("OK Pressed") }
      ],
    );
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
const MatchesStack = createStackNavigator();


function ChannelsStackScreen() {
  return (
    <ChannelsStack.Navigator>
    
      <ChannelsStack.Screen options={screenHeader} name="ChannelsCat" component={CategoriesScreen} />
      <ChannelsStack.Screen options={screenHeader} name="Channels" component={ChannelsScreen} />
      <ChannelsStack.Screen options={screenHeader} name="Channel" component={ChannelScreen} />
    </ChannelsStack.Navigator>
  );
}
function MatchesStackScreen() {
  return (
    <MatchesStack.Navigator>
      <MatchesStack.Screen options={screenHeader} name="Home" component={HomeScreen} />
      <MatchesStack.Screen options={screenHeader} name="Match" component={Matchcreen} />
      <MatchesStack.Screen options={screenHeader} name="Channels" component={ChannelsScreen} />
      <MatchesStack.Screen options={screenHeader} name="Channel" component={ChannelScreen} />
    </MatchesStack.Navigator>
  );
}

function MyTabs() {
  return (
    <StackNav.Navigator
      barStyle={{ backgroundColor: '#000' }}
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
      <StackNav.Screen name="Home" component={MatchesStackScreen} />
      <StackNav.Screen name="web" component={FSScreen} />
      <StackNav.Screen name="Channels" component={ChannelsStackScreen} />
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