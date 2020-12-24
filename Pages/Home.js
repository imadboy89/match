import * as React from 'react';
import { Text, View, StyleSheet, Modal, Button, TouchableOpacity, Platform, RefreshControl, Picker , Switch} from 'react-native';
import Constants from 'expo-constants';
import ItemsList from '../components/list';
import DateTimePicker from '@react-native-community/datetimepicker';
import IconButton from "../components/IconButton";
import * as Font from 'expo-font';
import {styles_home,getTheme,themes_list} from "../components/Themes";
import ExpoCustomUpdater from '../Libs/update';
import * as Notifications from 'expo-notifications';
import * as Updates from 'expo-updates';
import AppLoading from 'expo-app-loading';

import {onMatch_LongPressed,get_notifications_matches} from "../Libs/localNotif";

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
        is_upd_available:false,
        is_auth:false
        //dynamic_style_list:styles_list,
    };
    this.is_authenting = false;
    this.didBlurSubscription = this.props.navigation.addListener(
      'focus',
      payload => {
        if(this.state.is_auth!=backup.is_auth){
          if(backup.is_auth){
            this.setState({is_auth:backup.is_auth });
            this.refresh_leagues();
          }
        }
        this.render_header();
      }
    );
  }
  componentWillUnmount(){
    this._isMounted = false;
    clearInterval(this.interval_refresh);
    if(backup.timer){
      clearInterval(backup.timer);
    }
    if(this.didBlurSubscription && this.didBlurSubscription.remove){
      this.didBlurSubscription.remove();
    }
  }
  componentDidMount(){
    this.get_matches(this.state.matches_date);
    if(this.is_authenting==false){
      this.is_authenting = true;
      backup._loadClient().then(output=>{
        this.setState({is_auth:backup.is_auth });
        this.render_header();
        if(output==false){return false;}
        backup.load_settings().then(o=>{
          this.refresh_leagues();
        }).catch(err=>{console.log(err)});
      }).catch(err=>{console.log(err)});
    }
    this.checkUpdAvailability();
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
      if(backup.is_auth){
        backup.load_settings().then(o=>{
          this.refresh_leagues(this.state.list);
        })
      }
      if(API_.get_date(this.state.matches_date)==API_.get_date(new Date())){
        this.get_matches(null,false);
      }
      }, 50000);

  }
  checkUpdAvailability(){
    const customUpdater = new ExpoCustomUpdater()
    customUpdater.isAppUpdateAvailable().then(isAv=>{
      this.setState({is_upd_available:isAv});
      this.render_header();
    });
  }
  refresh_list=()=>{
    const tmp_list = JSON.parse(JSON.stringify(this.state.list)) ;
    if(this._isMounted){
      this.setState({list:[],page:1}); 
      this.setState({list:tmp_list});
    }
  }
  set_fav=(league_id)=>{
    API_.getConfig("favorite_leagues",this.state.favorite).then(o=>{
      if( o.includes(league_id) ){
        o = o.filter(o=>{if(o!=league_id)return o;});
      }else{
        o.push(league_id);
      }
      this.setState({favorite:o});
      API_.setConfig("favorite_leagues",o);
    });
    this.setState({});
  }
  _onMatch_LongPressed=(item)=>{
    onMatch_LongPressed(item).then(oo=>{
      if(oo==false){return false;}
      this.setState({notifications_matches:[]});
      get_notifications_matches().then(o=>{this.setState({notifications_matches:o});} );
    });
  }

  changesource = (itemValue, itemIndex)=>{
    this.end=false;
    this.state.source_id = parseInt(itemValue);
    this.setState({source_id:parseInt(itemValue),page:1});
    this.get_matches();
  }
  update_is_only_live=(k,v)=>{
    this.state.matches_date = k==true ? new Date() : this.state.matches_date;
    this.setState({is_only_live:k});
    this.render_header();
    this.get_matches();
    }

  _handleNotification = notification => {
    console.log(1,notification);
    try{
      let item = JSON.parse(notification.request.content.data.data);
      this.onMatch_clicked(item);
    }catch(err){}
  };

  _handleNotificationResponse = response => {
    console.log(2,response);
    try{
      let item = JSON.parse(response.notification.request.content.data.data);
      this.onMatch_clicked(item);
    }catch(err){}
  };


  render_header=()=>{
    let headerLeft = null;
    const iconsSize = this.state.dynamic_style && this.state.dynamic_style.title ? this.state.dynamic_style.title.fontSize : 15;
    if(this.state.is_upd_available){
      headerLeft = ()=>(
        <IconButton 
          name="cloud-download" size={iconsSize} style={this.state.dynamic_style.icons}
            onPress={()=>{
              this.setState({list:[],loading:true});
              customUpdater.doUpdateApp();
        }}  /> );
    }else{
      headerLeft = ()=>(
        <IconButton 
          name="inbox" size={iconsSize} style={this.state.dynamic_style.icons} 
            onPress={()=>{
              this.checkUpdAvailability();
        }}  /> );
    }
    
    this.props.navigation.setOptions({
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
                name={ this.state.is_auth ? "user" : "gears"}
                size={iconsSize} style={this.state.dynamic_style.icons} onPress={()=>{
                this.props.navigation.navigate('Settings');            
              }}  />
          </View>
        )
      });
  }
  get_matches = (date_obj=null,setloading=true)=>{
    //if(API_.is_auth==false){return false;}
    if(this.state.loading==false && setloading){this.setState({loading:true});}
    if(this.state.source_id!=0){
      return this.get_matches_koora(date_obj);
    }
    date_obj = date_obj==null ? this.state.matches_date :date_obj; 

    API_.getConfig("favorite_leagues",this.state.favorite).then(favorite=>{
      get_notifications_matches().then(_notifications_matches=>{
        API_.load_leagues().then(leagues_dict=>{
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
  console.log(data);
  if(data && data.length > 0 && data[0].id==1){
    data = data.filter(o=>o.id && o.id!=1);
  }
  this.favorite_teams = await API_.getConfig("favorite_teams_k",[]) ;
  this.state.favorite = await API_.getConfig("favorite_leagues",this.state.favorite);
  try{
    data = data.sort((a,b)=>{ return (API_.leagues_dict[API_.fix_title(a.title) ] != undefined && API_.leagues_dict[API_.fix_title(b.title) ] == undefined ?-1:1 );});
  }catch(e){console.log(e);}
  data = data.sort((a,b)=>{return (this.state.favorite.indexOf(a.id)>this.state.favorite.indexOf(b.id))?-1:1;});
  console.log(data);
  let fav_list = {"id":1,"title":"الفرق المفضلة","img":"",data:[]};
  for(let j=0;j<data.length;j++){
    for(let m=0;m<data[j]["data"].length;m++){
      const matche_f = JSON.parse(JSON.stringify(data[j]["data"][m]));
      const home_team_id = parseInt(matche_f["home_team_id"]) ? parseInt(matche_f["home_team_id"]) : 0 ;
      const away_team_id = parseInt(matche_f["away_team_id"]) ? parseInt(matche_f["away_team_id"]) : 0 ;
      if(this.favorite_teams.includes(home_team_id) || this.favorite_teams.includes(away_team_id)){
        matche_f["league_id"] = 1;
        matche_f["league"] = "fav_list";
        fav_list.data.push(matche_f);
      }
    }
  }
  data = fav_list.data.length>0 ? [fav_list,].concat(data) : data ;
  return data;
}
get_matches_koora = async(date_obj=null)=>{
  date_obj = date_obj==null ? this.state.matches_date :date_obj; 
  const _notifications_matches = await get_notifications_matches();
  await API_.load_leagues(this.refresh_leagues);
  const resp = await API_.get_matches_k(date_obj,this.state.is_only_live)
  //console.log(Object.values(resp) )
  let data = resp && resp.length>0 ? resp : [];
  data = await this.get_favs(data);
  if(this._isMounted){
    this.setState({list:data,loading:false,notifications_matches:_notifications_matches});
  }
}
 onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    this.setState({show_datPicker: false ,list:[],matches_date:currentDate,loading:true,is_only_live:false});
    this.get_matches(currentDate);
    this.render_header();
  };
show_DateP(){
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
    this.props.navigation.navigate('League',{ league_details: {league:league_name,league_img:league_img,id:league_id} });
  }
  onMatch_clicked =(item)=>{
    this.props.navigation.navigate('Match', { match_item: item });
  }
  render() {
    if(this.state.dynamic_style==undefined || this.state.dynamic_style===false) {return <AppLoading/>; }
    const ListHeaderComponent = (        <View style={{flexDirection:'row', flexWrap:'wrap', alignSelf:"center",alignContent:"center",alignItems:"center"}} >
    <IconButton 
      disabled={this.state.loading}
      name="minus" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
        this.end=false;
        this.state.matches_date .setDate(this.state.matches_date .getDate() - 1);
        this.setState({list:[],loading:true,page:1,is_only_live:false});
        this.get_matches(this.state.matches_date);
        this.render_header();
    }}  />
    <TouchableOpacity 
      disabled={this.state.loading}
      activeOpacity={0.5}
      onPress={()=>this.setState({show_datPicker:true})}
      >
      <Text style={[this.state.dynamic_style.title,]} >{API_.get_date2(this.state.matches_date)}</Text>
    </TouchableOpacity>
    <IconButton 
      disabled={this.state.loading}
      name="plus" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
        this.end=false;
        this.state.matches_date .setDate(this.state.matches_date .getDate() + 1);
        this.setState({list:[],loading:true,page:1,is_only_live:false});
        this.get_matches(this.state.matches_date);
        this.render_header();
    }}  />
    <Picker
        selectedValue={this.state.source_id}
        style={{ height:"90%",flex:1,backgroundColor:"#2d3436",color:"#dfe6e9" }}
        onValueChange={this.changesource}
      >
        <Picker.Item label="AL match" value={0} />
        <Picker.Item label="Kooora" value={1} />
        <Picker.Item label="arriadia" value={2} />
    </Picker>
  </View>);
    return (
      <View style={this.state.dynamic_style.container}>        
        <ItemsList 
          ListHeaderComponent = {ListHeaderComponent}
          favorite={this.state.favorite}
          set_fav={this.set_fav}
          refresh_list={this.refresh_list}
          refreshControl={<RefreshControl refreshing={this.state.loading} onRefresh={()=>{this.state.page=1 ;this.get_matches()}} />}
          loading={this.state.loading} 
          list={this.state.list} 
          onLeaguePressed={this.onLeaguePressed}
          onclick={this.onMatch_clicked}
          onLongPress={this._onMatch_LongPressed}
          notifications_matches={this.state.notifications_matches}
          key_="home_team" key_key="id"
            />
        {this.state.modalVisible_match==true ? this.render_modal_credentials() : null}

      { this.state.show_datPicker ? this.show_DateP() : null }       
      </View>
    );
  }
}


export default HomeScreen;
