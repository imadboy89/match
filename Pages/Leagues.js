import * as React from 'react';
import { View, StyleSheet, Modal, Button, Picker } from 'react-native';
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
        region:0,
    };

    setTimeout(()=>{
      this.get_leagues();
    },300);

  }
  refresh_list=()=>{
    const tmp_list = JSON.parse(JSON.stringify(this.state.list)) ;
    if(this._isMounted){
      this.setState({list:[]}); 
      this.setState({list:tmp_list});
    }
  }
  componentDidMount(){ 
    this._isMounted = true;
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
  componentWillUnmount(){
    this._isMounted = false;
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
get_leagues_k=async()=>{
  let favorite = await API_.getConfig("favorite_leagues",this.state.favorite);
  let leagues  = await API_.get_leagues_k(this.state.region);
  this.setState({loading:false,list:leagues,favorite:favorite});
}
get_leagues(){
  return this.get_leagues_k() ;
  API_.getConfig("favorite_leagues",this.state.favorite).then(favorite=>{
    API_.load_leagues().then(leagues_dict=>{
      if(leagues_dict==undefined || leagues_dict==null){
        return null;
      }
      let data = Object.keys(leagues_dict).map(k =>{
        let row = leagues_dict[k];
        let img = row && row.logo ? row.logo : false;
        let league_name = row.ar_league_name ? row.ar_league_name : row.league;
        return {"img": API_.domain_o+img,"league_name":league_name , id:row.league_id,koora_id:row.koora_id}; 
      });
      data = data.sort((a,b)=>{return (a.koora_id!=undefined)?-1:1;});
      data = data.sort((a,b)=>{return (favorite.indexOf(a.id)>favorite.indexOf(b.id))?-1:1;});
      
      this.setState({loading:false,list:data,favorite:favorite});

    });
  });

}

  onItem_clicked =(item)=>{
    this.props.navigation.navigate('League',{ league_details: {league:item.league_name,league_img:item.img,id:item.id,koora_id:true} });
  }
  render() {
    return (
      <View style={this.state.dynamic_style.container}>
      <Picker
          selectedValue={this.state.region}
          style={{ height:70,backgroundColor:"#2d3436",color:"#dfe6e9" ,width:250}}
          onValueChange={(itemValue, itemIndex)=>{
            this.state.region = itemValue;
            this.get_leagues_k();
          }}
        >
          <Picker.Item label="world" value={0} />
          <Picker.Item label="Maroc" value={"ma"} />
          <Picker.Item label="Arab" value={2} />
          <Picker.Item label="Africa" value={4} />
          <Picker.Item label="Europ" value={1} />
          <Picker.Item label="Spain" value={"ES"} />
          
          
      </Picker>   
        <ItemsList 
          
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
