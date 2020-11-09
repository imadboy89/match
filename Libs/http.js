

class http {
    constructor() {

    }
    getStreamLink = async(link)=>{
        let res;
        try {
            res = await fetch(link, {method: 'GET',});
        } catch (error) {
            console.log("getStreamLink error ",error);
            return false;
        }
        const regex = new RegExp(/< *source +src=(\"|\')([^\"\']+)(\"|\')/ ,'i') ;
        //console.log(res, await res.text());
        const res_html = await res.text();
        
        const res_source = regex.exec(res_html);
        console.log(res_source);
        return res_source && res_source.length>2 ? res_source[2] : false;
    }
    
    fetch(link, method = 'GET', headers={} ){
        return fetch(link, {method: method, headers:headers}).then(res => { return res.text();}).catch(error => {console.log(error);this.error = error;});
    }
}  

export default http;