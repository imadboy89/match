import React from 'react';
import { StyleSheet, ActivityIndicator, View  } from 'react-native';
import {_isMobile,getTheme,global_theme} from "./Themes";

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flex:1,
    width:"100%",
    backgroundColor:global_theme.background_color_default
  },
  horizontal: {
    //flexDirection: 'row',
    //justifyContent: 'space-around',
    alignContent:"center",
    alignSelf:"center",
    alignItems:"center",
    padding: 10
  }
});

function Loader(){
  return (      
    <View style={[styles.container, styles.horizontal]}>
      <ActivityIndicator size="large" color="#00ff00" />
    </View>);
} 

export default Loader;