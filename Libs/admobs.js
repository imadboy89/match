import { Platform } from 'react-native';
import { AdsConsent, AdsConsentStatus, InterstitialAd, BannerAd,BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const requestOptions = {
  keywords: ['health', 'berth','home',"family","text","fonts","sport","football","highlights"],
}

function is_test_ads(){
    return Platform.OS == "ios" || __DEV__;
}
function is_android(){
  return Platform.OS == "android";
}
async function Admob_init(){
  
  if (__DEV__){
    return ;
  }
  let _status = 0;
  const consentInfo = await AdsConsent.requestInfoUpdate();
  //alert("consentInfo.status:"+consentInfo.status);
  if(consentInfo.status==AdsConsentStatus.REQUIRED){
    const { status } = await AdsConsent.loadAndShowConsentFormIfRequired();
    _status = status;
    //alert("consentInfo.status:"+status);
  }
  return _status;

}
function Interstitial_load(){
  if (__DEV__){
    return ;
  }

  try {
      const adUnitId = get_adUnitId(false,true); 
      const interstitial = InterstitialAd.createForAdRequest(adUnitId, requestOptions);
      interstitial.load();
      return interstitial;

  } catch (error) {
    return ;
  }

    
}
function get_adUnitId(is_banner=false, is_inters=false){
    let adUnitId = false;
    if(__DEV__){
      if(is_banner){
        adUnitId = TestIds.BANNER;
      }else if(is_inters){
        adUnitId = TestIds.INTERSTITIAL;
      }
    }else{
      if(Platform.OS == "android"){
        if(is_banner){
          adUnitId = global.adUnitId_banner;
        }else if(is_inters){
          adUnitId = global.adUnitId_inters;
        }
      }else if(Platform.OS == "ios"){
        if(is_banner){
          adUnitId = global.adUnitId_banner_ios;
        }else if(is_inters){
          adUnitId = global.adUnitId_inters_ios;
        }
      }
    }
    return adUnitId;
}
function BannerAd2(){
  if (__DEV__){
    return null;
  }
  try {  
      const adUnitId = get_adUnitId(true);
      //console.log(adUnitId);
      //BannerAdSize.ANCHORED_ADAPTIVE_BANNER  INLINE_ADAPTIVE_BANNER
      return (
          <BannerAd
            unitId={adUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER }
            requestOptions={requestOptions}
          />
        );
  } catch (error) {
    return ;
  }

}


export {Interstitial_load, Admob_init, BannerAd2};