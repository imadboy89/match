import * as React from 'react';
import { Text, View, StyleSheet, Modal, Button, Linking } from 'react-native';
import { CommonActions } from '@react-navigation/native';

import Constants from 'expo-constants';
import ItemsList from '../components/list';
import ReactHlsPlayer from "react-hls-player";
import Video from 'expo';

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
    };
    this.get_cats(1);
  }
  show_channels = (category_id) => {
    this.props.navigation.navigate('channels',{category_id:category_id, });
  }
  get_cats(page=1){
    API_.get_categories(page).then(resp=>{
      if(resp["data"].length>0){
        let list = [];
        let data = resp["data"];
        data = page==1 ? data : this.state.list .concat(data);
        this.setState({list:data, key_:"category_name",key_key:"category_id"});
        this.get_cats(page+1);
      }
    });

  }

  onchannel_clicked =(item)=>{
    this.props.navigation.navigate('Channels', { category_id: item.category_id });


    //this.props.navigation.navigate('channels',{category_id:item.category_id, });
    /*
    API_.get_channels(item.category_id).then(resp=>{
      if(resp["data"].length>0){
        for (let i=0;i<resp["data"].length;i++){
          API_.get_channel(resp["data"][i].channel_id).then(resp=>{
            this.chanels_data[i].en_name = resp["data"].en_name;
            this.setState({list:[]});
            this.setState({list:this.chanels_data,key_:"en_name",key_key:"channel_id"});
          });
        }
        let list = [];
        this.chanels_data = resp["data"];
        this.setState({list:this.chanels_data,key_:"en_name",key_key:"channel_id"});
      }
    });
    */
  }
  render() {
    return (
      <View style={styles.container}>
        <Text> Matches list {this.state.modalVisible_match}</Text>
        <Button
          title="Categories"
          onPress={()=>{ this.get_cats();}}
        ></Button>
        <ItemsList 
          list={this.state.list} 
          onclick={this.onchannel_clicked} 
          key_={this.state.key_} key_key={this.state.key_key}
          />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CategoriesScreen;
