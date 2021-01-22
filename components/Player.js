import React from 'react';
import {  Text, View, Button,Image, Modal, ActivityIndicator,ScrollView ,TouchableHighlight,Keyboard} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconButton from "./IconButton";
import {styles_modal,getTheme,global_theme} from "../components/Themes";



class Player extends React.Component{
    constructor(props) {
      super(props);
      this.state = {
        player:{},
        modalVisible_msg : false,
        playerLoading : true,
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
        this.setState({player:res,playerLoading:false});
      });
    }

    render(){
      const allowed_infs = {
        "player_name_ar":"اسم اللاعب",
        "player_nationality":"جنسية",
        "player_team_name":"اسم فريق",
        "player_nteam_name":"المنتخب الوطني",
        "player_birthdate" : "تاريخ الميلاد",
      };
      const MModal = API_.isWeb ? require("modal-enhanced-react-native-web").default : Modal;
      const pl_career = this.state.player && this.state.player.player_career ? this.state.player.player_career.split("\n").map(row=>{
        return <View key={row} styles={this.state.dynamic_style.info_row}>
                  <Text style={{flex:1,padding:5}}>{row}</Text>
                </View>
      }) : null;
      
      const pl_inf = this.state.player ? Object.keys(this.state.player).map(k=>{
        if (allowed_infs[k]==undefined) return null;
        if(k=="player_birthdate"){
          this.state.player[k] = this.state.player[k] && this.state.player[k].slice && this.state.player[k].slice(0,1) =='#' ? API_.get_date2(new Date(parseInt(this.state.player[k].replace("#","")) * 1000)) : this.state.player[k] ;
        }
        return <View key={k} styles={this.state.dynamic_style.info_row}>
                  <Text style={{flex:1,padding:5}}>{allowed_infs[k]} : {this.state.player[k]}</Text>
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
            <ScrollView style={{width:"100%",backgroundColor:"#646c78"}}>
              <View style={{width:"100%",padding:2,height:260}} >
                {p_img!=false ? <Image style={{height:"95%",width:"95%"}} source={{uri: p_img}} /> : null}
              </View>
              {pl_inf}
              {pl_career}
            </ScrollView> 
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