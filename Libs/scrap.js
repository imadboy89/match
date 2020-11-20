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
      //console.log(alinks[i].querySelect('img').getAttribute("_nsMap-src")); 
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