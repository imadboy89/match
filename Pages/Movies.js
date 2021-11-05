import * as React from 'react';
import { View, Modal, Alert , TextInput , RefreshControl } from 'react-native';
import Constants from 'expo-constants';
import ItemsList from '../components/list';
import DateTimePicker from '@react-native-community/datetimepicker';
import IconButton from "../components/IconButton";
import {styles_news,getTheme} from "../components/Themes";
import {Picker} from '@react-native-picker/picker';
class MoviesScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        list:[],
        page : 1,
        loading:true,
        dynamic_style : styles_news,
        source_id: this.props.route && this.props.route.params && this.props.route.params.source_id ? this.props.route.params.source_id-4 : 1 ,
        genre:"",
        rate:0,
        sortby:"date_added",
        search_qeury:"",
        section : 205,
        favorite:[],
        is_fav_list:false,
        data_section:"--",
        seach_input_ref:null,

    };
    this.data = {};
    this.state.section = this.state.source_id == 4 ? "" : this.state.section;
    this.rates=[0,1,2,3,4,5,6,7,8,9];
    this.genres = [
    "all",
    "comedy",
  "sci-fi",
  "horror",
  "romance",
  "action",
  "thriller",
  "drama",
  "mystery",
  "crime",
  "animation",
  "adventure",
  "fantasy",
  "comedy-romance",
  "action-comedy",
  "superhero",];
    this.sortby = ["title", "year", "rating", "peers", "seeds", "download_count", "like_count", "date_added"];
    this.genres_MC = {
      "" : "Home",
      "/top-imdb" : "Top IMDB",
      "/genre/action-10" : "Action",
      "/genre/action-adventure-24" : "Action & Adventure",
      "/genre/adventure-18" : "Adventure",
      "/genre/animation-3" : "Animation",
      "/genre/comedy-7" : "Comedy",
      "/genre/crime-2" : "Crime",
      "/genre/documentary-11" : "Documentary",
      "/genre/drama-4" : "Drama",
      "/genre/family-9" : "Family",
      "/genre/fantasy-13" : "Fantasy",
      "/genre/history-19" : "History",
      "/genre/horror-14" : "Horror",
      "/genre/kids-27" : "Kids",
      "/genre/music-15" : "Music",
      "/genre/mystery-1" : "Mystery",
      "/genre/news-34" : "News",
      "/genre/reality-22" : "Reality",
      "/genre/romance-12" : "Romance",
      "/genre/sci-fi-fantasy-31" : "Sci-Fi & Fantasy",
      "/genre/science-fiction-5" : "Science Fiction",
      "/genre/soap-35" : "Soap",
      "/genre/talk-29" : "Talk",
      "/genre/thriller-16" : "Thriller",
      "/genre/tv-movie-8" : "TV Movie",
      "/genre/war-17" : "War",
      "/genre/war-politics-28" : "War & Politics",
      "/genre/western-6" : "Western",
      "/tv-shows" : "TV Shows",
      "/movies" : "Movies",
    };
  this.get_movies();
  console.log("--------constructor");
  this.screen_focus_mng();
  
  }
  screen_focus_mng(){
    this.subscribetions=[];
    this.subscribetions.push(this.props.navigation.addListener('focus', () => {
      this.toggle_keys_listner(true);
    }));
    this.subscribetions.push(this.props.navigation.addListener('blur', () => {
      this.toggle_keys_listner(false);
    }));
    console.log(this.subscribetions);
  }
  load_fav=()=>{
    backup.load_movie_fav(this.state.movie_id_ori).then(favorite_movies=>{
      const favorite = favorite_movies.map(o=>o.url?o.url:"");
      this.setState({favorite,favorite_movies});
    });
  }
  componentDidMount(){
    console.log("--------componentDidMount");
    this._isMounted=true;
    getTheme("styles_news").then(theme=>this.setState({dynamic_style:theme}));
    this.render_header();
    this.load_fav();
  }
  check_is_fav=()=>{
    backup.load_movie_fav().then(o=>{
      this.setState({favorite:o});
    });
  }
  refresh_list=()=>{
    const tmp_list = JSON.parse(JSON.stringify(this.state.list)) ;
    if(this._isMounted){
      this.setState({list:[]}); 
      this.setState({list:tmp_list});
    }
  }
  
  componentWillUnmount(){
    console.log("--------componentWillUnmount");
    this._isMounted=false;
    clearInterval(this.interval_refresh);
    this.toggle_keys_listner(false);
    for(let i=0;i < this.subscribetions.length;i++){
      this.subscribetions[i]();
    }
  }
  
  toggle_keys_listner=(status)=>{
    if(API_.isWeb){
      if(status){
        document.addEventListener("keydown", this.keysListnerFunction, false);
      }else{
        document.removeEventListener("keydown", this.keysListnerFunction, false);
      }
    }
  }
  keysListnerFunction = (event)=>{
    if(API_.remote_controle){
      //alert(`Prissed key -${event.keyCode}-`);
      if(event.keyCode==403){
        if(this.state.page>1){
          this.state.page--;
          this.get_movies();
        }
      }else if(event.keyCode==404){
        this.get_favorites();//reload
      }else if(event.keyCode==405){
        this.get_favorites();
      }else if(event.keyCode==406){
        this.state.page++;
        this.get_movies();
      }

    }
  }
  get_movies =(loading=true,keep_list=false)=>{
    if(this.state.loading==false && loading){
      this.data = {};
      this.setState({loading:true,list:[]});
    }
    if (this.state.source_id==2){
      return this.get_movies_PB(loading,keep_list);
    }else if (this.state.source_id==4){
      return this.get_movies_MC(loading,keep_list);
    }
    const options = {};
    options.page           = this.state.page;
    options.genre          = this.state.genre;
    options.sort_by        = this.state.sortby;
    options.minimum_rating = this.state.rate;
    options.query_term = this.state.search_qeury;
    
    API_.get_yify_movies(options).then(data=>{
      if(loading){
        this.state.loading = false;
      }
      if(this._isMounted && data && data.data && data.data.movies){
        if(keep_list){
          data = this.state.list.concat(data.data.movies);
        }
        this.setState({list:data.data.movies});
      }
    });
  }
  get_favorites=()=>{
    if(this.state.is_fav_list){
      this.setState({list:this.data_last});
    }else{
      this.data_last = this.state.list;
      this.setState({list:this.state.favorite_movies?this.state.favorite_movies:[]});
    }
    this.state.is_fav_list = !this.state.is_fav_list;
  }
  get_movies_MC = (loading=true,keep_list=false)=>{
    API_.get_MC_movies(this.state.genre, this.state.page, this.state.search_qeury).then(data=>{
      try {
        this.data = JSON.parse(JSON.stringify(data));
      } catch (error) {this.data = {};  }
        
      if(loading){
        this.state.loading = false;
      }
      if(this._isMounted && data){
        data = this.get_section("Trending");
        if(keep_list){
          data = this.state.list.concat(data);
        }
        this.setState({list:data});
      }
    });
  }
  get_section(section){
    let data = [];
    const sections = Object.keys(this.data);
    if(sections.length>1){
      data = this.data[section] ? this.data[section] : [];
    }else if(sections.length == 1){
      data = this.data[sections[0]];
    }
    return data.slice();
  }
  get_movies_PB = (loading=true,keep_list=false)=>{
    const options = {action:"list", section:this.state.section, page:this.state.page,search_qeury:this.state.search_qeury};
    options.action = this.state.search_qeury=="" ? options.action : "search";
    API_.get_PB_movies(options).then(data=>{
      if(loading){
        this.state.loading = false;
      }
      if(this._isMounted && data){
        if(keep_list){
          data = this.state.list.concat(data);
        }
        this.setState({list:data});
      }
    });
  }

  onItem_clicked =(item)=>{
    item.source = this.state.source_id;
    this.props.navigation.navigate('Movie', { item: item, id:item.id,source:item.source });
  }
  change_genre = (itemValue, itemIndex)=>{
    this.state.genre = itemValue;
    this.state.page=1;
    this.get_movies();
  }
  change_section = (itemValue, itemIndex)=>{
    this.setState({list:this.get_section(itemValue),data_section:itemValue});
  }
  
  change_rate = (itemValue, itemIndex)=>{
    this.state.rate = itemValue;
    this.state.page=1;
    this.get_movies();
  }
  change_sortby = (itemValue, itemIndex)=>{
    this.state.sortby = itemValue;
    this.state.page=1;
    this.get_movies();
  }
  render_header(){
    const iconsSize = this.state.dynamic_style && this.state.dynamic_style.title ? this.state.dynamic_style.title.fontSize : 15;
    const inputtext_width = API_.isWeb ? "85%" : 120;
    this.props.navigation.setOptions({
      title:"Movies",
      "headerRight":()=>(
        <View style={{flexDirection:"row",margin:5,padding:5,width:"80%"}}>
            <TextInput 
              style={{flex:1,backgroundColor:"black",color:"white",marginLeft:10,marginVertical:5,borderWidth:1,borderColor:"white",borderRadius:5,width:inputtext_width}}
              onChangeText={(val)=>{this.state.search_qeury = val;this.render_header();}}
              value={this.state.search_qeury}
              onSubmitEditing={this.get_movies} 
              ref={(ref) => { this.state.search_input_ref = ref; }}
              />
          <IconButton 
            name="search" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} 
            onPress={this.get_movies}  />
        </View>
      ),
    "headerLeft":()=>(<View style={{flexDirection:"row",margin:5,padding:5,width:"50%"}}>
        <IconButton 
          name="long-arrow-left" size={this.state.dynamic_style.title.fontSize} style={[this.state.dynamic_style.icons,{marginHorizontal:10}]} 
          onPress={()=>this.props.navigation.navigate('Videos')}  />
        <IconButton 
          name="star" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} 
          onPress={this.get_favorites}  />
</View>)
    });
  }
  render_extra_headers(){
    const wide_width = API_.isWeb ? "30%" : "45%";
    const picker_style = {height:this.isIOS ? 40 :70,backgroundColor:"#2d3436",color:"#dfe6e9" ,borderColor:"white",borderWidth:1,marginHorizontal:2};
    const genres = <Picker
    selectedValue={this.state.genre}
    style={[picker_style,{width:this.state.source_id==1 ? "30%" : wide_width}]}
    itemStyle={{height:70,backgroundColor:"#2d3436",color:"#dfe6e9" }}
    onValueChange={this.change_genre}
  >
     { this.state.source_id==1 ? this.genres.map(g=><Picker.Item label={g} value={g} key={g} />)
     : Object.keys(this.genres_MC).map(k=><Picker.Item label={this.genres_MC[k]} value={k} key={k} />)
     }
    </Picker>;
    const sections = this.state.source_id==4 && this.data && Object.keys(this.data) && Object.keys(this.data).length>1 && this.state.is_fav_list==false ? 
      <Picker
        selectedValue={this.state.data_section}
        style={[picker_style,{width:this.state.source_id==1 ? "30%" : wide_width}]}
        itemStyle={{height: this.isIOS ? 30 :60,backgroundColor:"#2d3436",color:"#dfe6e9" }}
        onValueChange={this.change_section}
      >
       {Object.keys(this.data).map(k=><Picker.Item label={k} value={k} key={k} />)}
        </Picker> : null;
    return this.state.source_id==1 || this.state.source_id==4 ? 
      <View style={{flex:1,flexDirection:"row"}}>
        <Text style={this.state.dynamic_style.text_small}>⌖</Text>
        {this.state.is_fav_list==false ? genres : null}
        { this.state.source_id==1?
          <>
        <Text style={this.state.dynamic_style.text_small}>＃</Text>
        <Picker
            selectedValue={this.state.rate}
            style={[picker_style,{width:"19%"}]}
            itemStyle={{height:70,backgroundColor:"#2d3436",color:"#dfe6e9" }}
            onValueChange={this.change_rate}
          >
            {this.rates.map(g=><Picker.Item label={"+"+g} value={g} key={g} />)}
        </Picker>
        <Text style={this.state.dynamic_style.text_small}>⇅</Text>
        <Picker
            selectedValue={this.state.sortby}
            style={[picker_style,{width:"40%"}]}
            itemStyle={{height:70,backgroundColor:"#2d3436",color:"#dfe6e9" }}
            onValueChange={this.change_sortby}
          >
            {this.sortby.map(g=><Picker.Item label={g} value={g} key={g} />)}
        </Picker>
        
        </>:sections
        }
        <Text style={this.state.dynamic_style.text_small}>{this.state.list && this.state.list.length>=0 ? this.state.list.length : "-"}</Text>
      </View>
    : null
  }
  render() {
    const ListHeaderComponent = (        <View style={this.state.dynamic_style.nav_container}>
      <IconButton
        disabled={this.state.loading}
       title="arrow-back-circle"  name="chevron-left" 
       size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
        if(this.state.page==1){return false;}
        this.state.page--;
        this.get_movies();
      }}  />
      <Text style={this.state.dynamic_style.text_small}>{this.state.page}</Text>
      <IconButton 
        disabled={this.state.loading}
       title="forward"  name="chevron-right" 
       size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
        this.state.page++;
        this.get_movies();
      }}  />
        {this.render_extra_headers()}
    </View>);
    return (
      <View style={this.state.dynamic_style.container}>     
        <ItemsList 
          ListHeaderComponent = {ListHeaderComponent}
          ListFooterComponent = {ListHeaderComponent}
          
          refresh_list={this.refresh_list}
          refreshControl={<RefreshControl progressViewOffset={200} refreshing={this.state.loading} onRefresh={this.get_movies} />}
          loading={this.state.loading} 
          list={this.state.list} 
          onclick={this.onItem_clicked} 
          key_="title_long" key_key="id"  
          page={this.state.page}
          favorite={this.state.favorite}
          set_fav={(item)=>{backup.save_movie_fav(item, !this.state.favorite.includes(item.url)).then(o=>this.load_fav());}}
          keyScroll={true}
          mapkeys={{
              51:{action:this.state.search_input_ref?()=>{this.state.search_input_ref.focus();}:undefined},
              96:{action:this.state.search_input_ref?()=>{this.state.search_input_ref.focus();}:undefined},
            }}
          _navigation={this.props.navigation}
          />
        
      </View>
    );
  }
}

export default MoviesScreen;
