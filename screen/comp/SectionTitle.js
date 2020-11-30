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
import getLanguage from '../../resource/LanguageSupport';

export default class SectionTitleComponents extends React.Component {
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
            <View style={[globalStyle.sectionTitleContainer]}>
                <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                    <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection]}>{this.state.title}</Text>
                    <Image
                        source={I18nManager.isRTL || langObj.isRTL ? require("../../image/icon_arrow_left_black_d2.png") : require("../../image/icon_arrow_right_black_d2.png")}
                        resizeMode="contain"
                        style={{
                            width:screenWidth*0.08,
                            height:screenWidth*0.08* (108/156),marginStart:5}}
                    />
                </View>
                <View style={{flex:1}}/>
            </View>
          );
    }
}

let langObj = getLanguage();
const screenWidth = Math.round(Dimensions.get('window').width);