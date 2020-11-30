/*eslint prettier/prettier:0*/
/**
 * @format
 * @prittier
 */

import * as React from 'react';
import {
  View, Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {c_dark_text} from '../../resource/BaseValue';
import FastImage from 'react-native-fast-image'
import {globalStyle} from '../../resource/style/GlobalStyle';
import getLanguage from '../../resource/LanguageSupport';

export default class ProductItem extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          product: this.props.product
      };
    }

    componentDidMount() {
        
    }

    render() {
        return (
            <View style={[mStyle.productItemContainer]}>
                <FastImage
                    source={{uri:this.state.product.product_image}}
                    resizeMode="contain"
                    style={{
                        width:screenWidth*0.15,
                        height:screenWidth*0.15}}
                />
                <View style={{flexDirection:'column', marginStart:5, marginEnd: 5, flex:1}}>
                    <Text style={[globalStyle.textBasicStyle,mStyle.textNormalContent]}>{this.state.product.product_name}</Text>
                    <View style={{flexDirection:'row', alignItems:'center',marginTop:10}}>
                        <Text style={[globalStyle.textBasicStyle,mStyle.textNormalContent]}>{langObj.amount}</Text>
                        <Text style={[globalStyle.textBasicBoldStyle,mStyle.textBoldContent, {marginStart:5, marginTop:5}]}>{this.state.product.amount}</Text>
                        <Text style={[globalStyle.textBasicStyle,mStyle.textNormalContent, {marginStart:30}]}>{langObj.price}</Text>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textBoldContent,{marginStart:5, marginTop:5}]}>{this.state.product.price}</Text>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textBoldContent,{marginStart:5, marginTop:5}]}>{langObj.priceUnit}</Text>
                    </View>
                </View>
            </View>
          );
    }
}

let langObj = getLanguage();
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const mStyle = StyleSheet.create({
    productItemContainer: {
        width:screenWidth-40,
        marginStart:20,
        marginTop:10,
        marginBottom:10,
        flexDirection:'row',
        padding:10,
        backgroundColor:"#ffffff",
        alignItems:'center',
    },
    textNormalContent: {
        fontSize:20,
        color: c_dark_text
    },
    textBoldContent: {
        fontSize:18,
    },
})