import * as React from 'react';
import {  View, StyleSheet, TouchableOpacity, Button, Image, ImageBackground,ScrollView  } from 'react-native';
import { SafeAreaView,SectionList, FlatList, Dimensions,TouchableHighlight } from 'react-native';
import Loader from "./Loader";
import {styles_list,getTheme,global_theme} from "./Themes";
import IconButton from "../components/IconButton";

class ItemsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dynamic_style:false,
      header_to_hide:[],
      numColumns:1,
      list : [],
    }
    this.minWidth = this.props.minWidth ? this.props.minWidth : 300; 
    this.list = [];
    this.check_width(false);

  }
  componentDidMount=()=>{
    getTheme("styles_list").then(theme=>this.setState({dynamic_style:theme}));
    //AppState.addEventListener("resize", this.check_width.bind(this));
    Dimensions.addEventListener("change",this.check_width)
  }
  componentWillUnmount(){
    Dimensions.removeEventListener("change",this.check_width)
  }
  check_width=(render=true)=>{
    if(this.windowWidth == Dimensions.get('window').width){return ;}
    this.windowWidth = Dimensions.get('window').width;
    //this.setState({numColumns:this.windowWidth/500});
    this.state.numColumns = parseInt(this.windowWidth/this.minWidth);
    this.state.numColumns = this.state.numColumns>=1 ? this.state.numColumns : 1;
    this.elem_width = parseInt(this.windowWidth/this.state.numColumns)-5;
    if(render && this.props.refresh_list){
      this.props.refresh_list(1)
    }
    return true;
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
      const fav_icon = this.get_fav_icon(item[col_key],col_key=="league_name"? item.id : 0,true);
      let date = item.date && item.date.slice && item.date.slice(0,1) =='#' ? API_.get_date2(new Date(item.date.replace("#","") * 1000)) : item.date ;
      const resizemode = col_key=="title_news" ? "stretch" : "center";
      return (
        <View style={this.state.dynamic_style.news_container}>
          <ImageBackground style={{flex:1,width:"100%"}} source={{uri: item.img}} imageStyle={{resizeMode:resizemode}}>
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
          <ImageBackground style={{flex:1,width:"100%"}} source={{uri: API_.domain_o+item.category_photo}} imageStyle={{resizeMode:"stretch"}}>
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
  get_fav_icon(title,league_id,is_leagues=false){
    const color = is_leagues ? global_theme.text_color_default : global_theme.background_color_default;
    let fav_icon = null;
    if(this.props.favorite && this.props.set_fav){
      league_id = API_.leagueId_byTitle(title,league_id);
      
      fav_icon = this.props.favorite.includes(league_id) ?
        <IconButton name="star" onPress={()=>{this.props.set_fav(league_id)}} color={color} /> :
        <IconButton name="star-o" onPress={()=>{this.props.set_fav(league_id)}} color={color}/> ;
    }
    return fav_icon;
  }
  setHidden(id){
    if(this.props.favorite==undefined || this.props.set_fav==undefined){
      return ;
    }
    this.state.header_to_hide = [];
    for(let i=0;i<this.list.length;i++){
      //const id = this.list[i]["id"] ;
      let league_id =  id ? id : this.list[i]["id"] ;
      league_id = API_.leagueId_byTitle(this.list[i]["title"],league_id);
      if(league_id==undefined || league_id==0){
        continue;
      }
      if(this.props.favorite.includes(league_id) == false){
        this.state.header_to_hide.push(league_id);
      }
    }
  }
  _render_item=({item})=>{
    if(this.state.header_to_hide.includes(API_.leagueId_byTitle(item.league,item.league_id)) ){return null}
    return (<TouchableOpacity 
      style={{width:this.elem_width}}
      activeOpacity={0.5}
      onPress={ () => {this.props.onclick(item) }} onLongPress={ () => {this.props.onLongPress?this.props.onLongPress(item):null; }} >
      <View style={{flexDirection:'row', flexWrap:'wrap',width:"100%",justifyContent: 'center',alignItems:"center",alignContent:"center",marginHorizontal:3,}}>
        {this.get_item(item,this.props.key_)}
      </View>
    </TouchableOpacity>);
  }

  _render_header=({ section: { title,img,id } })=>{
    //console.log(title,img,id);
    const fav_icon = this.get_fav_icon(title,id);
    if(title==undefined || title==""){
      return null;
    }
    
    return (
      <View style={[{paddingLeft:5,paddingRight:5,flexDirection:'row', flexWrap:'wrap'},this.state.dynamic_style.header]}>
        {this.props.onLeaguePressed ? 
          <IconButton name="list-ol" color="#130f40"
            size={this.state.dynamic_style.header.fontSize} 
            onPress={() => {this.props.onLeaguePressed(title,img) }}/>
        : null}
        <TouchableHighlight
          underlayColor={"green"}
          style={{flex:7}} 
          activeOpacity={0.9}
          onPress={()=>{
            id = API_.leagueId_byTitle(title,id);
            if(this.state.header_to_hide.includes(id)){
              this.state.header_to_hide=this.state.header_to_hide.filter(x=>{if(x!=id)return x});
            }else{
              this.state.header_to_hide.push(id);
            }
            this.props.refresh_list();
            //this.setState({list:l});
            }}
        >
        <Text style={[this.state.dynamic_style.header_components,{flex:1}]} numberOfLines={1}>{title}</Text>
        </TouchableHighlight>
        {fav_icon}
        <View style={{flex:1,height:"100%"}}>
        { img ?  
                <Image 
                  style={this.state.dynamic_style.matche_league_logo}
                  source={{uri: img.slice(0,8)=="https://" ? img :API_.domain_o+img}}
                  />
          : null}
        </View>
      </View>);

  }
  render_list() {
    
    let is_new = JSON.stringify(this.list) == JSON.stringify(this.props.list) ? false : true;
    this.list = this.props.list;
    if (this.list && this.list[0] && this.list[0]["title"]==undefined){
      this.list=[{"title":"",data:this.list}];
    }
    //this.list = this.list[0] ? this.list[0]["data"]: [];
    if(is_new){
      this.setHidden();
    }
    
    if(this.list.length>0 && this.list[0]["title"]!=""){
      const list_lists = this.list.map(k=>{
      return (
          <View style={{width:"100%"}}>
            {this._render_header({section:k})}
            <FlatList
              numColumns={this.state.numColumns} 
              stickySectionHeadersEnabled={false}
              data={k.data}
              keyExtractor={(item, index) => item[this.props.key_key]} 
              renderItem={this._render_item}
              renderSectionHeader={this._render_header}
              columnWrapperStyle={this.state.numColumns>1  ?{justifyContent: 'flex-end',marginRight:3} : null}
            
            />
          </View>);
      });
      return (
        <ScrollView  style={this.state.dynamic_style.container}
          refreshControl={this.props.refreshControl}
          onEndReached = {this.props.onEndReached}
            >
          <SafeAreaView style={this.state.dynamic_style.item_container}>
            {list_lists}
          </SafeAreaView>
        </ScrollView >);

    }else {
      let final_list = [];
      for(let i=0;i<this.list.length;i++){
        let header = JSON.parse(JSON.stringify(this.list[i])) ;
        delete header["data"];
        header["is_header"] = true;
        //final_list = final_list.concat([header]);
        final_list = final_list.concat(this.list[i] ? this.list[i]["data"]: []);
      }
      return (
        <View style={this.state.dynamic_style.container}>
          <SafeAreaView style={[this.state.dynamic_style.container,{}]}>
            <FlatList
              numColumns={this.state.numColumns} 
              stickySectionHeadersEnabled={false}
              onEndReached = {this.props.onEndReached}
              refreshControl={this.props.refreshControl}
              data={final_list}
              keyExtractor={(item, index) => item[this.props.key_key]} 
              renderItem={this._render_item}
              renderSectionHeader={this._render_header}
            
            />
          </SafeAreaView>
        </View>
      );
    }

  }
  render() {
    if(this.check_width(false) || this.state.dynamic_style==false || this.props.list.length==0){
      return null;
    }
    return (<View style={this.state.dynamic_style.container}>
      {this.props.loading && this.props.refreshControl==undefined  ? <Loader/> : this.render_list()}
    </View>);
  }
}


export default ItemsList;