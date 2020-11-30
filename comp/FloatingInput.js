/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View, Text, TextInput, Dimensions, TouchableOpacity
} from 'react-native';
import {c_dark_line, c_text_green} from '../resource/BaseValue';

export default class RNFloatingInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = ({
            isFocused: false,
            displayText: "",
        });
    }

    handleFocus = () => {
        this.setState({isFocused: true})
    };
    handleBlur = () => {
        if (this.state.displayText == "") {
            this.setState({isFocused: false});
        } else {
            this.setState({isFocused: true});
        }
    }

    componentDidMount() {

    }

    updateValue = (text) => {
        let allState = this.state;
        allState.displayText = text;
        if (text == "") {
            allState.isFocused = false;
        } else {
            allState.isFocused = true;
        }
        this.setState(allState);
    }

    render() {
        const {label, labelSize, labelSizeLarge , labelColor, textInputStyle, containerStyle, onPress, onChangeTextInput,inputValue, keyboardType ,editable = false, ...props} = this.props;
        const {isFocused} = this.state;
        const labelStyle = {
            position: 'absolute',
            left: 0,
            top: !isFocused ? labelSize : 0,
            fontSize: !isFocused ? labelSizeLarge : labelSize,
            color: !isFocused ? labelColor : labelColor,
        };
        return (
            <View
                style={[containerStyle,{flexDirection:'row', alignItems:'flex-end',
                    borderWidth:0.5, borderColor:this.state.isFocused ? c_text_green : c_dark_line, borderRadius:7}]}>
                <View style={{paddingTop: labelSize, flex:1}}>
                    <Text style={labelStyle}>
                        {label}
                    </Text>
                    <TextInput
                        {...props}
                        style={[textInputStyle]}
                        onFocus={this.handleFocus}
                        onBlur={this.handleBlur}
                        editable={editable}
                        keyboardType={keyboardType}
                        value={inputValue}
                        onChangeText={(text) =>{
                           this.updateValue(text);
                            if (editable) {
                                this.props.onChangeTextInput(text);
                            }
                        }}
                    />
                </View>
            </View>
        );
    }
}
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
