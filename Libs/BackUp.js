import API from "./API";
import NetInfo from '@react-native-community/netinfo';
import { Stitch,RemoteMongoClient , AnonymousCredential,UserPasswordCredential,UserPasswordAuthProviderClient } from "mongodb-stitch-react-native-sdk";


class BackUp{
    constructor() {
        this.LS = API_;
        this.lastActivity = "";
        this.email = "";
        this.doClean=false;
        this.admin = false;
        this.isConnected = false;
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
      console.log(".............isConnected", this.isConnected);
      if(check_client && (!this.client || !this.client.callFunction )){
        await this.setClientInfo();
      }
      if(this.isConnected && check_client){
        await this.checkConnectedUserChange();
      }
      if(this.isConnected==false && is_silent==false){
        alert("You need internet connection to sign in");
      }
      return this.isConnected;
    }
    setClientInfo = async()=>{
      try {
        const stitchAppClient = Stitch.defaultAppClient;
        const mongoClient = stitchAppClient.getServiceClient(RemoteMongoClient.factory,"mongodb-atlas");
        this.client = Stitch.defaultAppClient;
        this.lastActivity = this.client.auth.activeUserAuthInfo.lastAuthActivity;
        this.email = this.client.auth.activeUserAuthInfo.userProfile.data.email;
        this.db = mongoClient.db("ba9al");
        this.db_settings = this.db.collection("settings");
        this.is_auth = this.email!="" && this.email !=undefined;
        API_.set_settings({});
        return this.isAdmin();

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
      }).catch(err=>{
        alert(err);
      });
    }

    savePushToken = async()=>{
      if( ! await this.checkCnx()){
        return new Promise(resolve=>{resolve(false);});
      }
      try {

        results = await this.client.callFunction("savePushToken",[this.PushToken,Translation_.language]);
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
      if( ! await this.checkCnx(true, true)){
        return false;
      }
      this.email = "";
      this.lastActivity = "";
      let app = null;
      try {
        app = Stitch.defaultAppClient;
      } catch (error) {
        console.log(error);
        try {
          this._loadClient();
        } catch (error) {
          if(this.isAdmin){
            alert("Error in backup service.");
          }else{
            alert("Error in backup service.");
          }
        }

        
        return false;
      }
      
      const credents = await this.LS.getCredentials();
      this.admin = true ;
      try {
        const credential = new UserPasswordCredential(credents["email"].toLowerCase(),credents["password"].toLowerCase());
        this.client = await app.auth.loginWithCredential(credential);
        //this.registerForPushNotificationsAsync();
        return this.setClientInfo(); 
      } catch (error) {
        alert(error);
        this.LS.setCredentials("","");
        let credential= new  AnonymousCredential();
        this.client = await app.auth.loginWithCredential(credential);
        this.admin = false ;
        return false;
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
          console.log("Successfully sent account confirmation email!", JSON.stringify(output) );
          return output;
        })
        .catch(err => {
          alert(err.message);
          console.log(JSON.stringify(err) );
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
          return true;
        }catch(err){
          notifyMessage(err,"Login in"); 
          console.log(`Failed to log in anonymously: ${err}`);
          this.currentUserId = undefined;

        }
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

      if(this.db_settings==undefined || this.db_settings.findOne==undefined || this.user == undefined || this.user.id == undefined){
        return false;
      }
      let settings_cloud = await this.db_settings.findOne({},{"_id":false});
      console.log("load s",settings_cloud);
      if(settings_cloud==null){
        settings_cloud = await this.save_settings();
      }else{
        await API_.set_settings(settings_cloud);
      }
      this.is_settings_loaded = true; 
      return settings_cloud;
    }
    save_settings = async()=>{
      if(this.db_settings==undefined || this.db_settings.findOne==undefined || this.is_settings_loaded == false || this.user == undefined || this.user.id == undefined){
        return false;
      }
      const settings = await API_.get_settings();
      if(settings.favorite_leagues.length == 0 && settings.favorite_teams_k.length == 0 ){
        alert("saving empty configs");
        return false;
      }
      settings["user_id"] = this.user.id;
      delete settings["_id"]
      if(settings){
        try{
          console.log("inserting in mdb");
          const res = await this.db_settings.updateOne({"user_id":this.user.id},settings,{upsert:true});

          console.log("inserting in mdb DONE", res);
        }catch(err){
          notifyMessage(err.message,"Save settings on cloud!");
          console.log(err)
        }
        return settings ;
      }
      
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
        alert(error.message ? error.message : error);
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
      } catch (error) {
        alert(error.message ? error.message : error);
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
        return pushednotifto;
      } catch (error) {
        console.log("pushNotification",error);
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