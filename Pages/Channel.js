import React from "react";
import { View, StyleSheet, Modal, Button, Linking, Picker,ScrollView, Image } from 'react-native';
import Constants from 'expo-constants';
import ItemsList from '../components/list';
import ReactHlsPlayer from "react-hls-player";
import Video from 'expo';
import Loading from "../components/Loader";
import {styles_channel} from "../components/Themes";
let list = [

          ];
class ChannelScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        list:list,
        modalVisible_match:false,
        player_type:1,
        key_:"en_name",
        key_key:"channel_id",
        url:'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
        actionType:"IPTV",
        channel:null,
        loading:true,
        
    };
    this.get_channel();

  }
  get_channel(){
      this.channel_photo = this.props.route.params.channel_photo;
      API_.get_channel(this.props.route.params.channel_id).then(resp=>{
        if(resp["data"] && resp["data"]["en_name"] ){
          this.setState({channel:resp["data"],loading:false});
        }
      });
  }
  render_ReactHlsPlayer(){
    if (this.state.player_type == 1){
      return ( <ReactHlsPlayer
                url={this.state.url}
                autoplay={true}
                controls={true}
                width="100%" 
                height="auto" 
            />);
    }else{
      return (<Video 
                source={{uri: "https://stream.mux.com/your-playback-id.m3u8"}}   
                ref={(ref) => {
                  this.player = ref
                }} />
          );
    }
  }
  render_modal_credentials(){
    
    return (          
        <Modal 
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible_match}
          onRequestClose={() => { 
              this.setState({ modalVisible_match:false,});
          } }
        >
          <View style={{flex:.4,backgroundColor:"#2c3e5066"}}></View>
          <View style={{height:400,width:"100%",backgroundColor:"#646c78"}}>
          <Button title="Close" onPress={()=>{ this.setState({modalVisible_match:false});}} ></Button>
          <Text >   {this.state.url} </Text>
          {this.render_ReactHlsPlayer()}

          </View>
          <View style={{flex:1,backgroundColor:"#2c3e5066"}}></View>

        </Modal>
        );
}
  onchannel_clicked_hls =(item)=>{
    alert("onchannel_clicked_hsl");
    API_.get_channel(item.channel_id).then(resp=>{
      if(resp["data"]["name"] != undefined){
        let list = [];
        let data = resp["data"];
        this.channel_servers = data["channel_servers"];
        let url =this.channel_servers[0].SecureUrl;
        this.setState({modalVisible_match:true,url:url,player_type:1});

      }
    });
  }
  onchannel_clicked_vid =(item)=>{
    alert("onchannel_clicked_vid");
    API_.get_channel(item.channel_id).then(resp=>{
      if(resp["data"]["name"] != undefined){
        let list = [];
        let data = resp["data"];
        this.channel_servers = data["channel_servers"];
        let url =this.channel_servers[0].SecureUrl;
        this.setState({modalVisible_match:true,url:url,player_type:2});

      }
    });
  }

  onch_clicked(serv){
    let url = serv.SecureUrl;
    let name = this.state.channel["name"];
    let img = API_.domain_o+this.channel_photo;
    if (this.state.actionType=="IPTV"){
      API_.saveLink(serv.SecureUrl,this.state.channel["name"],API_.domain_o+this.channel_photo).then(out=>notifyMessage("Link saved"));
      
    }else if ("PLAYER"){
       Linking.canOpenURL(url).then(supported=>{
         if(supported){
           Linking.openURL(url).then(out=>{notifyMessage("Opening channel.");});
         }else{
           notifyMessage("This link is not supported : "+url);
         }
       });
    }
  }
  render() {
    
    let servers_list = this.state.channel ?
      this.state.channel.channel_servers.map(serv => (
        <View style={{margin:8}}>
          <Button onPress={()=>this.onch_clicked(serv)}  key={serv.id} title={serv.name} style={{margin:5}}></Button>
        </View>
      ))
    : null;
    return (
      <ScrollView style={{backgroundColor: '#000',}}  contentContainerStyle={styles_channel.container}>
      <View style={styles_channel.channel_logo_v}>
        { this.channel_photo ?  <Image style={styles_channel.channel_logo} source={{uri: API_.domain_o+this.channel_photo}} />: null}
         </View>
         <View style={styles_channel.info_cont}>
         { this.state.loading ? <Loading /> : 
        <View style={styles_channel.info_cont}>
          <Text style={styles_channel.info_text}> Name : {this.state.channel && this.state.channel.en_name ? this.state.channel.en_name : ""}</Text>
          <Text style={styles_channel.info_text}> Language :{this.state.channel && this.state.channel.language? this.state.channel.language : ""}</Text>
          <Text style={styles_channel.info_text}> Type :{this.state.channel && this.state.channel.type? this.state.channel.type : ""}</Text>
          
          <Picker
                selectedValue={this.state.actionType}
                style={{ height: 50, width: 150,backgroundColor:"#2c3e50",color:"#fff" }}
                onValueChange={(itemValue, itemIndex) => this.setState({actionType:itemValue})}
              >
                <Picker.Item label="IPTV" value="IPTV" />
                <Picker.Item label="PLAYER" value="PLAYER" />
          </Picker>

          {servers_list}
        </View>
        }
        </View>
        {this.state.modalVisible_match==true ? this.render_modal_credentials() : null}
        </ScrollView >
    );
  }
}

export default ChannelScreen;
