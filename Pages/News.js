import * as React from 'react';
import { View, Modal, Button, Switch, RefreshControl,ScrollView } from 'react-native';
import ItemsList from '../components/list';
import IconButton from "../components/IconButton";
import {styles_news,getTheme} from "../components/Themes";
import {Picker} from '@react-native-picker/picker';
class NewsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        list:[],
        page : 1,
        loading:true,
        dynamic_style : styles_news,
        source_id:1 ,
        hide_images:false,
        show_events_modal : false,
        modal_events_content : null,
    };
    this._isMounted= false;
    this.resources_static = {1:"Kr_MA",6:"Kr_world",7:"Kr_home"};
    this.resources = {};
  
    this.interval_refresh = setInterval(()=>{
      if(this.state.page==1){this.get_news(false);}
      }, 80000);

    this.news_id = this.props.route.params && this.props.route.params.news_id ? this.props.route.params.news_id : false;
    this.news_title = this.props.route.params && this.props.route.params.title ? this.props.route.params.title : false;
    backup.load_following().then(p=>{
      this.setState({});
      this.render_header();
    });
    
  }
  componentDidMount(){
    this._isMounted=true;
    this.screen_focus_mng();
    getTheme("styles_news").then(theme=>this.setState({dynamic_style:theme}));
    getTheme("styles_modal").then(theme=>this.setState({modal_dynamic_style:theme}));
    this.get_news();
    this.render_header();
    API_.get_events().then(data=>{
      if(this._isMounted){
        this.setState({modal_events_content:data});
      }
    });
  }
  screen_focus_mng(){
    this.is_focused = true;
    this.subscribetions=[];
    this.subscribetions.push(this.props.navigation.addListener('focus', () => {
      this.is_focused = true;
    }));
    this.subscribetions.push(this.props.navigation.addListener('blur', () => {
      this.is_focused = false;
    }));
  }
  render_header=()=>{
    let title = this.resources[this.state.source_id] ? this.resources[this.state.source_id] : "News";
    title = this.news_title ? this.news_title : title;
    this.props.navigation.setOptions({title: title,
    "headerLeft":()=>(<View style={{flexDirection:"row",margin:5}}>
         <IconButton 
            name="podcast" 
            size={this.state.dynamic_style.title.fontSize} 
            style={this.state.dynamic_style.icons} 
            onPress={()=>{
            this.setState({show_events_modal:true});
          }}  />
    </View>),
    "headerRight":()=>(
      <View style={{flexDirection:"row",margin:5}}>
      <Switch
        style={{justifyContent:"center",marginVertical:"auto",marginHorizontal:10,width:40}}
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={this.state.hide_images ? "#f5dd4b" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={this.update_is_hide_images}
        value={this.state.hide_images}
      />
          { isNaN( this.state.source_id ) ? 
          <IconButton 
            name="minus-circle" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
            this.unfollow();
          }}  />
          :null }
          <IconButton 
            name="refresh" size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
            this.get_news();
          }}  />
    </View>
    )
    });
  }
  update_is_hide_images=(k,v)=>{
    this.setState({hide_images:k});
    this.render_header();
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
get_news =(loading=true,keep_list=false)=>{
  if(this.is_focused==false){return;}
  let _source_id = parseInt( this.state.source_id );
  let _news_id   = this.news_id;
  if( isNaN(_source_id) ){
    _news_id = this.state.source_id;
    _source_id = 1;
  }
  if(this.state.loading==false && loading){
    this.setState({loading:true});
  }
  API_.get_news(this.state.page,_source_id,_news_id).then(data=>{
    if(this._isMounted){
      if(keep_list){
        data = this.state.list.concat(data);
      }
      if(loading){
        this.state.loading = false;
      }
      this.setState({list:data});
    }
  });
}
  unfollow = ()=>{
    let _source_id = parseInt( this.state.source_id );
    let _news_id   = this.news_id;
    if( isNaN(_source_id) ){
      _news_id = this.state.source_id;
      _source_id = 1;
      backup.save_following({url:_news_id}).then(o=>this.setState({}));
    }
    this.state.source_id = 1;
    this.get_news();
    this.render_header();
  }
  onItem_clicked =(item)=>{
    item.source = this.state.source_id;
    this.props.navigation.navigate('Article', { article: item, id:item.link.replace("n=","") });
  }
  changesource = (itemValue, itemIndex)=>{
    this.state.source_id = itemValue;
    this.state.page=1;
    this.get_news();
    this.render_header();
  }
  onclick_events = (item)=>{
    item.logo = ["https://","http://"].includes(item.logo.slice(0,7)) ? item.logo : "https:"+item.logo;
    this.props.navigation.push('League',{ league_details: {league:item.name,league_img:item.logo,id:item.id} });
    this.setState({show_events_modal:false});
  }
  render_modal_events(){
    const MModal = API_.isWeb ? require("modal-enhanced-react-native-web").default : Modal;
    if(this.state.modal_dynamic_style == undefined){
      return null;
    }
    let content = [];
    if(this.state.modal_events_content){
      for(let key in this.state.modal_events_content){
        const list_comps = this.state.modal_events_content[key];
        const related_header = <Text style={this.state.dynamic_style.events_title}>{key} :</Text>;
        content.push(<ItemsList key={key}
          ListHeaderComponent={related_header}
          loading={false}
          list={list_comps} 
          key_={"name"} key_key={"id"}
          minWidth={500}
          onclick={this.onclick_events}
          />);
      }
    }
    return (
      <MModal 
      animationType="slide"
      transparent={true}
      visible={this.state.show_events_modal}
      onRequestClose={() => {} }
      
    > 
          <View style={this.state.modal_dynamic_style.modal_view_container}>
          <View style={[this.state.modal_dynamic_style.modal_view,this.state.modal_dynamic_style.modal_view_large]}>

          <View style={[this.state.dynamic_style.modal_body,{justifyContent:"flex-start",height:450}]}>
            <ScrollView  style={[{flex: 1,width:"98%",marginHorizontal:10,height:"99%"}]}>
                { this.state.modal_events_content && content && content.length ? content : null }
            </ScrollView>
          </View>


            <View style={this.state.modal_dynamic_style.footer}>
              <View style={this.state.dynamic_style.settings_row_input}>
                <Button
                      title={"close"}
                      disabled={this.state.savingCredents || this.state.email=="" || this.state.password=="" }
                      color= "#2ecc71"
                      onPress={()=> this.setState({show_events_modal:false}) }
                  ></Button>
              </View>
            </View>
          </View>
          </View>
    </MModal>);
  }
  render() {
    this.resources = JSON.parse(JSON.stringify(this.resources_static));
    API_.following.map(f=> this.resources[f.url] = f.title);
    const picker_options = Object.keys(this.resources).map(o=><Picker.Item label={this.resources[o]} value={o} key={o} />);
    const ListHeaderComponent = (        <View style={this.state.dynamic_style.nav_container}>
      <IconButton
        disabled={this.state.loading}
       title="arrow-back-circle"  name="chevron-left" 
       size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
        if(this.state.page==1){return false;}
        this.state.page--;
        this.get_news();
      }}  />
      <Text style={this.state.dynamic_style.text}>{this.state.page}</Text>
      <IconButton 
        disabled={this.state.loading}
       title="forward"  name="chevron-right" 
       size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
        this.state.page++;
        this.get_news();
      }}  />
      {this.news_id ? null : 
      <Picker
          selectedValue={this.state.source_id}
          style={{ height:"90%",backgroundColor:"#2d3436",color:"#dfe6e9" ,width:150}}
          itemStyle={{height:70,backgroundColor:"#2d3436",color:"#dfe6e9" }}
          onValueChange={this.changesource}
        >
          {picker_options}
      </Picker>
      }
    </View>);
    
    return (
      <View style={this.state.dynamic_style.container}>
        {this.state.list ? 
        <ItemsList 
          ListHeaderComponent = {ListHeaderComponent}
          ListFooterComponent = {ListHeaderComponent}
          
          refresh_list={this.refresh_list}
          refreshControl={<RefreshControl progressViewOffset={200} refreshing={this.state.loading} onRefresh={this.get_news} />}
          loading={this.state.loading} 
          list={this.state.list} 
          onclick={this.onItem_clicked} 
          key_="title_news" key_key="link"  
          page={this.state.page}
          hide_images={this.state.hide_images}
          />
          :null}
        {this.render_modal_events()}
      </View>
    );
  }
}

export default NewsScreen;
