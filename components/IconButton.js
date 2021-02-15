import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {global_theme} from "../components/Themes";


class IconButton extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
      };
    }


    render(){
        let color = this.props.color!=undefined?this.props.color:"#5abfd8" ;
        color = this.props.disabled ? global_theme.inactiveTintColor :color;
        return (
            <TouchableOpacity
                disabled={this.props.disabled ? this.props.disabled : false}
                activeOpacity={this.props.activeOpacity ? this.props.activeOpacity : 0.5}
                onPress={this.props.onPress}
                style={[{paddingHorizontal:5,paddingVertical:5,justifyContent:"center"}]}
                >
                <Icon 
                    name={this.props.name!=undefined?this.props.name:"rocket"} 
                    size={this.props.size!=undefined?this.props.size:28} 
                    color={color}
                     />
            </TouchableOpacity>
        );
    }
}

export default IconButton;