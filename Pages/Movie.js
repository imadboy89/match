import React from "react";
import { View, Button, Picker,ScrollView, Image } from 'react-native';
import Loading from "../components/Loader";
import {styles_channel,getTheme,globalView_style,styles_home} from "../components/Themes";
import * as ScreenOrientation from 'expo-screen-orientation';
import HLSP from "../components/HSL_player";
import ItemsList from '../components/list';
import IconButton from "../components/IconButton";
import { WebView } from 'react-native-webview';
import ScrollNav from "../Libs/scrollNav";
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
        loading:true,
        dynamic_style:styles_channel,
        p_url:"",
        movie : this.props.route.params.item && this.props.route.params.item!="" ? this.props.route.params.item : {},
        movie_id_ori : this.props.route.params.id,
        actionType:"Torrent File",
        source_id :parseInt(this.props.route.params.source),
    };
    this.ep_name = false;
    this.webview = false;
    this.state.movie_id = decodeURI(this.state.movie_id_ori).replace(/~s~/g,"/");
    this.magnet_link = "magnet:?xt=urn:btih:[[torrent_hash]]&amp;dn=[[torrent_name]]&amp;tr=udp%3A%2F%2Fglotorrents.pw%3A6969%2Fannounce&amp;tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&amp;tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&amp;tr=udp%3A%2F%2Fp4p.arenabg.ch%3A1337&amp;tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337";
    this.ScrollView_ref = React.createRef();

    this.origin_movie = false;
    this.fav_movie    = false;

    this.save_watching_timer = null;
    this.watching_sign = "     👁";
    
    this.screen_focus_mng();
    this.ScrollNav = false;
    this.js_setIframeWidth = "(function() { const iframes = document.getElementsByTagName('iframe');for(let i = 0; i<iframes.length;i++ )iframes[0].width = '100%';})();";
  }
  screen_focus_mng(){
    this.subscribetions=[];
    this.subscribetions.push(this.props.navigation.addListener('focus', () => {
      this.toggle_keys_listner(true);
    }));
    this.subscribetions.push(this.props.navigation.addListener('blur', () => {
      this.toggle_keys_listner(false);
    }));
  }
  componentDidMount(){
    getTheme("styles_channel").then(theme=>this.setState({dynamic_style:theme}));
    getTheme("styles_settings").then(theme=>this.setState({dynamic_style_modals:theme}) );

    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.ALL).catch(error=> {/*API_.debugMsg(error+"","warning")*/} );
    this.toggle_keys_listner(true);
    this.get_movie_details();
    this.render_header();
    
  }
  watching=()=>{
    if(this.origin_movie==false)return;
    const current_ep = this.curr_ep ? this.curr_ep.url : this.state.movie.url;

    if(this.fav_movie && (this.fav_movie.watching==undefined || !this.fav_movie.watching.includes(current_ep)) ){
      backup.save_watching_fav(this.fav_movie.url, current_ep).then(o=>this.check_is_fav());
    }
  }
  check_is_fav=()=>{
    this.fav_movie = false;
    backup.load_movie_fav(this.state.movie_id_ori).then(o=>{
      if(o && o.length>0){
        this.fav_movie = o[0];
        this.setState({});
      }
      this.render_header();
    });
  }
  componentWillUnmount(){
    this.toggle_keys_listner(false);
    clearTimeout(this.save_watching_timer);
    this.toggle_keys_listner(false);
    for(let i=0;i < this.subscribetions.length;i++){
      this.subscribetions[i]();
    }
    if(this.ScrollNav){
      this.ScrollNav.unsubscribe();
    }
  }
  toggle_keys_listner=(status)=>{
    if(API_.isWeb){
      if(status){
        document.addEventListener("keydown", this.keysListnerFunction, false);
      }else{
        document.removeEventListener("keydown", this.keysListnerFunction, false);
      }
    }
  }
  keysListnerFunction = (event)=>{
    if(API_.remote_controle){
      //alert(`Prissed key -${event.keyCode}-`);
      if(event.keyCode==403){
        this.prev_ep?this.on_clicked(this.prev_ep):undefined;
      }else if(event.keyCode==404){
        this.curr_ep?this.on_clicked(this.curr_ep):undefined;
      }else if(event.keyCode==405){
        this.save_fav();
      }else if(event.keyCode==406){
        this.next_ep?this.on_clicked(this.next_ep):undefined;
      }

    }
  }
  render_header(){
    const iconsSize = styles_home && styles_home.title ? styles_home.title.fontSize : 15;
    const _curr_ep = this.state.movie.eps==undefined || this.state.movie.eps.length==0 ? this.state.movie.url : this.state.movie.eps[this.state.movie.index].url;
    const title = this.ep_name ? this.name + " :> "+this.ep_name : this.name;
    this.props.navigation.setOptions({
      title:title,
      "headerRight":()=>(
        <View style={{flexDirection:"row",margin:5,padding:5,width:"90%"}}>
          <IconButton 
            name={_curr_ep && this.fav_movie && this.fav_movie.watching && this.fav_movie.watching.includes(_curr_ep) ? "eye" : "eye-slash"}
            size={iconsSize} 
            style={styles_home.icons} 
            onPress={this.watching}  />
          <IconButton 
            name={this.fav_movie ? "star" : "star-o"}
            size={iconsSize} 
            style={styles_home.icons} 
            onPress={this.save_fav}  />
          <IconButton 
            name="share" size={iconsSize} style={styles_home.icons} 
            onPress={()=>{
              //http://localhost:19006/Movie/4/~s~movie~s~free-spider-man-no-way-home-hd-71326?item=
              const id = this.state.movie_id.replace("/movie/","");
              const message = title;
              const url     = `Movie/${this.state.source_id}/-/${id}` ;
              const title   = title;
              API_.onShare(title,message,url);
          }}  />
        </View>
      ),

    });
  }
  save_fav = ()=>{
    backup.save_movie_fav(this.state.movie, !this.fav_movie).then(o=>this.check_is_fav());
  }
  get_movie_details(){
    if(this.state.source_id==1){
      this.get_Movie();
    }else if(this.state.source_id==4){
      this.get_Movie_MC();
    }else{
      this.get_subs();
    }
    this.toTop();
  }
  get_subs(){
    API_.get_yify_subs(this.state.movie.imdb_code).then(subs=>{
      this.setState({subs:subs});
    });
  }
  get_Movie_MC(){
    this.fav_movie = false;
    clearTimeout(this.save_watching_timer);
    this.render_header();
    this.setState({loading:true,movie:{}});
    this.state.movie_id = decodeURI(this.state.movie_id).replace(/~s~/g,"/");
    API_.get_MC_movie(this.state.movie_id).then(resp=>{
      if(resp && resp.ifram_src ){
        this.state.movie.url       = this.state.movie_id_ori;
        this.state.movie.ifram_src = resp.ifram_src;
        this.state.movie.eps       = this.state.movie.eps==undefined ? resp.eps : this.state.movie.eps;
        this.state.movie.name      = resp.name!=""? resp.name : this.state.movie.name;
        this.state.movie.index     = this.state.movie.index ? this.state.movie.index : 0 ;
        //this.state.movie.index     = resp.index ? resp.index : this.state.movie.index ;
        this.state.movie.ep_name   = resp.ep_name ? resp.ep_name : "-";
        this.state.movie.rating    = resp.rating ? resp.rating : "-";
        this.state.movie.description_full= resp.description_full ? resp.description_full : "-";
        this.state.movie.duration  = resp.duration ? resp.duration : "-";
        this.state.movie.released  = resp.released ? resp.released : "-";
        this.state.movie.quality   = resp.quality ? resp.quality : "-";
        this.state.movie.genres    = resp.genres ? resp.genres : "-";

        this.origin_movie = this.origin_movie==false ? this.state.movie :this.origin_movie;
        this.setState({loading:false});

        this.save_watching_timer = setTimeout(() => {this.watching();}, 1000*60*10);
        this.check_is_fav();
      }
    }).catch(err=>API_.showMsg(err,"danger"));
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
  on_clicked=(t)=>{
    let url = false;
    if(t.se_nbr){
      t.source = this.state.movie.source ? this.state.movie.source : 4;
      //this.props.navigation.push('Movie', { item: t, id:t.url,source:t.source });
      this.source_id = t.source;
      this.state.movie_id = t.url;
      this.item = t;
      this.state.movie.index = t.index;
      this.get_movie_details();
      return;
    }
    if(t.lang){
      url = API_.get_yify_sub_dl(t.url);
    }else{
      url = this.state.actionType=="Torrent File" ? t.url : this.magnet_link.replace("[[torrent_hash]]",t.hash).replace("[[torrent_name]]",this.state.movie.title_long) ;
    }
    if(url){
      API_.open_ext_url(url);
    }

  }

  render_movie(){
    if (API_.isWeb) { 
      return <iframe 
      src={this.state.movie.ifram_src} 
      style={{height:500,backgroundColor: "#353b48",borderWidth:0,width:"100%"}}
      allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"
      seamless/>;
    }else{
      return  <WebView 
      allowsFullscreenVideo={true}
      style={{flex:1,backgroundColor: "#353b48"}}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      ref={(ref) => (this.webview = ref)}
      onShouldStartLoadWithRequest={(request) => {
        /*
        this.webview.injectJavaScript(this.js_setIframeWidth);
        if(request.url.replace("/m.","/").replace("/www.","/") != this.state.movie.ifram_src.replace("/m.","/").replace("/www.","/")){
          console.log("stopLoading");
          return false;
        }
        */
        return true;
      }}
      source={ {uri:this.state.movie.ifram_src} }
      />;
      //userAgent={API_.user_agents["Android 10"]}
    }
  }
  render_btns(){
    if(this.state.movie==undefined || this.state.movie.eps==undefined || this.state.movie.eps.length==0) return null;
    let watching_ = this.fav_movie && this.fav_movie.watching ? this.fav_movie.watching :[];
    let last_watched = watching_.map(u=>parseInt(u.split(".").slice(-1))).sort().slice(-1);
    last_watched = last_watched && last_watched.length ? last_watched : "";
    const regexp = new RegExp(`${last_watched}$`, 'i');
    const watching_ep = this.state.movie.eps.filter(e=>e.url.match(regexp));
    const not_series = this.state.movie.eps==undefined || this.state.movie.eps.length==0;
    this.next_ep = not_series ? undefined : this.state.movie.eps[this.state.movie.index+1];
    this.prev_ep = not_series ? undefined : this.state.movie.eps[this.state.movie.index-1];
    this.curr_ep = not_series ? undefined : this.state.movie.eps[this.state.movie.index];

    this.last_watching = watching_ep && watching_ep.length ? watching_ep[0] : undefined;
    if(this.next_ep==undefined && this.prev_ep==undefined && this.curr_ep==undefined) return null;
    return <View style={{flexDirection:"row",width:"98%",justifyContent:"center"}}>
        <Button 
          style={{marginRight:100}}
          disabled={this.prev_ep==undefined}
          onPress={()=>this.on_clicked(this.prev_ep)} title="Previous Ep" style={{margin:5}}></Button>
        <View style={{width:"5%"}}></View>
        <Button 
          style={{marginRight:100}}
          disabled={this.curr_ep==undefined}
          onPress={()=>this.on_clicked(this.curr_ep)} title="Reload" style={{margin:5}}></Button>
        <View style={{width:"5%"}}></View>
        <Button 
          style={{marginRight:100}}
          disabled={this.last_watching==undefined}
          onPress={()=>this.on_clicked(this.last_watching)} title="Continue" style={{margin:5}}></Button>
        <View style={{width:"5%"}}></View>
        <Button 
          color={"#2ecc71"}
          disabled={this.next_ep==undefined}
          onPress={()=>this.on_clicked(this.next_ep)} title="Next Ep" style={{margin:5}}></Button>
    </View>;
  }
  toTop = () => {
    if( this.ScrollView_ref && this.ScrollView_ref.scrollToOffset){
      this.ScrollView_ref.scrollToOffset({ animated: true, offset: 0 });
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
    const picker_options = ["Torrent File","Magnet Link"]
    const pickers = picker_options.map(o=><Picker.Item label={o} value={o} key={o}/>);
    let img  = this.state.movie && this.state.movie.medium_cover_image ? this.state.movie.medium_cover_image : null;
    img  = this.state.movie && this.state.movie.img ? this.state.movie.img : img;
    img = img ? <Image style={this.state.dynamic_style.channel_logo} source={{uri: img}} /> : null;
    img = this.state.movie && this.state.movie.ifram_src ? this.render_movie() : img;
    let eps = null;
    if(this.state.movie && this.state.movie.eps && this.state.movie.eps.length>0){
      /*
      eps = this.state.movie.eps.map(ep=>{
        ep.name = `SE ${ep.se_nbr} - EP ${ep.ep_nbr}`;
        return <View style={{margin:8}} key={ep.url}>
        <Button 
          color={"#f39c12"}
          onPress={()=>this.on_clicked(ep)} title={ep.ep_name} style={{margin:5}}></Button>
      </View>;
      });
      */
     "👁";
      eps = this.state.movie.eps.slice().map(e=>{
        e.ep_name = e.ep_name.replace(this.watching_sign,"");
        e.ep_name+=this.fav_movie && this.fav_movie.watching && this.fav_movie.watching.includes(e.url)?this.watching_sign:"";
        return e;
      });

      this.name = this.state.movie && this.state.movie.title_long ? this.state.movie.title_long : null;
      this.ep_name = this.state.movie && this.state.movie.ep_name ? this.state.movie.ep_name : null;
      this.name = this.state.movie && this.state.movie.name ? this.state.movie.name : this.name;

      eps = <ItemsList 
      ListHeaderComponent={<Text style={this.state.dynamic_style.info_text}>Episodes : </Text>}
      loading={false}
      list={eps}
      eps_current={this.ep_name}
      onclick={this.on_clicked} 
      key_={"ep_name"} key_key={"url"}
      minWidth={800}
      />
    }

    return (
      <ScrollView style={this.state.dynamic_style.container} ref={(ref) => { 
        this.ScrollView_ref = ref; 
        this.ScrollNav = this.ScrollNav==false ? new ScrollNav(this.ScrollView_ref, this.props.navigation,"Movie") : this.ScrollNav;
        }} >
        <View style={globalView_style}>

      <View style={this.state.dynamic_style.channel_logo_v}>
        {img}
      </View>
      {this.render_btns()}
         <View style={this.state.dynamic_style.info_cont}>
         { this.state.loading ? <Loading /> : 
        <View style={this.state.dynamic_style.info_cont}>
          <Text style={this.state.dynamic_style.info_text_small}> Name⠀⠀⠀⠀: {this.name}</Text>
          <Text style={this.state.dynamic_style.info_text_small}> Episode  : {this.ep_name}</Text>
          <Text style={this.state.dynamic_style.info_text_small}> Released: {this.state.movie && this.state.movie.released? this.state.movie.released : "-"}</Text>
          <Text style={this.state.dynamic_style.info_text_small}> Language⠀: {this.state.movie && this.state.movie.language? this.state.movie.language : "-"}</Text>
          <Text style={this.state.dynamic_style.info_text_small}> Genres⠀⠀⠀: {this.state.movie && this.state.movie.genres? this.state.movie.genres.join("-") : "-"}</Text>
          <Text style={this.state.dynamic_style.info_text_small}> Rating⠀⠀⠀: {this.state.movie && this.state.movie.rating? this.state.movie.rating+"/10": "-"}</Text>
          <Text style={this.state.dynamic_style.info_text_small}> Duration  : {this.state.movie && this.state.movie.duration? this.state.movie.duration: "-"}</Text>
          <Text style={this.state.dynamic_style.info_text_small}> Quality  : {this.state.movie && this.state.movie.quality? this.state.movie.quality: "-"}</Text>
          <Text style={this.state.dynamic_style.info_text}      > Description: </Text>
          <Text style={this.state.dynamic_style.info_text_small}>{this.state.movie && this.state.movie.description_full? this.state.movie.description_full: "-"}</Text>
          
          {this.state.movie && this.state.movie.yt_trailer_code && this.state.movie.yt_trailer_code.trim && this.state.movie.yt_trailer_code.trim()!=""
            ? 
            <View style={{margin:20,flex:1}} >
              <Button  color="#2ecc71" onPress={()=>this.open_trailer()} title="Watch trailer"></Button>
            </View>
            :null
          }
          {eps}
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
                onPress={()=>this.on_clicked({url:this.state.movie.magnet_link,is_magnet_link:true})} 
                title={"Magnet Link - "+(this.state.movie.size?this.state.movie.size:".")}
                style={{margin:5}}></Button>
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
