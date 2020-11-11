import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';


class IconButton extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
      };
    }


    render(){
        return (
            <TouchableOpacity
                disabled={this.props.disabled ? this.props.disabled : false}
                activeOpacity={this.props.activeOpacity ? this.props.activeOpacity : 0.5}
                onPress={this.props.onPress}
                style={this.props.style}
                >
              <View style={{}} >
                <Icon 
                    name={this.props.name!=undefined?this.props.name:"rocket"} 
                    size={this.props.size!=undefined?this.props.size:28} 
                    color={this.props.color!=undefined?this.props.color:"#5abfd8"}
                     />
              </View>
            </TouchableOpacity>
        );
    }
}

export default IconButton;