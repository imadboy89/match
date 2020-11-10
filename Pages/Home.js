import * as React from 'react';
import { Text, View, StyleSheet, Modal, Button } from 'react-native';
import Constants from 'expo-constants';
import ItemsList from '../components/list';
import DateTimePicker from '@react-native-community/datetimepicker';


class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        list:[],
        modalVisible_match:false,
        show_datPicker : false
    };
  this.get_matches(new Date(2020,10,7));
  }
get_matches(date_obj=null){
      API_.get_matches(date_obj).then(resp=>{
      if(resp["status"]=="true"){
        let list = [];
        let data = Object.keys(resp["data"]).map(k =>{
          return {"title":k, data:resp["data"][k]}; 
        });
        this.setState({list:data});
        for(let i=0;i<data.length;i++){
          
        }
      }
    });
}
 onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    this.date = currentDate;
    this.setState({show_datPicker:false,list:[]});
    this.get_matches(currentDate);
  };
show_DateP(){
  this.date = this.date ? this.date : new Date() ;
  return  (<DateTimePicker
          testID="datePicker"
          value={new Date()}
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
    this.setState({modalVisible_match:true,match:item});
  }
  render() {
    return (
      <View style={styles.container}>
        <Text> Matches list {this.state.modalVisible_match}</Text>
        <Button title="pick date" onPress={()=>this.setState({show_datPicker:true})} ></Button>

        <ItemsList list={this.state.list} onclick={this.onMatch_clicked} key_="home_team" key_key="id"/>
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

export default HomeScreen;
