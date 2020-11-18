import * as React from 'react';
import { View, StyleSheet, Modal, Button, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import ItemsList from '../components/list';
import DateTimePicker from '@react-native-community/datetimepicker';
import IconButton from "../components/IconButton";
import {styles_news} from "../components/Themes";
class NewsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        list:[],
        page : 1,
        loading:true,
    };
  //this.get_matches(this.state.matches_date);
  this.get_news();
  this.props.navigation.setOptions({title: "News",
      "headerRight":()=>(
            <IconButton 
              name="refresh" size={styles_news.title.fontSize} style={styles_news.icons} onPress={()=>{
              this.get_news(this.state.matches_date);
            }}  />
    )
  });
  }

  
get_news(){
  this.setState({list:[],loading:true});
  API_.get_news(this.state.page).then(data=>this.setState({list:data,loading:false}));
}

  onItem_clicked =(item)=>{
    this.props.navigation.navigate('Article', { article: item });
  }
  render() {
    
    return (
      <View style={styles_news.container}>     
        <ItemsList loading={this.state.loading} list={this.state.list} onclick={this.onItem_clicked} key_="title_news" key_key="link"  />
        
        <View style={styles_news.nav_container}>
          <IconButton
            disabled={this.state.loading}
           title="arrow-back-circle"  name="chevron-left" size={styles_news.title.fontSize} style={styles_news.icons} onPress={()=>{
            if(this.state.page==1){return false;}
            this.state.page--;
            this.get_news();
          }}  />
          <Text style={styles_news.text}>{this.state.page}</Text>
          <IconButton 
            disabled={this.state.loading}
           title="forward"  name="chevron-right" size={styles_news.title.fontSize} style={styles_news.icons} onPress={()=>{
            this.state.page++;
            this.get_news();
          }}  />
        </View>
      </View>
    );
  }
}

export default NewsScreen;
