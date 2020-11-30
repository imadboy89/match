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
  Permissions.askAsync(Permissions.NOTIFICATIONS).then(o=>{
    if(o.status=="granted"){
      notifyMessage("Will remind you of this matche :\n"+content.title,"Reminder");
      Notifications.scheduleNotificationAsync({
        identifier: 'night-notification',
        content:content,
        trigger
        });
    }else{
      notifyMessage("Permissions not granted","Reminder");
    }
  });
}

export default onMatch_LongPressed;