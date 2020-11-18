import * as React from 'react';
import {  View, StyleSheet, TouchableOpacity, Button, Image, ImageBackground } from 'react-native';
import { SafeAreaView,SectionList } from 'react-native';
import Loader from "./Loader";
import {styles_list} from "./Themes";


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
      
      return (
        <View style={[styles_list.matche_container,item.live==1 ? styles_list.matche_container_live:{}]}>
          <View style={styles_list.matche_team_time}>
            <Text style={styles_list.matche_team_time_t} noFonts={true}>{item.time}</Text>
            {item.live==1 ? 
              <Text style={styles_list.matche_team_time_live}  noFonts={true}>Live</Text> 
            : null}
            
          </View>
          <View style={styles_list.matche_team_badge}>
            <Image
            style={styles_list.matche_team_logo}
            source={{uri: item.home_team_badge}}
              />
            <Image
            style={styles_list.matche_team_logo}
            source={{uri: item.away_team_badge}}
              />
          </View>

          <View style={styles_list.matche_team_names}>
            <Text style={[styles_list.matche_team_name_text,home_team_style]}>{home_team_name}</Text>
            <Text style={[styles_list.matche_team_name_text,away_team_style]}>{away_team_name}</Text>
          </View>
          <View style={styles_list.matche_team_score}>
            <Text style={styles_list.matche_team_score_text} noFonts={true} >{item.home_team_score ? item.home_team_score : "-"}</Text>
            <Text style={styles_list.matche_team_score_text} noFonts={true}>{item.away_team_score ? item.away_team_score : "-"}</Text>
          </View>
        </View>
        );
    }else if(col_key=="title_news"){ 
      
      return (
        <View style={styles_list.news_container}>
          <ImageBackground style={{flex:1,width:"100%"}} source={{uri: item.img}} >
            <View style={styles_list.news_img_v}>

            </View>
            <View style={styles_list.news_title_v}><Text style={styles_list.news_title_t}>{item.title_news}</Text></View>
          </ImageBackground>
        </View>
        );
    }else if(col_key=="category_name"){  
      return (
        <View style={styles_list.news_container}>
          <ImageBackground style={{flex:1,width:"100%"}} source={{uri: API_.domain_o+item.category_photo}} >
            <View style={styles_list.news_img_v}>

            </View>
            <View style={styles_list.news_title_v}><Text style={styles_list.news_title_t}>{item[col_key]}</Text></View>
          </ImageBackground>
        </View>

        );
    }else{
      //category_photo
      return (
        <Text style={styles_list.item}>- { col_key=="home_team" ? item["home_team"] +" - "+ item["away_team"] :item[col_key]}</Text>
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
      <View style={styles_list.container}>
        <SafeAreaView style={styles_list.container}>
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
              <View style={[{flex:1,paddingLeft:5,paddingRight:5,flexDirection:'row', flexWrap:'wrap',},styles_list.header]}>
                <Text style={[styles_list.header,{flex:7}]}>{title}</Text>
                <View style={{flex:1}}>
                { img ?  
                        <Image 
                          style={styles_list.matche_league_logo}
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
    return (<View style={styles_list.container}>

      {this.props.loading ? <Loader/> : this.render_list()}
    </View>);
  }
}


export default ItemsList;