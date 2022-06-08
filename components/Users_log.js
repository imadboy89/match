import React from 'react';
import {  Text, View, Button,Switch, Modal, ActivityIndicator,ScrollView ,TouchableHighlight,Keyboard} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconButton from "./IconButton";
import User_log from "./User_log";
import Loader from "./Loader";

class Users_log extends React.Component{
    constructor(props) {
      super(props);
      this.state = {
        user_username : "",
        users : false,
        usersLoading : false,
        actionRunning : false,
        msg_text : "",
        modalVisible_msg : false,
        dynamic_style:this.props.dynamic_style,
        focused_user:"",
        user_log : false,
        show_user_log : false,
        user_activities : false,
        only_others : true,
        page_limit:20,
        page:1,
      };
      
    } 
    componentDidMount() {
      this.props.onRef(this);
    }
    componentWillUnmount() {
      this.props.onRef(undefined);
    }

    loadUsers = async()=>{
      this.setState({users:false,usersLoading:true,actionRunning:true,page:1});
      let users = await backup.load_trace(this.state.only_others);
      users = users.sort((a,b)=> a.datetime>b.datetime ? -1 : 1);
      this.setState({users:users,usersLoading:false,actionRunning:false});
    }
    user_log(){
      if(this.state.show_user_log==false){
        return null;
      }
      return <User_log 
        user_log={this.state.user_log} 
        modal_visible={this.state.show_user_log===true && this.state.user_log!=false} 
        closeModal={()=>{this.setState({show_user_log:false,user_log:false})}} /> 
    }
    show_activities(){
      //s.params
      if(this.state.user_activities == false){
        return null;
      }
      const screens = this.state.user_activities.navigation_history ? this.state.user_activities.navigation_history.map(s=>{
        let time = parseInt(s.time);
        time = isNaN(time) ? 0 : API_.get_date_timeS(new Date(time)) ;
        return <View style={{flexDirection:"row",width:"95%",height:40,borderStyle:"solid",borderWidth:1,margin:3,alignItems: 'center'}} key={s.time+""}>
        <Text style={{color:"#fff" ,textAlign: 'left',justifyContent:"center",width:"80%"}}> 
        {s.name}-{s.app?s.app:""} - {time}
        </Text>
            <IconButton
              name="eye"
              disabled={this.state.actionRunning}
              size ={28}
              color={this.state.actionRunning ? "#bdc3c7" : "#3498db"}
              onPress={()=>{ 
                this.props.navigation.push(s.name, s.params); 
              }}
          />
    </View>;
        
      }) : null;
      const MModal = API_.isWeb ? require("modal-enhanced-react-native-web").default : Modal;
      return (
<MModal 
animationType="slide"
transparent={true}
visible={this.state.user_activities != false}
onRequestClose={() => { this.setState({ user_activities:false,}); }}
> 
<View style={this.state.dynamic_style.modal_view_container}>
<View style={[this.state.dynamic_style.modal_view,this.state.dynamic_style.modal_view_large]}>
<View style={this.state.dynamic_style.modal_body}>
    <ScrollView style={{width:"100%",backgroundColor:"#646c78"}}>
      {screens}
    </ScrollView> 
    
</View>
<View style={this.state.dynamic_style.footer}>
  <View style={this.state.dynamic_style.footer_button}>
  <Icon.Button 
            name="remove"
            disabled={this.state.actionRunning}
            onPress={()=>{
              this.setState({user_activities:false});
            }}
          >Close</Icon.Button>
  </View>
</View>
</View>
</View>
</MModal>
        );
    }
    render_users(){
      if (this.state.usersLoading){
        return <ActivityIndicator size="large" color="#00ff00" /> ;
      }
      if(!this.state.users || !this.state.users.map){
        return null;
      }
      //infos.device_type+" - "+infos.modelName
      const pagination_from = (this.state.page-1) * this.state.page_limit;
      const pagination_to   = this.state.page * this.state.page_limit;
      return this.state.users.slice(pagination_from, pagination_to).map( (_user,i) =>{
        const user = _user.email ;
        const online_at =  _user.datetime ? API_.get_date_time(_user.datetime) : "-";
        
        return (
          <View style={{flexDirection:"row",width:"95%",height:40,borderStyle:"solid",borderWidth:1,margin:3,alignItems: 'center'}} key={_user._id}>
            <TouchableHighlight style={{flex:1,height:"100%",justifyContent:"center"}} 
              onPress={()=>this.setState({focused_user:_user._id})}
              >
            <View style={{flex:1,width:"100%",height:"100%"}}>
              <View style={{flex:1,width:"100%",height:"100%", flexDirection:"row"}}>
                <Text style={{color: _user.disabled  ? "#95a5a6" : "#fff" ,textAlign: 'left',justifyContent:"center",width:"70%"}}> 
                  {_user.app && _user.app!="AL-Match"?_user.app+"-":""}{user} 
                </Text>
                <Text style={{color: "#ecf0f1" ,textAlign: 'right',flex:50,fontSize:8,marginHorizontal:1,width:"29%"}} >
                  {_user.modelName && _user.modelName!="-"?_user.modelName:_user.device_type}
                </Text>
              </View>
              <Text style={{color: "#fff" ,textAlign: 'left',fontSize:9,marginHorizontal:1,width:"100%"}} >{online_at}</Text>
              {this.state.focused_user == _user._id ? 
                null
              : null}
            </View>

            </TouchableHighlight>

            <View style={{flexDirection:"row",alignSelf: 'center',}}>

              <IconButton
                  name="search"
                  disabled={this.state.actionRunning}
                  size ={28}
                  color={this.state.actionRunning ? "#bdc3c7" : "#3498db"}
                  onPress={()=>{ this.setState({show_user_log:true,user_log:_user}); }}
              />

              <IconButton 
                name={ "desktop" }
                onPress={()=>{ this.setState({user_activities:_user}); }}
                size={28} 
                color={this.state.actionRunning ? "#bdc3c7" : "#3498db"}
                disabled={this.state.actionRunning}
                badge_text = {_user.navigation_history ? _user.navigation_history.length : 0}
                badge_bg_color = {"bg_warning"}
                />
            </View>
                
          </View>
        );
      });

    }
      close(){
        Keyboard.dismiss();
        
        this.props.closeModal();
        this.setState({users:false});
      }
      render(){
        const MModal = API_.isWeb ? require("modal-enhanced-react-native-web").default : Modal;
        const ListHeaderComponent = (        <View style={this.state.dynamic_style.nav_container}>
          <IconButton
            disabled={this.state.usersLoading || this.state.page==1}
           title="arrow-back-circle"  name="chevron-left" 
           size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
            if(this.state.page==1){return false;}
            this.state.page--;
            this.setState({})
          }}  />
          <Text style={this.state.dynamic_style.text}>{this.state.page}</Text>
          <IconButton 
            disabled={this.state.usersLoading || this.state.page*this.state.page_limit> this.state.users.length}
           title="forward"  name="chevron-right" 
           size={this.state.dynamic_style.title.fontSize} style={this.state.dynamic_style.icons} onPress={()=>{
            if(this.state.page*this.state.page_limit> this.state.users.length){return false;}
            this.state.page++;
            this.setState({})
          }}  />
        </View>);
        return (
          <MModal 
          animationType="slide"
          transparent={true}
          visible={this.props.modal_visible}
          onRequestClose={() => this.close() }
        > 
        <View style={this.state.dynamic_style.modal_view_container}>
        <View style={[this.state.dynamic_style.modal_view,this.state.dynamic_style.modal_view_large]}>
          <View style={this.state.dynamic_style.modal_body}>
            {this.state.users!=false ?
              <ScrollView style={{width:"100%",backgroundColor:"#646c78"}}>
                {this.render_users()}
              </ScrollView> 
              :<Loader/>
              }
          </View>
          <View style={this.state.dynamic_style.footer}>
              <View style={this.state.dynamic_style.settings_row_input}>
                <Switch
                    style={{justifyContent:"center",marginVertical:"auto",marginHorizontal:10,width:40}}
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={this.state.only_others ? "#f5dd4b" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={()=>{
                      this.state.only_others=!this.state.only_others;
                      this.loadUsers();
                    }}
                    value={this.state.only_others}
                  />
              </View>
              {ListHeaderComponent}
              <View style={this.state.dynamic_style.settings_row_input}>
                <Button
                    title={"Cancel"}
                    color="#f39c12"
                    onPress={()=>this.close()}
                ></Button>
              </View>
          </View>
        </View>
        </View>

          {this.user_log()}
          {this.show_activities()}
      </MModal>
        );
      }
  }

  export default Users_log ;