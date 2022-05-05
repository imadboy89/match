import React from 'react';
import {  View, Button,Image, Modal, ActivityIndicator,ScrollView ,TouchableHighlight,Keyboard} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Loading from "../components/Loader";
import {styles_modal,getTheme,global_theme} from "../components/Themes";



class Player extends React.Component{
    constructor(props) {
      super(props);
      this.state = {
        player:{},
        modalVisible_msg : false,
        loading : true,
        dynamic_style:styles_modal,
      };
      
    } 
    componentDidMount(){
      getTheme("styles_modal").then(theme=>this.setState({dynamic_style:theme}));
      this.loadPlayer();
      
    }

    loadPlayer(){
      if(this.props.player_id==undefined){
        return;
      }
      API_.get_player(this.props.player_id).then(res=>{
        this.setState({player:res,loading:false});
      });
    }
    render_transfers=()=>{
      return this.state.player && this.state.player.transfers ? this.state.player.transfers.map(t=>{
        const player_id     = t[1];
        const player_name   = t[2];
        let   date          = t[3];
        const transfer_type = t[4];
        const TFrom_id      = t[6];
        const TFrom_name    = t[7];
        const TFrom_cc      = t[8];
        const TTo_id        = t[9];
        const TTo_name      = t[10];
        const TTo_cc        = t[11];
        date = date && date.slice && date.slice(0,1) =='#' ? API_.get_date2(new Date(date.replace("#","") * 1000)) : date ;
        date = date && date.split && date.includes("-") ? date.split("-").slice(0,-1).join("-") : date;
        return <View key={`${player_id}-${date}`}>
          <View style={{flex:1,marginVertical:2}}>
            <View style={{flex:1,flexDirection:"row"}}>
              <Text style={[{flex:1}, this.state.dynamic_style.trans_txt]}>{date}</Text>
              <Text style={[{flex:2}, this.state.dynamic_style.trans_txt]}>{TTo_name}</Text>
              <Text style={[{flex:2}, this.state.dynamic_style.trans_txt]}>{TFrom_name}</Text>
              <Text style={[{flex:1}, this.state.dynamic_style.trans_txt]}>{transfer_type}</Text>
              <Text style={[{flex:2}, this.state.dynamic_style.trans_txt]}>{player_name}</Text>
            </View>
          </View>
        </View>
      }) : null;
    }
    render(){
      const allowed_infs = {
        "player_name_ar":"اسم اللاعب",
        "player_nationality":"الجنسية",
        "player_nteam_name":"المنتخب",
        "player_team_name":"النادي",
        "player_birthdate" : "تاريخ الميلاد",
        "player_position" : "المركز",
      };
      const MModal = API_.isWeb ? require("modal-enhanced-react-native-web").default : Modal;
      if(this.state.player && this.state.player.player_career && this.state.player.player_career.split){
        this.state.player.player_career =this.state.player.player_career.split("\n").filter(r=>r.trim()!="");
      }
      const pl_career = this.state.player && this.state.player.player_career && this.state.player.player_career.map
      ? this.state.player.player_career.map(row=>{
        return <View key={row} styles={this.state.dynamic_style.info_row}>
                  <Text style={this.state.dynamic_style.text_carrier}>{row}</Text>
                </View>
      }) : null;
      let player_props = Object.keys(this.state.player) ;
      let player_order = Object.keys(allowed_infs);
      
      player_props = player_props.sort((a,b)=>player_order.indexOf(a)>player_order.indexOf(b) ? 1:0 );
      //data.sort((a,b)=>{ return (API_.leagues_dict[API_.fix_title(a.title) ] != undefined && API_.leagues_dict[API_.fix_title(b.title) ] == undefined ?-1:0 );});

      const pl_inf = this.state.player && player_props ? player_props.map(k=>{
        if (allowed_infs[k]==undefined) return null;
        if(k=="player_birthdate"){
          this.state.player[k] = this.state.player[k] && this.state.player[k].slice && this.state.player[k].slice(0,1) =='#' ? API_.get_date2(new Date(parseInt(this.state.player[k].replace("#","")) * 1000)) : this.state.player[k] ;
        }      
        return <View key={k} styles={this.state.dynamic_style.info_row}>
                  <Text style={this.state.dynamic_style.text_info}>{allowed_infs[k]} : {this.state.player[k]}</Text>
                </View>
      }) : null;
      let p_img = this.state.player && this.state.player.player_photo ? this.state.player.player_photo : false;

      p_img = p_img && p_img.slice(0,2)=="//" ? p_img.replace("//","https://") : p_img;
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
              <View style={{width:"100%",height:260,justifyContent:"center"}} >
                {p_img!=false ? <Image style={{height:"100%",width:"100%",resizeMode:"contain"}} source={{uri: p_img}} /> : null}
              </View>
              {pl_inf}
              <View style={{width:"99%",justifyContent:"center", marginVertical:10}} >
                <Text style={[this.state.dynamic_style.text_info, {color:"#b7eefb"}]}>انتقالات : </Text>
                {this.render_transfers()}
              </View>
              {pl_career}
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

  export default Player ;