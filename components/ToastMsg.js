import React from 'react';
import {  View,Pressable,TouchableOpacity } from 'react-native';
import AnimatedToastMsg from "./ToastMsg2";

export class ToastMsg extends React.Component {

  height = 70;
  transofr_y = 70;
  transofr_y_2 = 150;
  delay = 3000;
  speed = 500;
  type  = "info";
  debug = false;
  constructor(props) {
    super(props);
    this.state = {
      dynamic_style:false,
      delay  : this.props.delay ? this.props.delay : this.delay,
      height : this.props.height ? this.props.height : this.height,
      speed  : this.props.speed ? this.props.speed : this.speed,
      body   : "",
      transY : 0,
      start  : false,
      type   : this.props.type ? this.props.type : this.type,
    }
    this.transofr_y = this.props.is_second ? this.transofr_y_2 : this.transofr_y;
    ///this.state.transY = new Value(this.state.transofr_y*-1)
    this.timeout_closing = 0;
    this.previous_body = "";
    console.log("TM constructor",this.props.body);
    this.notif_end=true;
  }
  closing=()=>{
    if(this.mounted==false){return}
    setTimeout(this.setend,this.state.speed+100);
  }
  closing_im=()=>{
    if(this.mounted==false){return}
    clearTimeout(this.timeout_closing);
    setTimeout(this.setend,this.state.speed+100);
  }
  start=async()=>{
    if(this.mounted==false){return}
    API_.messages_history.push({body:this.state.body,type:this.state.type,time:API_.get_date_timeS(new Date()),is_debug:this.state.is_debug});
    if(this.state.debug && API_.is_debug==false){
      this.empty_stats();
      this.setend();
      return ;
    }
    console.log(this.notif_end , API_.is_debug==false);
    this.timeout_closing = setTimeout(this.closing, this.state.delay+this.state.speed);
  }
  componentDidMount(){
    this.mounted=true;
  }
  componentWillUnmount(){
    this.mounted=false;
  }
  empty_stats(){
    this.state.body   = "";
    this.state.delay  = this.delay;
    this.state.height = this.height;
    this.state.speed  = this.speed;
    this.state.type   = this.type ;
    this.state.debug  = this.debug ;
    this.previous_body = "";
    this.timeout_closing = 0;
  }
  setend = ()=>{
    if(this.mounted==false){return}
    this.empty_stats();
    console.log("....setend")
    this.notif_end = true;
    this.props.onEnd();
    return true;
  }
  fill_stats(){
    this.state.body = this.props.body && this.props.body.message ? this.props.body.message : this.props.body;
    this.state.body = this.state.body && this.state.body.charAt ? this.state.body.charAt(0).toUpperCase() + this.state.body.slice(1) : "";
    this.state.delay  = this.props.delay ? this.props.delay : this.delay;
    this.state.height = this.props.height ? this.props.height : this.height;
    this.state.transofr_y = this.props.transofr_y ? this.props.transofr_y : this.transofr_y;
    this.state.speed  = this.props.speed ? this.props.speed : this.speed;
    this.state.type   = this.props.type ? this.props.type : this.type;
    this.state.debug  = this.props.debug ? this.props.debug : this.debug;
    if(this.state.body==""){
      console.log("----Modal Cancelled , empty body");
      setend();
    }
  }
  render() {
    this.fill_stats();
    if( this.timeout_closing==0 && this.state.body!="" && this.state.body != this.previous_body){
      this.notif_end = false;
      
      this.start();
      this.previous_body = this.state.body;
    }else{
      this.previous_body = "";
    }
    const style_k = this.props.dynamic_style["txt_"+this.state.type] ? this.state.type : this.type;
    const indecator_style= this.props.dynamic_style["bg_"+style_k];
    const text_style= this.props.dynamic_style["txt_"+style_k];
    return (
      <View style={this.props.is_second ? this.props.dynamic_style.container_2 : this.props.dynamic_style.container}>
        <AnimatedToastMsg 
          dynamic_style={this.props.dynamic_style} 
          height={this.state.height} 
          body={this.state.body}
          transofr_y={this.transofr_y}
          indecator_style={indecator_style}
          text_style={text_style}
          closeModal={()=>{
            this.closing();
            if(this.props.onCLicked){
              this.props.onCLicked();
            }
          }}
          />
      </View>
    );
  }
}

export default ToastMsg ;