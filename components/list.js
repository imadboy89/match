import * as React from 'react';
import {  View, StyleSheet, TouchableOpacity, Button, Image, ImageBackground } from 'react-native';
import { SafeAreaView,SectionList } from 'react-native';
import Loader from "./Loader";
import {styles_list,getTheme} from "./Themes";
import IconButton from "../components/IconButton";

class ItemsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dynamic_style:styles_list,
      header_to_hide:[],
    }
    this.list = [];
    getTheme("styles_list").then(theme=>this.setState({dynamic_style:theme}));
  }
  get_item(item,col_key){
    if(col_key=="home_team"){
      const style_small = {}
      let home_team_name = item["home_team_ar"] ? item["home_team_ar"] : item["home_team"];
      let away_team_name = item["away_team_ar"] ? item["away_team_ar"] : item["away_team"];
      let home_team_style = {};
      let away_team_style = {};
      const max_lenght = API_.isWeb ? 15 : 20 ;
      if(home_team_name.length>max_lenght){ home_team_style={fontSize:15}; }
      if(away_team_name.length>max_lenght){ away_team_style={fontSize:15}; }
      let time=0;
      //console.log(this.props.notifications_matches[item.id]);
      let style_extra = this.props.notifications_matches && this.props.notifications_matches[item.id]!=undefined ? this.state.dynamic_style.matche_container_notif : {};
      style_extra = item.live==1 ? this.state.dynamic_style.matche_container_live: style_extra;
      return (
        <View style={[this.state.dynamic_style.matche_container,style_extra]}>
          <View style={this.state.dynamic_style.matche_team_time}>
            <Text style={this.state.dynamic_style.matche_team_time_t} noFonts={true}>{item.time}</Text>
            {item.live==1 ? 
              <Text style={this.state.dynamic_style.matche_team_time_live}  noFonts={true}>{item.time_played+"'"}</Text> 
            : null}
            
          </View>
          <View style={this.state.dynamic_style.matche_team_badge}>
            <Image
            style={this.state.dynamic_style.matche_team_logo}
            source={{uri: item.home_team_badge}}
              />
            <Image
            style={this.state.dynamic_style.matche_team_logo}
            source={{uri: item.away_team_badge}}
              />
          </View>

          <View style={this.state.dynamic_style.matche_team_names}>
            <Text style={[this.state.dynamic_style.matche_team_name_text,home_team_style]}>{home_team_name}</Text>
            <Text style={[this.state.dynamic_style.matche_team_name_text,away_team_style]}>{away_team_name}</Text>
          </View>
          <View style={this.state.dynamic_style.matche_team_score}>
            <Text style={this.state.dynamic_style.matche_team_score_text} noFonts={true} >{item.home_team_score ? item.home_team_score : "-"}</Text>
            <Text style={this.state.dynamic_style.matche_team_score_text} noFonts={true}>{item.away_team_score ? item.away_team_score : "-"}</Text>
          </View>
        </View>
        );
    }else if(col_key=="title_news" || col_key=="league_name"){ 
      const fav_icon = this.get_fav_icon(item[col_key]);
      let date = item.date && item.date.slice && item.date.slice(0,1) =='#' ? API_.get_date2(new Date(item.date.replace("#","") * 1000)) : item.date ;
      return (
        <View style={this.state.dynamic_style.news_container}>
          <ImageBackground style={{flex:1,width:"100%"}} source={{uri: item.img}} >
          { item.date ? <Text style={{backgroundColor:"#00000091",color:"#fff",width:90,textAlign:"center",}}>{date}</Text> : null}
          {fav_icon!=null ? fav_icon : null}
            <View style={this.state.dynamic_style.news_img_v}>

            </View>
            <View style={this.state.dynamic_style.news_title_v}><Text style={this.state.dynamic_style.news_title_t} numberOfLines={1}>{item[col_key]}</Text></View>
          </ImageBackground>
        </View>
        );
    }else if(col_key=="category_name"){  
      return (
        <View style={this.state.dynamic_style.news_container}>
          <ImageBackground style={{flex:1,width:"100%"}} source={{uri: API_.domain_o+item.category_photo}} >
            <View style={this.state.dynamic_style.news_img_v}>

            </View>
            <View style={this.state.dynamic_style.news_title_v}>
              <Text style={this.state.dynamic_style.news_title_t}>{item[col_key]}</Text>
            </View>
          </ImageBackground>
        </View>

        );
    }else{
      return (
        <Text style={this.state.dynamic_style.item}>- { col_key=="home_team" ? item["home_team"] +" - "+ item["away_team"] :item[col_key]}</Text>
        );
    }
  }
  get_fav_icon(title){
    let fav_icon = null;
    if(this.props.favorite && this.props.set_fav){
      const league_id =  API_ && API_.leagues_dict[title] ? API_.leagues_dict[title].league_id : 0 ;
      fav_icon = this.props.favorite.includes(league_id) ? 
        <IconButton name="star" onPress={()=>{this.props.set_fav(league_id)}} style={{position: 'absolute'}}/> : 
        <IconButton name="star-o" onPress={()=>{this.props.set_fav(league_id)}} style={{position: 'absolute'}}/> ;
    }
    return fav_icon;
  }
  setHidden(title){
    if(this.props.favorite==undefined && this.props.set_fav==undefined){
      return ;
    }
    this.state.header_to_hide = [];
    for(let i=0;i<this.list.length;i++){
      const title = this.list[i]["title"] ;
      const league_id =  API_ && API_.leagues_dict[title] ? API_.leagues_dict[title].league_id : 0 ;
      if(this.props.favorite.includes(league_id) == false){
        this.state.header_to_hide.push(title);
      }
    }
  }
  render_list() {
    let is_new = JSON.stringify(this.list) == JSON.stringify(this.props.list) ? false : true;
    this.list = this.props.list;
    let col_key = this.props.key_ ;
    let key = this.props.key_key ;
    let onclick_hls = this.props.onclick_hls ;
    let onclick_vid = this.props.onclick_vid ;
    if (this.list && this.list[0] && this.list[0]["title"]==undefined){
      this.list=[{"title":"",data:this.list}];
    }
    
    if(is_new){
      this.setHidden();
    }
    return (
      <View style={this.state.dynamic_style.container}>
        <SafeAreaView style={this.state.dynamic_style.container}>
          <SectionList
            refreshControl={this.props.refreshControl}
            sections={this.list}
            keyExtractor={(item, index) => item[key]}

            renderItem={({item}) => this.state.header_to_hide.includes(item.league) ? null : 
              <TouchableOpacity 
                activeOpacity={0.5}
                onPress={ () => {this.props.onclick(item) }} onLongPress={ () => {this.props.onLongPress?this.props.onLongPress(item):null; }} >
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
              const fav_icon = this.get_fav_icon(title);
              
              return title ? (
              <View style={[{flex:1,paddingLeft:5,paddingRight:5,flexDirection:'row', flexWrap:'wrap',},this.state.dynamic_style.header]}>
                {this.props.onLeaguePressed ? 
                  <IconButton name="list-ol" 
                    size={this.state.dynamic_style.header.fontSize} 
                    onPress={() => {this.props.onLeaguePressed(title,img) }}/>
                : null}
                <TouchableOpacity
                  style={{flex:7}}
                  activeOpacity={0.9}
                  onPress={()=>{
                    if(this.state.header_to_hide.includes(title)){
                      this.state.header_to_hide=this.state.header_to_hide.filter(x=>{if(x!=title)return x});
                    }else{
                      this.state.header_to_hide.push(title);
                    }
                    this.setState({});
                    }}
                >
                <Text style={[this.state.dynamic_style.header,{flex:7}]} numberOfLines={1}>{title}</Text>
                </TouchableOpacity>
                {fav_icon}
                <View style={{flex:1}}>
                { img ?  
                        <Image 
                          style={this.state.dynamic_style.matche_league_logo}
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
    return (<View style={this.state.dynamic_style.container}>
      {this.props.loading && this.props.refreshControl==undefined  ? <Loader/> : this.render_list()}
    </View>);
  }
}


export default ItemsList;