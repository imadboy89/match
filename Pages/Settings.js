import React from "react";
import {  View, Dimensions, Modal, Button, Linking, ScrollView, Picker , ImageBackground, ActivityIndicator, Switch} from 'react-native';
import {styles_settings,getTheme, themes_list} from "../components/Themes";
import Credentials from "../components/Credentials";
import AppLogHistory from "../components/AppLogHistory";
import MatchesNotifs from "../components/MatchesNotifs";
import Users from "../components/Users";
import * as Updates from 'expo-updates';
import * as ScreenOrientation from 'expo-screen-orientation';


class SettingsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        list:[],
        modalVisible_login:false,
        modalVisible_history:false,
        loading:true,
        dynamic_style:styles_settings,
        theme:Global_theme_name,
        fav_teams_nbr:0,
        fav_teams_k_nbr:0,
        fav_leagues_nbr:0,
        fav_channels_nbr:0,
        fav_players_nbr:0,
        window_height : parseInt(Dimensions.get('window').height),
        window_width : parseInt(Dimensions.get('window').width),
        modalVisible_users:false,
        modalVisible_matchesNotif:false,
        is_debug:API_.is_debug,
        filtering:API_.filtering,
        is_landScape:false,
        
    };
    this.apk_url = "https://github.com/imadboy89/download/raw/main/almatch.apk";


  }
  async load_favs(){
    const fav_l = await API_.getConfig("favorite_leagues",[]);
    const fav_tk = await API_.getConfig("favorite_teams_k",[]);
    const fav_t = await API_.getConfig("favorite_teams",[]);
    const fav_c = await API_.getConfig("favorite_channels",[]);
    const fav_p = await API_.getConfig("favorite_players",[]);
    const teams_inf_k = await API_.getTeam_logo_k();
    this.setState({
        fav_leagues_nbr  : fav_l.length  ? fav_l.length : 0,
        fav_teams_nbr    : fav_t.length  ? fav_t.length : 0,
        fav_teams_k_nbr  : fav_tk.length ? fav_tk.length : 0,
        fav_channels_nbr : fav_c.length  ? fav_c.length : 0,
        fav_players_nbr  : fav_p.length  ? fav_p.length : 0,
        is_debug         : API_.is_debug,
        filtering        : API_.filtering,
        teams_inf_k      : teams_inf_k && Object.keys(teams_inf_k) && Object.keys(teams_inf_k).length ? Object.keys(teams_inf_k).length : 0,
      });
  }
  componentDidMount(){
    this.load_favs();
    let short_title = "Settings" ;
    getTheme("styles_settings").then(theme=>this.setState({dynamic_style:theme})); 
    //this.props.navigation.setOptions({title: <Text >{short_title}</Text>});
    ScreenOrientation.getOrientationLockAsync().then(o=>{
      //console.log(o,ScreenOrientation.OrientationLock,);
    }).catch(error=>API_.showMsg(error+"","warning"));

    ScreenOrientation.getOrientationAsync().then(o=>{
      this.setState({ is_landScape : [3,4].includes(o) });
    }).catch(error=>API_.showMsg(error+"","warning"));
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
  render_modal_history(){
    return (<AppLogHistory
      modal_visible={this.state.modalVisible_history}
      dynamic_style={this.state.dynamic_style}
      closeModal={()=>{
        this.setState({modalVisible_history:false})}}
      ></AppLogHistory>);
  }
  render_modal_matchesNotifs(){
    return (<MatchesNotifs
      navigation={this.props.navigation}
      modal_visible={this.state.modalVisible_matchesNotif}
      dynamic_style={this.state.dynamic_style}
      closeModal={()=>{
        this.setState({modalVisible_matchesNotif:false})}}
      ></MatchesNotifs>);
  }
  render_modal_login(){
    if(backup && backup.is_auth){
      return 
    }
    return ( 
      <Credentials
        modal_visible={this.state.modalVisible_login}
        dynamic_style={this.state.dynamic_style}
        closeModal={()=>{
          this.state.modalVisible_login = false;
          this.load_favs();
        }}
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
  render() {
    //API_.setCredentials("imadelkholti@gmail.com","198922");
    const style= this.state.video && this.state.video.videoId ? {height:300,width:"100%",position:'absolute'} : {width:1,height:1};
    return (
      <ScrollView  style={this.state.dynamic_style.container} keyboardShouldPersistTaps={'handled'}>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Login </Text> 
            <View style={this.state.dynamic_style.settings_row_input}>
              <Button
                title={backup && backup.is_auth ? "LogOUT" :"Login"}
                color={backup && backup.is_auth ? "#f39c12":"#3498db"}
                onPress={()=>{
                  if(backup && backup.is_auth){
                    backup.login(true).then(o=>{
                      API_.showMsg("تم تسجيل الخروج ، نراك لاحقًا!","warning");
                      this.setState({});
                    });
                    
                  }else{
                    this.setState({modalVisible_login:true});
                  }
                  
                }}
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
            <Text style={this.state.dynamic_style.settings_row_label}>Filtering Matches </Text> 
            <Text style={this.state.dynamic_style.settings_row_input}>
              <Switch
                style={{justifyContent:"center",marginVertical:"auto",marginHorizontal:10,width:40}}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={this.state.is_debug ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={()=>{
                  API_.filtering = !this.state.filtering;
                  API_.setConfig("filtering",API_.filtering);
                  this.setState({filtering:API_.filtering});
                }}
                value={this.state.filtering}
              />
            </Text>
          </View>

          { backup.admin!=true ? null : 
            <View style={this.state.dynamic_style.settings_row}>
              <Text style={this.state.dynamic_style.settings_row_label}>Users </Text> 
              <View style={this.state.dynamic_style.settings_row_input}><Button title="Manage" onPress={()=>this.setState({modalVisible_users:true})}></Button></View>
            </View>
          }
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Offset Time: </Text> 
            <Text style={this.state.dynamic_style.settings_row_input}>{API_.time_offset}</Text>
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Loaded Teams Info </Text> 
            <Text style={this.state.dynamic_style.settings_row_input}>{this.state.teams_inf_k}</Text>
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
            <Text style={this.state.dynamic_style.settings_row_label}>Favorite Players </Text> 
            <Text style={this.state.dynamic_style.settings_row_input}>{this.state.fav_players_nbr}</Text>
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Screen size </Text> 
            <Text style={this.state.dynamic_style.settings_row_input}>{this.state.window_height} X {this.state.window_width}</Text>
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Download APK </Text> 
            <View style={this.state.dynamic_style.settings_row_input}>
              <Button title="Download" onPress={()=>{
                if(API_.isWeb){
                  window.open(this.apk_url, '_blank');
                }else{
                  Linking.canOpenURL(this.apk_url).then(supported=>{
                    if(supported){
                      Linking.openURL(this.apk_url);
                    }else{
                      notifyMessage("This link is not supported : "+url);
                    }
                  });
                }

              }}></Button>
            </View>
          </View>

          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Debug mode </Text> 
            <Text style={this.state.dynamic_style.settings_row_input}>
              <Switch
                style={{justifyContent:"center",marginVertical:"auto",marginHorizontal:10,width:40}}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={this.state.is_debug ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={()=>{
                  API_.is_debug = !this.state.is_debug;
                  API_.setConfig("is_debug",API_.is_debug);
                  this.setState({is_debug:API_.is_debug});
                }}
                value={this.state.is_debug}
              />
            </Text>
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>landScape mode : </Text> 
            <Text style={this.state.dynamic_style.settings_row_input}>
              <Switch
                style={{justifyContent:"center",marginVertical:"auto",marginHorizontal:10,width:40}}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={this.state.is_debug ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={()=>{
                    ScreenOrientation.supportsOrientationLockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT)
                    .then(o=>{
                      if(o){
                        const orientation = this.state.is_landScape ? ScreenOrientation.OrientationLock.PORTRAIT_UP : ScreenOrientation.OrientationLock.LANDSCAPE_LEFT;
                        ScreenOrientation.lockAsync(orientation)
                        .then(o=>{
                          if(o){
                            this.setState({is_landScape : !this.state.is_landScape});
                          }
                        }).catch(error=>{
                          API_.showMsg(error+"","warning");
                        });
                      }else{
                        API_.showMsg("LANDSCAPE_LEFT not supported on this device !");
                      }
                    }).catch(error=>API_.showMsg(error+"","warning"));           
                }}
                value={this.state.is_landScape}
              />
            </Text>
          </View>

          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Testing notifff </Text> 
            <View style={this.state.dynamic_style.settings_row_input}>
              <Button title="Testing notifff" onPress={()=>API_.showMsg("Testing notifff 123",["info","danger","warning","success","info","danger","warning","success","info"][parseInt((Math.random(1)+"").slice(2,3))],undefined,10000)}></Button>
            </View>
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>load channels </Text> 
            <View style={this.state.dynamic_style.settings_row_input}>
              <Button 
              title="load" 
              disabled={API_.load_channels_running}
              onPress={()=>{
                this.setState({});
                API_.load_channels().then(o=>this.setState({}))
                }}></Button>
            </View>
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>load external channels </Text> 
            <View style={this.state.dynamic_style.settings_row_input}>
              <Button title="load" onPress={()=>API_.load_external_channels().then(o=>API_.showMsg("Loading Channels done ["+Object.keys(API_.external_channels).length+"] ["+o+"]"))}></Button>
            </View>
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>load teams </Text> 
            <View style={this.state.dynamic_style.settings_row_input}>
              <Button title="load" onPress={()=>backup.load_teams().catch(err=>alert(err))}></Button>
            </View>
          </View>
          
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>logHistory </Text> 
            <View style={this.state.dynamic_style.settings_row_input}>
              <Button color={'#2196F3'} title="logHistory" onPress={()=>this.setState({modalVisible_history:true})}></Button>
            </View>
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>matches notif </Text> 
            <View style={this.state.dynamic_style.settings_row_input}>
              <Button title="List" onPress={()=>this.setState({modalVisible_matchesNotif:true})}></Button>
            </View>
          </View>

          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>TEST TV </Text> 
            <View style={this.state.dynamic_style.settings_row_input}>
              <Button title="TV controller" onPress={()=>this.props.navigation.navigate('TV')}></Button>
            </View>
          </View>

          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}> </Text> 
          </View>
          {this.render_modal_history()}
          {this.render_modal_login()}
          { this.state.modalVisible_matchesNotif==true ? this.render_modal_matchesNotifs() : null}
          { backup.admin!=true ? null : this.render_modal_users()}
        </ScrollView >
    );
  }
}


export default SettingsScreen;
