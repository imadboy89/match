import React from "react";
import {  View, StyleSheet, Modal, Button, Linking, Picker,ScrollView, Image , ImageBackground} from 'react-native';
import Constants from 'expo-constants';
import Loader from "../components/Loader";
import {styles_article,getTheme} from "../components/Themes";
import Dailymotion from 'react-dailymotion';
import { Video } from 'expo-av';

class VideoScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        list:[],
        modalVisible_match:false,
        loading:true,
        video:this.props.route.params.item,
        dynamic_style:styles_article,
        
    };
    getTheme("styles_article").then(theme=>this.setState({dynamic_style:theme}));
    this.get_video();

  }
  get_video(){
    let short_title = this.state.video.title_news.length > 0 ? this.state.video.title_news.slice(0,30)+"..." : this.state.video.title_news;
    
    this.state.video.date = API_.get_date2(new Date(this.state.video.date.replace("#","") * 1000));
    this.props.navigation.setOptions({title: short_title})
    API_.get_video(this.props.route.params.item.link)
    .then(videoId =>{
      this.state.video.videoId = videoId;
      this.setState({loading:false});
    });
  }
  render_video(){
    return <Video
            source={{ uri: 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="cover"
            shouldPlay
            isLooping
            style={{ width: 300, height: 300 }}
            />;

  }
  render() {
    return (
      <ScrollView  style={this.state.dynamic_style.container}>
        <View style={this.state.dynamic_style.channel_logo_v}> 
        {this.state.video && this.state.video.videoId ?        
        this.render_video()
        : <Loader/>}
        </View>
        
          <View style={this.state.dynamic_style.article_v}>
            <Text style={this.state.dynamic_style.article_date_t}>{this.state.video && this.state.video.date ? this.state.video.date :""}</Text> 
            <Text style={this.state.dynamic_style.article_title_t}>{this.state.video && this.state.video.title_news ? this.state.video.title_news : ""}</Text>
            
            
          </View>
      
        </ScrollView >
    );
  }
}


export default VideoScreen;
