import * as React from 'react';
import { View, Picker, Modal, Button, TouchableOpacity, RefreshControl } from 'react-native';
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
        source_id:1 ,
        genre:"",
        rate:0,
        sortby:"date_added",

    };
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
  componentDidMount(){
    this._isMounted=true;
    getTheme("styles_news").then(theme=>this.setState({dynamic_style:theme}));
    this.props.navigation.setOptions({title: "News",
    "headerRight":()=>(
          <IconButton 
            name="refresh" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
            this.get_movies();
          }}  />
  )
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
  const options = {};
  options.page           = this.state.page;
  options.genre          = this.state.genre;
  options.sort_by        = this.state.sortby;
  options.minimum_rating = this.state.rate;
  API_.get_yify_movies(options).then(data=>{
    if(this._isMounted){
      if(keep_list){
        data = this.state.list.concat(data.data.movies);
      }
      if(loading){
        this.state.loading = false;
      }
      this.setState({list:data.data.movies});
    }
  });
}

  onItem_clicked =(item)=>{
    item.source = this.state.source_id;
    this.props.navigation.navigate('Movie', { item: item, id:item.id });
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
      <Text style={this.state.dynamic_style.text}>{this.state.page}</Text>
      <IconButton 
        disabled={this.state.loading}
       title="forward"  name="chevron-right" 
       size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
        this.state.page++;
        this.get_movies();
      }}  />
      <Picker
          selectedValue={this.state.genre}
          style={[picker_style,{flex:3}]}
          itemStyle={{height:70,backgroundColor:"#2d3436",color:"#dfe6e9" }}
          onValueChange={this.change_genre}
        >
          {this.genres.map(g=><Picker.Item label={g} value={g} key={g} />)}
      </Picker>
      <Picker
          selectedValue={this.state.rate}
          style={[picker_style,{flex:1}]}
          itemStyle={{height:70,backgroundColor:"#2d3436",color:"#dfe6e9" }}
          onValueChange={this.change_rate}
        >
          {this.rates.map(g=><Picker.Item label={"+"+g} value={g} key={g} />)}
      </Picker>
      <Picker
          selectedValue={this.state.sortby}
          style={[picker_style,{flex:3}]}
          itemStyle={{height:70,backgroundColor:"#2d3436",color:"#dfe6e9" }}
          onValueChange={this.change_sortby}
        >
          {this.sortby.map(g=><Picker.Item label={g} value={g} key={g} />)}
      </Picker>
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
          />
        
      </View>
    );
  }
}

export default MoviesScreen;
