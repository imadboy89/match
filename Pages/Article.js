import React from "react";
import {  View, Dimensions,ScrollView , ImageBackground, Image} from 'react-native';
import Loader from "../components/Loader";
import {styles_article,getTheme, globalView_style} from "../components/Themes";
import IconButton from "../components/IconButton";
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
        article:this.props.route.params.article && this.props.route.params.article!="-" ? this.props.route.params.article : undefined,
        dynamic_style:styles_article,
        modalVisible_player:false,
        modalVisible_team:false,
        
    };
    if(this.state.article && this.state.article.img){
      this.state.article.img = this.state.article.img.split("&")[0];
    }
    this.id = this.state.article && this.state.article.link ? this.state.article.link : "n="+this.props.route.params.id;
    this.source = this.state.article && this.state.article.source ? this.state.article.source : 1;
    this.get_article();
    if(API_.following.length == 0 ){
      backup.load_following().then(o=>{
        this.setState({});
      });
    }    

  }
  componentDidMount(){
    getTheme("styles_article").then(theme=>this.setState({dynamic_style:theme}));
    let short_title = this.state.article && this.state.article.title_news ? this.state.article.title_news:"-";
    short_title = short_title.length > 0 ? short_title.slice(0,30)+"..." : short_title;
    this.props.navigation.setOptions({title: <Text>{short_title}</Text>})
    this.render_header();
  }

  render_header=()=>{
    let title = this.state.article && this.state.article.title_news ? this.state.article.title_news : "";
    this.props.navigation.setOptions({title: title,
    "headerRight":()=>(
      <View style={{flexDirection:"row",margin:5}}>
        <IconButton 
          name="share" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} 
          onPress={()=>{
            const id = this.id.split("=").length == 2 ? this.id.split("=")[1] : this.id;
            const message = this.state.article && this.state.article.title_news ? this.state.article.title_news : "";
            const url     = `${website_url}News/Article/-/${id}` ;
            const title   = this.state.article && this.state.article.title_news ? this.state.article.title_news : "";
            API_.onShare(title,message,url);
        }}  />
    </View>
    )
    });
  }
  isVideo = async (id)=>{
    const v_details = await API_.get_video_k(id);
    if(Object.keys(v_details).length==0 || v_details.Embed==undefined || v_details.Title==undefined){
      return;
    }
    const v_item = {};
    v_item.url = v_details.Embed && v_details.Embed.slice(0,2) == "//" ? "https:"+v_details.Embed : v_details.Embed;
    v_item.category_name = v_details.Title ? v_details.Title : "-";
    v_item.name = v_details.Title ? v_details.Title : "-";
    v_item.category_photo = v_details.Image ? v_details.Image : "";
    v_item.title_news = v_details.Title ? v_details.Title : "-";
    v_item.is_external = true;
    API_.showMsg("Opening Video ! ");
    this.props.navigation.navigate('Video', { item: v_item });
  }
  get_article(){
    //this.state.article.date =  this.state.article && this.state.article.date ? API_.get_date2(new Date(this.state.article.date.replace("#","") * 1000)) : "";
    API_.get_article(this.id, this.source)
    .then(article =>{
      if(article.constructor == Object){
        this.state.article = this.state.article?this.state.article:{};
        this.state.article.title_news = article.title_news ? article.title_news : this.state.article.title_news;
        this.state.article.body = article.body ? article.body : this.state.article.body;
        this.state.article.img  = article.img  ? article.img  : this.state.article.img;
        this.state.article.date = article.date ? article.date : this.state.article.date;
        this.state.article.author = article.author ? article.author : this.state.article.author;
        this.state.article.author_cc = article.author_cc ? article.author_cc : this.state.article.author_cc;
        article.related = article.related ? article.related.map(r=>{
          if(r.related_link && r.related_link.slice(0,1)=="m" && r.related_title.includes(":") ){
            r.related_title = r.related_title.split(":").slice(1).join(":").replace("ضد", "Vs");
          }
          return r;
        }) : [];
        this.state.article.related = article.related ? article.related : this.state.article.related;
        this.state.article.related_news = article.related_news ? article.related_news : this.state.article.related_news;

        this.state.article.img = (this.state.article.img=="" || this.state.article.img==undefined) && article.related_images && article.related_images.length>0 
        ? article.related_images[0]["img_link"] : this.state.article.img;
        if( article.related_images && article.related_images[1] && parseInt(article.related_images[1]["img_link"])>0){
          this.isVideo(parseInt(article.related_images[1]["img_link"]));
        }
        this.render_header();
      }else{
        this.state.article.body = article;
      }
      this.setState({loading:false});
      API_.setTitleWeb(this.state.article.title_news);
    });
  }
  onItemLongPressed = (_item)=>{
    if(_item.related_link){
      const item = {};
      item.source = this.source;
      item.url = _item.related_link;
      item.title = _item.related_title;
      backup.save_following(item).then(o=>this.setState({}));

    }
  }
  onItemClicked = (item)=>{
    if(item.related_news_id){
      item.source = this.source;
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
          this.props.navigation.push('Match', { id:link_[1], match_item: {id:link_[1],is_koora:true , home_team_ar:home_team_ar , away_team_ar:away_team_ar} });
        }else if(link_[0]=="c"){
          this.props.navigation.push('League',{ id:link_[1], league_details: {league:item.related_title,league_img:undefined,id:link_[1]} });
        }
      } catch (error) {
        
      }
      
      this.setState(attrs2post)
    }
  }
  onLeaguePressed = (league_name, league_img,league_id)=>{
    league_img = ["https:/","http://"].includes(league_img.slice(0,7)) ? league_img : API_.domain_o+league_img;
    this.props.navigation.push('League',{ league_details: {league:league_name,league_img:league_img,id:league_id} });
  }
  get_player_info=(player)=>{
    this.setState({modalVisible_player:true,player_id:player.player_id});
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
      minWidth={800}
      />
      :null;
    const related_header = <Text style={this.state.dynamic_style.article_date_t}>ذات صلة :</Text>;
    const related = this.state.article && this.state.article.related && this.state.article.related.length>0 ?
      <ItemsList 
      ListHeaderComponent={related_header}
      loading={false}
      list={this.state.article.related} 
      onclick={this.onItemClicked} 
      onLongPress={this.onItemLongPressed}
      favorite={"API_.following.map(o=>o.url)"}
      key_={"related_title"} key_key={"related_link"}
      minWidth={800}
      />
      :null;
    const article_body = this.state.article && this.state.article.body ? this.state.article.body : "";
    const body_composed = article_body && article_body.split ? article_body.split("IMG**").map(o=>{
      if(o.trim()==""){
        return null;
      }
      let dom2retrurn=null;
      if(o[0]=="*"){
        const width = Dimensions.get('window').width<=400 ? "99%" : "70%";
        let img_src = o.replace(/\*/gi,"").trim();
        img_src = img_src && img_src.slice(0,2) == "//" ? "https:"+img_src : img_src;
        img_src = img_src && img_src.slice(0,4) == "http" ? `${kooora_domain}${img_src}` : img_src;
        dom2retrurn = <View key={o} style={{flexDirection: 'row',height:300,width:width,alignSelf:"center",marginVertical:10}}>
        <ImageBackground source={{uri:img_src}} style={{aspectRatio: 1,resizeMode: 'contain',flex: 1,}} resizeMode={'contain'}/>
        </View>;
      }else{
        dom2retrurn = <Text key={o} style={this.state.dynamic_style.article_body_t}>{o}</Text>
      }
      return dom2retrurn;
    }) : <Text style={this.state.dynamic_style.article_body_t}>{article_body}</Text>;
    let author_flag = this.state.article&& this.state.article.author_cc ?  API_.get_cc_img(this.state.article.author_cc,true) :null;
    author_flag = author_flag!=null ? <Image style={{height:25,width:25, borderRadius:25,marginHorizontal:5}} source={{uri: author_flag}} /> : null;
    return (
      <ScrollView  style={this.state.dynamic_style.container}>
        <View style={globalView_style}>

        <View style={this.state.dynamic_style.channel_logo_v}>
        
          { this.state.article && this.state.article.img ?  
            <ImageBackground key={"article_backgrnd"} style={{flex:1,width:"100%"}} source={{uri: this.state.article.img}} resizeMode="stretch">
            </ImageBackground>
          : null}
        </View>
            
          <View style={this.state.dynamic_style.article_v}>
            <Text style={this.state.dynamic_style.article_date_t}>{this.state.article && this.state.article.date?this.state.article.date:"-"}</Text>
            {this.state.article!=undefined && this.state.article.author!=undefined ? 
            <View style={{flexDirection:"row-reverse",width:"100%",}}>
              {author_flag}
              <Text style={this.state.dynamic_style.article_date_t}>{this.state.article.author}</Text> 
            </View>
            : null}
            <Text style={this.state.dynamic_style.article_title_t}>{this.state.article && this.state.article.title_news ? this.state.article.title_news : ""}</Text>
            
            {this.state.loading ? <Loader/> : body_composed  }
            
          </View>

         {related_news==null?related_news:
          <View style={{width:"98%"}}>{related_news}</View>
         }
         {related==null?related_news:
          <View style={{width:"98%" }}>{related}</View>
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
          navigation={this.props.navigation}
          closeModal={()=>{this.setState({modalVisible_team:false});/*this.load_logos();*/}}></Team>
          : null }

        </View>
        </ScrollView >
    );
  }
}


export default ArticleScreen;

