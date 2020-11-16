import React from "react";
import {  View, StyleSheet, Modal, Button, Linking, Picker,ScrollView, Image , ImageBackground} from 'react-native';
import Constants from 'expo-constants';
import Loader from "../components/Loader";

let list = [

          ];
class ArticleScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        list:list,
        modalVisible_match:false,
        loading:true,
        article:this.props.route.params.article,
        
    };
    this.get_article();

  }
  get_article(){
    let short_title = this.state.article.title_news.length > 0 ? this.state.article.title_news.slice(0,30)+"..." : this.state.article.title_news;
    
    this.state.article.date = API_.get_date2(new Date(this.state.article.date.replace("#","") * 1000));
    this.props.navigation.setOptions({title: short_title})
    API_.get_article(this.props.route.params.article.link)
    .then(body =>{
      this.state.article.body = body;
      this.setState({loading:false});
    });
  }
  render() {
    return (
      <ScrollView  style={styles.container}>
        <View style={styles.channel_logo_v}>
        
          { this.state.article.img ?  
            <ImageBackground style={{flex:1,width:"100%"}} source={{uri: this.state.article.img}} >
            </ImageBackground>
          : null}
        </View>
        
          <View style={styles.article_v}>
            <Text style={styles.article_date_t}>{this.state.article.date}</Text>
            <Text style={styles.article_title_t}>{this.state.article && this.state.article.title_news ? this.state.article.title_news : ""}</Text>
            
            {this.state.loading ? <Loader/> : 
            <Text style={styles.article_body_t}>{this.state.article && this.state.article.body? this.state.article.body : ""}</Text>  }
            
          </View>
      
        </ScrollView >
    );
  }
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#000',
    color : "#fff",

  },
  article_v: {
    flex: 10,
    padding: 5,
    fontSize: 18,
    color : "#fff",
    backgroundColor: '#000',
    //backgroundColor: '#8e5858',
  },
  article_body_t:{
    fontSize: 15,
    color : "#fff",
    textAlign:"right",
    borderRadius: 5,
    backgroundColor:"#293542d6",
    padding:10,
    marginBottom:5,
  },
  article_title_t:{
    fontWeight: "bold",
    padding:10,
    width:"100%",
    marginTop:8,
    marginBottom:8,
    fontSize: 16,
    color : "#fff",
    textAlign:"center",
    backgroundColor:"#323350d6",
    borderRadius: 5,
  },
  article_date_t:{
    //padding:5,
    fontSize: 12,
    color : "#fff",
    textAlign:"right",
  },
  channel_logo:{
    aspectRatio: 1,
    width: "100%",
    height: "100%",
    resizeMode: 'contain',
  },
  channel_logo_v:{
    width: "100%",
    height:200,
    padding:5,
    alignContent:"center",
    alignItems:"center",
    alignSelf:"center",
  }
});

export default ArticleScreen;
