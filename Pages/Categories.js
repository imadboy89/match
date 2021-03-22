import * as React from 'react';
import { Text, View, StyleSheet, Picker, Button, Linking } from 'react-native';
import { CommonActions } from '@react-navigation/native';

import Constants from 'expo-constants';
import ItemsList from '../components/list';
import ReactHlsPlayer from "react-hls-player";
import Video from 'expo';
import IconButton from "../components/IconButton";
import {styles_home} from "../components/Themes";
import BackUp from '../Libs/BackUp';

let list = [

          ];
class CategoriesScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        list:list,
        modalVisible_match:false,
        player_type:1,
        key_:"category_name",
        key_key:"category_id",
        loading:true,
        page:1,
        source_id:1,
    };
    this.end = false;
    this.get_cats(1);
  }
  componentDidMount(){
    this.props.navigation.setOptions({title: "Channels categroires",
        "headerRight":()=>(
              <IconButton 
                name="refresh" size={styles.title.fontSize} style={styles.icons} onPress={()=>{
                this.get_cats(1);
              }}  />
      )
    });
  }
  refresh_list=()=>{
    const tmp_list = JSON.parse(JSON.stringify(this.state.list)) ;
    this.setState({list:[]}); 
    this.setState({list:tmp_list});
  }
  show_channels = (category) => {
    this.props.navigation.navigate('channels',{category_id:category.category_id,category_name: category.category_name});
  }
  get_cats(page=1){
    if(this.state.source_id == 2){
      return this.get_externa_ch();
    }else if(this.state.source_id == 3){
      return this.get_IPTV_ch();
    }else if(this.state.source_id == 4){
      return this.get_local_saved_chs();
    }else if(this.state.source_id == 5){
      return this.get_IPTV();
    }
    if(this.end==true){return false;}
    API_.get_categories(page).then(resp=>{
      if(resp && resp.data && resp["data"].length>0){
        let list = [];
        let data = resp["data"];
        data = page==1 ? data : this.state.list .concat(data);
        this.setState({list:data, key_:"category_name",key_key:"category_id",loading:false});
        //this.get_cats(page+1);
      }else{
        this.end=true;
      }
    });

  }
  get_local_saved_chs=async()=>{
    const list = Object.values(API_.channels_dict).map(row => {
      row.category_name = row.name;
      row.category_photo = row.channel_photo;
      return row;
    });
    setTimeout(()=>{this.setState({list: list, key_:"category_name",key_key:"name",loading:false})}, 300);
  }
  get_IPTV=async()=>{
    let items = await API_.get_IPTV();
    let chs_list = [];
    if(items==undefined){
      return ;
    }
    for(let i=0;i<items.length;i++){
      const item = items[i];
      const ch = {"channel_photo":"","name":"", "url":"","id":"","is_external":false,"category_name":"","category_photo":"","category_id":""};
      ch.name = item.name;
      ch.channel_photo = item.img;
      ch.category_photo = item.img;
      ch.quality = item.quality ? item.quality : "";
      ch.id = item.name+"-"+item.quality;
      ch.category_id = item.name+"-"+item.quality;
      ch.category_name = item.name;
      ch.ch_item = item;
      ch.channel_servers = [{id:item.link,name:item.name,SecureUrl:item.link},];
      chs_list.push(ch);
    }
    this.setState({list:chs_list, key_:"category_name",key_key:"category_id",loading:false});
  }
  get_IPTV_ch=async()=>{
    let chs = await backup.load_iptv();
    let chs_list = [];
    for(let i=0;i<chs.length;i++){
      const ch = {"channel_photo":"","name":"", "url":"","id":"","is_external":false,"category_name":"","category_photo":"","category_id":""};
      ch.name = chs[i].name;
      ch.channel_photo = chs[i].channel_photo;
      ch.category_photo = ch.channel_photo;
      ch.quality = chs[i].quality;
      ch.id = chs[i].name+"-"+chs[i].quality;
      ch.category_id = chs[i].name+"-"+chs[i].quality;
      ch.category_name = chs[i].name;
      ch.ch_item = chs[i];
      chs_list.push(ch);
    }
    this.setState({list:chs_list, key_:"category_name",key_key:"category_id",loading:false});
  }
  async get_externa_ch(){
    if(API_.external_channels==undefined){
      await API_.load_external_channels();
    }
    setTimeout(() => {
      this.setState({list:Object.values(API_.external_channels), key_:"category_name",key_key:"category_id",loading:false});
    }, 300);
  }

  onchannel_clicked =(item)=>{
    if(item.url){
      //API_.open_ext_url(item.url);
      this.props.navigation.navigate('Video', { item: item });
    }else{
      if(this.state.source_id==3){
        this.props.navigation.navigate('Channel', { channel_id: item.ch_item.channel_id,channel_photo:item.ch_item.channel_photo,ch_item : item.ch_item });
      }else if(this.state.source_id==4 || this.state.source_id==5){
        //API_.channels_dict[API_.fix_channel_name(ch_ob.en_name)]
        console.log(item);
        this.props.navigation.navigate('Channel', { channel_id: item.channel_id,channel_photo:item.channel_photo,ch_item : item });
      }else{
        this.props.navigation.navigate('Channels',{category_id:item.category_id,category_name: item.category_name});
      }
    }

  }
  changesource = (itemValue, itemIndex)=>{
    this.state.source_id = parseInt(itemValue);
    this.state.page=1;
    this.get_cats();
  }
  render() {
    if(styles.constructor === Object && Object.entries(styles).length==0){Styles();}
    const sources = (      <Picker
      selectedValue={this.state.source_id}
      style={{ height:40,backgroundColor:"#2d3436",color:"#dfe6e9" ,width:150}}
      onValueChange={this.changesource}
    >
      <Picker.Item label="Almtch" value={1} />
      <Picker.Item label="kora-live" value={2} />
      <Picker.Item label="inApp-IPTV" value={3} />
      <Picker.Item label="local-IPTV" value={4} />
      <Picker.Item label="IPTV" value={5} />
  </Picker>);
    return (
      <View style={styles.container}>
        <ItemsList
          ListHeaderComponent={sources}
          minWidth={160}
          refresh_list={this.refresh_list}
          loading={this.state.loading}
          list={this.state.list} 
          onclick={this.onchannel_clicked} 
          key_={this.state.key_} key_key={this.state.key_key}
          disable_toTop={true}
          onEndReached={(info: {distanceFromEnd: number})=>{
            if(this.state.source_id==1){
              this.state.page = this.state.page+1;
              this.get_cats(this.state.page);
            }
            }}
          /> 
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    //paddingTop: Constants.statusBarHeight,
    backgroundColor: '#000',
    color : "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color : "#fff",
  },
  icons:styles_home.icons,
});
export default CategoriesScreen;
