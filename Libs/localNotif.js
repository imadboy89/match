import * as Notifications from 'expo-notifications'; 
import * as Permissions from 'expo-permissions';
import {  Alert } from 'react-native';

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

  let content= {
      title: home_team_name+" 𝒱𝒮 "+away_team_name,
      body: league,
      sound: true,
    };

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
    return save(item);
  }else if(action==2){
    return cancelNotif(item.id+"");
  }
  return new Promise((resolve, reject)=>{return resolve(false)});

}

const save=(item)=>{
  let home_team_name = item["home_team_ar"] ? item["home_team_ar"] : item["home_team"];
  let away_team_name = item["away_team_ar"] ? item["away_team_ar"] : item["away_team"];
  let league = item["league"] ? item["league"] :"";
  let trigger = API_.convert_time_o(item.date+" "+item.time);

  let content= {
      title: home_team_name+" 𝒱𝒮 "+away_team_name,
      body: league,
      sound: true,
    };
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