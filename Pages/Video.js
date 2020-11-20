import React from "react";
import {  View, StyleSheet, Modal, Button, Linking, Picker,ScrollView, Image , ImageBackground, ActivityIndicator} from 'react-native';
import Constants from 'expo-constants';
import Loader from "../components/Loader";
import {styles_article,getTheme} from "../components/Themes";
import Dailymotion from 'react-dailymotion';
import { Video } from 'expo-av';
import { WebView } from 'react-native-webview';

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
    this.state.html = `
<html>
<head>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style=' background-color: #000;'>
<div id="player-dailymotion" style='max-width: 100%;max-width: "100%";'></div>
<br/>
<!-- <button type="button" onclick="play_fn()">Play</button>-->
<!-- <button type="button" onclick="play_pause()">Pause</button>-->

<script src="https://api.dmcdn.net/all.js"></script>
<script>
var player = DM.player(document.getElementById('player-dailymotion'), {
    video: '[VIDEO_ID]',
    width: '100%',
    height: '100%',
});
    

function play_fn(){
    player.play();
}

function play_pause(){
 player.pause();
}
</script>

</body>
</html>

    `;
    getTheme("styles_article").then(theme=>this.setState({dynamic_style:theme})); 
    this.get_video();

  }
  get_video(){
    let short_title = this.state.video.title_news.length > 0 ? this.state.video.title_news.slice(0,30)+"..." : this.state.video.title_news;
    
    //this.state.video.date = API_.get_date2(new Date(this.state.video.date.replace("#","") * 1000));
    this.props.navigation.setOptions({title: short_title})
    API_.get_video(this.props.route.params.item.link)
    .then(videoId =>{
      this.state.video.videoId = videoId;
      this.state.html =this.state.html.replace("[VIDEO_ID]", videoId);
      this.setState({loading:false});
    });
  }
  render_video(){
    return <Video
            source={{ uri: "https://www.dailymotion.com/video/"+this.state.video.videoId }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="cover"
            shouldPlay
            isLooping
            style={{ width: 300, height: 300 }}
            />;

  }
 LoadingIndicatorView() {
    return <ActivityIndicator color='#009b88' size='large' />
  }
  render_wv(){
    return  <WebView 
              allowsFullscreenVideo={true}
              style={{flex:1}}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              renderLoading={this.LoadingIndicatorView}
              onLoadEnd={a=>{ 
              }}
              source={{ html: this.state.html }}
              userAgent='Mozilla/5.0 (Linux; Android 9.0.0;) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.116 Mobile Safari/537.36'
              />;
  }
  render() {
    return (
      <ScrollView  style={this.state.dynamic_style.container}>
        <View style={{height:300,width:"100%"}}> 
        {this.state.video && this.state.video.videoId ?        
        this.render_wv()
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
