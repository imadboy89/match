import React from "react";
import {  View, StyleSheet, Modal, Button, Linking, Picker,ScrollView, Image , ImageBackground} from 'react-native';
import Constants from 'expo-constants';
import Loader from "../components/Loader";
import {styles_article,getTheme} from "../components/Themes";
import { TouchableHighlight } from "react-native-gesture-handler";
import ItemsList from '../components/list';
import Player from "../components/Player";
import Team from "../components/Team";

class ArticleScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        list:[],
        modalVisible_match:false,
        loading:true,
        article:this.props.route.params.article,
        dynamic_style:styles_article,
        modalVisible_player:false,
        modalVisible_team:false,
        
    };
    this.get_article();

  }
  componentDidMount(){
    getTheme("styles_article").then(theme=>this.setState({dynamic_style:theme}));
    let short_title = this.state.article.title_news.length > 0 ? this.state.article.title_news.slice(0,30)+"..." : this.state.article.title_news;
    this.props.navigation.setOptions({title: <Text>{short_title}</Text>})
  }
  get_article(){
    this.state.article.date =  this.state.article && this.state.article.date ? API_.get_date2(new Date(this.state.article.date.replace("#","") * 1000)) : "";
    API_.get_article(this.props.route.params.article.link, this.state.article.source)
    .then(article =>{
      if(article.constructor == Object){
        this.state.article.body = article.body ? article.body : this.state.article.body;
        this.state.article.img  = article.img  ? article.img  : this.state.article.img;
        this.state.article.date = article.date ? article.date : this.state.article.date;
        this.state.article.related = article.related ? article.related : this.state.article.related;
        this.state.article.related_news = article.related_news ? article.related_news : this.state.article.related_news;

        this.state.article.img = this.state.article.img==undefined && article.related_images && article.related_images.length>0 
        ? article.related_images[0]["img_link"] : this.state.article.img;

      }else{
        this.state.article.body = article;
      }
      this.setState({loading:false});
      API_.setTitleWeb(this.state.article.title_news);
    });
  }
  onItemClicked = (item)=>{
    if(item.related_news_id){
      item.source = this.state.article.source;
      item.link = "n="+item.related_news_id;
      item.title_news = item.related_news_title;
      item.img= item.related_images && item.related_images.length>0 ? item.article.related_images[0]["img_link"] : null;
      this.props.navigation.push('Article', { article: item });
    }else{
      let attrs2post = {};
      try {
        const link_ = item.related_link.split("=");
        if(link_[0]=="team"){
          attrs2post.modalVisible_team = true;
          attrs2post.team_id = parseInt(link_[1]);
        }else if(link_[0]=="player"){
          attrs2post.modalVisible_player = true;
          attrs2post.player_id = parseInt(link_[1]);
        }else if(link_[0]=="m"){
          let home_team_ar = undefined;
          let away_team_ar = undefined;
          if(item.related_title.split("-").length>2){
            const teams = item.related_title.split("-")[2].split("ضد");
            home_team_ar = teams.length>1 ? teams[0].trim() : undefined;
            away_team_ar = teams.length>1 ? teams[1].trim() : undefined;
          }
          this.props.navigation.navigate('Match', { match_item: {id:link_[1],is_koora:true , home_team_ar:home_team_ar , away_team_ar:away_team_ar} });
        }else if(link_[0]=="c"){
          this.props.navigation.navigate('League',{ league_details: {league:item.related_title,league_img:undefined,id:link_[1]} });
        }
      } catch (error) {
        
      }
      
      this.setState(attrs2post)
    }
  }
  onLeaguePressed = (league_name, league_img,league_id)=>{
    league_img = ["https:/","http://"].includes(league_img.slice(0,7)) ? league_img : API_.domain_o+league_img;
    this.props.navigation.navigate('League',{ league_details: {league:league_name,league_img:league_img,id:league_id} });
  }
  render() {
    const related_news_header = <Text style={this.state.dynamic_style.article_date_t}>أخبار ذات صلة :</Text>;
    const related_news = this.state.article && this.state.article.related_news && this.state.article.related_news.length>0 ?
      <ItemsList 
      ListHeaderComponent={related_news_header}
      loading={false}
      list={this.state.article.related_news} 
      onclick={this.onItemClicked} 
      key_={"related_news_title"} key_key={"related_news_id"}
      />
      :null;
    const related_header = <Text style={this.state.dynamic_style.article_date_t}>ذات صلة :</Text>;
    const related = this.state.article && this.state.article.related && this.state.article.related.length>0 ?
      <ItemsList 
      ListHeaderComponent={related_header}
      loading={false}
      list={this.state.article.related} 
      onclick={this.onItemClicked} 
      key_={"related_title"} key_key={"related_link"}
      />
      :null;
    const related_ = this.state.article && this.state.article.related && this.state.article.related.length>0 ?
    this.state.article.related.map(n=>{ return n && n.length==2 ?(
      <ItemsList 
      loading={false}
      list={this.state.article.related} 
      onclick={this.onItemClicked} 
      key_={"related_link"} key_key={"related_title"}
      />) : null;
    })
    :null;

    return (
      <ScrollView  style={this.state.dynamic_style.container}>
        <View style={this.state.dynamic_style.channel_logo_v}>
        
          { this.state.article.img ?  
            <ImageBackground style={{flex:1,width:"100%"}} source={{uri: this.state.article.img}} >
            </ImageBackground>
          : null}
        </View>
        
          <View style={this.state.dynamic_style.article_v}>
            <Text style={this.state.dynamic_style.article_date_t}>{this.state.article.date}</Text>
            <Text style={this.state.dynamic_style.article_title_t}>{this.state.article && this.state.article.title_news ? this.state.article.title_news : ""}</Text>
            
            {this.state.loading ? <Loader/> : 
            <Text style={this.state.dynamic_style.article_body_t}>{this.state.article && this.state.article.body? this.state.article.body : ""}</Text>  }
            
          </View>

         {related_news==null?related_news:
          <View style={{width:"98%",flex:1}}>{related_news}</View>
         }
         {related==null?related_news:
          <View style={{width:"98%",flex:1}}>{related}</View>
         }


        { this.state.modalVisible_player==true ?
          <Player       
          modal_visible={this.state.modalVisible_player}
          dynamic_style={this.state.dynamic_style}
          player_id = {this.state.player_id}
          closeModal={()=>{
          this.setState({modalVisible_player:false})}}></Player>

          : null }
        { this.state.modalVisible_team==true ?
        <Team       
          modal_visible={this.state.modalVisible_team}
          team_id = {this.state.team_id}
          get_player_info={this.get_player_info}
          set_fav_p={this.set_fav_p}
          favorite_p={this.state.favorite_p}
          league_name={this.league_name}
          league_id={this.real_id}
          closeModal={()=>{this.setState({modalVisible_team:false});/*this.load_logos();*/}}></Team>
          : null }
        </ScrollView >
    );
  }
}


export default ArticleScreen;

