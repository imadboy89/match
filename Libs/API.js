import { Platform, Dimensions, Share } from 'react-native';
//import AsyncStorage from '@react-native-community/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Scrap from "./scrap";
import Base64 from "./Base64";
import { Linking } from 'react-native';
import * as DeviceInfo from 'expo-device';
import teams_en from "./teams_en";
//https://al-match.com/api/get_server_generator  POST channel_id=17
class API {
  constructor() {
    this.hidden_leagues =  [22787, 22756, 23133, 22559, 22442, 22562, 23176, 22558];
    this.first_api_call_almtchapi = true;
    this.running_calls = [];
    this.server_url = "http://107.152.39.225:81/imad_404/";
    this.server_url = "https://20.101.63.9/imad_404/";
    //this.server_url = "https://107.152.39.225/";
    this.yify_movies_url = "https://yts.mx/api/v2/";
    this.yify_subs_url = "https://yifysubtitles.org/";
    this.PB_movies_url = "https://tpb.party/";
    this.MC_movies_url = "https://moviecrumbs.net/";
    this.MC_movies_url = "https://www1.moviecrumbs.net/";
    
    this.PB_sections = {205:"TV shows",201:"Movies"}
    this.yt_api_key = "AIzaSyC_Dnp88128mp5CZ_htFtSRpiNFBCMHaco";
    //https://tpb.party/search/peaky%20blinders/1/99/205
    this.showMsg = function(msg){console.log("showMsg : ",msg)}

    // get channel id from $("link[rel=canonical]").href in channel page console
    this.channels = {
      1:"UCBaD-tLomo_JgH66CuSFWAQ", 
      2:"UCRN5ho3UGhUi7ZCBe2G2f2w",
      4:"UC7FGo_bQUVxVxVsiHAQxSOQ",
      7:"UCpcTrCXblq78GZrTUTLWeBw",
    }
    this.pageTokens = {};
    //alert(Base64.btoa("aW1hZA=="));
    this.error = null;
    this.data = null;
    this.domain_o = 'https://al-match.com/';
    this.domain_ = 'https://al-match.com';
    this.domain = 'https://al-match.com/api/';
    this.configs = {};
    this.proxy_post = `${this.server_url}.proxy2.php?url=`;
    this.proxy_get = `${this.server_url}.proxy.php?url=`;
    this.cc_url = "https://o.kooora.com/f/big/[cc].png";
    this.cc_url_small = "https://o.kooora.com/f/[cc].png";
    this.IPTV_json = `${this.server_url}.index.php?action=json`;
    this.method = "POST";
    this.usingproxy = Platform.OS == 'web';
    this.isWeb = Platform.OS == 'web';
    this.notify_isWeb = Platform.OS == 'web';
    this.OS = DeviceInfo.osName.toLocaleLowerCase();
    this.isIOS = this.OS.toLocaleLowerCase() === "ios";
    this.main_domain = this.isWeb?location.host:"almatch";
    this.load_channels_running = false;
    this.notifcation_type ="push";
    this.notifications_matches = {};
    /*
    if (this.isWeb){
      this.domain = this.proxy+this.domain;
      this.method = "GET";
    }*/
    this.headers = {"Content-Type":"application/x-www-form-urlencoded","device-token":""};
    this.user_agents = {
      "Windows 10":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Safari/537.36",
      "Windows 7":"Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Safari/537.36",
      "Android 10" : "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Mobile Safari/537.36",
      "Android 11":"Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Mobile Safari/537.36",
      "Linux" : "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36",
      "iPhone":"Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/87.0.4280.77 Mobile/15E148 Safari/604.1",
      "iPad" : "Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/87.0.4280.77 Mobile/15E148 Safari",
    }
    const default_ua = this.user_agents["Linux"];
    this.headers["User-Agent"] = default_ua;
    this.headers2 = {
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      'User-Agent': default_ua
    }

    this.token_tries = 3;
    this.token_post = {"token":"","app_id":2} ;
    this.token = "";
    this.is_auth = false;
    this.leagues_dict = {};
    this.is_debug=false;
    this.messages_history = [];
    this.filtering = true;
    this.matches_bl = [];
    this.channels_dict = {};
    this.remote_controle = true;
    this.getConfig("remote_controle",this.remote_controle).then(o=>this.remote_controle=o);
    this.getConfig("is_debug",this.is_debug).then(o=>this.is_debug=o);
    this.getConfig("filtering",this.filtering).then(o=>this.filtering=o);
    this.days = ['الاحد', 'الاثنين', 'الثلاثاء', 'الاربعاء', 'الخميس', 'الجمعة', 'السبت'];
    this.crendentials = {"email": "" ,"password": ""};
    this.player_positions={
      0:"مدرب",
      1:"حارس",
      2:"دفاع",
      3:"وسط",
      4:"هجوم"};

    this.mdb_save_teams = false;
    this.time_offset = (new Date()).getTimezoneOffset()/60;


    this.use_mdb_proxy = false;this.isWeb;/* ok */
    //this.default_ui = "Movies?source_id=8";
    //this.default_ui = this.get_settings();//["Videos",{screen:"Movies",params:{source_id:8}}];
    //API_.setConfig("default_ui",["Videos", {screen: "Movies", params: {source_id: 8}}]);
    this.default_ui = false;
    this.get_settings().then(c=>{
      if(c && c.default_ui){
        this.default_ui = c.default_ui;
      }
      if(c && c.hidden_leagues){
        this.hidden_leagues = c.hidden_leagues;
      }
    });
    this.following = [];
    this.fav_utf8 = {1 : "★",0 : "☆",};
    this.fav_utf8[true] = this.fav_utf8[1];
    this.fav_utf8[false] = this.fav_utf8[0];
    this.fav_utf8[undefined] = this.fav_utf8[0];
    this.fav_utf8[null] = this.fav_utf8[0];
  }
  async fetch(resource, options) {
    const { timeout = 8000 } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
  
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    })
    .catch(err=>{
      if("AbortError" == err.name){
        throw "هناك مشكلة في الاتصال بالإنترنت أو الخادم الخاص بنا!";
      }
      console.log(err);
      return err;
    });
    clearTimeout(id);
    //console.log("async fetch : ",resource);
    return response;
  }
  http(url,method="GET",data=null,headers=null,is_json=false, use_proxy=true, use_proxy_utf=true){
    let configs = {method: method,headers: headers ? headers : this.headers,}
    if (this.use_mdb_proxy){
      if(headers){
        //console.log(headers);
        for(let kk in headers){
          headers[kk] = typeof headers[kk] == "string" ? [headers[kk],] : headers[kk];
        }
      }
      const args = {};
      args.url = url;
      args.body = data;
      args.is_post = method == "POST";
      
      args.use_proxy_utf = use_proxy_utf ? true : false;
      args.headers = headers ? headers : {};
      args.is_json=is_json;

      return backup.proxy(args);
    }
    if (data!=null){
      configs["body"] = data;
    }
    configs.headers = configs.headers==undefined ? {} : configs.headers ;
    try {
      configs.headers["almatch_session_id"] = backup.client.auth.activeUserAuthInfo.userId;
    } catch (error) {
      return this.sleep(2).then(o=>this.http(url,method,data,headers,is_json, use_proxy, use_proxy_utf));
    }
    
    
    if(this.isWeb || use_proxy){
      url = method=="GET" ? this.proxy_get+url : this.proxy_post+url; 
    }
    //url = "https://developers.facebook.com/tools/debug/echo/?q="+url;

    return this.fetch(url, configs)
      .then(response => {
        try {
          let out = "";
          if(is_json && response && response.json){
            out = response.json();
          }else if(response && response.text){
            out = response.text();
          }
          if(out==""){
            let error_msg = "API->http : "+response;
            error_msg += "\nUrl : "+url;
            error_msg += "\nOptions : "+JSON.stringify(configs);
            API_.showMsg(error_msg,"warning");  
          }
          return out;
        } catch (error) {
          let error_msg = "API->http : "+(error.message ? error.message : error);
          error_msg += "\nUrl : "+url;
          error_msg += "\nOptions : "+JSON.stringify(configs);
          API_.showMsg(error_msg,"warning");
          return is_json ? [] : "" ;
        }

      }) 
      .catch(error => {
        if(url.includes("device_app")){
          return "";
        }
        let error_msg = "API->http : "+(error.message ? error.message : error);
        error_msg += "\nUrl : "+url;
        error_msg += "\nOptions : "+JSON.stringify(configs);
        API_.showMsg(error_msg,"warning");
        console.log('ERROR', error);
        this.error = error;
        return "";
      });
  }
  open_ext_url(url){
    return Linking.canOpenURL(url).then(supported=>{
      if(supported){
        if(API_.isWeb){
          //const lk = Linking.openURL(url, '_blank');
          window.open(url,"_blank");
        }else{
          Linking.openURL(url).then(out=>{API_.showMsg("Opening channel.");});;
        }
      }else{
        API_.showMsg("This link is not supported : "+url,"warning");
      }
    });
  }
  async load_external_channels(source_id){
    //const url = "http://goal.kora-live.tv/channels.html";
    const url = "https://can2021.aflam4you.tv/browse-kora_live-videos-1-date.html";
    const html = await  this.http(url,"GET", null,{},false,false,false);
    //console.log(html);
    let scrap = new Scrap();
    scrap.isWeb = this.isWeb;
    this.external_channels = scrap.get_ch_ext(html);
    try {
      await AsyncStorage.setItem('external_channels',JSON.stringify(this.external_channels) );
    } catch (error) {
      API_.debugMsg("Could not stringify external channels results!","danger");
    }
    return true
  }
  get_iframe = async(url)=>{
    console.log("get_iframe 1 :: ", url);
    //https://can2021.aflam4you.tv/beinsports-max-5_5555.html
    const html = await  this.http(url,"GET", null,{},false,false,false);
    let scrap = new Scrap();
    let iframe_url = scrap.get_iframe_url(html);
    iframe_url = iframe_url[0]=="/" ? url.split("/").slice(0,3).join("/")+iframe_url : iframe_url;
    try {
      iframe_url = iframe_url[0]=="/" ? url.split("/").slice(0,3).join("/")+iframe_url : iframe_url;
    } catch (error) {}
    /*
    const html2 = await  this.http(iframe_url,"GET", null,{},false,false,false);
    iframe_url = scrap.get_iframe_url(html2,2);
    */
    return iframe_url;
  }
  get_cc_img(flag,small=false){
    return small ? this.cc_url_small.replace("[cc]",flag) : this.cc_url.replace("[cc]",flag) ; 
  }
  _isBigScreen(){
    return Dimensions.get('window').width>900 || Dimensions.get('window').height>900
  }
  setTitleWeb(title){
    if(API_.isWeb && document && document.title){
      document.title = title ;
    }
  }

  common_league_id(league){
    if(league==undefined)return 0;
    if(typeof league == "string"){
      const league_id = this.leagueId_byTitle(league);
      league = {id:league_id, title:league};
    }
    const title = this.fix_title(league.title) ;
    let id = league.id;
    if(league.is_koora==undefined && league.id){
      id = this.leagues_dict[title] && this.leagues_dict[title].koora_id ? this.leagues_dict[title].koora_id : id;
    }
    return id;
  }
  set_common_league_id(league){
    const title = this.fix_title(league.title) ;
    if (this.leagues_dict[title] && this.leagues_dict[title].koora_id==undefined){
      this.leagues_dict[title].koora_id = league.id;
    }
  }  
  leagueId_byTitle(title,default_id){
    default_id = default_id==undefined ? 0 : default_id ;
    title = this.fix_title(title);
    const league_id =  this.leagues_dict[title] ? this.leagues_dict[title].league_id : default_id ;
    return parseInt(league_id);
  }
  leagueLogo_byTitle(title,logo){
    title = this.fix_title(title);
    return  this.leagues_dict[title] ? this.domain_o+this.leagues_dict[title].logo : logo ;
  }
  fix_title(title,change_G=false){
    const replacemnt = {
      "بايرن ميونيخ"
      :
      "بايرن ميونخ",
      "ليون"
      :"أولمبيك ليون",
      "مارسيليا"
      :"أولمبيك مارسيليا",
      "سانت إيتيان"
      :"سانت اتيان",
      "مولودية وجدة"
      :"المولودية الوجدية",

      "لايبزيج"
      :"ار بي ليبزيج",
      "ستاد بريست 29"
      :"ستاد بريست",
      
    }
    if(change_G){
      title= typeof title == "string" ? title.replace(/ج/g,"غ") : title;
    }
    title= typeof title == "string" && replacemnt[title] ? replacemnt[title] : title;
    title= typeof title == "string" ? title.trim() : title;
    title= typeof title == "string" ? title.replace(/أ/g,"ا") : title;
    title= typeof title == "string" ? title.replace(/إ/g,"ا") : title;
    title= typeof title == "string" ? title.replace(/آ/g,"ا") : title;
    title=  title && title.split ? title.split("-")[0].trim() : title;

    return title;
  }
  running_calls_remove(url){
    this.running_calls = this.running_calls.filter(u=>url!=url);
  }
  running_calls_add(url){
    this.running_calls.push(url);
  }
  running_calls_check(url){
    if( this.running_calls.includes(url) ){
      return false;
    }
    this.running_calls_add(url);
    return true;
  }
  get_news(page, source_id=1,news_id=""){

    this.scrap = new Scrap();
    const news_links = {
      1:"https://m.kooora.com/?n=0&o=ncma&arabic&pg="+page,
      2:"https://www.hesport.com/mountakhab/index."+page+".html",
      3:"https://www.hesport.com/professionnels/index."+page+".html",
      4:"https://www.hesport.com/botola/index."+page+".html",
      5:"https://www.hesport.com/mondial/index."+page+".html",
      6:"https://m.kooora.com/?n=0&o=n&arabic&pg="+page,
      7:"https://m.kooora.com/?ok&arabic&ok",
      };
    let url = news_links[source_id] ? news_links[source_id] : news_links[1];
    url = news_id ? `https://m.kooora.com/?n=0&${news_id}&arabic&pg=${page}` : url;
    if(!this.running_calls_check(url)){return [];}
    return this.http(url,"GET",null,{})
    .then(resp=>{
      if(resp==undefined || !resp){
        this.running_calls_remove(url);
        return [];
      }
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      let list = url.includes("kooora.com")?scrap.get_news(resp) : scrap.get_news_hp(resp)
      if(url.includes("kooora.com")){
        let exist_list = [];
        list = list.filter(o=>{
          if(exist_list.includes(o.link) ){
            return false;
          }
          exist_list.push(o.link);
          return true;
        });
      }
      this.running_calls_remove(url);
      return list;
    });
  }
  get_events(){
    this.scrap = new Scrap();
    let url = "https://m.kooora.com/?t=0&arabic=true";
    return this.http(url,"GET",null,{})
    .then(resp=>{
      if(resp==undefined || !resp){
        return [];
      }
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      let list = scrap.get_events(resp);
      return list;
    });
  }
  
  async get_leagues_k(region_id){
    const url = "https://m.kooora.com/?y="+region_id+"&arabic";
    if(!this.running_calls_check(url)){return [];}
    return this.http(url,"GET",null,{})
    .then(async resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      let leagues = [];
      try {
        leagues = scrap.get_leagues(resp);
      } catch (error) {
        API_.debugMsg(error,"danger");
      }
      for(let i =0;i<leagues.length;i++){
        leagues[i].img = leagues[i] && leagues[i].koora_id && leagues[i].koora_id>0 && this.leagues_dict[leagues[i].koora_id] ? this.domain_+this.leagues_dict[leagues[i].koora_id].logo : "";
      }
      this.running_calls_remove(url);
      return leagues;
    }).catch(error=>{
      API_.showMsg(error,"danger");
      this.running_calls_remove(url);
    });
  }
  get_player(player_id){
    return this.http("https://m.kooora.com/?player="+player_id+"&arabic","GET",null,{})
    .then(resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      return scrap.get_player(resp);
    }).catch(error=>API_.showMsg(error,"danger"));
  }
  get_video_k(vid){
    const url = "https://ktv.kooora.ws/GetData.ashx?id="+vid+"&arabic";
    //API_.showMsg(url);
    //http(url,method="GET",data=null,headers=null,is_json=false, use_proxy=true){
    return this.http(url,"GET",null,this.headers,false,false)
    .then(resp=>{
      let out = {};
      try {
        out = JSON.parse(resp);
      } catch (error) {/*API_.debugMsg("get_video_k: Cannot parse JSON! "+resp,"warning")*/}

      return out;
    }).catch(error=>API_.showMsg(error,"danger"));
  }
  queued_get_teams=async(queue,next=false)=>{
    let queue_size = queue.length;
    let queue_inprocess = 0;
    const queue_maxInprocess=5;
    let teams_info = await this.getTeam_logo_k();
    for(const team_id of queue){
      while(queue_inprocess>=queue_maxInprocess){
        await this.sleep(1000);
      }
      queue_inprocess+=1;
      this.get_team(team_id, false,teams_info).then(r=>{
        queue_inprocess-=1;
        if(r && r.team_id>0 && (r.team_name_ar || r.team_name_en)){
          teams_info[r.team_id] = r;
        }
        
      });
    }
    while(queue_inprocess>0){
      await this.sleep(200);
    }
    console.log("queued_get_teams getting Teams [Done]",queue_size);
    //await AsyncStorage.setItem('teams_info_k', JSON.stringify(teams_info));
    await this.save_teams_ls(teams_info);
    await backup.save_teams();
    console.log("queued_get_teams saving [Done]",queue_size);
    if(API_.next && next){
      await this.sleep(1000);
      API_.next();
    }
    return true;
  }
  save_teams_ls = async(teams_info)=>{
    const chunk_size = 1000;
    let teams_info_chunk = {};
    const teams_info_v = Object.values(teams_info);
    let count = 0;
    let chunk_id = 0;
    for(let i=0;i< teams_info_v.length;i++){
      const t = teams_info_v[i];
      teams_info_chunk[t.team_id] = t;
      count ++;
      if(chunk_size <= count){
        await AsyncStorage.setItem('teams_info_k_'+chunk_id, JSON.stringify(teams_info_chunk));
        count = 0;
        teams_info_chunk={};
        chunk_id++;
      }
    }
    if(count >0){
      await AsyncStorage.setItem('teams_info_k_'+chunk_id, JSON.stringify(teams_info_chunk));
      count = 0;
      teams_info_chunk={};
      chunk_id++;
    }
  }
  load_teams_ls = async()=>{
    let teams_info = {};
    for(let i=0;i<100000;i++){
      const teams_info_chunk = await AsyncStorage.getItem('teams_info_k_'+i);
      if(teams_info_chunk){
        teams_info_chunk = JSON.parse(teams_info_chunk);
        //teams_info_chunk = teams_info_chunk.map(t=> t.team_logo = t.l && t.l.slice(0,4)!="http"?  "https://img.kooora.com/" : t.l );
        /*
        for(let i =0; i< Object.keys(teams_info_chunk);i++){
          const t = teams_info_chunk[i];
          teams_info_chunk[i].team_logo = t.l && t.l.slice(0,4)!="http"?  "https://img.kooora.com/" : t.l 
        }
        */
        teams_info = { ...teams_info, ...teams_info_chunk};
      }else{
        break;
      }
    }
    return teams_info;
  }
  async get_team(team_id,save_db=true,teams_info=undefined,get_fresh=false){
    "https://m.kooora.com/?player=33085"
    if(teams_info==undefined){
      teams_info = await this.getTeam_logo_k();
    }
    if(get_fresh==false && teams_info[team_id]){
      return teams_info[team_id];
    }
    return this.http("https://m.kooora.com/?team="+team_id+"&arabic","GET",null,{})
    .then(resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      const res = scrap.get_team(resp);
      let img_uri = res && res.team_group_photo ? res.team_group_photo : false;
      let img_logo_uri = res && res.team_logo ? res.team_logo : false;
      img_uri = img_uri && img_uri.slice(0,2)=="//" ? img_uri.replace("//","https://") : img_uri;
      img_logo_uri = img_logo_uri && img_logo_uri.slice(0,2)=="//" ? img_logo_uri.replace("//","https://") : img_logo_uri;
      img_logo_uri=res && res.team_type && res.team_type==2? API_.get_cc_img(res.team_flag) : img_logo_uri;
      res.team_group_photo = img_uri;
      res.team_logo = img_logo_uri;
      res.team_country;
      if(res && (res.team_name_ar || res.team_name_en) ){
        //API_.setTeam_logo(res["team_name_ar"], img_logo_uri, this.props.league_name, this.props.league_id,true,true);
        this.setTeam_logo_k(res,save_db);
        
      }else{
        console.log("not valide",res);
      }
      return res;
    }).catch(error=>API_.showMsg(error,"danger"));
  }
  get_scorers(league_id){
    return this.http("https://m.kooora.com/?c="+league_id+"&scorers=true&arabic","GET",null,{})
    .then(async resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      let scorers = [];
      try {
        scorers = scrap.get_scorers(resp);
      } catch (error) {console.log(error);}
      const teams = await this.getTeam_logo_k();
      
      return scorers.map(s => {
          const team = teams[s.team_id];
          if(team){
            s.team_badge = this.get_team_logo(team);
          }
          return s;
        });
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
      let videos = [];
      try {
        videos = scrap.get_videos(resp);
      } catch (error) {}
      return videos;
    });
  }
  get_videos_m(page,q=""){
    let url="https://mountakhab.net/mnt1/category/lions-du-monde/page/"+page+"/";
    return this.http(url,"GET",null,{})
    .then(resp=>{
      
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      let videos = [];
      try {
        videos = scrap.get_videos_m(resp);
      } catch (error) {}
      return videos;
    });
  }
  get_video(link,source_id){
    return this.http(link,"GET",null,{})
    .then(resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      let video = {};
      try {
        video = scrap.get_video(resp,source_id);
      } catch (error) {}
      return video;
    });
  }
  _get_article(link,source_id=1){
    //https://www.hesport.com/akhbar/122520.html
    const url = [1,6,7].includes(source_id) ? "https://m.kooora.com/?"+link+"&arabic" : "https://www.hesport.com/"+link;
    return this.http(url,"GET",null,{})
    .then(html=>{
      try{
        let scrap = new Scrap();
        scrap.isWeb = this.isWeb;
        let article  = {};
        try {
          article  = [1,6,7].includes(source_id)  ? scrap.get_article(html) : scrap.get_article_hp(html);
        } catch (error) {console.log(error)}
        return article;
      }catch(err){console.log(err);}

    });

  }
  get_article(link,source_id=1){
    //https://www.hesport.com/akhbar/122520.html
    const url = "https://m.kooora.com/?"+link+"&arabic";
    return this.http(url,"GET",null,{})
    .then(html=>{
      try{
        let scrap = new Scrap();
        scrap.isWeb = this.isWeb;
        let article  = {};
        try {
          article  = scrap.get_article(html);
          article.url= url;
        } catch (error) {console.log(error)}
        return article;
      }catch(err){console.log(err);}

    });

  }
  async set_token_2_(url){
    const args = {}
    args.url=url;
    args.is_post=true;
    args.is_json=true;
    args.headers={"Content-Type":["application/x-www-form-urlencoded"],"charset":["UTF-8"]};
    args.body = {"token":"",};
    args.use_proxy_utf=true;
    exports(args);
    
  }
  async set_token(foreced=false){  
    if(this.headers["device-token"]=="" && foreced==false){
      let out = await this.getConfig("token");
      if(out!=null && out!=false  ||this.token_tries==0){
        this.token=out;
        this.headers["device-token"]=this.token;
        return true;
      }
    }
    this.token = (Math.random().toString(36).substring(2)+Math.random().toString(36).substring(2) ).slice(0,20) ;
    //notifyMessage("new");
    let url = this.domain+"device_app";
    this.token_post["token"] = this.token;
    //alert(JSON.stringify(url,this.token_post) + JSON.stringify(this.headers)); 
    await this.sleep(500);
    const configs = {
      method: "POST",
      headers: this.headers,
      body:"token="+this.token+"&app_id=2"
      };
    url = url+"?"+configs.body;
    this.token_tries-=1;
    if(!this.running_calls_check(url)){return [];}
    return this.http(url, "POST", configs.body, this.headers, true,false,false).then(resJson=>{
      this.running_calls_remove(url);
      console.log(" token_tries -= 1", resJson);
      if(resJson && resJson["status"]== "true" && resJson["message"]){
        this.headers["device-token"]=this.token;
        this.setConfig("token",this.token);
        API_.showMsg(error);
      }
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
  get_date_timeS(date__=null){
    const d = date__==null ? new Date() : date__;
    const ye = d.getFullYear();
    const mo = "0"+(d.getMonth()+1);
    const da = "0"+d.getDate();
    const ho = "0"+d.getHours();
    const mi = "0"+d.getMinutes();
    const se = "0"+d.getSeconds();
    return `${ye}-${mo.slice(-2)}-${da.slice(-2)} ${ho.slice(-2)}:${mi.slice(-2)}:${se.slice(-2)}` ;
  }

  convert_time_spent(datetime_start){
    //console.log(datetime_start);
    const now = new Date();
    const time_start= this.convert_time_o(datetime_start);
    let diff = ( now.getTime()-time_start.getTime() )/60000;
    diff = parseInt(diff);
    diff = diff>45 && diff <=60 ? "Half" : (diff>45+15 ? diff-15 :diff);
    const isok = diff>110 ? false : true;
    diff = diff >0 && diff<=99 ? diff : ( diff>0 ? 90 : diff);
    return isok ? diff : false;
  }
  convert_time_o(datetime_str,seconds=false){
    let time_offset = Math.abs(this.time_offset);
    time_offset = `0${time_offset}`.slice(-2);
    time_offset = this.time_offset<=0 ?`+${time_offset}`:`-${time_offset}`;

    let datetime_obj= new Date(datetime_str.replace(" ","T")+":00.000"+time_offset+":00");
    datetime_obj == datetime_obj.getTime && datetime_obj.getTime()>0 ? datetime_obj: new Date(datetime_str.replace("T"," ")+":00.000"+time_offset+":00");
    return seconds==true ? datetime_obj.getTime() : datetime_obj;
  }
  convert_time(time, time_add=-1) {
    
    try{
      let h = "0"+(parseInt(time.split(":")[0])+time_add);
      return h.slice(-2)+":"+time.split(":")[1];
    }catch(e){
      return time;
    }
  }
  get_league_matches(id){
    const url = this.domain+"get_matches_by_league";
    const data = "league_id="+id;
    return this.fetch(url, {
      method: 'POST',
      headers: this.headers,
      body:data,
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
  get_standing(id){
    if(this.token_tries<=0){return false;}
    if(this.headers["device-token"]==""){
      return this.set_token().then(()=> { return this.get_standing(id)});
    }
    const url = this.domain+"standings/"+id;
    //https://al-match.com/api/touranments_match/details?match_id=
    return this.fetch(url, {
      method: 'GET',
      headers: this.headers,
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
  is_ascii(text){
    return /^[\x00-\x7F]*$/.test(text) ? true : false ;
  }
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }  
  async load_channels__(){
    if(this.token_tries<=0){return false;}
    if(this.headers["device-token"]==""){
      return await this.set_token().then(()=> { return this.load_channels__()});
    }
    const exp_t = 3*24*60*60*1000;

    let channels = await AsyncStorage.getItem('channels');
    let external_channels = await AsyncStorage.getItem('external_channels');

    if(channels ){
      channels = JSON.parse(channels);
    }else{
      channels = {};
    }
    if(external_channels ){
      external_channels = JSON.parse(external_channels);
    }else{
      external_channels = {};
    }
    const is_expired = await this.is_expired("channels",exp_t);
    console.log("is_expired",is_expired , is_expired==false);
    if(is_expired==false){
      console.log("channels cache");
      this.channels_dict = channels;
      this.external_channels = external_channels;
      return ;
    }
    
    this.load_channels();
    this.load_external_channels();
    return false;
  }
  async is_expired(key, ttl=undefined){
    const exp_t = ttl ? ttl : 10*24*60*60*1000;
    let data2check = await AsyncStorage.getItem("expired_"+key);
    let date_stored = data2check ? parseInt(data2check) : 0;
    const is_expired = (new Date()).getTime()- date_stored >= exp_t;
    if(is_expired){
      const time = (new Date()).getTime() ;
      await AsyncStorage.setItem("expired_"+key,time.toString());
    }
    return is_expired;
  }
  async save_leagues_(date=false){
    let leagues = {};
    const leagues_ls = await AsyncStorage.getItem('leagues');
    if(leagues_ls){
      try{
        leagues = JSON.parse(leagues_ls)
      }catch(e){}
    }
    if(date){
      leagues["date"] = date;
    }
    leagues["data"] = this.leagues_dict ;
    await AsyncStorage.setItem('leagues', JSON.stringify(leagues) );
  }
  get_leagues(page){
      const url = this.domain+"leagues?page="+page;

      return this.http(url, "GET", {}, this.headers, true)
      .then(o=>{
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
        this.setConfig("token","");
        this.headers["device-token"]="";
        API_.showMsg(error);
      });

  }
  get_matches_k(date_obj, is_only_live, source_id=1,next=false){
    let url = "";
    if(source_id==1){
      url = "https://www.kooora.com/?region=-1&area=0&dd=";
      url = is_only_live ? "https://www.kooora.com/?region=-1&area=6&dd=" : url;
      url +=date_obj.getDate()+"&mm="+(date_obj.getMonth()+1)+"&yy="+date_obj.getFullYear()+"&arabic&ajax=1";
    }else if(source_id==2){
      url = "https://table.super-kora.tv/";
    }
    if(!this.running_calls_check(url)){return [];}
    return this.http(url,"GET",null,null)
    .then(resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      let matches = [];
      is_only_live = false;
      try {
        if(source_id==1){
          matches = scrap.get_matches_k(resp,date_obj,false, is_only_live);
        }else if(source_id==2){
          matches = scrap.get_matches_kora_star(resp,date_obj,false, is_only_live);
        }
        //alert("get_matches_k "+matches.length);
        /////////////////////////////////////////////
        if(this.mdb_save_teams){
          let queue_teams2upload=[];
          if(backup.teams_ready==true){
            this.getTeam_logo_k().then(teams_logo =>{
              matches.map(l=>{
                l.data.map(m=>{
                  const t_id = parseInt(m.home_team_id);
                  const t_id2 = parseInt(m.away_team_id);
                  //queued_get_teams
                  if(t_id>0 && teams_logo[t_id]==undefined){queue_teams2upload.push(t_id);}
                  if(t_id2>0 && teams_logo[t_id2]==undefined){queue_teams2upload.push(t_id2);}
                });
              });
            }).then(async res=>{
              this.queued_get_teams(queue_teams2upload,next);
            });
          }
        }
        /////////////////////////////////////////////////////////////////////////////

      } catch (e) { console.log(e);}
      this.running_calls_remove(url);
      return matches;//this.set_logos(matches);
    });
  }
  get_matches_league_k(league_id, c_stage){
    let url = "https://www.kooora.com/?c="+league_id+"&sch=true&ajax=1&arabic&";
    url += c_stage!=0 ? "stage="+c_stage : "cm=m";
    return this.http(url,"GET",null,{})
    .then(resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      let matches = [];
      try {
        matches = scrap.get_matches_k(resp,false,false,false, true);
      } catch (e) {console.log(e);}
      return matches
    });
  }
  get_match_k(id){
    //https://www.kooora.com/?m=2469218&ajax=true
    return this.http("https://www.kooora.com/?ajax=1&m="+(""+id).replace("fav_","")+"&arabic","GET",null,{})
    .then(resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      let matches = [];
      try {
        matches = scrap.get_matche_k(resp,false,true);
      } catch (e) {}
      return matches
    });
  }
  get_lineup_k(id){
    //https://www.kooora.com/?m=2469218&ajax=true
    return this.http("https://www.kooora.com/?squads="+id+"&arabic","GET",null,{})
    .then(resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      let lineup = [];
      try {
        lineup = scrap.get_lineup(resp);
      } catch (e) {}
      return lineup
    });
  }
  get_standing_k(id){
    return this.http("https://www.kooora.com/?c="+id+"&cm=i&ajax=1&","GET",null,{})
    .then(resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      let standing = [];
      try {
        standing = scrap.get_standing(resp);
      } catch (e) {}
      return standing
    });
  }
  async set_logos(matches){
    let teams = {}
    try{
      teams = await this.getTeam_logo_k();
    }catch(err){
      alert(err+"");
    }
    for(let i=0;i<matches.length;i++){
      for(let j=0;j<matches[i]["data"].length;j++){
        if(matches[i]["data"][j] && matches[i]["data"][j]["home_team"]!=undefined){
          const h_team_id = matches[i]["data"][j]["home_team_id"];
          const a_team_id = matches[i]["data"][j]["away_team_id"];
          const h_team = teams && teams[h_team_id] ? teams[h_team_id] : false;
          const a_team = teams && teams[a_team_id] ? teams[a_team_id] : false;
          matches[i]["data"][j]["home_team_badge"] = h_team ? this.get_team_logo(h_team) : "";
          matches[i]["data"][j]["away_team_badge"] = a_team ? this.get_team_logo(a_team) : "";
        }
      }
    }

    return matches;
  }
  get_team_logo(team){
    return team.l && team.l.slice(0,4)!="http"?  "https://img.kooora.com/"+team.l : team.l ;
  }
  get_team_info(teams, team_name){
    let team_inf = teams[this.fix_title(team_name)];
    team_inf = team_inf  ? team_inf : teams[this.fix_title(team_name, true)];
    return team_inf ;
  }
  async set_logos_standing(standing_steams,second_exec=false){
    const teams = await this.getTeam_logo_k();
    for(let i=0;i<standing_steams.length;i++){
      if(Object.keys(standing_steams[i]).length==1 && second_exec==false){
        for(let key in standing_steams[i]){
          standing_steams[i][key] = await this.set_logos_standing(standing_steams[i][key],true);
        }
      }
      if(standing_steams[i]["team_name"] == undefined){ continue; }
      //console.log(standing_steams[i]);
      const team_id = standing_steams[i]["team"] && standing_steams[i]["team"]["id"]  ? standing_steams[i]["team"]["id"] : 0;
      
      standing_steams[i]["team_badge"] = teams && teams[team_id] ? this.get_team_logo(teams[team_id]) : undefined;
    }

    return standing_steams;
  }
  async get_logos(matches){
    matches = matches?matches:this.matches;
    console.log("-----",matches);
    
    const leagues = Object.keys(matches);
    for(let i=0;i< leagues.length;i++){
      for(let j=0;j<matches[leagues[i]].length;j++){
        const item = matches[leagues[i]][j] ;
        const h_name = item.home_team_ar ? item.home_team_ar :item.home_team ;
        const a_name = item.away_team_ar ? item.away_team_ar :item.away_team ;
        await this.setTeam_logo(h_name,item.home_team_badge,item.league);
        await this.setTeam_logo(a_name,item.away_team_badge,item.league);
      }
    }
    //backup.save_teams();
  }
  get_matches(date_obj=null, page=1){
    if(this.token_tries<=0){return new Promise((resolve, reject)=>{return resolve([])});}
    if(this.headers["device-token"]==""){
      return this.set_token().then(()=> { return this.get_matches(date_obj,page)});
    }
    this.matches = page==1 ? {} : this.matches;
    const url = this.domain+"get_matches?page="+page;
    date_obj = date_obj ? date_obj : new Date();
    //let data = "match_date="+this.get_date(date_obj);
    let data = {match_date:this.get_date(date_obj) };
    const custom_headers = {};
    custom_headers["device-token"] = this.headers["device-token"];
    custom_headers["User-Agent"] = this.headers["User-Agent"];

    return this.http(url, "POST", data, custom_headers, true, false, false)
    .then(resJson=>{
      if(resJson["status"]== "true" ){//console.log(resJson["data"]);
        const matches = Object.keys(resJson["data"]);
        for(let i=0;i<matches.length;i++){      
          if(this.matches[matches[i]] == undefined){
            this.matches[matches[i]] = resJson["data"][matches[i]];
          }else{
            this.matches[matches[i]] = this.matches[matches[i]].concat(resJson["data"][matches[i]]);
          }
        }
        if(Object.keys(resJson["data"]).length>0){
          this.get_logos();
        }
        return Object.keys(resJson["data"]).length>0 ? this.get_matches(date_obj, page+1) : this.matches;
      }
      return resJson;
    })
    .catch(error => {
      console.log("api_ error",error , url);
      this.setConfig("token","");
      this.headers["device-token"]="";
      API_.showMsg(error);
    });

  }
  get_match(match_id){
    if(this.token_tries<=0){return new Promise((resolve, reject)=>{return resolve([])});}
    if(this.headers["device-token"]==""){
      return this.set_token().then(()=> { return this.get_match(match_id)});
    }
    if(match_id==undefined){
      notifyMessage("match id invalid");
    }
    const url = this.domain+"match_details";

    let data = "match_id="+match_id;
    return this.fetch(url, {
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
    if(this.token_tries<=0){return new Promise((resolve, reject)=>{return resolve([])});}
    if(this.headers["device-token"]==""){
      return this.set_token().then(()=> { return this.get_channel(id)});
    }
    const url = this.domain+"get_channel";
    const body= {channel_id: ""+id,};//"category_id="+cat+"&page="+page;
    const custom_headers = {};
    custom_headers["device-token"] = this.headers["device-token"];
    custom_headers["User-Agent"] = this.headers["User-Agent"];
    return this.http(url, "POST", body, custom_headers, true, false, false)
      .then(resJson => {
        if(resJson && resJson["data"] && resJson["data"].length>0 ){
        }
        return resJson;
      })
      .catch(error => {
        console.log('ERROR', error);
        API_.showMsg(error);
      });
  }
  get_channels(cat,page=1){
    if(this.token_tries<=0){return new Promise((resolve, reject)=>{return resolve([])});}
    if(this.headers["device-token"]==""){
      return this.set_token().then(()=> { return this.get_channels(cat,page)});
    }
    const url = this.domain+"get_channels";
    const body= {category_id: ""+cat, page:""+page};//"category_id="+cat+"&page="+page;
    const custom_headers = {};
    custom_headers["device-token"] = this.headers["device-token"];
    custom_headers["User-Agent"] = this.headers["User-Agent"];
    return this.http(url, "POST", body, custom_headers, true, false, false)
      .then(resJson => {
        if(resJson && resJson["data"] && resJson["data"].length>0 ){
        }
        return resJson;
      })
      .catch(error => {
        console.log('ERROR', error);
        API_.showMsg(error);
      });

  }
  fix_channel_name(name){
    name = name.replace(/\s/g,"").toLocaleLowerCase().trim() ;
    name = name.replace("beinsports","beinsport");
    name = name.replace("ontimesports","ontimesport");
    name = name.replace("hd","");
    return name;
  }
  load_channels = async()=>{
    this.load_channels_running = true;
    API_.channels_dict = {};
    for (let i = 0; i < 1; i++) {
      let resJson = await this.get_categories(i);
      if(resJson==undefined){break;}
      if(resJson["data"] && resJson["data"].length>0){
        for (let j = 0; j < resJson["data"].length; j++) {
          const cat_id = resJson["data"][j].category_id ;
          const cat_img = resJson["data"][j].category_photo ;
          const channels = await this.get_channels(cat_id);
          if(channels==undefined){continue;}
          for(let k=0;k<channels["data"].length;k++){
            const channel = channels["data"][k];
            let ch_ob = await API_.get_channel(channel.channel_id) ;
            if(ch_ob==undefined){continue;}
            ch_ob = ch_ob && ch_ob["data"] ? ch_ob["data"] : {};
            const ch_n = this.fix_channel_name(ch_ob.en_name) ;
            API_.channels_dict[ch_n] = ch_ob ;
            API_.channels_dict[ch_n].id = API_.channels_dict[ch_n].channel_id;
            API_.channels_dict[ch_n].channel_photo = channel.channel_photo;
          }
          await AsyncStorage.setItem('channels',JSON.stringify(API_.channels_dict) );
          await this.sleep(300);
        }
      }else{
        break;
      }
    }
    console.log("load_channels [Done]");
    API_.showMsg("Loading Channels done ["+Object.keys(API_.channels_dict).length+"]")
    this.load_channels_running = false;
    return true;
  }
  get_categories(page=1){
    if(this.token_tries<=0){return new Promise((resolve, reject)=>{return resolve([])});}
    if(this.headers["device-token"]==""){
      return this.set_token().then(()=> { return this.get_categories(page)});
    }
    const url = this.domain+"get_categories?page="+page;
    //http(url,method="GET",data=null,headers=null,is_json=false, use_proxy=true, use_proxy_utf=true)
    return this.http(url, "GET", null, this.headers, true, false, false)
      .then(resJson => {
        if(resJson && resJson["data"] && resJson["data"].length>0 ){
        }
        return resJson;
      })
      .catch(error => {
        console.log('ERROR', error);
        API_.showMsg(error);
      });
  }

  setConfig = async (key, value, isDefault=false) => {
    let configs = await AsyncStorage.getItem('configs');
    try{configs = JSON.parse(configs);}
    catch(e){configs=false;}
    if (configs) {
      configs[key] = value;
    }else{
      configs = {};
      configs[key] = value;
    }
    await AsyncStorage.setItem('configs', JSON.stringify(configs));
    if(backup && backup.db_settings && isDefault==false){
      await backup.save_settings(configs);
    }
    return value;
  };

  getConfig = async (key,defualt_val=undefined) => {
    //if(defualt_val==false) this.setConfig(key, []);
    let configs = await AsyncStorage.getItem('configs');
    if (configs && configs!="null" && configs!=null && JSON.parse(configs) != null) {
      configs = JSON.parse(configs);

      if ( configs[key]!=undefined ){
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



  get_channel_info(channel_id){
    channel_id = this.channels[channel_id] ;
    this.yt_api_key
    const url = 'https://youtube.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&key='+this.yt_api_key+'&id='+channel_id+'';
    return this.fetch(url, {
          method: 'GET',
          headers: this.headers2,
    }).then(response => response.json())
    .catch(error => {
        console.log('ERROR', error);
        this.error = error;
    });
  }
  get_channel_items(playlist_id){
      //pageToken
      const pagetoken = this.pageToken== undefined ? "" : "&pageToken="+this.pageToken;
      const url = 'https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&key='+this.yt_api_key+'&maxResults=25&playlistId='+playlist_id+''+pagetoken;
      return this.fetch(url, {
            method: 'GET',
            headers: this.headers2,
      }).then(response => response.json())
      .then(response => {
        this.nextPageToken = response["nextPageToken"] ;
        return response;
      })
      .catch(error => {
          console.log('ERROR', error);
          this.error = error;
      });
  }
  get_yt_vids(channel_id){
    const ch_key = `yt_chn_${channel_id}` ;
    if(!this.running_calls_check(ch_key)){return [];}
    return this.get_channel_info(channel_id).then(o=>{
      let playlist_id = "";
      this.running_calls_remove(ch_key);
      if(!o || Object.keys(o).length==0){
        return [];
      }
      try{playlist_id=o["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"];}catch(err){console.log(o);return[];}
      return this.get_channel_items(playlist_id).then(o=>{
        let list = [];
        if(o["items"] && o["items"].length>0){
          for(let i=0;i<o["items"].length;i++){
            const r = o["items"][i];
            try{
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

    return this.fetch(q_url+url, {
      method: 'GET',
    }).then(response => response.json())
      .then(response => {
        return this.fetch(sc_url+url, {
          method: 'GET',
        })
      })

      .catch(error => {
        console.log('ERROR', error);
        this.error = error;
      });
  }
  add_league_hiddenLeagues = async(league_id)=>{
    league_id = parseInt(league_id);
    API_.hidden_leagues = await API_.getConfig("hidden_leagues", API_.hidden_leagues);
    API_.hidden_leagues.push(league_id);
    await API_.setConfig("hidden_leagues", API_.hidden_leagues);
    API_.showMsg("League banned !","success");
  }
  remove_league_hiddenLeagues = async(league_id)=>{
    league_id = parseInt(league_id);
    API_.hidden_leagues = await API_.getConfig("hidden_leagues", API_.hidden_leagues);
    API_.hidden_leagues = API_.hidden_leagues.filter(l=>l!=league_id);
    await API_.setConfig("hidden_leagues", API_.hidden_leagues);
    API_.showMsg("League allowed !","success");
  }
  get_settings = async()=>{
    let configs = await AsyncStorage.getItem('configs');
    if(configs){
      return JSON.parse(configs);
    }else{
      return {};
    }
  }
  set_settings = async(settings)=>{
    if(settings["is_debug"]!=undefined){
      this.is_debug = settings.is_debug;
    }
    return await AsyncStorage.setItem('configs',JSON.stringify(settings) );
  }

  setCredentials = (email, password) => {
    this.crendentials = {"email": email.toLowerCase().trim() ,"password": password.trim()} ;
    /*
    let crendentials = {"email":"","password":""} ;
    try{
      crendentials["email"]    = email.toLowerCase().trim()
      crendentials["password"] = password.trim()
    }catch(err){}
    await AsyncStorage.setItem('crendentials', JSON.stringify(crendentials));
    */
  };
  getCredentials = () => {
    const crendentials = this.crendentials;
    this.crendentials = {"email": "" ,"password": ""} ;
    return crendentials;
    /*
      let crendentials = await AsyncStorage.getItem('crendentials');
      if(crendentials){
          return JSON.parse(crendentials);
      }else{
          crendentials = {"email":"","password":""} ;
          await this.setCredentials("","");
          return crendentials;
      }
      */
  };
  setTeams_logo = async(teams)=>{

  }
  setTeam_logo = async (team_name, logo_url, league_name, _league_id = undefined,is_koora=false,save_db=false) => {
    if(logo_url==undefined || this.is_ascii(team_name)==true){ return true;}
    team_name = team_name!=undefined ? this.fix_title(team_name.trim()) : team_name;
    const league_id = _league_id==undefined ? this.common_league_id(league_name) : _league_id;
    let teams_info = await this.getTeam_logo();
    if(teams_info[team_name] == undefined){
      logo_url = logo_url && logo_url.trim ? logo_url.trim() : "";
      teams_info[team_name] = {team_name:team_name, logo_url:logo_url,league_id:league_id, league_name:league_name,is_koora:is_koora};
      await AsyncStorage.setItem('teams_info', JSON.stringify(teams_info));
    }
    if(save_db == true){
      //await backup.save_teams();
    }
  };
  setTeam_logo_k = async (team_o=undefined,save_db=true,teams_info_=undefined) => {
    let teams_info={};
    if(team_o!=undefined){
      teams_info = await this.getTeam_logo_k();
      team_o.team_id = parseInt(team_o.team_id);
      if(teams_info[team_o.team_id] == undefined && isNaN(team_o.team_id)==false ){
        
        teams_info[team_o.team_id] = team_o;
        teams_info[team_o.team_id].is_koora = true; 

      }
    }else if (teams_info_!=undefined){
      console.log("save teams locally [count="+Object.keys(teams_info_).length+"]");
      teams_info = teams_info_;
      //teams_info = teams_info.filter(t=> t!=undefined && t.id>0 && i.name!=undefined);
    }
    return 
    //await AsyncStorage.setItem('teams_info_k', JSON.stringify(teams_info));
    if(save_db){
      console.log("save teams remotly [id="+team_o.team_id+"]");
      //await backup.save_teams();
    }
  };
  getTeam_logo = async (team_name=undefined) => {
    if(team_name!=undefined && this.is_ascii(team_name)==true){ return true;}
    team_name = this.fix_title(team_name);
    
    let teams_info = await AsyncStorage.getItem('teams_info');
    if(teams_info){
      teams_info = JSON.parse(teams_info);
    }else{
        teams_info = {} ;
    }
    if(team_name==undefined){
      return teams_info;
    }
    return this.get_team_info(teams_info, team_name);
    //return teams_info[team_name.trim()]==undefined ? false: teams_info[team_name.trim()];
  };
  getTeam_logo_k = async (team_id=undefined) => {
    //let teams_info = await AsyncStorage.getItem('teams_info_k');
    let teams_info = await this.load_teams_ls();
    if(team_id==undefined){
      return teams_info;
    }
    return teams_info[team_id] ? teams_info[team_id] : false ;
  };
  setTeams =async (teams)=>{
    await AsyncStorage.setItem('teams_info', JSON.stringify(teams));
  }
  setLeagues =async (leagues)=>{
    await AsyncStorage.setItem('leagues', JSON.stringify(leagues));
  }
  getLeagues =async ()=>{
    let leagues = await AsyncStorage.getItem('leagues');
    this.leagues_dict = {};
    try{
      leagues=JSON.parse(leagues);
      for(let i =0;i<leagues.length;i++){
        if(leagues[i].koora_id == undefined) continue;
        this.leagues_dict[leagues[i].koora_id] = leagues[i];
      }
    }catch(error){
      console.log(error);
      API_.debugMsg(error,"danger")
      this.leagues_dict={};
    }
    return this.leagues_dict;
  }
  setTeams_k =async (teams)=>{
    //await AsyncStorage.setItem('teams_info_k', JSON.stringify(teams));
    await this.save_teams_ls(teams);
  }


  saveLink = async (link,name,img) => {
    link = Base64.btoa(link);
    img  = Base64.btoa(img);
    //name = Base64.btoa(name);
    const links_manager = `${this.server_url}.index.php`;
    link = links_manager + '?action=save&is_b64=1&link=' + link + '&name=' + name + "&img="+img;
    return this.fetch(link, {
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

  get_IPTV = () => {
    return this.fetch(this.IPTV_json, {
      method: 'GET',
    })
      .then(response => response.json())
      .catch(error => {
        API_.showMsg(error,"danger");
        this.error = error;
      });
  };
  //////////// YIFY
  get_yify_movies = (options)=>{
    const params = Object.keys(options).map(k=>k+"="+options[k]).join("&"); 
    const url = this.yify_movies_url+"list_movies.json?"+params;
    return this.http(url,"GET",null,null,true)
  }
  get_yify_movie = (id)=>{
    const url = this.yify_movies_url+"movie_details.json?movie_id="+id;
    return this.http(url,"GET",null,null,true)
  }
  ////////////// PB
  get_PB_movies = (options)=>{
    let params = "";
    if (options.action == "list" && options.section && options.section!=""){
      params = `browse/${options.section}/${options.page}/3`;
    }else if (options.action == "search" && options.section && options.section!="" && options.search_qeury){
      params = `search/${options.search_qeury}/${options.page}/99/${options.section}`;
    }
    const url = this.PB_movies_url+params;
    return this.http(url,"GET",null,null,false)
    .then(async resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      let movies = [];
      try {
        movies = scrap.get_PB_movies(resp);
      } catch (error) {
        API_.debugMsg(error,"danger");
      }
      return movies;
    }).catch(error=>API_.showMsg(error,"danger"));

  }
  get_PB_movie = (id)=>{
    const url = this.yify_movies_url+"movie_details.json?movie_id="+id;
    return this.http(url,"GET",null,null,true)
  }

  /////// YIFY SUBs
  get_yify_subs = (id)=>{
    const url = this.yify_subs_url+"movie-imdb/"+id;
    return this.http(url,"GET",null,null,false)
    .then(async resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      let subs = [];
      try {
        subs = scrap.get_yify_subs(resp);
      } catch (error) {
        API_.debugMsg(error,"danger");
      }
      return subs;
    }).catch(error=>API_.showMsg(error,"danger"));
  }
  get_yify_sub_dl = (s_url)=>{
    const url = this.yify_subs_url+"subtitle/"+s_url.replace(/^\/subtitles\//,"")+".zip";
    //const url = this.yify_subs_url+""+s_url+".zip";
    return url;
  }




  get_players_ratings = async(team_h, team_a, date)=>{
    "https://www.whoscored.com/matchesfeed/?d=20220124";//date
    const url_matches = "https://www.whoscored.com/matchesfeed/?d="+date.replace(/-/g,"");
    "https://sport360.whoscored.com/Matches/1560148/Live/";
    const resp = this.http(url_matches,"GET",null,null,false,false);
  }


  get_MC_movies = (category, page, search_q)=>{
    //https://www.moviecrumbs.net/search/the-100?page=2
    //https://www.moviecrumbs.net/genre/family-9
    let params = "";
    if (category && category!=""){
      params = `${category}`;
    }
    if (search_q  && search_q.trim && search_q!=""){
      search_q = search_q.trim().replace("/  /g"," ").replace(" ","-");
      params = `search/${search_q}`;
    }
    if(page){
      params += `?page=${page}`;
    }
    const url = this.MC_movies_url+params;
    return this.http(url,"GET",null,null,false)
    .then(async resp=>{
      let scrap = new Scrap();
      let movies = [];
      try {
        movies = scrap.get_Mc_movies(resp);
      } catch (error) {
        API_.debugMsg(error,"danger");
      }
      return movies;
    }).catch(error=>API_.showMsg(error,"danger"));

  }

  get_MC_movie = (id)=>{

    const url = this.MC_movies_url+id;
    return this.http(url,"GET",null,null,false)
    .then(async resp=>{
      let scrap = new Scrap();
      let movies = [];
      try {
        movies = scrap.get_Mc_movie(resp, id);
      } catch (error) {
        API_.debugMsg(error,"danger");
      }
      return movies;
    }).catch(error=>API_.showMsg(error,"danger"));

  }
  get_match_head2head = (id)=>{
    const url = `https://www.kooora.com/?m=${id}&arabic`;
    return this.http(url,"GET")
    .then(async resp=>{
      let scrap = new Scrap();
      let head2head = [];
      try {
        head2head = scrap.get_head2head(resp);
      } catch (error) {
        API_.debugMsg(error,"danger");
      }
      return head2head;
    }).catch(error=>API_.showMsg(error,"danger"));
  }
  get_league_options(id){
    return this.http("https://m.kooora.com/?c="+id+"&arabic","GET",null,{})
    .then(resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      let options = [];
      try {
        options = scrap.get_league_options(resp);
      } catch (e) {}
      return options
    });
  }
  onShare = async (title,message,url) => {
    try {
      const content = {};
      content.message = message;
      content.url     = url.includes("http") ? url : `${website_url}${url}` ;
      content.title   = title;
      
      const result = await Share.share(content);
      if (result && result.action && result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          API_.showMsg("Shared successfully !","success");
        }
      } else if (result && result.action && result.action === Share.dismissedAction) {
        API_.showMsg("Sharing canceled !","warning");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  parse_details(details){
    details = details.split("~");
    let details_dict = {};
    for (let i=0;i<details.length;i++){
      let el = details[i] ? details[i].trim() : "";
      el = el.split("|");
      if(el.length==0){continue}
  
      if(details_dict[el[0]] ==undefined){
        details_dict[el[0]] = [el,];
      }else{
        details_dict[el[0]].push(el);
      }
    }
    return details_dict;
  }
}

export default API;