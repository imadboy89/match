import React from 'react';
import {  Text,StyleSheet } from 'react-native';


class TextF extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
      };
    }


    render(){
        return (
            <Text style={[styles.textf,this.props.style]}>{this.props.children}</Text>
        );
    }
}

const styles = StyleSheet.create({
  textf:{
    fontFamily : "cairoregular",
  }
});


export default TextF;