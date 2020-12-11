import { Platform, DeviceInfo } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Scrap from "./scrap";
import Base64 from "./Base64";


//https://al-match.com/api/get_server_generator  POST channel_id=17
class API {
  constructor() {
    this.channel_id = "UCBaD-tLomo_JgH66CuSFWAQ";
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
  leagueId_byTitle(title,default_id){
    default_id = default_id==undefined ? 0 : default_id ;
    title= typeof title == "string" ? title.trim() : title;
    title= typeof title == "string" ? title.replace(/أ/g,"ا") : title;
    title= typeof title == "string" ? title.replace(/إ/g,"ا") : title;
    const league_id =  API_ && API_.leagues_dict[title] ? API_.leagues_dict[title].league_id : default_id ;
    return parseInt(league_id);
  }
  get_news(page){
    //view-source:https://www.oxus.tj/sites/default/private/files/.proxy.php?url=https://www.beinsports.com/ar/tag/%D8%A7%D9%84%D9%85%D9%84%D8%AE%D8%B5%D8%A7%D8%AA/
    return this.http("https://m.kooora.com/?n=0&o=ncma&arabic&pg="+page,"GET",null,{})
    .then(resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      return scrap.get_news(resp);
    });
  }
  get_videos(page,q=""){
    let url="https://www.beinsports.com/ar/tag/%D8%A7%D9%84%D9%85%D9%84%D8%AE%D8%B5%D8%A7%D8%AA/"+page;
    //url="https://www.beinsports.com/ar/search?q=maroc&ft=%D8%A7%D9%84%D9%81%D9%8A%D8%AF%D9%8A%D9%88";
    //console.log(url);
    return this.http(url,"GET",null,{})
    .then(resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      return scrap.get_videos(resp);
    });
  }
  get_video(link){
    return this.http(link,"GET",null,{})
    .then(resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      return scrap.get_video(resp);
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
    //notifyMessage("new");
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
        alert("Token Error",error);
      });
  }
  get_date(date__=null){
    const d = date__==null ? new Date() : date__;
    const ye = d.getFullYear();
    const mo = (d.getMonth()+1);
    const da = d.getDate();
    let final_d = `${da}-${mo}-${ye}`;
    return "NaN-aN-aN"== final_d? date__ : final_d ;
  }
  get_date2(date__=null){
    const d = date__==null ? new Date() : date__;
    const ye = d.getFullYear();
    const mo = "0"+(d.getMonth()+1);
    const da = "0"+d.getDate();
    let final_d = `${ye}-${mo.slice(-2)}-${da.slice(-2)}` ;
    return "NaN-aN-aN"== final_d? final_d : final_d ;
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

  convert_time_spent(datetime_start){
    //console.log(datetime_start);
    const now = new Date();
    const time_start= this.convert_time_o(datetime_start);
    let diff = ( now.getTime()-time_start.getTime() )/60000;
    diff = parseInt(diff);
    diff = diff>45 && diff <=60 ? "Half" : (diff>45+15 ? diff-15 :diff);
    const isok = diff>130 ? false : true;
    diff = diff >0 && diff<=99 ? diff : ( diff>0 ? 90 : diff);
    return isok ? diff : false;
  }
  convert_time_o(datetime_str,seconds=false){
    const datetime_obj= new Date(datetime_str.replace(" ","T")+":00.000+01:00");
    return seconds==true ? datetime_obj.getTime() : datetime_obj;
  }
  convert_time(time, time_add=-1) {
    
    try{
      let h = "0"+(parseInt(time.split(":")[0])+time_add);
      return h.slice(-2)+":"+time.split(":")[1];
    }catch(e){
      return time;
    }
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
      //notifyMessage("5 "+d+" \n  "+newTZ_d);
      timeZone_=timeZone_>0 ? "+"+timeZone_ : timeZone_ ;
      console.log(time,);
      notifyMessage("6 "+(new Date().toLocaleString("en-US", {timeZone: "Africa/Cairo"}) ) );
      notifyMessage("6 "+ (new Date()) );

      return  this.get_date_time((new Date(time+" GMT"+timeZone_))).split(" ")[1];
    }catch(e){
      notifyMessage(e);
      return time;
    }
    */
  }
  get_league_matches(id){
    const url = this.domain+"get_matches_by_league";
    const data = "league_id="+id;
    return fetch(url, {
      method: 'POST',
      headers: this.headers,
      body:data,
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
  get_standing(id){
    if(this.headers["device-token"]==""){
      return this.set_token().then(()=> { return this.get_standing(id)});
    }
    const url = this.domain+"standings/"+id;
    //https://al-match.com/api/touranments_match/details?match_id=
    return fetch(url, {
      method: 'GET',
      headers: this.headers,
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
  async load_leagues(){
    if(this.headers["device-token"]==""){
      return this.set_token().then(()=> { return this.load_leagues()});
    }
    const exp_t = 3*24*60*60*1000;

    let leagues = await AsyncStorage.getItem('leagues');
    if(leagues ){
      leagues = JSON.parse(leagues);
    }else{
      leagues = {"date":0,data:{}};
    }
    let date_stored = leagues && leagues["date"] ? parseInt(leagues["date"]) : 0;
    const is_expired = (new Date()).getTime()- date_stored >= exp_t;
    this.leagues_dict = {};
    if(Object.keys( leagues["data"] ).length>0 && is_expired==false){
      console.log("leagues cache");
      this.leagues_dict = leagues["data"];
      return this.leagues_dict;
    }
    return this.get_leagues(1)
      .then(o=>{
        if( Object.keys( this.leagues_dict ).length >0){
          this.leagues = {"date":(new Date()).getTime(),data:this.leagues_dict};
          AsyncStorage.setItem('leagues', JSON.stringify(this.leagues) );
          return this.leagues_dict;
        }

        });

  }
  get_leagues(page){
      console.log("leagues loading pg="+page);
      const url = this.domain+"leagues?page="+page;
      return fetch(url, {
        method: 'GET',
        headers: this.headers,
      })
      .then(response => response.json())
      .then(o => {
        if(o && o["data"] && o["data"].length>0){
          for(let i=0;i<o["data"].length;i++){
            let league_name = o["data"][i]["ar_league_name"] ? o["data"][i]["ar_league_name"] : o["data"][i]["league"] ;
            this.leagues_dict[league_name] = o["data"][i];
          }
          return this.get_leagues(page+1);
        }else{
          return this.leagues_dict;
        }
      })
      .catch(error => {
        console.log('ERROR', error);
        this.error = error;
      });
  }
  get_matches_k(date_obj){
    return this.http("https://www.kooora.com/?region=-1&area=0&dd="+date_obj.getDate()+"&mm="+(date_obj.getMonth()+1)+"&yy="+date_obj.getFullYear()+"&arabic&ajax=1","GET",null,{})
    .then(resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      return scrap.get_matches_k(resp,date_obj);
    });
  }
  get_match_k(id){
    //https://www.kooora.com/?m=2469218&ajax=true
    return this.http("https://www.kooora.com/?ajax=1&m="+id+"&arabic","GET",null,{})
    .then(resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      return scrap.get_matche_k(resp,false,true);
    });
  }
  get_lineup_k(id){
    //https://www.kooora.com/?m=2469218&ajax=true
    return this.http("https://www.kooora.com/?squads="+id+"&arabic","GET",null,{})
    .then(resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      return scrap.get_lineup(resp);
    });
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
        this.setConfig("token","");
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
      try{configs = JSON.parse(configs);}
      catch(e){configs={};}
      configs[key] = value;
    }else{
      configs = {};
      configs[key] = value;
    }
    await AsyncStorage.setItem('configs', JSON.stringify(configs));
    return value;
  };

  getConfig = async (key,defualt_val=undefined) => {
    //if(defualt_val==false) this.setConfig(key, []);
    let configs = await AsyncStorage.getItem('configs');
    if (configs) {
      configs = JSON.parse(configs);
      if ( configs[key] ){
        return configs[key];
      }else{
        if (defualt_val==undefined){return false;}
        await this.setConfig(key, defualt_val);
        return defualt_val;
      }
    }else {
      if (defualt_val==undefined){return false;}
      await this.setConfig(key, defualt_val);
      return defualt_val;
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

  get_channel_info(){
    const url = 'https://youtube.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&id='+this.channel_id+'&key=AIzaSyBAd3__pfFSDfSSDL64TJkgGrzmq84lhL0';
    return fetch(url, {
          method: 'GET',
          headers: this.headers2,
    }).then(response => response.json())
    .catch(error => {
        console.log('ERROR', error);
        this.error = error;
    });
  }
  get_channel_items(playlist_id){
      const url = 'https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=25&playlistId='+playlist_id+'&key=AIzaSyBAd3__pfFSDfSSDL64TJkgGrzmq84lhL0';
      return fetch(url, {
            method: 'GET',
            headers: this.headers2,
      }).then(response => response.json())
      .then(response => {
          return response;
      })
      .catch(error => {
          console.log('ERROR', error);
          this.error = error;
      });
  }
  get_yt_vids(){
    return this.get_channel_info().then(o=>{
      let playlist_id = "";
      if(Object.keys(o).length==0){
        return [];
      }
      try{playlist_id=o["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"];}catch(err){console.log(o);return[];}
      return this.get_channel_items(playlist_id).then(o=>{
        let list = [];
        if(o["items"] && o["items"].length>0){
          for(let i=0;i<o["items"].length;i++){
            try{
              const r = o["items"][i];
              let vid = {
                link:r.contentDetails.videoId,
                videoId:r.contentDetails.videoId,
                title_news:r.snippet.title,
                img:r.snippet.thumbnails.medium.url,
                date:r.snippet.publishedAt.split("T")[0],
                is_yt :true,
              };
              list.push(vid);
            }catch(err){console.log(err);}
          }
        }
        return list;
        
      });
    })
  }

  get_url_content(url){

    const q_url  = "https://developers.facebook.com/tools/debug/?q=";
    const sc_url = "https://developers.facebook.com/tools/debug/echo/?q=";
    url = encodeURIComponent(url) 

    return fetch(q_url+url, {
      method: 'GET',
    }).then(response => response.json())
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