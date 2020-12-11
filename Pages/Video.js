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
      const didBlurSubscription = this.props.navigation.addListener(
        'didFocus',
        payload => {}
      );
    this.get_video();

  }
  componentDidMount(){
    let short_title = this.state.video.title_news.length > 0 ? this.state.video.title_news.slice(0,30)+"..." : 
    getTheme("styles_article").then(theme=>this.setState({dynamic_style:theme})); 
    this.props.navigation.setOptions({title: <Text >{short_title}</Text>});
  }
  get_video(){
    if(this.state.video.is_yt && this.state.video.videoId){
      setTimeout(()=>{this.setState({loading:false});},500);
      return true;
    }
    let short_title = this.state.video.title_news.length > 0 ? this.state.video.title_news.slice(0,30)+"..." : this.state.video.title_news;
    
    //this.state.video.date = API_.get_date2(new Date(this.state.video.date.replace("#","") * 1000));
    this.props.navigation.setOptions({title: short_title})
    this.state.video.videoId = false;
    this.setState({loading:true});
    API_.get_video(this.props.route.params.item.link)
    .then(videoId =>{
      this.state.video.videoId = videoId;
      setTimeout(()=>{this.setState({loading:false});},500);
      this.props.navigation.setOptions({
        "headerRight":()=>(
                <IconButton 
                  name="chrome" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} 
                  onPress={()=>{ Linking.openURL('https://www.dailymotion.com/embed/video/'+this.state.video.videoId); }}  />
        )
      });
    });
  }
 LoadingIndicatorView() {
    return <ActivityIndicator color='#009b88' size='large' />
  }
  render_wv(){
    const uri_dailyMotion = 'https://www.dailymotion.com/embed/video/'+this.state.video.videoId+'?quality=380&info=0&logo=0&autoplay=false';
    const uri_youtube = 'https://www.youtube.com/embed/'+this.state.video.videoId+'?autoplay=0';
    const uri_ = this.state.video.is_yt ? uri_youtube : uri_dailyMotion;
    return  <WebView 
              allowsFullscreenVideo={true}
              style={{flex:1,backgroundColor: "#000"}}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              
              ref={(ref) => (this.webview = ref)}
              onLoadEnd={a=>{ 
              }}
              source={{ uri: uri_ }}
              userAgent='Mozilla/5.0 (Linux; Android 9.0.0;) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.116 Mobile Safari/537.36'
              />;
  }
  render() {
    const style= this.state.video && this.state.video.videoId ? {height:300,width:"100%",position:'absolute'} : {width:1,height:1};
    return (
      <ScrollView  style={this.state.dynamic_style.container}>
        <ImageBackground style={{height:300,width:"100%"}} source={{uri: this.state.video.img}} >
        </ImageBackground>
        <View style={style} source={{uri: this.state.video.img}} >
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
