import React from "react";
import { View, Modal, Button, Linking, Picker,ScrollView, Image } from 'react-native';
import Constants from 'expo-constants';
import ItemsList from '../components/list';
import ReactHlsPlayer from "react-hls-player";
import {Video} from 'expo-av';
import Loading from "../components/Loader";
import {styles_channel,getTheme} from "../components/Themes";
import * as ScreenOrientation from 'expo-screen-orientation';

class HLSP extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible_match :this.props.modalVisible_match,
      dynamic_style:this.props.dynamic_style,
    }
    this.playerRef = React.createRef();
  }

  render_ReactHlsPlayer(){
    if (this.props.player_type == 1){
      return ( <ReactHlsPlayer
                url={this.props.p_url}
                autoplay={true}
                controls={true}
                width="100%" 
                height="auto" 
                onError={e => console.log("errr",e)}
                playerRef={this.playerRef}
                
            />);
    }else{
      return (<Video 
                source={{uri: this.props.p_url}}   
                ref={(ref) => {
                  this.player = ref
                }} />
          );
    }
  }
  render(){
    this.state.dynamic_style = this.props.dynamic_style;
    const MModal = API_.isWeb ? require("modal-enhanced-react-native-web").default : Modal;
    if(this.state.dynamic_style==undefined) return null;
    return (          
        <MModal 
          animationType="slide"
          transparent={true}
          visible={this.props.modalVisible_match}
          onRequestClose={() => { 
              this.setState({ modalVisible_match:false,});
          } }
          
        > 
        <View style={this.state.dynamic_style.modal_view_container}>
          <View style={[this.state.dynamic_style.modal_view,this.state.dynamic_style.modal_view_meduim,this.state.dynamic_style.modal_view_fill_width]}>
            <View style={this.state.dynamic_style.modal_body}>
              <Text >   {this.props.url} </Text>
              {this.props.modalVisible_match==true && this.props.p_url!="" ? this.render_ReactHlsPlayer() : null}
            </View>
            <View style={this.state.dynamic_style.footer}>
            <View style={this.state.dynamic_style.footer_button}>
              <Button
                  title={"Close"}
                  color="#f39c12"
                  onPress={()=>this.props.closeM()}
              ></Button>
            </View>
          </View>
          </View>
        </View>
        </MModal>
        );
  }
}

class ChannelScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        list:[],
        modalVisible_match:false,
        player_type:1,
        key_:"en_name",
        key_key:"channel_id",
        url:'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
        actionType:"PLAYER",
        channel:null,
        loading:true,
        dynamic_style:styles_channel,
        p_url:"",
        
    };
    this.playerRef = React.createRef();
  }
  componentDidMount(){
    getTheme("styles_channel").then(theme=>this.setState({dynamic_style:theme}));
    getTheme("styles_settings").then(theme=>this.setState({dynamic_style_modals:theme}) );
    this.get_channel();
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.ALL).catch(error=> API_.debugMsg(error+"","warning") );
  }
  get_channel(){
      this.channel_photo = this.props.route.params.channel_photo;
      const ch_item = this.props.route.params.ch_item;
      if(ch_item){
        console.log(ch_item);
        setTimeout(()=>{this.setState({channel:ch_item,loading:false});},300);
        return ;
      }
      API_.get_channel(this.props.route.params.channel_id).then(resp=>{
        if(resp && resp["data"] && resp["data"]["en_name"] ){
          this.setState({channel:resp["data"],loading:false});
        }
      }).catch(err=>API_.showMsg(err,"danger"));
  }

  render_modal_HLSP(){
    return (    
      <HLSP 
        modalVisible_match={this.state.modalVisible_match}
        dynamic_style={this.state.dynamic_style_modals}
        p_url={this.state.p_url}
        player_type={this.state.player_type}
        closeM={()=>{this.setState({modalVisible_match:false})}}
      />
        );
  }

  onch_clicked(serv){
    //let name = this.state.channel["name"];
    //let img = API_.domain_o+this.channel_photo;
    if(serv.is_external==true){
      API_.open_ext_url(serv.url);
    }else if (this.state.actionType=="IPTV"){
      API_.saveLink(serv.SecureUrl,this.state.channel["name"],API_.domain_o+this.channel_photo).then(out=>API_.showMsg("تمت إضافة القناة!"));
      
    }else if (this.state.actionType=="PLAYER"){
      if(API_.isWeb){
        this.setState({p_url:serv.SecureUrl,modalVisible_match:true});
        return;
      }
      API_.open_ext_url(serv.SecureUrl);

    }else if(this.state.actionType=="inApp-IPTV"){
      const ch = JSON.parse(JSON.stringify(this.state.channel));
      ch.channel_photo = this.channel_photo;
      backup.save_iptv(ch);
    }
  }
  render() {
    console.log(this.state.channel?this.state.channel.channel_servers:null);
    const ch_name_ = this.state.channel && this.state.channel.en_name ? this.state.channel.en_name.toLocaleLowerCase().trim().replace(/\s/g,"").replace(/hd/g,"") : "";
    const ext_ch = API_.external_channels && API_.external_channels[ch_name_] ? API_.external_channels[ch_name_] : null;

    const _channel_servers = this.state.channel && this.state.channel.channel_servers && this.state.channel.channel_servers.map ?this.state.channel.channel_servers:[];
    console.log(_channel_servers);
    if(ext_ch){_channel_servers.push(ext_ch);}
    let servers_list = _channel_servers.map(serv => serv && serv.name ? (
        <View style={{margin:8}} key={serv.id}>
          <Button 
            color={serv.is_external ? "#f39c12":"#3498db"}
            onPress={()=>this.onch_clicked(serv)} title={serv.name} style={{margin:5}}></Button>
        </View>
      ):null);
    let picker_options = (backup && backup.is_auth && backup.admin==true) ? ["IPTV","PLAYER","inApp-IPTV"] : ["PLAYER",];
    const pickers = picker_options.map(o=><Picker.Item label={o} value={o} key={o}/>);

    return (
      <ScrollView style={this.state.dynamic_style.container}>
      <View style={this.state.dynamic_style.channel_logo_v}>
        { this.channel_photo ?  <Image style={this.state.dynamic_style.channel_logo} source={{uri: this.channel_photo.slice(0,4)!="http"?API_.domain_o+this.channel_photo:this.channel_photo}} />: null}
         </View>
         <View style={this.state.dynamic_style.info_cont}>
         { this.state.loading ? <Loading /> : 
        <View style={this.state.dynamic_style.info_cont}>
          <Text style={this.state.dynamic_style.info_text}> Name : {this.state.channel && this.state.channel.en_name ? this.state.channel.en_name : ""}</Text>
          <Text style={this.state.dynamic_style.info_text}> Language :{this.state.channel && this.state.channel.language? this.state.channel.language : ""}</Text>
          <Text style={this.state.dynamic_style.info_text}> Type :{this.state.channel && this.state.channel.type? this.state.channel.type : ""}</Text>
          
          <Picker
                selectedValue={this.state.actionType}
                style={{ height: 50, width: 150,backgroundColor:"#2c3e50",color:"#fff" }}
                onValueChange={(itemValue, itemIndex) => this.setState({actionType:itemValue})}
              >
                {pickers}
          </Picker>

          {servers_list}
        </View>
        }
        </View>
        {this.render_modal_HLSP()}
        </ScrollView >
    );
  }
}

export default ChannelScreen;
