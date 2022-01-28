import * as React from 'react';
import { Text, View, StyleSheet, Modal, Button, Linking } from 'react-native';
import Constants from 'expo-constants';
import ItemsList from '../components/list';
import HLSP from "../components/HSL_player";

import { Video } from 'expo-av';

let list = [

          ];
class ChannelsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        list:list,
        modalVisible_match:false,
        player_type:1,
        key_:"name",
        key_key:"channel_id",
        url:'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
        category_name:"",
        loading:true,
    };

    this.get_channels();

  }
  get_channels(){
    this.category_name = this.props.route.params.category_name;
    this.props.navigation.setOptions({title: this.category_name})
    API_.get_channels(this.props.route.params.category_id).then(resp=>{
      if(resp && resp.data && resp["data"].length>0){
        /*
        for (let i=0;i<resp["data"].length;i++){
          resp["data"]
          API_.get_channel(resp["data"][i].channel_id).then(resp=>{
            this.chanels_data[i].en_name = resp["data"].en_name;
            //this.setState({list:[]});
            const ch_n = this.chanels_data[i].en_name.replace(/\s/g,"").toLocaleLowerCase().trim() ;
            API_.channels_dict[ch_n] = this.chanels_data[i] ;
            API_.channels_dict[ch_n].id = API_.channels_dict[ch_n].channel_id;
            
            this.setState({list:this.chanels_data});
          });
        }
        */
        let list = [];
        this.chanels_data = resp["data"];
        this.setState({list:this.chanels_data,loading:false});
      }
    });
  }
  render_ReactHlsPlayer(){
    if (this.state.player_type == 1){
      return ( 
        <HLSP 
        modalVisible_hlsp={this.state.modalVisible_hlsp}
        dynamic_style={this.state.dynamic_style_modals}
        p_url={this.state.url}
        player_type={this.state.player_type}
        closeM={()=>{this.setState({modalVisible_hlsp:false, ignore : true})}}
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
  onchannel_clicked =(item)=>{
    this.props.navigation.navigate('Channel', { channel_id: item.channel_id,channel_photo:item.channel_photo });
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{this.category_name}</Text>
        <ItemsList 
          loading={this.state.loading}
          list={this.state.list} 
          onclick={this.onchannel_clicked} 
          onclick_hls={this.state.key_key=="channel_id" ? this.onchannel_clicked_hls : false} 
          onclick_vid={this.state.key_key=="channel_id" ? this.onchannel_clicked_vid : false} 
          key_={this.state.key_} key_key={this.state.key_key}
          />
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
    backgroundColor: '#000',
    color : "#fff",
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color : "#d1d8e0",
  },
});
export default ChannelsScreen;
