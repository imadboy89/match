import React from "react";
import {  View, StyleSheet, Modal, Button, Linking, Picker,ScrollView, Image , ImageBackground, ActivityIndicator, TouchableOpacity} from 'react-native';
import Constants from 'expo-constants';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import Loader from "../components/Loader";
import {styles_article,getTheme, global_theme,globalView_style} from "../components/Themes";
import { WebView } from 'react-native-webview';
import IconButton from "../components/IconButton";
import HLSP from "../components/HSL_player";

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
        modalVisible_hlsp : false,
        player_type : 1,
        
    };
    this.is_external_loaded = false;
    this.js_setIframeWidth = "(function() { const iframes = document.getElementsByTagName('iframe');for(let i = 0; i<iframes.length;i++ )iframes[0].width = '100%';})();";
  }
  componentDidMount(){
    this.state.video = this.state.video && this.state.video != "-" ? this.state.video : {};
    const title_news = this.state.video && this.state.video.title_news ? this.state.video.title_news : "-";
    this.state.video.title_news = this.state.video && this.state.video.name ? this.state.video.name : "-";
    this.state.video.title_news = this.state.video.title_news ? this.state.video.title_news : title_news;
    this.get_video();
    activateKeepAwake();
    let short_title = this.state.video && this.state.video.title_news && this.state.video.title_news.length > 0 ? this.state.video.title_news.slice(0,30)+"..." : "-";
    getTheme("styles_article").then(theme=>this.setState({dynamic_style:theme})); 
    this.props.navigation.setOptions({title: <Text >{short_title}</Text>});
  }
  componentWillUnmount(){
    deactivateKeepAwake();
  }
  set_extrenal_url = (uri_)=>{
    this.props.navigation.setOptions({
      "headerRight":()=>(
              <IconButton 
                name="chrome" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} 
                onPress={()=>{ API_.open_ext_url(uri_ ? uri_ : this.state.video.url); }}  />
      )
    });
  }
  get_video = async()=>{
    if(this.state.loading==false){this.setState({loading:true});}

    if(this.state.video.is_external){
      this.set_extrenal_url();
      if(this.state.video.is_radio!=true){
        try {
          const final_url = await API_.get_iframe(this.state.video.url); 
          this.state.video.url = final_url && final_url.length>0 ? final_url : this.state.video.url;
        } catch (error) {API_.showMsg(error,"danger");}
      }
      this.is_external_loaded = true;
      this.state.video.desc = this.state.video.url;
      this.setState({});
      
      return true;
    }else if(this.state.video.is_yt && this.state.video.videoId){
      setTimeout(()=>{
        this.setState({loading:false});
        API_.setTitleWeb(this.state.video.title_news);
      },500);
      return true;
    }
    let short_title = this.state.video.title_news && this.state.video.title_news.length > 0 ? this.state.video.title_news.slice(0,30)+"..." : this.state.video.title_news;
    
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
  render_modal_HLSP(){
    console.log("modalVisible_hlsp",this.state.modalVisible_hlsp);
    if(this.state.modalVisible_hlsp==false){
      return null;
    }
    return (    
      <HLSP 
        modalVisible_hlsp={this.state.modalVisible_hlsp}
        dynamic_style={this.state.dynamic_style_modals}
        p_url={this.state.video.url}
        player_type={this.state.player_type}
        closeM={()=>{this.setState({modalVisible_hlsp:false, ignore : true})}}
      />
        );
  }
  render_wv(){
    let html = false;
    if(this.state.video==undefined || this.state.video.videoId===false ){return null}
    let uri_ = "";
    if(this.state.video.is_external){
      uri_ = this.state.video.url;
      if(this.is_external_loaded==false) return;
      html = this.state.video.is_radio && this.state.video.is_html  ? '<audio id="audio" loop> <source src="'+uri_+'"  type="audio/mp3" /> </audio>' : false;
      if (this.state.video.is_hls ){
        this.state.modalVisible_hlsp = this.state.ignore ? false : true;
        return null;
      }
    }else{
      const uri_dailyMotion = 'https://www.dailymotion.com/embed/video/'+this.state.video.videoId+'?quality='+this.state.videoQuality+'&info=0&logo=0&autoplay=false';
      const uri_youtube = 'https://www.youtube.com/embed/'+this.state.video.videoId+'?autoplay=0&&vq='+this.state.videoQuality+'&color='+global_theme.text_color_default;
      const uri_direct = this.state.video.videoId && this.state.video.videoId.slice(0,4)=="http" ? this.state.video.videoId : "";
      uri_ = this.state.video.is_yt ? uri_youtube : uri_dailyMotion;
      uri_ = this.state.video.source_id==3 ? uri_direct :  uri_;
      const url_ytb = "https://www.youtube.com/watch?v="+this.state.video.videoId;
      setTimeout(() => {
        this.set_extrenal_url(this.state.video.is_yt ? url_ytb : uri_);
      }, 100);
    }
    if (API_.isWeb) {
      return <iframe src={uri_} style={{flex:1,backgroundColor: "#353b48",borderWidth:0,height:"100%",width:"100%"}} seamless/>;
    }
    const source = html ? {html:html} : {uri:uri_};
    return  <WebView 
              allowsFullscreenVideo={true}
              style={{flex:1,backgroundColor: "#353b48"}}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              ref={(ref) => (this.webview = ref)}
              onShouldStartLoadWithRequest={(request) => {
                this.webview.injectJavaScript(this.js_setIframeWidth);
                if(request.url.replace("/m.","/").replace("/www.","/") != uri_.replace("/m.","/").replace("/www.","/")){
                  console.log("stopLoading");
                  return false;
                }
                return true;
              }}
              source={ source }
              userAgent={this.state.video.is_external ? API_.user_agents["Android 10"] : API_.user_agents["Windows 10"] }
              />;
  }
  render() {
    let height = this.state.video && this.state.video.url ? 500 : 300 ;
    height = this.state.video && this.state.video.is_radio ? 200 : height;
    let style = {height: height,width:"100%",position:'absolute'};
    style = this.state.video && (this.state.video.videoId || this.state.video.url) ? style : {width:1,height:1};
    return (
      <ScrollView  style={this.state.dynamic_style.container}>
        <View style={globalView_style}>
        <ImageBackground style={{height:height,width:"100%"}} source={{uri: this.state.video.img}} >
        </ImageBackground>
        <View style={style} source={{uri: this.state.video.img}} >
        {this.render_wv()}
        </View>
        
        <View style={this.state.dynamic_style.article_v}>
          <Text style={this.state.dynamic_style.article_date_t}>{this.state.video && this.state.video.date ? this.state.video.date :""}</Text> 
          <Text style={this.state.dynamic_style.article_title_t}>{this.state.video && this.state.video.title_news ? this.state.video.title_news : ""}</Text>
          
          
        </View>
        <Text style={this.state.dynamic_style.article_body_t}>{this.state.video&&this.state.video.desc?this.state.video.desc :""}</Text>
        { this.state.video && (this.state.video.videoId || this.state.video.url || this.is_external_loaded) 
        ? null : <Loader/> }
        <Picker
          selectedValue={this.state.videoQuality}
          style={{ height:"90%",flex:1,backgroundColor:"#2d3436",color:"#dfe6e9" }}
          itemStyle={{height:70,backgroundColor:"#2d3436",color:"#dfe6e9" }}
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
        {this.render_modal_HLSP()}

        </View>
        </ScrollView >
    );
  }
}


export default VideoScreen;
