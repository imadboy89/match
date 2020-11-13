import { Platform, DeviceInfo } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Scrap from "./scrap";
import Base64 from "./Base64";


//https://al-match.com/api/get_server_generator  POST channel_id=17
class API {
  constructor() {
    //alert(Base64.btoa("aW1hZA=="));
    this.error = null;
    this.data = null;
    this.domain_o = 'https://al-match.com/';
    this.domain = 'https://al-match.com/api/';
    this.configs = {};
    this.proxy = 'https://www.oxus.tj/sites/default/private/files/.proxy2.php?url=';
    this.proxy1 = 'https://www.oxus.tj/sites/default/private/files/.proxy.php?url=';
    this.method = "POST";
    this.usingproxy = Platform.OS == 'web';
    this.isWeb = Platform.OS == 'web';
    if (this.isWeb){
      this.domain = this.proxy+this.domain;
      this.method = "GET";
    }
    this.headers = {"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8","device-token":""};
    this.headers2 = {
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      'User-Agent': "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36"
    }
    this.token_post = {"token":"","app_id":2} ;
    this.token = "";
    this.is_auth = false;
    //this.set_token();

  }
  get_news(page){
    console.log("https://m.kooora.com/?n=0&o=ncma&arabic&pg="+page); 
    return this.http("https://m.kooora.com/?n=0&o=ncma&arabic&pg="+page,"GET",null,{})
    .then(resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      return scrap.get_news(resp);
    });
  }
  get_article(link){
    return this.http("https://m.kooora.com/?"+link+"&arabic","GET",null,{})
    .then(html=>{
      try{
        let scrap = new Scrap();
        scrap.isWeb = this.isWeb;
        return scrap.get_article(html);
      }catch(err){console.log(err);}

    });

  }
  http(url,method="GET",data=null,headers=null,is_json=false){
    let configs = {method: method,headers: headers ? headers : this.headers,}
    if (data!=null){
      configs["body"] = data;
    }
    if(this.isWeb || 1==1){
      url = method=="GET" ? this.proxy1+url : this.proxy+url; 
    }
    //url = "https://developers.facebook.com/tools/debug/echo/?q="+url;
    return fetch(url, configs)
      .then(response => {return is_json ? response.json() : response.text() }) 
      .catch(error => {
        alert(error);
        console.log('ERROR', error);
        this.error = error;
      });
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
    notifyMessage("new");
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
  get_date2(date__=null){
    const d = date__==null ? new Date() : date__;
    const ye = d.getFullYear();
    const mo = d.getMonth()+1;
    const da = d.getDate();
    return `${ye}-${mo}-${da}` ;
  }
  get_date_time(date__=null){
    const d = date__==null ? new Date() : date__;
    const ye = d.getFullYear();
    const mo = "0"+(d.getMonth()+1);
    const da = "0"+d.getDate();
    const ho = "0"+d.getHours();
    const mi = "0"+d.getMinutes();
    return `${ye}-${mo.slice(-2)}-${da.slice(-2)} ${ho.slice(-2)}:${mi.slice(-2)}` ;
  }
  convert_time(time, timeZone) {
    let h = "0"+(parseInt(time.split(":")[0])-1);
    return h.slice(-2)+":"+time.split(":")[1];
    /*
    try{
      if(timeZone == undefined){
        timeZone = "Africa/Cairo" ;
      }
      time = time.split(" ").length==2 ? time : this.get_date_time().split(" ")[0]+" "+time ;

      const d = new Date(new Date().toLocaleString("en-US", {timeZone: "Africa/Casablanca"}));
      
      const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
      //notifyMessage("3"+utc);
      const newTZ_d = new Date(new Date().toLocaleString("en-US", {timeZone: timeZone}));
      const newTZ = newTZ_d.getTime() + (newTZ_d.getTimezoneOffset() * 60000);
      const offset_ny = newTZ - utc;
      //notifyMessage("4"+posix_ny);
      let timeZone_ = parseInt(offset_ny/3600000);
      notifyMessage("5 "+d+" \n  "+newTZ_d);
      timeZone_=timeZone_>0 ? "+"+timeZone_ : timeZone_ ;
      console.log(time,);
      notifyMessage("6 "+time+" GMT"+timeZone_);
      return  this.get_date_time((new Date(time+" GMT"+timeZone_))).split(" ")[1];
    }catch(e){
      notifyMessage(e);
      return time;
    }
    */
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
  get_match(match_id){
    if(this.headers["device-token"]==""){
      return this.set_token().then(()=> { return this.get_matches(match_id)});
    }
    if(match_id==undefined){
      notifyMessage("match id invalid");
    }
    const url = this.domain+"match_details";

    let data = "match_id="+match_id;
    return fetch(url, {
      method: 'POST',
      headers: this.headers,
      body:data
    })
      .then(response => response.json())
      .then(resJson => {
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
        if(resJson && resJson["data"] && resJson["data"].length>0 ){
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


  get_url_content(url){

    const q_url  = "https://developers.facebook.com/tools/debug/?q=";
    const sc_url = "https://developers.facebook.com/tools/debug/echo/?q=";
    url = encodeURIComponent(url) 

    return fetch(q_url+url, {
      method: 'GET',
    })
      .then(response => {
        return fetch(sc_url+url, {
          method: 'GET',
        })
      })

      .catch(error => {
        console.log('ERROR', error);
        this.error = error;
      });
  }
}

export default API;