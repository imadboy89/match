import React from "react";
import { View, TouchableHighlight, Modal, Button, Switch, TouchableOpacity,Image, ImageBackground, ScrollView, RefreshControl} from 'react-native';
import Loading from '../components/Loader';
import {styles_match,getTheme,global_theme} from "../components/Themes";
import IconButton from "../components/IconButton";
import Icon from 'react-native-vector-icons/FontAwesome';
import Player from "../components/Player";
import Team from "../components/Team";
import {Picker} from '@react-native-picker/picker';

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
        matche_details:this.props.route.params.match_item,
        visible_tab : "general",
        loading:true,
        show_res:false,
        height:"100%",
        dynamic_style:styles_match,
        favorite:[],
        favorite_p:[],
        modalVisible_player:false,
        player:false,
        favorite_t:[],
        is_live_match:false,

    };
    this.sub_out = {"home":[],"away":[]};
    this.id = 0;
    this.symbol_goal = "⚽";
    this.symbol_redcard = "🟥";
    this.symbol_yallowcard = "🟨";
  }
  componentDidMount(){
    this.state.matche_details = this.state.matche_details && this.state.matche_details!="-" ? this.state.matche_details : undefined;
    //console.log("componentDidMount",this.props.route.params.match_item.id);
    this.id = this.state.matche_details && this.state.matche_details.id ? this.state.matche_details.id : this.props.route.params.id ;

    this.get_Match(this.id);
    getTheme("styles_match").then(theme=>this.setState({dynamic_style:theme}));
    backup.check_live_match(this.id).then(o=>this.setState({is_live_match:o?true:false}));
    API_.getConfig("favorite_channels",this.state.favorite).then(o=>{this.setState({favorite:o});});
    API_.getConfig("favorite_players",this.state.favorite_p).then(o=>{this.setState({favorite_p:o});});
    API_.getConfig("favorite_teams_k",this.state.favorite_t).then(o=>{this.setState({favorite_t:o});});
    
    this.render_header();

    this.interval_refresh = setInterval(()=>{
      if(this.state.matche_details && this.state.matche_details.live){
        this.get_Match(this.id)
      }
    }, 40000);
    
  }
  render_header=()=>{
    let title_str = "";
    let title = "";
    if(this.state.matche_details!=undefined){
      this.home_team_ar = this.state.matche_details && this.state.matche_details.home_team_ar ? this.state.matche_details.home_team_ar : this.state.matche_details.home_team;
      this.away_team_ar = this.state.matche_details && this.state.matche_details.away_team_ar ? this.state.matche_details.away_team_ar : this.state.matche_details.away_team;  
      title_str = this.home_team_ar +" - "+ this.away_team_ar ;
      title = <Text>{title_str}</Text>;
    }
    this.props.navigation.setOptions({title: title,
    "headerRight":()=>(
      <View style={{flexDirection:"row",margin:5}}>
        <IconButton 
          name="share" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} 
          onPress={()=>{
             //http://localhost:19006/Match/-/2095804
            const id = this.id;
            const message = title_str;
            const url     = `Match/-/${id}` ;
            const title   = title_str;
            API_.onShare(title,message,url);
        }}  />
    </View>
    )
    });
  }
  get_Match(id){
    //console.log("get_Match",id,this.state.matche_details);
    if(this.props.route.params.match_item && this.props.route.params.match_item.is_kora_star){
      this.setState({matche_details:this.props.route.params.match_item,loading:false});
      return ;
    }
    if(this.state.matche_details==undefined || this.state.matche_details.is_koora){
      this.is_k = true;
      this.get_head2head(id);
      return this.get_Match_k(id);
    }
    this.state.matche_details
    API_.get_match(id).then(resp=>{
      if(resp && resp["data"] && resp["data"][0] ){
        
        this.state.matche_details = resp["data"][0];
        this.home_team_ar = this.state.matche_details.home_team_ar ? this.state.matche_details.home_team_ar : this.state.matche_details.home_team;
        this.away_team_ar = this.state.matche_details.away_team_ar ? this.state.matche_details.away_team_ar : this.state.matche_details.away_team; 
        this.render_header();
        API_.setTitleWeb(this.home_team_ar +" - "+ this.away_team_ar);
        this.setState({loading:false});
      }
    });
  }
  get_head2head(id){
    const draw_str = "تعادل";
    this.state.head2head = {};
    this.state.head2head[draw_str] = 0;
    API_.get_match_head2head(id).then(resp=>{
      if(resp && resp.length>0){
        resp.map(r=> {
            const t1 = r[8];
            const t2 = r[10];
            const s1 = r[3];
            const s2 = r[4];
            
            if(this.state.head2head[t1] == undefined){
              this.state.head2head[t1] = 0;
                this.state.head2head[t2] = 0;
            }
            this.state.head2head[t1] += s1>s2 ? 1 : 0;
            this.state.head2head[t2] += s2>s1 ? 1 : 0;
            this.state.head2head[draw_str] += s2==s1 ? 1 : 0;
        });
        this.setState({});
      }
    });
  }
  load_logos_old(){
    if(this.state.matche_details.home_team_logo && this.state.matche_details.away_team_logo)return true;
    if(this.home_team_ar){
      API_.getTeam_logo(this.home_team_ar).then(lo=>{
        this.state.matche_details.home_team_logo = lo && lo.logo_url ? lo.logo_url : false;
        if(this.away_team_ar){
          API_.getTeam_logo(this.away_team_ar).then(lo=>{
            this.state.matche_details.away_team_logo = lo && lo.logo_url ? lo.logo_url : false;
            this.setState({});
          });
        }
      });
    }
  }
  async load_logos(){
    if(this.state.matche_details.home_team_logo || this.state.matche_details.away_team_badge)return true;
    const h_team_info = await API_.getTeam_logo_k(this.state.matche_details.home_team_id);
    const a_team_info = await API_.getTeam_logo_k(this.state.matche_details.away_team_id);
    
    this.state.matche_details.home_team_logo = h_team_info ? API_.get_team_logo(h_team_info) : undefined;
    this.state.matche_details.away_team_logo = a_team_info ? API_.get_team_logo(a_team_info) : undefined;
    this.setState({});
  }
  get_Match_k(id){
      API_.get_match_k(id).then(resp=>{
        if(resp ){
          const is_linked = this.state.matche_details==undefined;
          this.state.matche_details = this.state.matche_details ? {...this.state.matche_details, ...resp} : resp;
          this.home_team_ar = this.state.matche_details.home_team_ar ? this.state.matche_details.home_team_ar : this.state.matche_details.home_team;
          this.away_team_ar = this.state.matche_details.away_team_ar ? this.state.matche_details.away_team_ar : this.state.matche_details.away_team; 
          this.render_header();
          this.setState({loading:false});
          API_.setTitleWeb(this.home_team_ar +" - "+ this.away_team_ar);
          if(is_linked){
            this.load_logos();
          }
        }
      });
  }


  onmt_clicked(item){
    if(item.is_koora==undefined && this.state.matche_details.is_kora_star==undefined){
      this.props.navigation.navigate('Channel', { channel_id: item.id,channel_photo:item.channel_photo });
    }else if(this.state.matche_details.is_kora_star==true && item.url){
      item.id =item.category_id = item.url;
      item.category_name =item.codename = item.name = item.en_name;
      item.category_photo = "";
      item.is_external = true;
      try {
        const ch = JSON.parse(JSON.stringify(item)) ;
        this.props.navigation.navigate('Video', { item: ch });
      } catch (error) {API_.debugMsg(error, "danger")}
      //API_.open_ext_url(item.url);
    }
  }

  set_fav_team=async(id,team_name)=>{
    id= parseInt(id);
    let msg_action = "";
    if(id==0){return "";}
    const localS_fav_key = this.is_k ? "favorite_teams_k" : "favorite_teams";
    let o = await API_.getConfig(localS_fav_key,this.state.favorite_t)
    if( o.includes(id) ){
      o = o.filter(o=>{if(o!=id)return o;});
      msg_action = "تمت إزالته من";
    }else{
      o.push(id);
      msg_action = "تمت إضافته إلى";
    }
    this.setState({favorite_t:o});
    await API_.setConfig(localS_fav_key,o);
    this.setState({});
    API_.showMsg(`الفريق ٭${team_name}٭ ${msg_action} المفضلة!`);
  }
  set_fav=(ch_name)=>{
    let msg_action = '';
    API_.getConfig("favorite_channels",this.state.favorite).then(o=>{
      if( o.includes(ch_name) ){
        o = o.filter(o=>{if(o!=ch_name)return o;});
        msg_action = "تمت إزالتها من";
      }else{
        o.push(ch_name);
        msg_action = "تمت إضافتها إلى";
      }
      this.setState({favorite:o});
      API_.setConfig("favorite_channels",o);
      API_.showMsg(`القناة ٭${ch_name}٭ ${msg_action} المفضلة!`);
    });
    this.setState({});
  }
  set_fav_p=async(player_name)=>{
    this.setState({});
    const favorite_p = await API_.set_fav_p(player_name);
    this.setState({favorite_p:favorite_p});
  }
  get_fav_icon(ch){
    let fav_icon = null;
    if(this.state.favorite){
      fav_icon = this.state.favorite.includes(ch.en_name) ? 
        <IconButton name="star" style={{height:30,width:50}} color={global_theme.text_color_default}   onPress={()=>this.set_fav(ch.en_name)}/> :
        <IconButton name="star-o" style={{height:30,width:50}} color={global_theme.text_color_default} onPress={()=>this.set_fav(ch.en_name)}/> ;
    }
    return fav_icon;
  }
  get_View_general(){
    this.state.matche_details.channels = this.state.matche_details.channels ? this.state.matche_details.channels : [];
    this.state.matche_details.channels = this.state.matche_details.channels.sort((a,b)=>{return ( this.state.favorite.indexOf(a.en_name)>=this.state.favorite.indexOf(b.en_name))?-1:1;});
    this.state.matche_details.channels = this.state.matche_details.channels.sort((a,b)=>{return (a.commentator!=undefined && this.state.favorite.indexOf(b.en_name)==-1  )?-1:0;});
    
    let channels = this.state.matche_details.channels ?
      this.state.matche_details.channels.map(ch => { 
        const key_ch = ch.id;
        const commentator = ch.commentator;
        const ch_name_ = API_.fix_channel_name(ch.en_name);

        ch = API_.channels_dict && ch_name_ in API_.channels_dict ? API_.channels_dict[ch_name_]  : ch ;
        const ch_style = ch.is_koora==undefined ? {backgroundColor: global_theme.fav_background} : {};
        return (
        <View style={[{margin:1,flex:1},ch_style]} key={key_ch}>
            <TouchableOpacity style={[{flexDirection:'row', flexWrap:'wrap',width:"100%",marginLeft:10,justifyContent:"center"},]} onPress={()=>this.onmt_clicked(ch)}>
              {this.get_fav_icon(ch)}
              <Text style={[{flex:1,backgroundColor:global_theme.background_color_default,color:global_theme.text_color_default,paddingVertical:4},ch_style]} >{ch.en_name}{commentator!=""?" - "+commentator:""}</Text>
            </TouchableOpacity>
        </View>
      )})
    : null;
    if(this.state.matche_details=={}) {return null;}

    this.state.matche_details.status       = this.state.matche_details.status ? this.state.matche_details.status : "-";
    this.state.matche_details.league       = this.state.matche_details.league ? this.state.matche_details.league : "-";
    this.state.matche_details.phase        = this.state.matche_details.phase ? this.state.matche_details.phase : "-";
    this.state.matche_details.group        = this.state.matche_details.group ? this.state.matche_details.group : "-";
    this.state.matche_details.round        = this.state.matche_details.round ? this.state.matche_details.round : "-";
    this.state.matche_details.retour_score = this.state.matche_details.retour_score ? this.state.matche_details.retour_score : "-";
    this.state.matche_details.stadium      = this.state.matche_details.stadium ? this.state.matche_details.stadium : "-";
    this.state.matche_details.desc         = this.state.matche_details.desc ? this.state.matche_details.desc : "-";
    this.state.matche_details.match_status = this.state.matche_details.match_status ? this.state.matche_details.match_status : "OK";
    
    //const fav_style_h = this.state.matche_details && this.get_fav_icon(row.team.id, true) ? {backgroundColor: global_theme.fav_background} : {};
    //const fav_style_a = this.state.matche_details && this.get_fav_icon(row.team.id, true) ? {backgroundColor: global_theme.fav_background} : {};
    const fav_style={};
    const team_badge_h= this.state.matche_details && this.state.matche_details.home_team_logo ? this.state.matche_details.home_team_logo : false;
    const team_badge_a= this.state.matche_details && this.state.matche_details.away_team_logo ? this.state.matche_details.away_team_logo : false;
    const style_team_name ={flexDirection:'row',flexWrap:'wrap',width:"100%",height:50,borderColor:global_theme.text_color_default,borderBottomWidth :1,borderRadius:40,justifyContent:"center"};

    const live_style = this.state.matche_details.live ? {"color":global_theme.live_borderColor}:{};
    
    const head2head_info = this.state.head2head && Object.keys(this.state.head2head).length==3 ?
    Object.keys(this.state.head2head).map(k=><Text style={[this.state.dynamic_style.text_info,{color:"orange"}]} key={k}>{k} : {this.state.head2head[k]}</Text>)
    : null;
    return (
      <View style={this.state.dynamic_style.view_tab}>
        <Text style={this.state.dynamic_style.text_info}>{this.state.matche_details.datetime ? this.state.matche_details.datetime : this.state.matche_details.date+" "+API_.convert_time(this.state.matche_details.time)} </Text>
        {1==2 && this.state.matche_details && this.home_team_ar!="-" ?
          <TouchableOpacity 
            activeOpacity={0.7}
            style={[fav_style, style_team_name]} 
            onPress={() => { if (this.state.matche_details.home_team_id)this.setState({modalVisible_team:true,team_id:this.state.matche_details.home_team_id}) } }
            delayLongPress={300}
            >
          <View style={{flex:1}}></View>
          <View style={{flex:5}}><Text style={this.state.dynamic_style.text_info}>HomeTeam :</Text></View>
          <View style={{flex:2,padding:2}} >
            {team_badge_h ? <Image style={{height:"95%",width:"95%"}} source={{uri: team_badge_h}} /> : null}
          </View>
          <View style={{flex:7}}><Text style={this.state.dynamic_style.text_info} numberOfLines={1}> {this.home_team_ar}</Text></View>
          <View style={{flex:1}}></View>
        </TouchableOpacity>
         : null}
        {1==2 &&  this.state.matche_details && this.away_team_ar!="-" ?
          <TouchableOpacity 
          activeOpacity={0.7}
          style={[fav_style, style_team_name]} 
          onPress={() => { if (this.state.matche_details.away_team_id)this.setState({modalVisible_team:true,team_id:this.state.matche_details.away_team_id}) } }
          delayLongPress={300}
          >
        <View style={{flex:1}}></View>
        <View style={{flex:5}}><Text style={this.state.dynamic_style.text_info}>AwayTeam :</Text></View>
        <View style={{flex:2,padding:2}} >
          {team_badge_a ? <Image style={{height:"95%",width:"95%"}} source={{uri: team_badge_a}} /> : null}
        </View>
        <View style={{flex:7}}><Text style={this.state.dynamic_style.text_info} numberOfLines={1}> {this.away_team_ar}</Text></View>
        <View style={{flex:1}}></View>
      </TouchableOpacity>
         : null}
        {this.state.matche_details.status!="-" && this.state.matche_details.match_status=="ok" ?
          <Text style={this.state.dynamic_style.text_info}>Status : {this.state.matche_details.status}</Text>
         : null}
        {this.state.matche_details.match_status!="ok" ?
          <Text style={[this.state.dynamic_style.text_info,{color:"red"}]}>Status : {this.state.matche_details.match_status}</Text>
         : null}
        {this.state.matche_details.time_played && this.state.matche_details.time_played!="-" ?
          <Text style={[this.state.dynamic_style.text_info,live_style]}>Playing time : {this.state.matche_details.time_played}</Text>
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
        {this.state.matche_details.referee && this.state.matche_details.referee!="-" ?
          <Text style={this.state.dynamic_style.text_info}>Referee : {this.state.matche_details.referee}</Text>
         : null}
        {this.state.matche_details.desc!="-" ?
          <Text style={[this.state.dynamic_style.text_info,{color:"Orange"}]}>Description : {this.state.matche_details.desc}</Text>
         : null}
        {head2head_info && head2head_info.length>0 && 
        <Text style={this.state.dynamic_style.text_info}>Head to Head : </Text>
        }
        {head2head_info}

        <View style={{flexDirection:'row', flexWrap:'wrap', flex:1}}>
          <Text style={this.state.dynamic_style.text_info}>Live match :</Text>
          <Switch
                    style={{justifyContent:"center",marginVertical:"auto",marginHorizontal:10,width:40}}
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={this.state.is_live_match ? "#f5dd4b" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={async()=>{
                      if(this.state.is_live_match){
                        this.state.is_live_match = !await backup.remove_live_match(this.state.matche_details.id, this.away_team_ar + " VS " + this.home_team_ar);
                      }else{
                        this.state.is_live_match = await backup.save_live_match(this.state.matche_details, this.away_team_ar + " VS " + this.home_team_ar);
                      }
                      this.setState({ is_live_match : this.state.is_live_match ? true : false});
                    }}
                    value={this.state.is_live_match}
                  />
        </View>
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

      subs.push({player_key:el.player_key,lineup_player:pp[1].trim(), player_out:pp[0].trim(),time:el.time ,lineup_number:el.time ? el.time.split("+")[0]+'"':""});
    }
    subs = subs.sort((a,b)=>{return a.time<b.time?-1:1;});
    return subs;
  }
  get_player_info=(player)=>{
    this.setState({modalVisible_player:true,player_id:player.player_id});
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
    this.state.matche_details.home_lineup.map(p=>{
      if(p.subs_out_time>0){
        this.sub_out["home"] . push(p.lineup_player);
      }
    });
    this.state.matche_details.away_lineup.map(p=>{
      if(p.subs_out_time>0){
        this.sub_out["away"] . push(p.lineup_player);
      }
    });

    this.state.matche_details.home_substitutions;
    let is_sub = false;
    const lineuptoloopover = h_lineup.length>=a_lineup  ? h_lineup : a_lineup;
    let stats = lineuptoloopover.map(row=>{
      i++;
      let home_p = h_lineup[i]!=undefined ? h_lineup[i] : false;
      let away_p = a_lineup[i]!=undefined ? a_lineup[i] : false;
      let scored_h_count = this.scorers_h.filter(function(item) {return item === home_p.lineup_player}).length;
      let scored_a_count = this.scorers_a.filter(function(item) {return item === away_p.lineup_player}).length;
      let scored_h = this.scorers_h && home_p && this.scorers_h.includes(home_p.lineup_player) ? this.symbol_goal.repeat(scored_h_count):"";
      let scored_a = this.scorers_a && away_p && this.scorers_a.includes(away_p.lineup_player) ? this.symbol_goal.repeat(scored_a_count):"";

      let rcards_h = this.rcards_h && home_p && this.rcards_h.includes(home_p.lineup_player) ? this.symbol_redcard:"";
      let rcards_a = this.rcards_a && away_p && this.rcards_a.includes(away_p.lineup_player) ? this.symbol_redcard:"";
      let ycards_h = this.ycards_h && home_p && this.ycards_h.includes(home_p.lineup_player) ? this.symbol_yallowcard:"";
      let ycards_a = this.ycards_a && away_p && this.ycards_a.includes(away_p.lineup_player) ? this.symbol_yallowcard:"";


      let assist_h_count = this.assist_h.filter(function(item) {return item === home_p.lineup_player}).length;
      let assist_a_count = this.assist_a.filter(function(item) {return item === away_p.lineup_player}).length;
      let assist_h = this.assist_h && home_p && this.assist_h.includes(home_p.lineup_player) ? "★".repeat(assist_h_count):"";
      let assist_a = this.assist_a && away_p && this.assist_a.includes(away_p.lineup_player) ? "★".repeat(assist_a_count):"";
      
      let subout_h = this.sub_out["home"] && away_p && this.sub_out["home"].includes(home_p.lineup_player) ? "↕":"";
      let subout_a = this.sub_out["away"] && away_p && this.sub_out["away"].includes(away_p.lineup_player) ? "↕":"";
      

      const style_sub_h = home_p.lineup_number && home_p.lineup_number.indexOf && home_p.lineup_number.indexOf('"')>=0 ? this.state.dynamic_style.lineup2_number_subs : {};
      const style_sub_a = away_p.lineup_number && away_p.lineup_number.indexOf && away_p.lineup_number.indexOf('"')>=0 ? this.state.dynamic_style.lineup2_number_subs : {};
      /*
      if(home_p==undefined || !home_p){
        return null;
      }
      */
      const home_pl_tyle = home_p.lineup_player && this.state.favorite_p.includes(home_p.lineup_player) ? {backgroundColor: global_theme.fav_background} : {};
      const away_pl_tyle = away_p.lineup_player && this.state.favorite_p.includes(away_p.lineup_player) ? {backgroundColor: global_theme.fav_background} : {};
      return (
          <View style={this.state.dynamic_style.lineup2_container} key={home_p.lineup_number+home_p.lineup_player+away_p.lineup_player}>
            
            <Text style={[this.state.dynamic_style.lineup2_number,style_sub_a,away_pl_tyle]}>{away_p && away_p.lineup_number? away_p.lineup_number : ""}</Text>
            <TouchableOpacity 
              delayLongPress={300}
              activeOpacity={0.7}
              onLongPress={()=>this.set_fav_p(away_p.lineup_player)}
              onPress={()=>this.get_player_info({player_id:away_p.player_key})}
              style={[this.state.dynamic_style.lineup2_lr_container ]}>
              <Text style={[i==0?this.state.dynamic_style.stats_frag_l_ :this.state.dynamic_style.lineup2_l, away_pl_tyle]} numberOfLines={1}>
                {away_p && away_p.lineup_player? subout_a+" "+ycards_a+" "+rcards_a+" "+scored_a+" "+assist_a+" "+away_p.lineup_player : ""}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              delayLongPress={300}
              activeOpacity={0.7}
              onLongPress={()=>this.set_fav_p(home_p.lineup_player)}
              onPress={()=>this.get_player_info({player_id:home_p.player_key})}
              style={[this.state.dynamic_style.lineup2_lr_container]}>
              <Text style={[i==0?this.state.dynamic_style.stats_frag_r_ :this.state.dynamic_style.lineup2_r,home_pl_tyle]} numberOfLines={1}>
                {home_p && home_p.lineup_player? home_p.lineup_player+" "+assist_h+" "+scored_h+" "+rcards_h+" "+ycards_h+" "+subout_h : ""}
              </Text>
            </TouchableOpacity>
            <Text style={[this.state.dynamic_style.lineup2_number,style_sub_h,home_pl_tyle]}>{home_p && home_p.lineup_number? home_p.lineup_number : ""}</Text>
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
          <View style={this.state.dynamic_style.stats_container} key={row?row.type+"":"-"}>
            <Text style={i==0?this.state.dynamic_style.stats_frag_l_ :this.state.dynamic_style.stats_frag_l}>{row ? row.away : ""}</Text>
            <Text style={i==0?this.state.dynamic_style.stats_frag_m_ :this.state.dynamic_style.stats_frag_m}>{row ? row.type : "-"}</Text>
            <Text style={i==0?this.state.dynamic_style.stats_frag_r_ :this.state.dynamic_style.stats_frag_r}>{row ? row.home : ""}</Text>
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

    let style_class = type_=="home"? this.state.dynamic_style.match_results_team_name_r : this.state.dynamic_style.match_results_team_name_l ;
    if(this.state.matche_details.goal_scorer){
      this.state.matche_details.goal_scorer = this.state.matche_details.goal_scorer.sort((a,b)=>{
        return a.time<b.time?-1:1
      });
      let res = this.state.matche_details.goal_scorer.map(elm=>{
        if(elm[type_+"_scorer"]==undefined || elm[type_+"_scorer"]=="" || elm[type_+"_scorer"]==null) return false;
        let text = "";
        if(type_=="away"){
          if(API_.is_ascii(elm[type_+"_scorer"]) == false){
            text = this.symbol_goal + " " +(elm.time ? elm.time+'"' : "-") +" "+ elm[type_+"_scorer"];
          }else{
            text = elm[type_+"_scorer"]+" "+(elm.time ? elm.time+'"' : "-") +" "+this.symbol_goal;
          }
          this.scorers_a.push(elm[type_+"_scorer"]);
          this.assist_a.push(elm[type_+"_assist"]);
          
        }else{
          if(API_.is_ascii(elm[type_+"_scorer"]) == false){
            text = elm[type_+"_scorer"] +" "+(elm.time ? elm.time+'"' : "-") +" "+this.symbol_goal;
          }else{
            text = this.symbol_goal + " " +(elm.time ? elm.time+'"' : "-") +" " +elm[type_+"_scorer"];
          }
          this.scorers_h.push(elm[type_+"_scorer"]);
          this.assist_h.push(elm[type_+"_assist"]);
        }
        return <Text style={[style_class,this.state.dynamic_style.match_results_scorer_text]} key={text}>{text}</Text>;
      });
      return(
          <View style={[style_class]}>
            {res ? res :null}
          </View>
      );
    }
  }

  get_cards(type_="home"){
    if(type_=="home"){
      this.ycards_h =[];
      this.rcards_h =[];
    }else{
      this.ycards_a =[];
      this.rcards_a =[];
    }
    let style_class = type_=="home"? this.state.dynamic_style.match_results_team_name_r : this.state.dynamic_style.match_results_team_name_l ;
    if(this.state.matche_details.cards){
      this.state.matche_details.cards = this.state.matche_details.cards.sort((a,b)=>{
        return a.time<b.time?-1:1
      });
      let res = this.state.matche_details.cards.map(elm=>{
        const __key = type_+"_card";
        if(elm[__key]==undefined || elm[__key]=="" || elm[__key]==null) return false;
        let text = "";
        const card_type = elm.type=="r" ? this.symbol_redcard : this.symbol_yallowcard ;
        if(type_=="away"){
          if(API_.is_ascii(elm[__key]) == false){
            text = card_type + " " + (elm.time ? elm.time+'"' : "-") +" "+ elm[__key];
          }else{
            text = elm[__key]+" "+(elm.time ? elm.time+'"' : "-") + " " + card_type;
          }
          if(elm.type=="r"){
            this.rcards_a.push(elm[__key]);
          }else{
            this.ycards_a.push(elm[__key]);
          }
          
          
        }else{
          if(API_.is_ascii(elm[__key]) == false){
            text = elm[__key] +" "+(elm.time ? elm.time+'"' : "-") + " " + card_type;
          }else{
            text = card_type + " " + (elm.time ? elm.time+'"' : "-") +" " +elm[__key];
          }
          if(elm.type=="r"){
            this.rcards_h.push(elm[__key]);
          }else{
            this.ycards_h.push(elm[__key]);
          }
        }
        return <Text style={[style_class,this.state.dynamic_style.match_results_scorer_text]} key={text}>{text}</Text>;
      });
      return(
          <View style={[style_class]}>
            {res ? res :null}
          </View>
      );
    }
  }
  
  render() {
    if (this.state.matche_details == undefined ||this.state.matche_details.id ==undefined){
      return <Loading/>;
    }
    let home_sc="";
    let away_sc="";
    let home_style=this.state.dynamic_style.match_results_drawer;
    let away_style =this.state.dynamic_style.match_results_drawer;
    let scores_home = this.get_scores("home");
    let scores_away = this.get_scores("away");

    let cards_home = this.get_cards("home");
    let cards_away = this.get_cards("away");
    
    try{
      home_sc = this.state.matche_details.home_team_score && this.state.matche_details.home_team_score!="-" ? parseInt(this.state.matche_details.home_team_score) : "-";
      away_sc = this.state.matche_details.away_team_score && this.state.matche_details.away_team_score!="-" ? parseInt(this.state.matche_details.away_team_score) : "-";
      if( (this.state.matche_details.home_team_status==undefined && home_sc>away_sc) || (this.state.matche_details.home_team_status && this.state.matche_details.home_team_status=="w") ){
        home_style = this.state.dynamic_style.match_results_winer;
      }else if( (this.state.matche_details.home_team_status==undefined && home_sc==away_sc) || (this.state.matche_details.home_team_status && this.state.matche_details.home_team_status=="d") ){
        home_style = this.state.dynamic_style.match_results_drawer;
      }else if( (this.state.matche_details.home_team_status==undefined && home_sc<away_sc) || (this.state.matche_details.home_team_status && this.state.matche_details.home_team_status=="l") ){
        home_style = this.state.dynamic_style.match_results_loser;
      }
      if( (this.state.matche_details.away_team_status==undefined && home_sc<away_sc) || (this.state.matche_details.away_team_status && this.state.matche_details.away_team_status=="w") ){
        away_style = this.state.dynamic_style.match_results_winer;
      }else if( (this.state.matche_details.away_team_status==undefined && home_sc==away_sc) || (this.state.matche_details.away_team_status && this.state.matche_details.away_team_status=="d") ){
        away_style = this.state.dynamic_style.match_results_drawer;
      }else if( (this.state.matche_details.away_team_status==undefined && home_sc>away_sc) || (this.state.matche_details.away_team_status && this.state.matche_details.away_team_status=="l") ){
        away_style = this.state.dynamic_style.match_results_loser;
      }
    }catch(e){
      return <View style={this.state.dynamic_style.container}><Text>ERR</Text></View>;
      }

      { this.state.matche_details.home_team_score_penalties==undefined ? null : 
        <View style={this.state.dynamic_style.matche_team_score_penalties}>
          <Text style={this.state.dynamic_style.matche_team_score_text_penalties} noFonts={true}>{this.state.matche_details.home_team_score_penalties ? this.state.matche_details.home_team_score_penalties : "-"}</Text>
          <Text style={this.state.dynamic_style.matche_team_score_text_penalties} noFonts={true}>{this.state.matche_details.away_team_score_penalties ? this.state.matche_details.away_team_score_penalties : "-"}</Text>
        </View>
      }
      const fav_style_h = this.state.favorite_t.includes(this.state.matche_details.home_team_id ) ? {backgroundColor: global_theme.fav_background} : {};
      const fav_style_a = this.state.favorite_t.includes(this.state.matche_details.away_team_id ) ? {backgroundColor: global_theme.fav_background} : {};
      const away_logo = this.state.matche_details.away_team_badge ? this.state.matche_details.away_team_badge : this.state.matche_details.away_team_logo;
      const home_logo = this.state.matche_details.home_team_badge ? this.state.matche_details.home_team_badge : this.state.matche_details.home_team_logo;
      const live_style = this.state.matche_details.live ? {"borderColor":global_theme.live_borderColor,"borderWidth":2}:{};
    return (
      <ScrollView style={this.state.dynamic_style.container}
      refreshControl={
        <RefreshControl
          refreshing={this.state.loading}
          onRefresh={()=>this.get_Match(this.id)}
        />}
      >
        <TouchableOpacity 
          style={[this.state.dynamic_style.header_container,live_style]} 
          onPress={()=>this.setState({show_res : this.state.show_res?false:true})}
          activeOpacity={0.7}
          >              
          <View style={[away_style]}>
            <Image style={{height:100,width:"95%",justifyContent: "center",resizeMode:"contain"}} source={{uri: away_logo}} ></Image>
            <View styles={{flex:1,}}>
              <TouchableHighlight 
                activeOpacity={0.4}
                style={[this.state.dynamic_style.match_results_team_name,fav_style_a]} 
                onPress={() => { if (this.state.matche_details.away_team_id)this.setState({modalVisible_team:true,team_id:this.state.matche_details.away_team_id}) } }
                onLongPress={()=>this.set_fav_team(this.state.matche_details.away_team_id,this.away_team_ar)}
                delayLongPress={300}
              ><Text style={this.state.dynamic_style.match_results_team_name} numberOfLines={1}> {this.away_team_ar}</Text>
            </TouchableHighlight>

              <Text style={[this.state.dynamic_style.match_results_team_scor_t]}>{away_sc}</Text>
              { this.state.matche_details.home_team_score_penalties==undefined ? null :
                <Text style={this.state.dynamic_style.match_results_team_scor_penalties_t} noFonts={true}>{this.state.matche_details.away_team_score_penalties ? this.state.matche_details.away_team_score_penalties : "-"}</Text>
                 }
            </View>
            { this.state.show_res ?
            <View style={{}}>
              {scores_away}
              {cards_away}
            </View>
            :null}
          </View>

          <View style={[this.state.dynamic_style.match_results_team_name_r,home_style]}>
            <Icon  name={"home"}  size={28}  color={global_theme.list_header_backgroundColor} style={{position:"absolute",right:5}} />
            <Image style={{height:100,width:"95%",resizeMode:"contain"}} source={{uri: home_logo}} ></Image>
            <View styles={[this.state.dynamic_style.match_results_team_name_r,{flex:1}]}>
              <TouchableHighlight 
                activeOpacity={0.4}
                style={[this.state.dynamic_style.match_results_team_name,fav_style_h]} 
                onPress={() => { if (this.state.matche_details.home_team_id)this.setState({modalVisible_team:true,team_id:this.state.matche_details.home_team_id}) } }
                onLongPress={()=>this.set_fav_team(this.state.matche_details.home_team_id,this.home_team_ar)}
                delayLongPress={300}
              ><Text style={this.state.dynamic_style.match_results_team_name} numberOfLines={1}> {this.home_team_ar}</Text>
            </TouchableHighlight>
              <Text style={[this.state.dynamic_style.match_results_team_scor_t]}>{home_sc}</Text>
              { this.state.matche_details.home_team_score_penalties==undefined ? null : 
                <Text style={this.state.dynamic_style.match_results_team_scor_penalties_t} noFonts={true}>{this.state.matche_details.home_team_score_penalties ? this.state.matche_details.home_team_score_penalties : "-"}</Text>
                 }
            </View>
            { this.state.show_res ?
            <View style={{}}>
              {scores_home}

              {cards_home}
            </View>
            :null}
          </View>
        </TouchableOpacity>
        
        <View style={this.state.dynamic_style.tabs_list}>
          <View style={{flex:1,marginHorizontal:1}}><Button title="General" onPress={()=>this.setState({visible_tab:"general"})} /></View>
          <View style={{flex:1,marginHorizontal:1}}><Button title="News" onPress={()=>{
              this.props.navigation.push('News', {news_id:"n=0&o=n5"+this.id , title:this.league_name})
            }}/></View>
          <View style={{flex:1,marginHorizontal:1}}><Button title="Line-up" onPress={()=>{
            this.setState({visible_tab:"lineup2",loading:true});
            if(this.state.matche_details.details && this.state.matche_details.home_lineup==undefined){
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
          <View style={{flex:1,marginHorizontal:1}}><Button title="League" onPress={()=>{
            const league_img = this.state.matche_details.league_badge ? API_.domain_o+this.state.matche_details.league_badge.path : null ;
            this.props.navigation.navigate('League', { league_details: {id:this.state.matche_details.league_id,league:this.state.matche_details.league,league_img: league_img} });
          }
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
        { this.state.modalVisible_player==true ?
        <Player       
          modal_visible={this.state.modalVisible_player}
          dynamic_style={this.state.dynamic_style}
          player_id = {this.state.player_id}
          navigation={this.props.navigation}
          closeModal={()=>{
          this.setState({modalVisible_player:false})}}></Player>

          : null }
        { this.state.modalVisible_team==true ?
        <Team       
          modal_visible={this.state.modalVisible_team}
          team_id = {this.state.team_id}
          get_player_info={this.get_player_info}
          set_fav_p={this.set_fav_p}
          favorite_p={this.state.favorite_p}
          league_name={this.league_name}
          league_id={this.real_id}
          navigation={this.props.navigation}
          closeModal={()=>{this.setState({modalVisible_team:false})/*;this.load_logos();*/}}></Team>
          : null }
      </ScrollView>
    );
  }
}

export default Matchcreen;
