import * as React from 'react';
import {  View, StyleSheet, TouchableOpacity, Button, Image, ImageBackground } from 'react-native';
import { SafeAreaView,SectionList } from 'react-native';
import Loader from "./Loader";
class ItemsList extends React.Component {

  
  get_item(item,col_key){

    if(col_key=="home_team"){
      const style_small = {}
      let home_team_name = item["home_team_ar"] ? item["home_team_ar"] : item["home_team"];
      let away_team_name = item["away_team_ar"] ? item["away_team_ar"] : item["away_team"];
      let home_team_style = {};
      let away_team_style = {};
      if(home_team_name.length>14){ home_team_style={fontSize:15}; }
      if(away_team_name.length>14){ away_team_style={fontSize:15}; }
      console.log(JSON.stringify(styles.matche_team_name_text.fontSize));
      
      return (
        <View style={[styles.matche_container,item.live==1 ? styles.matche_container_live:{}]}>
          <View style={styles.matche_team_time}>
            <Text style={styles.matche_team_time_t} noFonts={true}>{item.time}</Text>
            {item.live==1 ? 
              <Text style={styles.matche_team_time_live}  noFonts={true}>Live</Text> 
            : null}
            
          </View>
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
            <Text style={[styles.matche_team_name_text,home_team_style]}>{home_team_name}</Text>
            <Text style={[styles.matche_team_name_text,away_team_style]}>{away_team_name}</Text>
          </View>
          <View style={styles.matche_team_score}>
            <Text style={styles.matche_team_score_text} noFonts={true} >{item.home_team_score ? item.home_team_score : "-"}</Text>
            <Text style={styles.matche_team_score_text} noFonts={true}>{item.away_team_score ? item.away_team_score : "-"}</Text>
          </View>
        </View>
        );
    }else if(col_key=="title_news"){ 
      
      return (
        <View style={styles.news_container}>
          <ImageBackground style={{flex:1,width:"100%"}} source={{uri: item.img}} >
            <View style={styles.news_img_v}>

            </View>
            <View style={styles.news_title_v}><Text style={styles.news_title_t}>{item.title_news}</Text></View>
          </ImageBackground>
        </View>
        );
    }else if(col_key=="category_name"){  
      return (
        <View style={styles.news_container}>
          <ImageBackground style={{flex:1,width:"100%"}} source={{uri: API_.domain_o+item.category_photo}} >
            <View style={styles.news_img_v}>

            </View>
            <View style={styles.news_title_v}><Text style={styles.news_title_t}>{item[col_key]}</Text></View>
          </ImageBackground>
        </View>

        );
    }else{
      //category_photo
      return (
        <Text style={styles.item}>- { col_key=="home_team" ? item["home_team"] +" - "+ item["away_team"] :item[col_key]}</Text>
        );
    }
  }
  render_list() {
    let list = this.props.list;
    let col_key = this.props.key_ ;
    let key = this.props.key_key ;
    //console.log(list,"-");
    let onclick_hls = this.props.onclick_hls ;
    let onclick_vid = this.props.onclick_vid ;
    if (list && list[0] && list[0]["title"]==undefined){
      list=[{"title":"",data:list}];
    }
    //console.log(list,"-");

    return (
      <View style={styles.container}>
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

            renderSectionHeader={({ section: { title,img } }) => {
              return title ? (
              <View style={[{flex:1,paddingLeft:5,paddingRight:5,flexDirection:'row', flexWrap:'wrap',},styles.header]}>
                <Text style={[styles.header,{flex:7}]}>{title}</Text>
                <View style={{flex:1}}>
                { img ?  
                        <Image 
                          style={styles.matche_league_logo}
                          source={{uri: API_.domain_o+img}}
                          />
                  : null}
                </View>
              </View>
          ) : null}}
          
          />
        </SafeAreaView>
      </View>
    );
  }
  render() {

    return (<View style={styles.container}>

      {this.props.loading ? <Loader/> : this.render_list()}
    </View>);
  }
}
export default ItemsList;


const styles = StyleSheet.create({
  container: {
   flex: 1,
   width:"100%",
   backgroundColor: '#000',
   //backgroundColor: '#ff0000',
   
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
    flex:1,
    color:"#fff",
  },
  header: {
    marginRight:5,
    marginLeft:5,
    marginTop:3,
    fontSize: 20,
    backgroundColor: "#bdc3c7",
    width:"98%",
    textAlign:"right",
    //height:40,
    //alignContent:"center",
    //alignItems:"center",
    //alignSelf:"center",
  },
  title: {
    fontSize: 23
  },
  matche_container:{
    width:"100%",
    marginTop:10,
    marginBottom:5,
    flexDirection:'row', 
    flexWrap:'wrap',
    flex: 1 ,
    height:70,
    marginRight:5,
    marginLeft:5,
    borderRadius:8,
    borderWidth:1,
  },
  matche_container_live:{
    borderRadius:7,
    borderWidth: 2,
    borderColor:"#2ecc71",
  },
  matche_team_names:{
    flex: 15 ,
    backgroundColor: "#4b6584",
  },
  matche_team_name_text:{
    flex:1,
    color:"#d1d8e0",
    paddingLeft:5,
    paddingRight:5,
    paddingTop:8,
    fontSize:22,
    lineHeight:25,
    textAlign:"right",
  },
  matche_team_score:{
    flex: 2 ,
    backgroundColor: "#a5b1c2",
    alignItems:'center',
    color:"#d1d8e0",
    borderTopRightRadius:8,
    borderBottomRightRadius:8,
    alignContent:"center",

  },
  matche_team_score_text:{
    flex:1,
    fontSize:23,
    fontWeight: 'bold',
    justifyContent: 'center',

  },
  matche_team_time:{
    flex: 4 ,
    alignItems:'center',
    justifyContent: 'center',
    color:"#fff",
    borderTopLeftRadius:8,
    borderBottomLeftRadius:8,
    backgroundColor:"#2c3e50",
    textAlignVertical: 'center',
  },
  matche_team_time_t:{
    //lineHeight:20,
   
    //flex:4,
    fontSize:20,
    alignItems:'center',
    color:"#fff",
    //backgroundColor:"#ff3a3a9c",
    alignContent:"center",
  },
  matche_team_time_live:{
    //flex:3,
    fontSize:20,
    alignItems:'center',
    justifyContent: 'center',
    color:"#2ecc71",
    //backgroundColor:"#ffe738cc",
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



  news_container:{
    marginTop:5,
    marginBottom:5,
    
    height:200,
    width:"95%",
    margin:"auto",
    backgroundColor:"#34495e",
    borderRadius: 10,
  },
  news_img_v:{
    flex: 12 ,
    width:"100%",
    color:"#fff",
    alignItems:'center',
  },
  news_img_i:{
    width: "100%",
    height: "100%",
    aspectRatio: 1,
    resizeMode:"contain",
    alignItems:'center',
  },
  news_title_v:{
    width:"100%",
    flex: 2 ,
    fontSize:18,
    color:"#fff",
    backgroundColor:"#00000091"
  },
  news_title_t:{
    flex: 1 ,
    fontSize:15,
    alignItems:'center',
    justifyContent: 'center',
    alignSelf : "center",
    color:"#fff",
  },
});