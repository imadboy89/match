import API from "./API";
import NetInfo from '@react-native-community/netinfo';
import { Stitch,RemoteMongoClient , AnonymousCredential,UserPasswordCredential,UserPasswordAuthProviderClient } from "mongodb-stitch-react-native-sdk";

NetInfo.configure({
  reachabilityUrl: 'https://imadboy89.github.io/match/',
  reachabilityTest: async (response) => response.status === 204,
  reachabilityLongTimeout: 60 * 1000, // 60s
  reachabilityShortTimeout: 20 * 1000, // 5s
  reachabilityRequestTimeout: 15 * 1000, // 15s
});
class BackUp{
    constructor() {
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
    }
    checkCnx = async(check_client=true,is_silent=false)=>{
      const state = await NetInfo.fetch();
      this.isConnected = state.isConnected;
      //console.log(".............isConnected", this.isConnected);
      if(check_client && (!this.client || !this.client.callFunction )){
        await this.setClientInfo();
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
        this.client = Stitch.defaultAppClient;
        const mongoClient = this.client.getServiceClient(RemoteMongoClient.factory,"mongodb-atlas");
        this.lastActivity = this.client.auth.activeUserAuthInfo.lastAuthActivity;
        this.email = this.client.auth.activeUserAuthInfo.userProfile.data.email;
        this.db = mongoClient.db("ba9al");
        this.db_settings = this.db.collection("settings");
        this.db_teams_info = this.db.collection("teams_info");
        this.is_auth = this.email!="" && this.email !=undefined;
        await this.isAdmin();
        return this.is_auth;

      } catch (error) {
        return new Promise(resolve=>{resolve(false);});
      }
      
    }
    executingQueued = async()=>{
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

    savePushToken = async()=>{
      if( ! await this.checkCnx() || this.PushToken==undefined || this.PushToken ==""){
        return new Promise(resolve=>{resolve(false);});
      }
      let  results ={};
      try {
        results = await this.client.callFunction("savePushToken",[this.PushToken,"ar"]);
      } catch (error) {
        console.log(error);
        return false;
      }
      return results["deleted"];
    }

    checkConnectedUserChange = async()=>{
      const credents = await this.LS.getCredentials();
      if(credents["email"].trim().toLowerCase()!=this.email ){
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
      let app = null;
      await this.login();
       
    }
    login = async ()=>{
      this.is_auth = false;
      const credents = await this.LS.getCredentials();
      this.admin = false ;
      let client=null;
      try{
        client = Stitch.defaultAppClient;
       }catch(err){
        client = await Stitch.initializeDefaultAppClient("ba9al-xpsly");
       }
      try {
        const credential = new UserPasswordCredential(credents["email"],credents["password"]);
        await client.auth.logout();
        this.client = await client.auth.loginWithCredential(credential);
        //this.registerForPushNotificationsAsync();
        this.loadingClient = false;
        API_.set_settings({});
        await this.setClientInfo(); 
        if(this.is_auth) {API_.showMsg(`مرحبا بعودتك ٭${this.email}٭ !`,"success");}
        return this.is_auth;
      } catch (error) {
        API_.showMsg((error.message ? error.message : error)+"","danger");
        this.LS.setCredentials("","");
      }

    }
    newUser = async()=>{
      if( ! await this.checkCnx()){
        return false;
      }
      const credents = await this.LS.getCredentials();
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
        const credents = await this.LS.getCredentials();
        let credential= new  AnonymousCredential();
        let usingAnon = true;
        if(credents && credents.email && credents.password){
          credential = new UserPasswordCredential(credents["email"],credents["password"]);
          usingAnon = false;
        } 
        await this.login();
        /*
        const client = await Stitch.initializeDefaultAppClient("ba9al-xpsly");
        this.client = client ;
        try{
          this.user = await this.client.auth.loginWithCredential(credential);
          if(credents && credents.email && credents.password){
            //this.registerForPushNotificationsAsync();
          }
          this.admin = !usingAnon ;
          this.loadingClient = false;
          await this.setClientInfo();
          console.log(`Successfully logged in as user ${this.email}` , this.lastActivity );
          API_.showMsg(`Welcom back  ${this.email} !`,"success");
          return true;
        }catch(error){
          API_.debugMsg(error.message?error.message:error+"","warning"); 
          console.log(`Failed to log in anonymously: ${error}`);
          this.currentUserId = undefined;

        }
        */
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
      if(settings.favorite_leagues.length == 0 && settings.favorite_teams_k.length == 0 ){
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
          notifyMessage(err.message,"Save settings on cloud!");
        }
        return settings ;
      }
      
    }
    save_teams= async()=>{
      if(!this.is_mdb_ok()){return false;}

      let teams_inf = await API_.getTeam_logo();
      const teams_name = Object.keys(teams_inf);
      let teams2backup = [];
      for(let i=0;i<teams_name.length;i++){
        if(teams_inf[teams_name[i]].is_backedup == undefined){
          teams_inf[teams_name[i]].is_backedup = true;
          teams2backup.push(teams_inf[teams_name[i]]);
        }
      }
      if(teams2backup.length==0){return true;}
      const results = await this.client.callFunction("save_teams",[teams2backup]);
      if (results.inserted>0 || results.updated>0){
        await API_.setTeams(teams_inf);
        API_.debugMsg("["+teams2backup.length+"] Teams saved successfully!","info");
      }
    }
    load_teams= async()=>{
      if(!this.is_mdb_ok() || undefined == this.db_teams_info){return false;}
      const teams = await this.db_teams_info.find({},{"projection": { "_id": 0 },}).asArray();
      let teams_inf = {};
      for(let i=0;i<teams.length;i++){
        teams_inf[teams[i].team_name] = teams[i];
      }
      await API_.setTeams(teams_inf);
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

    pushNotification = async(title="", body="",data={},partner=false,chanelId=false)=>{
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
      let args = [partner,title,body , data,datetime] ;
      if(chanelId){
        args.push(chanelId);
      }
      try {
        results = await this.client.callFunction("pushNotification",args);
        this.last_notification_time = new Date() .getTime();
        let pushednotifto=0;
        if(results && results["data"] && results["data"].length>0){
          for (let i = 0; i < results["data"].length; i++) {
            pushednotifto += results["data"][i]["status"] && results["data"][i]["status"]=="ok" ? 1 : 0 ;
          }
        }
        if(pushednotifto>0){
          API_.showMsg("تم إرسال الإخطار بنجاح إلى "+pushednotifto+" مستخدمين.","success");
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


}

export default BackUp ;