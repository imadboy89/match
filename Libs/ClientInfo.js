import DeviceInfo from 'react-native-device-info';

class ClientInfo {
    constructor() {
        this.getInfo().then(o=>{
            this.infos = o;
        });
    }

    getInfo = async()=>{
        let infos = {};
        infos.base_od            = await DeviceInfo.getBaseOs();
        infos.brand              = await DeviceInfo.getBrand();
        infos.device             = await DeviceInfo.getDevice();
        infos.device_id          = await DeviceInfo.getDeviceId();
        infos.device_name        = await DeviceInfo.getDeviceName();
        infos.mac_adress         = await DeviceInfo.getMacAddress();
        infos.build_id           = await DeviceInfo.getBuildId();
        infos.first_install_time = await DeviceInfo.getFirstInstallTime();
        infos.readable_version   = await DeviceInfo.getReadableVersion();
        infos.system_version     = await DeviceInfo.getSystemVersion();
        infos.unique_id          = await DeviceInfo.getUniqueId();
        infos.user_agent         = await DeviceInfo.getUserAgent();
        infos.navigator          = this.getinfoBrowser();
        infos.available_location_providers = await DeviceInfo.getAvailableLocationProviders();
        const _keys= Object.keys(infos);
        for(let i=0;i<_keys.length;i++){
            infos[_keys[i]] = infos[_keys[i]] == null ? "-" : infos[_keys[i]];
            infos[_keys[i]] = infos[_keys[i]].toLowerCase && ["unknown","unknown.unknown"].includes(infos[_keys[i]].toLowerCase()) ? "-" : infos[_keys[i]];
        }
        return infos;
    }

    getinfoBrowser(){
        if(navigator==undefined)return false;
        this.browser_infos = {};
        for(var p in navigator){
           try {
            if(typeof p != "string" || typeof navigator[p] != "string") continue;
            this.browser_infos[p] = navigator[p];
           }
           catch(e) {}
        }
        return this.browser_infos;
    }
}
export default ClientInfo ;