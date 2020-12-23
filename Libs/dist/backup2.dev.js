/*
import Realm from "realm";
import API from "./API";
import NetInfo from '@react-native-community/netinfo';

class BackUp{
    constructor() {
        this.email = "";
        this.doClean=false;
        this.admin = false;
        this.isConnected = false;
        this.PushToken = "";
        this.executingQueued_running = false;
        this.queue = [];
        this.last_notification_time = false;
        this.appConfig = {id: "ba9al-xpsly",timeout: 10000};
    }
    async init(){
        const app = new Realm.App(appConfig);
        user = await app.logIn(Realm.Credentials.anonymous());
        const mongoClient = user.mongoClient("mongodb-atlas");
        this.db_settings = mongoClient.db("ba9al").collection("settings");
    }

    async loginEmailPassword() {
        // Create an anonymous credential
        const credents = await API_.getCredentials();
        const credentials = Realm.Credentials.emailPassword(credents["email"].toLowerCase(),credents["password"].toLowerCase());
        try {
          // Authenticate the user
          this.user = await app.logIn(credentials);
          // `App.currentUser` updates to match the logged in user
          assert(user.id === app.currentUser.id);
          return this.init();
        } catch(err) {
          console.error("Failed to log in", err);
        }
      }
}

export default BackUp ;
*/
"use strict";