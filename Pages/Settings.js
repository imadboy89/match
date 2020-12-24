import React from "react";
import {  View, Dimensions, Modal, Button, Linking, ScrollView, Picker , ImageBackground, ActivityIndicator, TouchableOpacity} from 'react-native';
import Constants from 'expo-constants';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import Loader from "../components/Loader";
import {styles_settings,getTheme, themes_list} from "../components/Themes";
import { WebView } from 'react-native-webview';
import IconButton from "../components/IconButton";
import Credentials from "../components/Credentials";
import Users from "../components/Users";
class SettingsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        list:[],
        modalVisible_login:false,
        loading:true,
        dynamic_style:styles_settings,
        theme:Global_theme_name,
        fav_teams_nbr:0,
        fav_teams_k_nbr:0,
        fav_leagues_nbr:0,
        fav_channels_nbr:0,
        window_height : Dimensions.get('window').height,
        window_width : Dimensions.get('window').width,
        modalVisible_users:false,
        
    };
  }
  async load_favs(){
    const fav_l = await API_.getConfig("favorite_leagues",[]);
    const fav_tk = await API_.getConfig("favorite_teams_k",[]);
    const fav_t = await API_.getConfig("favorite_teams",[]);
    const fav_c = await API_.getConfig("favorite_channels",[]);
    this.setState({
        fav_leagues_nbr  : fav_l.length ? fav_l.length : 0,
        fav_teams_nbr    : fav_t.length ? fav_t.length : 0,
        fav_teams_k_nbr  : fav_tk.length ? fav_tk.length : 0,
        fav_channels_nbr : fav_c.length ? fav_c.length : 0,
      });
  }
  componentDidMount(){
    this.load_favs();
    let short_title = "Settings" ;
    getTheme("styles_settings").then(theme=>this.setState({dynamic_style:theme})); 
    //this.props.navigation.setOptions({title: <Text >{short_title}</Text>});
  }
  componentWillUnmount(){
  }

 LoadingIndicatorView() {
    return <ActivityIndicator color='#009b88' size='large' />
  }

  picker_themes = ()=>{
    const picker_items = themes_list.map(theme_name=>{
      return (<Picker.Item label={theme_name} value={theme_name} key={theme_name} />);
    });
    return (<Picker
            selectedValue={this.state.theme}
            style={{ height:"90%",flex:1,backgroundColor:"#2d3436",color:"#dfe6e9" }}
            onValueChange={(itemValue, itemIndex)=>{
              //this.setState({theme : itemValue});
              API_.setConfig("theme",itemValue).then(o=>{
                if(API_.isWeb){
                  reloading_app = true;
                  location.reload();
                }else{
                  Updates.reloadAsync();
                }
              }); 
              
            }}
          >
            {picker_items}
        </Picker>);
  }
  render_modal_login(){
    return ( 
      <Credentials
        modal_visible={this.state.modalVisible_login}
        dynamic_style={this.state.dynamic_style}
        closeModal={()=>this.setState({modalVisible_login:false})}
      ></Credentials>
    );
  }
  render_modal_users(){
    return (          
      <Users
        modal_visible={this.state.modalVisible_users}
        dynamic_style={this.state.dynamic_style}
        closeModal={()=>this.setState({modalVisible_users:false})}
      ></Users>
    );
  }
  saveCredents=(username,password)=>{
    API_.setc
  }
  render() {
    //API_.setCredentials("imadelkholti@gmail.com","198922");
    const style= this.state.video && this.state.video.videoId ? {height:300,width:"100%",position:'absolute'} : {width:1,height:1};
    return (
      <ScrollView  style={this.state.dynamic_style.container}>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Login </Text> 
            <View style={this.state.dynamic_style.settings_row_input}>
              <Button
                title="Login"
                onPress={()=>this.setState({modalVisible_login:true})}
              ></Button>
            </View>
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>User </Text> 
            <Text style={this.state.dynamic_style.settings_row_input}>{backup.email}</Text>
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Theme </Text> 
            <View style={this.state.dynamic_style.settings_row_input}>{this.picker_themes()}</View>
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Clean cache </Text> 
            <Text style={this.state.dynamic_style.settings_row_input}>clean</Text>
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Users </Text> 
            <View style={this.state.dynamic_style.settings_row_input}><Button title="Manage" onPress={()=>this.setState({modalVisible_users:true})}></Button></View>
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Favorite Leagues </Text> 
            <Text style={this.state.dynamic_style.settings_row_input}>{this.state.fav_leagues_nbr}</Text>
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Favorite teams </Text> 
            <Text style={this.state.dynamic_style.settings_row_input}>{this.state.fav_teams_nbr} | {this.state.fav_teams_k_nbr}</Text>
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Favorite channels </Text> 
            <Text style={this.state.dynamic_style.settings_row_input}>{this.state.fav_channels_nbr}</Text>
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Screen size </Text> 
            <Text style={this.state.dynamic_style.settings_row_input}>{this.state.window_height} X {this.state.window_width}</Text>
          </View>

          {this.render_modal_login()}
          {this.render_modal_users()}
        </ScrollView >
    );
  }
}


export default SettingsScreen;
