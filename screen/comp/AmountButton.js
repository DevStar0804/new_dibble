/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {c_dark_line, c_dark_line_opacity} from '../../resource/BaseValue';

export default class AmountButton extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          amount: 1,
      };
    }

    componentDidMount() {
        let number = this.props.number;
        this.setState({amount: number});
    }

    render() {
        const {number, onNumberChange,isVisible, ...props} = this.props;
        return (
            <View style={{flexDirection: 'row', borderWidth:1, borderRadius:8, borderColor:c_dark_line_opacity, alignItems:'center', margin: 10,
                display: this.props.isVisible?'flex':'none'}}>
                <TouchableOpacity
                    onPress={()=>{
                        let currentNumber = this.state.amount -1;
                        this.setState({amount: currentNumber});
                        this.props.onNumberChange(currentNumber);
                    }}
                    style={{
                        width:screenWidth*0.1, height: screenWidth*0.1, alignItems:'center', justifyContent:'center'
                    }}>
                    <Image
                        source={require('../../image/icon_devide.png')}
                        resizeMode="contain"
                        style={{
                            width:screenWidth*0.03,
                            height:screenWidth*0.03*(18/108)}}
                    />
                </TouchableOpacity>
                <View style={{width:1, height:screenWidth*0.1, backgroundColor:c_dark_line_opacity}}/>
                <TouchableOpacity
                    onPress={()=>{
                        let currentNumber = this.state.amount + 1;
                        this.setState({amount: currentNumber});
                        this.props.onNumberChange(currentNumber);
                    }}
                    style={{
                        width:screenWidth*0.1, height: screenWidth*0.1, alignItems:'center', justifyContent:'center'
                    }}>
                    <Image
                        source={require('../../image/icon_plus.png')}
                        resizeMode="contain"
                        style={{
                            width:screenWidth*0.03,
                            height:screenWidth*0.03}}
                    />
                </TouchableOpacity>
            </View>
          );
    }
}

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
