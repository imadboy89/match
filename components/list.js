import * as React from 'react';
import {  View, StyleSheet, TouchableOpacity, Button, Image, ImageBackground,ScrollView  } from 'react-native';
import { SafeAreaView,SectionList, FlatList, Dimensions,TouchableHighlight } from 'react-native';
import Loader from "./Loader";
import {_isMobile,getTheme,global_theme} from "./Themes";
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
    this.flatListRef = false;
    this.windowHeight = Dimensions.get('window').height ;

    this.refs_list = [];
    this.refs_map = {};
    
  }
  componentDidMount=()=>{
    this._isMounted=true;
    getTheme("styles_list").then(theme=>this.setState({dynamic_style:theme}));
    //AppState.addEventListener("resize", this.check_width.bind(this));
    Dimensions.addEventListener("change",this.check_width)
  }
  componentWillUnmount(){
    //alert("componentWillUnmount");
    this._isMounted=false;
    Dimensions.removeEventListener("change",this.check_width)
  }
  componentDidUpdate(){
    /*
    if(this.refs_list && this.refs_list[0] && this.refs_list[0].current && this.refs_list[0].current.focus){
      console.log(this.refs_list[0],this.refs_list[0].current , this.refs_list[0].current.focus);
      this.refs_list[0].current.focus();
    }
    */
  }
  check_width=(render=true)=>{
    const current_windowWidth= Dimensions.get('window').width<=1000 ? Dimensions.get('window').width : 1000;
    if(this.windowWidth == current_windowWidth){return ;}
    let margin2add = _isMobile(API_.isWeb) ? 15 : 40;
    margin2add = parseInt(margin2add * (this.minWidth/300)); 
    this.windowWidth = current_windowWidth;
    //this.setState({numColumns:this.windowWidth/500});
    this.state.numColumns = parseInt(this.windowWidth/this.minWidth);
    this.state.numColumns = this.state.numColumns>=1 ? this.state.numColumns : 1;
    this.elem_width = this.props.fixedWidth ? this.minWidth : parseInt((this.windowWidth-margin2add)/this.state.numColumns);
    if(render && this.props.refresh_list){
      if(this._isMounted){
        this.props.refresh_list(1);
      }
    }
    return true;
  } 
  get_item(item,col_key){
    const shadow_style = API_.isWeb ? this.state.dynamic_style.shadow_3  : this.state.dynamic_style.shadow_1;
    if(col_key=="home_team"){

      const style_small = {}
      let home_team_name = item["home_team_ar"] ? item["home_team_ar"] : item["home_team"];
      let away_team_name = item["away_team_ar"] ? item["away_team_ar"] : item["away_team"];
      if(home_team_name==undefined || away_team_name==undefined ){
        return null;
      }
      let home_team_style = {};
      let away_team_style = {};
      const max_lenght = parseInt(this.windowWidth/19) ;
      if(home_team_name.length>max_lenght){ home_team_style={fontSize:17}; }
      if(away_team_name.length>max_lenght){ away_team_style={fontSize:17}; }
      
      if(item.home_team_status && item.home_team_status.toLowerCase()=="w"){ 
        home_team_style["color"]=this.state.dynamic_style.team_name_winner; 
      }
      if(item.away_team_status && item.away_team_status.toLowerCase()=="w"){ 
        away_team_style["color"]=this.state.dynamic_style.team_name_winner; 
      }
      if(item.home_team_status && item.home_team_status.toLowerCase()=="l"){ 
        home_team_style["color"]=this.state.dynamic_style.team_name_drawer; 
      }
      if(item.away_team_status && item.away_team_status.toLowerCase()=="l"){ 
        away_team_style["color"]=this.state.dynamic_style.team_name_drawer; 
      }
      if(this.props.favorite_teams && this.props.favorite_teams.includes(item.home_team_id)){
        home_team_style["textDecorationLine"]='underline'; 
      }
      if(this.props.favorite_teams && this.props.favorite_teams.includes(item.away_team_id)){
        away_team_style["textDecorationLine"]='underline'; 
      }
      //"#ffffff87"
      let time_style={};
      try {
        time_style = JSON.parse(JSON.stringify(this.state.dynamic_style.matche_team_time_live));
      } catch (error) {}
      if(item.time_played=="Pen"){
        time_style["color"]="#ff5252";
      }else if(item.is_done){
        time_style["color"]="#8fa2ff";
        time_style["fontSize"]=16;
      }
      let time_played= item.time_played>0?item.time_played+"'": item.time_played;
      //console.log(this.props.notifications_matches[item.id]);
      let style_extra = this.props.notifications_matches && this.props.notifications_matches[item.id]!=undefined ? this.state.dynamic_style.matche_container_notif : {};
      style_extra = item.live==1 ? this.state.dynamic_style.matche_container_live: style_extra;
      
      return (
        <View style={[this.state.dynamic_style.matche_container,style_extra,shadow_style]}>
          <View style={this.state.dynamic_style.matche_team_time}>
            <Text style={this.state.dynamic_style.matche_team_time_t} noFonts={true}>{item.time}</Text>
            {item.is_done==true ? 
              <Text style={time_style}>{"انتهت"}</Text> 
            : null}            
            {item.live==1 ? 
              <Text style={time_style}  noFonts={true}>{time_played}</Text> 
            : null}
            
          </View>
          {item.home_team_badge && item.away_team_badge ? 
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
          : null }

          <View style={this.state.dynamic_style.matche_team_names}>
            <Text style={[this.state.dynamic_style.matche_team_name_text,home_team_style]} numberOfLines={1}>{home_team_name}</Text>
            <Text style={[this.state.dynamic_style.matche_team_name_text,away_team_style]} numberOfLines={1}>{away_team_name}</Text>
          </View>
          { item.home_team_score_penalties==undefined ? null : 
            <View style={this.state.dynamic_style.matche_team_score_penalties}>
              <Text style={this.state.dynamic_style.matche_team_score_text_penalties} noFonts={true}>{item.home_team_score_penalties ? item.home_team_score_penalties : "-"}</Text>
              <Text style={this.state.dynamic_style.matche_team_score_text_penalties} noFonts={true}>{item.away_team_score_penalties ? item.away_team_score_penalties : "-"}</Text>
            </View>
          }
          <View style={this.state.dynamic_style.matche_team_score}>
            <Text style={this.state.dynamic_style.matche_team_score_text} noFonts={true}>{item.home_team_score ? item.home_team_score : "-"}</Text>
            <Text style={this.state.dynamic_style.matche_team_score_text} noFonts={true}>{item.away_team_score ? item.away_team_score : "-"}</Text>
          </View>
        </View>
        );
    }else if(col_key=="title_news" || col_key=="league_name"){
      const fav_icon = this.get_fav_icon(item[col_key],col_key=="league_name"? item.id : 0,true);
      const koora_icon = this.get_common_icon(item["title"],item["koora_id"],true,"flag");
      let date = item.date && item.date.slice && item.date.slice(0,1) =='#' ? API_.get_date2(new Date(item.date.replace("#","") * 1000)) : item.date ;
      const resizemode = col_key=="title_news" ? "stretch" : "center";
      return (
        <View style={[this.state.dynamic_style.news_container,shadow_style]}>
          <ImageBackground style={{flex:1,width:"100%"}} source={{uri: item.img}} imageStyle={{resizeMode:resizemode}}>
          { item.date ? <Text style={{backgroundColor:"#00000091",color:"#fff",width:90,textAlign:"center",}}>{date}</Text> : null}

            <View style={this.state.dynamic_style.news_img_v}>
              <View style={this.state.dynamic_style.league_header}>
                {fav_icon!=null ? fav_icon : null}
                <View style={{flex:1}}></View>
                {koora_icon!=null ? koora_icon : null}
              </View>
            </View>
            <View style={this.state.dynamic_style.news_title_v}><Text style={this.state.dynamic_style.news_title_t} numberOfLines={1}>{item[col_key]}</Text></View>
          </ImageBackground>
        </View>
        );
    }else if(col_key=="category_name"){  
      const img_uri = item.category_photo && item.category_photo.slice(0,4)=="http" ? item.category_photo : API_.domain_o+item.category_photo;
      return (
        <View style={[this.state.dynamic_style.news_container,shadow_style]}>
          <ImageBackground style={{flex:1,width:"100%"}} source={{uri: img_uri}} imageStyle={{resizeMode:"stretch"}}>
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
        <Text style={this.state.dynamic_style.item}>- {item[col_key]}</Text>
        );
    }
  }
  get_fav_icon(title,id,is_leagues=false,icon="star"){
    const color = is_leagues ? global_theme.text_color_default : global_theme.background_color_default;
    let fav_icon = null;
    if(this.props.favorite && this.props.set_fav){
      //league_id = API_.leagueId_byTitle(title,league_id);
      id = API_.common_league_id({title,id});
      fav_icon = this.props.favorite.includes(id) ?
        <IconButton name={icon} onPress={()=>{this.props.set_fav(id, title)}} color={color} /> :
        <IconButton name={icon+"-o"} onPress={()=>{this.props.set_fav(id, title)}} color={color}/> ;
    }
    return fav_icon;
  }
  get_common_icon(title,id,is_leagues=false,icon="star"){
    const color = is_leagues ? global_theme.text_color_default : global_theme.background_color_default;
    let fav_icon = null;
    fav_icon = id && id>1 ? <IconButton name={icon}  color={color} /> : null ;
    return fav_icon;
  }
  setHidden(id,is_new=false){
    if(this.props.favorite==undefined || this.props.set_fav==undefined || this.props.disableHide==true ){
      return ;
    }
    if(this.windowHeight>=1000 || this.windowWidth>=1000){
      return ;
    }
    this.state.header_to_hide = is_new ? [] : this.state.header_to_hide;
    for(let i=0;i<this.list.length;i++){
      let league_id =  id ? id : this.list[i]["id"] ;
      //league_id = API_.leagueId_byTitle(this.list[i]["title"],league_id);
      league_id = API_.common_league_id(this.list[i]);
      if(league_id==undefined || league_id==0){
        continue;
      }
      if(this.props.favorite.includes(league_id) == false){
        this.state.header_to_hide.push(league_id);
      }
    }
  }
  _render_item=({item})=>{
    //if(this.state.header_to_hide.includes(API_.leagueId_byTitle(item.league,item.league_id)) ){return null}
    /*
    if(this.refs_list[item[this.props.key_key]]){
      this.refs_list[item[this.props.key_key]];
    }*/
    return (<TouchableOpacity
      
      style={{width:this.elem_width,alignSelf:"center"}}
      activeOpacity={0.5}
      onPress={ () => {this.props.onclick(item) }} onLongPress={ () => {this.props.onLongPress?this.props.onLongPress(item):null; }} >
      <View style={{flexDirection:'row', flexWrap:'wrap',width:"100%",justifyContent: 'center',alignItems:"center",alignContent:"center",marginHorizontal:3,}}>
        {this.get_item(item,this.props.key_)}
      </View>
    </TouchableOpacity>);
  }

  _render_header=({ section: { title,img,id,is_koora,options } })=>{
    //console.log(title,img,id);
    const fav_icon = this.get_fav_icon(title,id);
    if(title==undefined || title==""){
      return null;
    }
    let header_style = {flex:1};
    const max_lenght = parseInt(this.windowWidth/14) ;
    if(title.length>max_lenght){ header_style={fontSize:17}; }
    return (
      <TouchableHighlight style={this.state.dynamic_style.header_container}
        underlayColor={"green"}
        activeOpacity={0.9}
        onPress={()=>{
          let id_=0;
          try {
            id_ = API_.common_league_id({title,id,is_koora});
          } catch (error) {}
          if (id_==0 || this.props.refresh_list == undefined) return;
          if(this.state.header_to_hide.includes(id_)){
            this.state.header_to_hide=this.state.header_to_hide.filter(x=>{if(x!=id_)return x});
          }else{
            this.state.header_to_hide.push(id_);
          }
          this.props.refresh_list();
          //this.setState({list:l});
          }}
      >
        <View style={[{paddingLeft:3,paddingRight:1,flexDirection:'row', flexWrap:'wrap'},this.state.dynamic_style.header]}>
          {this.props.onLeaguePressed && (options==undefined || options.includes("r"))? 
            <IconButton name="list-ol" color="#130f40"
              size={this.state.dynamic_style.header.fontSize} 
              onPress={() => {this.props.onLeaguePressed(title,img,id) }}/>
          : null}
          <View style={{flex:7,maxHeight:"100%",}} >
            <Text style={[this.state.dynamic_style.header_components,header_style]} numberOfLines={1}>{title}</Text>
          </View>
          {fav_icon}
          <View style={{width: API_._isBigScreen() ? 100 : 70,height:"99%"}}>
          { img ?  
                  <ImageBackground 
                    style={this.state.dynamic_style.matche_league_logo_c}
                    imageStyle={is_koora ? this.state.dynamic_style.matche_league_logo_k : this.state.dynamic_style.matche_league_logo}
                    source={{uri: img.slice(0,8)=="https://" ? img :API_.domain_o+img}}
                    />
            : null}
          </View>
        </View>
      </TouchableHighlight>);

  }
  toTop = () => {
    console.log(this.props.disable_toTop!=true);
    if(this.props.disable_toTop!=true && this.flatListRef && this.flatListRef && this.flatListRef.scrollToOffset){
      this.flatListRef.scrollToOffset({ animated: true, offset: 0 });
    }
  }
  create_refs(){
    return false;
    this.refs_list = [];
    for(let i=0;i<this.list.length;i++){
      this.refs_list[i] = React.createRef();
      this.refs_map[this.list[i].title] = {ind:i};
    }
  }
  render_list() {
    /*let is_new = JSON.stringify(this.list_origin) != JSON.stringify(this.props.list);
    is_new = is_new && (this.props.ListHeaderComponent!= this.ListHeaderComponent || this.props.ListFooterComponent!=this.ListFooterComponent);
    */
    const list_o = this.list_origin ? JSON.parse(JSON.stringify(this.list_origin)).map(o=>{ delete o["data"];return o}) : [];
    const list_n = this.props.list ? JSON.parse(JSON.stringify(this.props.list)).map(o=>{ delete o["data"];return o}) : [];
    let is_new = JSON.stringify(list_o) != JSON.stringify(list_n);
    const is_paginated = this.props.ListHeaderComponent!= this.ListHeaderComponent || this.props.ListFooterComponent!=this.ListFooterComponent ;

    this.list_origin = this.props.list;
    this.ListFooterComponent = this.props.ListFooterComponent;
    this.ListHeaderComponent = this.props.ListHeaderComponent;

    this.list = this.props.list;
    if (this.list && this.list[0] && this.list[0]["title"]==undefined){
      this.list=[{"title":"",data:this.list}];
      if(is_new && this.flatListRef){
        this.toTop();
      }
    }
    //this.list = this.list[0] ? this.list[0]["data"]: [];
    if(is_new){
      this.setHidden(false,is_new);
    }
    if(this.list.length>0 && this.list[0]["title"]!=""){
      this.create_refs();
      const list_lists = this.list.map(k=>{
      return (
          <View style={{width:"100%"}} key={k.title+k.id}>
            {this._render_header({section:k})}
            { this.state.header_to_hide.includes(API_.common_league_id(k))==false ? 
              <FlatList
                numColumns={this.state.numColumns} 
                stickySectionHeadersEnabled={false}
                data={k.data}
                keyExtractor={(item, index) => {return item[this.props.key_key]+""}} 
                renderItem={this._render_item}
                renderSectionHeader={this._render_header}
                columnWrapperStyle={this.state.numColumns>1  ? this.state.dynamic_style.columnWrapperStyle  : null}
                
              />
            : null }
          </View>);
      });

      //this.refs_list[0].focus();
      return (
        <ScrollView  style={this.state.dynamic_style.list_container} key={JSON.stringify(this.list)}
          refreshControl={this.props.refreshControl}
          onEndReached = {this.props.onEndReached}
          scrollEventThrottle={0}
          onScroll={(e) => {
            if(this.props.onEndReached==undefined){
              return ;
            }
            let paddingToBottom = 10;
            paddingToBottom += e.nativeEvent.layoutMeasurement.height;
            const distance = e.nativeEvent.contentSize.height-paddingToBottom-e.nativeEvent.contentOffset.y;
            if(e.nativeEvent.contentOffset.y >= e.nativeEvent.contentSize.height - paddingToBottom) {
              this.props.onEndReached({info:{distanceFromEnd:distance}});
            }
          }}
            >
          <SafeAreaView style={this.state.dynamic_style.item_container}>
            {this.props.ListHeaderComponent!=undefined ? this.props.ListHeaderComponent : null}
            {list_lists}
            {this.props.ListFooterComponent!=undefined ? this.props.ListFooterComponent : null}
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
      
      //to avoid 'FlatList : Invariant Violation: Changing numColumns on the fly is not supported' error
      if(this.props.loading==false && this.props.list && this.props.list.length == 0){
        return null;
      }
      return (
        <View style={this.state.dynamic_style.list_container}>
          <SafeAreaView style={this.state.dynamic_style.item_container}>
            <FlatList
              ref={(ref) => { this.flatListRef = ref; }}
              ListHeaderComponent = {this.props.ListHeaderComponent!=undefined ? this.props.ListHeaderComponent : undefined}
              ListFooterComponent = {this.props.ListFooterComponent!=undefined ? this.props.ListFooterComponent : undefined}
              numColumns={this.state.numColumns} 
              stickySectionHeadersEnabled={false}
              onEndReached = {this.props.onEndReached}
              refreshControl={this.props.refreshControl}
              data={final_list}
              keyExtractor={(item, index) => item[this.props.key_key]+""} 
              renderItem={this._render_item}
              renderSectionHeader={this._render_header}

            
            />
          </SafeAreaView>
        </View>
      );
    }

  }
  render() {
    if( this.props.loading==false && (this.check_width(false) || this.state.dynamic_style==false || this.props.list==undefined)){
      return (<View style={this.state.dynamic_style.container}>
        {this.props.ListHeaderComponent!=undefined ? this.props.ListHeaderComponent : null}
        <Loader/>
        {this.props.ListFooterComponent!=undefined ? this.props.ListFooterComponent : null}
        </View>);
    }
    /*
    this cause to not show date+source header component for matches pages
    if(this.props.loading==false && this.props.list && this.props.list.length == 0){
      return null;
    }*/
    return (<View style={this.state.dynamic_style.container}>
      {this.props.loading && (this.props.refreshControl==undefined || API_.isWeb || this.props.list==undefined || this.props.list.length == 0)  
      ? <Loader/> : this.render_list()}
    </View>);
  }
}


export default ItemsList;