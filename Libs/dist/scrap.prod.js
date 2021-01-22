"use strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var a=0;a<t.length;a++){var r=t[a];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function _createClass(e,t,a){return t&&_defineProperties(e.prototype,t),a&&_defineProperties(e,a),e}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var DomParser=require("react-native-html-parser").DOMParser,Scrap=function(){function e(){_classCallCheck(this,e),this.error=null,this.html="",this.isWeb=!1,this.img_q="410w"}return _createClass(e,[{key:"get_article",value:function(e){var t=e.match(/var\s*article_content\s*=\s*".*/gi),a=1<(a=t&&0<t.length?t[0].replace(/\\"/g,"'"):"").split('"').length?a.split('"')[1]:"Error";return this.decodeEntities(a)}},{key:"parse_details",value:function(e){e=e.split("~");for(var t={},a=0;a<e.length;a++){var r=e[a].trim();0!=(r=r.split("|")).length&&(null==t[r[0]]?t[r[0]]=[r]:t[r[0]].push(r))}return t}},{key:"get_matche_k",value:function(e,t){var a=this.get_matches_k(e,t,!0),r=a&&1==a.length&&a[0].title?a[0].title:"",i=!(!a||1!=a.length||!a[0].data||1!=a[0].data.length)&&a[0].data[0];if(0==i)return[];var n=this.parse_details(i.details),l=this.parse_details(i.home_scorers),s=this.parse_details(i.away_scorers);if(n.l&&0<n.l.length){for(var o=[],_=0;_<n.l.length;_++){var c=4<=n.l[_].length&&n.l[_][4]?n.l[_][4]:"";o.push({id:n.l[_][1],en_name:n.l[_][2],is_koora:!0,commentator:c})}i.channels=o}n.a&&0<n.a.length&&(i.stadium=n.a[0]&&3<=n.a[0].length?n.a[0][3]:"",i.stadium=n.a[0]&&n.a[0][5]?n.a[0][5]+" | "+i.stadium:i.stadium),i.league=r;for(var p=[],u=["p","g","o"],m=0;m<u.length;m++){var g=u[m];if(l[g]&&0<l[g].length)for(var d=0;d<l[g].length;d++){var h={home_scorer:"",home_assist:"",away_scorer:"",away_assist:"",time:""};h.home_scorer=l[g][d][3],h.time=l[g][d][1],p.push(h)}if(s[g]&&0<s[g].length)for(var f=0;f<s[g].length;f++){var y={home_scorer:"",home_assist:"",away_scorer:"",away_assist:"",time:""};y.away_scorer=s[g][f][3],y.time=s[g][f][1],p.push(y)}}return i.goal_scorer=p,i.round=n.o&&0<n.o.length?"الجولة "+n.o[0][1]:"-",i.round="-"==i.round&&n.w&&0<n.w.length?"الأسبوع "+n.w[0][1]:i.round,i.phase=n.e&&0<n.e.length?n.e[0][2]:"-",i.group=n.sl&&0<n.sl.length?n.sl[0][1]:"-",i.retour_score=n.sl&&0<n.sl.length?n.sl[0][1]+" - "+n.sl[0][2]:"-",i}},{key:"get_lineup",value:function(e){var t={match_squads:[]};try{t=JSON.parse(e)}catch(e){return console.log(e),[]}var a={home_lineup:[],away_lineup:[],home_substitutions:[],away_substitutions:[]};if(t&&t.match_squads&&JSON.stringify(t.match_squads)==JSON.stringify([-1]))return console.log("empty"),a;var r=["team","player_key","lineup_position","lineup_number","lineup_player","player_is_subs","subs_in_time","subs_out_time","info_1","info_2","info_3","info_4","info_5","info_6","info_7","info_8","info_9","info_10","info_11","info_12","info_13","info_14","info_15","info_16","info_17"],i=0,n={};try{for(var l=0;l<t.match_squads.length;l++){n[r[i]]=t.match_squads[l],++i==r.length&&(n.subs_in_time=n.subs_in_time+"",n.time="-1"!=n.subs_in_time?n.subs_in_time:"",a[(1==n.team?"home_lineup":"away_lineup").replace("lineup","s"==n.player_is_subs?"lineup":"substitutions")].push(n),i=0,n={})}}catch(e){console.log(e)}return a}},{key:"get_standing",value:function(e){var t={match_squads:[]};try{t=JSON.parse(e)}catch(e){return console.log(e),[]}var a=[];if(t&&t.ranks_table&&JSON.stringify(t.ranks_table)==JSON.stringify([-1]))return notifyMessage("empty"),lineups;var r=["table_r","info_1","position","team","played","info_2","draws","loses","rest","goals_scored","goals_received","goals_difference","points","i","last_matches_res"],i=0,n={},l=!1;t.ranks_table=t.ranks_table?t.ranks_table:[];try{for(var s,o,_=0;_<t.ranks_table.length;_++){0!=i||"g"!=t.ranks_table[_-1]?0==i&&"r"!=t.ranks_table[_]||(n[r[i]]=t.ranks_table[_],++i==r.length&&(s=n.team.split("~"),n.played=n.played.includes("~")?n.info_2:n.played,n.team={id:s[2],team_name:s[3],team_badge:""},n.team_name=n.team.team_name,n.team_badge=n.team.team_badge,n.overall_league_position=0<parseInt(n.position)?parseInt(n.position):0,n.overall_league_PTS=0<parseInt(n.points)?parseInt(n.points):0,n.overall_league_payed=0<parseInt(n.played)?parseInt(n.played):0,n.overall_league_GF=0<parseInt(n.goals_scored)?parseInt(n.goals_scored):0,n.overall_league_GA=0<parseInt(n.goals_received)?parseInt(n.goals_received):0,n.overall_league_GD=0<parseInt(n.goals_difference)?parseInt(n.goals_difference):0,l?0<a.length&&Object.keys(a[a.length-1])[0]==l?a[a.length-1][l].push(n):((o={})[l]=[n],a.push(o)):a.push(n),i=0,n={})):l=t.ranks_table[_]}}catch(e){console.log(e)}return a}},{key:"get_matches_k",value:function(t,e,a,r){var i=2<arguments.length&&void 0!==a&&a,n=3<arguments.length&&void 0!==r&&r;API_.matches_bl=[];var l={matches_comps:[],matches_list:[]};try{l=JSON.parse(t)}catch(e){return console.log(e,t),[]}for(var s=!!e&&API_.get_date2(e),o=i||0==API_.filtering?[]:["الدرجة الثانية","الدرجة الثالثة","الهواة","سيدات","الدرجة الخامسة","الدرجة الرابعة","رديف","جنوب"," الثاني","تحت ","شمال","الثالث"," A "," B "," C "," D ","الدرجة D","الدرجة C","الدرجة B","الدوري النرويجي الدرجة"],_=i||0==API_.filtering?[]:["SA","BH","KW","IQ","PS","ND","AR","BR","CO","JO","SS","VN","ZA","TR","UZ"],c=["افريقيا","مباريات دولية ودية"],p={},u={},m={country:""},g=["divider","league_id","comp_name","comp_logo","comp_id_news","options"],d=i||0==API_.filtering?1:3,h=0,f=0;f<l.matches_comps.length;f++)if(m[g[h]]=l.matches_comps[f],"comp_logo"==g[h]&&m[g[h]].length<=3&&(m.country=m[g[h]],m[g[h]]="//o.kooora.com/f/"+m[g[h]]+".png"),g.length==++h){for(var y=!0,v=0;v<o.length;v++)0<=m.comp_name.toLocaleLowerCase().indexOf(o[v].toLocaleLowerCase())&&(y=!1);y=m.options.length>=d&&y,m.comp_name=m.comp_name.replace("القسم الأول","").replace("إنوي","").replace("الدرجة الاولى","").replace("الممتاز","").replace("الإحترافية","").replace("القسم الثاني","2").replace("الدرجة الأولى","").replace("الدرجة A","").replace("البطولة المغربية","الدوري المغربي").trim(),m.comp_name=m.comp_name.replace("-","").trim(),0<=(0<=m.comp_name.indexOf("الأوروبي")||m.comp_name.indexOf("أوروبا"))&&""==m.country&&(m.country="EURO"),0<=(0<=m.comp_name.indexOf("الأفريقية")||m.comp_name.indexOf("أفريقيا"))&&""==m.country&&(m.country="AFRICA");for(var b=0;b<c.length;b++)0<=m.comp_name.toLocaleLowerCase().indexOf(c[b].toLocaleLowerCase())&&(y=!0);(_.includes(m.country)||m.options.includes("h"))&&(y=!1),y||"MA"==m.country||214241111==m.league_id?(p[m.league_id]=m,API_.set_common_league_id({id:m.league_id,title:m.comp_name})):u[m.league_id]=m,m={country:""},h=0}API_.save_leagues();for(var w,k,S,A,O,I,q=["league_id","com_id_page","id_1","id","datetime","inf_1","time","home_team_id","home_team_status","home_team","home_scorers","score","away_team_id","away_team_status","away_team","away_scorers","inf_7","inf_8","inf_9","details"],N={},P={},x={},C=0,E=!0,D=0,J=0,L=0,R=0;R<l.matches_list.length;R++){if(x[q[C]]=l.matches_list[R].trim?l.matches_list[R].trim():l.matches_list[R],x[q[C]]=this.decodeEntities(x[q[C]]),"time"==q[C]){x.time_old=x[q[C]],D=0<=x[q[C]].indexOf("@")||0<=x[q[C]].indexOf("تبدأ قريبا")?1:0,J=0<=x[q[C]].indexOf("$f")?1:0,x[q[C]]=x[q[C]].replace(/[^0-9\:]/g,""),x[q[C]]=x[q[C]].slice(0,5);try{x.datetime=API_.get_date_time(new Date(1e3*x.datetime)),x.date=x.datetime.split(" ")[0],x.time=x.datetime.split(" ")[1],s&&s!=x.date&&(E=!1);var j=API_.convert_time_spent(x.date+" "+x.time),L=2==x.time_old.split("'").length&&x.time_old.split("'")[0].length<=2?parseInt(x.time_old.split("'")[0]):j;2924810==x.id&&console.log(D,L,j,x.time_old),1==D&&0!=L&&0==J?(x.time_played=x.time_old.includes("$p")?"Pen":L,x.live=D):J&&0==D&&(x.is_done=!0)}catch(e){console.log("Error",e)}}["home_team","away_team"].includes(q[C])&&(x[q[C]]=x[q[C]].split("-")[0].trim()),q.length==++C&&(k=(w=!(!u[x.league_id]||null!=p[x.league_id]))?u[x.league_id]:p[x.league_id],(0==n||1==x.live&&n)&&(null==k||!E&&"MA"!=k.country||(S={title:k.comp_name.trim(),id:x.league_id,img:k.comp_logo.replace("//","https://"),data:[],country:k.country,is_koora:!0,options:k.options},null!=N[x.league_id]||w||(N[x.league_id]=S),null==P[x.league_id]&&w&&(P[x.league_id]=S),A=x.score.split("~"),x.score=A[0].trim(),x.score_penalties=!!(1<A.length&&A[1])&&A[1].trim().replace("&nbsp;",""),x.score_penalties&&(O=x.score_penalties.split(":"),x.home_team_score_penalties=O&&2==O.length?O[0].trim():"-",x.away_team_score_penalties=O&&2==O.length?O[1].trim():"-"),I=x.score.split("|"),x.home_team_score=I&&2==I.length?I[0]:"-",x.away_team_score=I&&2==I.length?I[1]:"-",x.league=S.title,w?P[x.league_id].data.push(x):N[x.league_id].data.push(x))),E=!0,x={},L=C=J=D=0)}N=Object.values(N),P=Object.values(P);var F=["NL","DE","ES","IT","EN","AFRICA","EURO","MA"],N=N.sort(function(e,t){return F.indexOf(e.country)>=F.indexOf(t.country)?-1:1});return API_.matches_bl=P,N}},{key:"get_scorers",value:function(e){var t=e.match(/var\s+scorers_details\s*=\s*new\s+Array\s*\(\r\n([^0][^;\r\n]*\r\n)*/gim),a=["goals","goals_pn","goals_pn_wasted","goals_fiend","ycards","rcards","player_id","info_1","player_number","player_name_ar","player_name_en","team_id","team_name","info_2","info_3","info_4","info_5","info_6","info_7","info_8","info_9","info_10","info_11"];if(t){var r="[["+t[0].trim().replace(/var\s+scorers_details\s*=\s*new\s+Array\s*\(/i,"").replace(/,\s*-1\s*\)$/im,"").replace(/,\s*$/gi,"").replace(/,\r\n/gi,"],[")+"]]",i=[];try{r=(r=JSON.parse(r))||[];for(var n=0;n<r.length;n++)if(-1!=r[n][0]){for(var l={},s=0;s<r[n].length;s++)l[a[s]]=r[n][s];i.push(l)}}catch(e){console.log(e)}return i}return[]}},{key:"get_var",value:function(e,t,a){var r=new RegExp("var\\s*"+t+"\\s*=\\s*.*","gi"),i=e.match(r),n=i&&0<i.length?i[0]:"";return n=1<(n=(n=(n=n&&""!=n?n.replace(/\"/g,""):"")&&""!=n?n.replace(/\'/g,""):"")&&""!=n?n.replace(/;/g,""):"").split(" = ").length?n.split(" = ")[1].trim():"Error",this.decodeEntities(n)}},{key:"get_player",value:function(e){for(var t={player_id:"",player_sport:"",player_gender:"",player_position:"",player_name_ar:"",player_nickname_ar:"",player_photo:"",player_nationality:"",player_nationality_flag:"",player_team_id:"",player_team_name:"",player_teamcountry:"",player_weight:"",player_height:"",player_birthdate:"",player_career:""},a=0;a<Object.keys(t).length;a++){var r=Object.keys(t)[a];t[r]=this.get_var(e,r)}return t}},{key:"get_news",value:function(e){var t=e.match(/var\s+news\s+=\s+new\s+Array\s+\(((.*\r\n.*){16})\);/gim);if(t){var a="[["+t[0].trim().replace("var news = new Array (","").replace(/(,\r\n)?\s*\-1,0\);/im,"").replace(/,\r\n/gi,"],[")+"]]",r=[];try{a=(a=JSON.parse(a))||[];for(var i=0;i<a.length;i++){var n=a[i],l=0==this.isWeb?n[3].replace("//","https://"):n[3];r.push({link:n[1],date:n[2],img:l,title_news:n[4],desc:n[5]})}}catch(e){console.log(e)}return r}return[]}},{key:"get_video",value:function(e,t){if(3==(1<arguments.length&&void 0!==t?t:0))return this.get_video_m(e);var a="",r=e.match(/video'\s*:\s*'([^']*)',/gim);return r&&(a=(r=r[0].replace(/video'\s*:\s*'/gi,"").replace(/[',]/gi,"")).trim()),a}},{key:"get_video_m",value:function(e){return(e=2==(e=e.split('<p><iframe src="')).length?e[1]:"").split('" width')[0]}},{key:"get_lineup_old",value:function(e){if(""==e)return[];for(var t={home_lineup:[],away_lineup:[],home_substitutions:[],away_substitutions:[]},a=(new DomParser).parseFromString(e,"text/html").querySelect(".tLineup"),r=0;r<a.length;r++)for(var i=0==r?"home_lineup":"away_lineup",n=a[r].querySelect("tr"),l=0;l<n.length;l++){var s,o=n[l];o.querySelect("th")&&0<o.querySelect("th").length?0:((s={lineup_number:"",lineup_player:"",lineup_position:r,player_key:""}).lineup_player=o.querySelect("a").childNodes+"",s.lineup_number=o.querySelect("td")[0].childNodes+"",s.player_key=o.querySelect("a").getAttribute("href"),t[i].push(s))}return t}},{key:"get_videos_m",value:function(e){if(""==e)return[];for(var t=(new DomParser).parseFromString(e,"text/html").querySelect(".content article"),a=[],r=0;r<t.length;r++){var i={link:"",title_news:"",img:"",date:""},n=t[r];i.date=(n.querySelect("span")[0].childNodes+"").split("</i>")[1]+"",i.date=i.date.replace(/\s*ago\s*/i,"").trim();var l=Date.parse(i.date);i.date=Number.isNaN(l)?i.date:API_.get_date2(new Date(l)),i.link=n.querySelect("a")[0].getAttribute("href")+"",i.title_news=n.querySelect("a")[0].childNodes+"",i.img=n.querySelect("img")[0].getAttribute("src")+"",i.desc=n.querySelect("div.entry p")[0].childNodes+"",a.push(i)}return a}},{key:"get_videos",value:function(e){if(""==e)return[];for(var t=(new DomParser).parseFromString(e,"text/html").querySelect(".infinitescroll_item a"),a=[],r="",i=0;i<t.length;i++){var n={link:"",title_news:"",img:"",date:""};if(n.date=t[i].parentNode.parentNode.querySelect("span.time")[0].childNodes+"",n.link=t[i].getAttribute("href"),n.title_news=t[i].getAttribute("onclick").replace("dataLayer.push(","").replace(");","").replace(/'/g,'"'),n.title_news=JSON.parse(n.title_news).contentHeadline,n.link!=r){r=n.link;var l="";try{l=t[i].querySelect("img")+""}catch(e){l=""}var s=l.match(/data-srcset\s*=\s*"([^"]+)"/gi);if(s){s=s[0].replace(/data-srcset\s*=\s*/gi,"").replace(/"/gi,"").split(",");for(var o=0;o<s.length;o++){var _=s[o].trim().split(" ");if(2==_.length&&_[1]==this.img_q){n.img=_[0];break}n.img=s[3].trim().split(" ")[0]}}a.push(n)}}return a}},{key:"decodeEntities",value:function(e){return e&&"string"==typeof e&&(e=(e=(e=(e=(e=e.replace(/<br\s*\/>/gi,"\r\n").replace(/&quot;/gi," ' ")).replace(/<br\s*\/>/gi,"\r\n").replace(/&nbsp;/gi," ")).replace(/<br\s*\/>/gi,"\r\n").replace(/&[^;]+;/gi,"")).replace(/<script[^>]*>([\S\s]*?)<\/script>/gim,"")).replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gim,"")),e}}]),e}(),_default=Scrap;exports.default=Scrap;