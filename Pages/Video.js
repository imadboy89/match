import React from "react";
import {  View, StyleSheet, Modal, Button, Linking, Picker,ScrollView, Image , ImageBackground, ActivityIndicator, TouchableOpacity} from 'react-native';
import Constants from 'expo-constants';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import Loader from "../components/Loader";
import {styles_article,getTheme, global_theme} from "../components/Themes";
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
        videoQuality:"380",
        
    };

  }
  componentDidMount(){
    this.state.video.title_news = this.state.video.name ? this.state.video.name : this.state.video.title_news
    this.get_video();
    activateKeepAwake();
    let short_title = this.state.video.title_news.length > 0 ? this.state.video.title_news.slice(0,30)+"..." : 
    getTheme("styles_article").then(theme=>this.setState({dynamic_style:theme})); 
    this.props.navigation.setOptions({title: <Text >{short_title}</Text>});
  }
  componentWillUnmount(){
    deactivateKeepAwake();
  }
  get_video(){
    if(this.state.loading==false){this.setState({loading:true});}

    if(this.state.video.is_external){

    }else if(this.state.video.is_yt && this.state.video.videoId){
      setTimeout(()=>{
        this.setState({loading:false});
        API_.setTitleWeb(this.state.video.title_news);
      },500);
      return true;
    }
    let short_title = this.state.video.title_news.length > 0 ? this.state.video.title_news.slice(0,30)+"..." : this.state.video.title_news;
    
    //this.state.video.date = API_.get_date2(new Date(this.state.video.date.replace("#","") * 1000));
    this.props.navigation.setOptions({title: short_title})
    this.state.video.videoId = false;

    API_.get_video(this.props.route.params.item.link,this.props.route.params.item.source_id)
    .then(videoId =>{
      let url = 'https://www.dailymotion.com/embed/video/'+videoId;
      if(videoId.slice(0,4)=="http"){
        url = videoId;
      }
      this.state.video.videoId = videoId;
      setTimeout(()=>{this.setState({loading:false});API_.setTitleWeb(this.state.video.title_news);},500);
      this.props.navigation.setOptions({
        "headerRight":()=>(
                <IconButton 
                  name="chrome" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} 
                  onPress={()=>{ Linking.openURL(url); }}  />
        )
      });
    });
  }
 LoadingIndicatorView() {
    return <ActivityIndicator color='#009b88' size='large' />
  }
  render_wv(){
    console.log(this.state.video);
    if(this.state.video.videoId===false ){return null}
    let uri_ = "";
    if(this.state.video.is_external){
      uri_ = this.state.video.url;
    }else{
      const uri_dailyMotion = 'https://www.dailymotion.com/embed/video/'+this.state.video.videoId+'?quality='+this.state.videoQuality+'&info=0&logo=0&autoplay=false';
      const uri_youtube = 'https://www.youtube.com/embed/'+this.state.video.videoId+'?autoplay=0&&vq='+this.state.videoQuality+'&color='+global_theme.text_color_default;
      const uri_direct = this.state.video.videoId && this.state.video.videoId.slice(0,4)=="http" ? this.state.video.videoId : "";
      uri_ = this.state.video.is_yt ? uri_youtube : uri_dailyMotion;
      uri_ = this.state.video.source_id==3 ? uri_direct :  uri_;
    }
    if (API_.isWeb) {
      console.log(uri_);
      return <iframe src={uri_} style={{flex:1,backgroundColor: "#000",borderWidth:0,height:"100%",width:"100%"}} seamless/>;
    }
    return  <WebView 
              allowsFullscreenVideo={true}
              style={{flex:1,backgroundColor: "#000"}}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              ref={(ref) => (this.webview = ref)}
              onShouldStartLoadWithRequest={(request) => {
                if(request.url.replace("/m.","/").replace("/www.","/") != uri_.replace("/m.","/").replace("/www.","/")){
                  console.log("stopLoading");
                  return false;
                }
                return true;
              }}
              source={{ uri: uri_ }}
              userAgent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36'
              />;
  }
  render() {
    const style= this.state.video && (this.state.video.videoId || this.state.video.url) ? {height:300,width:"100%",position:'absolute'} : {width:1,height:1};
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
          <Text style={this.state.dynamic_style.article_body_t}>{this.state.video&&this.state.video.desc?this.state.video.desc :""}</Text>
          {this.state.video && (this.state.video.videoId || this.state.video.url) ? null : <Loader/> }
          <Picker
            selectedValue={this.state.videoQuality}
            style={{ height:"90%",flex:1,backgroundColor:"#2d3436",color:"#dfe6e9" }}
            onValueChange={(itemValue, itemIndex)=>{
              this.setState({videoQuality : itemValue});
            }}
          >
            <Picker.Item label={"144"} value={"144p"} key={"144"} />
            <Picker.Item label={"240"} value={"240p"} key={"240"} />
            <Picker.Item label={"360"} value={"360p"} key={"360"} />
            <Picker.Item label={"480"} value={"480p"} key={"480"} />
            <Picker.Item label={"720"} value={"hd720&hd=1"} key={"720"} />
            <Picker.Item label={"1080"} value={"hd1080&hd=1"} key={"1080"} />
        </Picker>
        </ScrollView >
    );
  }
}


export default VideoScreen;
