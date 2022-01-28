import * as React from 'react';
import {  View, StyleSheet, Modal, Button, TouchableOpacity, Platform, RefreshControl, Picker , Switch} from 'react-native';
import Constants from 'expo-constants';
import ItemsList from '../components/list';
import DateTimePicker from '@react-native-community/datetimepicker';
import IconButton from "../components/IconButton";
import {global_theme,getTheme,themes_list} from "../components/Themes";
import ExpoCustomUpdater from '../Libs/update';
import * as Notifications from 'expo-notifications';
import Loader from "../components/Loader";
import {onMatch_LongPressed,get_notifications_matches} from "../Libs/localNotif";
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import User_log from "../components/User_log";

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        list:[],
        page:1,
        modalVisible_match:false,
        show_datPicker : false,
        matches_date:new Date(),
        loading :true,
        loading_fonts:false,
        update_available:false,
        dynamic_style:false,
        notifications_matches:{},
        favorite:[],
        source_id:1,
        is_only_live : false,
        is_upd_available:-1,
        is_auth:false, 
        show_user_log:false,
        user_log:false,
        //dynamic_style_list:styles_list,
    };

    api_type = this.state.source_id;
    this.is_authenting = false;
    this.didBlurSubscription = this.props.navigation.addListener(
      'focus',
      payload => {
        /*
        if(this.state.is_auth!=backup.is_auth){
          this.state.is_auth=backup.is_auth;
          this.refresh_leagues();
        }*/
        if(this._isMounted==false){
          return;
        }
        this.refresh_leagues();
        this.render_header();
      }
    );


  }
  async componentWillUnmount(){
    if(API_.isWeb){
      document.removeEventListener("keydown", this.escFunction, false);
    }
    this._isMounted = false;
    clearInterval(this.interval_refresh);
    clearInterval(this.interval_refresh_if_issue);
    if(backup.timer){
      clearInterval(backup.timer);
    }
    if(this.didBlurSubscription && this.didBlurSubscription.remove){
      this.didBlurSubscription.remove();
    }
  }
  goFullscreen = ()=>{
    if(API_.isWeb){
      if(document.fullscreenElement){
        document.exitFullscreen();
        API_.showMsg("Going Back to normal mode!","info");
      }else{
        document.body.requestFullscreen().then(o=>{
          API_.showMsg("Going full screen mode!","info");
        }).catch(error=>{
          API_.debugMsg(error,"warning");
        });
      }

    }
  }
  escFunction = (event)=>{
    if(event.keyCode === 27) {
      this.props.navigation.goBack(null);
    }
  }
  promtInstallWPA(){
    //API_.showMsg("Click here to install *AlMatch* as PWA!","success", undefined, 5000, ()=>{console.log("clicked.....");});
    
    setTimeout( async function(){
        if(window.matchMedia('(display-mode: standalone)').matches == false){
          API_.showMsg("Click here to install *AlMatch* as PWA!","success", undefined, 10000, async()=>{
            if(deferredPrompt && deferredPrompt.prompt){
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            //console.log(`User response to the install prompt: ${outcome}`);
            }else{console.log(`not ok var`);}
          
          })
        }
      },15000);
  }
  promtSignUp(){
    const _this = this;
    setTimeout( async function(){
      if(backup.is_auth == false){
        API_.showMsg("انقر هنا للتسجيل أو تسجيل الدخول!","info", undefined, 7000, async()=>{
          _this.props.navigation.navigate('Settings',{"action":"signup"});
        })
      }
      },50000);
  }
  componentDidMount=async()=>{
    this.screen_focus_mng();
    if(API_.isWeb){
      API_.next = this.nextPage;
      API_.setDate = this.onChange;
      this.promtInstallWPA();
      this.promtSignUp();
      if(navigator && navigator.serviceWorker && navigator.serviceWorker.addEventListener){
        navigator.serviceWorker.removeEventListener('message',()=>{});
        navigator.serviceWorker.addEventListener('message', event => {
          console.log(event);
          const data = event.data && event.data.data ? event.data.data : false;
          if (data && data.is_user_log){
            this.setState({show_user_log:true,user_log:data});
          }else if(data){
            this.onMatch_clicked(data);
          }
        });
      }
      //document.addEventListener("keydown", this.escFunction, false);
    }

    this.get_matches(this.state.matches_date);
    this.checkUpdAvailability(true);
    //handle notification
    Notifications.addNotificationReceivedListener(this._handleNotification);
    Notifications.addNotificationResponseReceivedListener(this._handleNotificationResponse);
    /////////////
    let is_dev = false;
    try{
      is_dev = __DEV__;
    }catch(e){}
    this._isMounted = true;
    getTheme("styles_home").then(theme=>{
      this.setState({dynamic_style:theme});
      this.render_header();
      });

    this.interval_refresh = setInterval(()=>{
      this._refresh_();
    }, 50000);

    this.interval_refresh_if_issue = setInterval(()=>{
      if(this.state.list==undefined || !this.state.list || !this.state.list.length || this.state.list.length==0){
        this._refresh_(true,true);
      }else{
        clearInterval(this.interval_refresh_if_issue);
      }
    }, 2000);
    API_.load_channels__();
  }
  _refresh_(no_settings=false,setLoading=false){
    this.setState({is_auth:backup.is_auth });
    let load_settings = no_settings==true && backup.is_settings_loaded ? false :true;

    if(load_settings && backup.is_auth){
      backup.load_settings().then(o=>{
        if(o){
          this.refresh_leagues(this.state.list);
        }
      })
    }
    if(API_.get_date(this.state.matches_date)==API_.get_date(new Date())){
      this.get_matches(null,setLoading);
    }
  }
  checkUpdAvailability(force_update=false){
    if(API_.isWeb){return;}
    this.state.is_upd_available=-1
    this.render_header();
    this.customUpdater = new ExpoCustomUpdater()
    this.customUpdater.isAppUpdateAvailable().then(isAv=>{
      this.state.is_upd_available=isAv;
      this.render_header();
      if(force_update && this.state.is_upd_available){
        try {
          this.customUpdater.doUpdateApp();
        } catch (error) {
          API_.showMsg(error);
        }
      }
    });
  }
  refresh_list=()=>{
    const tmp_list = JSON.parse(JSON.stringify(this.state.list)) ;
    if(this._isMounted){
      this.setState({list:[],page:1}); 
      this.setState({list:tmp_list});
    }else{alert("unmounted")}
  }
  set_fav=(league_id,league_name)=>{
    let msg_action = "";
    API_.getConfig("favorite_leagues",this.state.favorite).then(o=>{
      if( o.includes(league_id) ){
        o = o.filter(o=>{if(o!=league_id)return o;});
        msg_action = "تمت إزالته من";
      }else{
        o.push(league_id);
        msg_action = "تمت إضافته إلى";
      }
      this.setState({favorite:o});
      API_.setConfig("favorite_leagues",o);
      API_.showMsg(`الدوري ٭${league_name}٭ ${msg_action} المفضلة!`);
    });
    this.setState({});
  }
  _onMatch_LongPressed=(item)=>{
    onMatch_LongPressed(item).then(oo=>{
      if(oo==false){return false;}
      //API_.notifications_matches[API_.notifications_matches.id] = API_.notifications_matches ;
      //this.setState({notifications_matches:API_.notifications_matches});
      this.refresh_leagues();
      /*
      get_notifications_matches(this.state.matches_date).then(o=>{
        console.log("get_notifications_matches",o);
        API_.notifications_matches = o;
      } );
      */
    });
  }

  changesource = (itemValue, itemIndex)=>{
    this.end=false;
    this.state.source_id = parseInt(itemValue);
    this.setState({source_id:parseInt(itemValue),page:1});
    this.get_matches();
    api_type = parseInt( itemValue );
  }
  update_is_only_live=(k,v)=>{
    this.state.matches_date = k==true ? new Date() : this.state.matches_date;
    this.setState({is_only_live:k});
    this.render_header();
    this.get_matches();
    }
  
    _handle_item = (item)=>{
      //API_.debugMsg(JSON.stringify(item),"danger");
      if(item){
        if(item.is_user_log){
          this.setState({show_user_log:true,user_log:data});
        }else if(item.is_news){
          //https://lio0.com/News/Article/-/1087048
          this.props.navigation.navigate("Article",{id:item.id, article:"-"});
        }else{
          this.onMatch_clicked(item);
        }
      }
    }
  _handleNotification = notification => {
    //API_.showMsg("_handleNotification : "+JSON.stringify(notification.request.content.data.data) );
    try{
      const data = notification.request.content.data.data;
      let item = typeof data == "string" ? JSON.parse(data) : data;
      console.log("notif 1 ",item);
      this._handle_item(item);
    }catch(error){API_.debugMsg(error,"danger")}
  };

  _handleNotificationResponse = response => {
    //API_.showMsg("_handleNotificationResponse : "+ JSON.stringify(response.notification.request.content.data.data) );
    try{
      const data = response.notification.request.content.data.data;
      let item = typeof data == "string" ? JSON.parse(data) : data;
      console.log("notif 1 ",item);
      this._handle_item(item);
    }catch(error){API_.debugMsg(error,"danger")}
  };


  render_header=()=>{

    let headerLeft = null;
    const iconsSize = this.state.dynamic_style && this.state.dynamic_style.title ? this.state.dynamic_style.title.fontSize : 15;
    if(this.state.is_upd_available===true){
      headerLeft = ()=>(
        <IconButton 
          name="cloud-download" size={iconsSize} style={this.state.dynamic_style.icons}
            onPress={()=>{
              this.setState({list:[],loading:true});
              this.customUpdater.doUpdateApp();
        }}  /> );
    }else{
      headerLeft = ()=>(
        <IconButton 
          name={API_.isWeb==true ? "search-plus" : "inbox" }
          disabled={API_.isWeb==false && this.state.is_upd_available===-1}
          size={iconsSize} style={this.state.dynamic_style.icons} 
            onPress={()=>{
              this.checkUpdAvailability();
              this.goFullscreen();
        }}  /> );
    }
    
    this.props.navigation.setOptions({
        title:"AlMatch-المباريات",
        "headerLeft":headerLeft,
        "headerRight":()=>(
          <View style={{flexDirection:"row",margin:5}}>
            <Switch
              style={{justifyContent:"center",marginVertical:"auto",marginHorizontal:10,width:40}}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={this.state.is_only_live ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={this.update_is_only_live}
              value={this.state.is_only_live}
            />
              {API_.isWeb==false ?null : 
              <IconButton 
                name="refresh" size={iconsSize} style={this.state.dynamic_style.icons} onPress={()=>{
                this.get_matches(this.state.matches_date);
                
              }}  />
              }
              <IconButton 
                name={ backup.is_auth ? "user" : "gears"}
                size={iconsSize} style={this.state.dynamic_style.icons} onPress={()=>{
                this.props.navigation.navigate('Settings');
              }}  />
          </View>
        )
      });
  }
  screen_focus_mng(){
    this.is_focused = true;
    this.subscribetions=[];
    this.subscribetions.push(this.props.navigation.addListener('focus', () => {
      this.is_focused = true;
    }));
    this.subscribetions.push(this.props.navigation.addListener('blur', () => {
      this.is_focused = false;
    }));
  }
  get_matches = (date_obj=null,setloading=true,next=false)=>{
    if(this.is_focused==false){return;}
    if(this.state.loading==false && setloading){this.setState({loading:true});}
    if(this.state.source_id!=0){
      return this.get_matches_koora(date_obj,next);
    }
    date_obj = date_obj==null ? this.state.matches_date :date_obj; 

    API_.getConfig("favorite_leagues",this.state.favorite).then(favorite=>{
      get_notifications_matches().then(_notifications_matches=>{
        API_.getLeagues().then(leagues_dict=>{
          API_.get_matches(date_obj,this.state.page).then(resp=>{
            const matches_list = resp ? resp : {};
            let data = [];
          if(matches_list && Object.keys(matches_list).length){
            let list = [];
            data = Object.keys(matches_list).map(k =>{
              let row = matches_list[k] ;
              let img = row && row.length>0 && row[0]["league_badge"] && row[0]["league_badge"]["path"] 
                        ? row[0]["league_badge"]["path"] : false;
              let league_id=0; 
              try{league_id= leagues_dict && leagues_dict[k]? leagues_dict[k].league_id :0;}catch(e){console.log(e);}
              for(let i=0;i<row.length;i++){
                row[i].time = API_.convert_time(row[i].time);
                row[i].league_id = league_id
                if(row[i].live){
                  const played_time = API_.convert_time_spent(row[i].date + " "+row[i].time) ;
                  row[i].time_played = played_time ? played_time : "";
                  if(played_time==false || played_time<-10){
                    row[i].live = 0;
                  }
                }
              }
              if(this.state.is_only_live){
                row = row.filter(o=>o.live);
              }
              return {"title":k,"img":img, data:row,"id":league_id}; 
            });
            data = data.filter(o=>o.data.length>0);
            try{
              data = data.sort((a,b)=>{return (favorite.indexOf(a.id)>favorite.indexOf(b.id))?-1:1;});
            }catch(e){console.log(e);}
          }
          //this.end = data.length == 0 ? true : false;
          //data = this.state.page>1 ? this.state.list.concat(data) : data;
          if(this._isMounted){
            this.setState({list:data,loading:false,favorite:favorite,notifications_matches:_notifications_matches});
          }
        });
        });
    });
  });
}
refresh_leagues = async()=>{
  this.state.list = await this.get_favs(this.state.list);
  this.setState({list:this.state.list});
}
async get_favs(data){
  if(data && data.length > 0 && data[0].id==1){
    data = data.filter(o=>o.id && o.id!=1);
  }
  this.state.favorite_teams = await API_.getConfig("favorite_teams_k",[]) ;
  this.state.favorite = await API_.getConfig("favorite_leagues",this.state.favorite);
  let fav_list = {"id":1,"title":"الفرق المفضلة","img":"",data:[]};
  ////////////////////////////////  Black listed matches 
  const already_existed_leagues = data.map(o=>o.id);
  for(let j=0;j<API_.matches_bl.length;j++){
    let is_league_has_fav = false;
    for(let m=0;m<API_.matches_bl[j]["data"].length;m++){
      const matche_f = JSON.parse(JSON.stringify(API_.matches_bl[j]["data"][m]));
      const home_team_id = parseInt(matche_f["home_team_id"]) ? parseInt(matche_f["home_team_id"]) : 0 ;
      const away_team_id = parseInt(matche_f["away_team_id"]) ? parseInt(matche_f["away_team_id"]) : 0 ;
      if(API_.notifications_matches && API_.notifications_matches[matche_f.id]!=undefined){
        is_league_has_fav = true;
      }else if(this.state.favorite_teams.includes(home_team_id) || this.state.favorite_teams.includes(away_team_id)){
        is_league_has_fav = true;
      }
    }
    if( (is_league_has_fav  || this.state.favorite.includes(API_.matches_bl[j].id)) && already_existed_leagues.includes(API_.matches_bl[j].id)==false){
      data.push(API_.matches_bl[j]);
    }
  }
  //////////////////////////////////////////////////////////////////
  try{
    data = data.sort((a,b)=>{ 
      //return API_.leagues_dict[API_.fix_title(a.title) ] != undefined && API_.leagues_dict[API_.fix_title(b.title) ] == undefined 
      return API_.leagues_dict[a.id] != undefined && API_.leagues_dict[b.id] == undefined
      ?-1:0 ;
    
    });
  }catch(e){console.log(e);}
  data = data.sort((a,b)=>{return (this.state.favorite.indexOf(a.id)>this.state.favorite.indexOf(b.id))?-1:0;});
  let added_fav_matches = [];
  for(let j=0;j<data.length;j++){
    for(let m=0;m<data[j]["data"].length;m++){
      const matche_f = JSON.parse(JSON.stringify(data[j]["data"][m]));
      const home_team_id = parseInt(matche_f["home_team_id"]) ? parseInt(matche_f["home_team_id"]) : 0 ;
      const away_team_id = parseInt(matche_f["away_team_id"]) ? parseInt(matche_f["away_team_id"]) : 0 ;
      if(added_fav_matches.includes(matche_f["id"])){
        continue;
      }
      if(API_.notifications_matches && API_.notifications_matches[matche_f.id]!=undefined){
        added_fav_matches.push(matche_f["id"]);
        fav_list.data.push(matche_f);
      }else if(this.state.favorite_teams.includes(home_team_id) || this.state.favorite_teams.includes(away_team_id)){
        added_fav_matches.push(matche_f["id"]);
        fav_list.data.push(matche_f);
      }
    }
  }

  data = fav_list.data.length>0 ? [fav_list,].concat(data) : data ;
  return data;
}
get_matches_koora = async(date_obj=null,next=false)=>{
  date_obj = date_obj==null ? this.state.matches_date :date_obj; 
  //API_.notifications_matches = await get_notifications_matches(date_obj);
  //API_.load_leagues(this.refresh_leagues);
  get_notifications_matches().then(o=>{
    API_.notifications_matches=o;
    this.refresh_leagues();
  });
  API_.favorite_leagues = await API_.getConfig("favorite_leagues",this.state.favorite);
  let resp = [];
  resp = await API_.get_matches_k(date_obj,this.state.is_only_live,this.state.source_id,next);
  let data = resp && resp.length>0 ? resp : [];
  //alert("HOME->get_matches_koora -> 1 "+data.length);
  data = await this.get_favs(data);
  //alert("HOME->get_matches_koora ->2"+data.length);
  data = await API_.set_logos(data);
  //alert("HOME->get_matches_koora ->3   "+data.length);
  if(this._isMounted){
    this.setState({list:data,loading:false});
  }

}
 onChange = (event, selectedDate) => {
    if(selectedDate==undefined){
      this.setState({show_datPicker: false});
    }
    const currentDate = selectedDate || date;
    this.setState({show_datPicker: Platform.OS === 'ios' ,list:[],matches_date:currentDate,loading:true,is_only_live:false});
    this.get_matches(currentDate);
    this.render_header();
  };
show_DateP(){
  if(this.state.show_datPicker==false){
    return null;
  }
  return  (<DateTimePicker
            style={{
              color: '#fff',
              backgroundColor: '#000',
            }}
          testID="datePicker"
          value={this.state.matches_date}
          mode="date"
          display="default"
          onChange={this.onChange}
        />);
}

  render_modal_credentials(){
    
  return (          
      <Modal 
        animationType="slide"
        transparent={true}
        visible={this.state.modalVisible_match}
        onRequestClose={() => { 
            this.setState({ modalVisible_match:false,});
        } }
      >
        <View style={{flex:.4,backgroundColor:"#2c3e5066"}}></View>
        <View style={{height:400,width:"100%",backgroundColor:"#646c78"}}>
        <Text > {this.state.match ? this.state.match.id : ""} : </Text>
        </View>
        <View style={{flex:1,backgroundColor:"#2c3e5066"}}></View>

      </Modal>
      );
}

  onLeaguePressed = (league_name, league_img,league_id)=>{
    league_img = ["https:/","http://"].includes(league_img.slice(0,7)) ? league_img : API_.domain_o+league_img;
    this.props.navigation.navigate('League',{ id:league_id, league_details: {league:league_name,league_img:league_img,id:league_id} });
  }
  onMatch_clicked =(item)=>{
    this.props.navigation.navigate('Match', { match_item: item,id:item.id });
  }
  onSwipeRight = (stat)=>{
    //console.log(stat);
    this.previousPage();
  }
  onSwipeLeft = (stat)=>{
    //console.log(stat);
    this.nextPage();
  }
  nextPage = ()=>{
    this.end=false;
    this.state.matches_date .setDate(this.state.matches_date .getDate() + 1);
    this.setState({list:[],loading:true,page:1,is_only_live:false});
    this.get_matches(this.state.matches_date,true);
    this.render_header();
  }
  previousPage = ()=>{
    this.end=false;
    this.state.matches_date .setDate(this.state.matches_date .getDate() - 1);
    this.setState({list:[],loading:true,page:1,is_only_live:false});
    this.get_matches(this.state.matches_date);
    this.render_header();
  }
  render() {
    let dayname="";
    try {
      dayname = API_.days[this.state.matches_date.getDay()];
    } catch (error) {
      
    }
    if(this.state.dynamic_style==undefined || this.state.dynamic_style===false || LoadedFonts==false) {
      setTimeout(() =>this.setState({}), 100);
      return <Loader/>; 
    }
    const ListHeaderComponent = (        
    <View style={{flexDirection:'row', flexWrap:'wrap', alignSelf:"center",alignContent:"center",alignItems:"center"}} >
    <IconButton 
      disabled={this.state.loading}
      name="minus" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>this.previousPage()}  />
    <TouchableOpacity 
      disabled={this.state.loading}
      activeOpacity={0.5}
      onPress={()=>this.setState({show_datPicker:true})}
      >
      <Text style={[this.state.dynamic_style.date_text,]} >{API_.get_date2(this.state.matches_date)+" - "+dayname}</Text>
    </TouchableOpacity>
    <IconButton 
      disabled={this.state.loading}
      name="plus" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>this.nextPage()}  />
    <Picker
        selectedValue={this.state.source_id}
        style={{ height:"90%",width:80,backgroundColor:"#000",color:"#fff" }}
        itemStyle={{height:70,backgroundColor:"#000",color:"#fff" }}
        onValueChange={this.changesource}
      >
        <Picker.Item label="AL match" value={0} />
        <Picker.Item label="Kooora" value={1} />
        <Picker.Item label="kora-star" value={2} />
    </Picker>
  </View>);
    return (
      <GestureRecognizer 
        style={this.state.dynamic_style.container}
        directionalOffsetThreshold={60}
        onSwipeRight={(state) => this.onSwipeRight(state)}
        onSwipeLeft={(state) => this.onSwipeLeft(state)}

      >        
        <ItemsList 
          ListHeaderComponent = {ListHeaderComponent}
          favorite={this.state.favorite}
          favorite_teams={this.state.favorite_teams}
          set_fav={this.set_fav}
          refresh_list={this.refresh_list}
          refreshControl={<RefreshControl progressViewOffset={200} refreshing={this.state.loading} onRefresh={()=>{this.state.page=1 ;this.get_matches()}} />}
          loading={this.state.loading} 
          list={this.state.list} 
          onLeaguePressed={this.onLeaguePressed}
          onclick={this.onMatch_clicked}
          onLongPress={this._onMatch_LongPressed}
          key_="home_team" key_key="id"
            />
        {this.state.modalVisible_match==true ? this.render_modal_credentials() : null}

      { this.state.show_datPicker===true ? this.show_DateP() : null }

      <User_log 
          user_log={this.state.user_log} 
          modal_visible={this.state.show_user_log && this.state.user_log} 
          closeModal={()=>{this.setState({show_user_log:false})}} /> 

      </GestureRecognizer>
    );
  }
}


export default HomeScreen;
