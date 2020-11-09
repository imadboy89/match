import * as React from 'react';
import { Text, View, StyleSheet, Image, TouchableWithoutFeedback, Button } from 'react-native';
import { FlatList } from 'react-native';


class ItemsList extends React.Component {
  render() {
    let list = this.props.list;
    let col_key = this.props.key_ ;
    let key = this.props.key_key ;
    let onclick_hls = this.props.onclick_hls ;
    let onclick_vid = this.props.onclick_vid ;
    return (
      <View style={styles.container}>
      <Text>{this.props.name}</Text>
      
        <FlatList
          data={list}
          keyExtractor={(item, index) => item["key"]}

          renderItem={({item}) => 
          <TouchableWithoutFeedback onPress={ () => {this.props.onclick(item) }}>
            <View style={{flexDirection:'row', flexWrap:'wrap'}}>
            <Text style={styles.item}>- { col_key=="home_team" ? item["home_team"] +" - "+ item["away_team"] :item[col_key]}</Text>
           {onclick_hls && <Button
                title="HSL"
                onPress={()=>{ onclick_hls(item);}}
              ></Button>
          }
          {onclick_vid && 
            <Button
            style={{}}
                title="Vid"
                onPress={()=>{ onclick_vid(item);}}
              ></Button>
          }
              </View>
          </TouchableWithoutFeedback>
          }
        />
      </View>
    );
  }
}
export default ItemsList;


const styles = StyleSheet.create({
  container: {
   flex: 1,
   paddingTop: 22
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
    flex:1,
  },
});