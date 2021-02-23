import Animated, { Easing } from 'react-native-reanimated';
import React from 'react';
import {  View,Pressable,TouchableOpacity } from 'react-native';
import {styles_home,getTheme,themes_list} from "../components/Themes";

const {
  Clock,
  Value,
  set,
  cond,
  startClock,
  clockRunning,
  timing,
  debug,
  stopClock,
  block,
  call,
} = Animated;

function runTiming(clock, value, dest,speed, func_end=()=>{}) {
  const state = {
    finished: new Value(0),
    position: new Value(0),
    time: new Value(0),
    frameTime: new Value(0),
  };

  const config = {
    duration: speed,
    toValue: new Value(0),
    easing: Easing.inOut(Easing.ease),
  };
    try {
      
    return block([
      cond(
        clockRunning(clock),
        [
          // if the clock is already running we update the toValue, in case a new dest has been passed in
          set(config.toValue, dest),
        ],
        [
          // if the clock isn't running we reset all the animation params and start the clock
          set(state.finished, 0),
          set(state.time, 0),
          set(state.position, value),
          set(state.frameTime, 0),
          set(config.toValue, dest),
          startClock(clock),
        ]
      ),
      // we run the step here that is going to update position
      timing(clock, state, config),
      // if the animation is over we stop the clock
      cond(state.finished,debug('stop clock', stopClock(clock))),
      // we made the block return the updated position
      state.position,
    ]);
  } catch (error) {
      console.log(error);
  }
}

export class ToastMsg extends React.Component {
  // we create a clock node
  clock = new Clock();
  // and use runTiming method defined above to create a node that is going to be mapped
  // to the translateX transform.
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
    this.state.transY = new Value(this.state.transofr_y*-1)
    this.timeout_closing = 0;
    this.previous_body = "";
    console.log("TM constructor",this.state.body);
    this.notif_end=true;
  }
  closing=()=>{
    this.setState({transY : runTiming(new Clock(), this.state.transofr_y, -1*this.state.transofr_y,this.state.speed, this.setend)});
    setTimeout(this.setend,this.state.speed+100);
  }
  closing_im=()=>{
    this.setState({transY : runTiming(new Clock(), this.state.transofr_y, -1*this.state.transofr_y,this.state.speed/2, this.setend)});
    clearTimeout(this.timeout_closing);
    setTimeout(this.setend,this.state.speed+100);
  }
  start=()=>{
    //await API_.getConfig("is_debug",this.debug).then(o=>API_.is_debug=o);
    API_.messages_history.push({body:this.state.body,type:this.state.type,time:API_.get_date_timeS(new Date()),is_debug:this.state.is_debug});
    if(this.state.debug && API_.is_debug==false){
      return this.empty_stats();
    }
    console.log(this.notif_end , API_.is_debug==false);
    //this.setState({transY : runTiming(new Clock(), -1*this.state.height, 0)});
    this.state.transY = runTiming(new Clock(), -1*this.state.transofr_y, this.state.transofr_y,this.state.speed,()=>{});
    this.timeout_closing = setTimeout(this.closing, this.state.delay+this.state.speed);
  }
  componentDidMount(){
    //getTheme("styles_notif").then(theme=>this.setState({dynamic_style:theme}) );
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
    //this.notif_end = true;
  }
  setend = ()=>{
    this.empty_stats();
    console.log("....setend")
    this.notif_end = true;
    this.props.onEnd();
    return true;
  }
  fill_stats(){
    //if(this.notif_end==false)return false;
    if(this.state.debug){
      this.state.body = this.props.body && this.props.body.message ? this.props.body.message : this.props.body;
      console.log(this.state.body);
    }else{
      this.state.body   = this.props.body ? this.props.body : "";
    }
    this.state.body = this.state.body && this.state.body.charAt ? this.state.body.charAt(0).toUpperCase() + this.state.body.slice(1) : "";
    this.state.delay  = this.props.delay ? this.props.delay : this.delay;
    this.state.height = this.props.height ? this.props.height : this.height;
    this.state.transofr_y = this.props.transofr_y ? this.props.transofr_y : this.transofr_y;
    this.state.speed  = this.props.speed ? this.props.speed : this.speed;
    this.state.type   = this.props.type ? this.props.type : this.type;
    this.state.debug  = this.props.debug ? this.props.debug : this.debug;
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
        <Animated.View
          style={[this.props.dynamic_style.box, {height:this.state.height,transform: [{ translateY: this.state.transY }] }]}
        >
          <Pressable
            hitSlop={{ top: 0, bottom: 0, left: 0, right: 0 }}
            style={this.props.dynamic_style.box_inside}
            activeOpacity={0.7}
            onPress={()=>{
              this.closing_im();
            }}
          >
            <Text style={[this.props.dynamic_style.body, text_style ]}>{this.state.body}</Text>
            <View style={[this.props.dynamic_style.indecator,indecator_style]}></View>
          </Pressable>
          </Animated.View>
      </View>
    );
  }
}

export default ToastMsg ;