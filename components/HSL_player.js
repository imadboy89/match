import React from "react";
import { View, Modal, Button, Dimensions } from 'react-native';
import {Video} from 'expo-av';
import {getTheme} from "../components/Themes";

export class HLSPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.tries = 10;
  }
  componentDidMount(){
    console.log("componentDidMount hls_video loaded ");
    this.init();
  }
  componentWillUnmount(){
    hls.destroy();
  }
  init(){
    this.tries -=1 ;
    if(this.tries==0){
      return;
    }
    setTimeout(() => {
      if(document.getElementById(this.props.dom_id) != null){
        initialize_hls(this.props.dom_id);
      }else{
        init();
      }
    }, 300);;
  }
  render(){
    console.log("render hls_video loaded ");
    return <video id={this.props.dom_id} controls videosrc={this.props.url} ></video>;
  }
}
class HLSP extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        modalVisible_hlsp :this.props.modalVisible_hlsp,
        dynamic_style: this.props.dynamic_style ? this.props.dynamic_style : {},
        player_type : this.props.player_type ? this.props.player_type : 1,
      }
      this.playerRef = React.createRef();
    }
    componentDidMount(){
      getTheme("styles_settings").then(theme=>this.setState({dynamic_style:theme}) );
    }
    render_ReactHlsPlayer(){
      const url = this.props.p_url;
      const hls_configs = {};
      hls_configs.maxBufferSize = 0.1*1000*1000;
      console.log(url , this.playerRef);
      //hlsConfig={{maxBufferSize: 120*1000*1000}}
      if (this.state.player_type == 1){
        return <HLSPlayer dom_id={"hls_video"} url={url}/>;
      }else{
        return (<Video 
                  source={{uri: url}}   
                  ref={(ref) => {
                    this.player = ref
                  }} />
            );
      }
    }
    render(){
      const windowHeight = Dimensions.get('window').height ;
      const windowWindth = Dimensions.get('window').width ;
      const MModal = API_.isWeb ? require("modal-enhanced-react-native-web").default : Modal;
      const modal_size = windowHeight>windowWindth ?this.state.dynamic_style.modal_view_meduim : this.state.dynamic_style.modal_view_large;
      if(this.state.dynamic_style==undefined) return null;
      return (          
          <MModal 
            animationType="slide"
            transparent={true}
            visible={this.props.modalVisible_hlsp}
            onRequestClose={() => { 
                this.setState({ modalVisible_hlsp:false,});
            } }
            
          > 
          <View style={this.state.dynamic_style.modal_view_container}>
            <View style={[this.state.dynamic_style.modal_view,modal_size,this.state.dynamic_style.modal_view_fill_width]}>
              <View style={this.state.dynamic_style.modal_body}>
                <Text >   {this.props.url} </Text>
                {this.props.modalVisible_hlsp==true && this.props.p_url!="" ? this.render_ReactHlsPlayer() : null}
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

  export default HLSP;
