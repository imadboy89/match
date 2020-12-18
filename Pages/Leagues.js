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
        list:[],
        key:"league_name",
        page : 1,
        loading:true,
        dynamic_style : styles_news,
        favorite:[],
    };

    setTimeout(()=>{
      this.get_leagues();
    },300);

  }
  
  componentDidMount(){ 
    getTheme("styles_news").then(theme=>this.setState({dynamic_style:theme}));
    API_.getConfig("favorite_leagues",this.state.favorite).then(o=>{
      this.setState({favorite:o});
    });
    this.props.navigation.setOptions({title: "Leagues",
    "headerRight":()=>(
          <IconButton 
            name="refresh" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
            this.get_leagues();
          }}  />
  )
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
  
get_leagues(){
  API_.getConfig("favorite_leagues",this.state.favorite).then(favorite=>{
    API_.load_leagues().then(leagues_dict=>{
      if(leagues_dict==undefined || leagues_dict==null){
        return null;
      }
      let data = Object.keys(leagues_dict).map(k =>{
        let row = leagues_dict[k];
        let img = row && row.logo ? row.logo : false;
        let league_name = row.ar_league_name ? row.ar_league_name : row.league;
        return {"img": API_.domain_o+img,"league_name":league_name , id:row.league_id}; 
      });
      data = data.sort((a,b)=>{return (favorite.indexOf(a.id)>favorite.indexOf(b.id))?-1:1;});
      this.setState({loading:false,list:data,favorite:favorite});

    });
  });

}

  onItem_clicked =(item)=>{
    this.props.navigation.navigate('League',{ league_details: {league:item.league_name,league_img:item.img} });
  }
  render() {
    return (
      <View style={this.state.dynamic_style.container}>     
        <ItemsList 
          minWidth={160}
          refresh_list={this.refresh_list}
          favorite={this.state.favorite}
          set_fav={this.set_fav}
          loading={this.state.loading} list={this.state.list} 
          onclick={this.onItem_clicked} key_={this.state.key} key_key="id"  />
        
        {/*
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
        */}
      </View>
    );
  }
}

export default LeaguesScreen;
