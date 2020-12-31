import React from 'react';
import {  Modal,Text, View, Button,TextInput } from 'react-native';
import {getTheme} from "../components/Themes";


class AppLogHistory extends React.Component{
    constructor(props) {
      super(props);
      this.state = {
        dynamic_style:this.props.dynamic_style,
        savingCredents:false,
        dynamic_style_colors:{},
      };
      }
      componentDidMount(){
        getTheme("styles_notif").then(theme=>this.setState({dynamic_style_colors:theme}) );
      }
      render(){
        const MModal = API_.isWeb ? require("modal-enhanced-react-native-web").default : Modal;
        let i=0;
        const history = [{time:" Time",type:"Type",body:"Body"}].concat(API_.messages_history).map(line=>{
          const style_k = this.state.dynamic_style_colors["txt_"+line.type] ? line.type : "";
          const indecator_style= style_k!="" ? this.state.dynamic_style_colors["bg_"+style_k] : {};
          const text_style= style_k!="" ?  this.state.dynamic_style_colors["txt_"+style_k] : {};
          i+=1;
          return (<View style={{flexDirection:'row', flexWrap:'wrap',width:"100%",paddingVertical:4}} key={line.time+i}>
          <Text style={this.state.dynamic_style.log_time_text}>{line.time.split(" ").length==2 ? line.time.split(" ")[1]:""}</Text>
          <Text style={[this.state.dynamic_style.log_type_text,text_style]}>{line.type}</Text>
          <View style={[this.state.dynamic_style_colors.indecator_thin,indecator_style]}></View>
          <Text style={[this.state.dynamic_style.log_msg_text,text_style]}>{line.body}</Text>
        </View>);
        });
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
                {history}
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

  export default AppLogHistory ;