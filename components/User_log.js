import React from 'react';
import {  Modal,Text, View, Button,ScrollView } from 'react-native';
import {getTheme} from "./Themes";


class User_log extends React.Component{
    constructor(props) {
      super(props);
      this.state = {
        dynamic_style:this.props.dynamic_style,
        savingCredents:false,
        dynamic_style_colors:false,
        user_log:this.props.user_log,
      };
      }
      componentDidMount(){

        getTheme("styles_settings").then(theme=>this.setState({dynamic_style:theme}) );
      }
      map_keys(dict){
        let i=0;
        return Object.keys(dict).map(key=>{
          const value = dict[key];
          if (value.constructor == Object){ 
            this.objects_[key] = value;
            return null;
          }else if(value=="-"){
            return null;
          }
          i+=1;
          return (<View style={{flexDirection:'row', flexWrap:'wrap',width:"100%",paddingVertical:2}} key={key+i}>
          <Text style={this.state.dynamic_style.user_log_key}>{key}</Text>
          <Text style={[this.state.dynamic_style.user_log_sep,]}> : </Text>
          <Text style={[this.state.dynamic_style.user_log_value,]}>{value}</Text>
        </View>);
        });
      }
      render(){
        this.objects_ = {};
        if(!this.state.dynamic_style){
          return null;
        }
        const MModal = API_.isWeb ? require("modal-enhanced-react-native-web").default : Modal;
        let user_log = this.map_keys(this.props.user_log);
        for(let key_d of Object.keys(this.objects_)){
          const dict_x = this.objects_[key_d];
          user_log.push(<Text style={[this.state.dynamic_style.user_log_value,{fontSize:23,textAlign:"center"}]} key={key_d}>{key_d.toLocaleUpperCase()}</Text>);
          user_log = user_log.concat(this.map_keys(dict_x));
        }
        return (
          <MModal 
          animationType="slide"
          transparent={true}
          visible={this.props.modal_visible}
          onRequestClose={() => this.props.closeModal() }
          
        > 
          <View style={this.state.dynamic_style.modal_view_container}>
          <View style={[this.state.dynamic_style.modal_view,this.state.dynamic_style.modal_view_large]}>
            <View style={[this.state.dynamic_style.modal_body,{justifyContent:"flex-start"}]}>
              <ScrollView style={{width:"100%",backgroundColor:"#646c78"}}>
                {user_log}
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

  export default User_log ;