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
import VideosScreen from './Pages/Videos';
import VideoScreen from './Pages/Video';

import Icon from 'react-native-vector-icons/FontAwesome';
import * as Font from 'expo-font';
import TextF from "./components/TextF";
import {app_styles,getTheme} from "./components/Themes";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';


Text = TextF;
Global_theme_name = "light";
var _app_styles = app_styles;

LoadedFonts = false;
function _loadFontsAsync() {
  Font.loadAsync({
    'cairoregular': require('./assets/fonts/cairoregular.ttf'),
    'DroidKufi-Regular': require('./assets/fonts/DroidKufi-Regular.ttf'),
    'DroidKufi-Bold': require('./assets/fonts/DroidKufi-Bold.ttf'),
    }).then(()=>{
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

var is_materialTopTab = false;

const StackNav = is_materialTopTab ? createMaterialTopTabNavigator() : createBottomTabNavigator();
const ChannelsStack = createStackNavigator();
const MatchesStack = createStackNavigator();
const NewsStack = createStackNavigator();
const VideosStack = createStackNavigator();

function ChannelsStackScreen() {
  return (
    <ChannelsStack.Navigator>
    
      <ChannelsStack.Screen options={_app_styles.screenHeader} name="ChannelsCat" component={CategoriesScreen} />
      <ChannelsStack.Screen options={_app_styles.screenHeader} name="Channels" component={ChannelsScreen} />
      <ChannelsStack.Screen options={_app_styles.screenHeader} name="Channel" component={ChannelScreen} />
    </ChannelsStack.Navigator>
  );
}
function MatchesStackScreen() {
  return (
    <MatchesStack.Navigator>
      <MatchesStack.Screen options={_app_styles.screenHeader} name="Home" component={HomeScreen} />
      <MatchesStack.Screen options={_app_styles.screenHeader} name="Match" component={Matchcreen} />
      <MatchesStack.Screen options={_app_styles.screenHeader} name="Channels" component={ChannelsScreen} />
      <MatchesStack.Screen options={_app_styles.screenHeader} name="Channel" component={ChannelScreen} />
    </MatchesStack.Navigator>
  );
}
function NewsStackScreen() {
  return (
    <NewsStack.Navigator>
      <NewsStack.Screen options={_app_styles.screenHeader} name="News" component={NewsScreen} />
      <NewsStack.Screen options={_app_styles.screenHeader} name="Article" component={ArticleScreen} />
    </NewsStack.Navigator>
  );
}
function VideosStackScreen() {
  return (
    <VideosStack.Navigator>
      <VideosStack.Screen options={_app_styles.screenHeader} name="Videos" component={VideosScreen} />
      <VideosStack.Screen options={_app_styles.screenHeader} name="Video" component={VideoScreen} />
    </VideosStack.Navigator>
  );
}


function MyTabs(){
  //let tabBarOptions_ = this.state.tabBarOptions_;
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
           } else if (route.name === 'Videos') {
              iconName = focused ? 'youtube-play' : 'youtube-play';
            }
            
            // You can return any component that you like here!
            return <Icon name={iconName} size={size} color={color} />;
          },
          swipeEnabled :true,
          tabBarPosition:"bottom",
        })}
      tabBarOptions={is_materialTopTab ? _app_styles.tabBarOptions_mat : _app_styles.tabBarOptions}
      tabBarPosition="bottom"
    >
      <StackNav.Screen name="Home" component={MatchesStackScreen} />
      <StackNav.Screen name="Videos" component={VideosStackScreen} />
      <StackNav.Screen name="Channels" component={ChannelsStackScreen} />
      <StackNav.Screen name="News" component={NewsStackScreen} />
      
    </StackNav.Navigator>
  );
}

class APP extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        list:[],
        modalVisible_match:false,
        show_datPicker : false,
        matches_date:new Date(),
        loading :true,
        loading_fonts:false,
        update_available:false,
        dynamic_style:"styles_home",
        style_loaded:false,
        //dynamic_style_list:styles_list,
    };
    getTheme("app_styles").then(theme=>{
      if(_app_styles==theme){return true;}
      _app_styles=theme;
      this.setState({style_loaded:true});
    });
  
  }



  render(){
    if(this.state.style_loaded==false){
      return null;
    }
    return (
      <NavigationContainer>
        <MyTabs />
      </NavigationContainer>
    );
  }
  }
export default APP;