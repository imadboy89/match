import { Platform, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Scrap from "./scrap";
import Base64 from "./Base64";
import { Linking } from 'react-native';

//https://al-match.com/api/get_server_generator  POST channel_id=17
class API {
  constructor() {
    this.channels = {1:"UCBaD-tLomo_JgH66CuSFWAQ" , 2:"UCRN5ho3UGhUi7ZCBe2G2f2w",4:"UC7FGo_bQUVxVxVsiHAQxSOQ"}
    this.pageTokens = {};
    //alert(Base64.btoa("aW1hZA=="));
    this.error = null;
    this.data = null;
    this.domain_o = 'https://al-match.com/';
    this.domain = 'https://al-match.com/api/';
    this.configs = {};
    this.proxy = 'https://www.oxus.tj/sites/default/private/files/.proxy2.php?url=';
    this.proxy1 = 'https://www.oxus.tj/sites/default/private/files/.proxy.php?url=';
    this.cc_url = "https://o.kooora.com/f/big/[cc].png";
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
    this.leagues_dict = {};
    //this.set_token();
    this.is_debug=false;
    this.messages_history = [];
    this.filtering = true;
    this.matches_bl = [];
    this.channels_dict = {};
    this.getConfig("is_debug",false).then(o=>this.is_debug=o);
    this.getConfig("filtering",false).then(o=>this.filtering=o);
    this.days = ['الاحد', 'الاثنين', 'الثلاثاء', 'الاربعاء', 'الخميس', 'الجمعة', 'السبت'];
    this.crendentials = {"email": "" ,"password": ""};
    this.player_positions={
      0:"مدرب",
      1:"حارس",
      2:"دفاع",
      3:"وسط",
      4:"هجوم"};
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
  http(url,method="GET",data=null,headers=null,is_json=false){
    let configs = {method: method,headers: headers ? headers : this.headers,}
    if (data!=null){
      configs["body"] = data;
    }
    if(this.isWeb || 1==1){
      url = method=="GET" ? this.proxy1+url : this.proxy+url; 
    }
    //url = "https://developers.facebook.com/tools/debug/echo/?q="+url;
    return this.fetch(url, configs)
      .then(response => {
        try {
          return is_json ? response.json() : response.text();
        } catch (error) {
          API_.showMsg((error.message ? error.message : error)+"","warning");
          return is_json ? [] : "" ;
        }

      }) 
      .catch(error => {
        API_.showMsg((error.message ? error.message : error)+"","warning");
        console.log('ERROR', error);
        this.error = error;
        return "";
      });
  }
  open_ext_url(url){
    Linking.canOpenURL(url).then(supported=>{
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
    const url = "http://goal.kora-live.tv/channels.html";
    const html = await  this.http(url,"GET", null,{});
    //console.log(html);
    let scrap = new Scrap();
    scrap.isWeb = this.isWeb;
    this.external_channels = scrap.get_ch_ext(html);
  }
  get_cc_img(flag){
    return this.cc_url.replace("[cc]",flag) ; 
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
  get_news(page, source_id=1){
    const news_links = {
      1:"https://m.kooora.com/?n=0&o=ncma&arabic&pg="+page,
      2:"https://www.hesport.com/mountakhab/index."+page+".html",
      3:"https://www.hesport.com/professionnels/index."+page+".html",
      4:"https://www.hesport.com/botola/index."+page+".html",
      5:"https://www.hesport.com/mondial/index."+page+".html",
      
      }
    //view-source:https://www.oxus.tj/sites/default/private/files/.proxy.php?url=https://www.beinsports.com/ar/tag/%D8%A7%D9%84%D9%85%D9%84%D8%AE%D8%B5%D8%A7%D8%AA/
    const url = news_links[source_id] ? news_links[source_id] : news_links[1];
    return this.http(url,"GET",null,{})
    .then(resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      return source_id==1?scrap.get_news(resp) : scrap.get_news_hp(resp);
    });
  }
  get_player(player_id){
    https://m.kooora.com/?player=33085
    return this.http("https://m.kooora.com/?player="+player_id+"&arabic","GET",null,{})
    .then(resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      return scrap.get_player(resp);
    }).catch(error=>API_.showMsg(error,"danger"));
  }
  get_team(team_id){
    https://m.kooora.com/?player=33085
    return this.http("https://m.kooora.com/?team="+team_id+"&arabic","GET",null,{})
    .then(resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      return scrap.get_team(resp);
    }).catch(error=>API_.showMsg(error,"danger"));
  }
  get_scorers(league_id){
    //view-source:https://www.oxus.tj/sites/default/private/files/.proxy.php?url=https://www.beinsports.com/ar/tag/%D8%A7%D9%84%D9%85%D9%84%D8%AE%D8%B5%D8%A7%D8%AA/
    return this.http("https://m.kooora.com/?c="+league_id+"&scorers=true&arabic","GET",null,{})
    .then(resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      let scorers = [];
      try {
        scorers = scrap.get_scorers(resp);
      } catch (error) {}

      return API_.getTeam_logo().then(teams=>{
        return scorers.map(s => {
          const team = teams[this.fix_title(s.team_name)];
          if(team && team.logo_url){
            s.team_badge = team.logo_url;
          }
          return s;
        });
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
  get_article(link,source_id=1){
    //https://www.hesport.com/akhbar/122520.html
    const url = source_id==1 ? "https://m.kooora.com/?"+link+"&arabic" : "https://www.hesport.com/"+link;
    return this.http(url,"GET",null,{})
    .then(html=>{
      try{
        let scrap = new Scrap();
        scrap.isWeb = this.isWeb;
        let article  = {};
        try {
          article  = source_id==1 ? scrap.get_article(html) : scrap.get_article_hp(html);
        } catch (error) {}
        return article;
      }catch(err){console.log(err);}

    });

  }

  async set_token(){
    if(this.headers["device-token"]==""){
      let out = await this.getConfig("token");
      if(out!=null && out!=false){
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
    await this.sleep(500);
    return this.fetch(url, {
      method: "POST",
      headers: this.headers,
      body:"token="+this.token+"&app_id=2"
      })
      .then(response => response.json()) 
      .then(resJson => {
        if(resJson["status"]== "true" && resJson["message"]){
          this.headers["device-token"]=this.token;
          this.setConfig("token",this.token);
          //alert(resJson["message"]);
        }
      })
      .catch(error => {
        console.log('ERROR', error);
        this.error = error;
        API_.showMsg((error.message ? error.message : error)+"","warning");
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
  async load_leagues(refresh_leagues=false){
    if(this.headers["device-token"]==""){
      return await this.set_token().then(()=> { return this.load_leagues(refresh_leagues)});
    }
    const exp_t = 3*24*60*60*1000;

    let leagues = await AsyncStorage.getItem('leagues');
    let channels = await AsyncStorage.getItem('channels');
    if(leagues ){
      leagues = JSON.parse(leagues);
    }else{
      leagues = {"date":0,data:{}};
    }
    if(channels ){
      channels = JSON.parse(channels);
    }else{
      channels = {};
    }
    let date_stored = leagues && leagues["date"] ? parseInt(leagues["date"]) : 0;
    const is_expired = (new Date()).getTime()- date_stored >= exp_t;
    if(Object.keys( leagues["data"] ).length>0 && is_expired==false){
      console.log("leagues cache");
      this.leagues_dict = leagues["data"];
      this.channels_dict = channels;
      return this.leagues_dict;
    }
    
    await this.get_leagues(1)
      .then(o=>{
        if( Object.keys( this.leagues_dict ).length >0){
          this.save_leagues((new Date()).getTime());
          if(refresh_leagues!=false){
            refresh_leagues();
          }
          return this.leagues_dict;
        }
        });
    await this.sleep(1000);
    this.load_channels();
    return false;
  }
  async save_leagues(date=false){
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
      console.log("leagues loading pg="+page);
      const url = this.domain+"leagues?page="+page;
      return this.fetch(url, {
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
        this.setConfig("token","");
        this.headers["device-token"]="";
        console.log('ERROR', error);
        this.error = error;
      });
  }
  get_matches_k(date_obj, is_only_live){
    let url = "https://www.kooora.com/?region=-1&area=0&dd=";
    url = is_only_live ? "https://www.kooora.com/?region=-1&area=6&dd=" : url;
    url +=date_obj.getDate()+"&mm="+(date_obj.getMonth()+1)+"&yy="+date_obj.getFullYear()+"&arabic&ajax=1";
    return this.http(url,"GET",null,{})
    .then(resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      let matches = [];
      try {
        matches = scrap.get_matches_k(resp,date_obj,false, is_only_live);
      } catch (e) {}
      return matches;//this.set_logos(matches);
    });
  }
  get_matches_league_k(league_id){
    let url = "https://www.kooora.com/?c="+league_id+"&cm=m&ajax=1&arabic";
    return this.http(url,"GET",null,{})
    .then(resp=>{
      let scrap = new Scrap();
      scrap.isWeb = this.isWeb;
      let matches = [];
      try {
        matches = scrap.get_matches_k(resp);
      } catch (e) {}
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
    const teams = await this.getTeam_logo();
    for(let i=0;i<matches.length;i++){
      for(let j=0;j<matches[i]["data"].length;j++){
        if(matches[i]["data"][j] && matches[i]["data"][j]["home_team"]){
          const h_team = this.get_team_info(teams, matches[i]["data"][j]["home_team"]);
          const a_team = this.get_team_info(teams, matches[i]["data"][j]["away_team"]);

          matches[i]["data"][j]["home_team_badge"] = h_team && h_team["logo_url"] ? h_team["logo_url"] : "";
          matches[i]["data"][j]["away_team_badge"] = a_team && a_team["logo_url"] ? a_team["logo_url"] : "";
        }
      }
    }
    return matches;
  }
  get_team_info(teams, team_name){
    let team_inf = teams[this.fix_title(team_name)];
    team_inf = team_inf  ? team_inf : teams[this.fix_title(team_name, true)];
    return team_inf ;
  }
  async set_logos_standing(standing_steams,second_exec=false){
    const teams = await this.getTeam_logo();
    for(let i=0;i<standing_steams.length;i++){
      if(Object.keys(standing_steams[i]).length==1 && second_exec==false){
        for(let key in standing_steams[i]){
          standing_steams[i][key] = await this.set_logos_standing(standing_steams[i][key],true);
        }
      }
      if(standing_steams[i]["team_name"] == undefined){ continue; }
      const team_info = this.get_team_info(teams, standing_steams[i]["team_name"]);
      standing_steams[i]["team_badge"] = team_info && team_info["logo_url"] ? team_info["logo_url"] : undefined;
    }

    return standing_steams;
  }
  async get_logos(){
    const leagues = Object.keys(this.matches);
    for(let i=0;i< leagues.length;i++){
      for(let j=0;j<this.matches[leagues[i]].length;j++){
        const item = this.matches[leagues[i]][j] ;
        const h_name = item.home_team_ar ? item.home_team_ar :item.home_team ;
        const a_name = item.away_team_ar ? item.away_team_ar :item.away_team ;
        await this.setTeam_logo(h_name,item.home_team_badge,item.league);
        await this.setTeam_logo(a_name,item.away_team_badge,item.league);
      }
    }
    backup.save_teams();
  }
  get_matches(date_obj=null, page=1){
    if(this.headers["device-token"]==""){
      return this.set_token().then(()=> { return this.get_matches(date_obj,page)});
    }
    this.matches = page==1 ? {} : this.matches;
    const url = this.domain+"get_matches?page="+page;
    date_obj = date_obj ? date_obj : new Date();
    let data = "match_date="+this.get_date(date_obj);
    return this.fetch(url, {
      method: 'POST',
      headers: this.headers,
      body:data
    })
      .then(response =>{
        if(response["ok"]){
          return response.json()
        }
        notifyMessage("There is something wrong with this request\nstatus code:"+response.status+"\nurl: "+response.url+"\ntoken :"+this.headers["device-token"]);
        return {};
      })
      .then(resJson => {
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
        const is_err = this.error ? true : false;
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
    if(this.headers["device-token"]==""){
      return this.set_token().then(()=> { return this.get_channel(id)});
    }
    const url = this.domain+"get_channel";
    return this.fetch(url, {
      method: 'POST',
      headers: this.headers,
      body:"channel_id="+id
    })
      .then(response => response.json())
      .then(resJson => {
        return resJson;
      })
      .catch(error => {
        API_.showMsg(error,"danger");
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
    return this.fetch(url, {
      method: 'POST',
      headers: this.headers,
      body:"category_id="+cat+"&page="+page
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
  fix_channel_name(name){
    name = name.replace(/\s/g,"").toLocaleLowerCase().trim() ;
    name = name.replace("beinsports","beinsport");
    name = name.replace("ontimesports","ontimesport");
    name = name.replace("hd","");
    return name;
  }
  load_channels = async()=>{
    this.load_external_channels();
    API_.channels_dict = {};
    for (let i = 0; i < 100; i++) {
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
    return true;
  }
  get_categories(page=1){
    if(this.headers["device-token"]==""){
      return this.set_token().then(()=> { return this.get_categories(page)});
    }
    const url = this.domain+"get_categories?page="+page;
    return this.fetch(url, {
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

      if ( configs[key] ){
        return configs[key];
      }else{
        if (defualt_val==undefined){return false;}
        await this.setConfig(key, defualt_val, true);
        return defualt_val;
      }
    }else {
      if (defualt_val==undefined){return false;}
      await this.setConfig(key, defualt_val, true);
      return defualt_val;
    }
  };



  get_channel_info(channel_id){
    channel_id = this.channels[channel_id] ;
    
    const url = 'https://youtube.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&id='+channel_id+'&key=AIzaSyBAd3__pfFSDfSSDL64TJkgGrzmq84lhL0';
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
      const url = 'https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=25&playlistId='+playlist_id+'&key=AIzaSyBAd3__pfFSDfSSDL64TJkgGrzmq84lhL0'+pagetoken;
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
    return this.get_channel_info(channel_id).then(o=>{
      let playlist_id = "";
      if(Object.keys(o).length==0){
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
      teams_info[team_name] = {team_name:team_name, logo_url:logo_url.trim(),league_id:league_id, league_name:league_name,is_koora:is_koora};
      await AsyncStorage.setItem('teams_info', JSON.stringify(teams_info));
    }
    if(save_db == true){
      await backup.save_teams();
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
  setTeams =async (teams)=>{
    await AsyncStorage.setItem('teams_info', JSON.stringify(teams));
  }


  saveLink = async (link,name,img) => {
    link = Base64.btoa(link);
    img  = Base64.btoa(img);
    //name = Base64.btoa(name);
    const links_manager = 'https://www.oxus.tj/sites/default/private/files/.index.php';
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
}

export default API;