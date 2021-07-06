import * as Notifications from 'expo-notifications'; 
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
  if(API_.isWeb){
    return new Promise((resolve, reject) => { return resolve(btn_add?1:2);});
  }
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

const  onMatch_LongPressed=async(item,notifications_matches)=>{
  let home_team_name = item["home_team_ar"] ? item["home_team_ar"] : item["home_team"];
  let away_team_name = item["away_team_ar"] ? item["away_team_ar"] : item["away_team"];
  let league = item["league"] ? item["league"] :"";
  let trigger = API_.convert_time_o(item.date+" "+item.time);
  const trigger_2 = new Date((new Date).getTime()+5000);
  let content= {
      title: home_team_name+" 𝒱𝒮 "+away_team_name,
      body: league,
      sound: true,
      data:{data : JSON.stringify(item)}
    };
  let action=2;
  let is_exist = API_.notifications_matches && API_.notifications_matches[item.id] ? true : false;
  console.log(is_exist);
  action = await AsyncAlert(content.title+"\nAdd/Remove Notification : "+API_.get_date_time(trigger),"Reminder",is_exist==false)

  if(action==1){
    //save(item, content, trigger2);
    return  backup.save_live_match(item, content.title);
    return save(item, content, trigger);
  }else if(action==2){
    return  backup.remove_live_match(item.id, content.title);
    return cancelNotif(item.id+"",content);
  }
  return new Promise((resolve, reject)=>{return resolve(false)});

}

const save=(item, content, trigger)=>{
  if(API_.notifcation_type=="push"){
    return backup.save_live_match(item,content.title).then(o=>{
      if (o){
        if(API_.notifications_matches == undefined){
          API_.notifications_matches = {};
        }
        API_.notifications_matches[item.id] = item;
      }
      return o;
    });
    
  }
  return Notifications.getPermissionsAsync().then(o=>{
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
const cancelNotif=(id,content)=>{
  if(API_.notifcation_type=="push"){
    return backup.remove_live_match(parseInt(id),content.title).then(o=>{
      if (o){
        delete API_.notifications_matches[parseInt(id)];
      }
      return o
    });
  }
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
const get_notifications_matches=(date_obj)=>{
  if(API_.notifcation_type=="push"){
    return backup.get_match_live(date_obj).then(l=>{
      if(l && l.length>0){
        let ll = {};
        for(let i =0;i<l.length;i++){
          ll[l[i].match_id] = l[i].match_details ;
        }
        return ll ;
      }
    });
  }
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