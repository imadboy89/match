import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function is_expired(key, ttl=undefined){
    const exp_t = ttl ? ttl : 7*24*60*60*1000;
    let data2check = await AsyncStorage.getItem("expired_"+key);
    let date_stored = 0;
    if(data2check){
        date_stored = parseInt(data2check);
    }else{
        date_stored = (new Date()).getTime() - 5*24*60*60*1000;
        await AsyncStorage.setItem("expired_"+key,date_stored.toString());
    }
    const is_expired = (new Date()).getTime()- date_stored >= exp_t;
    if(is_expired){
      const time = (new Date()).getTime() ;
      await AsyncStorage.setItem("expired_"+key,time.toString());
    }
    return is_expired;
  }

async function storeReview(){
    try {
        const _is_expired = await is_expired("storeReview");
        if(_is_expired==false){
            return;
        }
        const isAvailable = await StoreReview.isAvailableAsync();
        if(isAvailable==false){ return false;}
        await StoreReview.requestReview();   
    } catch (error) {
        console.log(error);
    }

}

export default storeReview;