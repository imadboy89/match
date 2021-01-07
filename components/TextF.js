import React from 'react';
import {  Text,StyleSheet } from 'react-native';


class TextF extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
      };
    }


    render(){
      let props_style = this.props.style;

      let style = this.props.bold ? styles.kufi_bold: styles.kufi_regular;
      if(props_style && props_style.fontWeight == "bold"){
        try {
          props_style = JSON.parse(JSON.stringify(StyleSheet.flatten(this.props.style))) ; 
        } catch (error) {}
        style = styles.kufi_bold;
        props_style.fontWeight = "normal";
      }
      
      style = this.props.noFonts ? props_style : [style,props_style];
      return (
        <Text style={style} numberOfLines={this.props.numberOfLines}>{this.props.children}</Text>
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