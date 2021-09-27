import * as React from 'react';
import { View, Picker, Modal, Button, Switch, RefreshControl } from 'react-native';
import Constants from 'expo-constants';
import ItemsList from '../components/list';
import DateTimePicker from '@react-native-community/datetimepicker';
import IconButton from "../components/IconButton";
import {styles_news,getTheme} from "../components/Themes";
class NewsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        list:[],
        page : 1,
        loading:true,
        dynamic_style : styles_news,
        source_id:1 ,
        hide_images:false,
    };
  
  this.interval_refresh = setInterval(()=>{
    if(this.state.page==1){this.get_news(false);}
    }, 80000);
  }
  componentDidMount(){
    this._isMounted=true;
    getTheme("styles_news").then(theme=>this.setState({dynamic_style:theme}));
    this.get_news();
    this.render_header();
  }
  render_header=()=>{
    this.props.navigation.setOptions({title: "News",
    "headerRight":()=>(
      <View style={{flexDirection:"row",margin:5}}>
      <Switch
        style={{justifyContent:"center",marginVertical:"auto",marginHorizontal:10,width:40}}
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={this.state.hide_images ? "#f5dd4b" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={this.update_is_hide_images}
        value={this.state.hide_images}
      />
          <IconButton 
            name="refresh" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
            this.get_news();
          }}  />
    </View>
    )
    });
  }
  update_is_hide_images=(k,v)=>{
    this.setState({hide_images:k});
    this.render_header();
    }
  refresh_list=()=>{
    const tmp_list = JSON.parse(JSON.stringify(this.state.list)) ;
    if(this._isMounted){
      this.setState({list:[]}); 
      this.setState({list:tmp_list});
    }
  }
  
  componentWillUnmount(){
    this._isMounted=false;
    clearInterval(this.interval_refresh);
  }
  
get_news =(loading=true,keep_list=false)=>{
  if(this.state.loading==false && loading){
    this.setState({loading:true});
  }
  API_.get_news(this.state.page,this.state.source_id).then(data=>{
    if(this._isMounted){
      if(keep_list){
        data = this.state.list.concat(data);
      }
      if(loading){
        this.state.loading = false;
      }
      this.setState({list:data});
    }
  });
}

  onItem_clicked =(item)=>{
    item.source = this.state.source_id;
    this.props.navigation.navigate('Article', { article: item, id:item.link.replace("n=","") });
  }
  changesource = (itemValue, itemIndex)=>{
    this.state.source_id = parseInt(itemValue);
    this.state.page=1;
    this.get_news();
  }
  render() {
    const ListHeaderComponent = (        <View style={this.state.dynamic_style.nav_container}>
      <IconButton
        disabled={this.state.loading}
       title="arrow-back-circle"  name="chevron-left" 
       size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
        if(this.state.page==1){return false;}
        this.state.page--;
        this.get_news();
      }}  />
      <Text style={this.state.dynamic_style.text}>{this.state.page}</Text>
      <IconButton 
        disabled={this.state.loading}
       title="forward"  name="chevron-right" 
       size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
        this.state.page++;
        this.get_news();
      }}  />
      <Picker
          selectedValue={this.state.source_id}
          style={{ height:"90%",backgroundColor:"#2d3436",color:"#dfe6e9" ,width:150}}
          itemStyle={{height:70,backgroundColor:"#2d3436",color:"#dfe6e9" }}
          onValueChange={this.changesource}
        >
          <Picker.Item label="Kr_MA" value={1} />
          <Picker.Item label="Kr_world" value={6} />
          <Picker.Item label="Kr_home" value={7} />
          <Picker.Item label="HP_mountakhab" value={2} />
          <Picker.Item label="HP_professionnels" value={3} />
          <Picker.Item label="HP_botola" value={4} />
          <Picker.Item label="HP_mondial" value={5} />
          
      </Picker>
    </View>);
    return (
      <View style={this.state.dynamic_style.container}>     
        <ItemsList 
          ListHeaderComponent = {ListHeaderComponent}
          ListFooterComponent = {ListHeaderComponent}
          
          refresh_list={this.refresh_list}
          refreshControl={<RefreshControl progressViewOffset={200} refreshing={this.state.loading} onRefresh={this.get_news} />}
          loading={this.state.loading} 
          list={this.state.list} 
          onclick={this.onItem_clicked} 
          key_="title_news" key_key="title_news"  
          page={this.state.page}
          hide_images={this.state.hide_images}
          />
        
      </View>
    );
  }
}

export default NewsScreen;
