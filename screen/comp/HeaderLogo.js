/*eslint prettier/prettier:0*/
/**
 * @format
 * @prittier
 */

import * as React from 'react';
import {
  View, Text,
  Image,I18nManager,
  Dimensions,
} from 'react-native';
import {c_dark_text, c_main_orange} from '../../resource/BaseValue';
import FastImage from 'react-native-fast-image'
import {globalStyle} from '../../resource/style/GlobalStyle';
import getLanguage, {getDesignDimension} from '../../resource/LanguageSupport';
import { create } from 'react-native-pixel-perfect';

export default class HeaderLogoComponents extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          title: this.props.title
      };
    }

    componentDidMount() {
        
    }

    render() {
        return (
            <View style={{flexDirection: 'row',  alignItems:'center',justifyContent:'center',marginTop:10}}>
            <Text style={[globalStyle.textBasicBoldStyle, {fontWeight:'bold'}]}>{langObj.appName}</Text>
            <Image
                source={require("../../image/icon_logo.png")}
                resizeMode="contain"
                style={{
                    width:perfectSize(53),
                    height:perfectSize(56),marginStart:5}}
            />
        </View>
          );
    }
}

let perfectSize = create(getDesignDimension());
let langObj = getLanguage();
const screenWidth = Math.round(Dimensions.get('window').width);