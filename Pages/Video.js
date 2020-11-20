import React from "react";
import {  View, StyleSheet, Modal, Button, Linking, Picker,ScrollView, Image , ImageBackground, ActivityIndicator, TouchableOpacity} from 'react-native';
import Constants from 'expo-constants';
import Loader from "../components/Loader";
import {styles_article,getTheme} from "../components/Themes";
import Dailymotion from 'react-dailymotion';
import { Video } from 'expo-av';
import { WebView } from 'react-native-webview';
import IconButton from "../components/IconButton";

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
<div id="player-dailymotion" style='max-width: 100%;max-width: "100%";'>
</div>
<br/>
<!-- <button type="button" onclick="play_fn()">Play</button>-->
<!-- <button type="button" onclick="play_pause()">Pause</button>-->

<script src="https://api.dmcdn.net/all.js"></script>
<script>

var player = DM.player(document.getElementById('player-dailymotion'), {
      width: '100%',
      height: '100%',
      });
      
function playVid(vid){
  player.load(vid);  
}
    
document.addEventListener("vid_id", function(data) {
  alert(data.data);
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
    this.state.video.videoId = false;
    this.setState({loading:true});
    API_.get_video(this.props.route.params.item.link)
    .then(videoId =>{
      console.log(videoId);
      this.state.video.videoId = videoId;
      this.setState({loading:false});
      this.sendVidID(videoId);
      this.props.navigation.setOptions({title: "Matches list",
        "headerRight":()=>(
                <IconButton 
                  name="chrome" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} 
                  onPress={()=>{ Linking.openURL('https://www.dailymotion.com/embed/video/'+this.state.video.videoId); }}  />
        )
      });
    });
  }
sendVidID = (vid_id: string) =>{
  /*
  const msg= `(function() {
    window.vid_id.onMessage(${JSON.stringify(data)});
  })()`;
  */
  let msg = " playVid('"+vid_id+"');";
  console.log(msg);
  this.webview.injectJavaScript(msg);
}

 LoadingIndicatorView() {
    return <ActivityIndicator color='#009b88' size='large' />
  }
  render_wv(){
    const style= this.state.video && this.state.video.videoId ? {flex:1} : {width:1,height:1};
    return  <WebView 
              allowsFullscreenVideo={true}
              style={{flex:1}}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              renderLoading={this.LoadingIndicatorView}
              ref={(ref) => (this.webview = ref)}
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
        {this.render_wv()}
        </View>
        
          <View style={this.state.dynamic_style.article_v}>
            <Text style={this.state.dynamic_style.article_date_t}>{this.state.video && this.state.video.date ? this.state.video.date :""}</Text> 
            <Text style={this.state.dynamic_style.article_title_t}>{this.state.video && this.state.video.title_news ? this.state.video.title_news : ""}</Text>
            
            
          </View>
          {this.state.video &&this.state.video.videoId ? null : <Loader/> }
      
        </ScrollView >
    );
  }
}


export default VideoScreen;
