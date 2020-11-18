//import DomSelector from 'react-native-html-parser';
//var DomParser = require('react-native-html-parser').DOMParser

class Scrap {
  constructor() {
    this.error = null;
    this.html="";
    this.isWeb = false;
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