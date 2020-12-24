import React from 'react';
import {  Text, View, Button,TextInput, Modal, ActivityIndicator,ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconButton from "../components/IconButton";



class Users extends React.Component{
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

      };
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
    loadUsers(){
      backup.partnersManager("getAll").then(res=>{
        if (res[1] && res[1]!=""){
          alert(res[1]);
        }
        this.setState({users:res[0],usersLoading:false,actionRunning:false});
      });
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
    render_users(){
      if (this.state.usersLoading){
        return <ActivityIndicator size="large" color="#00ff00" /> ;
      }
      if(!this.state.users.map){
        return null;
      }
      return this.state.users.map( (value,i) =>{
        const user = value.email ;
        const is_tmp_admin = value.is_tmp_adm ? value.is_tmp_adm : false ;
        //return (<View></View>);
        return (
          <View style={{flexDirection:"row",width:"95%",height:40,borderStyle:"solid",borderWidth:1,margin:3,alignItems: 'center'}} key={user+i}>
            <Text style={{color: value.disabled  ? "#95a5a6" : "#fff" ,textAlign: 'left',flex:1}}> {user} </Text>
        
              <View style={{flexDirection:"row",alignSelf: 'center',}}>
                <IconButton
                    name={ is_tmp_admin ? "minus" : "plus"}
                    disabled={this.state.actionRunning}
                    size ={28}
                    color={ this.state.actionRunning ? "#bdc3c7" : (is_tmp_admin ? "#e74c3c" : "#2ecc71")}
                    onPress={()=>{
                      if(is_tmp_admin){
                          this.setUser_admin_tmp(user,"remove_tmp_admin");
                      }else{
                          this.setUser_admin_tmp(user,"tmp_admin");
                      }
                    }
                    }
                />
                <IconButton
                    name="paper-plane"
                    disabled={this.state.actionRunning}
                    size ={28}
                    color={this.state.actionRunning ? "#bdc3c7" : "#3498db"}
                    onPress={()=>{
                      this.msg_user = user;
                      this.setState({modalVisible_msg:true});
                    }
                    }
                />

                <IconButton 
                  name={ value.disabled  ? "unlock" : "lock"}
                  onPress={()=>this.updateUserStatus(value)}
                  size={28} 
                  color={this.state.actionRunning ? "#bdc3c7" : "#3498db"}
                  disabled={this.state.actionRunning}
                  />
              </View>
                
          </View>
        );
      });

    }
      render_modal_msg(){
        const MModal = API_.isWeb ? require("modal-enhanced-react-native-web").default : Modal;
        return (          
          <MModal 
            animationType="slide"
            transparent={true}
            visible={this.state.modalVisible_msg}
            onRequestClose={() => { 
                this.setState({ modalVisible_msg:false,});
            } }
          >
          <View style={{flex:.4,backgroundColor:"#2c3e5066"}}></View>
          <View style={{height:350,width:"100%",backgroundColor:"#646c78",alignItems:"center"}}>
            <Text style={{}}> Message to : {this.msg_user}</Text>
            <TextInput
              style={{width:"95%",height:200,backgroundColor:"#95a5a6",padding:5,marginBottom:10,fontSize:25,color:"white",textAlignVertical: 'top'}}
              multiline={true}
              editable
              maxLength={40}
              onChangeText={text => this.setState({msg_text : text})}
              value={this.state.msg_text}
            />

            <Icon.Button 
              name="paper-plane"
              disabled={this.state.actionRunning}
              onPress={()=>{
                this.sendMsg();
              }}
            >Send</Icon.Button>
          </View>
          <View style={{flex:1,backgroundColor:"#2c3e5066"}}></View>

          </MModal>
          );
      }

      render(){
        const MModal = API_.isWeb ? require("modal-enhanced-react-native-web").default : Modal;
        return (
          <MModal 
          animationType="slide"
          transparent={true}
          visible={this.props.modal_visible}
          onRequestClose={() => this.props.closeModal() }
          
        > 
        <View style={this.state.dynamic_style.modal_view_container}>
        <View style={[this.state.dynamic_style.modal_view,this.state.dynamic_style.modal_view_large]}>
          <View style={this.state.dynamic_style.modal_body}>
              <ScrollView style={{width:"100%",backgroundColor:"#646c78"}}>
                {this.render_users()}
              </ScrollView> 
              {this.render_modal_msg()}
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

  export default Users ;