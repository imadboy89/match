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
      }
      componentDidMount(){
        getTheme("styles_notif").then(theme=>this.setState({dynamic_style_colors:theme}) );
        get_notifications_matches().then(o=>{this.setState({notifications_matches:o});});
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
      render(){
        const MModal = API_.isWeb ? require("modal-enhanced-react-native-web").default : Modal;
        let i=0;
        const history = [{time:" Time",type:"Type",body:"Body"}].concat(API_.messages_history).map(line=>{
          const style_k = this.state.dynamic_style_colors["txt_"+line.type] ? line.type : "";
          const indecator_style= style_k!="" ? this.state.dynamic_style_colors["bg_"+style_k] : {};
          const text_style= style_k!="" ?  this.state.dynamic_style_colors["txt_"+style_k] : {};
          i+=1;
          return (<View style={{flexDirection:'row', flexWrap:'wrap',width:"100%",paddingVertical:2}} key={line.time+i}>
          <Text style={this.state.dynamic_style.log_time_text}>{line.time.split(" ").length==2 ? line.time.split(" ")[1]:""}</Text>
          <Text style={[this.state.dynamic_style.log_type_text,text_style]}>{line.type}</Text>
          <View style={[this.state.dynamic_style_colors.indecator_thin,indecator_style]}></View>
          <Text style={[this.state.dynamic_style.log_msg_text,text_style]}>{line.body}</Text>
        </View>);
        });
        this.state.list = this.state.notifications_matches ? Object.values(this.state.notifications_matches).map(oo=>{
          let data = oo.content && oo.content.data && oo.content.data.data ? oo.content.data.data : {};
          try {
            data = JSON.parse(data);
          } catch (error) {data = JSON.parse(oo.content.data);}
          return data;
         }) : [];
         
        this.state.list = this.state.list.filter(o=> o && Object.keys(o) && Object.keys(o).length>0 );
        this.state.list = this.state.list.sort((a,b)=> a.date<b.date ? -1 : 0);
        let list_new = {};
        for(let i=0; i<this.state.list.length;i++){
          const item = this.state.list[i];
          if(list_new[item["date"]] == undefined ){
            list_new[item["date"]] = [item,];
          }else{
            list_new[item["date"]].push(item);
          }
        }
        this.state.list = list_new &&  Object.keys(list_new).length>0 ? Object.keys(list_new).map(k=>{
          let dayname = "";
          try {
            dayname = API_.days[API_.convert_time_o(list_new[k][0].date+" 00:00").getDay()]
          } catch (error) {}
          return {"title":k + "-" + dayname,"data":list_new[k]};
        }) : [];
        //this.state.list = this.state.list.slice(0,1);
        //alert(JSON.stringify(this.state.list));
        //API_.showMsg(JSON.stringify(list));
        return (
          <MModal 
          animationType="slide"
          transparent={true}
          visible={this.props.modal_visible}
          onRequestClose={() => this.props.closeModal() }
          
        > 
          <View style={this.state.dynamic_style.modal_view_container}>
          <View style={[this.state.dynamic_style.modal_view,this.state.dynamic_style.modal_view_large]}>
            <View style={[this.state.dynamic_style.modal_body]} onLayout={(event) => {var {x, y, width, height} = event.nativeEvent.layout;this.state.minWidth=width;}}>
              {this.state.minWidth>0 ? 
                <ItemsList 
                  fixedWidth={true}
                  minWidth={this.state.minWidth}
                  list={this.state.list} 
                  onclick={this.onMatch_clicked}
                  onLongPress={this._onMatch_LongPressed}
                  notifications_matches={this.state.notifications_matches}
                  key_="home_team" key_key="id" disableHide={true}
                    /> : null}
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