import * as React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Button, Image } from 'react-native';
import { SafeAreaView,SectionList } from 'react-native';


class ItemsList extends React.Component {

  
  get_item(item,col_key){
    if(col_key=="home_team"){
      return (
        <View style={styles.matche_container}>
          <View style={styles.matche_team_time}><Text style={styles.matche_team_time}>{item.time}</Text></View>
          <View style={styles.matche_team_badge}>
            <Image
            style={styles.matche_team_logo}
            source={{uri: item.home_team_badge}}
              />
            <Image
            style={styles.matche_team_logo}
            source={{uri: item.away_team_badge}}
              />
          </View>

          <View style={styles.matche_team_names}>
            <Text style={styles.matche_team_name}>{ item["home_team_ar"] ? item["home_team_ar"] : item["home_team"]}</Text>
            <Text style={styles.matche_team_name}>{ item["away_team_ar"] ? item["away_team_ar"] : item["away_team"]}</Text>
          </View>
          <View style={styles.matche_team_score}>
            <Text style={styles.matche_team_score_text}>{item.home_team_score ? item.home_team_score : "-"}</Text>
            <Text style={styles.matche_team_score_text}>{item.away_team_score ? item.away_team_score : "-"}</Text>
          </View>
        </View>
        );
    }else{  
      return (
        <Text style={styles.item}>- { col_key=="home_team" ? item["home_team"] +" - "+ item["away_team"] :item[col_key]}</Text>
        );
    }
  }
  render() {
    let list = this.props.list;
    let col_key = this.props.key_ ;
    let key = this.props.key_key ;
    let onclick_hls = this.props.onclick_hls ;
    let onclick_vid = this.props.onclick_vid ;
    if (list[0] && list[0]["title"]==undefined){
      list=[{"title":"",data:list}];
    }
    
    return (
      <View style={styles.container}>
      <Text>{this.props.name}</Text>
      
        <SafeAreaView style={styles.container}>
          <SectionList
            sections={list}
            keyExtractor={(item, index) => item[key]}

            renderItem={({item}) => 
            <TouchableOpacity onPress={ () => {this.props.onclick(item) }}>
              <View style={{flexDirection:'row', flexWrap:'wrap'}}>
              {this.get_item(item,col_key)}
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
            </TouchableOpacity>
            }

            renderSectionHeader={({ section: { title,img } }) => (
              <View style={[{flex:1,paddingLeft:5,paddingRight:5,flexDirection:'row', flexWrap:'wrap',},styles.header]}>
                <View style={{flex:1}}>
                { img ?  
                        <Image 
                          style={styles.matche_league_logo}
                          source={{uri: API_.domain_o+img}}
                          />
                  : null}
                </View>
                <Text style={[styles.header,{flex:10}]}>{title}</Text>
              </View>
          )}
          
          />
        </SafeAreaView>
      </View>
    );
  }
}
export default ItemsList;


const styles = StyleSheet.create({
  container: {
   flex: 1,
   paddingTop: 10,
   backgroundColor: '#000',
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
    flex:1,
    color:"#fff",
  },
  header: {
    fontSize: 25,
    backgroundColor: "#778ca3"
  },
  title: {
    fontSize: 23
  },
  matche_container:{
    marginTop:5,
    marginBottom:5,
    flexDirection:'row', 
    flexWrap:'wrap',
    flex: 1 ,
    height:50
  },
  matche_team_names:{
    flex: 15 ,
    fontSize:25,
    backgroundColor: "#4b6584"
  },
  matche_team_score:{
    flex: 2 ,
    backgroundColor: "#a5b1c2",
    alignItems:'center',
    color:"#d1d8e0",
    fontSize:25,
  },
  matche_team_time:{
    flex: 4 ,
    fontSize:18,
    alignItems:'center',
    justifyContent: 'center',
    color:"#fff",
  },
  matche_team_name:{
    color:"#d1d8e0",
    paddingLeft:5,
    paddingRight:5,
    fontSize:18,
  },
  matche_team_logo:{
    //margin :3,
    width: "100%",
    height: "45%",
    aspectRatio: 1,
    resizeMode:"contain"
  },
  matche_league_logo:{
    //margin :3,
    width: "100%",
    height: "100%",
    aspectRatio: 1,
    resizeMode:"contain",
  },
  matche_team_badge:{
    flex: 2 ,
    backgroundColor: "#4b6584",
    alignItems:'center',
    color:"#d1d8e0",
    justifyContent: 'center',
  },
  matche_team_score_text:{
    fontSize:18,
    fontWeight: 'bold',
  },
  
});