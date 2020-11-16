import * as React from 'react';
import {  View, StyleSheet, ToastAndroid,Platform,Alert  , I18nManager } from 'react-native';
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
import NewsScreen from './Pages/News';
import ArticleScreen from './Pages/Article';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Font from 'expo-font';

import TextF from "./components/TextF";
Text = TextF;
/*
if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true);
}
*/
let screenHeader = {
  headerStyle: {
    backgroundColor: '#4b6584',
    height: 70,
    },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold',
    },
  headerTitleAlign: 'center'
  }
LoadedFonts = false;
function _loadFontsAsync() {
  Font.loadAsync({'cairoregular': require('./assets/fonts/cairoregular.ttf'),}).then(()=>{
    LoadedFonts=true;
  });
  //this.setState({ fontsLoaded: true });
}
_loadFontsAsync();
notifyMessage = function(msg: string,title: string) {
    if(API_.isWeb){
      alert(msg);
      return;
    }
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
const NewsStack = createStackNavigator();


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
function NewsStackScreen() {
  return (
    <NewsStack.Navigator>
      <NewsStack.Screen options={screenHeader} name="News" component={NewsScreen} />
      <NewsStack.Screen options={screenHeader} name="Article" component={ArticleScreen} />
    </NewsStack.Navigator>
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
                ? 'home'
                : 'home';
            } else if (route.name === 'Channels') {
              iconName = focused ? 'tv' : 'tv';
            } else if (route.name === 'News') {
              iconName = focused ? 'newspaper-o' : 'newspaper-o';
            } else if (route.name === 'web') {
              iconName = focused ? 'chrome' : 'chrome';
            }
            
            // You can return any component that you like here!
            return <Icon name={iconName} size={size} color={color} />;
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
      <StackNav.Screen name="News" component={NewsStackScreen} />
      
    </StackNav.Navigator>
  );
}
export default function App() {
  //[fontsLoaded] = useFonts({'cairoregular': require('./assets/fonts/cairoregular.ttf'),});
  return (
    <NavigationContainer>
      <MyTabs />
    </NavigationContainer>
  );
}