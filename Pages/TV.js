import React from "react";
import {  View, TextInput, Modal, Button, Linking, ScrollView, Picker , ImageBackground, ActivityIndicator, Switch} from 'react-native';
import {styles_settings,getTheme, themes_list} from "../components/Themes";


class TVScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        dynamic_style:styles_settings,
        list:[],
        tv_ip:"192.168.1.2",
        tv_port:8002,
        tv_mac:"a2:a4:45:55:aa:12",
        nameApp:"",
        tv_token:"",
        debug:true,
        
    };
    this.control = false;
  }

  componentDidMount(){
    let short_title = "Settings" ;
    getTheme("styles_settings").then(theme=>this.setState({dynamic_style:theme})); 
    //this.props.navigation.setOptions({title: <Text >{short_title}</Text>});
  }
  componentWillUnmount(){
  }

 LoadingIndicatorView() {
    return <ActivityIndicator color='#009b88' size='large' />
  }
  get_conf(){
    return       {
        debug    : this.state.debug, // Default: false
        ip       : this.state.tv_ip,
        mac      : this.state.tv_mac,
        nameApp  : this.state.nameApp, // Default: NodeJS
        port     : this.state.tv_port, // Default: 8002
        token    : this.state.tv_token,
      };
  }
  init_cnx = async()=>{
      return false;

  }
  sendKey = async(key)=>{
    API_.showMsg("Sending key ["+key+"] ...","info",undefined, 800);
    await this.control.sendKeyPromise(key)
    API_.showMsg("Sent","info",undefined, 800);
  }
  closeCnx=async()=>{
    this.control.closeConnection();
  }
  render() {

    return (
      <ScrollView  style={this.state.dynamic_style.container} keyboardShouldPersistTaps={'handled'}>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>TV ip </Text> 
            <TextInput
                style={this.state.dynamic_style.settings_row_input}
                placeholder={" 0.0.0.0 "}
                placeholderTextColor="#ecf0f1"
                onChangeText ={newValue=>{  this.setState({tv_ip:newValue.toLowerCase()});   }}
                value={this.state.tv_ip}
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="numeric"
            />
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>TV port </Text> 
            <TextInput
                style={this.state.dynamic_style.settings_row_input}
                placeholder={" 8002 "}
                placeholderTextColor="#ecf0f1"
                onChangeText ={newValue=>{  this.setState({tv_port:newValue.toLowerCase()});   }}
                value={this.state.tv_port}
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="numeric"
            />
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>TV mac </Text> 
            <TextInput
                style={this.state.dynamic_style.settings_row_input}
                placeholder={" aa:ac:ad:ac "}
                placeholderTextColor="#ecf0f1"
                onChangeText ={newValue=>{  this.setState({tv_mac:newValue.toLowerCase()});   }}
                value={this.state.tv_mac}
                autoCorrect={false}
                autoCapitalize="none"
            />
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Name APP </Text> 
            <TextInput
                style={this.state.dynamic_style.settings_row_input}
                placeholder={" NodeJS "}
                placeholderTextColor="#ecf0f1"
                onChangeText ={newValue=>{  this.setState({nameApp:newValue.toLowerCase()});   }}
                value={this.state.nameApp}
                autoCorrect={false}
                autoCapitalize="none"
            />
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>API token </Text> 
            <TextInput
                style={this.state.dynamic_style.settings_row_input}
                placeholder={" abcd "}
                placeholderTextColor="#ecf0f1"
                onChangeText ={newValue=>{  this.setState({tv_token:newValue.toLowerCase()});   }}
                value={this.state.tv_token}
                autoCorrect={false}
                autoCapitalize="none"
            />
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Init cnx </Text> 
            <View style={this.state.dynamic_style.settings_row_input}>
              <Button title="Cnx" onPress={()=>{this.init_cnx()}}></Button>
            </View>
          </View>

          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Home key </Text> 
            <View style={this.state.dynamic_style.settings_row_input}>
              <Button title="Home" onPress={()=>{this.sendKey(KEYS.KEY_HOME)}}></Button>
            </View>
          </View>
          <View style={this.state.dynamic_style.settings_row}>
            <Text style={this.state.dynamic_style.settings_row_label}>Power key </Text> 
            <View style={this.state.dynamic_style.settings_row_input}>
              <Button title="Power" onPress={()=>{this.sendKey(KEYS.KEY_POWER)}}></Button>
            </View>
          </View>
        </ScrollView >
    );
  }
}


export default TVScreen;
