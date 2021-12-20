import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {global_theme, styles_colors} from "../components/Themes";



class IconButton extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
      };
    }


    render(){
        let color = this.props.color!=undefined?this.props.color:"#5abfd8" ;
        color = this.props.disabled ? global_theme.inactiveTintColor :color;
        let backgroundColor  = this.props.badge_bg_color ? this.props.badge_bg_color : "bg_info";
        //let color = this.props.txt_color ? this.props.txt_color : "txt_info";
        backgroundColor = styles_colors[backgroundColor] ? styles_colors[backgroundColor] : {};
        //color = styles_colors[color] ? styles_colors[color] : {};
        return (
            <TouchableOpacity
                disabled={this.props.disabled ? this.props.disabled : false}
                activeOpacity={this.props.activeOpacity ? this.props.activeOpacity : 0.5}
                onPress={this.props.onPress}
                style={[{paddingHorizontal:5,paddingVertical:5,justifyContent:"center"},this.props.style]}
                >
                <Icon 
                    name={this.props.name!=undefined?this.props.name:"rocket"} 
                    size={this.props.size!=undefined?this.props.size:28} 
                    color={color}
                     />
                {this.props.badge_text!=undefined && this.props.badge_text>0 && 
                <Text style={[styles_badge.badge,backgroundColor]}>
                    {this.props.badge_text}
                </Text>
                }
                
            </TouchableOpacity>
        );
    }
}

var styles_badge = StyleSheet.create({
    badge : {
        borderRadius: 10,
        position : "absolute",
        top:0,
        right:0,
        width:16,
        height:16, 
        textAlign:"center",
        textAlignVertical:"top",
        paddingBottom:20,
        
    }
});
export default IconButton;