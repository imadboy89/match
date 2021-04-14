import React from 'react';
import {  Modal,Text, View, Button,ScrollView } from 'react-native';
import {getTheme} from "../components/Themes";
import {onMatch_LongPressed,get_notifications_matches} from "../Libs/localNotif";
import ItemsList from '../components/list';

class MatchesNotifs extends React.Component{
    constructor(props) {
      super(props);
      this.state = {
        dynamic_style:this.props.dynamic_style,
        dynamic_style_colors:{},
        list:[],
        notifications_matches : [],
        minWidth:0,
      };
      this._isMounted = false;
      }
      componentDidMount(){
        this._isMounted=true;
        getTheme("styles_notif").then(theme=>this.setState({dynamic_style_colors:theme}) );
        this.load_notif_matches();
      }
      componentWillUnmount(){
        this._isMounted=false;
      }
      load_notif_matches=async()=>{
        const notifications_matches = API_.notifications_matches;
        let list = notifications_matches ? Object.values(notifications_matches).map(oo=>{
          let data = oo.content && oo.content.data && oo.content.data.data ? oo.content.data.data : {};
          if(Object.keys(data).length==0 && oo.id ){
            return oo;
          }
          try {
            data = JSON.parse(data);
          } catch (error) {console.log(error, data);}
          return data;
         }) : [];

        list = list.filter(o=> o && Object.keys(o) && Object.keys(o).length>0 );
        list = list.sort((a,b)=> a.date<b.date ? -1 : 0);
        let list_new = {};
        for(let i=0; i<list.length;i++){
          const item = list[i];
          if(list_new[item["date"]] == undefined ){
            list_new[item["date"]] = [item,];
          }else{
            list_new[item["date"]].push(item);
          }
        }

        list = list_new &&  Object.keys(list_new).length>0 ? Object.keys(list_new).map(k=>{
          let dayname = "";
          try {
            dayname = API_.days[API_.convert_time_o(list_new[k][0].date+" 00:00").getDay()]
          } catch (error) {}
          return {"title":k + "-" + dayname,"data":list_new[k]};
        }) : [];

        list = await API_.set_logos(list);

        
        this.setState({list:list});

      }
      _onMatch_LongPressed=(item)=>{
        onMatch_LongPressed(item).then(oo=>{
          if(oo==false){return false;}
          this.setState({notifications_matches:[]});
          get_notifications_matches().then(o=>{this.setState({notifications_matches:o});} );
        });
      }
      onMatch_clicked =(item)=>{
        //this.props.navigation.navigate('Match', { match_item: item });
        const item_ = this.state.notifications_matches[item.id+""]  ? this.state.notifications_matches[item.id+""] : "not exeist : "+item.id;
        alert(item_.trigger && item_.trigger.value ? API_.get_date_time(new Date(item_.trigger.value)) : "No value");
      }
      refresh_list=()=>{
        const tmp_list = JSON.parse(JSON.stringify(this.state.list)) ;
        if(this._isMounted){
          this.setState({list:[],page:1}); 
          this.setState({list:tmp_list});
        }else{alert("unmounted")}
      }
      render(){
        const MModal = API_.isWeb ? require("modal-enhanced-react-native-web").default : Modal;
        const flatlist = ( <ItemsList 
          fixedWidth={true}
          minWidth={this.state.minWidth}
          list={this.state.list} 
          onclick={this.onMatch_clicked}
          onLongPress={this._onMatch_LongPressed}
          key_="home_team" key_key="id" disableHide={true}
          refresh_list={this.refresh_list}
            />);
        return (
          <MModal 
          animationType="slide"
          transparent={true}
          visible={this.props.modal_visible}
          onRequestClose={() => this.props.closeModal() }
          
        > 
          <View style={this.state.dynamic_style.modal_view_container}>
          <View style={[this.state.dynamic_style.modal_view,this.state.dynamic_style.modal_view_large]}>
            <View style={[this.state.dynamic_style.modal_body]} onLayout={(event) => {
              if(this.state.minWidth==0){
                var {x, y, width, height} = event.nativeEvent.layout;this.state.minWidth=parseInt(width);
                this.setState({});
              }
              }}>
              {this.state.minWidth>0 && this.state.list.length>0 ? flatlist : null}
            </View>
            <View style={this.state.dynamic_style.footer}>
              <View style={this.state.dynamic_style.footer_button}>
                <Button
                    title={"Cancel"}
                    color="#f39c12"
                    onPress={()=>this.props.closeModal()}
                ></Button>
              </View>
            </View>
          </View>
          </View>
          </MModal>
        );
      }
  }

  export default MatchesNotifs ;