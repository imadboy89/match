import API from "./API";
import NetInfo from '@react-native-community/netinfo';
import { Stitch,RemoteMongoClient , AnonymousCredential,UserPasswordCredential,UserPasswordAuthProviderClient } from "mongodb-stitch-react-native-sdk";

NetInfo.configure({
  reachabilityUrl: '/',
  reachabilityTest: async (response) => response.status === 204,
  reachabilityLongTimeout: 60 * 1000, // 60s
  reachabilityShortTimeout: 20 * 1000, // 5s
  reachabilityRequestTimeout: 15 * 1000, // 15s
});
class BackUp{
    constructor() {
        this.appName = "almatch";
        this.LS = API_;
        this.lastActivity = "";
        this.email = "";
        this.doClean=false;
        this.admin = false;
        this.isConected = false;
        this.PushToken = "";
        this.executingQueued_running = false;
        this.queue = [];
        this.last_notification_time = false;
        this.is_auth = false;
        this.is_settings_loaded = false;
        this.teams_ready = false;
    }
    checkCnx = async(check_client=true,is_silent=false)=>{
      const state = await NetInfo.fetch();
      this.isConnected = state.isConnected;
      if(check_client && (!this.client || !this.client.callFunction )){
        const res = await this.setClientInfo();
        
      }
      if(this.isConnected && check_client){
        await this.checkConnectedUserChange();
      }
      if(this.isConnected==false && is_silent==false){
        API_.showMsg("تحتاج إلى اتصال بالإنترنت!","warning");
      }
      return this.isConnected;
    }
    setClientInfo = async()=>{
      try {
        this.client = await this.get_default_appClient();
        const mongoClient = this.client.getServiceClient(RemoteMongoClient.factory,"mongodb-atlas");
        try {
          this.lastActivity = this.client.auth.activeUserAuthInfo.lastAuthActivity;
        } catch (error) {this.lastActivity=""}
        try {
          this.email = this.client.auth.activeUserAuthInfo.userProfile.data.email;
        } catch (error) {this.email="";}
        this.email = this.email ? this.email.toLocaleLowerCase().trim() : "";
        this.db = mongoClient.db("ba9al");
        this.db_settings     = this.db.collection("settings");
        this.db_teams_info   = this.db.collection("teams_info");
        this.db_teams   = this.db.collection("teams");
        this.db_IPTV         = this.db.collection("IPTV");
        this.db_live_matches = this.db.collection("live_matches");
        this.db_leagues = this.db.collection("leagues");
        this.is_auth         = this.email!="" && this.email !=undefined;
        if(this.is_auth) {
          setTimeout(()=>API_.showMsg(`مرحبا بعودتك ٭${this.email}٭ !`,"success"),1000);
          await this.isAdmin();
        }else{
          await this.client.auth.loginWithCredential(new  AnonymousCredential());
          this.client = this.client = await this.get_default_appClient();
        }
        
        return this.is_auth;

      } catch (error) {
        console.log(error);
        return new Promise(resolve=>{resolve(false);});
      }
      
    }
    executingQueued = async()=>{
      return true;
      if(this.executingQueued_running){
        return ;
      }
      if( ! await this.checkCnx(true, true)){
        return false;
      }
      this.executingQueued_running = true ;
      if(this.timer == undefined){
        this.timer = setInterval(()=> this.executingQueued(), 10*1000);
      }
      const queue = this.queue.slice();
      for (let i = 0; i < this.queue.length; i++) {
        const task = queue[i];
        console.log("executingQueued "+i,task[0]);
        try {
          task[0].apply(this,task[1]) ;
        } catch (error) {
          console.log(error);
        }
      }
      this.queue=[];
      this.executingQueued_running = false ;
    }
    isAdmin(){
      return this.client.callFunction("isAdmin").then(result => {
        this.admin = result;
      }).catch(error=>{
        API_.debugMsg((error.message?error.message:error)+"","warning");
        
      });
    }

    subscribeUser = async() =>{
      const server_key = "BPRLuFzkQnqlKVNs-ksQ34d24FtZFa_Fenl6ds6QbrlbadXlpmlTsJ_EGfIEW5STO_AaCuNPj6RhryOdXwIi6xM";
      const applicationServerKey = server_key;
      let subscription = await serviceWorker.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });
      return subscription
    }
    savePushToken = async()=>{
      if(API_.isWeb){
        try {
          console.log("savePushToken start2");
          this.PushToken = await this.subscribeUser();
          this.PushToken = JSON.stringify(this.PushToken);
          console.log("savePushToken END");
        } catch (error) {
          API_.showMsg(error,"danger");
          return false;
        }
      }
      if( ! await this.checkCnx() || this.PushToken==undefined || this.PushToken ==""){
        return new Promise(resolve=>{resolve(false);});
      }
      let  results ={};
      try {
        results = await this.client.callFunction("savePushToken",[this.PushToken,"ar",API_.isWeb?1:0,this.appName]);
      } catch (error) {
        console.log(error);
        return false;
      }
      return results;
    }

    checkConnectedUserChange = async()=>{
      return true;
      const credents = this.LS.getCredentials();
      if(credents["email"].trim().toLowerCase()!=this.email && credents["email"].trim()!="" ){
        console.log("checkConnectedUserChange",credents["email"].trim().toLowerCase()!=this.email,credents["email"].trim().toLowerCase(),this.email);
        return this.setClientInfo();
      }
      return credents;
    }
    changeClient = async ()=>{
      if( ! await this.checkCnx(true)){
        return false;
      }
      this.email = "";
      this.lastActivity = "";
      await this.login();
      //if(this.is_auth==false) {API_.showMsg(`مرحبا بعودتك ٭${this.email}٭ !`,"success");}
       
    }
    get_default_appClient = async()=>{
      let client = false;
      try{
        client = Stitch.defaultAppClient;
       }catch(err){
         //console.log(err);
          client = await Stitch.initializeDefaultAppClient("ba9al-xpsly");
       }
       return client;
    }
    login = async (logout=false)=>{
      const credents = this.LS.getCredentials();
      this.admin = false ;
      let client= await this.get_default_appClient();
      try {
        if(credents && credents.email && credents.password && credents.email!="" && credents.password!="" && logout==false){
          this.email="";
          this.is_auth = false;
          const credential = new UserPasswordCredential(credents["email"],credents["password"]);
          await client.auth.logout();
          this.client = await client.auth.loginWithCredential(credential);
          //this.registerForPushNotificationsAsync();
          API_.set_settings({});
          await this.setClientInfo(); 
          //if(this.is_auth) {API_.showMsg(`مرحبا بعودتك ٭${this.email}٭ !`,"success");}
          return this.is_auth;
        }else if(logout){
          this.email="";
          this.is_auth = false;
          await client.auth.logout();
        }else{
          await this.setClientInfo(); 
          //this.client = await client.auth.loginWithCredential(new  AnonymousCredential());
        }
        this.loadingClient = false;
        return false;
      } catch (error) {
        API_.showMsg((error.message ? error.message : error)+"","danger");
        this.LS.setCredentials("","");
      }

    }
    user_log = async()=>{
      if(_ClientInfo == undefined || !this.client || !this.client.callFunction){
        return false;
      }
      let clientInfos = await _ClientInfo.getInfo();
      clientInfos.email = this.email;
      try{
        const results = await this.client.callFunction("users_log",[clientInfos]);
      }catch(error){
        API_.debugMsg(error,"danger");
      }
    }
    newUser = async()=>{
      if( ! await this.checkCnx()){
        return false;
      }
      const credents = this.LS.getCredentials();
      const emailPasswordClient = Stitch.defaultAppClient.auth
        .getProviderClient(UserPasswordAuthProviderClient.factory);

      return emailPasswordClient.registerWithEmail(credents["email"],credents["password"])
        .then((output) => {
          //this.registerForPushNotificationsAsync();
          //console.log("Successfully sent account confirmation email!", JSON.stringify(output) );
          API_.showMsg(`تم التسجيل بنجاح ٭${credents.email}٭ !`,"success");
          return true;
        })
        .catch(error => {
          API_.showMsg((error.message ? error.message : error)+"","warning");
        });
    }
    _loadClient = async () => {
        if(this.loadingClient){
          return false;
        }
        this.loadingClient = true;
        if( ! await this.checkCnx(false)){
          this.loadingClient = false;
          return false;
        }
        /*
        const credents = this.LS.getCredentials();
        let credential= new  AnonymousCredential();
        let usingAnon = true;
        if(credents && credents.email && credents.password){
          credential = new UserPasswordCredential(credents["email"],credents["password"]);
          usingAnon = false;
        }*/
        await this.login();
      }

    clean = async(db)=>{
      if(this.email ){
        try {
          return await db.deleteMany({});
        } catch (error) {
          console.log(error);
        }
      }
      return false;
    }
    load_settings = async()=>{
      this.is_settings_loaded = false;
      if(!this.is_mdb_ok()){
        return false;
      }
      let settings_cloud = await this.db_settings.findOne({},{"_id":false});
      if(settings_cloud==null){
        settings_cloud = await this.save_settings();
      }else{
        await API_.set_settings(settings_cloud);
      }
      this.is_settings_loaded = true; 
      let settings = await API_.get_settings();
      //API_.debugMsg("Settings loaded ["+Object.keys(settings).length+"]!","info");
      return JSON.stringify(settings_cloud) != JSON.stringify(settings);
    }
    is_mdb_ok(){
      if(this.db_settings==undefined || this.db_settings.findOne==undefined || this.client == undefined || this.is_auth==false){
        //console.log(this.db_settings.findOne,this.client.id, this.is_auth);
        return false;
      }
      return true;
    }
    save_settings = async()=>{
      if(!this.is_mdb_ok() || this.is_settings_loaded == false){
        return false;
      }
      let settings = await API_.get_settings();
      if(settings.favorite_leagues.length == 0 && settings.favorite_teams_k.length == 0 && settings.favorite_channels.length == 0  ){
        API_.debugMsg("saving empty configs","info");
        return false;
      }
      //settings["user_id"] = this.client.id;
      settings["email"] = this.email;
      settings["updated_at"] = new Date();
      delete settings["_id"]
      if(settings){
        try{
          const res = await this.db_settings.updateOne({"email":this.email},settings,{upsert:true});
        }catch(err){
          API_.showMsg(message,"danger");
        }
        return settings ;
      }
      
    }
    save_teams_o= async()=>{
      if(!this.is_mdb_ok()){return false;}

      let teams_inf = await API_.getTeam_logo();
      let teams_inf_k = await API_.getTeam_logo_k();
      const teams_name = Object.keys(teams_inf);
      const teams_id = Object.keys(teams_inf_k);
      let teams2backup = [];
      for(let i=0;i<teams_name.length;i++){
        if(teams_inf[teams_name[i]].is_backedup == undefined){
          teams_inf[teams_name[i]].is_backedup = true;
          teams2backup.push(teams_inf[teams_name[i]]);
        }
      }
      for(const team_id of teams_id){
        if(teams_inf_k[team_id].is_backedup == undefined){
          teams_inf_k[team_id].is_backedup = true;
          teams2backup.push(teams_inf_k[team_id]);
        }
      }
      if(teams2backup.length==0){return true;}
      const results = await this.client.callFunction("save_teams",[teams2backup]);
      if (results.inserted>0 || results.updated>0){
        await API_.setTeams(teams_inf);
        console.log("["+teams2backup.length+"] Teams saved successfully!!");
        API_.debugMsg("["+teams2backup.length+"] Teams saved successfully!!","success");
      }
    }
    save_teams= async()=>{
      if(!this.is_mdb_ok() || ! API_.mdb_save_teams){return false;}
      let teams_inf_k = await API_.getTeam_logo_k();
      const teams_id = Object.keys(teams_inf_k);
      let teams2backup = [];

      for(const team_id of teams_id){
        if(teams_inf_k[team_id].is_backedup != true){
          teams_inf_k[team_id].is_backedup = true;
          teams2backup.push(teams_inf_k[team_id]);
        }
      }
      if(teams2backup.length==0){return true;}
      console.log("saving remotly [count="+teams2backup.length+"] bck");
      const results = await this.client.callFunction("save_teams",[teams2backup]);
      if (results.inserted>0 || results.updated>0){
        API_.setTeams_k(teams_inf_k);
        console.log("["+teams2backup.length+"] Teams saved successfully!");
        API_.debugMsg("["+teams2backup.length+"] Teams saved successfully!","success");
      }
      return results;
    }
    load_teams= async()=>{
      if(!this.is_mdb_ok() || undefined == this.db_settings ){
        return false;}
      let teams_inf_k_local = await API_.getTeam_logo_k();
      teams_inf_k_local = teams_inf_k_local ? teams_inf_k_local : {} ;
      const is_expired = await API_.is_expired("teams");
      if(is_expired==false && Object.keys(teams_inf_k_local).length>0){
        return false;
      }
      const teams_k = await this.client.callFunction("load_teams",[{l:{$exists:true}}]);
      let teams_inf_k = {}; 
      for(let i=0;i<teams_k.length;i++){
        teams_inf_k[teams_k[i].team_id] = teams_k[i];
      }
      this.teams_ready = true;
      await API_.setTeams_k(teams_inf_k);
      API_.debugMsg("Loaded ["+teams_k.length+"] Teams.","success");
      return true;
    }
    load_leagues= async()=>{
      if(!this.is_mdb_ok() || undefined == this.db_settings ){
        return false;}
      let leagues_local = await API_.getLeagues();
      leagues_local = leagues_local ? leagues_local : {} ;
      const is_expired = await API_.is_expired("leagues");
      if(is_expired==false && Object.keys(leagues_local).length>0){
        API_.leagues = leagues_local;
        return false;
      }
      const leagues = await this.db_leagues.find({}).asArray();
      this.leagues_ready = true;
      await API_.setLeagues(leagues);
      API_.leagues = leagues;
      API_.debugMsg("Loaded ["+leagues.length+"] Leagues..","success");
      return true;
    }
    partnersManager = async(action,partner_username)=>{
      if( ! await this.checkCnx()){
        return false;
      }
      const datetime = API_.get_date_time();
      let results = {};
      try {
        results = await this.client.callFunction("partnersManager",[action,datetime,partner_username]);
      } catch (error) {
        API_.debugMsg((error.message ? error.message : error)+"","danger");
        return false;
      }
      return results;
    }
    usersManager = async(user_email,new_status) => {
      if( ! await this.checkCnx()){
        return false;
      }
      let results = {};
      try {
        results = await this.client.callFunction("Users_managements",[user_email,new_status]);
        API_.showMsg("تم تحديث المستخدم بنجاح!","success");
      } catch (error) {
        API_.debugMsg((error.message ? error.message : error)+"","danger");
        return false;
      }
      return results;
    }

    pushNotification = async(title="", body="",data={},partner=false,chanelId=undefined)=>{
      if( ! await this.checkCnx()){
        return new Promise(resolve=>{resolve(false);});
      }
      if(title=="" || body==""){
        return false;
      }
      const time = new Date() .getTime();
      if(this.last_notification_time && time -this.last_notification_time  < 5*1000){
        return "Can't send 2 Notif in 5s";
      }
      const datetime = API_.get_date_time();
      let results = {};
      let args = [partner,title,body , data,datetime,chanelId,this.appName] ;
      try {
        results = await this.client.callFunction("pushNotification",args);
        this.last_notification_time = new Date() .getTime();
        let pushednotifto=0;
        let error = "";
        if(results && results["data"] && results["data"].length>0){
          for (let i = 0; i < results["data"].length; i++) {
            pushednotifto += results["data"][i]["status"] && results["data"][i]["status"]=="ok" ? 1 : 0 ;
            error = results["data"][i]["status"] && results["data"][i]["status"]=="error" ? results["data"][i]["message"] : "" ;
          }
        }
        if(pushednotifto>0){
          API_.showMsg("تم إرسال الإخطار بنجاح إلى "+pushednotifto+" مستخدمين.","success");
        }else if (error!=""){
          API_.showMsg(error,"danger");
        }
        return pushednotifto;
      } catch (error) {
        API_.debugMsg((error.message ? error.message : error)+"","danger");
        this.queue.push([this.pushNotification,[title, body,data,partner,chanelId]]);
        return false;
      }
      return results;
    }

    insertMany= async (db, data) => {
      //await db.deleteMany({});
      return db.insertMany(data).catch(err=>{
        let names = [];
        if(data && data[0].name){          
          for (let p = 0; p < data.length; p++) {
              names.push(data[p].name );
          }
        }
        const prods_names = names.length>0 && names.length<=3 ? "("+names.join(",")+")" : "("+names.length+")";
        this.appendLog ("    XXX Insert : "+err.message + " : "+prods_names);
        return err;
      });
    }
    updateOne= async (db, query, data) => {
      //await db.deleteMany({});
      return db.updateOne(query,data).catch(err=>{
        const name = data && data["name"] ? "("+data["name"]+")" : "";
        this.appendLog ("    XXX rUpdate : "+err.message + name);
        return err;
      });
    }
    getMDB(db,query={},options = {"projection": { "_id": 0 },}){
      return db.find(query, options).asArray().then(docs => {
              return docs;
          }).catch(err => {
              this.appendLog ("    XXX Found : "+err.message);
          });
    }
    load_iptv = async()=>{
      try {
        
        const channels = await this.db_IPTV.find({}, { sort: { datetime: -1 } }).asArray();
        return channels; 
      } catch (error) {
        console.log(error.message);
        API_.showMsg(error,"danger");
        return [];
      }
    }
    save_iptv = async(ch)=>{
      try {
        ch.user_id = this.client.auth.activeUserAuthInfo.userId;
        const o = await this.db_IPTV.insertOne(ch);
        if(o && o.insertedId){
          API_.showMsg("تمت إضافة القناة  *"+ch.name+"*","success");
        }else{
          API_.showMsg("Something wrong : "+JSON.stringify(o) ,"danger");
        }
      } catch (error) {API_.showMsg(error,"danger");}
    }
    save_live_match = async(match_details,match_title)=>{
      try {
        match_details = JSON.parse(JSON.stringify(match_details));
        const live_match       = {match_id:match_details.id,};
        live_match.user_id     = this.client.auth.activeUserAuthInfo.userId;
        live_match.user_email  = this.email;
        live_match.active      = true;
        live_match.match_title = match_title;
        live_match.createdAt = new Date();
        live_match.startAt = new Date(match_details.datetime.replace(" ", "T")+":00.000+01:00");

        delete match_details.matches_list;
        delete match_details.details;
        delete match_details.channels;
        delete match_details.matches_list

        live_match.match_details = match_details;

        live_match.isWeb        = API_.isWeb;
        const o_ = await this.db_live_matches.deleteMany({match_id:match_details.id});
        const o = await this.db_live_matches.insertOne(live_match);
        const is_ok = o && o.insertedId ;
        if(is_ok){
          API_.notifications_matches[live_match.match_id] = match_details;
          API_.showMsg("تمت إضافة مباراة  *"+match_title+"*","success");
        }else{
          API_.showMsg("Something wrong : "+JSON.stringify(o) ,"danger");
        }
        return is_ok ;
      } catch (error) {API_.showMsg(error,"danger");}
      return false;
    }
    remove_live_match = async(match_id,match_title)=>{
      try {
        const live_match       = {match_id:match_id,};
        live_match.user_id     = this.client.auth.activeUserAuthInfo.userId;
        live_match.user_email  = this.email;
        live_match.isWeb       = API_.isWeb;
        const o = await this.db_live_matches.deleteMany(live_match);
        const is_ok = o && o.deletedCount ;
        if(is_ok){
          delete API_.notifications_matches[match_id];
          API_.showMsg("تمت إزالة مباراة  *"+match_title+"*","success");
        }
        return  is_ok ;
      } catch (error) {API_.showMsg(error,"danger");}
      return true;
    }
    check_live_match = async(match_id)=>{
      try {
        const live_match       = {match_id:match_id,};
        live_match.user_id     = this.client.auth.activeUserAuthInfo.userId;
        live_match.isWeb        = API_.isWeb;
        const o = await this.db_live_matches.find(live_match).asArray();
        const is_ok = o && o.length ;
        return  is_ok ;
      } catch (error) {API_.showMsg(error,"danger");}
      return false;
    }
    get_match_live = async(date_obj)=>{
      if(!this.is_mdb_ok()){
        return false;
      }
      const query = {active:true, isWeb:API_.isWeb} ;
      if(date_obj){
        let dateTime_s =new Date(date_obj);
        let dateTime_e =new Date(date_obj);
        
        dateTime_e.setHours(23);
        dateTime_e.setMinutes(59);
        dateTime_e.setSeconds(59);

        query.startAt = {$gte:dateTime_s,$lte:dateTime_e}
      }


      const o = await this.db_live_matches.find(query).asArray();
      return o;
    }
}

export default BackUp ;