import React from 'react';
import { StyleSheet, ActivityIndicator, View  } from 'react-native';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flex:1,
    //backgroundColor:"#fff"
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