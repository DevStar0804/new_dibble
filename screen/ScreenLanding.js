/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View,
    Text,
    Image,
    Dimensions, ActivityIndicator, Alert, TouchableOpacity, StyleSheet, Platform, NativeModules, I18nManager,
} from 'react-native';
import {
    c_text_green,
    HomeScreenName,
    key_user_info,
    greyHasOpacity,
    c_loading_icon,
    c_bg_blue, PhoneInputScreenName, isForceRTL, key_screen_comeback,
} from '../resource/BaseValue';
import * as RNLocalize from "react-native-localize";
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';
import FastImage from 'react-native-fast-image';

export default class LandingScreen extends React.Component {
    constructor (props) {
        super(props);
        this.state = ({
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
        })
    }



    componentDidMount (){
        console.log(RNLocalize.getLocales());
        RNLocalize.addEventListener("change", () => {
            // do localization related stuff…
        });
        if (this.props.route != null && this.props.route.params != null && this.props.route.params.previousScreen != null) {
            this.savePreviousScreen(this.props.route.params.previousScreen);
        } else {
            this.savePreviousScreen("");
        }
    }

    componentWillReceiveProps(nextProps: Props, nextContext: *): * {
        setTimeout(()=>{
            if (this.props.route != null
                && this.props.route.params != null
                && this.props.route.params.previousScreen != null) {
                this.savePreviousScreen(this.props.route.params.previousScreen);
            }
        }, 500);
    }

    savePreviousScreen = async (screenName) => {
        AsyncStorage.setItem(key_screen_comeback, screenName);
    }

    _showLoadingBox () {
        var allState = this.state;
        allState.indicatorSizeW = screenWidth;
        allState.indicatorSizeH = screenHeight;
        allState.indicatorDisplay = true;
        this.setState(allState);
    }

    _closeLoadingBox () {
        var allState = this.state;
        allState.indicatorSizeW = 0;
        allState.indicatorSizeH = 0;
        allState.indicatorDisplay = false;
        this.setState (allState);
    }


    render () {
        return (
            <View style={{flex:1, flexDirection:"column", backgroundColor:'#ffffff'}}>
                <View style={[globalStyle.header,{width:screenWidth, padding:5,flexDirection:'row',alignItems:'center',
                    backgroundColor:"#ffffff",marginBottom:10}]}>
                    <View style={{flex:1, flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                        <Text style={[globalStyle.textHeader]}>{langObj.deliveryTo}</Text>
                        <View style={{flexDirection:"row", alignItems:'center'}}>
                            <FastImage
                                source={require("../image/icon_location.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.03,
                                    height:screenWidth*0.03, marginEnd: 3}}
                            />
                            <Text style={[globalStyle.textHeader,{color:c_text_green}]}>זאב ז’בוטינסקי 2, רמת גן</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={{marginStart:20, marginEnd: 10, flexDirection: 'row', alignItems:'center'}}
                        onPress={()=>{
                            this.props.navigation.goBack();
                        }}>
                        <FastImage
                            source={langObj.isRTL ? require("../image/icon_arrow_blue_left.png"): require("../image/icon_arrow_blue_right.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.045*(70/139),
                                height:screenWidth*0.045
                            }}
                        />
                    </TouchableOpacity>
                </View>
                <View style={{flex:0.5}}></View>
                <Text style={[globalStyle.textBasicBoldStyle,  mStyle.textWelcome,{marginStart:20,marginEnd:20,}]}>{langObj.welcomeText}</Text>
                <View style={{flexDirection: 'row', alignItems: 'center',marginStart:20,marginEnd:20, marginTop: 5 }}>
                    <Text style={[globalStyle.textBasicBoldStyle,  mStyle.textWelcome]}>{langObj.to}</Text>
                    <Text style={[globalStyle.textBasicBoldStyle,  mStyle.textWelcome,{marginStart:5,marginEnd:5,color:c_text_green}]}>{langObj.appName}</Text>
                    <Text style={[globalStyle.textBasicBoldStyle,  mStyle.textWelcome]}>!</Text>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center',marginStart:20,marginEnd:20,marginTop: 15 }}>
                    <Text style={[globalStyle.textBasicStyle,mStyle.textInstruction]}>{langObj.loginInstruction}</Text>
                    <FastImage
                        source={require("../image/icon_smile.png")}
                        resizeMode="contain"
                        style={{
                            width:screenWidth*0.06*(140/142),
                            height:screenWidth*0.06
                        }}
                    />
                </View>
                <View style={{flex:0.5}}></View>
                <FastImage
                    source={require("../image/img_login.png")}
                    resizeMode="contain"
                    style={{
                        width:screenWidth,
                        height:screenWidth*(2057/3375),
                        marginTop: 20
                    }}
                />
                <View style={{flex:1}}></View>
                <TouchableOpacity style={{flexDirection: 'row', marginStart: 20, marginEnd: 20, padding: 15,
                    alignSelf:'stretch', alignItems: 'center', backgroundColor: c_bg_blue, borderRadius: 7}}>
                    <FastImage
                        source={require("../image/icon_facebook.png")}
                        resizeMode="contain"
                        style={{
                            width:screenWidth*0.06,
                            height:screenWidth*0.06,
                            marginStart: 20
                        }}
                    />
                    <Text style={[globalStyle.textBasicBoldStyle, mStyle.textButton]}>{langObj.loginWithFacebook}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={()=>{
                        this.props.navigation.navigate(PhoneInputScreenName);
                    }}
                    style={{flexDirection: 'row', marginStart: 20, marginEnd: 20, marginTop: 15, marginBottom:20 ,padding: 10,
                    alignSelf:'stretch', alignItems: 'center', backgroundColor: c_text_green, borderRadius: 7}}>
                    <FastImage
                        source={require("../image/icon_mail.png")}
                        resizeMode="contain"
                        style={{
                            width:screenWidth*0.06,
                            height:screenWidth*0.06,
                            marginStart: 20
                        }}
                    />
                    <Text style={[globalStyle.textBasicBoldStyle, mStyle.textButton]}>{langObj.loginWithPhone}</Text>
                </TouchableOpacity>
                <View style={{width:this.state.indicatorSizeW, height:this.state.indicatorSizeH, backgroundColor: greyHasOpacity,
                    flexDirection:"column",alignItems:"center", justifyContent:"center", position:"absolute"}}>
                    <ActivityIndicator animating={this.state.indicatorDisplay} size="large" color={c_loading_icon} />
                </View>
            </View>
        );
    }
}
let langObj = getLanguage();
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const mStyle = StyleSheet.create({
    textWelcome : {
        fontSize: 24,
    },
    textInstruction : {
        marginEnd:10,
        fontSize: 14,
    },
    textButton: {
        fontSize: 15,
        color:'#ffffff',
        flex:1,
        textAlign:'center'
    }
})
