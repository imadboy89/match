import React from "react";
import { View, Button, Picker,ScrollView, Image } from 'react-native';
import Loading from "../components/Loader";
import {styles_channel,getTheme,globalView_style} from "../components/Themes";
import * as ScreenOrientation from 'expo-screen-orientation';
import HLSP from "../components/HSL_player";


class ChannelScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        list:[],
        modalVisible_hlsp:false,
        player_type:1,
        key_:"en_name",
        key_key:"channel_id",
        actionType:"PLAYER",
        channel:null,
        loading:false,
        dynamic_style:styles_channel,
        p_url:"",
        movie : this.props.route.params.item,
        movie_id : this.props.route.params.id,
        actionType:"Torrent File",
        
    };
    this.magnet_link = "magnet:?xt=urn:btih:[[torrent_hash]]&amp;dn=[[torrent_name]]&amp;tr=udp%3A%2F%2Fglotorrents.pw%3A6969%2Fannounce&amp;tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&amp;tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&amp;tr=udp%3A%2F%2Fp4p.arenabg.ch%3A1337&amp;tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337";
    this.playerRef = React.createRef();
  }
  componentDidMount(){
    getTheme("styles_channel").then(theme=>this.setState({dynamic_style:theme}));
    getTheme("styles_settings").then(theme=>this.setState({dynamic_style_modals:theme}) );
    if(this.state.movie=="-"){
      this.get_Movie();
    }else{
      this.get_subs();
    }

  ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.ALL).catch(error=> {/*API_.debugMsg(error+"","warning")*/} );
  }
  get_subs(){
    API_.get_yify_subs(this.state.movie.imdb_code).then(subs=>{
      this.setState({subs:subs});
    });
  }
  get_Movie(){
      API_.get_yify_movie(this.state.movie_id).then(resp=>{
        if(resp && resp["data"] && resp["data"]["movie"] ){
          this.setState({movie:resp["data"]["movie"],loading:false});
          this.get_subs();
        }
      }).catch(err=>API_.showMsg(err,"danger"));
  }

  render_modal_HLSP(){
    if(this.state.modalVisible_hlsp==false){
      return null;
    }
    return (    
      <HLSP 
      modalVisible_hlsp={this.state.modalVisible_hlsp}
        dynamic_style={this.state.dynamic_style_modals}
        p_url={this.state.p_url}
        player_type={this.state.player_type}
        closeM={()=>{this.setState({modalVisible_hlsp:false})}}
      />
        );
  }
  open_trailer(){
    if(this.state.movie){
      const item = {is_yt:true};
      item.title_news = this.state.movie.title_long;
      item.videoId    = this.state.movie.yt_trailer_code;
      this.props.navigation.navigate('Video', { item: item });
    }
  }
  on_clicked(t){
    let url = false;
    if(t.lang){
      url = API_.get_yify_sub_dl(t.url);
    }else{
      url = this.state.actionType=="Torrent File" ? t.url : this.magnet_link.replace("[[torrent_hash]]",t.hash).replace("[[torrent_name]]",this.state.movie.title_long) ;
    }
    if(url){
      API_.open_ext_url(url);
    }

  }
  render() {
    let DL_links = this.state.movie && this.state.movie.torrents ? this.state.movie.torrents.map(t => t && t.url ? (
        <View style={{margin:8}} key={t.url}>
          <Button 
            color={t.is_external ? "#f39c12":"#3498db"}
            onPress={()=>this.on_clicked(t)} title={t.type +" - "+ t.quality+" - "+t.size+" *"+t.seeds+"*"} style={{margin:5}}></Button>
        </View>
      ):null) : null;
    let DL_subs = this.state.subs && this.state.subs.length>0 ? this.state.subs.map(s => s && s.url && s.name && s.lang && s.lang.toLocaleLowerCase()=="arabic" ? (
      <View style={{margin:8}} key={s.url}>
        <Button 
          color={"#f39c12"}
          onPress={()=>this.on_clicked(s)} title={s.name} style={{margin:5}}></Button>
      </View>
    ):null) : null;
    //let picker_options = (backup && backup.is_auth && backup.admin==true) ? ["IPTV","PLAYER","inApp-IPTV"] : ["PLAYER","inApp-IPTV"];
    const picker_options = ["Torrent File","Magnet Link"]
    const pickers = picker_options.map(o=><Picker.Item label={o} value={o} key={o}/>);

    return (
      <ScrollView style={this.state.dynamic_style.container}>
        <View style={globalView_style}>

      <View style={this.state.dynamic_style.channel_logo_v}>
        { this.state.movie && this.state.movie.medium_cover_image ?  <Image style={this.state.dynamic_style.channel_logo} source={{uri: this.state.movie.medium_cover_image}} />: null}
         </View>
         <View style={this.state.dynamic_style.info_cont}>
         { this.state.loading ? <Loading /> : 
        <View style={this.state.dynamic_style.info_cont}>
          <Text style={this.state.dynamic_style.info_text_small}> Name⠀⠀⠀⠀: {this.state.movie && this.state.movie.title_long ? this.state.movie.title_long : "-"}</Text>
          <Text style={this.state.dynamic_style.info_text_small}> Language⠀: {this.state.movie && this.state.movie.language? this.state.movie.language : "-"}</Text>
          <Text style={this.state.dynamic_style.info_text_small}> Genres⠀⠀⠀: {this.state.movie && this.state.movie.genres? this.state.movie.genres.join("-") : "-"}</Text>
          <Text style={this.state.dynamic_style.info_text_small}> Rating⠀⠀⠀: {this.state.movie && this.state.movie.rating? this.state.movie.rating+"/10": "-"}</Text>
          <Text style={this.state.dynamic_style.info_text}      > Description: </Text>
          <Text style={this.state.dynamic_style.info_text_small}>{this.state.movie && this.state.movie.description_full? this.state.movie.description_full: "-"}</Text>
          
          {this.state.movie && this.state.movie.yt_trailer_code && this.state.movie.yt_trailer_code.trim && this.state.movie.yt_trailer_code.trim()!=""
            ? 
            <View style={{margin:20,flex:1}} >
              <Button  color="#2ecc71" onPress={()=>this.open_trailer()} title="Watch trailer"></Button>
            </View>
            :null
          }
          
          <Picker
                selectedValue={this.state.actionType}
                style={{ height: 50, width: 150,backgroundColor:"#2c3e50",color:"#fff" }}
                itemStyle={{height:70,backgroundColor:"#2c3e50",color:"#fff" }}
                onValueChange={(itemValue, itemIndex) => this.setState({actionType:itemValue})}
              >
                {pickers}
          </Picker>
          {this.state.movie.magnet_link ?  
            <View style={{margin:8}}>
              <Button 
                color={"#006266"}
                onPress={()=>this.on_clicked({url:this.state.movie.magnet_link,is_magnet_link:true})} title="download magnet" style={{margin:5}}></Button>
              </View>
            : null}
          {DL_links}

          <Text style={this.state.dynamic_style.info_text}      > Subtitles (ar): </Text>
          {DL_subs}
        </View>
        }
        </View>
        {this.render_modal_HLSP()}

        </View>
        </ScrollView >
    );
  }
}

export default ChannelScreen;
