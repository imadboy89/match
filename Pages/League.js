import React from "react";
import { View, StyleSheet, Modal, Button, Linking, Picker, TouchableOpacity, Image, ScrollView, Dimensions, ImageBackground} from 'react-native';
import Constants from 'expo-constants';
import ItemsList from '../components/list';
import ReactHlsPlayer from "react-hls-player";
import Video from 'expo';
import Loading from '../components/Loader';
import {styles_league,getTheme} from "../components/Themes";
import {onMatch_LongPressed,get_notifications_matches} from "../Libs/localNotif";

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
        scorers:[]
    };
    this.league_name = this.props.route.params.league_details.league;
    this.league_img   = this.props.route.params.league_details.league_img;
    this.real_id = this.props.route.params.league_details.id;
    this.league_id = API_.leagueId_byTitle(this.league_name)>0 ? API_.leagueId_byTitle(this.league_name) : 0;
    //this.league_img = API_.leagueLogo_byTitle(this.league_name,this.league_img);
    this.get_standing(this.league_id);
  }
  componentDidMount(){
    getTheme("styles_league").then(theme=>this.setState({dynamic_style:theme}));
    this.props.navigation.setOptions({title: <Text>{this.league_name}</Text>});
  }
  get_standing(id){
      API_.get_standing(id).then(resp=>{
        if(resp["data"] && resp["data"] ){
          this.setState({league_details:resp["data"],loading:false});
        }
      });
  }
  get_matches(league_id){
      get_notifications_matches().then(o=>{
        this.setState({notifications_matches:o});
        });
      if(this.real_id!=this.league_id && this.real_id!=undefined){
        return this.get_matches_k();
      }
      API_.get_league_matches(this.league_id).then(resp=>{
      if(resp && resp["status"]=="true"){
        let list = [];
        let maches = {};
        let data = Object.keys(resp["data"]).map(k =>{
          let date_str = "";
          let img = resp["data"][k] && resp["data"][k].length>0 && resp["data"][k][0]["league_badge"] && resp["data"][k][0]["league_badge"]["path"] 
                    ? resp["data"][k][0]["league_badge"]["path"] : false;
          for(let i=0;i<resp["data"][k].length;i++){
            resp["data"][k][i].time = API_.convert_time(resp["data"][k][i].time);
            if(resp["data"][k][i].live){
              const played_time = API_.convert_time_spent(resp["data"][k][i].date + " "+resp["data"][k][i].time) ;
              resp["data"][k][i].time_played = played_time ? played_time : "";
              if(played_time==false || played_time<-10){
                resp["data"][k][i].live = 0;
              }
            }

            date_str = resp["data"][k][i].date;
            if( maches[date_str] == undefined){
              maches[date_str] = {title: date_str, data: [ resp["data"][k][i],] };
            }else{
              maches[date_str]["data"].push(resp["data"][k][i]);
            }
          }
          maches = Object.values(maches);
          maches = maches.sort((a,b)=> (a.title > b.title ? 1 : -1));
          return maches;
        });
        this.setState({matches:data[0],loading:false,visible_tab:"matches"});
        for(let i=0;i<data.length;i++){
          
        }
      }
    });
  }
  get_matches_k = ()=>{
    this.setState({loading:true});
    let matches = {};
    get_notifications_matches().then(_notifications_matches=>{
      API_.get_matches_league_k(this.real_id).then(resp=>{
        let data = resp && resp.length>0 ? resp : [];
        let header = JSON.parse(JSON.stringify(data[0])) ;
        header["data"] = [];
        data["data"];
        try{
          data = data[0]["data"].map(row =>{
            const date_str = row.date;
            if(matches[date_str] == undefined){
              matches[date_str] = JSON.parse(JSON.stringify(header));
              matches[date_str].title = date_str;
            }
            matches[date_str].data.push(row);

          });
        }catch(e){console.log(e)}
      matches = Object.values(matches) ? Object.values(matches) : [];
      this.setState({matches:matches,loading:false,visible_tab:"matches",notifications_matches:_notifications_matches});
      });
    });
  }
  
  onMatch_clicked =(item)=>{
    this.props.navigation.navigate('Match', { match_item: item });
  }
  _onMatch_LongPressed=(item)=>{
    onMatch_LongPressed(item).then(o=>{
      get_notifications_matches().then(o=>this.setState({notifications_matches:o}) );
    });
  }
  render_matches(){
    return <ItemsList 
          loading={this.state.loading} list={this.state.matches} 
          onclick={this.onMatch_clicked}
          onLongPress={this._onMatch_LongPressed}
          notifications_matches={this.state.notifications_matches}
          key_="home_team" key_key="id"  />;
  }
  render_scorers(){
    if(this.state.league_details==undefined || this.state.league_details.length==0 || this.state.scorers.length==0){
      return null;
    }
    const scorers = [{"player_name_ar":"Player name","team_badge":"","overall_league_payed":"","goals":"Gls"}].concat(this.state.scorers);
    return scorers.map(p=>{
        const p_name = p.player_name_ar ? p.player_name_ar : p.player_name_en ;
        const p_img = false;
        return <View style={this.state.dynamic_style.team_view}>
          
          <View style={{flex:1,padding:2}} >
            {p_img!=false ? <Image style={{height:"95%",width:"95%"}} source={{uri: team_badge}} /> : null}
          </View>
          
          <View style={{flex:7}}><Text style={this.state.dynamic_style.team_name_t}>{p_name}</Text></View>
          <View style={{flex:1}}><Text style={this.state.dynamic_style.team_name_t}>{""}</Text></View>
          <View style={{flex:1}}><Text style={this.state.dynamic_style.team_name_t}>{p.goals}</Text></View>
        </View>;
      });
  }
  render_standing(){
    if(this.state.league_details==undefined || this.state.league_details.length==0){
      return null;
    }
    let standing_ = [];
    let standing_before = {"":this.state.league_details};
    if(Object.keys(this.state.league_details[0]).length==1){
      standing_before = this.state.league_details;
    }
    standing_before.sort? standing_before.sort((a,b)=> (Object.keys(a)[0] > Object.keys(b)[0]) ? 1 : -1  ) : null;
    for(let index in standing_before){
      let row = standing_before[index];
      if(index!=""){
        let key = Object.keys(row)[0];
        row = row[key];
        standing_ = standing_.concat(<View style={{flex:1,alignItems:"center"}}><Text style={this.state.dynamic_style.group_name_t}>{key}</Text></View>);
      }
      row = [{"team_name":"Team name","team_badge":"","overall_league_payed":"Pld","overall_league_PTS":"Pts","goals":"Gls"}].concat(row);
      standing_ = standing_.concat( row.map(row=>{
        const team_name = row && row.team_name ? row.team_name : "";
        const team_badge= row && row.team_badge ? row.team_badge : "";
        const position  = row && row.overall_league_position ? row.overall_league_position : "0";
        const points    = row && row.overall_league_PTS ? row.overall_league_PTS : "0";
        const played    = row && row.overall_league_payed ? row.overall_league_payed : "0";
        let goals     = row && row.overall_league_GF>=0 ? row.overall_league_GF : 0 ;
        goals = row && row.overall_league_GA ? goals-row.overall_league_GA : goals;
        goals = row && row.goals=="Gls" ? row.goals : goals;
        return <View style={this.state.dynamic_style.team_view}>
          <View style={{flex:1,padding:2}} >
            <Image style={{height:"95%",width:"95%"}} source={{uri: team_badge}} />
          </View>
          <View style={{flex:6}}><Text style={this.state.dynamic_style.team_name_t}>{team_name}</Text></View>
          <View style={{flex:1}}><Text style={this.state.dynamic_style.team_name_t}>{played}</Text></View>
          <View style={{flex:1}}><Text style={this.state.dynamic_style.team_name_t}>{goals}</Text></View>
          <View style={{flex:1}}><Text style={this.state.dynamic_style.team_name_t}>{points}</Text></View>
        </View>;
      }) );
    }
    return standing_;
  }
  onmt_clicked(item){
    this.props.navigation.navigate('Channel', { channel_id: item.id,channel_photo:item.channel_photo });
  }


  render() {
  
    return (
      <ScrollView style={this.state.dynamic_style.container}>
        <View style={this.state.dynamic_style.channel_logo_v}>
          { this.league_img ?  
            <ImageBackground style={{flex:1,width:"100%"}} source={{uri: this.league_img}} >
            <View style={{flex:16}}></View>
              <View style={this.state.dynamic_style.news_title_v}><Text style={this.state.dynamic_style.news_title_t} numberOfLines={1}>{this.league_name}</Text></View>
            </ImageBackground>
          : null}
        </View> 

        <View style={this.state.dynamic_style.tabs_list}>
          <View style={{flex:1}}><Button title="Standing" onPress={()=>this.setState({visible_tab:"standing"})}/></View>
          <View style={{flex:1}}><Button title="Scorers"  onPress={()=>{
            if(this.state.scorers == undefined || this.state.scorers.length==0 ){
              this.setState({loading : true,});
              API_.get_scorers(this.real_id).then(o=>this.setState({scorers:o,loading : false}));
            }
            this.setState({visible_tab:"scorers"});}}/></View>
          {/*<View style={{flex:1}}><Button title="Statistics" onPress={()=>this.setState({visible_tab:"stats"}) }/></View> */}
          <View style={{flex:1}}><Button title="Matches" onPress={()=>{
            if(this.state.matches == undefined){
              this.setState({loading : true, matches:[]});
              this.get_matches();
            }else{
              this.setState({visible_tab:"matches"});
            }
            }}/></View>
          {/* <Button title="Line-up" onPress={()=>this.setState({visible_tab:"lineup"})}/> */}
        </View>
        {this.state.loading ? <Loading /> : 
          <View style={this.state.dynamic_style.container}>
            { this.state.league_details!={} && this.state.visible_tab=="standing" ? this.render_standing() : null}
            { this.state.league_details!={} && this.state.visible_tab=="matches" ? this.render_matches() : null}
            { this.state.league_details!={} && this.state.visible_tab=="scorers" ? this.render_scorers() : null}
          </View>
        }
      </ScrollView>
    );
  }
}

export default LeagueScreen;
