import * as React from 'react';
import { Text, View, StyleSheet, Modal, Button, TouchableOpacity, TextInput } from 'react-native';
import Constants from 'expo-constants';
import ItemsList from '../components/list';
import DateTimePicker from '@react-native-community/datetimepicker';
import IconButton from "../components/IconButton";
import { WebView } from 'react-native-webview';

class FSScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //url_wv:'https://facebook.com/login',
        url_wv:"https://facebook.com/login",
        list:[],
        modalVisible_match:false,
        show_datPicker : false,
        matches_date:new Date(),
        loading:false,
    };
    this.injectedJS = `
      //alert("from inside");
    `;
  }
get_url_content(date_obj=null){
      API_.get_matches(date_obj).then(resp=>{
      if(resp["status"]=="true"){
        let list = [];
        let data = Object.keys(resp["data"]).map(k =>{
          return {"title":k, data:resp["data"][k]}; 
        });
        this.setState({list:data});
        for(let i=0;i<data.length;i++){
          
        }
      }
    });
}
  _onWebViewStateChange(webViewState){
    console.log(webViewState.loading);
    this.setState({loading:webViewState.loading});
  }
  render() {

    return (
      <View style={styles.container}>
        <View style={styles.add_bar}>
          <TextInput
            style={{ height: 40, borderColor: 'gray', borderWidth: 1,flex:8 ,color:"#fff"}}
            onChangeText={text => this.setState({input_val:text})}
            value={this.state.input_val}
          />
            <IconButton title="pick date"  name="send" size={35} style={{marginLeft:10,flex:2, color:this.state.loading?"#a7abaf":"#0b6a6f" }} 
            onPress={()=>{
              this.state.input_val = this.state.input_val.slice(0,4)=="http" ? this.state.input_val : "http://"+this.state.input_val ;
              let url_enc = encodeURIComponent(this.state.input_val);
              url_enc = "https://developers.facebook.com/tools/debug/echo/?q="+url_enc
              
              this.setState({ url_wv :"https://developers.facebook.com/tools/debug/echo/?q="+url_enc});
            }}/>
          </View>
          <View style={{flex:20}}>
            <WebView 
              style={{flex:1}}
              injectedJavaScript = {this.injectedJS}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              onNavigationStateChange={this._onWebViewStateChange.bind(this)}
              onLoadEnd={a=>{
              }}
              source={{ uri: this.state.url_wv }}
              userAgent='Mozilla/5.0 (Linux; Android 9.0.0;) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.116 Mobile Safari/537.36'
              />
            </View>
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
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  add_bar:{
    marginTop:10,
    flexDirection:'row', 
    flexWrap:'wrap',
    flex: 2,
  }
});

export default FSScreen;
