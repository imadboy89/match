class ScrollNav {
    constructor(flatListRef,_navigation) {
    this.flatListRef = flatListRef;
    this._navigation = _navigation;
    this.flatlist_offset = 0;
    this.screen_focus_mng();
    }
    unsubscribe=()=>{
      for(let i=0;i < this.subscribetions.length;i++){
        this.subscribetions[i]();
      }
    }
    screen_focus_mng=()=>{
      this.subscribetions=[];
      if(this._navigation){
        this.subscribetions.push(this._navigation.addListener('focus', () => {
          this.toggle_keys_listner(true);
        }));
        this.subscribetions.push(this._navigation.addListener('blur', () => {
          this.toggle_keys_listner(false);
        }));
        console.log(this.subscribetions);
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
    keysListnerFunction = (event)=>{
      if(API_.remote_controle){
        alert(`Prissed key -${event.keyCode}-`);
        if(event.keyCode==49 || event.keyCode==97){
          this.scrollUp();
        }else if(event.keyCode==50 || event.keyCode==98){
          this.scrollDown();
        }
  
      }
    }
    
    scrollUp = () => {
        console.log(this.flatListRef);
      if(this.flatListRef && this.flatListRef && this.flatListRef.scrollToOffset){
        this.flatlist_offset = this.flatlist_offset+200;
        //this.flatListRef.scrollToOffset({ animated: true, offset: this.flatlist_offset });
        this.flatListRef.scrollTo(this.flatlist_offset,0,true);
      }
    }
    scrollDown = () => {
      if(this.flatListRef && this.flatListRef && this.flatListRef.scrollToOffset){
        this.flatlist_offset = this.flatlist_offset>0 ? this.flatlist_offset-200 : this.flatlist_offset;
        //this.flatListRef.scrollToOffset({ animated: true, offset: this.flatlist_offset });
        this.flatListRef.scrollTo(this.flatlist_offset,0,true);
      }
    }
  }

  export default ScrollNav;