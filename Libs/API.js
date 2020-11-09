import { Platform, AsyncStorage } from 'react-native';
import Base64 from "./Base64";
class API {
  constructor() {
    //alert(Base64.btoa("aW1hZA=="));
    this.error = null;
    this.data = null;
    this.domain_o = 'https://al-match.com/';
    this.domain = 'https://al-match.com/api/';
    this.configs = {};
    this.proxy = 'https://www.oxus.tj/sites/default/private/files/.proxy2.php?url=';
    this.method = "POST";
    this.usingproxy = Platform.OS == 'web';
    this.isWeb = Platform.OS == 'web';
    if (this.isWeb){
      this.domain = this.proxy+this.domain;
      this.method = "GET";
    }
    this.headers = {"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8","device-token":""};
    this.token_post = {"token":"","app_id":2} ;
    this.token = "";
    this.is_auth = false;
    //this.set_token();

  }
  async set_token(){
    if(this.headers["device-token"]==""){
      let out = await this.getConfig("token");
      if(out!=false){
        this.token=out;
        this.headers["device-token"]=this.token;
        return true;
      }
    }
    this.token = (Math.random().toString(36).substring(2)+Math.random().toString(36).substring(2) ).slice(0,20) ;
    alert("new");
    const url = this.domain+"device_app";
    this.token_post["token"] = this.token;
    //alert(JSON.stringify(url,this.token_post) + JSON.stringify(this.headers)); 
    return fetch(url, {
      method: "POST",
      headers: this.headers,
      body:"token="+this.token+"&app_id=2"
      })
      .then(response => response.json()) 
      .then(resJson => {
        if(resJson["status"]== "true" && resJson["message"]){
          this.is_auth = true;
          this.headers["device-token"]=this.token;
          this.setConfig("token",this.token);
          //alert(resJson["message"]);
        }
      })
      .catch(error => {
        console.log('ERROR', error);
        this.error = error;
        alert(error);
      });
  }
  get_date(date__=null){
    const d = date__==null ? new Date() : date__;
    const ye = d.getFullYear();
    const mo = d.getMonth()+1;
    const da = d.getDate();
    return `${da}-${mo}-${ye}` ;
  }
  get_matches(date_obj=null, page=1){
    if(this.headers["device-token"]==""){
      return this.set_token().then(()=> { return this.get_matches(date_obj,page)});
    }
    const url = this.domain+"get_matches";

    date_obj = date_obj ? date_obj : new Date();
    let data = "match_date="+this.get_date(date_obj);
    return fetch(url, {
      method: 'POST',
      headers: this.headers,
      body:data
    })
      .then(response => response.json())
      .then(resJson => {
        if(resJson["status"]== "true" ){
          this.is_auth = true;
        }
        return resJson;
      })
      .catch(error => {
        console.log('ERROR', error);
        this.error = error;
      });
  }

  get_channel(id){
    if(this.headers["device-token"]==""){
      return this.set_token().then(()=> { return this.get_channel(id)});
    }
    const url = this.domain+"get_channel";
    return fetch(url, {
      method: 'POST',
      headers: this.headers,
      body:"channel_id="+id
    })
      .then(response => response.json())
      .then(resJson => {
        if(resJson["status"]== "true" ){
          this.is_auth = true;
        }
        return resJson;
      })
      .catch(error => {
        console.log('ERROR', error);
        this.error = error;
      });
  }
  get_channels(cat,page=1){
    if(this.headers["device-token"]==""){
      return this.set_token().then(()=> { return this.get_channels(cat,page)});
    }
    const url = this.domain+"get_channels";
    let data = "match_date=05-11-2020";//{"match_date":"05-11-2020"};
    return fetch(url, {
      method: 'POST',
      headers: this.headers,
      body:"category_id="+cat+"&page="+page
    })
      .then(response => response.json())
      .then(resJson => {
        if(resJson["status"]== "true" ){
          this.is_auth = true;
        }
        return resJson;
      })
      .catch(error => {
        console.log('ERROR', error);
        this.error = error;
      });
  }
  get_categories(page=1){
    if(this.headers["device-token"]==""){
      return this.set_token().then(()=> { return this.get_categories(page)});
    }
    const url = this.domain+"get_categories?page="+page;
    let data = "match_date=05-11-2020";//{"match_date":"05-11-2020"};
    return fetch(url, {
      method: 'GET',
      headers: this.headers,
    })
      .then(response => response.json())
      .then(resJson => {
        if(resJson["data"].length>0 ){
        }
        return resJson;
      })
      .catch(error => {
        console.log('ERROR', error);
        this.error = error;
      });
  }

  setConfig = async (key, value) => {
    let configs = await AsyncStorage.getItem('configs');
    if (configs) {
      configs = JSON.parse(this.configs);
      configs[key] = value;
    }else{
      configs = {};
      configs[key] = value;
    }
    await AsyncStorage.setItem('configs', JSON.stringify(configs));
  };

  getConfig = async (key) => {
    let configs = await AsyncStorage.getItem('configs');
    if (configs) {
      configs = JSON.parse(configs);
      if ( configs[key] ){
        return configs[key];
      }
    }else {
      return false;
    }
  };


  saveLink = async (link,name,img) => {
    link = Base64.btoa(link);
    img  = Base64.btoa(img);
    //name = Base64.btoa(name);
    const links_manager = 'https://www.oxus.tj/sites/default/private/files/.index.php';
    link = links_manager + '?action=save&is_b64=1&link=' + link + '&name=' + name + "&img="+img;
    return fetch(link, {
      method: 'GET',
    })
      .then(res => {
        return res.text();
      })
      .catch(error => {
        console.log(error);
        this.error = error;
      });
  };
}

export default API;