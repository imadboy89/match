import * as React from 'react';
import { Text, View, StyleSheet, Modal, Button, TouchableOpacity, Platform, RefreshControl } from 'react-native';
import Constants from 'expo-constants';
import ItemsList from '../components/list';
import DateTimePicker from '@react-native-community/datetimepicker';
import IconButton from "../components/IconButton";
import * as Font from 'expo-font';
import {styles_home,getTheme,themes_list} from "../components/Themes";
import ExpoCustomUpdater from '../Libs/update';
import Loader from "../components/Loader";
import * as Updates from 'expo-updates'
import {onMatch_LongPressed,get_notifications_matches} from "../Libs/localNotif";

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
        notifications_matches:{},
        favorite:[],
        //dynamic_style_list:styles_list,
    };
  API_.load_leagues();
  this.get_matches(this.state.matches_date);
  
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
    clearInterval(this.interval_refresh);
  }
  componentDidMount(){
    getTheme("styles_home").then(theme=>this.setState({dynamic_style:theme}));
    this.props.navigation.setOptions({
      "headerRight":()=>(
        <View style={{flexDirection:"row",marginLeft:10}}>
              {API_.isWeb==false ?null : 
              <IconButton 
                name="refresh" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.header_icons} onPress={()=>{
                this.get_matches(this.state.matches_date);
                
              }}  />
              }
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

  this.interval_refresh = setInterval(()=>{
    if(API_.get_date(this.state.matches_date)==API_.get_date(new Date())){
      this.get_matches();
    }
    }, 20000);

  }
  get_matches = (date_obj=null)=>{
    date_obj = date_obj==null ? this.state.matches_date :date_obj; 
    this.setState({loading:true});
    API_.getConfig("favorite_leagues",this.state.favorite).then(favorite=>{
      get_notifications_matches().then(_notifications_matches=>{
        API_.get_matches(date_obj).then(resp=>{
          let data = [];
          console.log("get_matches",resp["status"]);
        if(resp && resp["status"]=="true"){
          let list = [];
          data = Object.keys(resp["data"]).map(k =>{
            let img = resp["data"][k] && resp["data"][k].length>0 && resp["data"][k][0]["league_badge"] && resp["data"][k][0]["league_badge"]["path"] 
                      ? resp["data"][k][0]["league_badge"]["path"] : false;
            for(let i=0;i<resp["data"][k].length;i++){
              resp["data"][k][i].time = API_.convert_time(resp["data"][k][i].time);
              if(resp["data"][k][i].live){
                resp["data"][k][i].time_played = API_.convert_time_spent(resp["data"][k][i].date + " "+resp["data"][k][i].time);
              }
            }
            let id=0;
            try{id=API_ && API_.leagues_dict && API_.leagues_dict[k]? API_.leagues_dict[k].league_id :0;}catch(e){console.log(e);}
            return {"title":k,"img":img, data:resp["data"][k],"id":id}; 
          });
          try{
            data = data.sort((a,b)=>{return (favorite.indexOf(a.id)>favorite.indexOf(b.id))?-1:1;});
          }catch(e){console.log(e);}
        }
        this.setState({list:data,loading:false,favorite:favorite,notifications_matches:_notifications_matches});
      });
    });
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

  onLeaguePressed = (league_name, league_img)=>{
    this.props.navigation.navigate('League',{ league_details: {league:league_name,league_img:API_.domain_o+league_img} });
  }
  onMatch_clicked =(item)=>{
    this.props.navigation.navigate('Match', { match_item: item });
  }
  render() {
    if(this.state.dynamic_style==undefined ) {return null }
    return (
      <View style={this.state.dynamic_style.container}>
        <View style={{flexDirection:'row', flexWrap:'wrap', alignSelf:"center",alignContent:"center",alignItems:"center"}} >
          <IconButton 
            disabled={this.state.loading}
            name="minus" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
            this.state.matches_date .setDate(this.state.matches_date .getDate() - 1);
            this.setState({list:[],loading:true});
            this.get_matches(this.state.matches_date);
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
            this.state.matches_date .setDate(this.state.matches_date .getDate() + 1);
            this.setState({list:[],loading:true});
            this.get_matches(this.state.matches_date);
          }}  />

        </View>

        
        <ItemsList 
          favorite={this.state.favorite}
          set_fav={this.set_fav}
          
          refreshControl={<RefreshControl refreshing={this.state.loading} onRefresh={this.get_matches} />}
          loading={this.state.loading} 
          list={this.state.list} 
          onLeaguePressed={this.onLeaguePressed}
          onclick={this.onMatch_clicked}
          onLongPress={this._onMatch_LongPressed}
          notifications_matches={this.state.notifications_matches}
          key_="home_team" key_key="id"  />
        {this.state.modalVisible_match==true ? this.render_modal_credentials() : null}

      { this.state.show_datPicker ? this.show_DateP() : null }       
      </View>
    );
  }
}


export default HomeScreen;
