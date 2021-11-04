class ScrollNav {
  constructor(flatListRef,_navigation, label) {
    this.flatListRef = flatListRef;
    this._navigation = _navigation;
    this.flatlist_offset = 0;
    this.label = label ? label : "scroll1";
    console.log(this.label,"start");
    this.screen_focus_mng();
  }
  unsubscribe=()=>{
    for(let i=0;i < this.subscribetions.length;i++){
      console.log(this.label,"unsubscrib : "+i);
      this.subscribetions[i]();
    }
    this.toggle_keys_listner(false);
  }
  screen_focus_mng=()=>{
    this.subscribetions=[];
    if(this._navigation){
      this.toggle_keys_listner(true);
      this.subscribetions.push(this._navigation.addListener('focus', () => {
        this.toggle_keys_listner(true);
      }));
      this.subscribetions.push(this._navigation.addListener('blur', () => {
        this.toggle_keys_listner(false);
      }));
      console.log(this.label,this.subscribetions);
    }

  }
  toggle_keys_listner=(status)=>{
      console.log("toggle_keys_listner");
    if(API_.isWeb){
      if(status){
        document.addEventListener("keydown", this.keysListnerFunction, false);
      }else{
        document.removeEventListener("keydown", this.keysListnerFunction, false);
      }
    }
  }
  keysListnerFunction=(event)=>{
    if(API_.remote_controle){
      //alert(`Prissed key -${event.keyCode}-`);
      if(event.keyCode==49 || event.keyCode==97){
        this.scrollUp();
      }else if(event.keyCode==52 || event.keyCode==98){
        this.scrollDown();
      }

    }
  }
  scrolTo = ()=>{
    try {
      if(this.flatListRef && this.flatListRef.scrollToOffset){
        this.flatListRef.scrollToOffset({ animated: true, offset: this.flatlist_offset });
      }else if(this.flatListRef && this.flatListRef.scrollTo){
        this.flatListRef.scrollTo(this.flatlist_offset,0,true);
      }
    } catch (error) {
      console.log(this.label,error);
    }

  }
  scrollUp = ()=>{
    if(this.flatListRef && this.flatListRef){
      this.flatlist_offset = this.flatlist_offset+200;
      this.scrolTo();
    }
  }
  scrollDown = ()=>{
    if(this.flatListRef && this.flatListRef){
      this.flatlist_offset = this.flatlist_offset>0 ? this.flatlist_offset-200 : this.flatlist_offset;
      this.scrolTo();
    }
  }
}

export default ScrollNav;