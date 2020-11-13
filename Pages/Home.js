import * as React from 'react';
import { Text, View, StyleSheet, Modal, Button, TouchableOpacity, Platform } from 'react-native';
import Constants from 'expo-constants';
import ItemsList from '../components/list';
import DateTimePicker from '@react-native-community/datetimepicker';
import IconButton from "../components/IconButton";

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        list:[],
        modalVisible_match:false,
        show_datPicker : false,
        matches_date:new Date(),
        loading :true,
    };
  this.get_matches(this.state.matches_date);

  }


  get_matches(date_obj=null){
      API_.get_matches(date_obj).then(resp=>{
      if(resp["status"]=="true"){
        let list = [];
        let data = Object.keys(resp["data"]).map(k =>{
          let img = resp["data"][k] && resp["data"][k].length>0 && resp["data"][k][0]["league_badge"] && resp["data"][k][0]["league_badge"]["path"] 
                    ? resp["data"][k][0]["league_badge"]["path"] : false;
          for(let i=0;i<resp["data"][k].length;i++){
            resp["data"][k][i].time = API_.convert_time(resp["data"][k][i].time);
          }
          return {"title":k,"img":img, data:resp["data"][k]}; 
        });
        this.setState({list:data,loading:false});
        for(let i=0;i<data.length;i++){
          
        }
      }
    });
}
 onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    this.setState({show_datPicker: false ,list:[],matches_date:currentDate,loading:true});
    this.get_matches(currentDate);
    
  };
show_DateP(){
  return  (<DateTimePicker
            style={{
              color: '#fff',
              backgroundColor: '#000',
            }}
          testID="datePicker"
          value={this.state.matches_date}
          mode="date"
          display="default"
          onChange={this.onChange}
        />);
}

  render_modal_credentials(){
    
  return (          
      <Modal 
        animationType="slide"
        transparent={true}
        visible={this.state.modalVisible_match}
        onRequestClose={() => { 
            this.setState({ modalVisible_match:false,});
        } }
      >
        <View style={{flex:.4,backgroundColor:"#2c3e5066"}}></View>
        <View style={{height:400,width:"100%",backgroundColor:"#646c78"}}>
        <Text > {this.state.match ? this.state.match.id : ""} : </Text>
        </View>
        <View style={{flex:1,backgroundColor:"#2c3e5066"}}></View>

      </Modal>
      );
}
  onMatch_clicked =(item)=>{
    //API_.get_matche(item.id).then(out=>console.log(out));
    this.props.navigation.navigate('Match', { match_id: item.id });
    //this.setState({modalVisible_match:true,match:item});
  }
  render() {
    
    return (
      <View style={styles.container}>
        <Text style={styles.title}> Matches list</Text>
        <View style={{flexDirection:'row', flexWrap:'wrap', alignSelf:"center",}} >
          <IconButton 
            disabled={this.state.loading}
            title="pick date"  name="minus" size={styles.title.fontSize} style={styles.icons} onPress={()=>{
            this.state.matches_date .setDate(this.state.matches_date .getDate() - 1);
            this.setState({list:[],loading:true});
            this.get_matches(this.state.matches_date);
          }}  />
            <Text style={[styles.title,]} >
              {API_.get_date2(this.state.matches_date)}
            </Text>
          <IconButton title="pick date"  
            disabled={this.state.loading}
            name="plus" size={styles.title.fontSize} style={styles.icons} onPress={()=>{
            this.state.matches_date .setDate(this.state.matches_date .getDate() + 1);
            this.setState({list:[],loading:true});
            this.get_matches(this.state.matches_date);
          }}  />
          <IconButton 
            disabled={this.state.loading}
            title="pick date"  name="edit" size={styles.title.fontSize} style={styles.icons} onPress={()=>this.setState({show_datPicker:true})}  />
        </View>

        
        <ItemsList loading={this.state.loading} list={this.state.list} onclick={this.onMatch_clicked} key_="home_team" key_key="id"  />
        {this.state.modalVisible_match==true ? this.render_modal_credentials() : null}

      { this.state.show_datPicker ? this.show_DateP() : null }       
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

  text:{
    color : "#fff",
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

export default HomeScreen;
