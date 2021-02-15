import * as React from 'react';
import { Text, View, StyleSheet, Modal, Button, Linking } from 'react-native';
import { CommonActions } from '@react-navigation/native';

import Constants from 'expo-constants';
import ItemsList from '../components/list';
import ReactHlsPlayer from "react-hls-player";
import Video from 'expo';
import IconButton from "../components/IconButton";

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
    if(this.end==true){return false;}
    API_.get_categories(page).then(resp=>{
      if(resp["data"].length>0){
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

  onchannel_clicked =(item)=>{
    this.props.navigation.navigate('Channels',{category_id:item.category_id,category_name: item.category_name});

  }
  render() {
    if(styles.constructor === Object && Object.entries(styles).length==0){Styles();}
    return (
      <View style={styles.container}>
        <ItemsList
          minWidth={160}
          refresh_list={this.refresh_list}
          loading={this.state.loading}
          list={this.state.list} 
          onclick={this.onchannel_clicked} 
          key_={this.state.key_} key_key={this.state.key_key}
          disable_toTop={true}
          onEndReached={(info: {distanceFromEnd: number})=>{
            this.state.page = this.state.page+1;
            this.get_cats(this.state.page);
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
});
export default CategoriesScreen;
