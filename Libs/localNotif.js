import * as Notifications from 'expo-notifications'; 
import * as Permissions from 'expo-permissions';
import {  Alert } from 'react-native';

async function  ask_permission_web(){
  let is_granted = false;
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
  }else if (Notification.permission === "granted") {
    is_granted = true;
  }else if (Notification.permission !== 'denied' || Notification.permission === "default") {
    let permission = await Notification.requestPermission();
    if (permission === "granted") {
      is_granted = true;
    }
  }

  return is_granted;
}
async function save_notification_web(item, content, trigger){
  const is_granted = await ask_permission_web();
  if(is_granted==false){
    notifyMessage("Permissions not granted","Reminder");
    return false;
  }
  
  content.timestamp = trigger;
  content.image     = "";
  content.icon      = "";
  content.tag       = "";
  let notification = new Notification(content.title, content);
  console.log(notification);
  return notification;
}

//var n = new Notification('Test notification',options);
//console.log(n.timestamp) // should log original timestamp



const AsyncAlert = (message,title,btn_add=true) => {
    return new Promise((resolve, reject) => {
        return Alert.alert(
            title,
            message,
            [ { text: "Cancel", onPress: () =>{resolve(0)}},
              btn_add==true
              ? { text: "Add", onPress: () =>{resolve(1)}  }
              : { text: "Remove", onPress: () =>{resolve(2)}  }
            ],
            { cancelable: true }
        )
    })
}    

const  onMatch_LongPressed=async(item)=>{
  let home_team_name = item["home_team_ar"] ? item["home_team_ar"] : item["home_team"];
  let away_team_name = item["away_team_ar"] ? item["away_team_ar"] : item["away_team"];
  let league = item["league"] ? item["league"] :"";
  let trigger = API_.convert_time_o(item.date+" "+item.time);
  let trigger_s = API_.convert_time_o(item.date+" "+item.time, true);
  let time_now = new Date();
  time_now = time_now.getTime() ;
  if(trigger_s<time_now){
    trigger =time_now +10000 ;
  }
  let content= {
      title: home_team_name+" 𝒱𝒮 "+away_team_name,
      body: league,
      sound: true,
      data:JSON.stringify(item)
    };
  if (API_.isWeb){
    return save_notification_web(item, content, trigger_s);
  }
  let action=2;
  let is_exist = false;
  const saved_notifs = await Notifications.getAllScheduledNotificationsAsync() ;
  for(let i=0;i<saved_notifs.length;i++){
    if(saved_notifs[i].identifier == item.id+""){
      is_exist = saved_notifs[i] ;
    }
  }
  action = await AsyncAlert(content.title+"\nAdd/Remove Notification : "+API_.get_date_time(trigger),"Reminder",is_exist==false)

  if(action==1){
    return save(item, content, trigger);
  }else if(action==2){
    return cancelNotif(item.id+"");
  }
  return new Promise((resolve, reject)=>{return resolve(false)});

}

const save=(item, content, trigger)=>{

  return Permissions.askAsync(Permissions.NOTIFICATIONS).then(o=>{
    if(o.status=="granted"){
      return Notifications.getAllScheduledNotificationsAsync().then(o=>{
        let is_exist = false;
        for(let i=0; i<o.length;i++){
          if(o.identifier==item.id+""){
            is_exist = true;
          }
        }
        if(is_exist==true){return true;}
        return Notifications.scheduleNotificationAsync({
          identifier: item.id+"",
          content:content,
          trigger
          });
      });
      
    }else{
      notifyMessage("Permissions not granted","Reminder");
    }
  });
}
const cancelNotif=(id)=>{
  if(API_.isWeb){
    return new Promise((resolve, reject)=>{return resolve([])});
  }
  return Notifications.getAllScheduledNotificationsAsync().then(o=>{
    let notif_matches={};
    for(let i=0; i<o.length;i++){
      if(o[i].identifier==id){
        return Notifications.cancelScheduledNotificationAsync(id);
      }
    }
    return notif_matches;
  });
}
const get_notifications_matches=()=>{
  if(API_.isWeb){
    return new Promise((resolve, reject)=>{return resolve([])});
  }
  return Notifications.getAllScheduledNotificationsAsync().then(o=>{
    let notif_matches={};
    for(let i=0; i<o.length;i++){
      notif_matches[o[i].identifier] = o[i];
    }
    return notif_matches;
  });
}

export {onMatch_LongPressed,get_notifications_matches};