import * as React from 'react';
import { useState } from 'react';

import {  View, StyleSheet, ToastAndroid,Platform,Alert  , I18nManager } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer  } from '@react-navigation/native';
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
import TVScreen from './Pages/TV';
import MoviesScreen from './Pages/Movies';
import MovieScreen from './Pages/Movie';
import Constants from 'expo-constants';

import Icon from 'react-native-vector-icons/FontAwesome';
import * as Font from 'expo-font';
import TextF from "./components/TextF";
import {app_styles,getTheme} from "./components/Themes";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as Notifications from 'expo-notifications';
import backUp from "./Libs/BackUp";
import ToastMsg from "./components/ToastMsg";
import ClientInfo from "./Libs/ClientInfo";

global.navigationRef = React.createRef();
global.g = null;
//--release-channel imad | default
// cmd to add google firebase server key 
// expo push:android:upload --api-key AAAAFPoWn8w:APA91bHJ8F9ueKj_gaHXlqpJ-Ba2OIpwvI-GecDdfIWzCYLt0dVrJBmTZ6P1UmcezWjubrOqlZADJcNRdNldTcMsuhnTOJ7IpXvon_kJyHM0Rh9KT-5cr04FKd30-VeEAipDggMVKKbS
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
global.user_log_data = false;
global.open_page={};
if(API_.isWeb){
  if(API_.isIOS){
    var windowReference = window.open();
    API_.getConfig("force_open_expo",false).then(force_open_expo=>{
      if(force_open_expo){
        windowReference.location = url;
        API_.open_ext_url("exp://exp.host/@imadboss/almatch").then(()=>window.close('','_parent',''));
      }
    });
    
  }
  global. Global_theme_name = window.matchMedia  && window.matchMedia('(prefers-color-scheme: dark)').matches===true?"dark violet" :"light" ;

  if(navigator && navigator.serviceWorker && navigator.serviceWorker.addEventListener){

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

  const pathname = window.location.pathname.slice(1);
  open_page.path = pathname.split("@")[0];
  open_page.id   = pathname.split("@")[1]?pathname.split("@")[1]:null;
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
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    backup.PushToken = await Notifications.getExpoPushTokenAsync({experienceId: '@imadboss/almatch',});
    backup.PushToken = backup.PushToken.data;
    
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
var is_animationEnabled = true;
const ChannelsStack = createStackNavigator();
const MatchesStack = createStackNavigator();
const NewsStack = createStackNavigator();
const VideosStack = createStackNavigator();
const LeaguesStack = createStackNavigator();

function ChannelsStackScreen() {
  return (
    <ChannelsStack.Navigator>
    
      <ChannelsStack.Screen options={_app_styles.screenHeader} name="ChannelsCat" component={CategoriesScreen} animationEnabled={is_animationEnabled}/>
      <ChannelsStack.Screen options={_app_styles.screenHeader} name="Channels" component={ChannelsScreen} animationEnabled={is_animationEnabled}/>
      <ChannelsStack.Screen options={_app_styles.screenHeader} name="Channel" component={ChannelScreen} animationEnabled={is_animationEnabled}/>
      <ChannelsStack.Screen options={_app_styles.screenHeader} name="Video" component={VideoScreen} animationEnabled={is_animationEnabled}/>
    </ChannelsStack.Navigator>
  );
}
function MatchesStackScreen() {
  return (
    <MatchesStack.Navigator>
      <MatchesStack.Screen options={_app_styles.screenHeader} name="Home" component={HomeScreen} animationEnabled={is_animationEnabled}/>
      <MatchesStack.Screen options={_app_styles.screenHeader} name="Settings" component={SettingsScreen} animationEnabled={is_animationEnabled}/>
      <MatchesStack.Screen options={_app_styles.screenHeader} name="Match" component={Matchcreen}animationEnabled={is_animationEnabled} />
      <MatchesStack.Screen options={_app_styles.screenHeader} name="Channels" component={ChannelsScreen} animationEnabled={is_animationEnabled}/>
      <MatchesStack.Screen options={_app_styles.screenHeader} name="Channel" component={ChannelScreen} animationEnabled={is_animationEnabled}/>
      <MatchesStack.Screen options={_app_styles.screenHeader} name="League" component={LeagueScreen} animationEnabled={is_animationEnabled}/>
      <MatchesStack.Screen options={_app_styles.screenHeader} name="Video" component={VideoScreen} animationEnabled={is_animationEnabled}/>
      <MatchesStack.Screen options={_app_styles.screenHeader} name="TV" component={TVScreen} animationEnabled={is_animationEnabled}/>
      <MatchesStack.Screen options={_app_styles.screenHeader} name="FS" component={FSScreen} animationEnabled={is_animationEnabled}/>
      
      
    </MatchesStack.Navigator>
  );
}
function LeaguesStackScreen() {
  return (
    <LeaguesStack.Navigator>
    <LeaguesStack.Screen options={_app_styles.screenHeader} name="Leagues" component={LeaguesScreen} animationEnabled={is_animationEnabled}/>
      <LeaguesStack.Screen options={_app_styles.screenHeader} name="Home" component={LeaguesScreen} animationEnabled={is_animationEnabled}/>
      <LeaguesStack.Screen options={_app_styles.screenHeader} name="Match" component={Matchcreen} animationEnabled={is_animationEnabled}/>
      <LeaguesStack.Screen options={_app_styles.screenHeader} name="Channels" component={ChannelsScreen} animationEnabled={is_animationEnabled}/>
      <LeaguesStack.Screen options={_app_styles.screenHeader} name="Channel" component={ChannelScreen} animationEnabled={is_animationEnabled}/>
      <LeaguesStack.Screen options={_app_styles.screenHeader} name="League" component={LeagueScreen} animationEnabled={is_animationEnabled}/>
      
    </LeaguesStack.Navigator>
  );
}
function NewsStackScreen() {
  return (
    <NewsStack.Navigator>
      <NewsStack.Screen options={_app_styles.screenHeader} name="News" component={NewsScreen} animationEnabled={is_animationEnabled}/>
      <NewsStack.Screen options={_app_styles.screenHeader} name="Home" component={NewsScreen} animationEnabled={is_animationEnabled}/>
      <NewsStack.Screen options={_app_styles.screenHeader} name="Article" component={ArticleScreen} animationEnabled={is_animationEnabled}/>
      <NewsStack.Screen options={_app_styles.screenHeader} name="Match" component={Matchcreen} animationEnabled={is_animationEnabled}/>
      <NewsStack.Screen options={_app_styles.screenHeader} name="League" component={LeagueScreen} animationEnabled={is_animationEnabled}/>
      <NewsStack.Screen options={_app_styles.screenHeader} name="Video" component={VideoScreen} animationEnabled={is_animationEnabled}/>
    </NewsStack.Navigator>
  );
}
function VideosStackScreen() {
  return (
    <VideosStack.Navigator>
      <VideosStack.Screen options={_app_styles.screenHeader} name="Videos" component={VideosScreen} animationEnabled={is_animationEnabled}/>
      <VideosStack.Screen options={_app_styles.screenHeader} name="Video" component={VideoScreen} animationEnabled={is_animationEnabled}/>
      <VideosStack.Screen options={_app_styles.screenHeader} name="Movies" component={MoviesScreen} animationEnabled={is_animationEnabled}/>
      <VideosStack.Screen options={_app_styles.screenHeader} name="Movie" component={MovieScreen} animationEnabled={is_animationEnabled}/>
      
    </VideosStack.Navigator>
  );
}


function MyTabs(props){
  //let tabBarOptions_ = this.state.tabBarOptions_;
  const StackNav = props.is_materialTopTab ? createMaterialTopTabNavigator() : createBottomTabNavigator();
  return (
    <StackNav.Navigator 
      barStyle={{ backgroundColor: '#000' }}
      screenOptions={({ route }) => ({
          cardStyle: {backgroundColor: '#000000'},
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home';
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
      tabBarOptions={props.is_materialTopTab ? _app_styles.tabBarOptions_mat : _app_styles.tabBarOptions}
      tabBarPosition="bottom"
    >
      <StackNav.Screen name="Home" component={MatchesStackScreen} animationEnabled={is_animationEnabled}/>
      <StackNav.Screen name="Leagues" component={LeaguesStackScreen} animationEnabled={is_animationEnabled}/>
      <StackNav.Screen name="Videos" component={VideosStackScreen} animationEnabled={is_animationEnabled}/>
      <StackNav.Screen name="Channels" component={ChannelsStackScreen} animationEnabled={is_animationEnabled}/>
      <StackNav.Screen name="News" component={NewsStackScreen} animationEnabled={is_animationEnabled}/>
      
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
        is_materialTopTab:false,
        show_user_log : user_log_data!=false,
        user_log : user_log_data,
    };
    API_.getConfig("is_materialTopTab",false).then(v=>{
      this.setState({is_materialTopTab:v});
    });
    getTheme("app_styles").then(theme=>{
      if(_app_styles==theme){return true;}
      _app_styles=theme;
      this.setState({style_loaded:true});
    });
    this.firstRender = true;
    this.linking = {
      prefixes: ['https://'+API_.main_domain, 'almatch://'],
      config: {
        screens: {
          Home: {
            initialRouteName: 'Home',
            screens:{
              Home     : "Home",
              Settings : "Settings",
              Match    : {
                path: 'Match/:match_item/:id',
                parse:{ 
                  id: (id) => id,
                  match_item: (match_item) => '-',
                 },
                stringify: {
                  id: (id) => `${id}`,
                  match_item: (match_item) => `-`,
                },
              },
              Channel  : {
                path: 'Channel/:channel_photo/:channel_id',
                parse:{ 
                  channel_id: (channel_id) => channel_id,
                  channel_photo: (channel_photo) => '-',
                 },
                stringify: {
                  channel_id: (channel_id) => `${channel_id}`,
                  channel_photo: (channel_photo) => `-`,
                },
              },
              League   : {
                path: 'League/:league_details/:id',
                parse:{ 
                  id: (id) => id,
                  league_details: (league_details) => '-',
                 },
                stringify: {
                  id: (id) => `${id}`,
                  league_details: (league_details) => `-`,
                },
              },
              Video    : "Video",
            }
          },
          Leagues: {
            initialRouteName: 'Leagues',
            screens:{
              Leagues     : "Leagues",
              Match    : {
                path: 'Leagues/Match/:match_item/:id',
                parse:{ 
                  id: (id) => id,
                  match_item: (match_item) => '-',
                 },
                stringify: {
                  id: (id) => `${id}`,
                  match_item: (match_item) => `-`,
                },
              },
              League   : {
                path: 'Leagues/League/:league_details/:id',
                parse:{ 
                  id: (id) => id,
                  league_details: (league_details) => '-',
                 },
                stringify: {
                  id: (id) => `${id}`,
                  league_details: (league_details) => `-`,
                },
              },
              Video    : "Leagues/Video",
            }
          },
          Videos : {
            initialRouteName: 'Videos',
            screens:{
              Videos     : "Videos",
              Movies     : "Videos/Movies",
              Video    : {
                path: 'Videos/Video/:item/:id',
                parse:{ 
                  id: (id) => id,
                  item: (item) => '-',
                 },
                stringify: {
                  id: (id) => `${id}`,
                  item: (item) => `-`,
                },
              },
              Movie    : {
                path: 'Videos/Movies/Movie/:item/:id',
                parse:{ 
                  id: (id) => id,
                  item: (item) => '-',
                 },
                stringify: {
                  id: (id) => `${id}`,
                  item: (item) => `-`,
                },
              },
            }
          },
          Channels: 'Channels',
          News: {
            initialRouteName: 'News',
            screens:{
              News     : "News",
              Article    : {
                path: 'News/Article/:article/:id',
                parse:{ 
                  id: (id) => id,
                  article: (article) => '-',
                 },
                stringify: {
                  id: (id) => `${id}`,
                  article: (article) => `-`,
                },
              },
              Match    : {
                path: 'News/Match/:match_item/:id',
                parse:{ 
                  id: (id) => id,
                  match_item: (match_item) => '-',
                 },
                stringify: {
                  id: (id) => `${id}`,
                  match_item: (match_item) => `-`,
                },
              },
              League   : {
                path: 'News/League/:league_details/:id',
                parse:{ 
                  id: (id) => id,
                  league_details: (league_details) => '-',
                 },
                stringify: {
                  id: (id) => `${id}`,
                  league_details: (league_details) => `-`,
                },
              },
              Channel  : {
                path: 'News/Channel/:channel_photo/:channel_id',
                parse:{ 
                  channel_id: (channel_id) => channel_id,
                  channel_photo: (channel_photo) => '-',
                 },
                stringify: {
                  channel_id: (channel_id) => `${channel_id}`,
                  channel_photo: (channel_photo) => `-`,
                },
              },
              Video    : "News/Video",
              Channels    : "News/Channels",
            }
          },
        },
      },
    };
  }
  componentDidMount(){
    //navigate('/News');
    
    this.mounted = true;
    API_.showMsg = this.showMsg;
    API_.debugMsg= this.debugMsg;
    getTheme("styles_notif").then(theme=>this.setState({notif_dynamic_style:theme}) );
    this.MyTabs = <MyTabs showMsg={this.showMsg} is_materialTopTab={this.state.is_materialTopTab}/> ;
    if (API_.isWeb){
      document.addEventListener("keydown", this.escFunction, false);
    }
  }
  escFunction = (event)=>{
    if(event.keyCode === 27 || event.keyCode === 8) {
      //this.props.navigation.goBack(null);
      window.history.back();
    }
  }
  componentWillUnmount(){
    this.mounted = false;
  }
  showMsg = (body,type, speed, delay, onCLicked)=>{
    if(!body || (body.trim && body.trim()=="")){return false;}
    console.log("msg1:",this.state.showMsg,"msg2:",this.state.showMsg);
    if(this.state.showMsg==false){
      this.setState({body:body,type:type, speed:speed, delay:delay,debug:false,showMsg:true,onCLicked:onCLicked});
    }else if(this.state.showMsg==true && this.state.showMsg_2==false){
      this.setState({body_2:body,type_2:type, speed_2:speed, delay_2:delay,debug_2:false,showMsg_2:true,onCLicked:onCLicked});
    }
  }
  debugMsg = (body,type, speed, delay)=>{
    if(!body || (body.trim && body.trim()=="") ){return false;}
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
  redirect=()=>{

    try{
      if(this.firstRender && API_.isWeb && location.search && location.search!="" && location.href.includes("/?/") ){
          //location.href = location.href.replace("/?/","/");
          const pages_sep = {
              Channel : "channel_photo",
              League  : "league_details",
              Match   : "match_item",
              Article : "article",
            };
          const full_path = location.search.replace("?/","");
          const main_screen = full_path.split("/")[0];
          const path__id = full_path.split("/-/");
          const screens = path__id[0].split("/");
          let params = {};
          if(screens.length==1){
            params.id = path__id[1]
            if( pages_sep[main_screen]){
              params[pages_sep[main_screen]] = "-";
            }
          }else if(screens.length==2){
            params.screen = screens[1];
            params.params = {id:path__id[1]};
            if( pages_sep[params.screen]){
              params.params[ pages_sep[params.screen] ] = "-";
            }
          }
          setTimeout(() => {
            if(navigationRef.current){
              navigationRef.current?.navigate(main_screen,params);
            }
          }, 200);
        }
    }catch(e){
      API_.showMsg(e,"danger");
    }

    if(this.firstRender){
      this.firstRender = false;
    }
  }
  redirect_deep=()=>{

  }
  render(){
    if(this.state.style_loaded==false){
      return null;
    }
    return (
      <NavigationContainer linking={this.linking} ref={navigationRef} >
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
        
        {this.MyTabs}
        {this.redirect()}
      </NavigationContainer>
    );
  }
  }
export default APP;
