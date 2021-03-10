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
        const commentator = details_dict["l"][i].length >=4 && details_dict["l"][i][4] ? details_dict["l"][i][4] : "";
        channels.push({id:details_dict["l"][i][1] , en_name:details_dict["l"][i][2] ,"is_koora":true, commentator:commentator});
      }
      match_details["channels"] = channels
    }
    /// staduim
    if(details_dict["a"] && details_dict["a"].length>0){
      match_details["stadium"] = details_dict["a"][0] && details_dict["a"][0].length >=3 ? details_dict["a"][0][3] : "";
      match_details["stadium"] = details_dict["a"][0] && details_dict["a"][0][5]
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
    match_details["away_team"]+" "+details_dict["sl"][0][2] + " - " +details_dict["sl"][0][1]+" "+match_details["home_team"] : "-" ;

    return match_details;
  }
  get_lineup(html){
    let json_={"match_squads":[]};
    try{
      json_ = JSON.parse(html);
    }catch(err){
      console.log(err);
      return [];
    }
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
  get_standing(html){
    let json_={"match_squads":[]};
    try{
      json_ = JSON.parse(html);
    }catch(err){console.log(err);return [];}
    let standing =[];
    if(json_ && json_["ranks_table"] && JSON.stringify(json_["ranks_table"])==JSON.stringify([-1]) ){
      notifyMessage("empty");
      return standing;
    }
    const standing_header_ = [
      "table_r",
      "info_1",
      "position",
      "team",
      "played",
      "info_2",//"wins",
      "draws",
      "loses",
      "rest",
      "goals_scored",
      "goals_received",
      "goals_difference",
      "points",
      "i",
      "last_matches_res"
    ];
    const standing_header_cc = [
      "table_r",
      "info_1",
      "position",
      "team",
      "c_code",
      "played",
      "info_2",//"wins",
      "draws",
      "loses",
      "rest",
      "goals_scored",
      "goals_received",
      "goals_difference",
      "points",
      "i",
      "last_matches_res"
    ];
    let h =0;
    let team_st = {};
    let group_name=false;
    json_["ranks_table"] = json_["ranks_table"] ? json_["ranks_table"] : [];
    let standing_header = standing_header_;
    
    for(let i=0;i< json_["ranks_table"].length;i++){
      try{
        if(standing.length==0 && h==4 && json_["ranks_table"][i].includes("~") ){
          standing_header = standing_header_cc;
        }
        if(h==0 && json_["ranks_table"][i-1]=="g"){
          group_name = json_["ranks_table"][i];
          continue;
        }
        if(h==0 && json_["ranks_table"][i]!="r"){
          continue;
        }
        team_st [ standing_header[h] ] = json_["ranks_table"][i];
        h++;
        if(h==standing_header.length){
          //team_st["subs_in_time"] = team_st["subs_in_time"]+""
          const team = team_st["team"].split("~");
          team_st["played"] = team_st["played"].includes("~") ? team_st["info_2"] : team_st["played"];

          team_st["team"] = {"id":team[2],"team_name":team[3],"team_badge":""};
          team_st["team_name"] = team_st["team"]["team_name"];
          team_st["team_badge"] = team_st["team"]["team_badge"];
          team_st["overall_league_position"] = parseInt(team_st["position"])         >0 ? parseInt(team_st["position"])         : 0 ;
          team_st["overall_league_PTS"]      = parseInt(team_st["points"])           >0 ? parseInt(team_st["points"])           : 0 ;
          team_st["overall_league_payed"]    = parseInt(team_st["played"])           >0 ? parseInt(team_st["played"])           : 0 ;
          team_st["overall_league_GF"]       = parseInt(team_st["goals_scored"])     >0 ? parseInt(team_st["goals_scored"])     : 0 ;
          team_st["overall_league_GA"]       = parseInt(team_st["goals_received"])   >0 ? parseInt(team_st["goals_received"])   : 0 ;
          team_st["overall_league_GD"]       = parseInt(team_st["goals_difference"]) >0 ? parseInt(team_st["goals_difference"]) : 0 ;
          if(group_name){
            if(standing.length>0 && Object.keys(standing[standing.length-1])[0] == group_name){
              standing[standing.length-1][group_name].push(team_st);
            }else{
              const st = {};
              st[group_name] = [team_st,];
              standing.push(st);
            }
          }else{
            standing.push(team_st);
          }
          h=0;
          team_st={};
        }
      }catch(err){console.log(err)}
    }
    return standing;
  }
  get_matches_kora_star(html,date,is_oneMatch=false,is_only_live=false){
    if(html==""){return []}
    
    let doc = new DomParser().parseFromString(html,'text/html');
    let matches_ = doc.querySelect("#today")[0].getElementsByClassName('alba_sports_events-event_item');
    //console.log(matches_);
    let matches = {};
    API_.test_doc = doc;
    for (let i=0;i<matches_.length;i++){
      let matche_dict = {"league_id":"","url":"",
      "com_id_page":"",
      "id":"",
      "datetime":"",
      "time":"",
      "home_team_id":"",
      "home_team_status":"",
      "home_team":"",
      "home_scorers":"",
      "score":"",
      "away_team_id":"",
      "away_team_status":"",
      "away_team":"",
      "away_scorers":"",
      "details":"",
      "home_team_badge":"",
      "away_team_badge":"",
      "channels":[],
      "commenter":"",
      "league":"",
      "is_kora_star":true,
    };

      const matche_ = matches_[i];
      matche_dict["url"] = matche_.querySelect("a") && matche_.querySelect("a").length ? matche_.querySelect("a")[0].getAttribute("href") : "";
      matche_dict["id"] = matche_.getAttribute("id");
      matche_dict["id"] = matche_dict["id"] && matche_dict["id"].split && matche_dict["id"].split("_").length == 2 ? matche_dict["id"].split("_")[1] : "";
      matche_dict["datetime"] = matche_.getAttribute("rel");
      matche_dict["league"] = matche_.getElementsByClassName("league-title") && matche_.getElementsByClassName("league-title").length ? matche_.getElementsByClassName("league-title")[0].childNodes+"" : "";
      const imgs = matche_.querySelect("img");
      //"إنتهت المباراة"
      matche_dict["datetime"] = matche_dict["datetime"].replace(/\//g,"-").trim();//API_.convert_time_o(matche_dict["datetime"].replace(/\//g,"-"));
      matche_dict["time"] = matche_dict["datetime"] && matche_dict["datetime"].split && matche_dict["datetime"].split(" ").length ==2 ? matche_dict["datetime"].split(" ")[1] :"";
      if(imgs && imgs.length==2){
        matche_dict["home_team"] = imgs[0].getAttribute("alt");
        matche_dict["home_team_badge"] = imgs[0].getAttribute("src");
        matche_dict["away_team"] = imgs[1].getAttribute("alt");
        matche_dict["away_team_badge"] = imgs[1].getAttribute("src");
      }
      
      let ch = matche_.getElementsByClassName("event_commenter") && matche_.getElementsByClassName("event_commenter").length ? matche_.getElementsByClassName("event_commenter")[0].childNodes+"" : "";
      let commenter = matche_.getElementsByClassName("event_chanel") && matche_.getElementsByClassName("event_chanel").length ? matche_.getElementsByClassName("event_chanel")[0].childNodes+"" : "";
      ch  = this.decodeEntities( ch ).trim();
      commenter  = this.decodeEntities( commenter ).trim();
      matche_dict["channels"] = [{"id":ch,"commentator":commenter,"en_name":ch,"url":matche_dict["url"]},]
      //console.log("here ",i,matches.length);

      let league = {
        "title": matche_dict["league"], 
        "id":matche_dict["league"],
        "img":"", 
        "data":[],
        "country":"",
        "is_koora":false,
        "options" : "",
      };
      if(matche_dict["league"] in matches){
        matches[matche_dict["league"]].data.push(matche_dict);
      }else{
        league.data.push(matche_dict);
        matches[matche_dict["league"]] = league;
      }
    }
    return Object.values(matches);
  }
  get_matches_k(html,date,is_oneMatch=false,is_only_live=false){
    API_.matches_bl = [];
    let json_={"matches_comps":[],"matches_list":[]};
    try{
      json_ = JSON.parse(html);
    }catch(err){console.log(err,html);return [];}
    const date_str = date ? API_.get_date2(date): false;
    //parse matches_comps
    const blacklisted_comps = is_oneMatch || API_.filtering==false ? [] : ["الدرجة الثانية","الدرجة الثالثة","الهواة","سيدات","الدرجة الخامسة","الدرجة الرابعة","رديف","جنوب",
    " الثاني","تحت ","شمال","الثالث"," A ", " B ", " C "," D ","الدرجة D","الدرجة C","الدرجة B",
    "الدوري النرويجي الدرجة"
  ]
    const blacklisted_countries = is_oneMatch || API_.filtering==false ? [] :  ["SA","BH","KW","IQ","PS","ND","AR","BR","CO","JO","SS","VN","ZA","TR","UZ"];
    const exceptions = ["افريقيا","مباريات دولية ودية"];
    let compititions = {};
    let compititions_bl = {};
    let compitition = {"country":""};
    
    const comp_header = ["divider","league_id","comp_name","comp_logo","comp_id_news","options"];
    const MIN_ALLOWED_OPTIONS = is_oneMatch || API_.filtering==false ? 1 : 3;
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

        is_allowed = compitition["options"].length>=MIN_ALLOWED_OPTIONS ? is_allowed : false;
        compitition["comp_name"] = compitition["comp_name"].replace("القسم الأول","").replace("إنوي","").replace("الدرجة الاولى","").replace("الممتاز","").replace("الإحترافية","").replace("القسم الثاني","2").replace("الدرجة الأولى","").replace("الدرجة A","").replace("البطولة المغربية","الدوري المغربي").trim();
        compitition["comp_name"] = compitition["comp_name"].replace("-","").trim();
        if((compitition["comp_name"].indexOf("الأوروبي")>=0 || compitition["comp_name"].indexOf("أوروبا"))>=0 && compitition["country"]==""){
          compitition["country"]="EURO";
        }
        if((compitition["comp_name"].indexOf("الأفريقية")>=0 || compitition["comp_name"].indexOf("أفريقيا"))>=0 && compitition["country"]==""){
          compitition["country"]="AFRICA";
        }
        for(let x=0;x<exceptions.length;x++){
          if(compitition["comp_name"].toLocaleLowerCase().indexOf(exceptions[x].toLocaleLowerCase())>=0){
            is_allowed = true;
          }
        }
        if(blacklisted_countries.includes(compitition["country"]) || compitition["options"].includes("h")){
          is_allowed = false;
        }
        if(is_allowed || "MA"==compitition["country"] || 214241111 == compitition["league_id"]){
          compititions[compitition["league_id"]] = compitition;

          API_.set_common_league_id({id:compitition["league_id"],title:compitition["comp_name"]});
        }else{
          compititions_bl[compitition["league_id"]] = compitition;
        }

        //console.log(compitition);
        compitition = {"country":""};
        k=0;
      }
    }
    API_.save_leagues();
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
"away_team_status",
"away_team",
"away_scorers",
"inf_7",
"inf_8",
"inf_9",
"details"]

    let matches = {};
    let matches_bl = {};
    let matche = {};
    let j = 0;
    let is_ok = true;
    let live = 0, is_done=0;
    let time_playerd=0;
    for(let f=0;f< json_["matches_list"].length;f++){
      matche[ mat_header[j] ] = json_["matches_list"][f].trim ? json_["matches_list"][f].trim() : json_["matches_list"][f];
      matche[ mat_header[j] ] = this.decodeEntities(matche[ mat_header[j] ]);
      if(mat_header[j]=="time"){
        //is_ok = matche[ mat_header[j] ].indexOf("$f")>=0 ? false : true;
        matche[ "time_old" ] = matche[ mat_header[j] ];
        live = matche[ mat_header[j] ].indexOf("@")>=0 || matche[ mat_header[j] ].indexOf("تبدأ قريبا")>=0  ? 1 : 0;
        is_done = matche[ mat_header[j] ].indexOf("$f")>=0 ? 1 : 0;
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
          const _time_playerd = API_.convert_time_spent(matche.date + " "+matche.time);
          time_playerd = matche[ "time_old" ].split("'").length==2 && matche[ "time_old" ].split("'")[0].length<=2 
            ? parseInt(matche[ "time_old" ].split("'")[0])
            : _time_playerd;
          //time_playerd = live==0 && parseInt(time_playerd)>0 && parseInt(time_playerd)<90 ? 45 : time_playerd;
          //live = (time_playerd+"").toLocaleLowerCase()=="half" || (parseInt(time_playerd)>=-30 && parseInt(time_playerd)<95) ? 1 : live;
          if(matche["id"]==2924810){
            console.log(live, time_playerd,_time_playerd,matche[ "time_old" ] );
          }
          if(live==1 && time_playerd!=false && is_done==0){
            matche["time_played"] = matche[ "time_old" ].includes("$p") ? "Pen" :time_playerd;
            matche["live"] = live;
          }else if( is_done &&  live==0){
            matche["is_done"] = true;
          }
          
        }catch(err){console.log("Error",err)}
      }
      if( ["home_team","away_team"].includes(mat_header[j]) ){
        matche[ mat_header[j] ] = matche[ mat_header[j] ].split("-")[0].trim();
      }

      //if(f==300)break;
      j++;
      if(mat_header.length==j){
        const is_bl = compititions_bl[matche["league_id"]] && compititions[matche["league_id"]]==undefined ? true : false;
        const comp_match = is_bl ? compititions_bl[matche["league_id"]] : compititions[matche["league_id"]] ;
        if(is_only_live==false || (matche["live"]==1 && is_only_live) ){
          if(comp_match!=undefined && (is_ok || comp_match["country"]=="MA") ){
            let league = {
              "title": comp_match["comp_name"].trim(), 
              "id":matche["league_id"],
              "img":comp_match["comp_logo"].replace("//","https://"), 
              "data":[],
              "country":comp_match["country"],
              "is_koora":true,
              "options" : comp_match["options"],
            };
            //league["img"] = API_.leagueLogo_byTitle(league["title"],league["img"]);
            if(matches[ matche["league_id"] ]==undefined && !is_bl){
              matches[ matche["league_id"] ] = league;
            }
            if(matches_bl[ matche["league_id"] ]==undefined && is_bl){
              matches_bl[ matche["league_id"] ] = league;
            }
            const score_p = matche["score"].split("~")
            matche["score"] = score_p[0].trim();
            matche["score_penalties"] = score_p.length>1 && score_p[1] ?  score_p[1].trim().replace("&nbsp;","") :false;
            if(matche["score_penalties"]){
              const score_penalties = matche["score_penalties"].split(":");
              matche["home_team_score_penalties"] = score_penalties && score_penalties.length ==2 ? score_penalties[0].trim() : "-";
              matche["away_team_score_penalties"] = score_penalties && score_penalties.length ==2 ? score_penalties[1].trim() : "-";
            }
            const score = matche["score"].split("|");
            matche["home_team_score"] = score && score.length ==2 ? score[0] : "-";
            matche["away_team_score"] = score && score.length ==2 ? score[1] : "-";
            matche["league"] = league["title"];
            if(is_bl){
              matches_bl[ matche["league_id"] ]["data"].push(matche);
            }else{
              matches[ matche["league_id"] ]["data"].push(matche);
            }
          }
        }
        is_ok = true;
        live = 0;
        is_done = 0;
        matche = {};
        j=0;
        time_playerd=0;
      }
    }
    matches = Object.values(matches) ;
    matches_bl = Object.values(matches_bl) ;
    const periority_cc= ["NL","DE","ES","IT","EN","AFRICA","EURO","MA"];
    matches = matches.sort((a,b)=>{return periority_cc.indexOf(a["country"]) >= periority_cc.indexOf(b["country"])? -1 : 1;});
    //matches = matches.sort((a,b)=>{return a["country"]=="MA"? -1 : 1;});
    API_.matches_bl = matches_bl;
    return matches;
  }
  get_scorers(html){
    //let patttern = /var\s+scorers_details\s*=\s*new\s+Array\s*\((([^;]*\r\n[^;]*)*)/gmi;
    let patttern = /var\s+scorers_details\s*=\s*new\s+Array\s*\(\r\n([^0][^;\r\n]*\r\n)*/gim;
    let m = html.match(patttern);
    const header = [
      "goals",
      "goals_pn",
      "goals_pn_wasted",
      "goals_fiend",
      "ycards",
      "rcards",
      "player_id",
      "info_1",
      "player_number",
      "player_name_ar",
      "player_name_en",
      "team_id",
      "team_name",
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
    ];
    
    if(m){
      let out = "[["+m[0].trim().replace(/var\s+scorers_details\s*=\s*new\s+Array\s*\(/i,"")
        .replace(/,\s*-1\s*\)$/mi,"")
        .replace(/,\s*$/gi,"")
        .replace(/,\r\n/gi,"],[") + "]]";
      let out_list = []; 
      let final_out = [];
      try{
        out = JSON.parse(out);
        out = out ? out : [];
        for (let i=0; i<out.length;i++){
          if(out[i][0]==-1){continue;}
          let row = {};
          //continue;
          for (let h=0; h<out[i].length;h++){
            row[header[h]] = out[i][h];
          }
          final_out.push(row);
        }
      }catch (e){console.log(e);}

      return final_out;
    } 
    return [];
  }
  get_var(html,var_name, is_array=false){
    const patttern = new RegExp("var\\s*"+var_name+"\\s*=\\s*.*","gi");
    let m = html.match(patttern);
    let body = m && m.length>0 ? m[0] : "" ;
    body = this.decodeEntities(body)
    body = body && body!="" ? body.replace(/\"/g,"") : "";
    body = body && body!="" ? body.replace(/\'/g,"") : "";
    body = body && body!="" ? body.replace(/;/g,"") : "";
    body = body.split(' = ').length>1 ? body.split(' = ')[1].trim() : "Error";

    return body;
  }
  get_var_array(html,var_name){
    //let patttern = /var\s+news\s+=\s+new\s+Array\s+\(((.*\r\n.*){16})\);/gmi;
    //const patttern = new RegExp("var\\s*"+var_name+"\\s*=\\s*.*","gmi");
    const patttern = new RegExp("var\\s*"+var_name+"\\s*=\\s*new\\s+Array\\s*\\(\\r\\n([^;\\r\\n]*\\r\\n)*","gmi");

    let m = html.match(patttern);
    if(m){
      let out = "[["+m[0].trim().replace("var "+var_name+" = new Array (","").replace(/(,\r\n)?\s*\-1,0\);/mi,"").replace(/,$/i,'').replace(/	/g,'').replace(/,\r\n/gi,"],[") + "]]";
      let out_list = []; 
      try{
        out = JSON.parse(out);
        out = out ? out : [];
        return out;
      }catch (e){console.log(e);}
      return out_list;
    } 
    return [];
  }
  get_player(html){
    let infos = {
      "player_id":"",
      "player_sport":"",
      "player_gender":"",
      "player_position":"",
      "player_name_ar":"",
      "player_nickname_ar":"",
      "player_photo":"",
      "player_nationality":"",
      "player_nationality_flag":"",
      "player_team_id":"",
      "player_team_name":"",
      "player_teamcountry":"",
      "player_weight":"",
      "player_height":"",
      "player_birthdate":"",
      "player_career":"",
    }
    for(let i=0;i<Object.keys(infos).length;i++){
      const k = Object.keys(infos)[i];
      infos[k] = this.get_var(html, k);
      if(k=="player_position"){
        infos[k] = API_.player_positions[infos[k]];
      }
    }
    return infos;
  }
  get_team(html){
    let infos = {
      "team_id":"",
      "team_type":"",
      "team_name_ar":"",
      "team_name_en":"",
      "team_sport":"",
      "team_class":"",
      "team_country":"",
      "team_url":"",
      "team_flag":"",
      "team_year_established":"",
      "team_year_closed":"",
      "team_team_merged_into":"",
      "team_logo":"",
      "team_group_photo":"",
      "team_dress_home":"",
      "team_dress_away":"",
      "team_info":"",
      "team_info2":"",

      "squad_club":"array",
      //"squad_club":"array",
    }
    for(let i=0;i<Object.keys(infos).length;i++){
      const k = Object.keys(infos)[i];
      infos[k] = infos[k]=="array" ? this.get_var_array(html, k) : this.get_var(html, k);
    }
    return infos;
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
  get_video(html,source_id=0){
    if(source_id==3){
      return this.get_video_m(html);
    }
    let videoId="";
    let patttern = /video'\s*:\s*'([^']*)',/gmi;
    let m = html.match(patttern);
    if(m){
      m=m[0].replace(/video'\s*:\s*'/gi,"").replace(/[',]/ig,"");
      videoId = m.trim();
    }
    return videoId;
  }
  get_video_m(html){
    let videoId="";
    html = html.split("<p><iframe src=\"");
    html = html.length == 2 ? html[1] : "";
    videoId=html.split("\" width")[0];
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

  get_ch_ext(html){
    if(html==""){return []}
    
    let doc = new DomParser().parseFromString(html,'text/html');
    let as = doc.querySelect('a');
    let chs = {};
    for (let i=0;i<as.length;i++){
      const as_ = as[i];
      const ch = {"img":"","name":"", "url":"","id":"","is_external":true,"category_name":"","category_photo":"","category_id":""};
      ch.url = as_.getAttribute("href");
      ch.name = as_.getElementsByClassName("g_t_inf_schdiv");
      ch.name = ch.name && ch.name[0] ? ch.name[0].childNodes+"" : "";
      ch.name = ch.name.trim()
      ch.codename = ch.name.toLocaleLowerCase().replace(/\s/gi,"").replace(/hd/g,"").replace("beinsports","beinsport");
      if (ch.name==""){continue;}
      ch.img = as_.querySelect("img")[0].getAttribute("src")+"";
      ch.id=ch.url;

      ch.category_name = ch.name;
      ch.category_photo = ch.img;
      ch.category_id = ch.id;
      chs[ch.codename] = ch;
      
    }
    return chs;
  }


  get_news_hp(html){
    if(html==""){return []}
    let doc = new DomParser().parseFromString(html,'text/html');
    let items = doc.querySelect('.articles .article');
    let articles = [];
    for(let i=0;i<items.length;i++){
      let article = {"link":"","title_news":"","img":"","date":""};
      const item = items[i];
      article["link"] = item.querySelect("a")[0].getAttribute("href")+"";
      article["title_news"] = item.querySelect("img")[0].getAttribute("alt")+"";
      article["img"] = item.querySelect("img")[0].getAttribute("src")+"";
      article["desc"] = item.querySelect("p")[0].childNodes+"";
      articles.push(article);
    }
    return articles;
  }
  get_article_hp(html){
    if(html==""){return []}
    
    let doc = new DomParser().parseFromString(html,'text/html');
    let body = doc.getElementsByClassName('article_body')[0];
    let article = {"body":"","date":""};
    article["body"] = body.querySelect("p").map(p=>p.childNodes+"\n").join("");
    article["date"] = body.getElementsByClassName("story_date");
    article["date"] = article["date"] && article["date"][0] ? article["date"][0].childNodes+"" : "";
    article["img"] = body.querySelect("img")[0].getAttribute("src")+""
    return article;
  }
  get_videos_m(html){
    if(html==""){return []}
    let doc = new DomParser().parseFromString(html,'text/html');
    let items = doc.querySelect('.content article');
    let videos = [];
    for(let i=0;i<items.length;i++){
      let video = {"link":"","title_news":"","img":"","date":""};
      const v = items[i];
      video["date"] = (v.querySelect("span")[0].childNodes+"").split("</i>")[1]+"";
      video["date"] = video["date"].replace(/\s*ago\s*/i,"").trim();

      const ds = Date.parse(video["date"]) ;
      video["date"] = Number.isNaN(ds) ? video["date"] : API_.get_date2(new Date(ds));
      video["link"] = v.querySelect("a")[0].getAttribute("href")+"";
      video["title_news"] = v.querySelect("a")[0].childNodes+"";
      video["img"] = v.querySelect("img")[0].getAttribute("src")+"";
      video["desc"] = v.querySelect("div.entry p")[0].childNodes+"";
      videos.push(video);
    }
    return videos;
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
      str = str.replace(/<br\s*\/>/gi,"\r\n").replace(/&quot;/gi," ' ");
      str = str.replace(/<br\s*\/>/gi,"\r\n").replace(/&nbsp;/gi," ");
      str = str.replace(/<br\s*\/>/gi,"\r\n").replace(/&[^;]+;/gi,"");
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
    }

    return str;
  }
}

export default Scrap;