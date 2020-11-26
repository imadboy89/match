import React from 'react';
import {  Text,StyleSheet } from 'react-native';


class TextF extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
      };
    }


    render(){
      let style = this.props.bold ? styles.kufi_regular: styles.kufi_regular;
      style = this.props.noFonts ? this.props.style : [style,this.props.style];
      return (
        <Text style={style}>{this.props.children}</Text>
      );
    }
}

const styles = StyleSheet.create({
  kufi_regular:{
    fontFamily : "DroidKufi-Regular",
  },
  kufi_bold:{
    fontFamily : "DroidKufi-Bold",
  },
  /*
  cairoregular_regular:{
    fontFamily : "cairoregular",
  },
  cairoregular_bold:{
    fontFamily : "cairoregular",
  },*/
});


export default TextF;