import * as React from 'react';
import { Text, View, StyleSheet, Modal } from 'react-native';
import Constants from 'expo-constants';
import ItemsList from '../components/list';

let list = {};
class MatchScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        list:list,
        modalVisible_match:false
    };
    /*
    API_.get_matches().then(resp=>{
      if(resp["status"]=="true"){
        let list = [];
        let data = resp["data"]["الدوري الاوروبي"];
        this.setState({list:data});
        for(let i=0;i<data.length;i++){
          
        }
      }
    });
    */
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
      <Text > : </Text>
      </View>
      <View style={{flex:1,backgroundColor:"#2c3e5066"}}></View>

      </Modal>
      );
}

  render() {
    return (
      <View style={styles.container}>
        <Text> Matches list</Text>
        <ItemsList list={this.state.list} />
        {this.render_modal_credentials()}
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

export default MatchScreen;
