import * as React from 'react';
import { View, StyleSheet, Modal, Button, TouchableOpacity, RefreshControl } from 'react-native';
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
    };
  this.get_news();
  this.interval_refresh = setInterval(()=>{
    if(this.state.page==1){this.get_news();}
    }, 60000);
  }
  componentDidMount(){
    getTheme("styles_news").then(theme=>this.setState({dynamic_style:theme}));
    this.props.navigation.setOptions({title: "News",
    "headerRight":()=>(
          <IconButton 
            name="refresh" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
            this.get_news(this.state.matches_date);
          }}  />
  )
});
  }
  componentWillUnmount(){
    clearInterval(this.interval_refresh);
  }
  
get_news =()=>{
  this.setState({loading:true});
  API_.get_news(this.state.page).then(data=>this.setState({list:data,loading:false}));
}

  onItem_clicked =(item)=>{
    this.props.navigation.navigate('Article', { article: item });
  }
  render() {
    
    return (
      <View style={this.state.dynamic_style.container}>     
        <ItemsList 
          refreshControl={<RefreshControl refreshing={this.state.loading} onRefresh={this.get_news} />}
          loading={this.state.loading} 
          list={this.state.list} 
          onclick={this.onItem_clicked} 
          key_="title_news" key_key="link"  />
        
        <View style={this.state.dynamic_style.nav_container}>
          <IconButton
            disabled={this.state.loading}
           title="arrow-back-circle"  name="chevron-left" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
            if(this.state.page==1){return false;}
            this.state.page--;
            this.get_news();
          }}  />
          <Text style={this.state.dynamic_style.text}>{this.state.page}</Text>
          <IconButton 
            disabled={this.state.loading}
           title="forward"  name="chevron-right" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
            this.state.page++;
            this.get_news();
          }}  />
        </View>
      </View>
    );
  }
}

export default NewsScreen;
