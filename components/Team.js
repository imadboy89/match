import React from 'react';
import {  View, Button,Image, Modal, TouchableOpacity,ScrollView ,TouchableHighlight,Keyboard} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Loading from "../components/Loader";
import {styles_modal,getTheme,global_theme} from "../components/Themes";



class Team extends React.Component{
    constructor(props) {
      super(props);
      this.state = {
        team:{},
        modalVisible_msg : false,
        loading : true,
        dynamic_style:styles_modal,
      };
      
    } 
    componentDidMount(){
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
      
      API_.get_team(this.props.team_id).then(res=>{
        let img_uri = res && res.team_group_photo ? res.team_group_photo : false;
        let img_logo_uri = res && res.team_logo ? res.team_logo : false;
        img_uri = img_uri && img_uri.slice(0,2)=="//" ? img_uri.replace("//","https://") : img_uri;
        img_logo_uri = img_logo_uri && img_logo_uri.slice(0,2)=="//" ? img_logo_uri.replace("//","https://") : img_logo_uri;
        img_logo_uri=res.team_flag = res && res.team_type && res.team_type==2? API_.get_cc_img(res.team_flag) : img_logo_uri;
        res.team_group_photo = img_uri;
        res.team_logo = img_logo_uri;
        this.setState({team:res,loading:false});
        if(res && res.team_name_ar && img_logo_uri && img_logo_uri!=""){
          //console.log(this.props.league_id,this.props.league_name);
          API_.setTeam_logo(res["team_name_ar"], img_logo_uri, this.props.league_name, this.props.league_id,true,true);
        }

        
      });
    }
    get_player_info=(p_id)=>{
      this.setState({modalVisible_player:true,player_id:p_id});
    }
    set_fav_p=(p_id)=>{
      this.setState({modalVisible_player:true,player_id:p_id});
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
      const career = this.state.team && this.state.team.team_info && this.state.team.team_info.map
      ? this.state.team.team_info.map(row=>{
        return <View key={row} styles={this.state.dynamic_style.info_row}>
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
        const p_nbr = row[3];
        const p_ccode = row[7];
        const p_name = row[4] && row[4].trim ? row[4].trim() : "";
        const fav_style = this.state.favorite_p.includes(p_name) ? {backgroundColor: global_theme.fav_background} : {};
        const ma_style = p_ccode && p_ccode.trim && p_ccode.toLocaleLowerCase().trim() == "ma" ? {borderWidth:1}: {};
        return  <TouchableOpacity key={p_id+"-"+p_pos}
        delayLongPress={300}
        activeOpacity={0.7}
        onLongPress={()=>this.props.set_fav_p(p_name).then(o=>this.setState({favorite_p:o}))}
        onPress={()=>this.props.get_player_info({player_id:p_id})}
        style={[this.state.dynamic_style_league.team_view,fav_style,ma_style ]}>
          <View style={{flex:1}}><Text style={this.state.dynamic_style_league.team_name_t}></Text></View>
          <View style={{flex:3}}><Text style={this.state.dynamic_style_league.team_name_t}>{p_nbr}</Text></View>
          <View style={{flex:20}}><Text style={this.state.dynamic_style_league.team_name_t}>{p_name}</Text></View>
          
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
              {team_inf}
              {players}
              {career}
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