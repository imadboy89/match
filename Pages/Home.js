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
        //dynamic_style_list:styles_list,
    };
  
  const customUpdater = new ExpoCustomUpdater()
  customUpdater.isAppUpdateAvailable().then(isAv=>{
    if(isAv==false){return}
    this.props.navigation.setOptions({
      "headerLeft":()=>(
              <IconButton 
                name="cloud-download" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.header_icons} onPress={()=>{
                this.setState({list:[],loading:true});
                customUpdater.doUpdateApp();
              }}  /> 
      )
    });
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
  componentWillUnmount(){
    this._isMounted = false;
    clearInterval(this.interval_refresh);
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
    console.log("_handleNotification",notification);
    let item = {};
    try{
      item = JSON.parse(notification.data);
    }catch(err){return true;}
    this.onMatch_clicked(item);
  };

  _handleNotificationResponse = response => {
    console.log("_handleNotificationResponse",response);
    let item = {};
    try{
      item = JSON.parse(response.data);
    }catch(err){return true;}
    this.onMatch_clicked(item);
  };
  componentDidMount(){

    //handle notification
    Notifications.addNotificationReceivedListener(this._handleNotification);
    Notifications.addNotificationResponseReceivedListener(this._handleNotificationResponse);
    /////////////

    if(API_.isWeb==10){
      var psswd = prompt("Please enter your psswd", "");
      if(psswd!="hadil17"){
        window.location = "https://gooogle.com";
        API_.is_auth = false;
        return;
      }else{API_.is_auth = true;}
    }else{ API_.is_auth = true; }
    this.get_matches(this.state.matches_date);
    this._isMounted = true;
    getTheme("styles_home").then(theme=>{
      this.setState({dynamic_style:theme});
      this.render_header();
      });

    this.interval_refresh = setInterval(()=>{
      if(API_.get_date(this.state.matches_date)==API_.get_date(new Date())){
        this.get_matches(null,false);
      }
      }, 50000);

  }

  render_header=()=>{
      this.props.navigation.setOptions({
        "headerRight":()=>(
          <View style={{flexDirection:"row",marginLeft:10}}>
            <Switch
              style={{justifyContent:"center",marginVertical:"auto",marginHorizontal:3}}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={this.state.is_only_live ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={this.update_is_only_live}
              value={this.state.is_only_live}
            />
              {API_.isWeb==false ?null : 
              <IconButton 
                name="refresh" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
                this.get_matches(this.state.matches_date);
                
              }}  />
              }
              <IconButton 
                name="adjust" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{   
                const next_ind = themes_list.indexOf(Global_theme_name)+1;
                Global_theme_name = next_ind>=themes_list.length ?themes_list[0] :themes_list[next_ind]   ;
                API_.setConfig("theme",Global_theme_name).then(o=>{
                  if(API_.isWeb){
                    reloading_app = true;
                    location.reload();
                  }else{
                    Updates.reloadAsync();
                  }
                });              
              }}  />
                </View>
        )
      });
  }
  get_matches = (date_obj=null,setloading=true)=>{
    if(API_.is_auth==false){return false;}
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
  get_matches_koora = (date_obj=null)=>{
    date_obj = date_obj==null ? this.state.matches_date :date_obj; 
    API_.getConfig("favorite_leagues",this.state.favorite).then(favorite=>{
      get_notifications_matches().then(_notifications_matches=>{
        API_.load_leagues().then(leagues_dict=>{
          API_.get_matches_k(date_obj,this.state.is_only_live).then(resp=>{
            //console.log(Object.values(resp) )
            let data = resp && resp.length>0 ? resp : [];
            try{
              data = data.sort((a,b)=>{ return (leagues_dict[API_.fix_title(a.title) ] != undefined && leagues_dict[API_.fix_title(b.title) ] == undefined ?-1:1 );});
            }catch(e){console.log(e);}
            try{
              data = data.sort((a,b)=>{return (favorite.indexOf(a.id)>favorite.indexOf(b.id))?-1:1;});
            }catch(e){console.log(e);}
            if(this._isMounted){
              this.setState({list:data,loading:false,favorite:favorite,notifications_matches:_notifications_matches});
            }
        });
      });
    });
  });
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
    return (
      <View style={this.state.dynamic_style.container}>
        <View style={{flexDirection:'row', flexWrap:'wrap', alignSelf:"center",alignContent:"center",alignItems:"center"}} >
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
        </View>

        
        <ItemsList 
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
