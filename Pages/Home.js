import * as React from 'react';
import { Text, View, StyleSheet, Modal, Button, TouchableOpacity, Platform, RefreshControl, Picker } from 'react-native';
import Constants from 'expo-constants';
import ItemsList from '../components/list';
import DateTimePicker from '@react-native-community/datetimepicker';
import IconButton from "../components/IconButton";
import * as Font from 'expo-font';
import {styles_home,getTheme,themes_list} from "../components/Themes";
import ExpoCustomUpdater from '../Libs/update';
import Loader from "../components/Loader";
import * as Updates from 'expo-updates';
import { AppLoading } from 'expo';

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
        dynamic_style:false,
        notifications_matches:{},
        favorite:[],
        source_id:1,
        //dynamic_style_list:styles_list,
    };
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
  refresh_list=()=>{
    const tmp_list = JSON.parse(JSON.stringify(this.state.list)) ;
    this.setState({list:[]}); 
    this.setState({list:tmp_list});
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
  changesource = (itemValue, itemIndex)=>{
    this.state.source_id = parseInt(itemValue);
    this.setState({});
    this.get_matches();
  }
  componentDidMount(){
    getTheme("styles_home").then(theme=>{
      this.setState({dynamic_style:theme});
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
      });


  this.interval_refresh = setInterval(()=>{
    if(API_.get_date(this.state.matches_date)==API_.get_date(new Date())){
      this.get_matches();
    }
    }, 40000);

  }
  get_matches = (date_obj=null)=>{
    if(this.state.source_id==1){
      return this.get_matches_koora(date_obj);
    }
    date_obj = date_obj==null ? this.state.matches_date :date_obj; 
    this.setState({loading:true});
    API_.getConfig("favorite_leagues",this.state.favorite).then(favorite=>{
      get_notifications_matches().then(_notifications_matches=>{
        API_.load_leagues().then(leagues_dict=>{
          API_.get_matches(date_obj).then(resp=>{
            let data = [];
          if(resp && resp["status"]=="true"){
            let list = [];
            data = Object.keys(resp["data"]).map(k =>{

              let img = resp["data"][k] && resp["data"][k].length>0 && resp["data"][k][0]["league_badge"] && resp["data"][k][0]["league_badge"]["path"] 
                        ? resp["data"][k][0]["league_badge"]["path"] : false;
              let league_id=0; 
              try{league_id= leagues_dict && leagues_dict[k]? leagues_dict[k].league_id :0;}catch(e){console.log(e);}
              for(let i=0;i<resp["data"][k].length;i++){
                resp["data"][k][i].time = API_.convert_time(resp["data"][k][i].time);
                resp["data"][k][i].league_id = league_id
                if(resp["data"][k][i].live){
                  const played_time = API_.convert_time_spent(resp["data"][k][i].date + " "+resp["data"][k][i].time) ;
                  resp["data"][k][i].time_played = played_time ? played_time : "";
                  if(played_time==false || played_time<-10){
                    resp["data"][k][i].live = 0;
                  }
                }
              }
              return {"title":k,"img":img, data:resp["data"][k],"id":league_id}; 
            });
            try{
              data = data.sort((a,b)=>{return (favorite.indexOf(a.id)>favorite.indexOf(b.id))?-1:1;});
            }catch(e){console.log(e);}
          }
          this.setState({list:data,loading:false,favorite:favorite,notifications_matches:_notifications_matches});
        });
        });
    });
  });
}
  get_matches_koora = (date_obj=null)=>{
    date_obj = date_obj==null ? this.state.matches_date :date_obj; 
    this.setState({loading:true});
    API_.getConfig("favorite_leagues",this.state.favorite).then(favorite=>{
      get_notifications_matches().then(_notifications_matches=>{
        API_.load_leagues().then(leagues_dict=>{
          API_.get_matches_k(date_obj).then(resp=>{
            //console.log(Object.values(resp) )
            let data = resp && resp.length>0 ? resp : [];
            try{
              data = data.sort((a,b)=>{return (favorite.indexOf(a.id)>favorite.indexOf(b.id))?-1:1;});
            }catch(e){console.log(e);}
            try{
              //data = data.sort((a,b)=>{return (leagues_dict(a.title)>leagues_dict(b.title))?-1:1;});
            }catch(e){console.log(e);}
          this.setState({list:data,loading:false,favorite:favorite,notifications_matches:_notifications_matches});
        });
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
    league_img = ["https:/","http://"].includes(league_img.slice(0,7)) ? league_img : API_.domain_o+league_img;
    this.props.navigation.navigate('League',{ league_details: {league:league_name,league_img:league_img} });
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
          <Picker
              selectedValue={this.state.source_id}
              style={{ height:"90%",flex:1,backgroundColor:"#2d3436",color:"#dfe6e9" }}
              onValueChange={this.changesource}
            >
              <Picker.Item label="AL match" value={0} />
              <Picker.Item label="Kooora" value={1} />
          </Picker>
        </View>

        
        <ItemsList 
          favorite={this.state.favorite}
          set_fav={this.set_fav}
          refresh_list={this.refresh_list}
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
