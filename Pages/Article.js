import React from "react";
import {  View, StyleSheet, Modal, Button, Linking, Picker,ScrollView, Image , ImageBackground} from 'react-native';
import Constants from 'expo-constants';
import Loader from "../components/Loader";
import {styles_article,getTheme} from "../components/Themes";

class ArticleScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        list:[],
        modalVisible_match:false,
        loading:true,
        article:this.props.route.params.article,
        dynamic_style:styles_article,
        
    };
    this.get_article();

  }
  componentDidMount(){
    getTheme("styles_article").then(theme=>this.setState({dynamic_style:theme}));
    let short_title = this.state.article.title_news.length > 0 ? this.state.article.title_news.slice(0,30)+"..." : this.state.article.title_news;
    this.props.navigation.setOptions({title: <Text>{short_title}</Text>})
  }
  get_article(){
    this.state.article.date = API_.get_date2(new Date(this.state.article.date.replace("#","") * 1000));
    API_.get_article(this.props.route.params.article.link, this.state.article.source)
    .then(article =>{
      if(article.constructor == Object){
        this.state.article.body = article.body ? article.body : this.state.article.body;
        this.state.article.img  = article.img  ? article.img  : this.state.article.img;
        this.state.article.date = article.date ? article.date : this.state.article.date;

      }else{
        this.state.article.body = article;
      }
      this.setState({loading:false});
      API_.setTitleWeb(this.state.article.title_news);
    });
  }
  render() {
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
      
        </ScrollView >
    );
  }
}


export default ArticleScreen;
