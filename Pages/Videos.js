import * as React from 'react';
import { View, RefreshControl, Modal, Button, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import ItemsList from '../components/list';
import IconButton from "../components/IconButton";
import {styles_news,getTheme} from "../components/Themes";
import {Picker} from '@react-native-picker/picker';
class VideosScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        list:[],
        page : 1,
        loading:true,
        dynamic_style : styles_news,
        source_id:4,
    };
    this.pageTokens={};
    this.have_access = backup&&backup.userInfo&&backup.userInfo.iptv? backup.userInfo.iptv:false;

  }
  componentDidMount(){
    this.have_access = backup&&backup.userInfo&&backup.userInfo.iptv? backup.userInfo.iptv:false;
    getTheme("styles_news").then(theme=>this.setState({dynamic_style:theme}));
    this.props.navigation.setOptions({title: "Videos",
      "headerRight":()=>(
            <IconButton 
              name="refresh" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
              this.get_Videos(this.state.matches_date);
            }}  />
    )
    });
    this.get_Videos();
  }
  changesource = (itemValue, itemIndex)=>{
    this.state.source_id = parseInt(itemValue);
    this.state.page=1;
    if([5,6,8].includes(this.state.source_id) ){
      this.props.navigation.navigate('Movies',{source_id:this.state.source_id});
      return;
    }
    this.get_Videos();
  }

  refresh_list=()=>{
    const tmp_list = JSON.parse(JSON.stringify(this.state.list)) ;
    if(this._isMounted){
      this.setState({list:[]}); 
      this.setState({list:tmp_list});
    }
  }
get_Videos_m(){
  if(this.state.source_id==3){
    return API_.get_videos_m(this.state.page).then(o=>{
      this.setState({list:o,loading:false});
    });
  }
  if(this.pageTokens[this.state.source_id] == undefined){
    this.pageTokens[this.state.source_id] = ["",""]
  }else{
    API_.pageToken = this.pageTokens[this.state.source_id] && this.pageTokens[this.state.source_id][this.state.page] ? this.pageTokens[this.state.source_id][this.state.page] : "";
  }
  API_.get_yt_vids(this.state.source_id).then(o=>{
    this.setState({list:o,loading:false});
    this.pageTokens[this.state.source_id][this.state.page+1] = API_.nextPageToken;
    API_.nextPageToken = "";
  });
}
get_Videos = ()=>{
  if(this.state.loading==false){
    this.setState({list:[],loading:true});
  }
  if(this.state.source_id!=0){
    return this.get_Videos_m(this.state.page);
  }

  API_.get_videos(this.state.page).then(data=>this.setState({list:data,loading:false}));
}

  onItem_clicked =(item)=>{
    item.source_id = this.state.source_id;
    this.props.navigation.navigate('Video', { item: item });
  }
  render() {
    this.have_access = backup&&backup.userInfo&&backup.userInfo.iptv? backup.userInfo.iptv:false;
    const _sources = {
      0:"BeIn",
      1:"AlMthkb",
      2:"Arriadia",
      4:"heSport",
      9:"RadioMars",
    };
    if(this.have_access==true){
      _sources[8] = "Movies_MC";
      _sources[5] = "Movies_YIFY";
      _sources[6] = "Movies_PB";
      _sources[7] = "FIFATV";
    }
    const sources_picker = Object.keys(_sources).map(k=><Picker.Item label={_sources[k]} value={k} key={_sources[k]} />);
    const ListFooterComponent = (        <View style={this.state.dynamic_style.nav_container}>
      <IconButton
        disabled={this.state.loading}
       title="arrow-back-circle"  name="chevron-left" 
       size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
        if(this.state.page==1){return false;}
        this.state.page--;
        this.get_Videos();
      }}  />
      <Text style={this.state.dynamic_style.text}>{this.state.page}</Text>
      <IconButton 
        disabled={this.state.loading}
       title="forward"  name="chevron-right" 
       size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
        this.state.page++;
        this.get_Videos();
      }}  />
      
      <Picker
          selectedValue={this.state.source_id}
          style={{ height:"90%",backgroundColor:"#2d3436",color:"#dfe6e9" ,flex:1}}
          itemStyle={{height:70,backgroundColor:"#2d3436",color:"#dfe6e9",width:"99%" }}
          onValueChange={this.changesource}
        >{sources_picker}</Picker>

    </View>);
    return (
      <View style={this.state.dynamic_style.container}>

        <ItemsList 
          ListHeaderComponent = {ListFooterComponent}
          ListFooterComponent = {ListFooterComponent}
          refreshControl={<RefreshControl progressViewOffset={200} refreshing={this.state.loading} onRefresh={this.get_Videos} />}
          loading={this.state.loading} 
          list={this.state.list} 
          onclick={this.onItem_clicked} 
          key_="title_news" key_key="link"  
          refresh_list={this.refresh_list} 
          page={this.state.page}
          />
        

      </View>
    );
  }
}

export default VideosScreen;
