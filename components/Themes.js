import {  StyleSheet, Dimensions} from 'react-native';


function _isMobile(isWeb){
  var isMobile = true;
  if(isWeb==false){
    return isMobile;
  }
  isMobile = (/iphone|ipod|android|ie|blackberry|fennec/i).test(navigator.userAgent);
  return isMobile;
}

function getTheme(style_name=false){
  //var API_ = new API();
  return API_.getConfig("theme",Global_theme_name).then(theme_name__=>{
    if(Themes[theme_name__] == undefined){
      theme_name__ = Global_theme_name;
    }
    Global_theme_name = theme_name__;
    
    return generateTheme(theme_name__)[style_name];
  });
}
function getThemes(theme_name=false){
  //var API_ = new API();
  return API_.getConfig("theme",Global_theme_name).then(theme_name__=>{
    console.log(theme_name__,theme_name)
    return Themes[theme_name__];
  });
}
var Themes = {
    "dark violet":{
        //headerStyle:
      headerStyle_backgroundColor: '#130f40',
      headerTintColor: '#fff',
      activeBackgroundColor: '#30336b',
      inactiveBackgroundColor: '#130f40',
      activeTintColor: '#ffffff',
      inactiveTintColor: '#57606f',
  
      background_color_default : "#000",
      home_title_color : "#d1d8e0",
      alert_body_backgroundColor : "#686de0",
      alert_body_color : "#dff9fb",

      fav_background : "#0093fb4a",

      text_color_default : "#fff",

      list_header_backgroundColor: "#a29bfe",
      live_borderColor:"#2ecc71",
      match_name_backgroundColor: "#4834d4",
      match_name_color: "#d1d8e0",
      match_score_backgroundColor: "#a5b1c2",
      match_score_color :"#d1d8e0",
      match_time_backgroundColor:"#2c3e50",
      match_time_color:"#fff",


      match_badge_backgroundColor: "#4834d4",
  
      news_cont_backgroundColor:"#34495e",
      news_title_backgroundColor:"#00000091",
      news_title_color:"#fff",
  
      article_body_backgroundColor:"#293542d6",
      article_body_color : "#fff",
      article_title_backgroundColor:"#323350d6",
      article_title_color : "#fff",
      article_date_color : "#fff",
      article_photo_background : "#000",

      match_lineup2_color : "#d1d8e0",
      match_lineup2_number_color : "#f1c40f",
      match_linup_team_backgroundColor:"#dae6fd",
      match_linup_team__backgroundColor:"#97d1f9",
      match_stats_color : "#d1d8e0",
      match_lineup_player_color:"#000",
      match_text_info_color : "#d1d8e0",
      match_results_team_scor_color : "#f1c40f",
      match_results_winer_background  : "#16a085",
      match_results_loser_background  : "#c0392b",
      match_results_drawer_background : "#7f8c8d",
      match_results_scorer_color :"#dbd9ff",
      
    },
    "dark blue":{
      /// most valuable
      headerStyle_backgroundColor: '#0c2461',
      headerTintColor: '#b7eefb',
      activeBackgroundColor: '#0a3d62',
      inactiveBackgroundColor: '#0c2461',
      activeTintColor: '#ffffff',
      inactiveTintColor: '#57606f',

      background_color_default : "#000",
      home_title_color : "#d1d8e0",
      text_color_default : "#fff",

      alert_body_backgroundColor : "#3c6382",
      alert_body_color : "#dff9fb",

      fav_background : "#0093fb4a",

      list_header_backgroundColor: "#4a69bd",
      live_borderColor:"#78e08f",
      match_name_backgroundColor: "#1e3799",
      match_name_color: "#b7eefb",
      match_score_backgroundColor: "#a5b1c2",
      match_score_color :"#b8e994", 
      match_time_backgroundColor:"#2c3e50",
      match_time_color:"#fff",
      match_badge_backgroundColor: "#1e3799",
      ///////
      news_cont_backgroundColor:"#34495e",
      news_title_backgroundColor:"#00000091",
      news_title_color:"#fff",
  
      article_body_backgroundColor:"#1d2c5296",
      article_body_color : "#b7eefb",
      article_title_backgroundColor:"#323350d6",
      article_title_color : "#fff",
      article_date_color : "#fff",
      article_photo_background : "#000",

      match_lineup2_color : "#d1d8e0",
      match_lineup2_number_color : "#f1c40f",
      match_linup_team_backgroundColor:"#dae6fd",
      match_linup_team__backgroundColor:"#97d1f9",
      match_stats_color : "#d1d8e0",
      match_lineup_player_color:"#000",
      match_text_info_color : "#d1d8e0",
      match_results_team_scor_color : "#f1c40f",
      match_results_winer_background  : "#16a085",
      match_results_loser_background  : "#c0392b",
      match_results_drawer_background : "#7f8c8d",
      match_results_scorer_color :"#dbd9ff",
      
    },
    "light":{
      /// most valuable
//#####f39c12
      headerStyle_backgroundColor: '#f39c12',
      headerTintColor: '#57606f',
      activeBackgroundColor: '#fbebbb',
      inactiveBackgroundColor: '#a4b0be',
      activeTintColor: '#2f3542',
      inactiveTintColor: '#2f3542',

      background_color_default : "#ced6e0",
      home_title_color : "#2f3542",
      text_color_default : "#000",

      fav_background : "#0093fb4a",
      
      list_header_backgroundColor: "#e67e22",
      live_borderColor:"#2ecc71",
      match_name_backgroundColor: "#dfe4ea",
      match_name_color: "#2f3542",
      match_score_backgroundColor: "#a5b1c2",
      match_score_color :"#b8e994", 
      match_time_backgroundColor:"#ced6e0",
      match_time_color:"#2f3542",
      match_badge_backgroundColor: "#dfe4ea",

      
      ///////
      news_cont_backgroundColor:"#34495e",
      news_title_backgroundColor:"#00000091",
      news_title_color:"#fff",
  
      article_body_backgroundColor:"#a4b0be",
      article_body_color : "#2f3542",
      article_title_backgroundColor:"#acb4c1",
      article_title_color : "#2f3542",
      article_date_color : "#2f3542",
      article_photo_background : "#ced6e0",

      match_lineup2_color : "#2f3542",
      match_lineup2_number_color : "#f37305",
      match_linup_team_backgroundColor:"#dae6fd",
      match_linup_team__backgroundColor:"#97d1f9",
      match_stats_color : "#2f3542",
      match_lineup_player_color:"#000",
      match_text_info_color : "#2f3542",
      match_results_team_scor_color : "#2f3542",
      match_results_winer_background  : "#2ed573",
      match_results_loser_background  : "#ff7f50",
      match_results_drawer_background : "#95afc0",
      match_results_scorer_color :"#5352ed",
      
    }
  }
var themes_list = Object.keys(Themes);

function generateTheme(theme_name=false){
  let isWeb=false;
  let _Global_theme_name = "";
  const window_width = Dimensions.get('window').width;
  const window_height = Dimensions.get('window').height;
  try{
    isWeb = API_ ? API_.isWeb : {isWeb:false};
  }catch(err){isWeb = false;}
  try{
    _Global_theme_name = Global_theme_name;
  }catch(err){_Global_theme_name = "false";}
  
  theme_name = theme_name==false ? "light" :theme_name ;
  let theme = Themes[theme_name];
  const header_height = isWeb ? 40 : 70;
  const __isMobile = _isMobile(isWeb);
  const maxWidth = window_width<1000 ? "100%" : 1000;
  
  var styles_list = {
    list_container: {
      marginRight: "1%",
      //marginLeft: isWeb ? "20%" : 0, 
      marginTop:"1%",
      flex: 1,
      width: "100%" ,
      backgroundColor: theme.background_color_default,
      
    },
    container: {
      //marginRight:__isMobile ? "1%" : 10,
      flex: 1,
      //width:"99%",
      backgroundColor: theme.background_color_default,
    },
    onFocus:{
      backgroundColor:"red"
    },
    item_container: {
      flex:1,
      marginHorizontal:"auto",
      width: maxWidth ,
      backgroundColor: theme.background_color_default,
    },
    columnWrapperStyle:{
      justifyContent: 'flex-end',
      paddingRight: __isMobile ? 10 : 20
    },
    columnWrapperStyle2:{
      justifyContent: 'flex-end',
      //paddingRight: __isMobile ? 10 : 20
    },
    item: {
      padding: 10,
      fontSize: 18,
      height: 44,
      flex:1,
      color:theme.text_color_default,
    },
    header_container: {
      //backgroundColor: theme.list_header_backgroundColor,
      marginVertical:1,
      marginLeft:"1%", 
      width:"98%",
      height:48,
      borderTopLeftRadius:20,
      borderTopRightRadius:20,
      borderBottomLeftRadius:5,
      borderBottomRightRadius:5,
    },
    header: {
      borderTopLeftRadius:20,
      borderTopRightRadius:20,
      borderBottomLeftRadius:5,
      borderBottomRightRadius:5,
      fontSize: 20,
      backgroundColor: theme.list_header_backgroundColor,
      width:"100%",
      textAlign:"right",
      height:"99%",
    },
    header_components: {
      //marginRight:5,
      borderTopLeftRadius:20,
      marginLeft:5,
      //marginTop:3,
      fontSize: 20,
      backgroundColor: theme.list_header_backgroundColor,
      textAlign:"right",
      height:"98%",
    },
    title: {
      fontSize: 23
    },
    shadow_3:{
      boxShadow:
      _Global_theme_name.indexOf("light")==-1
      ? 'rgba(255, 255, 255, 0.20) 0px 2px 2px 2px, rgba(255, 255, 255, 0.18) 0px 4px 2px 3px, rgba(255, 255, 255, 0.12) 0px 5px 2px 4px'
      : 'rgba(0,0,0 , 0.20) 0px 2px 2px 2px, rgba(0,0,0, 0.18) 0px 4px 2px 3px, rgba(0,0,0, 0.12) 0px 5px 2px 4px',
    },
    shadow_1:{
      shadowColor: theme.text_color_default,
      shadowOffset: {
        width: 5,
        height: 3
      },
      shadowOpacity: 0.25,
      //shadowRadius: 3,
      elevation: 5
    },
    shadow_2:{
      shadowColor: theme.text_color_default,
      shadowOffset: {
        width: 5,
        height: 3
      },
      shadowOpacity: 0.30,
      //shadowRadius: 3,
      elevation: 5
    },
    matche_container:{
      width:"98%",
      marginLeft:5,
      marginVertical:5,
      flexDirection:'row', 
      flexWrap:'wrap',
      flex: 1 ,
      height:70,
      marginRight:5,
      //marginLeft:5,
      borderRadius:10,
      borderWidth:1,
    },
    matche_container_live:{
      borderRadius:10,
      borderWidth: 2,
      borderColor: theme.live_borderColor,
    },
    matche_container_notif:{
      borderRadius:10,
      borderWidth: 2,
      borderColor: theme.list_header_backgroundColor,
      //backgroundColor:"yellow"
    },
    team_name_winner :theme.live_borderColor,
    team_name_loser :theme.match_results_winer_background,
    team_name_drawer:theme.match_results_drawer_background,
    matche_team_names:{
      flex: 15 ,
      backgroundColor: theme.match_name_backgroundColor,
    },
    matche_team_name_text:{
      flex:1,
      width:"98%",
      color: theme.match_name_color,
      paddingLeft:5,
      paddingRight:5,
      paddingTop: isWeb ? 3 : 10,
      justifyContent: 'center',
      fontSize:22,
      lineHeight:25,
      textAlign:"right",
    },
    matche_team_name_text_fav:{
      textDecorationLine: 'underline',
    },
    matche_team_score:{
      flex: 2 ,
      backgroundColor: theme.match_score_backgroundColor,
      alignItems:'center',
      color:theme.match_score_color,
      borderTopRightRadius:8,
      borderBottomRightRadius:8,
      alignContent:"center",

    },
    matche_team_score_penalties:{
      flex: 1 ,
      backgroundColor: theme.match_score_backgroundColor,
      alignItems:'center',
      color:theme.match_score_color,
      alignContent:"center",

    },
    matche_team_score_text_penalties:{
      flex:1,
      borderWidth:1,
      borderColor:theme.text_color_default,
      fontSize:23,
      justifyContent: 'center',

    },
    matche_team_score_text:{
      flex:1,
      fontSize:23,
      justifyContent: 'center',

    },
    matche_team_time:{
      flex: 4 ,
      alignItems:'center',
      justifyContent: 'center',
      color:theme.text_color_default,
      borderTopLeftRadius:8,
      borderBottomLeftRadius:8,
      backgroundColor: theme.match_time_backgroundColor,
      textAlignVertical: 'center',
    },
    matche_team_time_t:{
      //lineHeight:20,
    
      //flex:4,
      fontSize:20,
      alignItems:'center',
      color: theme.match_time_color,
      //backgroundColor:"#ff3a3a9c",
      alignContent:"center",
    },
    matche_team_time_live:{
      //flex:3,
      fontSize:20,
      alignItems:'center',
      justifyContent: 'center',
      color:theme.live_borderColor,
      //backgroundColor:"#ffe738cc",
    },

    matche_team_logo:{
      //margin :3,
      width: "100%",
      height: "45%",
      aspectRatio: 1,
      resizeMode:"contain"
    },
    matche_league_logo_c:{
      width: "100%",
      height: "100%",
      //borderRadius: isWeb ? 8 : 5
      
    },
    matche_league_logo:{
      //margin :3,
      marginVertical:1,
      width: "100%",
      height: "95%",
      aspectRatio: 1,
      resizeMode:"contain",
      borderRadius: 5,
      borderTopRightRadius:20,
    },
    matche_league_logo_k:{
      //margin :3,
      marginVertical:1,
      width: "100%",
      borderWidth:1,
      height: "95%",
      aspectRatio: 1,
      //resizeMode:"contain",
      borderRadius:  5,
      borderTopRightRadius:20,
    },
    matche_team_badge:{
      flex: 2 ,
      backgroundColor: theme.match_badge_backgroundColor,
      alignItems:'center',
      color:"#d1d8e0",
      justifyContent: 'center',
    },
    news_container:{
      //padding:5,
      marginVertical:7,
      marginHorizontal:3,
      //marginBottom:5,
      height:200,
      width:"98%",
      //width:200,
      //backgroundColor: "#00000005",//theme.news_cont_backgroundColor,
      backgroundColor: theme.news_cont_backgroundColor,
      //borderRadius: 10,
      justifyContent: 'center',
      
    },
    news_img_v:{
      flex: 10 ,
      width:"100%",
      color:"#fff",
      alignItems:'center',
    },
    league_header:{
      height:20,
      width:"100%",
      color:"#fff",
      flexDirection:'row', 
      flexWrap:'wrap',
    },
    news_img_i:{
      width: "100%",
      height: "100%",
      aspectRatio: 1,
      resizeMode:"stretch",
      alignItems:'center',
    },
    news_title_v:{
      width:"100%",
      height : 50,
      paddingBottom:5,
      flex: 2 ,
      fontSize:18,
      color:"#fff",
      backgroundColor: theme.news_title_backgroundColor
    },
    news_title_t:{
      height : "100%",
      flex: 9,
      fontSize:15,
      alignItems:'center',
      justifyContent: 'center',
      alignSelf : "center",
      color: theme.news_title_color,
      paddingHorizontal:3,//backgroundColor:"red"
      fontWeight: "bold",
    },
    news_title_icon:{
      //fontSize:15,
      alignItems:'center',
      justifyContent: 'center',
      alignSelf : "center",
      color: theme.news_title_backgroundColor,
    },
  };

  var styles_home= {
    container: {
      flex: 1,
      //justifyContent: 'center',
      //paddingTop: Constants.statusBarHeight,
      backgroundColor: theme.background_color_default,
      color : "#fff",
    },

    text:{
      color : theme.text_color_default,
      marginRight:10,
      justifyContent: 'center',
      alignItems: 'center'
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      color : theme.home_title_color,
      //fontFamily : "cairoregular",
    },
    header_icons:{
      padding:10,
      //marginLeft :20,
    },
    icons:{
      marginHorizontal:3,
      alignItems:"center",
      justifyContent: "center",
      height:40,  
      width:40,
      borderRadius: 20 ,
      backgroundColor:theme.headerStyle_backgroundColor,
      borderColor:theme.text_color_default,
      borderWidth:1,
    }
  };

  var  styles_article = StyleSheet.create({
    icons:styles_home.icons,
    title:styles_home.title,
    container: {
      flex: 1,
      backgroundColor: theme.background_color_default,
      color : "#fff",

    },
    article_v: {
      flex: 10,
      padding: 5,
      fontSize: 18,
      backgroundColor: theme.background_color_default,
      //backgroundColor: '#8e5858',
    },
    article_body_t:{
      fontSize: 15,
      color : theme.article_body_color,
      textAlign:"right",
      borderRadius: 5,
      backgroundColor: theme.article_body_backgroundColor,
      padding:10,
      marginBottom:5,
    },
    article_title_t:{
      fontWeight: "bold",
      padding:10,
      width:"100%",
      marginTop:8,
      marginBottom:8,
      fontSize: 16,
      color : theme.article_title_color,
      textAlign:"center",
      backgroundColor:theme.article_title_backgroundColor,
      borderRadius: 5,
    },
    article_date_t:{
      //padding:5,
      fontSize: 12,
      color : theme.article_date_color,
      textAlign:"right",
    },
    channel_logo:{
      aspectRatio: 1,
      width: "100%",
      height: "100%",
      resizeMode: 'contain',
    },
    channel_logo_v:{
      width: "100%",
      height:300,
      padding:5,
      alignContent:"center",
      alignItems:"center",
      alignSelf:"center",
      backgroundColor:theme.article_photo_background,
    }
  });

  var styles_news = StyleSheet.create({
    container: {
      flex: 1,
      //paddingTop: Constants.statusBarHeight,
      backgroundColor: theme.background_color_default,
      color : "#fff",
    },
    nav_container: {
      flexDirection:'row', 
      flexWrap:'wrap',
      //height:30,
      justifyContent: 'center',
      backgroundColor: theme.background_color_default,
      color : "#fff",
    },
    text: {
      color : theme.text_color_default,
      fontSize: 20,
      marginHorizontal:10,
      justifyContent: 'center',
      textAlign:"center",
      width:20,
    },

    title: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      color : "#d1d8e0",
    },
    icons:styles_home.icons,
  });


  var styles_channel = StyleSheet.create({
    container_scrl: {
      flex: 1,
      //backgroundColor: '#fff',
    },
    modalView: {
      margin: 20,
      backgroundColor: theme.background_color_default,
      borderRadius: 10,
      padding: 35,
      alignItems: "center",
      shadowColor: theme.text_color_default,
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5
    },
    container: {
      flex: 1,
      //justifyContent: 'center',
      //paddingTop: Constants.statusBarHeight,
      //backgroundColor: '#bd7bc1',
      flexDirection: 'column',
      backgroundColor: theme.background_color_default,
      color : "#fff",
    },
    info_cont: {
      flex: 4,
      //justifyContent: 'center',
      padding: 5,
      fontSize: 18,
      color : theme.text_color_default,
      //backgroundColor: theme.background_color_default,
      //backgroundColor: '#8e5858',
    },
    info_text:{
      fontSize: 18,
      color : theme.text_color_default,
    },
    channel_logo:{
      aspectRatio: 1,
      width: "100%",
      height: "100%",
      resizeMode: 'cover',
    },
    channel_logo_v:{
      width: "100%",
      height:300,
      padding:5,
      alignContent:"center",
      alignItems:"center",
      alignSelf:"center",
    }
  });

  var styles_match = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop :3,
      backgroundColor: theme.background_color_default,
      color : "#d1d8e0",
    },
    container_scrl: {
      flex: 1,
      backgroundColor: theme.background_color_default,
    },
    hairline: {
      backgroundColor: '#A2A2A2',
      height: 2,
      width:"100%",
      marginHorizontal:"auto",
      paddingHorizontal:10,
    },
    paragraph: {
      margin: 24,
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    tabs_list:{
      //marginTop:10,
      flexDirection:'row', 
      flexWrap:'wrap',
    },
    view_tab:{
      //marginTop:10,
      flex: 13 ,
      //height:20
    },
    view_tab_text:{
      //flex: 1 ,
      textAlign:"center",
      padding:3
    },
    lineup2_container:{
      marginVertical:1,
      flexDirection:'row', 
      flexWrap:'wrap',
    },
    lineup2_lr_container:{
      flex:1,
    },
    lineup2_l:{
      flex:9,
      textAlign: 'left',
      color : theme.match_lineup2_color,
      borderLeftWidth:1,
      paddingLeft:3,
      borderBottomWidth:1,
      borderColor:"#5a6d8aa3",
      borderRadius:10,
    },
    lineup2_r:{
      flex:9,
      textAlign: 'right',
      color : theme.match_lineup2_color,
      borderRightWidth:1,
      paddingRight:3,
      borderBottomWidth:1,
      borderColor:"#5a6d8aa3",
      borderRadius:10,
    },
    lineup2_m:{
      flex:1,
      marginHorizontal:5,
      textAlign: 'center',
      color : theme.match_lineup2_color,
    },
    lineup2_number:{
      width:20,
      borderRadius:20,
      marginHorizontal:3,
      textAlign: 'center',
      color : theme.match_lineup2_number_color,
    },
    lineup2_number_subs:{
      width:30,
      marginHorizontal:0,
      textAlign: 'center',
      color : theme.live_borderColor,
    },
    stats_container:{
      //marginTop:10,
      flexDirection:'row', 
      flexWrap:'wrap',
      
    },
    stats_frag_l_:{
      fontSize:16,
      marginHorizontal:5,
      flex: 10 ,
      textAlign: 'center',
      color : theme.match_stats_color,
      textDecorationLine: 'underline',
    },
    stats_frag_m_:{
      marginHorizontal:5,
      flex: 4 ,
      textAlign: 'center',
      color : theme.match_stats_color,
      
    },
    stats_frag_r_:{
      fontSize:16,
      marginHorizontal:5,
      flex: 10 ,
      textAlign: 'center',
      color : theme.match_stats_color,
      textDecorationLine: 'underline',
    },
    stats_frag_l:{
      marginHorizontal:5,
      flex: 2 ,
      textAlign: 'center',
      color : theme.match_stats_color,
    },
    stats_frag_m:{
      marginHorizontal:5,
      flex: 10 ,
      textAlign: 'center',
      color : theme.match_stats_color,
    },
    stats_frag_r:{
      marginHorizontal:5,
      flex: 2 ,
      color : theme.match_stats_color,
    },

    view_inline:{
      marginLeft:5,
      marginRight:5,
      flexDirection:'row', 
      flexWrap:'wrap',
      flex: 1 ,
      textAlign: 'center',
      color : "#d1d8e0",
    },
    view_inline_teams_lu:{
      marginTop:3,
      flexDirection:'row', 
      flexWrap:'wrap',
      //height:10,
      textAlign: 'center',
      color : "#d1d8e0",
      marginBottom:10

    },
    lineup_team:{
      marginLeft:5,
      marginRight:5,
      borderRadius: 10,
      //margin:5,
      flex: 1 ,
      textAlign: 'center',
      backgroundColor:theme.match_linup_team_backgroundColor,
    },
    lineup_team_:{
      marginLeft:5,
      marginRight:5,
      borderRadius: 10,
      flex: 1 ,
      textAlign: 'center',
      backgroundColor:theme.match_linup_team__backgroundColor,
    },
    background_pitch:{
      flex: 12 ,
    },
    lineup_player:{
      fontWeight: 'bold',
      fontSize:15,
      flex: 10 ,
      textAlign: 'center',
      color:theme.match_lineup_player_color,
    },

    title: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      color : "#d1d8e0",
    },
    text_info:{
      color : theme.match_text_info_color,
    },
    header_container:{
      marginHorizontal:"auto",
      width:"98%",
      flexDirection:"row",
      flexWrap:'wrap',
      marginBottom:10,
    },
    match_results_team_name:{
      fontSize: 20,
      //fontWeight: 'bold',
      color : "#fff",
      paddingHorizontal:5,
      width:"100%",
      textAlign:"center"
      //textAlign:"right"
    },

    match_results_team_scor_t:{
      fontSize: 35,
      //fontWeight: 'bold',
      color : theme.match_results_team_scor_color,
      paddingHorizontal:5,
      textAlign:"center",
      height:50,
    },
    match_results_team_scor_penalties_t:{
      fontSize: 23,
      lineHeight:20,
      //paddingVertical:1,
      borderWidth:1,
      //fontWeight: 'bold',
      color : theme.match_results_team_scor_color,
      //paddingHorizontal:5,
      textAlign:"center",
      //height:23,
      padding:2,
      //width:18,
      backgroundColor:"#4500ff3d",
      marginHorizontal:"auto",
      alignSelf:"center",
      marginBottom:2,

    },
    
    match_results_team_name_l:{
      textAlign:"right",
      borderRightWidth:1,
      },
    match_results_team_name_r:{
      textAlign:"left",
      borderLeftWidth:1,
      
    },
    match_results_winer:{
      flex:1,
      backgroundColor: theme.match_results_winer_background,
    },
    match_results_loser:{
      flex:1,
      backgroundColor: theme.match_results_loser_background,
    },
      match_results_drawer:{
      flex:1,
      backgroundColor: theme.match_results_drawer_background,
    },
    match_results_scorer_text:{
      color: theme.match_results_scorer_color,
      fontSize:15,
      }
  });
  var styles_league = StyleSheet.create({
    container: {
      flex: 1,
      width:"100%",
      alignContent:"center",
      //justifyContent: 'center',
      //paddingTop: Constants.statusBarHeight,
      backgroundColor: theme.background_color_default,
    },
    tabs_list:{
      flexDirection:'row',
      flexWrap:'wrap',
      width:"100%"
    },
    paragraph: {
      margin: 24,
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      color : "#d1d8e0",
    },
    team_view:{
      flexDirection:'row',
      flexWrap:'wrap',
      width:"100%",
      height:35,
      borderColor:theme.text_color_default,
      borderBottomWidth :1,
      borderRadius:40,
    },
    group_name_t:{
      fontSize:20,
      color : theme.text_color_default,
    },
    team_name_t:{
      fontSize:17,
      color : theme.text_color_default,
      textAlign:"left"
    },
    channel_logo_v : {
      width: "100%",
      height: window_height>800 ? 400 : 300,
      paddingHorizontal:5,
      alignContent:"center",
      alignItems:"center",
      alignSelf:"center",
      backgroundColor:theme.article_photo_background,

    },
    news_title_v : styles_list.news_title_v,
    news_title_t : styles_list.news_title_t,
    news_img_v   : styles_list.news_img_v,
    news_container: styles_list.news_container,
    
    
  });

  var app_styles = {
    screenHeader : {
      headerStyle: {
        backgroundColor: theme.headerStyle_backgroundColor,
        height: header_height,
        },
      headerTintColor: theme.headerTintColor,
      headerTitleStyle: {
        //fontWeight: 'bold',
        },
      headerTitleAlign: 'center',
      },
    tabBarOptions:{
          activeBackgroundColor: theme.activeBackgroundColor,
          inactiveBackgroundColor: theme.inactiveBackgroundColor,
          activeTintColor: theme.activeTintColor,
          inactiveTintColor: theme.inactiveTintColor,
          size : 30,
          swipeEnabled :true,
          showLabel:true,
          //labelPosition:"below-icon",
          //tabStyle:{color:"red"}
        },
    tabBarOptions_mat:{
      activeBackgroundColor: theme.activeBackgroundColor,
      inactiveBackgroundColor: theme.inactiveBackgroundColor,
      activeTintColor: theme.activeTintColor,
      inactiveTintColor: theme.inactiveTintColor,
      style: { 
        backgroundColor: theme.inactiveBackgroundColor,
        },
      labelStyle  :{
        height:"100%",
        width:"100%",
      },
      iconStyle :{
        height:"100%",
        width:"100%",
        margin:0,
      },
      showIcon :true, 
      showLabel :true,
      pressColor:theme.activeBackgroundColor,
        }
  }
  var styles_notif = StyleSheet.create({
    container:{
      zIndex: 99999, // works on ios
      elevation: 99999, // works on android    

      height:0,
      width:"100%",
      position: "absolute",
      top: isWeb?-30:-1,
      left:0,
      backgroundColor:"#0000",
      padding:5,
      justifyContent:"center",
      alignItems:"center",
      zIndex: 1,
    },
    box:{
      //top:-50,
      width: "80%",
      backgroundColor:  theme.activeBackgroundColor,
      marginHorizontal:"auto",
      borderWidth:1,
      borderRadius:5,
      borderColor:theme.activeTintColor,

      justifyContent:"center",
    },
    box_inside:{
      //top:-50,
      zIndex: 99999, // works on ios
      elevation: 99999, // works on android    
      width:"100%",
      flex:1,
      backgroundColor:  theme.activeBackgroundColor,
      marginHorizontal:"auto",
      flexDirection:'row', 
      flexWrap:'wrap',
      borderWidth:1,
      borderRadius:5,
      borderColor:theme.activeTintColor,

      justifyContent:"center",
    },
    body:{
      fontSize:16,
      color: theme.activeTintColor,
      flex:1,
      justifyContent:"center",
      //textAlign:"center",
      textAlignVertical:"center",
      height:"100%",
      padding:5,
    },
    txt_danger:{color:"#fd7f72"},
    txt_success:{color:"#42dc84"},
    txt_info:{color:"#5fb2ea"},
    txt_warning:{color:"#f9cd87"},
    bg_danger:{backgroundColor:"#e74c3c"},
    bg_success:{backgroundColor:"#2ecc71"},
    bg_info:{backgroundColor:"#3498db"},
    bg_warning:{backgroundColor:"#f39c12"},
    indecator:{
      backgroundColor:"red",
      width:8,
      height:"100%",
      borderTopLeftRadius : 5,
      borderBottomLeftRadius : 5,
      paddingRight:2,
    },
    indecator_thin:{
      backgroundColor:"red",
      width:4,
      height:"100%",
      borderTopLeftRadius : 5,
      borderBottomLeftRadius : 5,
      paddingRight:2,
    },
    /*
    cairoregular_regular:{
      fontFamily : "cairoregular",
    },
    cairoregular_bold:{
      fontFamily : "cairoregular",
    },*/
  });
  var styles_settings = StyleSheet.create({
    container: {
      flex: 1,
      //paddingTop: Constants.statusBarHeight,
      backgroundColor: theme.background_color_default,
      color : "#fff",
      paddingBottom:10,
    },
    settings_row:{
      flexDirection:'row', 
      flexWrap:'wrap',
      width:"95%",
      //height:50,
      marginHorizontal:5,
      marginVertical:5,
      backgroundColor: "#0000",
      color : theme.text_color_default,
    },
    settings_row_label:{
      flex:3,
      backgroundColor: theme.background_color_default,
      color : theme.text_color_default,
    },
    settings_row_input:{
      flex:3,
      backgroundColor: theme.background_color_default,
      color : theme.text_color_default,
      height:30,
      borderRadius: isWeb ? 10 : 8,
      paddingHorizontal : 10,
    },
    log_time_text:{
      width:40,
      backgroundColor: theme.background_color_default,
      color : theme.text_color_default,
      fontSize:10,
    },
    log_type_text:{
      width:40,
      marginHorizontal:1,
      backgroundColor: theme.background_color_default,
      color : theme.text_color_default,
      fontSize:10,
    },
    log_msg_text:{
      flex:1,
      backgroundColor: theme.background_color_default,
      color : theme.text_color_default,
      fontSize:10,
    },
    nav_container: {
      flexDirection:'row', 
      flexWrap:'wrap',
      //height:30,
      justifyContent: 'center',
      backgroundColor: theme.background_color_default,
      color : theme.text_color_default,
    },
    modal_view_container:{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      width:"100%",
      height:"100%",
      paddingTop: 22,
      //backgroundColor:"red"
    },
    modal_view: {
      margin: 10,
      width: __isMobile ? "90%" : "80%",
      backgroundColor: theme.background_color_default,
      borderRadius: 10,
      padding: 10,
      alignItems: "center",
      shadowColor: theme.text_color_default,
      shadowOffset: {
        width: 5,
        height: 10
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      borderWidth:1,
      borderColor:theme.text_color_default,
    },
    modal_view_small: {
      height : 200,
    },
    modal_view_large: {
      height : 500,
    },
    modal_view_meduim: {
      height : 350,
    },
    modal_view_fill_width: {
      width : window_width-50,
    },
    modal_view_fill: {
      height : window_height-100,
      width : window_width-50,
    },
    modal_body: {
      backgroundColor:"#646c78",
      width:"98%",
      flex:1,
      justifyContent:"center",
      alignItems:"center",
    },
    footer: {
      padding:2,
      height:50,
      width:"98%",
      justifyContent:"center",
      alignItems: "center",
      flexDirection:'row',
      flexWrap:'wrap',
    },
    footer_button: {
      margin: 2,
      width:100,
    },
    text: {
      color : theme.text_color_default,
      fontSize: 20,
      marginHorizontal:10,
      justifyContent: 'center',
      textAlign:"center",
      width:20,
    },

    title: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      color : "#d1d8e0",
    },
    icons:styles_home.icons,
  });
  const styles_modal= StyleSheet.create({
    modal_view: {
      margin: 10,
      width: __isMobile ? "90%" : "80%",
      backgroundColor: theme.background_color_default,
      borderRadius: 10,
      padding: 10,
      alignItems: "center",
      shadowColor: theme.text_color_default,
      shadowOffset: {
        width: 5,
        height: 10
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      borderWidth:1,
      borderColor:theme.text_color_default,
    },
    modal_view_small: {
      height : 200,
    },
    modal_view_large: {
      height : 500,
    },
    modal_view_meduim: {
      height : 350,
    },
    modal_view_fill_width: {
      width : window_width-50,
    },
    modal_view_fill: {
      height : window_height-100,
      width : window_width-50,
    },
    modal_body: {
      backgroundColor:"#646c78",
      width:"98%",
      flex:1,
      justifyContent:"center",
      alignItems:"center",
    },
    footer: {
      padding:2,
      height:50,
      width:"98%",
      justifyContent:"center",
      alignItems: "center",
      flexDirection:'row',
      flexWrap:'wrap',
    },
    footer_button: {
      margin: 2,
      width:100,
    },
    text: {
      color : theme.text_color_default,
      fontSize: 20,
      marginHorizontal:10,
      justifyContent: 'center',
      textAlign:"center",
      width:20,
    },
    text_info: {
      color : theme.text_color_default,
      fontSize: 18,
      lineHeight:26,
      marginHorizontal:5,
      flex:1
    },
    text_carrier: {
      lineHeight:22,
      color : theme.text_color_default,
      fontSize: 14,
      marginHorizontal:10,
      flex:1,
      borderTopWidth:1,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      color : "#d1d8e0",
    },
    icons:styles_home.icons,
    info_row:{
      flexDirection:'row', 
      flexWrap:'wrap',
      width:"95%",
      //marginHorizontal:5,
      //marginVertical:5,
      backgroundColor: "#0000",
      color : theme.text_color_default,
    },
    info_row_label:{
      width:"40%",
      backgroundColor: theme.background_color_default,
      color : theme.text_color_default,
      paddingHorizontal : 5,
      height:30,
    },
    info_row_input:{
      width:"45%",
      backgroundColor: theme.background_color_default,
      color : theme.text_color_default,
      height:30,
      borderRadius: isWeb ? 10 : 8,
      paddingHorizontal : 8,
    },
  });
  return {Themes,styles_list,styles_article,styles_home,styles_news,styles_channel,styles_match,app_styles,styles_league,styles_settings,theme,styles_notif,styles_modal};
}
var themes = generateTheme("dark blue");
var styles_list    = themes["styles_list"];
var styles_article = themes["styles_article"];
var styles_home    = themes["styles_home"];
var styles_news    = themes["styles_news"];
var styles_channel = themes["styles_channel"];
var styles_match   = themes["styles_match"];
var app_styles     = themes["app_styles"];
var styles_league  = themes["styles_league"];
var styles_settings= themes["styles_settings"];
var global_theme   = themes["theme"];
var styles_notif   = themes["styles_notif"];
var styles_modal   = themes["styles_modal"];



export {Themes,styles_list,styles_article,styles_home,styles_news,styles_channel,styles_match,getTheme,getThemes,app_styles,themes_list,styles_league,global_theme,_isMobile,styles_settings,styles_notif, styles_modal};



