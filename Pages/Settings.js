import React from "react";
import {  View, Dimensions, Modal, Button, Linking, ScrollView , ImageBackground, ActivityIndicator, Switch} from 'react-native';
import {styles_settings,getTheme, themes_list} from "../components/Themes";
import Credentials from "../components/Credentials";
import AppLogHistory from "../components/AppLogHistory";
import MatchesNotifs from "../components/MatchesNotifs";
import Users from "../components/Users";
import Users_log from "../components/Users_log";
import * as Updates from 'expo-updates';
import * as ScreenOrientation from 'expo-screen-orientation';
import {Picker} from '@react-native-picker/picker';
import updared_at from "../Libs/updated";

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
        modalVisible_users_log:false,
        modalVisible_matchesNotif:false,
        is_debug:API_.is_debug,
        filtering:API_.filtering,
        is_landScape:false,
        is_materialTopTab:false,
        notify_isWeb : API_.notify_isWeb,
        force_open_expo :false,
        keyDown_listner:false,
        is_movies_home_page : false,
    };
    this.apk_url = "https://github.com/imadboy89/download/raw/main/almatch.apk";
    //this.apk_url = "https://exp-shell-app-assets.s3.us-west-1.amazonaws.com/android/%40imadboss/almatch-2dc6b0c7a3da47819e4245d25dd4221a-signed.apk";
    this.privacy = "https://imad.is-a.dev/privacy_policy.html";
    this.terms = "https://imad.is-a.dev/terms_and_conditions.html";
  }
  async load_favs(){
    try {
      const fav_l = await API_.getConfig("favorite_leagues",[]);
      const fav_tk = await API_.getConfig("favorite_teams_k",[]);
      const fav_t = await API_.getConfig("favorite_teams",[]);
      const fav_c = await API_.getConfig("favorite_channels",[]);
      const fav_p = await API_.getConfig("favorite_players",[]);
      const default_ui = await API_.getConfig("default_ui",false);
      const is_materialTopTab = await API_.getConfig("is_materialTopTab",false);
      const _force_open_expo = await API_.getConfig("force_open_expo",false);
      const notification_fav_teams = await API_.getConfig("notification_fav_teams",false);

      const teams_inf_k = await API_.getTeam_logo_k();
      this.setState({
          fav_leagues_nbr  : fav_l && fav_l.length  ? fav_l.length : 0,
          fav_teams_nbr    : fav_t && fav_t.length  ? fav_t.length : 0,
          fav_teams_k_nbr  : fav_tk && fav_tk.length ? fav_tk.length : 0,
          fav_channels_nbr : fav_c && fav_c.length  ? fav_c.length : 0,
          fav_players_nbr  : fav_p && fav_p.length  ? fav_p.length : 0,
          is_debug         : API_.is_debug,
          filtering        : API_.filtering,
          is_materialTopTab: is_materialTopTab,
          teams_inf_k      : teams_inf_k && Object.keys(teams_inf_k) && Object.keys(teams_inf_k).length ? Object.keys(teams_inf_k).length : 0,
          force_open_expo : _force_open_expo,
          is_movies_home_page : default_ui != false && default_ui[0]!="Home",
          notification_fav_teams : notification_fav_teams,
        });
    } catch (error) {
      console.log(error);
    }

  }
  componentDidMount(){
    if(this.props.route && this.props.route.params && this.props.route.params.action=="signup"){
      this.setState({modalVisible_login:true});
    }
    this.load_favs();
    let short_title = "Settings" ;
    getTheme("styles_settings").then(theme=>this.setState({dynamic_style:theme})); 
    /*
    ScreenOrientation.getOrientationLockAsync().then(o=>{
      //console.log(o,ScreenOrientation.OrientationLock,);
    }).catch(error=>API_.debugMsg(error+"","warning"));

    ScreenOrientation.getOrientationAsync().then(o=>{
      this.setState({ is_landScape : [3,4].includes(o) });
    }).catch(error=>API_.debugMsg(error+"","warning"));
    */
  }
  componentWillUnmount(){
    this.toggle_keys_listner(false);
  }

 LoadingIndicatorView() {
    return <ActivityIndicator color='#009b88' size='large' />
  }
  toggle_keys_listner=(status)=>{
    this.state.keyDown_listner = status;
    if(status){
      if(API_.isWeb){
        document.addEventListener("keydown", this.keysListnerFunction, false);
      }
    }else{
      if(API_.isWeb){
        document.removeEventListener("keydown", this.keysListnerFunction, false);
      }
    }
    if(API_.isWeb){
      this.setState({keyDown_listner : status});
    }
  }
  keysListnerFunction = (event)=>{
    if(this.state.keyDown_listner){
      alert(`Prissed key -${event.keyCode}-`);
    }
  }
  picker_themes = ()=>{
    const picker_items = themes_list.map(theme_name=>{
      return (<Picker.Item label={theme_name} value={theme_name} key={theme_name} />);
    });
    return (<Picker
            selectedValue={this.state.theme}
            style={{ height:"90%",flex:1,backgroundColor:"#2d3436",color:"#dfe6e9" }}
            itemStyle={{height:40,backgroundColor:"#2d3436",color:"#dfe6e9" }}
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
      closeModal={()=>{this.setState({modalVisible_history:false})}}
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
  render_modal_users_log(){
    return (          
      <Users_log
        modal_visible={this.state.modalVisible_users_log}
        dynamic_style={this.state.dynamic_style}
        closeModal={()=>this.setState({modalVisible_users_log:false})}
        navigation={this.props.navigation}
        onRef={(ref) => (this.Users_log_ref = ref)}
      ></Users_log>
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
                thumbColor={this.state.filtering ? "#f5dd4b" : "#f4f3f4"}
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

          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Notification for fav teams </Text> 
            <Text style={this.state.dynamic_style.settings_row_input}>
              <Switch
                style={{justifyContent:"center",marginVertical:"auto",marginHorizontal:10,width:40}}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={this.state.is_materialTopTab__v ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={(val)=>{
                  API_.setConfig("notification_fav_teams",val);
                  this.setState({notification_fav_teams:val});
                }}
                value={this.state.notification_fav_teams}
              />
            </Text>
          </View>

          { backup.admin!=true ? null : 
          <>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>is_materialTopTab </Text> 
            <Text style={this.state.dynamic_style.settings_row_input}>
              <Switch
                style={{justifyContent:"center",marginVertical:"auto",marginHorizontal:10,width:40}}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={this.state.is_materialTopTab__v ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={(is_materialTopTab__v)=>{
                  API_.setConfig("is_materialTopTab",is_materialTopTab__v);
                  this.setState({is_materialTopTab:is_materialTopTab__v});
                }}
                value={this.state.is_materialTopTab}
              />
            </Text>
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Use home page [Movies] </Text> 
            <Text style={this.state.dynamic_style.settings_row_input}>
              <Switch
                style={{justifyContent:"center",marginVertical:"auto",marginHorizontal:10,width:40}}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={this.state.is_movies_home_page ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={async(is_movies_home_page)=>{
                  if(is_movies_home_page){
                    await API_.setConfig("default_ui",["Videos", {screen: "Movies", params: {source_id: 8}}]);
                  }else{
                    await API_.setConfig("default_ui",false);
                  }
                  this.setState({is_movies_home_page:is_movies_home_page});
                }}
                value={this.state.is_movies_home_page}
              />
            </Text>
          </View>
            <View style={this.state.dynamic_style.settings_row}>
              <Text style={this.state.dynamic_style.settings_row_label}>Users </Text> 
              <View style={this.state.dynamic_style.settings_row_input}><Button title="Manage" onPress={()=>this.setState({modalVisible_users:true})}></Button></View>
            </View>
            <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Users log</Text> 
            <View style={this.state.dynamic_style.settings_row_input}><Button title="Manage" onPress={()=>{
              this.setState({modalVisible_users_log:true});
              this.Users_log_ref.loadUsers();
              }}></Button></View>
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Notify ISweb </Text> 
            <Text style={this.state.dynamic_style.settings_row_input}>
              <Switch
                style={{justifyContent:"center",marginVertical:"auto",marginHorizontal:10,width:40}}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={this.state.notify_isWeb ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={()=>{
                  API_.notify_isWeb = !API_.notify_isWeb;
                  this.setState({notify_isWeb:API_.notify_isWeb});
                }}
                value={this.state.notify_isWeb}
              />
            </Text>
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
            <Text style={this.state.dynamic_style.settings_row_label}>TEST TV </Text> 
            <View style={this.state.dynamic_style.settings_row_input}>
              <Button title="TV controller" onPress={()=>this.props.navigation.navigate('TV')}></Button>
            </View>
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>FS TEST </Text> 
            <View style={this.state.dynamic_style.settings_row_input}>
              <Button title="FS test" onPress={()=>this.props.navigation.navigate('FS')}></Button>
            </View>
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}> </Text> 
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Update Channel </Text> 
            <Text style={this.state.dynamic_style.settings_row_input}>-</Text>
          </View>
          </>
          
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
            <Text style={this.state.dynamic_style.settings_row_label}>Download APK ..</Text> 
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
                thumbColor={this.state.is_landScape ? "#f5dd4b" : "#f4f3f4"}
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
            <Text style={this.state.dynamic_style.settings_row_label}>Listen to keys </Text> 
            <Text style={this.state.dynamic_style.settings_row_input}>
              <Switch
                style={{justifyContent:"center",marginVertical:"auto",marginHorizontal:10,width:40}}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={this.state.keyDown_listner ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={()=>{
                  this.toggle_keys_listner(!this.state.keyDown_listner);
                }}
                value={this.state.keyDown_listner}
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
            <Text style={this.state.dynamic_style.settings_row_label}>Privacy policy: </Text> 
            <View style={this.state.dynamic_style.settings_row_input}>
              <Button color="#42dc84" title="Open" onPress={()=>{ API_.open_ext_url(this.privacy); }}></Button>
            </View>
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Terms and conditions </Text> 
            <View style={this.state.dynamic_style.settings_row_input}>
              <Button color="#42dc84" title="Open" onPress={()=>{ API_.open_ext_url(this.terms); }}></Button>
            </View>
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Share </Text> 
            <View style={this.state.dynamic_style.settings_row_input}>
              <Button color="#42dc84" title="Share" onPress={()=>{ API_.onShare("AL-match","AL-match Live matches results,highlites and news","https://play.google.com/store/apps/details?id=com.imados.almatch");}}></Button>
            </View>
          </View>


          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Update Id </Text> 
            <Text style={this.state.dynamic_style.settings_row_input}>{Updates.updateId}</Text>
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Update Date </Text> 
            <Text style={this.state.dynamic_style.settings_row_input}>{updared_at}</Text>
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}> </Text> 
          </View>
          {this.render_modal_history()}
          {this.render_modal_login()}
          { this.state.modalVisible_matchesNotif==true ? this.render_modal_matchesNotifs() : null}
          { backup.admin!=true ? null : this.render_modal_users()}
          { backup.admin!=true ? null : this.render_modal_users_log()}
        </ScrollView >
    );
  }
}


export default SettingsScreen;
