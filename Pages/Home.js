import * as React from 'react';
import { Text, View, StyleSheet, Modal, Button, TouchableOpacity, Platform } from 'react-native';
import Constants from 'expo-constants';
import ItemsList from '../components/list';
import DateTimePicker from '@react-native-community/datetimepicker';
import IconButton from "../components/IconButton";
import * as Font from 'expo-font';
import {styles_home,getTheme,themes_list} from "../components/Themes";
import ExpoCustomUpdater from '../Libs/update';
import Loader from "../components/Loader";
import * as Updates from 'expo-updates'
import { Notifications, Permissions,getAllScheduledNotificationsAsync} from 'expo';


class HomeScreen extends React.Component {
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
        dynamic_style:styles_home,
        //dynamic_style_list:styles_list,
    };

  getTheme("styles_home").then(theme=>this.setState({dynamic_style:theme}));
  this.get_matches(this.state.matches_date);
  this.props.navigation.setOptions({title: "Matches list",
    "headerRight":()=>(
      <View style={{flexDirection:"row",marginLeft:10}}>
            <IconButton 
              name="refresh" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.header_icons} onPress={()=>{
              this.setState({list:[],loading:true});
              this.get_matches(this.state.matches_date);
              
            }}  />
            <IconButton 
              name="adjust" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.header_icons} onPress={()=>{   
              const next_ind = themes_list.indexOf(Global_theme_name)+1;
              Global_theme_name = next_ind>=themes_list.length ?themes_list[0] :themes_list[next_ind]   ;
              API_.setConfig("theme",Global_theme_name).then(o=>{
                Updates.reloadAsync();
              });              
            }}  />
            </View>
    )
  });
  const customUpdater = new ExpoCustomUpdater()
  customUpdater.isAppUpdateAvailable().then(isAv=>{
    if(isAv==false){return}
    this.props.navigation.setOptions({title: "Matches list",
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
  get_matches(date_obj=null){
      API_.get_matches(date_obj).then(resp=>{
      if(resp["status"]=="true"){
        let list = [];
        let data = Object.keys(resp["data"]).map(k =>{
          let img = resp["data"][k] && resp["data"][k].length>0 && resp["data"][k][0]["league_badge"] && resp["data"][k][0]["league_badge"]["path"] 
                    ? resp["data"][k][0]["league_badge"]["path"] : false;
          for(let i=0;i<resp["data"][k].length;i++){
            resp["data"][k][i].time = API_.convert_time(resp["data"][k][i].time);
          }
          return {"title":k,"img":img, data:resp["data"][k]}; 
        });
        this.setState({list:data,loading:false});
        for(let i=0;i<data.length;i++){
          
        }
      }
    });
}
 onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    this.setState({show_datPicker: false ,list:[],matches_date:currentDate,loading:true});
    this.get_matches(currentDate);
    
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
  onMatch_LongPressed=(item)=>{
    let home_team_name = item["home_team_ar"] ? item["home_team_ar"] : item["home_team"];
    let away_team_name = item["away_team_ar"] ? item["away_team_ar"] : item["away_team"];
    let league = item["league"] ? item["league"] : item["league"];
    let trigger = new Date(this.state.matches_date);
    trigger.setHours(item.time.split(":")[0]);
    trigger.setMinutes(item.time.split(":")[1]);
    trigger.setSeconds(0);
    let content= {
        title: home_team_name+" VS "+away_team_name,
        body: league,
      };
    Notifications.scheduleLocalNotificationAsync(content, {time: trigger.getTime()} );
    alert("Will remind you of this matche :\n"+content.title);
  }
  onMatch_clicked =(item)=>{
    //API_.get_matche(item.id).then(out=>console.log(out));
    this.props.navigation.navigate('Match', { match_id: item.id });
    //this.setState({modalVisible_match:true,match:item});
  }
  render() {
    if(this.state.dynamic_style==undefined ) {return null }
    return (
      <View style={this.state.dynamic_style.container}>
        <View style={{flexDirection:'row', flexWrap:'wrap', alignSelf:"center",alignContent:"center",alignItems:"center"}} >
          <IconButton 
            disabled={this.state.loading}
            title="pick date"  name="minus" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
            this.state.matches_date .setDate(this.state.matches_date .getDate() - 1);
            this.setState({list:[],loading:true});
            this.get_matches(this.state.matches_date);
          }}  />
            <Text style={[this.state.dynamic_style.title,]} >
            
              {API_.get_date2(this.state.matches_date)}
            </Text>
          <IconButton title="pick date"  
            disabled={this.state.loading}
            name="plus" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
            this.state.matches_date .setDate(this.state.matches_date .getDate() + 1);
            this.setState({list:[],loading:true});
            this.get_matches(this.state.matches_date);
          }}  />
          <IconButton 
            disabled={this.state.loading}
            title="pick date"  name="edit" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>this.setState({show_datPicker:true})}  />
        </View>

        
        <ItemsList loading={this.state.loading} list={this.state.list} 
          onclick={this.onMatch_clicked}
          onLongPress={this.onMatch_LongPressed}
          key_="home_team" key_key="id"  />
        {this.state.modalVisible_match==true ? this.render_modal_credentials() : null}

      { this.state.show_datPicker ? this.show_DateP() : null }       
      </View>
    );
  }
}


export default HomeScreen;
