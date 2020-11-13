import React from "react";
import { Text, View, StyleSheet, Modal, Button, Linking, Picker, TouchableOpacity, ImageBackground} from 'react-native';
import Constants from 'expo-constants';
import ItemsList from '../components/list';
import ReactHlsPlayer from "react-hls-player";
import Video from 'expo';
import Loading from '../components/Loader';

let list = [

          ];
class Matchcreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        list:list,
        modalVisible_match:false,
        player_type:1,
        key_:"en_name",
        channel:null,
        matche_details:{},
        visible_tab : "general",
        loading:true,
    };
    this.get_Match(this.props.route.params.match_id);

  }
  get_Match(id){
      API_.get_match(id).then(resp=>{
        if(resp["data"] && resp["data"][0] ){
          this.setState({matche_details:resp["data"][0],loading:false});
          this.home_team_ar = this.state.matche_details.home_team_ar ? this.state.matche_details.home_team_ar : this.state.matche_details.home_team;
          this.away_team_ar = this.state.matche_details.away_team_ar ? this.state.matche_details.away_team_ar : this.state.matche_details.away_team; 
        }
      });
  }



  onmt_clicked(item){
    this.props.navigation.navigate('Channel', { channel_id: item.id,channel_photo:item.channel_photo });
  }
  get_View_general(){
    let channels = this.state.matche_details.channels ?
      this.state.matche_details.channels.map(ch => (
        <View style={{margin:10}}>
          <Button onPress={()=>this.onmt_clicked(ch)}  key={ch.id} title={ch.en_name} style={{margin:10}}></Button>
        </View>
      ))
    : null;
    if(this.state.matche_details=={}) {return null;}
    return (
      <View style={styles.view_tab}>
        <Text style={styles.text_info}>{this.state.matche_details.date} {this.state.matche_details.time} </Text>
        <Text style={styles.text_info}>Status : {this.state.matche_details.status ? this.state.matche_details.status : "-"}</Text>
        <Text style={styles.text_info}>League : {this.state.matche_details.league}</Text>
        <Text style={styles.text_info}>Staduim : {this.state.matche_details.stadium}</Text>
        <Text style={styles.text_info}>Channels :</Text>
        {channels}
      </View> 
    );
  }
  get_View_stats(){
    
    let stats_list = [{"home":this.home_team_ar,"away":this.away_team_ar,"type":"VS"}] . concat(this.state.matche_details.statistics) ;
    let i = -1;
    let stats = stats_list.map(row=>{
      i++;
      return (
          <View style={styles.stats_container}>
            <Text style={i==0?styles.stats_frag_l_ :styles.stats_frag_l}>{row ? row.home : ""}</Text>
            <Text style={i==0?styles.stats_frag_m_ :styles.stats_frag_m}>{row ? row.type : "-"}</Text>
            <Text style={i==0?styles.stats_frag_r_ :styles.stats_frag_r}>{row ? row.away : ""}</Text>
          </View>);
    });
    return (
      <View style={styles.view_tab}>
        {stats ? stats : null}
      </View> 
    );
  }
  generate_lineup(data){
    let players = {};
    for(let i=0;i<data.length;i++){
      let el = data[i];
      let position = parseInt(el.lineup_position)>0 ? parseInt(el.lineup_position) : i+1;
      players[position] = el;
    }
    
    return (
      <View style={styles.view_tab}>
      <ImageBackground style={styles.background_pitch} source={require('../assets/ptch.jpg')} >
        <View style={styles.view_inline}>
          <Text style={styles.lineup_player}>{players[1] ? players[1].lineup_player : ""}</Text>
        </View> 
        <View style={styles.view_inline}>
          <Text style={styles.lineup_player}>{players[2] ? players[2].lineup_player : ""}</Text>
          <Text style={styles.lineup_player}>{players[5] ? players[5].lineup_player : ""}</Text>
          <Text style={styles.lineup_player}>{players[4] ? players[4].lineup_player : ""}</Text>
          <Text style={styles.lineup_player}>{players[3] ? players[3].lineup_player : ""}</Text>
        </View> 
        <View style={styles.view_inline}>
          <Text style={styles.lineup_player}>{players[7] ? players[7].lineup_player : ""}</Text>
          <Text style={styles.lineup_player}>{players[8] ? players[8].lineup_player : ""}</Text>
          <Text style={styles.lineup_player}>{players[10] ? players[10].lineup_player : ""}</Text>
          <Text style={styles.lineup_player}>{players[6] ? players[6].lineup_player : ""}</Text>
        </View> 
        <View style={styles.view_inline}>
          <Text style={styles.lineup_player}>{players[11] ? players[11].lineup_player : ""}</Text>
          <Text style={styles.lineup_player}>{players[9] ? players[9].lineup_player : ""}</Text>
        </View> 
      </ImageBackground>
      </View> 
    );
  }
  get_View_lineup(){
    if( this.state.matche_details=={} || this.state.matche_details.home_lineup==undefined || this.state.matche_details.away_lineup==undefined ||
      this.state.matche_details.home_lineup.length<11 || this.state.matche_details.away_lineup.length<11) 
      return <View style={styles.view_tab}><Text style={styles.title}>Line-up not available</Text></View>;
    const is_home = this.state.lineup_type==undefined || this.state.lineup_type=="home" ;
    return (
      <View style={styles.view_tab}>
        <View style={styles.view_inline}>
          <TouchableOpacity style={is_home==true ? styles.lineup_team_ :styles.lineup_team } onPress={ () => {this.setState({lineup_type:"home"}) }} >
            <Text style={styles.view_tab_text}>{this.home_team_ar}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={is_home==false ? styles.lineup_team_ : styles.lineup_team} onPress={ () => {this.setState({lineup_type:"away"}) }} >
            <Text style={styles.view_tab_text}>{this.away_team_ar}</Text>
          </TouchableOpacity>
        </View> 
        {is_home==true ? this.generate_lineup(this.state.matche_details.home_lineup) : null}
        {is_home==false ? this.generate_lineup(this.state.matche_details.away_lineup) : null}
      </View> 
    );
  }
  render() {

    return (
      <View style={styles.container}>
        <Text style={styles.title}> {this.state.matche_details.home_team} {this.state.matche_details.home_team_score}-{this.state.matche_details.away_team_score} {this.state.matche_details.away_team}</Text>
        <View style={styles.tabs_list}>
          <Button title="General" onPress={()=>this.setState({visible_tab:"general"})}/>
          <Button title="Statistics" onPress={()=>this.setState({visible_tab:"stats"})}/>
          <Button title="Line-up" onPress={()=>this.setState({visible_tab:"lineup"})}/>
        </View>
        <View style={{flex:1}}>
        {this.state.loading ? <Loading /> :
            <View style={{flex:1}}>
            { this.state.matche_details!={} && this.state.visible_tab=="general" ? this.get_View_general() : null}
            { this.state.matche_details!={} && this.state.visible_tab=="stats"   ? this.get_View_stats()   : null}
            { this.state.matche_details!={} && this.state.visible_tab=="lineup"   ? this.get_View_lineup() : null}
          </View>
        }
        </View>
        {this.state.modalVisible_match==true ? this.render_modal_credentials() : null}
        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#000',
    color : "#d1d8e0",
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tabs_list:{
    marginTop:10,
    flexDirection:'row', 
    flexWrap:'wrap',
  },
  view_tab:{
    marginTop:10,
    flex: 12 ,
    height:15
  },
  view_tab_text:{
    flex: 1 ,
    padding:8
  },
  
  stats_container:{
    marginTop:10,
    flexDirection:'row', 
    flexWrap:'wrap',
    flex: 1 ,
  },
  stats_frag_l_:{
    margin:5,
    flex: 10 ,
    textAlign: 'center',
    color : "#d1d8e0",
  },
  stats_frag_m_:{
    margin:5,
    flex: 4 ,
    textAlign: 'center',
    color : "#d1d8e0",
  },
  stats_frag_r_:{
    margin:5,
    flex: 10 ,
    textAlign: 'center',
    color : "#d1d8e0",
  },
  stats_frag_l:{
    margin:5,
    flex: 2 ,
    textAlign: 'center',
    color : "#d1d8e0",
  },
  stats_frag_m:{
    margin:5,
    flex: 10 ,
    textAlign: 'center',
    color : "#d1d8e0",
  },
  stats_frag_r:{
    margin:5,
    flex: 2 ,
    color : "#d1d8e0",
  },

  view_inline:{
    margin:5,
    flexDirection:'row', 
    flexWrap:'wrap',
    flex: 1 ,
    textAlign: 'center',
    color : "#d1d8e0",
  },
  lineup_team:{
    borderRadius: 20,
    margin:5,
    flex: 1 ,
    textAlign: 'center',
    backgroundColor:"#dae6fd",
  },
  lineup_team_:{
    borderWidth :1,
    borderRadius: 20,
    margin:5,
    flex: 1 ,
    textAlign: 'center',
    backgroundColor:"#97d1f9",
  },
  background_pitch:{
    flex: 12 ,
  },
  lineup_player:{
    fontWeight: 'bold',
    fontSize:15,
    flex: 10 ,
    textAlign: 'center',
    color:"#000",
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color : "#d1d8e0",
  },
   text_info:{
     color : "#d1d8e0",
   }
});

export default Matchcreen;
