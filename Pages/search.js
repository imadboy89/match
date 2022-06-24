import React from "react";
import {  View, Dimensions, Modal, Button, Linking, ScrollView , RefreshControl, ActivityIndicator, TextInput} from 'react-native';
import {styles_settings,getTheme, themes_list} from "../components/Themes";
import ItemsList from '../components/list';
import Player from "../components/Player";
import Team from "../components/Team";

class SearchScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dynamic_style:styles_settings,
      list:[],
      query:"",
      modalVisible_player:false,
      modalVisible_team:false,
    };
  }
  componentDidMount(){
    let short_title = "Search" ;
    getTheme("styles_settings").then(theme=>this.setState({dynamic_style:theme})); 
  }
  componentWillUnmount(){
  }

 LoadingIndicatorView() {
    return <ActivityIndicator color='#009b88' size='large' />
  }
  search=async ()=>{
    this.setState({list:[], loading:true, });
    let res_teams = [];
    let res_players = [];
    let countries = {};
    const patttern  = new RegExp(`.*${this.state.query}.*`,"i");
    let teams = await backup.db_teams.find({$or:[{team_name_ar:patttern},{team_name_en:patttern}],team_class:{$in:["أساسي","سيدات"]}}).asArray();
    
    res_teams = teams.map(t=>{ 
      countries[t.team_flag] = t.team_country;
      const cc_flag = t.team_flag && t.team_flag!="" ? API_.get_cc_img(t.team_flag) : null;
      return {
        id         : t.team_id,
        name_ar    : t.team_name_ar + " - " + t.team_class,
        name_en    : t.team_name_en,
        country    : t.team_country,
        team_class : t.team_class,
        team_type  : t.team_type,
        team_logo  : t.team_logo,
        team_flag  : t.team_flag,
        cc_flag    : cc_flag,
        type       : "team"
      };
    });

    let res_players_teams = await backup.db_teams.find({ 
      $or: [ {squad_club: {$elemMatch:{4:patttern}}}, {squad_club: {$elemMatch:{5:patttern}}} ] 
      }).asArray();
    
    for(const _team of res_players_teams){
      for(const _player of _team.squad_club){
        if(_player[4].match(patttern) || _player[5].match(patttern)){
          countries[_player[7]] = _player[8];
          const cc_flag = _player[7] && _player[7]!="" ? API_.get_cc_img(_player[7]) : null;
          res_players.push({
            id      : _player[0],
            name_ar : _player[4],
            name_en : _player[5],
            cc      : _player[7],
            country : _player[8],
            cc_flag : cc_flag,
            type    : "player"
          });
        }

      }
    }
    const list = [];
    if(res_teams && res_teams.length>0){
      list.push({title:"Clubs",data:res_teams});
    }
    if(res_players && res_players.length>0){
      list.push({title:"Players",data:res_players});
    }
    
    this.setState({list:list, loading:false});
    //squad_club
  }
  get_player_info=(player)=>{
    this.setState({modalVisible_player:true,_player_id:player.player_id});
  }
  onItem_clicked=(item)=>{
    if(item==undefined || !item){
      return;
    }
    if(item.type == "player"){
      this.setState({modalVisible_player:true, _player_id:item.id});
    }else if(item.type == "team"){
      this.setState({modalVisible_team:true, _team_id:item.id});
    }
  }
  render() {
    const style= this.state.video && this.state.video.videoId ? {height:300,width:"100%",position:'absolute'} : {width:1,height:1};
    return (
      <ScrollView  style={this.state.dynamic_style.container} keyboardShouldPersistTaps={'handled'}>
          <View style={[this.state.dynamic_style.settings_row,{padding:10}]}>
            <View style={{flex:4}}>
              <TextInput
                    style={{height:"100%",backgroundColor:"grey",paddingHorizontal:10}}
                    placeholder={"Search"}
                    placeholderTextColor="#ecf0f1"
                    onChangeText ={newValue=>{
                        this.setState({query:newValue.toLowerCase()});
                    }}
                    value={this.state.query}
                    autoCorrect={true}
                />
              </View>
              <View style={{flex:1}}>
              <Button
                title={"Go"}
                color={"#f39c12"}
                onPress={()=>{
                  this.search();
                }}
              ></Button>
            </View>
          </View>

          <ItemsList 
            refreshControl={<RefreshControl progressViewOffset={200} refreshing={this.state.loading}  /> } 
            loading={this.state.loading} 
            list={this.state.list} 
            onclick={this.onItem_clicked}
            key_="name_ar" 
            key_key="id"
          />

        { this.state.modalVisible_player==true ?
          <Player       
          modal_visible={this.state.modalVisible_player}
          player_id = {this.state._player_id}
          closeModal={()=>{
          this.setState({modalVisible_player:false})}}></Player>
          : null }
        { this.state.modalVisible_team==true ?
        <Team       
          modal_visible={this.state.modalVisible_team}
          team_id = {this.state._team_id}
          get_player_info={this.get_player_info}
          navigation={this.props.navigation}
          closeModal={()=>{this.setState({modalVisible_team:false});/*this.load_logos();*/}}></Team>
          : null }
      </ScrollView >
    );
  }
}


export default SearchScreen;
