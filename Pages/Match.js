import React from "react";
import { View, StyleSheet, Modal, Button, Linking, Picker, TouchableOpacity,Image, ImageBackground, ScrollView, Dimensions} from 'react-native';
import Constants from 'expo-constants';
import ItemsList from '../components/list';
import ReactHlsPlayer from "react-hls-player";
import Video from 'expo';
import Loading from '../components/Loader';
import {styles_match,getTheme,global_theme} from "../components/Themes";
import IconButton from "../components/IconButton";

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
        match_dets:this.props.route.params.match_item,
        visible_tab : "general",
        loading:true,
        show_res:false,
        height:"100%",
        dynamic_style:styles_match,
        favorite:[],
    };
    this.get_Match(this.props.route.params.match_item.id);

  }
  componentDidMount(){
    API_.getConfig("favorite_channels",this.state.favorite).then(o=>{this.setState({favorite:o});});
    getTheme("styles_match").then(theme=>this.setState({dynamic_style:theme}));
  }
  get_Match(id){
      if(this.state.match_dets.details){
        return this.get_Match_k(id);
      }
      API_.get_match(id).then(resp=>{
        if(resp["data"] && resp["data"][0] ){
          this.setState({matche_details:resp["data"][0],loading:false});
          this.home_team_ar = this.state.matche_details.home_team_ar ? this.state.matche_details.home_team_ar : this.state.matche_details.home_team;
          this.away_team_ar = this.state.matche_details.away_team_ar ? this.state.matche_details.away_team_ar : this.state.matche_details.away_team; 
          this.props.navigation.setOptions({title: <Text >{this.home_team_ar +" - "+this.away_team_ar }</Text>});
        }
      });
  }
  get_Match_k(id){
      API_.get_match_k(id).then(resp=>{
        //console.log("get_Match_k ",Object.values(resp)[0]["data"][0]);
        if(resp ){
          this.setState({matche_details: resp,loading:false});
          this.home_team_ar = this.state.matche_details.home_team_ar ? this.state.matche_details.home_team_ar : this.state.matche_details.home_team;
          this.away_team_ar = this.state.matche_details.away_team_ar ? this.state.matche_details.away_team_ar : this.state.matche_details.away_team; 
          this.props.navigation.setOptions({title: <Text >{this.home_team_ar +" - "+this.away_team_ar }</Text>});
        }
      });
  }


  onmt_clicked(item){
    this.props.navigation.navigate('Channel', { channel_id: item.id,channel_photo:item.channel_photo });
  }


  set_fav=(ch_name)=>{
    API_.getConfig("favorite_channels",this.state.favorite).then(o=>{
      if( o.includes(ch_name) ){
        o = o.filter(o=>{if(o!=ch_name)return o;});
      }else{
        o.push(ch_name);
      }
      this.setState({favorite:o});
      API_.setConfig("favorite_channels",o);
    });
    this.setState({});
  }
  get_fav_icon(ch_name){
    let fav_icon = null;
    if(this.state.favorite){
      fav_icon = this.state.favorite.includes(ch_name) ? 
        <IconButton name="star" style={{height:30,width:50}} color={global_theme.text_color_default} /> :
        <IconButton name="star-o" style={{height:30,width:50}} color={global_theme.text_color_default}/> ;
    }
    return fav_icon;
  }
  get_View_general(){
    this.state.matche_details.channels = this.state.matche_details.channels ? 
      this.state.matche_details.channels.sort((a,b)=>{return (this.state.favorite.indexOf(a.en_name)>this.state.favorite.indexOf(b.en_name))?-1:1;})
      :this.state.matche_details.channels;
    let channels = this.state.matche_details.channels ?
      this.state.matche_details.channels.map(ch => (
        <View style={{margin:1}}>
          {ch.is_koora==undefined ?
            <Button onPress={()=>this.onmt_clicked(ch)}  key={ch.id} title={ch.en_name} style={{margin:4}}></Button>
           : 
            <TouchableOpacity style={{flexDirection:'row', flexWrap:'wrap',width:"100%",marginLeft:10}} onPress={()=>this.set_fav(ch.en_name)}>
              {this.get_fav_icon(ch.en_name)}
              <Text style={{flex:1,backgroundColor:global_theme.background_color_default,color:global_theme.text_color_default}} >{ch.en_name}</Text>
            </TouchableOpacity>
          }
        </View>
      ))
    : null;
    if(this.state.matche_details=={}) {return null;}

    this.state.matche_details.status       = this.state.matche_details.status ? this.state.matche_details.status : "-";
    this.state.matche_details.league       = this.state.matche_details.league ? this.state.matche_details.league : "-";
    this.state.matche_details.phase        = this.state.matche_details.phase ? this.state.matche_details.phase : "-";
    this.state.matche_details.group        = this.state.matche_details.group ? this.state.matche_details.group : "-";
    this.state.matche_details.round        = this.state.matche_details.round ? this.state.matche_details.round : "-";
    this.state.matche_details.retour_score = this.state.matche_details.retour_score ? this.state.matche_details.retour_score : "-";
    this.state.matche_details.stadium      = this.state.matche_details.stadium ? this.state.matche_details.stadium : "-";
    
    return (
      <View style={this.state.dynamic_style.view_tab}>
        <Text style={this.state.dynamic_style.text_info}>{this.state.matche_details.date} { API_.convert_time(this.state.matche_details.time)} </Text>
        {this.state.matche_details.status!="-" ?
          <Text style={this.state.dynamic_style.text_info}>Status : {this.state.matche_details.status}</Text>
         : null}
        {this.state.matche_details.league!="-" ?
          <Text style={this.state.dynamic_style.text_info}>League : {this.state.matche_details.league}</Text>
         : null}
        {this.state.matche_details.phase!="-" ?
          <Text style={this.state.dynamic_style.text_info}>Phase : {this.state.matche_details.phase}</Text>
         : null}
        {this.state.matche_details.group!="-" ?
          <Text style={this.state.dynamic_style.text_info}>Group : {this.state.matche_details.group}</Text>
         : null}
        {this.state.matche_details.round!="-" ?
          <Text style={this.state.dynamic_style.text_info}>Round : {this.state.matche_details.round}</Text>
         : null}
        {this.state.matche_details.retour_score!="-" ?
          <Text style={this.state.dynamic_style.text_info}>First leg : {this.state.matche_details.retour_score}</Text>
         : null}
        {this.state.matche_details.stadium!="-" ?
          <Text style={this.state.dynamic_style.text_info}>Staduim : {this.state.matche_details.stadium}</Text>
         : null}
        {channels!=null && channels.length>0 ?
          <Text style={this.state.dynamic_style.text_info}>Channels :</Text>
         : null}
        {channels!=null && channels.length>0 ?
          channels
         : null}
        
      </View> 
    );
  }
  get_subs(type_){
    let substitutions = []
    try{
    substitutions = type_=="home" ? 
      JSON.parse(JSON.stringify(this.state.matche_details.home_substitutions)) :
      JSON.parse(JSON.stringify(this.state.matche_details.away_substitutions));
    }catch(err){
      return [];
    }
    let subs = [];
    for (let k=0;k<substitutions.length;k++){
      let el = substitutions[k];
      let pp = el.substitution ? el.substitution.split("|") : ["",el.lineup_player];
      if(el.time==""){
        continue;
      }
      subs.push({lineup_player:pp[1].trim(), player_out:pp[0].trim(),time:el.time ,lineup_number:el.time ? el.time.split("+")[0]+'"':""});
    }
    subs = subs.sort((a,b)=>{return a.time<b.time?-1:1;});
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
      let home_p = h_lineup[i]!=undefined ? h_lineup[i] : false;
      let away_p = a_lineup[i]!=undefined ? a_lineup[i] : false;
      let scored_h_count = this.scorers_h.filter(function(item) {return item === home_p.lineup_player}).length;
      let scored_a_count = this.scorers_a.filter(function(item) {return item === away_p.lineup_player}).length;
      let scored_h = this.scorers_h && home_p && this.scorers_h.includes(home_p.lineup_player) ? "⚽".repeat(scored_h_count):"";
      let scored_a = this.scorers_a && away_p && this.scorers_a.includes(away_p.lineup_player) ? "⚽".repeat(scored_a_count):"";

      let assist_h_count = this.assist_h.filter(function(item) {return item === home_p.lineup_player}).length;
      let assist_a_count = this.assist_a.filter(function(item) {return item === away_p.lineup_player}).length;
      let assist_h = this.assist_h && home_p && this.assist_h.includes(home_p.lineup_player) ? "★".repeat(assist_h_count):"";
      let assist_a = this.assist_a && away_p && this.assist_a.includes(away_p.lineup_player) ? "★".repeat(assist_a_count):"";

      const style_sub_h = home_p.player_out==undefined ? {} : this.state.dynamic_style.lineup2_number_subs;
      const style_sub_a = away_p.player_out==undefined ? {} : this.state.dynamic_style.lineup2_number_subs;

      return (
          <View style={this.state.dynamic_style.lineup2_container}>
            
            <Text style={[this.state.dynamic_style.lineup2_number,style_sub_h]}>{home_p && home_p.lineup_number? home_p.lineup_number : ""}</Text>
            <Text style={i==0?this.state.dynamic_style.stats_frag_l_ :this.state.dynamic_style.lineup2_h} numberOfLines={1}>
              {home_p && home_p.lineup_player? home_p.lineup_player+" "+assist_h+" "+scored_h : ""}
            </Text>


            <Text style={i==0?this.state.dynamic_style.stats_frag_r_ :this.state.dynamic_style.lineup2_a} numberOfLines={1}>
              {away_p && away_p.lineup_player? scored_a+" "+assist_a+" "+away_p.lineup_player : ""}
            </Text>
            <Text style={[this.state.dynamic_style.lineup2_number,style_sub_a]}>{away_p && away_p.lineup_number? away_p.lineup_number : ""}</Text>
            {i==11 ? <View style={this.state.dynamic_style.hairline}/> : null}
          </View> );
           //,  i==11 ? <View style={this.state.dynamic_style.hairline} /> : null ];
    });
    
    return (
      <View style={this.state.dynamic_style.view_tab}>
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
          <View style={this.state.dynamic_style.stats_container}>
            <Text style={i==0?this.state.dynamic_style.stats_frag_l_ :this.state.dynamic_style.stats_frag_l}>{row ? row.home : ""}</Text>
            <Text style={i==0?this.state.dynamic_style.stats_frag_m_ :this.state.dynamic_style.stats_frag_m}>{row ? row.type : "-"}</Text>
            <Text style={i==0?this.state.dynamic_style.stats_frag_r_ :this.state.dynamic_style.stats_frag_r}>{row ? row.away : ""}</Text>
          </View>);
    });
    return (
      <View style={this.state.dynamic_style.view_tab}>
        {stats ? stats : <View style={this.state.dynamic_style.view_tab}><Text style={this.state.dynamic_style.title}>Line-up not available</Text></View>}
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
      <View style={this.state.dynamic_style.view_tab}>
      <ImageBackground style={this.state.dynamic_style.background_pitch} source={require('../assets/ptch.jpg')} >
        <View style={this.state.dynamic_style.view_inline}>
          <Text style={this.state.dynamic_style.lineup_player}>{players[1] ? players[1].lineup_player : ""}</Text>
        </View> 
        <View style={this.state.dynamic_style.view_inline}>
          <Text style={this.state.dynamic_style.lineup_player}>{players[2] ? players[2].lineup_player : ""}</Text>
          <Text style={this.state.dynamic_style.lineup_player}>{players[5] ? players[5].lineup_player : ""}</Text>
          <Text style={this.state.dynamic_style.lineup_player}>{players[4] ? players[4].lineup_player : ""}</Text>
          <Text style={this.state.dynamic_style.lineup_player}>{players[3] ? players[3].lineup_player : ""}</Text>
        </View> 
        <View style={this.state.dynamic_style.view_inline}>
          <Text style={this.state.dynamic_style.lineup_player}>{players[7] ? players[7].lineup_player : ""}</Text>
          <Text style={this.state.dynamic_style.lineup_player}>{players[8] ? players[8].lineup_player : ""}</Text>
          <Text style={this.state.dynamic_style.lineup_player}>{players[10] ? players[10].lineup_player : ""}</Text>
          <Text style={this.state.dynamic_style.lineup_player}>{players[6] ? players[6].lineup_player : ""}</Text>
        </View> 
        <View style={this.state.dynamic_style.view_inline}>
          <Text style={this.state.dynamic_style.lineup_player}>{players[11] ? players[11].lineup_player : ""}</Text>
          <Text style={this.state.dynamic_style.lineup_player}>{players[9] ? players[9].lineup_player : ""}</Text>
        </View> 
      </ImageBackground>
      </View> 
    );
  }
  get_View_lineup(){
    if( this.state.matche_details=={} || this.state.matche_details.home_lineup==undefined || this.state.matche_details.away_lineup==undefined ||
      this.state.matche_details.home_lineup.length<11 || this.state.matche_details.away_lineup.length<11) 
      return <View style={this.state.dynamic_style.view_tab}><Text style={this.state.dynamic_style.title}>Line-up not available</Text></View>;
    const is_home = this.state.lineup_type==undefined || this.state.lineup_type=="home" ;
    return (
      <View style={this.state.dynamic_style.view_tab}>
        <View style={this.state.dynamic_style.view_inline_teams_lu}>
          <TouchableOpacity style={is_home==true ? this.state.dynamic_style.lineup_team_ :this.state.dynamic_style.lineup_team } onPress={ () => {this.setState({lineup_type:"home"}) }} >
            <Text style={this.state.dynamic_style.view_tab_text}>{this.home_team_ar}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={is_home==false ? this.state.dynamic_style.lineup_team_ : this.state.dynamic_style.lineup_team} onPress={ () => {this.setState({lineup_type:"away"}) }} >
            <Text style={this.state.dynamic_style.view_tab_text}>{this.away_team_ar}</Text>
          </TouchableOpacity>
        </View> 
        {is_home==true ? this.generate_lineup(this.state.matche_details.home_lineup) : null}
        {is_home==false ? this.generate_lineup(this.state.matche_details.away_lineup) : null}
      </View> 
    );
  }

  get_scores(type_="home"){
    if(type_=="home"){this.scorers_h =[];this.assist_h =[];}
    else{this.scorers_a =[];this.assist_a =[];}

    let style_class = type_=="home"? this.state.dynamic_style.match_results_team_name_l : this.state.dynamic_style.match_results_team_name_r ;
    if(this.state.matche_details.goal_scorer){
      let res = this.state.matche_details.goal_scorer.map(elm=>{
        if(elm[type_+"_scorer"]==undefined || elm[type_+"_scorer"]=="" || elm[type_+"_scorer"]==null) return false;
        let text = "";
        if(type_=="away"){
          text = (elm.time ? elm.time+'"' : "-") +" "+ elm[type_+"_scorer"];
          this.scorers_a.push(elm[type_+"_scorer"]);
          this.assist_a.push(elm[type_+"_assist"]);
          
        }else{
          text = elm[type_+"_scorer"] +" "+(elm.time ? elm.time+'"' : "-");
          this.scorers_h.push(elm[type_+"_scorer"]);
          this.assist_h.push(elm[type_+"_assist"]);
        }
        return <Text style={[style_class,this.state.dynamic_style.match_results_scorer_text]}>{text}</Text>;
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
      home_sc = this.state.match_dets.home_team_score && this.state.match_dets.home_team_score!="-" ? parseInt(this.state.match_dets.home_team_score) : "-";
      away_sc = this.state.match_dets.away_team_score && this.state.match_dets.away_team_score!="-" ? parseInt(this.state.match_dets.away_team_score) : "-";
      home_style = home_sc>away_sc ? this.state.dynamic_style.match_results_winer 
        : (home_sc==away_sc ? this.state.dynamic_style.match_results_drawer : this.state.dynamic_style.match_results_loser);
      away_style = away_sc>home_sc ? this.state.dynamic_style.match_results_winer 
      : (away_sc==home_sc ? this.state.dynamic_style.match_results_drawer : this.state.dynamic_style.match_results_loser);
      home_name = this.state.match_dets.home_team_ar ? this.state.match_dets.home_team_ar : this.state.match_dets.home_team;
      away_name = this.state.match_dets.away_team_ar ? this.state.match_dets.away_team_ar : this.state.match_dets.away_team;
    }catch(e){
      alert(e);
      return <View style={this.state.dynamic_style.container}><Text>ERR</Text></View>;
      }
    return (
      <ScrollView style={this.state.dynamic_style.container}>
        <TouchableOpacity style={this.state.dynamic_style.header_container} onPress={()=>this.setState({show_res : this.state.show_res?false:true})}>              
          <View style={[home_style]}>
            <Image style={{height:100,width:"95%",justifyContent: "center",resizeMode:"contain"}} source={{uri: this.state.match_dets.home_team_badge}} ></Image>
            <View styles={{flex:1,}}>
              <Text style={[this.state.dynamic_style.match_results_team_name,]} numberOfLines={1}>{home_name}</Text>
              <Text style={[this.state.dynamic_style.match_results_team_scor_t]}>{home_sc}</Text>
            </View>
            { this.state.show_res ?
            <View style={{}}>
              {scores_home}
            </View>
            :null}
          </View>

          <View style={[this.state.dynamic_style.match_results_team_name_r,away_style]}>
          <Image style={{height:100,width:"95%",resizeMode:"contain"
}} source={{uri: this.state.match_dets.away_team_badge}} ></Image>
            <View styles={[this.state.dynamic_style.match_results_team_name_r,{flex:1}]}>
              <Text style={[this.state.dynamic_style.match_results_team_name,]} numberOfLines={1}>{away_name}</Text>
              <Text style={[this.state.dynamic_style.match_results_team_scor_t]}>{away_sc}</Text>
            </View>
            { this.state.show_res ?
            <View style={{}}>
              {scores_away}
            </View>
            :null}
          </View>
        </TouchableOpacity>
        
        <View style={this.state.dynamic_style.tabs_list}>
          <View style={{flex:1}}><Button title="General" onPress={()=>this.setState({visible_tab:"general"})} /></View>
          <View style={{flex:1}}><Button title="Statistics" onPress={()=>this.setState({visible_tab:"stats"})}/></View>
          <View style={{flex:1}}><Button title="Line-up" onPress={()=>{
            this.setState({visible_tab:"lineup2",loading:true});
            if(this.state.match_dets.details && this.state.matche_details.home_lineup==undefined){
              API_.get_lineup_k(this.state.matche_details.id).then(o=>{
                for(let i=0;i< Object.keys(o).length;i++){
                  this.state.matche_details[Object.keys(o)[i]] = o[Object.keys(o)[i]];
                }
                this.setState({visible_tab:"lineup2",loading:false});
              });
              return null;
            }else{
              this.setState({visible_tab:"lineup2",loading:false});
            }
            }}/></View>
          <View style={{flex:1}}><Button title="League" onPress={()=>{
            const league_img = this.state.matche_details.league_badge ? API_.domain_o+this.state.matche_details.league_badge.path : null ;
            this.props.navigation.navigate('League', 
          { league_details: {league:this.state.matche_details.league,
            league_img: league_img} })           }
          }/></View>
          {/* <Button title="Line-up" onPress={()=>this.setState({visible_tab:"lineup"})}/> */}
        </View>
        {this.state.loading ? <Loading /> :
          <View  style={this.state.dynamic_style.container_scrl}>
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

export default Matchcreen;
