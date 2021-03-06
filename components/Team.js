import React from 'react';
import {  View, Button,Image, Modal, TouchableOpacity,ScrollView ,TouchableHighlight,Keyboard} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Loading from "../components/Loader";
import {styles_modal,getTheme,global_theme} from "../components/Themes";
import ItemsList from '../components/list';



class Team extends React.Component{
    constructor(props) {
      super(props);
      this.state = {
        team:{},
        modalVisible_msg : false,
        loading : true,
        dynamic_style:styles_modal,
        view_mod:1,
        is_fav:false
      };
      this.localS_fav_key = "favorite_teams_k";
    } 
    componentDidMount(){
      API_.getConfig(this.localS_fav_key,[]).then(o=>{
        if(o && o.includes && o.includes(parseInt(this.props.team_id))){
          this.setState({is_fav:true});
        }
      })
      getTheme("styles_modal").then(theme=>this.setState({dynamic_style:theme}));
      this.loadTeam();
      if(this.props.dynamic_style==undefined){
        getTheme("styles_league").then(theme=>this.setState({dynamic_style_league:theme}));
      }else{
        this.state.dynamic_style_league = this.props.dynamic_style;
      }
    }
    async loadTeam(){
      if(this.props.team_id==undefined){
        return;
      }
      this.state.favorite_p = await API_.getConfig("favorite_players",this.state.favorite_p);
      API_.get_team(this.props.team_id,true,undefined,true).then(res=>{
        res.comps = res && res.comps ? res.comps.filter(c => c[0]>0) : [];
        res.comps = res && res.comps ? res.comps.map(c=>{ return c[0]>0?{id:c[0],comp_name:c[2], info_1:c[1], info_2:c[3]}:false;}) : {};

        API_.setTeam_logo(res["team_name_ar"], res.team_logo, this.props.league_name, this.props.league_id,true,true);
        this.setState({team:res,loading:false});
      });
    }
    get_player_info=(player)=>{
      this.setState({modalVisible_player:true,player_id:player.player_id});
    }
    set_fav=async(id,team_name)=>{
      id= parseInt(id);
      let msg_action = "";
      if(id==0){return "";}
      let o = await API_.getConfig(this.localS_fav_key,[]);
      if( o.includes(id) ){
        o = o.filter(o=>{if(o!=id)return o;});
        msg_action = "تمت إزالته من";
      }else{
        o.push(id);
        msg_action = "تمت إضافته إلى";
      }
      
      await API_.setConfig(this.localS_fav_key,o);
      this.setState({is_fav:o.includes(id)});
      API_.showMsg(`الفريق ٭${team_name}٭ ${msg_action} المفضلة!`);
    }
    set_fav_p=(p_id)=>{
      this.setState({modalVisible_player:true,player_id:p_id});
    }
    onLeaguePressed = (item)=>{
      if(this.props==undefined || this.props.navigation==undefined || this.props.navigation.navigate==undefined){
        return false;
      }
      this.props.navigation.navigate('League',{ league_details: {league:item.comp_name,league_img:"",id:item.id} });
      this.props.closeModal();
    }
    render(){
      
      const allowed_infs = {
        "team_type":"النوع",
        "team_name_ar":"النادي",
        "team_class":"التصنيف",
        "team_country":"المنتخب",
        //"team_flag" : "",
        "team_year_established" : "تاريخ التأسيس",
        //"team_logo":"",
        //"team_group_photo":"",
        //"team_info":"",
      };
      const MModal = API_.isWeb ? require("modal-enhanced-react-native-web").default : Modal;

      if(this.state.team && this.state.team.team_info && this.state.team.team_info.split){
        this.state.team.team_info = this.state.team.team_info.split("\n").filter(r=>r.trim()!="");
      }
      let ind = 0;
      const career = this.state.team && this.state.team.team_info && this.state.team.team_info.map
      ? this.state.team.team_info.map(row=>{
        ind+=1;
        return <View key={row+ind} styles={this.state.dynamic_style.info_row}>
                  <Text style={this.state.dynamic_style.text_carrier}>{row}</Text>
                </View>
      }) : null;
      if(this.state.team && this.state.team.squad_club && this.state.team.squad_club.map){
        this.state.team.squad_club = this.state.team.squad_club.filter((sq,ind,self)=>this.state.team.squad_club.indexOf(sq)===ind);
      }
      const players = this.state.team && this.state.team.squad_club && this.state.team.squad_club.map
      ? this.state.team.squad_club.map(row=>{
        const p_id = row[0];
        const p_pos = row[1];
        const p_nbr = p_pos>0 ? row[3] : "🗣️";
        const p_ccode = row[7];
        const p_name = row[4] && row[4].trim ? row[4].trim() : "";
        const fav_style = this.state.favorite_p.includes(p_name) ? {backgroundColor: global_theme.fav_background} : {};
        const ma_style = p_ccode && p_ccode.trim && p_ccode.toLocaleLowerCase().trim() == "ma" ? {borderWidth:1}: {};
        const cc_flag = p_ccode && p_ccode.trim && p_ccode.toLocaleLowerCase().trim()!="" ?  p_ccode.toLocaleLowerCase().trim() : false;
        return  <TouchableOpacity key={p_id+"-"+p_pos}
        delayLongPress={300}
        activeOpacity={0.7}
        onLongPress={()=>this.props.set_fav_p(p_name).then(o=>this.setState({favorite_p:o}))}
        onPress={()=>this.props.get_player_info({player_id:p_id})}
        style={[this.state.dynamic_style_league.team_view,fav_style,ma_style ]}>
          <View style={{flex:1}}><Text style={this.state.dynamic_style_league.team_name_t}></Text></View>
          <View style={{flex:3}}><Text style={this.state.dynamic_style_league.team_name_t}>{p_nbr}</Text></View>
          <View style={{flex:20}}><Text style={this.state.dynamic_style_league.team_name_t}>{p_name}</Text></View>
          {cc_flag!=false ? 
          <View style={{flex:3,padding:5}} >
            <Image style={{height:"99%",width:"99%"}}  imageStyle={{borderRadius:  20,height:"99%",width:"99%"}} source={{uri: API_.get_cc_img(cc_flag, true)}} />
          </View> : null }
          </TouchableOpacity>;

        return <View key={p_id} styles={this.state.dynamic_style.info_row}>
                  <Text style={this.state.dynamic_style.text_carrier}>{p_name}</Text>
                </View>
      }) : null;
      let team_props = this.state.team ? Object.keys(this.state.team) : undefined;
      let order = Object.keys(allowed_infs);
      
      team_props = team_props ? team_props.sort((a,b)=>order.indexOf(a)>order.indexOf(b) ? 1:0 ) : undefined;
      //data.sort((a,b)=>{ return (API_.leagues_dict[API_.fix_title(a.title) ] != undefined && API_.leagues_dict[API_.fix_title(b.title) ] == undefined ?-1:0 );});

      const team_inf = this.state.team ? team_props.map(k=>{
        if (allowed_infs[k]==undefined) return null;
        if(k=="player_birthdate"){
          this.state.team[k] = this.state.team[k] && this.state.team[k].slice && this.state.team[k].slice(0,1) =='#' ? API_.get_date2(new Date(parseInt(this.state.team[k].replace("#","")) * 1000)) : this.state.team[k] ;
        }
        return <View key={k} styles={this.state.dynamic_style.info_row}>
                  <Text style={this.state.dynamic_style.text_info}>{allowed_infs[k]} : {this.state.team[k]}</Text>
                </View>
      }) : null;

      const comps = this.state.team && this.state.team.comps ?
        <ItemsList 
        ListHeaderComponent={<Text style={this.state.dynamic_style.article_date_t}>ذات صلة :</Text>}
        loading={false}
        list={this.state.team.comps} 
        onclick={this.onLeaguePressed} 
        key_={"comp_name"} key_key={"id"}
        minWidth={"98%"}
        disable_auto_scal = {true}
        />
        : null;
      return (
        <MModal 
        animationType="slide"
        transparent={true}
        visible={this.props.modal_visible}
        onRequestClose={() => {Keyboard.dismiss();this.props.closeModal();} }
      > 
      <View style={this.state.dynamic_style.modal_view_container}>
      <View style={[this.state.dynamic_style.modal_view,this.state.dynamic_style.modal_view_large]}>
        <View style={this.state.dynamic_style.modal_body}>
          { this.state.loading ? <Loading /> : 
            <ScrollView style={{width:"100%",backgroundColor:"#646c78"}}>
              <View style={{width:"100%",height:100,justifyContent:"center"}} >
                {this.state.team.team_logo!=false && this.state.team.team_logo!=""? <Image style={{height:"100%",width:"100%",resizeMode:"center"}} source={{uri: this.state.team.team_logo}} /> : null}
              </View>
              {this.state.team.team_group_photo!=false ?
                <View style={{width:"100%",height:260,justifyContent:"center"}} >
                  <Image style={{height:"100%",width:"100%",resizeMode:"contain"}} source={{uri: this.state.team.team_group_photo}} />
                </View>
               : null}

              <View style={{flexDirection:'row',flexWrap:'wrap',width:"100%"}}>
                <View style={{flex:1}}><Button title="Info" onPress={()=>this.setState({view_mod:1})}/></View>
                <View style={{flex:1}}><Button title="Comps" onPress={()=>this.setState({view_mod:2})}/></View>
                <View style={{flex:1}}><Button title="Fav" color={this.state.is_fav?"green":"grey"} onPress={()=>{
                  this.set_fav(this.props.team_id,this.state.team.team_name_ar);
                }}/></View>
              </View>
               { this.state.view_mod==1 ?
              <View style={{flex:1,width:"99%"}}>
                {team_inf}
                {players}
                {career}
              </View> : null}
              { this.state.view_mod==2 ?
              <View style={{flex:1,width:"99%"}}>
                {comps}
              </View> : null}
            </ScrollView> 
          }
        </View>
        <View style={this.state.dynamic_style.footer}>
          <View style={this.state.dynamic_style.footer_button}>
            <Button
                title={"Cancel"}
                color="#f39c12"
                onPress={()=>this.props.closeModal()}
            ></Button>
          </View>
        </View>
      </View>
      </View>
    </MModal>
      );
    }
  }

  export default Team ;