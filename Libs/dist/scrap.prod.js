"use strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var a=0;a<t.length;a++){var r=t[a];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function _createClass(e,t,a){return t&&_defineProperties(e.prototype,t),a&&_defineProperties(e,a),e}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var DomParser=require("react-native-html-parser").DOMParser,Scrap=function(){function e(){_classCallCheck(this,e),this.error=null,this.html="",this.isWeb=!1,this.img_q="410w"}return _createClass(e,[{key:"get_article",value:function(e){var t=e.match(/var\s*article_content\s*=\s*".*/gi),a=1<(a=t&&0<t.length?t[0].replace(/\\"/g,"'"):"").split('"').length?a.split('"')[1]:"Error";return this.decodeEntities(a)}},{key:"parse_details",value:function(e){e=e.split("~");for(var t={},a=0;a<e.length;a++){var r=e[a].trim();0!=(r=r.split("|")).length&&(null==t[r[0]]?t[r[0]]=[r]:t[r[0]].push(r))}return t}},{key:"get_matche_k",value:function(e,t){var a=this.get_matches_k(e,t,!0),r=a&&1==a.length&&a[0].title?a[0].title:"",i=!(!a||1!=a.length||!a[0].data||1!=a[0].data.length)&&a[0].data[0];if(0==i)return[];var s=this.parse_details(i.details),n=this.parse_details(i.home_scorers),l=this.parse_details(i.away_scorers);if(s.l&&0<s.l.length){for(var o=[],_=0;_<s.l.length;_++)o.push({id:s.l[_][1],en_name:s.l[_][2],is_koora:!0});i.channels=o}s.a&&0<s.a.length&&(i.stadium=s.a[0]&&3<=s.a[0].length?s.a[0][3]:"",i.stadium=s.a[0]&&s.a[0][5]?s.a[0][5]+" | "+i.stadium:i.stadium),i.league=r;for(var c=[],u=["p","g","o"],p=0;p<u.length;p++){var m=u[p];if(n[m]&&0<n[m].length)for(var g=0;g<n[m].length;g++){var h={home_scorer:"",home_assist:"",away_scorer:"",away_assist:"",time:""};h.home_scorer=n[m][g][3],h.time=n[m][g][1],c.push(h)}if(l[m]&&0<l[m].length)for(var d=0;d<l[m].length;d++){var f={home_scorer:"",home_assist:"",away_scorer:"",away_assist:"",time:""};f.away_scorer=l[m][d][3],f.time=l[m][d][1],c.push(f)}}return i.goal_scorer=c,i.round=s.o&&0<s.o.length?"الجولة "+s.o[0][1]:"-",i.round="-"==i.round&&s.w&&0<s.w.length?"الأسبوع "+s.w[0][1]:i.round,i.phase=s.e&&0<s.e.length?s.e[0][2]:"-",i.group=s.sl&&0<s.sl.length?s.sl[0][1]:"-",i.retour_score=s.sl&&0<s.sl.length?s.sl[0][1]+" - "+s.sl[0][2]:"-",i}},{key:"get_lineup",value:function(e){var t={match_squads:[]};try{t=JSON.parse(e)}catch(e){console.log(e)}var a={home_lineup:[],away_lineup:[],home_substitutions:[],away_substitutions:[]};if(t&&t.match_squads&&JSON.stringify(t.match_squads)==JSON.stringify([-1]))return console.log("empty"),a;var r=["team","player_key","lineup_position","lineup_number","lineup_player","player_is_subs","subs_in_time","subs_out_time","info_1","info_2","info_3","info_4","info_5","info_6","info_7","info_8","info_9","info_10","info_11","info_12","info_13","info_14","info_15","info_16","info_17"],i=0,s={};try{for(var n=0;n<t.match_squads.length;n++){s[r[i]]=t.match_squads[n],++i==r.length&&(s.subs_in_time=s.subs_in_time+"",s.time="-1"!=s.subs_in_time?s.subs_in_time:"",a[(1==s.team?"home_lineup":"away_lineup").replace("lineup","s"==s.player_is_subs?"lineup":"substitutions")].push(s),i=0,s={})}}catch(e){console.log(e)}return a}},{key:"get_standing",value:function(e){var t={match_squads:[]};try{t=JSON.parse(e)}catch(e){console.log(e)}var a=[];if(t&&t.ranks_table&&JSON.stringify(t.ranks_table)==JSON.stringify([-1]))return console.log("empty"),lineups;var r=["table_r","info_1","position","team","played","wins","draws","loses","rest","goals_scored","goals_received","goals_difference","points","i","last_matches_res"],i=0,s={};try{for(var n,l=0;l<t.ranks_table.length;l++){0==i&&"r"!=t.ranks_table[l]||(s[r[i]]=t.ranks_table[l],++i==r.length&&(n=s.team.split("~"),s.team={id:n[2],team_name:n[3],team_badge:""},s.team_name=s.team.team_name,s.team_badge=s.team.team_badge,s.overall_league_position=0<parseInt(s.position)?parseInt(s.position):0,s.overall_league_PTS=0<parseInt(s.points)?parseInt(s.points):0,s.overall_league_payed=0<parseInt(s.played)?parseInt(s.played):0,s.overall_league_GF=0<parseInt(s.goals_scored)?parseInt(s.goals_scored):0,s.overall_league_GA=0<parseInt(s.goals_received)?parseInt(s.goals_received):0,s.overall_league_GD=0<parseInt(s.goals_difference)?parseInt(s.goals_difference):0,a.push(s),i=0,s={}))}}catch(e){console.log(e)}return console.log(a),a}},{key:"get_matches_k",value:function(t,e,a,r){var i=2<arguments.length&&void 0!==a&&a,s=3<arguments.length&&void 0!==r&&r,n={matches_comps:[],matches_list:[]};try{n=JSON.parse(t)}catch(e){return console.log(e,t),[]}for(var l=!!e&&API_.get_date2(e),o=i?[]:["الدرجة الثانية","الدرجة الثالثة","الهواة","سيدات","الدرجة الخامسة","الدرجة الرابعة","رديف","جنوب"," الثاني","تحت ","شمال","الثالث"," A "," B "," C "," D ","الدرجة D","الدرجة C","الدرجة B","الدوري النرويجي الدرجة"],_=i?[]:["SA","BH","KW","IQ","PS","ND","AR","BR","CO","JO","SS","VN","ZA","TR","UZ"],c=["افريقيا"],u={},p={country:""},m=["divider","league_id","comp_name","comp_logo","comp_id_news","options"],g=i?1:3,h=0,d=0;d<n.matches_comps.length;d++)if(p[m[h]]=n.matches_comps[d],"comp_logo"==m[h]&&p[m[h]].length<=3&&(p.country=p[m[h]],p[m[h]]="//o.kooora.com/f/"+p[m[h]]+".png"),m.length==++h){for(var f=!0,y=0;y<o.length;y++)0<=p.comp_name.toLocaleLowerCase().indexOf(o[y].toLocaleLowerCase())&&(f=!1);f=p.options.length>=g&&f,p.comp_name=p.comp_name.replace("القسم الأول","").replace("إنوي","").replace("الدرجة الاولى","").replace("الممتاز","").replace("الإحترافية","").replace("القسم الثاني","2").replace("الدرجة الأولى","").replace("الدرجة A","").replace("البطولة المغربية","الدوري المغربي").trim(),p.comp_name=p.comp_name.replace("-","").trim(),0<=(0<=p.comp_name.indexOf("الأوروبي")||p.comp_name.indexOf("أوروبا"))&&""==p.country&&(p.country="EURO");for(var v=0;v<c.length;v++)0<=p.comp_name.toLocaleLowerCase().indexOf(c[v].toLocaleLowerCase())&&(f=!0);_.includes(p.country)&&(f=!1),!f&&"MA"!=p.country||(u[p.league_id]=p),p={country:""},h=0}for(var w,b,k,S=["league_id","com_id_page","id_1","id","datetime","inf_1","time","home_team_id","home_team_status","home_team","home_scorers","score","away_team_id","home_team_status","away_team","away_scorers","inf_7","inf_8","inf_9","details"],q={},N={},O=0,A=!0,I=0,P=0,C=0;C<n.matches_list.length;C++){if(N[S[O]]=n.matches_list[C].trim?n.matches_list[C].trim():n.matches_list[C],N[S[O]]=this.decodeEntities(N[S[O]]),"time"==S[O]){N.time_old=N[S[O]],I=0<=N[S[O]].indexOf("@")?1:0,N[S[O]]=N[S[O]].replace(/[^0-9\:]/g,""),N[S[O]]=N[S[O]].slice(0,5);try{N.datetime=API_.get_date_time(new Date(1e3*N.datetime)),N.date=N.datetime.split(" ")[0],N.time=N.datetime.split(" ")[1],l&&l!=N.date&&(A=!1);var x=API_.convert_time_spent(N.date+" "+N.time);1==(I="half"==((P=2==N.time_old.split("'").length&&N.time_old.split("'")[0].length<=2?parseInt(N.time_old.split("'")[0]):"half"==x&&"half")+"").toLocaleLowerCase()||-30<=parseInt(P)&&parseInt(P)<95?1:I)&&0!=P&&(N.time_played=P,N.live=I)}catch(e){console.log("Error",e)}}["home_team","away_team"].includes(S[O])&&(N[S[O]]=N[S[O]].split("-")[0].trim()),S.length==++O&&(25478821111==N.id&&console.log(N,P,I),w=u[N.league_id],(0==s||1==N.live&&s)&&(null==w||!A&&"MA"!=w.country||(b={title:w.comp_name.trim(),id:N.league_id,img:w.comp_logo.replace("//","https://"),data:[],country:w.country,is_koora:!0},API_.set_common_league_id(b),null==q[N.league_id]&&(q[N.league_id]=b),k=N.score.split("|"),N.home_team_score=k&&2==k.length?k[0]:"-",N.away_team_score=k&&2==k.length?k[1]:"-",N.league=b.title,N.is_koora=!0,q[N.league_id].data.push(N))),A=!0,N={},P=O=I=0)}q=Object.values(q);var L=["NL","ES","IT","EN","MA","EURO"];return q=q.sort(function(e,t){return L.indexOf(e.country)>L.indexOf(t.country)?-1:1})}},{key:"get_scorers",value:function(e){var t=e.match(/var\s+scorers_details\s*=\s*new\s+Array\s*\(\r\n([^0][^;\r\n]*\r\n)*/gim),a=["goals","goals_pn","goals_pn_wasted","goals_fiend","ycards","rcards","player_id","info_1","player_number","player_name_ar","player_name_en","team_id","team_name","info_2","info_3","info_4","info_5","info_6","info_7","info_8","info_9","info_10","info_11"];if(t){var r="[["+t[0].trim().replace(/var\s+scorers_details\s*=\s*new\s+Array\s*\(/i,"").replace(/,\s*-1\s*\)$/im,"").replace(/,\s*$/gi,"").replace(/,\r\n/gi,"],[")+"]]",i=[];try{r=(r=JSON.parse(r))||[];for(var s=0;s<r.length;s++)if(-1!=r[s][0]){for(var n={},l=0;l<r[s].length;l++)n[a[l]]=r[s][l];i.push(n)}}catch(e){console.log(e)}return i}return[]}},{key:"get_news",value:function(e){var t=e.match(/var\s+news\s+=\s+new\s+Array\s+\(((.*\r\n.*){16})\);/gim);if(t){var a="[["+t[0].trim().replace("var news = new Array (","").replace(/(,\r\n)?\s*\-1,0\);/im,"").replace(/,\r\n/gi,"],[")+"]]",r=[];try{a=(a=JSON.parse(a))||[];for(var i=0;i<a.length;i++){var s=a[i],n=0==this.isWeb?s[3].replace("//","https://"):s[3];r.push({link:s[1],date:s[2],img:n,title_news:s[4],desc:s[5]})}}catch(e){console.log(e)}return r}return[]}},{key:"get_video",value:function(e,t){if(3==(1<arguments.length&&void 0!==t?t:0))return this.get_video_m(e);var a="",r=e.match(/video'\s*:\s*'([^']*)',/gim);return r&&(a=(r=r[0].replace(/video'\s*:\s*'/gi,"").replace(/[',]/gi,"")).trim()),a}},{key:"get_video_m",value:function(e){console.log("hh");var t;return e=e.split('<p><iframe src="'),console.log(e.length),e=2==e.length?e[1]:"",console.log(e.length),t=e.split('" width')[0],console.log(t),t}},{key:"get_lineup_old",value:function(e){if(""==e)return[];for(var t={home_lineup:[],away_lineup:[],home_substitutions:[],away_substitutions:[]},a=(new DomParser).parseFromString(e,"text/html").querySelect(".tLineup"),r=0;r<a.length;r++)for(var i=0==r?"home_lineup":"away_lineup",s=a[r].querySelect("tr"),n=0;n<s.length;n++){var l,o=s[n];o.querySelect("th")&&0<o.querySelect("th").length?0:((l={lineup_number:"",lineup_player:"",lineup_position:r,player_key:""}).lineup_player=o.querySelect("a").childNodes+"",l.lineup_number=o.querySelect("td")[0].childNodes+"",l.player_key=o.querySelect("a").getAttribute("href"),t[i].push(l))}return t}},{key:"get_videos_m",value:function(e){if(""==e)return[];for(var t=(new DomParser).parseFromString(e,"text/html").querySelect(".content article"),a=[],r=0;r<t.length;r++){var i={link:"",title_news:"",img:"",date:""},s=t[r];i.date=(s.querySelect("span")[0].childNodes+"").split("</i>")[1]+"",i.date=i.date.replace(/\s*ago\s*/i,"").trim();var n=Date.parse(i.date);i.date=Number.isNaN(n)?i.date:API_.get_date2(new Date(n)),i.link=s.querySelect("a")[0].getAttribute("href")+"",i.title_news=s.querySelect("a")[0].childNodes+"",i.img=s.querySelect("img")[0].getAttribute("src")+"",i.desc=s.querySelect("div.entry p")[0].childNodes+"",a.push(i)}return console.log(a),a}},{key:"get_videos",value:function(e){if(""==e)return[];for(var t=(new DomParser).parseFromString(e,"text/html").querySelect(".infinitescroll_item a"),a=[],r="",i=0;i<t.length;i++){var s={link:"",title_news:"",img:"",date:""};if(s.date=t[i].parentNode.parentNode.querySelect("span.time")[0].childNodes+"",s.link=t[i].getAttribute("href"),s.title_news=t[i].getAttribute("onclick").replace("dataLayer.push(","").replace(");","").replace(/'/g,'"'),s.title_news=JSON.parse(s.title_news).contentHeadline,s.link!=r){r=s.link;var n="";try{n=t[i].querySelect("img")+""}catch(e){n=""}var l=n.match(/data-srcset\s*=\s*"([^"]+)"/gi);if(l){l=l[0].replace(/data-srcset\s*=\s*/gi,"").replace(/"/gi,"").split(",");for(var o=0;o<l.length;o++){var _=l[o].trim().split(" ");if(2==_.length&&_[1]==this.img_q){s.img=_[0];break}s.img=l[3].trim().split(" ")[0]}}a.push(s)}}return a}},{key:"decodeEntities",value:function(e){return e&&"string"==typeof e&&(e=(e=(e=e.replace(/<br\s*\/>/gi,"\r\n").replace(/&[^;]+;/gi,"")).replace(/<script[^>]*>([\S\s]*?)<\/script>/gim,"")).replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gim,"")),e}}]),e}(),_default=Scrap;exports.default=Scrap;