import * as React from 'react';
import { Text, View, StyleSheet, Modal, Button, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import ItemsList from '../components/list';
import DateTimePicker from '@react-native-community/datetimepicker';
import IconButton from "../components/IconButton";

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
      <View style={styles.container}>     
        <Button
          title="Refresh News"
          onPress={()=>{ this.get_news();}}
        ></Button> 
        <ItemsList loading={this.state.loading} list={this.state.list} onclick={this.onItem_clicked} key_="title_news" key_key="link"  />
        
        <View style={styles.nav_container}>
          <IconButton
            disabled={this.state.loading}
           title="arrow-back-circle"  name="chevron-left" size={styles.title.fontSize} style={styles.icons} onPress={()=>{
            if(this.state.page==1){return false;}
            this.state.page--;
            this.get_news();
          }}  />
          <Text style={styles.text}>{this.state.page}</Text>
          <IconButton 
            disabled={this.state.loading}
           title="forward"  name="chevron-right" size={styles.title.fontSize} style={styles.icons} onPress={()=>{
            this.state.page++;
            this.get_news();
          }}  />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#000',
    color : "#fff",
  },
  nav_container: {
    flexDirection:'row', 
    flexWrap:'wrap',
    height:30,
    justifyContent: 'center',
    backgroundColor: '#000',
    color : "#fff",
  },

  text:{
    color : "#fff",
    fontSize: 20,
    marginRight:10,justifyContent: 'center',alignItems: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color : "#d1d8e0",
  },
  icons:{
    marginLeft:10,
    marginRight:10,

  }
});

export default NewsScreen;
