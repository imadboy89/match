import * as React from 'react';
import { View, StyleSheet, Modal, Button, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import ItemsList from '../components/list';
import DateTimePicker from '@react-native-community/datetimepicker';
import IconButton from "../components/IconButton";
import {styles_news,getTheme} from "../components/Themes";
class LeaguesScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        leagues:[],
        key:"league_name",
        page : 1,
        loading:true,
        dynamic_style : styles_news,
    };

    setTimeout(()=>{
      this.get_leagues();
    },300);

  }
  componentDidMount(){ 
    getTheme("styles_news").then(theme=>this.setState({dynamic_style:theme}));
    this.props.navigation.setOptions({title: "Leagues",
    "headerRight":()=>(
          <IconButton 
            name="refresh" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
            this.get_leagues();
          }}  />
  )
});
  }

  
get_leagues(){
  const leagues = API_.leagues_dict;
  if(leagues==undefined || leagues==null){
    return null;
  }
  let data = Object.keys(leagues).map(k =>{
    let row = leagues[k];
    let img = row && row.logo ? row.logo : false;
    let league_name = row.ar_league_name ? row.ar_league_name : row.league;
    return {"img": API_.domain_o+img,"league_name":league_name , id:row.league_id}; 
  });
  this.setState({loading:false,leagues:data});
}

  onItem_clicked =(item)=>{
    this.props.navigation.navigate('League',{ league_details: {league:item.league_name,league_img:item.img} });
  }
  render() {
    return (
      <View style={this.state.dynamic_style.container}>     
        <ItemsList loading={this.state.loading} list={this.state.leagues} onclick={this.onItem_clicked} key_={this.state.key} key_key="link"  />
        
        <View style={this.state.dynamic_style.nav_container}>
          <IconButton
            disabled={this.state.loading}
           title="arrow-back-circle"  name="chevron-left" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
            if(this.state.page==1){return false;}
            this.state.page--;
            this.get_news();
          }}  />
          <Text style={this.state.dynamic_style.text}>{this.state.page}</Text>
          <IconButton 
            disabled={this.state.loading}
           title="forward"  name="chevron-right" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
            this.state.page++;
            this.get_news();
          }}  />
        </View>
      </View>
    );
  }
}

export default LeaguesScreen;
