//import DomSelector from 'react-native-html-parser';
var DomParser = require('react-native-html-parser').DOMParser


class Scrap {
  constructor() {
    this.error = null;
    this.html="";
    this.isWeb = false;
    this.img_q = "410w";
  }
  get_article(html){
    let patttern_body = /var\s*article_content\s*=\s*".*/gi;
    let m = html.match(patttern_body);
    let body = m && m.length>0 ? m[0].replace(/\\"/g,"'") : "";
    body = body.split('"').length>1 ? body.split('"')[1] : "Error";
    //body = body.replace("<p");
    return this.decodeEntities(body);
  }
  parse_details(details){
    details = details.split("~");
    let details_dict = {};
    for (let i=0;i<details.length;i++){
      let el = details[i].trim();
      el = el.split("|");
      if(el.length==0){continue}

      if(details_dict[el[0]] ==undefined){
        details_dict[el[0]] = [el,];
      }else{
        details_dict[el[0]].push(el);
        /*
        if(typeof details_dict[el[0]][0] == "object"){
          details_dict[el[0]].push(el);
        }else{
          details_dict[el[0]] = [details_dict[el[0]],el];
        }*/
      }
    }
    return details_dict;
  }
  get_matche_k(resp,date){
    
    let matche_dets = this.get_matches_k(resp,date,true);
    const league_name = matche_dets && matche_dets.length==1 && matche_dets[0]["title"] ? matche_dets[0]["title"] :"";
    let match_details = matche_dets && matche_dets.length==1 && matche_dets[0]["data"] && matche_dets[0]["data"].length==1 ? matche_dets[0]["data"][0] : false;
    if(match_details==false){return [];}
    let details_dict = this.parse_details(match_details['details']);
    let home_players_events_dict = this.parse_details(match_details['home_scorers']);
    let away_players_events_dict = this.parse_details(match_details['away_scorers']);
    /// chanels
    if(details_dict["l"] && details_dict["l"].length>0){
      let channels = [];
      for(let i=0; i<details_dict["l"].length;i++){
        channels.push({id:details_dict["l"][i][1] , en_name:details_dict["l"][i][2] ,"is_koora":true});
      }
      match_details["channels"] = channels
    }
    /// staduim
    if(details_dict["a"] && details_dict["a"].length>0){
      match_details["stadium"] = details_dict["a"][0] && details_dict["a"][0].length >=3 ? details_dict["a"][0][3] : "";
      match_details["stadium"] = details_dict["a"][0] && details_dict["a"][0].length >=5 
      ? details_dict["a"][0][5]+" | "+match_details["stadium"] : match_details["stadium"];
    }
    // league name
    match_details["league"] = league_name;
    // scorers
    let scorers = [];
    const goal_keys = ["p","g","o"] ;
    for(let k=0;k<goal_keys.length;k++){
      const key_ = goal_keys[k];
      if(home_players_events_dict[key_] && home_players_events_dict[key_].length>0){
        for(let i=0;i< home_players_events_dict[key_].length;i++){
          let scorer = {"home_scorer":"","home_assist":"","away_scorer":"","away_assist":"","time":""};
          scorer["home_scorer"] = home_players_events_dict[key_][i][3];
          scorer["time"] = home_players_events_dict[key_][i][1];
          scorers.push(scorer);
        }
      }
      if(away_players_events_dict[key_] && away_players_events_dict[key_].length>0){
        for(let i=0;i< away_players_events_dict[key_].length;i++){
          let scorer = {"home_scorer":"","home_assist":"","away_scorer":"","away_assist":"","time":""};
          scorer["away_scorer"] = away_players_events_dict[key_][i][3];
          scorer["time"] = away_players_events_dict[key_][i][1];
          scorers.push(scorer);
        }
      }
    }
    match_details["goal_scorer"] = scorers;
    match_details["round"] = details_dict["o"] && details_dict["o"].length>0 ? "الجولة "+details_dict["o"][0][1] : "-" ;
    match_details["round"] = match_details["round"]=="-" && details_dict["w"] && details_dict["w"].length>0 ? "الأسبوع "+details_dict["w"][0][1] : match_details["round"] ;
    match_details["phase"] = details_dict["e"] && details_dict["e"].length>0 ? details_dict["e"][0][2] : "-" ;
    match_details["group"] = details_dict["sl"] && details_dict["sl"].length>0 ? details_dict["sl"][0][1] : "-" ;

    match_details["retour_score"] = details_dict["sl"] && details_dict["sl"].length>0 ? 
      details_dict["sl"][0][1] + " - " +details_dict["sl"][0][2] : "-" ;

    return match_details;
  }
  get_lineup(html){
    let json_={"match_squads":[]};
    try{
      json_ = JSON.parse(html);
    }catch(err){console.log(err);}
    let lineups = {"home_lineup":[],"away_lineup":[],"home_substitutions":[],"away_substitutions":[]};
    if(json_ && json_["match_squads"] && JSON.stringify(json_["match_squads"])==JSON.stringify([-1]) ){
      console.log("empty");
      return lineups;
    }
    const lineup_header = [
                          "team",
                          "player_key",
                          "lineup_position",
                          "lineup_number",
                          "lineup_player",
                          "player_is_subs",
                          "subs_in_time",
                          "subs_out_time",
                          "info_1",
                          "info_2",
                          "info_3",
                          "info_4",
                          "info_5",
                          "info_6",
                          "info_7",
                          "info_8",
                          "info_9",
                          "info_10",
                          "info_11",
                          "info_12",
                          "info_13",
                          "info_14",
                          "info_15",
                          "info_16",
                          "info_17",]
    let h =0;
    let player = {};
    try{
    for(let i=0;i< json_["match_squads"].length;i++){
      player [ lineup_header[h] ] = json_["match_squads"][i];
      h++;
      if(h==lineup_header.length){
        player["subs_in_time"] = player["subs_in_time"]+""
        player["time"] = player["subs_in_time"]!="-1" ? player["subs_in_time"] : "";
        let type = player["team"]==1 ? "home_lineup" : "away_lineup";
        type = type.replace("lineup", player["player_is_subs"]=="s" ? "lineup" : "substitutions");
        lineups[type].push(player);
        h=0;
        player={};
      }
      
    }
    }catch(err){console.log(err)}
    return lineups;
  }
  get_matches_k(html,date,is_oneMatch=false){
    let json_={"matches_comps":[],"matches_list":[]};
    try{
      json_ = JSON.parse(html);
    }catch(err){console.log(err);}
    const date_str = date ? API_.get_date2(date): false;
    //parse matches_comps
    const blacklisted_comps = is_oneMatch ? [] : ["الدرجة الثانية","الدرجة الثالثة","الهواة","سيدات","الدرجة الخامسة","الدرجة الرابعة","رديف","جنوب"," الثاني","تحت ","شمال","الثالث"," A ", " B "]
    const blacklisted_countries = is_oneMatch ? [] :  ["SA","BH","KW","IQ","PS","TR","ND","AR","BR","CO","JO","SS","VN"];
    let compititions = {};
    let compitition = {"country":""};
    const comp_header = ["divider","league_id","comp_name","comp_logo","comp_id_news","options"];
    const MIN_ALLOWED_OPTIONS = is_oneMatch ? 1 : 3;
    let k = 0;
    for(let i=0;i< json_["matches_comps"].length;i++){
      compitition[ comp_header[k] ] = json_["matches_comps"][i];
      if(comp_header[k]=="comp_logo" && compitition[ comp_header[k] ].length<=3){
        compitition[ "country" ] = compitition[ comp_header[k] ];
        compitition[ comp_header[k] ] = "//o.kooora.com/f/"+compitition[ comp_header[k] ]+".png";
      }
      //o.kooora.com/f/QA.png
      k++;
      if(comp_header.length==k){
        let is_allowed = true;
        for(let x=0;x<blacklisted_comps.length;x++){
          if(compitition["comp_name"].toLocaleLowerCase().indexOf(blacklisted_comps[x].toLocaleLowerCase())>=0){
            is_allowed = false;
          }
        }
        if(blacklisted_countries.includes(compitition["country"])){
          is_allowed = false;
        }
        is_allowed = compitition["options"].length>=MIN_ALLOWED_OPTIONS ? is_allowed : false;
        compitition["comp_name"] = compitition["comp_name"].replace("القسم الأول","").replace("إنوي","").replace("الدرجة الاولى","").replace("الممتاز","").replace("الإحترافية","").replace("القسم الثاني","2").replace("الدرجة الأولى","1").trim();
        compitition["comp_name"] = compitition["comp_name"].replace("-","").trim();
        if((compitition["comp_name"].indexOf("الأوروبي")>=0 || compitition["comp_name"].indexOf("أوروبا"))>=0 && compitition["country"]==""){
          compitition["country"]="EURO";
        }
        if(is_allowed || "MA"==compitition["country"]){
          compititions[compitition["league_id"]] = compitition;
        }
        //console.log(compitition);
        compitition = {"country":""};
        k=0;
      }
    }
    // parse matches_list
    const mat_header = ["league_id",
"com_id_page",
"id_1",
"id",
"datetime",
"inf_1",
"time",
"home_team_id",
"home_team_status",
"home_team",
"home_scorers",
"score",
"away_team_id",
"home_team_status",
"away_team",
"away_scorers",
"inf_7",
"inf_8",
"inf_9",
"details"]

    let matches = {};
    let matche = {};
    let j = 0;
    let is_ok = true;
    let live = 0;
    for(let f=0;f< json_["matches_list"].length;f++){
      matche[ mat_header[j] ] = json_["matches_list"][f].trim ? json_["matches_list"][f].trim() : json_["matches_list"][f];
      matche[ mat_header[j] ] = this.decodeEntities(matche[ mat_header[j] ]);
      if(mat_header[j]=="time"){
        
        //is_ok = matche[ mat_header[j] ].indexOf("$f")>=0 ? false : true;
        live = matche[ mat_header[j] ].indexOf("@")>=0 ? 1 : 0;
        matche[ mat_header[j] ] = matche[ mat_header[j] ].replace(/[^0-9\:]/g,"");
        matche[ mat_header[j] ] = matche[ mat_header[j] ].slice(0,5)//API_.convert_time(matche[ mat_header[j] ].slice(0,5),+1);
        try{
          matche.datetime = API_.get_date_time(new Date(matche.datetime*1000));
          matche[ "date" ]= matche.datetime.split(" ")[0];
          matche[ "time" ]= matche.datetime.split(" ")[1];
          //matche[ "time" ]= API_.convert_time(matche[ "time" ],+1);
          if(date_str && date_str != matche[ "date" ]){
            is_ok = false;
          }
          const time_playerd = live ? API_.convert_time_spent(matche.date + " "+matche.time) : "";
          if(live==1 && time_playerd>0){
            matche["time_played"] = time_playerd;
            matche["live"] = live;
          }

        }catch(err){console.log("Error",err)}
      }
      if( ["home_team","away_team"].includes(mat_header[j]) ){
        matche[ mat_header[j] ] = matche[ mat_header[j] ].split("-")[0].trim();
      }

      //if(f==300)break;
      j++;
      if(mat_header.length==j){
        const comp_match = compititions[matche["league_id"]] ;
        if(comp_match!=undefined && (is_ok || comp_match["country"]=="MA") ){
          let league = {"title": comp_match["comp_name"].trim(), "id":matche["league_id"],"img":comp_match["comp_logo"].replace("//","https://"), "data":[],"country":comp_match["country"]};
          if(matches[ matche["league_id"] ]==undefined){
            matches[ matche["league_id"] ] = league;
          }
          const score = matche["score"].split("|");
          matche["home_team_score"] = score && score.length ==2 ? score[0] : "-";
          matche["away_team_score"] = score && score.length ==2 ? score[1] : "-";
          matches[ matche["league_id"] ]["data"].push(matche);
        }
        is_ok = true;
        live = 0;
        matche = {};
        j=0;
      }
    }
    matches = Object.values(matches) ;
    const periority_cc= ["NL","ES","IT","EN","MA","EURO"];
    matches = matches.sort((a,b)=>{return periority_cc.indexOf(a["country"]) > periority_cc.indexOf(b["country"])? -1 : 1;});
    //matches = matches.sort((a,b)=>{return a["country"]=="MA"? -1 : 1;});
    return matches;
  }
  get_news(html){
    let patttern = /var\s+news\s+=\s+new\s+Array\s+\(((.*\r\n.*){16})\);/gmi;
    let m = html.match(patttern);
    if(m){
      let out = "[["+m[0].trim().replace("var news = new Array (","").replace(/(,\r\n)?\s*\-1,0\);/mi,"").replace(/,\r\n/gi,"],[") + "]]";
      let out_list = []; 
      try{
        out = JSON.parse(out);
        out = out ? out : [];
        for (let i=0; i<out.length;i++){
          let line = out[i];
          
          let img = this.isWeb==false ? line[3].replace("//","https://") : line[3];
          out_list.push({link:line[1], date:line[2], img:img, title_news:line[4], desc:line[5],});
        }
      }catch (e){console.log(e);}
      return out_list;
    } 
    return [];
  }
  get_video(html){
    let videoId="";
    let patttern = /video'\s*:\s*'([^']*)',/gmi;
    let m = html.match(patttern);
    if(m){
      m=m[0].replace(/video'\s*:\s*'/gi,"").replace(/[',]/ig,"");
      videoId = m.trim();
    }
    return videoId;
  }
  get_lineup_old(html){
    if(html==""){return []}
    let lineups = {"home_lineup":[],"away_lineup":[],"home_substitutions":[],"away_substitutions":[]};
    let doc = new DomParser().parseFromString(html,'text/html');
    let tlineups = doc.querySelect('.tLineup');
    for (let i=0;i<tlineups.length;i++){
      const key = i==0?"home_lineup":"away_lineup";
      const tr_s = tlineups[i].querySelect("tr");
      for(let k=0;k<tr_s.length;k++){
        const tr = tr_s[k];
        if(tr.querySelect("th") && tr.querySelect("th").length>0){
          const key = i==0?"home_substitutions":"away_substitutions";
          continue;
        }
        let player = {lineup_number:"",lineup_player:"",lineup_position:i,player_key:""};
        player["lineup_player"] = tr.querySelect("a").childNodes+"";
        player["lineup_number"] = tr.querySelect("td")[0].childNodes+"";
        player["player_key"]   = tr.querySelect("a").getAttribute("href");
        lineups[key].push(player);
      }
    }
    return lineups;
  }

  get_videos(html){
    if(html==""){return []}
    //console.log("-",html)
    let doc = new DomParser().parseFromString(html,'text/html');
    let alinks = doc.querySelect('.infinitescroll_item a')
    //console.log(d[0].getAttribute("href") )
    let videos = [];
    let lastlink = "";
    for (let i=0;i<alinks.length;i++){
      let video = {"link":"","title_news":"","img":"","date":""};
      video["date"] = alinks[i].parentNode.parentNode.querySelect("span.time")[0].childNodes+"";
      video["link"] = alinks[i].getAttribute("href");
      video["title_news"] = alinks[i].getAttribute("onclick").replace("dataLayer.push(","").replace(");","").replace(/'/g,'"');
      video["title_news"] = JSON.parse(video["title_news"])["contentHeadline"];
      if(video["link"]==lastlink){continue;}
      lastlink = video["link"];
      let str_img = "";
      try{str_img=alinks[i].querySelect("img")+""}catch(e){str_img=""}
      let patttern = /data-srcset\s*=\s*"([^"]+)"/gi;
      let m = str_img.match(patttern);
      if(m){
        m = m[0].replace(/data-srcset\s*=\s*/gi,"").replace(/"/gi,"").split(",");
        for (let k=0;k<m.length;k++){
          let img_l = m[k].trim().split(" ");
          
          if(img_l.length==2 && img_l[1]==this.img_q){
            video["img"] = img_l[0];
            break;
          }
          video["img"] = m[3].trim().split(" ")[0]; 
        }
      }
      videos.push(video);
    }
    return videos;
  }
  decodeEntities(str) {
    if(str && typeof str === 'string') {
      // strip script/html tags
      str = str.replace(/<br\s*\/>/gi,"\r\n").replace(/&[^;]+;/gi,"");
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
    }

    return str;
  }
}

export default Scrap;