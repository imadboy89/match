import * as React from 'react';
import {  View, StyleSheet, ToastAndroid,Platform,Alert  , I18nManager } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import API from './Libs/API';
import HomeScreen from './Pages/Home.js';
import CategoriesScreen from './Pages/Categories';
import ChannelsScreen from './Pages/Channels';
import ChannelScreen from './Pages/Channel';
import FSScreen from './Pages/FS';
import Matchcreen from './Pages/Match';
import NewsScreen from './Pages/News';
import ArticleScreen from './Pages/Article';
import VideosScreen from './Pages/Videos';
import VideoScreen from './Pages/Video';
import LeagueScreen from './Pages/League';
import LeaguesScreen from './Pages/Leagues';
import SettingsScreen from './Pages/Settings';
import Constants from 'expo-constants';

import Icon from 'react-native-vector-icons/FontAwesome';
import * as Font from 'expo-font';
import TextF from "./components/TextF";
import {app_styles,getTheme} from "./components/Themes";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import backUp from "./Libs/BackUp";
import ToastMsg from "./components/ToastMsg";
import ClientInfo from "./Libs/ClientInfo";
Text = TextF;
global. API_ = new API();
global. API_.appname = "AlMatch"
global. Global_theme_name = "dark violet";
global.reloading_app = false;
var _app_styles = app_styles;
global.backup = new backUp();
global.backup.executingQueued();
global.api_type=0;
global._ClientInfo = new ClientInfo();
global.match_data = false;
if(API_.isWeb){
  global. Global_theme_name = window.matchMedia  && window.matchMedia('(prefers-color-scheme: dark)').matches===true?"dark violet" :"light" ;

  if(navigator && navigator.serviceWorker && navigator.serviceWorker.addEventListener){
    navigator.serviceWorker.addEventListener('message', event => {
      console.log(event.data);
      match_data = event.data ? event.data.data : false;
    });

    global.deferredPrompt=0;
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      deferredPrompt = e;
      console.log(`'beforeinstallprompt' event was fired.`);
      //API_.showMsg("Installing 'AlMatch' app will provider you better experiece !");
    });
    
  }

}



global. LoadedFonts = false;
function _loadFontsAsync() {
  Font.loadAsync({
    //'cairoregular': require('./assets/fonts/cairoregular.ttf'),
    'DroidKufi-Regular': require('./assets/fonts/DroidKufi-Regular.ttf'),
    'DroidKufi-Bold': require('./assets/fonts/DroidKufi-Bold.ttf'),
    }).then(()=>{
    LoadedFonts=true;
    console.log("FontsLoaded");
  });
  //this.setState({ fontsLoaded: true });
}
if(API_.isWeb){
  window.addEventListener('beforeunload', function (e) {
    if(reloading_app==false){
      e.preventDefault();
      e.returnValue = '';
    }
  });
}
_loadFontsAsync();
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotificationsAsync() {
  if(API_.isWeb){
    return new Promise(function(){return []});
  }
  if (Constants.isDevice) {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    backup.PushToken = (await Notifications.getExpoPushTokenAsync()).data;
    
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}
registerForPushNotificationsAsync()
global.notifyMessage = function(msg,title, buttons,speed=1000,delay=1000) {
    API_.showMsg(msg,speed,delay);
    return;
    if(API_.isWeb){
      alert(msg);
      return new Promise((resolve, reject)=>{return resolve([])});
    }
    
    return Alert.alert(
      title!=undefined ? title : "Message",
      msg,
      buttons!=undefined ? buttons
      :
      [
        { text: "OK", onPress: () => console.log("OK Pressed") }
        //{ text: "OK", onPress: () => console.log("OK Pressed") }
      ],
    );
}

var is_materialTopTab = false;

const StackNav = is_materialTopTab ? createMaterialTopTabNavigator() : createBottomTabNavigator();
const ChannelsStack = createStackNavigator();
const MatchesStack = createStackNavigator();
const NewsStack = createStackNavigator();
const VideosStack = createStackNavigator();
const LeaguesStack = createStackNavigator();

function ChannelsStackScreen() {
  return (
    <ChannelsStack.Navigator>
    
      <ChannelsStack.Screen options={_app_styles.screenHeader} name="ChannelsCat" component={CategoriesScreen} />
      <ChannelsStack.Screen options={_app_styles.screenHeader} name="Channels" component={ChannelsScreen} />
      <ChannelsStack.Screen options={_app_styles.screenHeader} name="Channel" component={ChannelScreen} />
      <ChannelsStack.Screen options={_app_styles.screenHeader} name="Video" component={VideoScreen} />
    </ChannelsStack.Navigator>
  );
}
function MatchesStackScreen() {
  return (
    <MatchesStack.Navigator>
      <MatchesStack.Screen options={_app_styles.screenHeader} name="Home" component={HomeScreen} />
      <MatchesStack.Screen options={_app_styles.screenHeader} name="Settings" component={SettingsScreen} />
      <MatchesStack.Screen options={_app_styles.screenHeader} name="Match" component={Matchcreen} />
      <MatchesStack.Screen options={_app_styles.screenHeader} name="Channels" component={ChannelsScreen} />
      <MatchesStack.Screen options={_app_styles.screenHeader} name="Channel" component={ChannelScreen} />
      <MatchesStack.Screen options={_app_styles.screenHeader} name="League" component={LeagueScreen} />
      <MatchesStack.Screen options={_app_styles.screenHeader} name="Video" component={VideoScreen} />
      
    </MatchesStack.Navigator>
  );
}
function LeaguesStackScreen() {
  return (
    <LeaguesStack.Navigator>
    <LeaguesStack.Screen options={_app_styles.screenHeader} name="Leagues" component={LeaguesScreen} />
      <LeaguesStack.Screen options={_app_styles.screenHeader} name="Home" component={HomeScreen} />
      <LeaguesStack.Screen options={_app_styles.screenHeader} name="Match" component={Matchcreen} />
      <LeaguesStack.Screen options={_app_styles.screenHeader} name="Channels" component={ChannelsScreen} />
      <LeaguesStack.Screen options={_app_styles.screenHeader} name="Channel" component={ChannelScreen} />
      <LeaguesStack.Screen options={_app_styles.screenHeader} name="League" component={LeagueScreen} />
      
    </LeaguesStack.Navigator>
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
            } else if (route.name === 'Leagues') {
              iconName = focused ? 'list-ol' : 'list-ol';
            }
            
            // You can return any component that you like here!
            return <Icon name={iconName} size={size} color={color} />;
          },
          swipeEnabled :true,
          tabBarPosition:"bottom",
          //tabBarLabel :  ({ focused, color }) => focused ? <Text style={{ color,fontSize:10 }}>{route.name}</Text> : null,
        })}
      tabBarOptions={is_materialTopTab ? _app_styles.tabBarOptions_mat : _app_styles.tabBarOptions}
      tabBarPosition="bottom"
    >
      <StackNav.Screen name="Home" component={MatchesStackScreen} />
      <StackNav.Screen name="Leagues" component={LeaguesStackScreen} />
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
        msg:"", 
        speed:0, 
        delay:0,
        showMsg:false,
        notif_dynamic_style:false,
        showMsg:false,
        showMsg_2:false,
    };
    getTheme("app_styles").then(theme=>{
      if(_app_styles==theme){return true;}
      _app_styles=theme;
      this.setState({style_loaded:true});
    });
  }
  componentDidMount(){
    this.mounted = true;
    API_.showMsg = this.showMsg;
    API_.debugMsg= this.debugMsg;
    getTheme("styles_notif").then(theme=>this.setState({notif_dynamic_style:theme}) );
  }
  componentWillUnmount(){
    this.mounted = false;
  }
  showMsg = (body,type, speed, delay, onCLicked)=>{
    if(this.state.showMsg==false){
      this.setState({body:body,type:type, speed:speed, delay:delay,debug:false,showMsg:true,onCLicked:onCLicked});
    }else if(this.state.showMsg==true && this.state.showMsg_2==false){
      this.setState({body_2:body,type_2:type, speed_2:speed, delay_2:delay,debug_2:false,showMsg_2:true,onCLicked:onCLicked});
    }
  }
  debugMsg = (body,type, speed, delay)=>{
    if(this.state.showMsg==false){
      this.setState({body:body,type:type, speed:speed, delay:delay,debug:true,showMsg:true});
    }else if(this.state.showMsg==true && this.state.showMsg_2==false){
      this.setState({body_2:body,type_2:type, speed_2:speed, delay_2:delay,debug_2:true,showMsg_2:true});
    }  }
  onMsgEnd = ()=>{
    if(this.mounted){
      setTimeout(() => {
        this.setState({showMsg:false});
      }, 1);
    }
  }
  onMsgEnd_2 = ()=>{
    if(this.mounted){
      setTimeout(() => {
        this.setState({showMsg_2:false});
      }, 1);
    }
  }
  render(){
    if(this.state.style_loaded==false){
      return null;
    }
    return (
      <NavigationContainer>
        {this.state.showMsg===true ? 
        <ToastMsg 
          dynamic_style={this.state.notif_dynamic_style}
          is_second={false}
          body={this.state.body} 
          speed={this.state.speed} 
          delay={this.state.delay} 
          type={this.state.type} 
          debug={this.state.debug} 
          onEnd={this.onMsgEnd}
          onCLicked={this.state.onCLicked}
          />
        : null }
        {this.state.showMsg_2===true ? 
        <ToastMsg 
          dynamic_style={this.state.notif_dynamic_style}
          is_second={true}
          body={this.state.body_2} 
          speed={this.state.speed_2} 
          delay={this.state.delay_2} 
          type={this.state.type_2} 
          debug={this.state.debug_2} 
          onEnd={this.onMsgEnd_2}
          onCLicked={this.state.onCLicked2}
          />
        : null }
        <MyTabs showMsg={this.showMsg}/>
      </NavigationContainer>
    );
  }
  }
export default APP;