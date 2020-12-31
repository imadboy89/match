import React from 'react';
import {  Modal,Text, View, Button,TextInput } from 'react-native';


class Credentials extends React.Component{
    constructor(props) {
      super(props);
      this.state = {
        email:"",
        password:"",
        dynamic_style:this.props.dynamic_style,
        savingCredents:false,
      };
      API_.getCredentials().then(output=>{
        this.setState({email:output.email, password:output.password});
      });
      }
      async saveCredentials(){
        this.setState({savingCredents:true});
        await API_.setCredentials(this.state.email,this.state.password);
        const status = await backup.changeClient();
        if(status!=false){
          await backup.load_settings();
          this.props.closeModal();
          await backup.load_teams();
        }
        this.setState({savingCredents:false});
      }
      signUp = async(email,password)=>{
        this.setState({savingCredents:true});
        await API_.setCredentials(this.state.email,this.state.password);
        const status = await backup.newUser(email,password);
        //await this.saveCredentials();
        if(status){
          await this.saveCredentials();
        }
        this.setState({savingCredents:false});
      }
      render(){
        const MModal = API_.isWeb ? require("modal-enhanced-react-native-web").default : Modal;
        return (
          <MModal 
          animationType="slide"
          transparent={true}
          visible={this.props.modal_visible}
          onRequestClose={() => this.props.closeModal() }
          
        > 
          <View style={this.state.dynamic_style.modal_view_container}>
          <View style={[this.state.dynamic_style.modal_view,this.state.dynamic_style.modal_view_small]}>
          <View style={this.state.dynamic_style.modal_body}>

            <View style={this.state.dynamic_style.settings_row}>
            <TextInput
                style={this.state.dynamic_style.settings_row_input}
                placeholder={" UserName/email "}
                placeholderTextColor="#ecf0f1"
                onChangeText ={newValue=>{
                    this.setState({email:newValue.toLowerCase()});
                }}
                value={this.state.email}
                autoCompleteType="email"
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            </View>
  
            <View style={this.state.dynamic_style.settings_row}>
            <TextInput
                style={this.state.dynamic_style.settings_row_input}
                placeholder={" Password "}
                placeholderTextColor="#ecf0f1"
                onChangeText ={newValue=>{
                    this.setState({password:newValue});
                }}
                value={this.state.password}
                type="password"
                secureTextEntry={true}
                autoCorrect={false}
                autoCapitalize="none"
            />
            </View>
  
          </View>
          <View style={this.state.dynamic_style.footer}>
              <View style={this.state.dynamic_style.settings_row_input}>
                <Button
                    title={"Sign in"}
                    disabled={this.state.savingCredents}
                    color= "#2ecc71"
                    onPress={()=>{
                      this.saveCredentials();
                    }
                    }
                ></Button>
              </View>
              <View style={this.state.dynamic_style.settings_row_input}>
                <Button
                    title={"Cancel"}
                    disabled={this.state.savingCredents}
                    color="#f39c12"
                    onPress={()=>{
                        this.props.closeModal();
                    }
                    }
                ></Button>
              </View>
              <View style={this.state.dynamic_style.settings_row_input}>
                <Button
                    title={"SignUp"}
                    disabled={this.state.savingCredents}
                    color="#3498db"
                    onPress={()=>{
                        this.signUp();
                    }
                    }
                ></Button>
                </View>
          </View>

          </View>
          </View>
          </MModal>
        );
      }
  }

  export default Credentials ;