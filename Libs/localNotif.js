import * as Notifications from 'expo-notifications'; 
import * as Permissions from 'expo-permissions';

const onMatch_LongPressed=(item)=>{
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
      notifyMessage("Will remind you of this matche :\n"+content.title,"Reminder");
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

const get_notifications_matches=()=>{
  return Notifications.getAllScheduledNotificationsAsync().then(o=>{
    let notif_matches={};
    for(let i=0; i<o.length;i++){
      notif_matches[o[i].identifier] = o[i];
    }
    return notif_matches;
  });
}

export {onMatch_LongPressed,get_notifications_matches};