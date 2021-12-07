import React from 'react';
import {  Text, View, Button,TextInput, Modal, ActivityIndicator,ScrollView ,TouchableHighlight,Keyboard} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconButton from "./IconButton";
import User_log from "./User_log";


class Users_log extends React.Component{
    constructor(props) {
      super(props);
      this.state = {
        user_username : "",
        users : [],
        usersLoading : true,
        actionRunning : false,
        msg_text : "",
        modalVisible_msg : false,
        dynamic_style:this.props.dynamic_style,
        focused_user:"",
        user_log : false,
        show_user_log : false,
        user_activities : false,
      };
      
    } 
    componentDidMount(){
      this.loadUsers();
    }
    setUser_admin_tmp(user_username,action="tmp_admin"){
      this.setState({actionRunning:true});
      backup.partnersManager(action,user_username).then(res=>{
        this.setState({actionRunning:false});
        this.loadUsers();
        if (res[1] && res[1]!=""){
          alert(res[1]); 
        }
      }); 
    }
    sendMsg = async()=>{
      this.setState({actionRunning:true});
      const out = await backup.pushNotification(backup.email,this.state.msg_text,{"action":"msg","msg":this.state.msg_text,"by":backup.email},[this.msg_user,]);
      this.setState({actionRunning:false,modalVisible_msg:false});
    }
    loadUsers = async()=>{
      let users = await backup.load_trace();
      users = users.sort((a,b)=> a>b ? 1 : -1);
      this.setState({users:users,usersLoading:false,actionRunning:false});

    }
    updateUserStatus(user){
      this.setState({actionRunning:true});
      backup.usersManager(user.email,user.disabled).then(res=>{
        if(res && res.length==2){
          if (res[0]==false){
            alert(res[1]);
          }
        }
        this.loadUsers();
      });
    }
    user_log(){
      if(this.state.user_log==false)return null;
      return <User_log 
        user_log={this.state.user_log} 
        modal_visible={this.state.show_user_log && this.state.user_log} 
        closeModal={()=>{this.setState({show_user_log:false,user_log:false})}} /> 
    }
    show_activities(){
      if(this.state.user_activities == false) return null;
      const screens = this.state.user_activities.navigation_history ? this.state.user_activities.navigation_history.map(s=>{
      return <Text key={s.time+""} style={{color:"#fff" ,textAlign: 'left',justifyContent:"center",width:"100%"}}> {s.name} : {s.params?JSON.stringify(s.params):"-"} </Text>
      }) : null;
      const MModal = API_.isWeb ? require("modal-enhanced-react-native-web").default : Modal;
      return (          
        <MModal 
          animationType="slide"
          transparent={true}
          visible={this.state.user_activities != false}
          onRequestClose={() => { this.setState({ user_activities:false,}); }}
        >
        <View style={{flex:.4,backgroundColor:"#2c3e5066"}}></View>
        <View style={{height:350,width:"100%",backgroundColor:"#646c78",alignItems:"center"}}>
          <Text style={{}}> User : {this.state.user_log.email ? this.state.user_log.email : this.state.user_log._id}</Text>

          {screens}

          <Icon.Button 
            name="paper-plane"
            disabled={this.state.actionRunning}
            onPress={()=>{
              this.setState({user_activities:false});
            }}
          >Send</Icon.Button>
        </View>
        <View style={{flex:1,backgroundColor:"#2c3e5066"}}></View>

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
      return this.state.users.map( (_user,i) =>{
        const user = _user.email ;
        const online_at =  _user.datetime ? API_.get_date_time(_user.datetime) : "-";
        return (
          <View style={{flexDirection:"row",width:"95%",height:40,borderStyle:"solid",borderWidth:1,margin:3,alignItems: 'center'}} key={_user._id}>
            <TouchableHighlight style={{flex:1,height:"100%",justifyContent:"center"}} 
              onPress={()=>this.setState({focused_user:_user._id})}
              >
            <View style={{flex:1,justifyContent:"center",width:"100%",height:"100%"}}>
              <Text style={{color: _user.disabled  ? "#95a5a6" : "#fff" ,textAlign: 'left',justifyContent:"center",width:"100%"}}> {user} </Text>
              {this.state.focused_user == _user._id ? 
                <Text style={{color: _user.disabled  ? "#95a5a6" : "#fff" ,textAlign: 'left',flex:50,fontSize:8,marginHorizontal:1,width:"100%"}} >{online_at}</Text>
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
                />
            </View>
                
          </View>
        );
      });

    }

      render(){
        const MModal = API_.isWeb ? require("modal-enhanced-react-native-web").default : Modal;
        return (
          <MModal 
          animationType="slide"
          transparent={true}
          visible={this.props.modal_visible}
          onRequestClose={() => {Keyboard.dismiss();this.props.closeModal();} }
        > 
        <View style={this.state.dynamic_style.modal_view_container}>
        <View style={[this.state.dynamic_style.modal_view,this.state.dynamic_style.modal_view_large]}>
          <View style={this.state.dynamic_style.modal_body}>
              <ScrollView style={{width:"100%",backgroundColor:"#646c78"}}>
                {this.render_users()}
              </ScrollView> 
              
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

          {this.user_log()}
          {this.show_activities()}
      </MModal>
        );
      }
  }

  export default Users_log ;