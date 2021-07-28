import React from "react";
import { View, Button, Picker,ScrollView, Image } from 'react-native';
import Loading from "../components/Loader";
import {styles_channel,getTheme} from "../components/Themes";
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
        movie_id : this.props.route.params.id
        
    };
    this.playerRef = React.createRef();
  }
  componentDidMount(){
    getTheme("styles_channel").then(theme=>this.setState({dynamic_style:theme}));
    getTheme("styles_settings").then(theme=>this.setState({dynamic_style_modals:theme}) );
    if(this.state.movie=="-"){
      this.get_Movie();
    }
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.ALL).catch(error=> API_.debugMsg(error+"","warning") );
  }
  get_Movie(){
      API_.get_yify_movie(this.state.movie_id).then(resp=>{
        if(resp && resp["data"] && resp["data"]["movie"] ){
          this.setState({movie:resp["data"]["movie"],loading:false});
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

  on_clicked(t){
    API_.open_ext_url(t.url);

  }
  render() {
    let DL_links = this.state.movie && this.state.movie.torrents ? this.state.movie.torrents.map(t => t && t.url ? (
        <View style={{margin:8}} key={t.url}>
          <Button 
            color={t.is_external ? "#f39c12":"#3498db"}
            onPress={()=>this.on_clicked(t)} title={t.type +" - "+ t.quality+" - "+t.size} style={{margin:5}}></Button>
        </View>
      ):null) : null;
    let picker_options = (backup && backup.is_auth && backup.admin==true) ? ["IPTV","PLAYER","inApp-IPTV"] : ["PLAYER","inApp-IPTV"];
    const pickers = picker_options.map(o=><Picker.Item label={o} value={o} key={o}/>);

    return (
      <ScrollView style={this.state.dynamic_style.container}>
      <View style={this.state.dynamic_style.channel_logo_v}>
        { this.state.movie && this.state.movie.medium_cover_image ?  <Image style={this.state.dynamic_style.channel_logo} source={{uri: this.state.movie.medium_cover_image}} />: null}
         </View>
         <View style={this.state.dynamic_style.info_cont}>
         { this.state.loading ? <Loading /> : 
        <View style={this.state.dynamic_style.info_cont}>
          <Text style={this.state.dynamic_style.info_text}> Name : {this.state.movie && this.state.movie.title_long ? this.state.movie.title_long : "-"}</Text>
          <Text style={this.state.dynamic_style.info_text}> Language :{this.state.movie && this.state.movie.language? this.state.movie.language : "-"}</Text>
          <Text style={this.state.dynamic_style.info_text}> Genres :{this.state.movie && this.state.movie.genres? this.state.movie.genres.join("-") : "-"}</Text>
          <Text style={this.state.dynamic_style.info_text}> Rating :{this.state.movie && this.state.movie.rating? this.state.movie.rating+"/10": "-"}</Text>
          <Text style={this.state.dynamic_style.info_text}> Description : </Text>
          <Text style={this.state.dynamic_style.info_text}>{this.state.movie && this.state.movie.description_full? this.state.movie.description_full: "-"}</Text>
          
          
          <Picker
                selectedValue={this.state.actionType}
                style={{ height: 50, width: 150,backgroundColor:"#2c3e50",color:"#fff" }}
                itemStyle={{height:70,backgroundColor:"#2c3e50",color:"#fff" }}
                onValueChange={(itemValue, itemIndex) => this.setState({actionType:itemValue})}
              >
                {pickers}
          </Picker>

          {DL_links}
        </View>
        }
        </View>
        {this.render_modal_HLSP()}
        </ScrollView >
    );
  }
}

export default ChannelScreen;
