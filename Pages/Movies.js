import * as React from 'react';
import { View, Picker, Modal, Alert , TextInput , RefreshControl } from 'react-native';
import Constants from 'expo-constants';
import ItemsList from '../components/list';
import DateTimePicker from '@react-native-community/datetimepicker';
import IconButton from "../components/IconButton";
import {styles_news,getTheme} from "../components/Themes";
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

    };
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
  this.get_movies();
  }
  load_fav=()=>{
    backup.load_movie_fav(this.state.movie_id_ori).then(favorite_movies=>{
      const favorite = favorite_movies.map(o=>o.url?o.url:"");
      this.setState({favorite,favorite_movies});
    });
  }
  componentDidMount(){
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
    this._isMounted=false;
    clearInterval(this.interval_refresh);
  }
  
  get_movies =(loading=true,keep_list=false)=>{
    if(this.state.loading==false && loading){
      this.setState({loading:true});
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
      this.get_movies();
    }else{
      this.setState({list:this.state.favorite_movies});
    }
    this.state.is_fav_list = !this.state.is_fav_list;
  }
  get_movies_MC = (loading=true,keep_list=false)=>{
    API_.get_MC_movies(this.state.section, this.state.page, this.state.search_qeury).then(data=>{
      if(loading){
        this.state.loading = false;
      }
      if(this._isMounted && data){
        if(keep_list){
          data = this.state.list.concat(data);
        }
        this.setState({list:data.slice(0,30)});
      }
    });
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
    this.props.navigation.setOptions({
      title:"Movies",
      "headerRight":()=>(
        <View style={{flexDirection:"row",margin:5,padding:5,width:"90%"}}>
            <TextInput 
              style={{flex:1,backgroundColor:"black",color:"white",marginLeft:10,marginVertical:5,borderWidth:1,borderColor:"white",borderRadius:5,width:"85%"}}
              onChangeText={(val)=>{this.state.search_qeury = val;this.render_header();}}
              value={this.state.search_qeury}
              />
          <IconButton 
            name="search" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} 
            onPress={this.get_movies}  />
        </View>
      ),
      "headerLeft":()=>(
          <IconButton 
            name="star" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} 
            onPress={this.get_favorites}  />
      )
    });
  }
  render() {
    const picker_style = {height:"90%",backgroundColor:"#2d3436",color:"#dfe6e9" ,borderColor:"white",borderWidth:1};
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
      {this.state.source_id==1 ? 
        <View style={{flex:1,flexDirection:"row"}}>
        <Text style={this.state.dynamic_style.text_small}>⌖</Text>
          <Picker
              selectedValue={this.state.genre}
              style={[picker_style,{width:"40%"}]}
              itemStyle={{height:70,backgroundColor:"#2d3436",color:"#dfe6e9" }}
              onValueChange={this.change_genre}
            >
              {this.genres.map(g=><Picker.Item label={g} value={g} key={g} />)}
          </Picker>
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
        </View>
      : null}
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
          />
        
      </View>
    );
  }
}

export default MoviesScreen;
