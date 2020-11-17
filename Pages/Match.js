import React from "react";
import { View, StyleSheet, Modal, Button, Linking, Picker, TouchableOpacity, ImageBackground, ScrollView, Dimensions} from 'react-native';
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
        show_res:false,
        height:"100%",
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
        <Text style={styles.text_info}>{this.state.matche_details.date} { API_.convert_time(this.state.matche_details.time)} </Text>
        <Text style={styles.text_info}>Status : {this.state.matche_details.status ? this.state.matche_details.status : "-"}</Text>
        <Text style={styles.text_info}>League : {this.state.matche_details.league}</Text>
        <Text style={styles.text_info}>Staduim : {this.state.matche_details.stadium}</Text>
        <Text style={styles.text_info}>Channels :</Text>
        {channels}
      </View> 
    );
  }
  get_subs(type_){
    const substitutions = type_=="home" ? 
      JSON.parse(JSON.stringify(this.state.matche_details.home_substitutions)) :
      JSON.parse(JSON.stringify(this.state.matche_details.away_substitutions));
    let subs = [];
    for (let k=0;k<substitutions.length;k++){
      let el = substitutions[k];
      let pp = el.substitution.split("|");
      subs.push({lineup_player:pp[1].trim(), player_out:pp[0].trim(),time:el.time ,lineup_number:""});
    }
    return subs;
  }
  get_View_lineup_2(){
    let h_lineup = this.state.matche_details.home_lineup ? this.state.matche_details.home_lineup : [];
    let a_lineup = this.state.matche_details.away_lineup ? this.state.matche_details.away_lineup : [];
    h_lineup.sort(function(a, b) {
      if (a.lineup_position < b.lineup_position) return -1;
      if (a.lineup_position > b.lineup_position) return 1;
      return 0;
    });
    a_lineup.sort(function(a, b) {
      if (a.lineup_position < b.lineup_position) return -1;
      if (a.lineup_position > b.lineup_position) return 1;
      return 0;
    });
    let players_home = {};
    let i = -1;
    // lineup_number lineup_player lineup_position
    h_lineup = [{"lineup_player":this.home_team_ar,"lineup_number":""}] . concat(h_lineup);
    a_lineup = [{"lineup_player":this.away_team_ar,"lineup_number":""}] . concat(a_lineup);
    const subs_h = this.get_subs("home");
    const subs_a = this.get_subs("away");
    h_lineup = h_lineup . concat(subs_h);
    a_lineup = a_lineup . concat(subs_a);

    this.state.matche_details.home_substitutions;
    let is_sub = false;
    let stats = h_lineup.map(row=>{
      i++;
      let home_p =h_lineup[i];
      let away_p =a_lineup[i];
      let scored_h = this.scorers_h && this.scorers_h.includes(home_p.lineup_player) ? "⚽":"";
      let scored_a = this.scorers_a && this.scorers_a.includes(away_p.lineup_player) ? "⚽":"";
      let away_t = scored_h!="" ? "":"";
      return [
          <View style={styles.lineup2_container}>
            
            <Text style={styles.lineup2_number}>{home_p && home_p.lineup_number? home_p.lineup_number : ""}</Text>
            <Text style={i==0?styles.stats_frag_l_ :styles.lineup2_h}>
              {home_p && home_p.lineup_player? home_p.lineup_player+" "+scored_h : ""}
            </Text>

            <Text style={i==0?styles.stats_frag_m_ :styles.lineup2_m}>{" "}</Text>

            <Text style={i==0?styles.stats_frag_r_ :styles.lineup2_a}>
              {away_p && away_p.lineup_player? scored_a+" "+away_p.lineup_player : ""}
            </Text>
            <Text style={styles.lineup2_number}>{away_p && away_p.lineup_number? away_p.lineup_number : ""}</Text>
          </View> ,  i==11 ? <View style={styles.hairline} /> : null ];
    });
    return (
      <View style={styles.view_tab}>
        {stats ? stats : null}
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
        <View style={styles.view_inline_teams_lu}>
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

  get_scores(type_="home"){
    if(type_=="home"){this.scorers_h =[];}
    else{this.scorers_a =[];}

    let style_class = type_=="home"? styles.match_results_team_name_l : styles.match_results_team_name_r ;
    if(this.state.matche_details.goal_scorer){
      let res = this.state.matche_details.goal_scorer.map(elm=>{
        if(elm[type_+"_scorer"]==undefined || elm[type_+"_scorer"]=="" || elm[type_+"_scorer"]==null) return false;
        let text = "";
        if(type_=="away"){
          text = (elm.time ? elm.time+'"' : "-") +" "+ elm[type_+"_scorer"];
          this.scorers_a.push(elm[type_+"_scorer"]);
        }else{
          text = elm[type_+"_scorer"] +" "+(elm.time ? elm.time+'"' : "-");
          this.scorers_h.push(elm[type_+"_scorer"]);
        }
        return <Text style={[style_class,styles.match_results_scorer_text]}>{text}</Text>;
      });
      return(
          <View style={[style_class]}>
            {res ? res :null}
          </View>
      );
    }
  }
  render() {
    
    let home_sc="";
    let away_sc="";
    let home_name="h";
    let away_name="a";
    let home_style={};
    let away_style ={};
    let scores_home = this.get_scores("home");
    let scores_away = this.get_scores("away");
    try{
      home_sc = this.state.matche_details.home_team_score ? parseInt(this.state.matche_details.home_team_score) : "-";
      away_sc = this.state.matche_details.away_team_score ? parseInt(this.state.matche_details.away_team_score) : "-";
      home_style = home_sc>away_sc ? styles.match_results_winer 
        : (home_sc==away_sc ? styles.match_results_drawer : styles.match_results_loser);
      away_style = away_sc>home_sc ? styles.match_results_winer 
      : (away_sc==home_sc ? styles.match_results_drawer : styles.match_results_loser);
      home_name = this.state.matche_details.home_team_ar ? this.state.matche_details.home_team_ar : this.state.matche_details.home_team;
      away_name = this.state.matche_details.away_team_ar ? this.state.matche_details.away_team_ar : this.state.matche_details.away_team;
    }catch(e){
      alert(e);
      return <View style={styles.container}><Text>ERR</Text></View>;
      }

    let screenHeight = Dimensions.get('window').height;
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.container_scrl}>
        <TouchableOpacity style={styles.header_container} onPress={()=>this.setState({show_res : this.state.show_res?false:true})}>              
          <View style={[styles.match_results_team_name_l,home_style]}>
            <View styles={[styles.match_results_team_name_l,{flex:1}]}>
              <Text style={[styles.match_results_team_name,styles.match_results_team_name_l,]}>{home_name}</Text>
              <Text style={[styles.match_results_team_scor_t,styles.match_results_team_name_l,]}>{home_sc}</Text>
            </View>
            { this.state.show_res ?
            <View style={{}}>
              {scores_home}
            </View>
            :null}
          </View>

          <View style={[styles.match_results_team_name_r,away_style]}>
            <View styles={[styles.match_results_team_name_r,{flex:1}]}>
              <Text style={[styles.match_results_team_name,styles.match_results_team_name_r,]}>{away_name}</Text>
              <Text style={[styles.match_results_team_scor_t,styles.match_results_team_name_r,]}>{away_sc}</Text>
            </View>
            { this.state.show_res ?
            <View style={{}}>
              {scores_away}
            </View>
            :null}
          </View>
        </TouchableOpacity>
        
        <View style={styles.tabs_list}>
          <Button title="General" onPress={()=>this.setState({visible_tab:"general"})}/>
          <Button title="Statistics" onPress={()=>this.setState({visible_tab:"stats"})}/>
          <Button title="Line-up" onPress={()=>this.setState({visible_tab:"lineup"})}/>
          <Button title="Line-up2" onPress={()=>this.setState({visible_tab:"lineup2"})}/>
        </View>
        {this.state.loading ? <Loading /> :
          <View style={{flex:1,width:"100%"}}>
            { this.state.matche_details!={} && this.state.visible_tab=="general" ? this.get_View_general() : null}
            { this.state.matche_details!={} && this.state.visible_tab=="stats"   ? this.get_View_stats()   : null}
            { this.state.matche_details!={} && this.state.visible_tab=="lineup"   ? this.get_View_lineup() : null}
            { this.state.matche_details!={} && this.state.visible_tab=="lineup2"   ? this.get_View_lineup_2() : null}
          </View>
        }
        
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //minHeight:"100%",
    //paddingTop: Constants.statusBarHeight/2,
    paddingTop :3,
    backgroundColor: '#000',
    color : "#d1d8e0",
  },
  container_scrl: {
    //minHeight:"100%",
    flexGrow: 1,
    backgroundColor: '#000',
    //backgroundColor: 'red',
  },
hairline: {
  backgroundColor: '#A2A2A2',
  height: 2,
  width:"90%",
  marginHorizontal:"auto",
},
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tabs_list:{
    //marginTop:10,
    flexDirection:'row', 
    flexWrap:'wrap',
  },
  view_tab:{
    //marginTop:10,
    flex: 13 ,
    height:20
  },
  view_tab_text:{
    //flex: 1 ,
    textAlign:"center",
    padding:3
  },
  lineup2_container:{
    marginTop:3,
    flexDirection:'row', 
    flexWrap:'wrap',
  },
  lineup2_h:{
    flex:9,
    marginHorizontal:3,
    textAlign: 'left',
    color : "#d1d8e0",
  },
  lineup2_a:{
    flex:9,
    marginHorizontal:3,
    textAlign: 'right',
    color : "#d1d8e0",
  },
  lineup2_m:{
    flex:1,
    marginHorizontal:5,
    textAlign: 'center',
    color : "#d1d8e0",
  },
  lineup2_number:{
    width:20,
    marginHorizontal:3,
    textAlign: 'center',
    color : "#f1c40f",
  },
  stats_container:{
    marginTop:10,
    flexDirection:'row', 
    flexWrap:'wrap',
    
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
    marginLeft:5,
    marginRight:5,
    flexDirection:'row', 
    flexWrap:'wrap',
    flex: 1 ,
    textAlign: 'center',
    color : "#d1d8e0",
  },
  view_inline_teams_lu:{
    marginTop:3,
    flexDirection:'row', 
    flexWrap:'wrap',
    //height:10,
    textAlign: 'center',
    color : "#d1d8e0",
    marginBottom:10

  },
  lineup_team:{
    marginLeft:5,
    marginRight:5,
    borderRadius: 10,
    //margin:5,
    flex: 1 ,
    textAlign: 'center',
    backgroundColor:"#dae6fd",
  },
  lineup_team_:{
    marginLeft:5,
    marginRight:5,
    //borderWidth :1,
    borderRadius: 10,
    //margin:5,
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
   },
   header_container:{
     marginHorizontal:"auto",
     width:"98%",
     flexDirection:"row",
     flexWrap:'wrap',
     marginBottom:10,
  },
   match_results_team_name:{
    fontSize: 20,
    fontWeight: 'bold',
    color : "#fff",
    paddingHorizontal:5,
    width:"100%",
    //textAlign:"right"
   },
   match_results_team_scor_t:{
    fontSize: 20,
    fontWeight: 'bold',
    color : "#f1c40f",
    paddingHorizontal:5,
    //textAlign:"right"
   },
   
   match_results_team_name_l:{
     textAlign:"right",
     borderRightWidth:1,
     },
   match_results_team_name_r:{
     textAlign:"left",
     borderLeftWidth:1,
     
   },
   match_results_winer:{
     flex:1,
     backgroundColor:"#16a085",
   },
   match_results_loser:{
     flex:1,
     backgroundColor:"#c0392b",
   },
    match_results_drawer:{
     flex:1,
     backgroundColor:"#7f8c8d",
   },
   match_results_scorer_text:{
     color:"#dbd9ff",
     fontSize:15,
     }
});

export default Matchcreen;
