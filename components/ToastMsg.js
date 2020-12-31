import Animated, { Easing } from 'react-native-reanimated';
import React from 'react';
import {  View,Text,StyleSheet,TouchableOpacity } from 'react-native';
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
} = Animated;

function runTiming(clock, value, dest,speed, delay_toback) {
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
    cond(state.finished, debug('stop clock', stopClock(clock))),
    // we made the block return the updated position
    state.position,
  ]);
}

export class ToastMsg extends React.Component {
  // we create a clock node
  clock = new Clock();
  // and use runTiming method defined above to create a node that is going to be mapped
  // to the translateX transform.
  height = 70;
  delay = 2000;
  speed = 500;
  type  = "info";
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
    this.state.transY = new Value(this.state.height*-1)
    this.inteval_closing = 0;
    this.previous_body = "";
    console.log("TM constructor",this.state.body);
  }
  closing=()=>{
    
    this.setState({transY : runTiming(new Clock(), this.state.height, -1*this.state.height,this.state.speed)});
    this.empty_stats();
  }
  start=()=>{
    API_.messages_history.push({body:this.state.body,type:this.state.type,time:API_.get_date_timeS(new Date()),is_debug:this.state.is_debug});
    console.log(this.state.debug , API_.is_debug==false);
    if(this.state.debug && API_.is_debug==false){
      return this.empty_stats();
    }
    //this.setState({transY : runTiming(new Clock(), -1*this.state.height, 0)});
    this.state.transY = runTiming(new Clock(), -1*this.state.height, this.state.height,this.state.speed);
    clearInterval(this.inteval_closing);
    this.inteval_closing = setTimeout(this.closing, this.state.delay);
  }
  componentDidMount(){
    getTheme("styles_notif").then(theme=>this.setState({dynamic_style:theme}) );
  }
  empty_stats(){
    this.state.body   = "";
    this.state.delay  = this.delay;
    this.state.height = this.height;
    this.state.speed  = this.speed;
    this.state.type   = this.type ;
    this.state.debug  = this.debug ;
    this.previous_body = "";
    this.inteval_closing = 0;
  }
  fill_stats(){
    if(this.state.debug){
      this.state.body = this.props.body && this.props.body.message ? this.props.body.message : this.props.body;
      console.log(this.state.body);
    }else{
      this.state.body   = this.props.body ? this.props.body : "";
    }
    this.state.delay  = this.props.delay ? this.props.delay : this.delay;
    this.state.height = this.props.height ? this.props.height : this.height;
    this.state.speed  = this.props.speed ? this.props.speed : this.speed;
    this.state.type   = this.props.type ? this.props.type : this.type;
    this.state.debug  = this.props.debug ? this.props.debug : this.debug;
  }
  render() {
    this.fill_stats();
    if(this.inteval_closing==0 && this.state.body!="" && this.state.body != this.previous_body){
      this.start();
      this.previous_body = this.state.body;
    }else{
      this.previous_body = "";
    }
    const style_k = this.state.dynamic_style["txt_"+this.state.type] ? this.state.type : this.type;
    const indecator_style= this.state.dynamic_style["bg_"+style_k];
    const text_style= this.state.dynamic_style["txt_"+style_k];
    return (
      <TouchableOpacity style={this.state.dynamic_style.container}
        onPress={()=>{
          clearInterval(this.inteval_closing);
          this.closing();
        }}
      >
        <Animated.View
          style={[this.state.dynamic_style.box, {height:this.state.height,transform: [{ translateY: this.state.transY }] }]}
        >
          <View style={[this.state.dynamic_style.indecator,indecator_style]}></View>
          <Text style={[this.state.dynamic_style.body, text_style ]}>{this.state.body}</Text>
          </Animated.View>
      </TouchableOpacity>
    );
  }
}

export default ToastMsg ;