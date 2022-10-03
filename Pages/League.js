import React from "react";
import { View, Button, Picker, TouchableOpacity, Image, ScrollView, ImageBackground} from 'react-native';
import ItemsList from '../components/list';
import Loading from '../components/Loader';
import {styles_league,getTheme,global_theme} from "../components/Themes";
import {onMatch_LongPressed,get_notifications_matches} from "../Libs/localNotif";
import Player from "../components/Player";
import Team from "../components/Team";
import IconButton from "../components/IconButton";

let list = [

          ];
class LeagueScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        list:list,
        modalVisible_match:false,
        player_type:1,
        key_:"en_name",
        channel:null,
        league_details:[],
        visible_tab : "standing",
        loading:true,
        show_res:false,
        height:"100%",
        dynamic_style:styles_league,
        notifications_matches:{},
        scorers:[],
        favorite:[],
        favorite_p:[],
        modalVisible_player:false,
        player:false,
        matches_only_fav:false,
        modalVisible_team : false,
        c_years:[],
        c_stages:[],
        c_stage:1,
    };
    this.league_name = this.props.route.params.league_details && this.props.route.params.league_details.league ? this.props.route.params.league_details.league : "-";
    this.league_img   = this.props.route.params.league_details && this.props.route.params.league_details.league_img ? this.props.route.params.league_details.league_img : "";
    this.real_id = this.props.route.params.league_details && this.props.route.params.league_details.id?this.props.route.params.league_details.id:this.props.route.params.id;
    this.league_id = this.real_id;
    //this.league_img = API_.leagueLogo_byTitle(this.league_name,this.league_img);
    if(API_.leagues_dict[this.league_name] && API_.leagues_dict[this.league_name].koora_id && api_type == 1){
      this.real_id = API_.leagues_dict[this.league_name].koora_id;
    }
    this.c_years=null;
    this.c_stages=null;
    this.set_cc();
    //https://imad.is-a.dev/imad_404/cc/png250px/ma.png
  }
  set_cc=()=>{
    this.league_img_origin = this.league_img+"";
    if(this.league_img && this.league_img!="" && this.league_img.includes('/f/')){
      const cc_name =this.league_img.split("/").pop().toLowerCase();
      this.league_img = `${API_.server_url}/cc/png250px/${cc_name}`;
    }
  }
  componentDidMount(){
    this.is_k = true;
    this._isMounted = true;
    getTheme("styles_league").then(theme=>this.setState({dynamic_style:theme}));
    this.props.navigation.setOptions({title: <Text>{this.league_name}</Text>});
    this.get_standing_k(this.league_id);
    API_.setTitleWeb(this.league_name);
    this.render_header();
  }
  async componentWillUnmount(){
    this._isMounted = false;
  }
  async get_standing(id){
    this.is_k = false;
    if(this.real_id!=this.league_id && this.real_id!=undefined){
      this.is_k = true;
      return this.get_standing_k();
    }
    const favorite = await API_.getConfig("favorite_teams",this.state.favorite);
    const resp = await API_.get_standing(id);
    if(resp["data"] && resp["data"] ){
      this.setState({league_details:resp["data"],loading:false,favorite:favorite});
    }

    
  }
  async get_standing_k(){
    const favorite = await API_.getConfig("favorite_teams_k",this.state.favorite) ;
    let resp = await API_.get_standing_k(this.real_id);
    resp = await API_.set_logos_standing(resp);
    if(resp.length == 0){
      this.showMatchesTab();
    }
    this.setState({league_details:resp,loading:false,favorite:favorite});
    API_.setTitleWeb(this.league_name);
    API_.get_league_options(this.real_id).then(opts=>{
      let current_position = 0;
      if(opts && opts.stages && opts.stages){
        opts.stages.map(r => {
          if(r[1]=="p"){
            current_position = r[0];
          }
        });
      }

      this.setState({c_years:opts.years , c_stages:opts.stages , c_stage:current_position});
    });
  }
  get_matches(league_id){
      return this.get_matches_k();
  }
  get_matches_k = async()=>{
    this.setState({loading:true});
    let matches = {};
    const _notifications_matches = await get_notifications_matches();
    let resp = await API_.get_matches_league_k(this.real_id, this.state.c_stage);

    let data = resp && resp.length>0 ? resp : [];
    let header = {};
    try {
      header = JSON.parse(JSON.stringify(data[0])) ;
    } catch (error) {}
    header["data"] = [];
    data["data"];
    try{
      //let _data = data[0]["data"].map
      data = data && data.length>0 && data[0]["data"] ? data[0]["data"] : [];
      data = data.map(row =>{
        const stage_name = row && row.stage && row.stage.name ? row.stage.name : false;
        const date_str = row.date;
        let dayname = "";
        try {
          dayname = API_.days[API_.convert_time_o(date_str+" 00:00").getDay()]
        } catch (error) {
          
        }
        if(
          this.state.matches_only_fav==true && 
          !this.state.favorite.includes(row.home_team_id) && 
          !this.state.favorite.includes(row.away_team_id)  ){
            return;
        }
        if(matches[date_str] == undefined){
          matches[date_str] = JSON.parse(JSON.stringify(header));
          matches[date_str].title = date_str+" /"+dayname ;
          if(stage_name){
            matches[date_str].title += ` - [${stage_name}]`;
          }
        }
        matches[date_str].data.push(row);

      });
    }catch(e){console.log(e)}
    matches = Object.values(matches) ? Object.values(matches) : [];
    matches = await API_.set_logos(matches);
    if(this._isMounted){
      this.setState({matches:matches,loading:false,visible_tab:"matches",notifications_matches:_notifications_matches});
    }
  }
  
  onMatch_clicked =(item)=>{

    this.props.navigation.push('Match', { match_item: item,id:item.id });
  }
  _onMatch_LongPressed=(item)=>{
    onMatch_LongPressed(item).then(o=>{
      get_notifications_matches().then(o=>this.setState({notifications_matches:o}) );
    });
  }
  render_matches(){
    return <>{this.c_stages}<ItemsList 
          favorite_teams={this.state.favorite}
          loading={this.state.loading} list={this.state.matches} 
          onclick={this.onMatch_clicked}
          onLongPress={this._onMatch_LongPressed}
          key_="home_team" key_key="id"  /></>;
  }
  set_fav_p= async(player_name)=>{
    let favorite_p = await API_.getConfig("favorite_players",this.state.favorite_p);
    let msg_action = "";
    if( favorite_p.includes(player_name) ){
      favorite_p = favorite_p.filter(o=>{if(o!=player_name)return o;});
      msg_action = "تمت إزالته من";
    }else{
      favorite_p.push(player_name);
      msg_action = "تمت إضافته إلى";
    }
    this.setState({favorite_p:favorite_p});
    API_.setConfig("favorite_players",favorite_p);
    API_.showMsg(`اللاعب ٭${player_name}٭ ${msg_action} المفضلة!`);
    this.setState({});
    return favorite_p;
  }
  get_player_info=(player)=>{
    this.setState({modalVisible_player:true,player_id:player.player_id});
  }
  render_scorers(){
    if(this.state.league_details==undefined || this.state.scorers.length==0){
      return null;
    }
    const scorers = [{"player_name_ar":"Player name","player_id":1,"team_badge":"","overall_league_payed":"","goals":"Gls"}].concat(this.state.scorers);
    return scorers.map(p=>{
        const p_name = p && p.player_name_ar ? p.player_name_ar : p.player_name_en ;
        const p_img = p && p.team_badge && p.team_badge!="" ? p.team_badge : false;
        const fav_style = this.state.favorite_p.includes(p_name) ? {backgroundColor: global_theme.fav_background} : {};
        return  <TouchableOpacity  
                  key={p_name}
                  style={[this.state.dynamic_style.team_view,fav_style]} key={p.player_id+p_name}
                  delayLongPress={300}
                  activeOpacity={0.7}
                  onLongPress={()=>this.set_fav_p(p_name)}
                  onPress={()=>this.get_player_info(p)}
                  >
          
          <View style={{flex:1,padding:2}} >
            {p_img!=false ? <Image style={{height:"95%",width:"95%"}} source={{uri: p_img}} /> : null}
          </View>
          
          <View style={{flex:7}}><Text style={this.state.dynamic_style.team_name_t}>{p_name}</Text></View>
          <View style={{flex:1}}><Text style={this.state.dynamic_style.team_name_t}>{""}</Text></View>
          <View style={{flex:1}}><Text style={this.state.dynamic_style.team_name_t}>{p.goals}</Text></View>
        </TouchableOpacity>;
      });
  }
  get_fav_icon(id,bool=false){
    id= parseInt(id);
    if(id<=0){return "";}
    if(bool==false){
      return this.state.favorite.includes(id ) ? "★" : "☆" ;
    }else{
      return this.state.favorite.includes(id ) ? true : false ;
    }
  }
  set_fav=async(id,team_name)=>{
    id= parseInt(id);
    let msg_action = "";
    if(id==0){return "";}
    const localS_fav_key = this.is_k ? "favorite_teams_k" : "favorite_teams";
    let o = await API_.getConfig(localS_fav_key,this.state.favorite)
    if( o.includes(id) ){
      o = o.filter(o=>{if(o!=id)return o;});
      msg_action = "تمت إزالته من";
    }else{
      o.push(id);
      msg_action = "تمت إضافته إلى";
    }
    this.setState({favorite:o});
    await API_.setConfig(localS_fav_key,o);
    this.setState({});
    API_.showMsg(`الفريق ٭${team_name}٭ ${msg_action} المفضلة!`);
  }
  render_standing(){
    if(this.state.league_details==undefined || this.state.league_details.length==0){
      return null;
    }
    let standing_count = 0;
    this.table_x = [];
    let standing_ = [this.c_years];
    let standing_before = {"":this.state.league_details};
    if(Object.keys(this.state.league_details[0]).length==1){
      standing_before = this.state.league_details.slice();
    }
    standing_before.sort? standing_before.sort((a,b)=> (Object.keys(a)[0] > Object.keys(b)[0]) ? 1 : -1  ) : null;
    const copy_check = standing_before[""] && standing_before[""].length>0 ? standing_before[""] : Object.values(standing_before);
    copy_check.map(row=>{ 
      if(row.table_r){
        if(row.background_8 && row.desc_8)this.table_x[row.background_8] = row.desc_8;
        if(row.background_7 && row.desc_7)this.table_x[row.background_7] = row.desc_7;
        if(row.background_6 && row.desc_6)this.table_x[row.background_6] = row.desc_6;
        if(row.background_5 && row.desc_5)this.table_x[row.background_5] = row.desc_5;
        if(row.background_4 && row.desc_4)this.table_x[row.background_4] = row.desc_4;
        if(row.background_3 && row.desc_3)this.table_x[row.background_3] = row.desc_3;
        if(row.background_2 && row.desc_2)this.table_x[row.background_2] = row.desc_2;
        if(row.background_1 && row.desc_1)this.table_x[row.background_1] = row.desc_1;

        return false;
      }
      return true;});

    for(let index in standing_before){
      let rows = standing_before[index];
      if(index!=""){
        let key = Object.keys(rows)[0];
        rows = rows[key].slice();
        if(rows=="x"){
          continue;
        }
        standing_ = standing_.concat(<View style={{flex:1,alignItems:"center"}} key={key}><Text style={this.state.dynamic_style.group_name_t}>{key}</Text></View>);
      }
      standing_count += rows && rows.filter ? rows.filter(r=>r.table_r=='r').length : 0;
      rows = [{"team_name":"Team name","team_badge":"","overall_league_payed":"Pld","overall_league_PTS":"Pts","goals":"Gls","id":"h_"+index}].concat(rows);
      standing_ = standing_.concat( rows.map(row=>{
        
        if(row.table_r=="x"){
          return null;
        }
        
        const fav_icon = row.team ? this.get_fav_icon(row.team.id) : "";
        let team_name ="";
        if(row && row.team_name){
          team_name = API_.is_ascii(row.team_name) ? fav_icon+row.team_name : row.team_name+fav_icon ;
        }
        const team_badge= row && row.team_badge ? row.team_badge : "";
        const position  = row && row.overall_league_position ? row.overall_league_position : "0";
        const points    = row && row.overall_league_PTS ? row.overall_league_PTS : "0";
        const played    = row && row.overall_league_payed ? row.overall_league_payed : "0";
        let goals     = row && row.overall_league_GF>=0 ? row.overall_league_GF : 0 ;
        goals = row && row.overall_league_GA ? goals-row.overall_league_GA : goals;
        goals = row && row.goals=="Gls" ? row.goals : goals;
        let fav_style = row.team && this.get_fav_icon(row.team.id, true) ? {backgroundColor: global_theme.fav_background} : {};
        let cc_flag = row && row.c_code && row.c_code.split("~").length>=2 ? row.c_code.split("~")[2] : false;
        if (Object.keys(fav_style).length==0 && row.backgroundColor){
          fav_style = {backgroundColor:row.backgroundColor}
        }
        cc_flag = cc_flag ? API_.get_cc_img(cc_flag) : null;
        cc_flag = cc_flag!=null && cc_flag != team_badge ? cc_flag  : null;
        return (
        <TouchableOpacity 
          activeOpacity={0.7}
          style={[this.state.dynamic_style.team_view,fav_style]} 
          key={team_name+row.id}
          onPress={() => { if (row && row.team && row.team.id)this.setState({modalVisible_team:true,team_id:row.team.id}) } }
          delayLongPress={300}
          onLongPress={()=>this.set_fav(row.team ? row.team.id : -1, team_name)}
          >
          <View style={{flex:1,padding:2}} >
            <Image style={{height:"95%",width:"95%"}} source={{uri: team_badge}} />
          </View>
          <View style={{flex:6}}><Text style={this.state.dynamic_style.team_name_t} numberOfLines={1}>{team_name}</Text></View>
          {cc_flag!=false && cc_flag!=null ? 
          <View style={{flex:1,padding:1}} >
            <Image style={{height:"95%",width:"95%"}} source={{uri: cc_flag}} />
          </View> : null }
          <View style={{flex:1}}><Text style={this.state.dynamic_style.team_name_t}>{played}</Text></View>
          <View style={{flex:1}}><Text style={this.state.dynamic_style.team_name_t}>{goals}</Text></View>
          <View style={{flex:1}}><Text style={this.state.dynamic_style.team_name_t}>{points}</Text></View>
        </TouchableOpacity>);
      }) );
    }

    if(this.table_x && Object.keys(this.table_x).length>0){
      standing_.push(<View key="separator_1"style={{flex:1,marginVertical:10}}></View>);
      for(let backg of Object.keys(this.table_x)){
        standing_.push(<View 
          activeOpacity={0.7}
          style={[this.state.dynamic_style.team_view,{backgroundColor:backg,marginVertical:2}]} 
          key={backg}
          onPress={() => { if (row && row.team && row.team.id)this.setState({modalVisible_team:true,team_id:row.team.id}) } }
          delayLongPress={300}
          >
          <View style={{flex:6}}><Text style={{paddingHorizontal:20}} numberOfLines={1}>{this.table_x[backg]}</Text></View>
        </View>);
      }
    }
    standing_.push(<Text style={[{flex:1},this.state.dynamic_style.team_name_t]}>Teams Count : {standing_count}</Text>);
    return standing_;
  }
  onmt_clicked(item){
    this.props.navigation.navigate('Channel', { channel_id: item.id,channel_photo:item.channel_photo });
  }

  showMatchesTab=()=>{
      if(this.state.visible_tab == "matches"){
        this.state.matches_only_fav = !this.state.matches_only_fav;
        this.state.matches = undefined;
      }
      if(this.state.matches == undefined){
        this.setState({loading : true, matches:[]});
        this.get_matches();
      }else{
        this.setState({visible_tab:"matches"});
      }
  }
  changesource = (itemValue, itemIndex)=>{
    this.real_id = itemValue;
    this.league_id = itemValue ;
    this.state.page=1;
    this.state.matches = undefined;
    //this.get_standing_k();
    if(API_.isWeb){
      this.props.navigation.push('League',
        { 
          id:this.real_id,
          league_details: {league:this.league_name,league_img:this.league_img,id:this.real_id,koora_id:true} 
      });
    }else{
      this.get_standing_k();
      this.get_matches_k();
    }
  }
  changesource_stage = (itemValue, itemIndex)=>{

    this.setState({c_stage:itemValue, matches:[]})
    this.get_matches_k();
  }
  render_header=()=>{
    this.props.navigation.setOptions({
        "headerRight": ()=>(
          <View style={{flexDirection:"row",margin:5}}>
            <IconButton 
            name={API_.hidden_leagues.includes(this.league_id)  ? "check-circle" : "ban" }
            onPress={async()=>{
              if(API_.hidden_leagues.includes(this.league_id) ){
                await API_.remove_league_hiddenLeagues(this.league_id);
              }else{
                await API_.add_league_hiddenLeagues(this.league_id);
              }
              this.render_header();
            }}  
            />
          </View>
        )
      });
  }
  render() {
    
    const c_years_options = this.state.c_years.map(y=><Picker.Item label={y[1]} value={y[0]} key={`${y[0]}-${y[1]}`} />);
    const c_stages_options = this.state.c_stages.map(y=><Picker.Item label={y[2]} value={y[0]} key={`${y[0]}-${y[1]}`} />);
    this.c_years = <Picker
    selectedValue={this.real_id}
    style={{ height:API_.isWeb ? 50 : 75,backgroundColor:"#2d3436",color:"#dfe6e9" ,width:150}}
    itemStyle={{height:API_.isWeb ? 40 : 70,backgroundColor:"#2d3436",color:"#dfe6e9" }}
    onValueChange={this.changesource}
  >
    {c_years_options}
</Picker> ;

    this.c_stages = <Picker
    selectedValue={this.state.c_stage}
    style={{ height:API_.isWeb ? 50 : 75,backgroundColor:"#2d3436",color:"#dfe6e9" ,width:150}}
    itemStyle={{height:API_.isWeb ? 40 : 70,backgroundColor:"#2d3436",color:"#dfe6e9" }}
    onValueChange={this.changesource_stage}
  >
    {c_stages_options}
</Picker> ;
    return (
      <ScrollView style={this.state.dynamic_style.container}>
        { this.league_img ?  
        <View style={this.state.dynamic_style.channel_logo_v}>
            <ImageBackground style={{flex:1,width:"100%"}} source={{uri: this.league_img}} onError={()=>{
              if(this.league_img != this.league_img_origin && this.league_img && this.league_img!=""){
                this.league_img = this.league_img_origin;
                this.setState({});
              }
            }}>
              <View style={this.state.dynamic_style.news_img_v}></View>
              <View style={this.state.dynamic_style.news_title_v}>
                <Text style={this.state.dynamic_style.news_title_t} numberOfLines={1}>{this.league_name}</Text>
              </View>
            </ImageBackground>
        </View> 
        : null}

        <View style={this.state.dynamic_style.tabs_list}>
          <View style={{flex:1,marginHorizontal:1}}><Button title="Standing" onPress={()=>this.setState({visible_tab:"standing",matches_only_fav:false})}/></View>
          <View style={{flex:1,marginHorizontal:1}}><Button title="News" onPress={()=>{
              this.props.navigation.push('News', {news_id:"n=0&o=n"+this.league_id , title:this.league_name})
            }}/></View>
          <View style={{flex:1,marginHorizontal:1}}><Button title="Scorers"  onPress={async()=>{
            if(this.state.scorers == undefined || this.state.scorers.length==0 ){
              this.setState({loading : true,});
              const favorite_p = await API_.getConfig("favorite_players",this.state.favorite_p);
              const scorers = await API_.get_scorers(this.real_id);
              this.setState({scorers:scorers,loading : false, favorite_p:favorite_p})
            }
            this.setState({visible_tab:"scorers",matches_only_fav:false});}}/></View>
          <View style={{flex:1,marginHorizontal:1}}><Button title="Matches" onPress={this.showMatchesTab}/></View>
        </View>
        {this.state.loading ? <Loading /> : 
          <View style={this.state.dynamic_style.container}>
            { this.state.league_details!={} && this.state.visible_tab=="standing" ? this.render_standing() : null}
            { this.state.league_details!={} && this.state.visible_tab=="matches" ? this.render_matches() : null}
            { this.state.league_details!={} && this.state.visible_tab=="scorers" ? this.render_scorers() : null}
          </View>
        }
        {
          this.state.modalVisible_player==true ? 
        <Player       
          modal_visible={this.state.modalVisible_player}
          dynamic_style={this.state.dynamic_style}
          player_id = {this.state.player_id}
          closeModal={()=>{
          this.setState({modalVisible_player:false})}}></Player>

          : null }
        {
          this.state.modalVisible_team==true ? 
        <Team       
          modal_visible={this.state.modalVisible_team}
          dynamic_style={this.state.dynamic_style}
          team_id = {this.state.team_id}
          get_player_info={this.get_player_info}
          set_fav_p={this.set_fav_p}
          favorite_p={this.state.favorite_p}
          league_name={this.league_name}
          league_id={this.real_id}
          navigation={this.props.navigation}
          closeModal={()=>{this.setState({modalVisible_team:false})}}></Team>
          : null }

      </ScrollView>
    );
  }
}

export default LeagueScreen;
