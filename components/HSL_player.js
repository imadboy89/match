import React from "react";
import { View, Modal, Button, Dimensions } from 'react-native';
import ReactHlsPlayer from "react-hls-player";
import {Video} from 'expo-av';
import {getTheme} from "../components/Themes";


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
      console.log(this.props.p_url);
      if (this.state.player_type == 1){
        return ( <ReactHlsPlayer
                  url={this.props.p_url}
                  autoPlay={true}
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
