import * as React from 'react';
import { View, StyleSheet, Modal, Button, TouchableOpacity,Picker } from 'react-native';
import Constants from 'expo-constants';
import ItemsList from '../components/list';
import DateTimePicker from '@react-native-community/datetimepicker';
import IconButton from "../components/IconButton";
import {styles_news,getTheme} from "../components/Themes";

class VideosScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        list:[],
        page : 1,
        loading:true,
        dynamic_style : styles_news,
        source_id:3,
    };
  this.get_Videos();
  this.pageTokens={};

  }
  componentDidMount(){
    getTheme("styles_news").then(theme=>this.setState({dynamic_style:theme}));
    this.props.navigation.setOptions({title: "Videos",
      "headerRight":()=>(
            <IconButton 
              name="refresh" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
              this.get_Videos(this.state.matches_date);
            }}  />
    )
    });
  }
  changesource = (itemValue, itemIndex)=>{
    this.state.source_id = parseInt(itemValue);
    this.setState({page:1});
    this.get_Videos();
  }

  refresh_list=()=>{
    const tmp_list = JSON.parse(JSON.stringify(this.state.list)) ;
    this.setState({list:[]}); 
    this.setState({list:tmp_list});
  }
get_Videos_m(){
  this.setState({list:[],loading:true});
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
get_Videos(){
  if(this.state.source_id!=0){
    return this.get_Videos_m(this.state.page);
  }
  this.setState({list:[],loading:true});

  API_.get_videos(this.state.page).then(data=>this.setState({list:data,loading:false}));
}

  onItem_clicked =(item)=>{
    item.source_id = this.state.source_id;
    this.props.navigation.navigate('Video', { item: item });
  }
  render() {
    
    return (
      <View style={this.state.dynamic_style.container}>
        <View style={this.state.dynamic_style.nav_container}>
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
            style={{ height:"90%",backgroundColor:"#2d3436",color:"#dfe6e9" ,width:80}}
            onValueChange={this.changesource}
          >
            <Picker.Item label="BeIn" value={0} />
            <Picker.Item label="AlMthkb" value={1} />
            <Picker.Item label="arriadia" value={2} />
            <Picker.Item label="Mtkhb" value={3} />
        </Picker>
        </View>

        <ItemsList loading={this.state.loading} list={this.state.list} onclick={this.onItem_clicked} key_="title_news" key_key="link"  refresh_list={this.refresh_list} />
        

      </View>
    );
  }
}

export default VideosScreen;
