import React from "react";
import { Text, View, StyleSheet, Modal, Button, Linking, Picker, } from 'react-native';
import Constants from 'expo-constants';
import ItemsList from '../components/list';
import ReactHlsPlayer from "react-hls-player";
import Video from 'expo';
import { useRoute } from '@react-navigation/native';

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
    };
    this.get_channel();

  }
  get_channel(){
      this.channel_photo = this.props.route.params.channel_photo;
      API_.get_channel(this.props.route.params.channel_id).then(resp=>{
        if(resp["data"] && resp["data"]["en_name"] ){
          this.setState({channel:resp["data"]});
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
    console.log(serv.SecureUrl);
    console.log(this.state.channel["name"] +",,"+ API_.domain_o+this.channel_photophoto);
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
        <View style={{margin:10}}>
          <Button onPress={()=>this.onch_clicked(serv)}  key={serv.id} title={serv.name} style={{margin:10}}></Button>
        </View>
      ))
    : null;
    return (
      <View style={styles.container}>
        <Text> Matches list {this.state.modalVisible_match}</Text>
        <Text> name : {this.state.channel? this.state.channel.en_name : ""}</Text>
        <Text> Matches {this.state.channel? this.state.channel.en_name : ""}</Text>
        <Picker
              selectedValue={this.state.actionType}
              style={{ height: 50, width: 150 }}
              onValueChange={(itemValue, itemIndex) => this.setState({actionType:itemValue})}
            >
              <Picker.Item label="IPTV" value="IPTV" />
              <Picker.Item label="PLAYER" value="PLAYER" />
        </Picker>

        {servers_list}
        {this.state.modalVisible_match==true ? this.render_modal_credentials() : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ChannelScreen;
