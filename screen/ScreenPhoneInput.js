/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View,
    Text,
    Image, TextInput,
    Dimensions, ActivityIndicator, Alert, TouchableOpacity, StyleSheet, FlatList, Platform, NativeModules,
} from 'react-native';
import {
    c_text_green,
    HomeScreenName,
    key_user_info,
    greyHasOpacity,
    c_loading_icon,
    c_bg_blue,
    c_bg_grey,
    c_label_grey,
    c_dark_line_opacity,
    ProductDetailScreenName,
    PhoneVerificationScreenName,
    SmsVerificationScreenName,
    c_dark_text,
    c_dark_line,
    rq_get_category_products, apiUrl, rc_success, rq_send_sms_code, isForceRTL,
} from '../resource/BaseValue';
import * as RNLocalize from "react-native-localize";
import AsyncStorage from '@react-native-community/async-storage';
import PhoneInput from 'react-native-phone-input';
import RNFloatingInput from '../comp/FloatingInput';
import getLanguage from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';
import FastImage from 'react-native-fast-image';
import { makeAPostRequest } from '../resource/SupportFunction';


let countryData = {};
export default class PhoneInputScreen extends React.Component {
    constructor (props) {
        super(props);
        this.countryPicker = React.createRef();
        this.state = ({
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            phone:"",
            pickerData: null,
            showCountrySelect: false,
            searchText:"",
            countryPhoneCode:"",
            showConfirmDialog:false
        })
    }



    componentDidMount (){
        console.log(RNLocalize.getLocales());
        RNLocalize.addEventListener("change", () => {
            // do localization related stuff…
        });
        // this.setState({
        //     pickerData: this.countryPicker.current.getPickerData(),
        // });
        // setTimeout(()=>{
        //     this.setState({
        //             pickerData: this.countryPicker.current.getPickerData(),
        //         });
        // },500);
        this.setUpCountryViewFist();
    }


    showSelectCountryView = () => {
        if (this.state.pickerData == null) {
            this.setState({pickerData: this.countryPicker.current.getPickerData()})
        }
        this.setState({showCountrySelect: true});
    }

    setUpCountryViewFist = () => {
        let countryCode = RNLocalize.getCountry();
        console.log(countryCode);
        let selectedCountryItem = null;
        let fullList = this.countryPicker.current.getPickerData();
        for (let i = 0; i < fullList.length && selectedCountryItem == null; i++) {
            let item = fullList[i];
            console.log(item.iso2);
            if (item.iso2.toLowerCase() == countryCode.toLowerCase()) {
                selectedCountryItem = item;
            }
        }
        if (selectedCountryItem != null) {
            this.countryPicker.current.selectCountry(selectedCountryItem.iso2);
            this.setState({countryPhoneCode:selectedCountryItem.dialCode});
        }
    }

    closeSelectCountryView = (countrySelected) => {
        if (countrySelected != null) {
            this.countryPicker.current.selectCountry(countrySelected.iso2);
            let allState = this.state;
            allState.countryPhoneCode = countrySelected.dialCode;
            allState.showCountrySelect = false;
            this.setState(allState);
        } else {
            this.setState({showCountrySelect: false});
        }
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

    sendSmsCode = async  () => {
        this._showLoadingBox();
        let dataObj = {
            request: rq_send_sms_code,
            phone_num: this.state.countryPhoneCode+this.state.phone,
        }
        console.log(dataObj);
        makeAPostRequest(dataObj, 
            ()=>this._showLoadingBox(),
            ()=>this._closeLoadingBox(),
            (isSuccess, responseJson)=>{
                if (isSuccess){
                    this.props.navigation.navigate(SmsVerificationScreenName, {
                        userPhone: this.state.phone,
                        userCountryCode: this.state.countryPhoneCode,
                    })
                } else {
                    alert (responseJson);
                }
            })
    }

    showConfirmDialog () {
        this.setState({showConfirmDialog:true});
    }

    closeConfirmDialog () {
        this.setState({showConfirmDialog:false});
    }


    render () {
        return (
            <View style={{flex:1, flexDirection:"column", backgroundColor:'#ffffff'}}>
                <TouchableOpacity
                    onPress={()=>{
                        this.props.navigation.goBack();
                    }}
                    style={{padding: 3, margin:10, alignSelf:'flex-end',width:screenWidth*0.06,height:screenWidth*0.06,
                        alignItems: 'center', justifyContent: 'center', backgroundColor: c_bg_grey, borderRadius: screenWidth*0.05}}>
                    <FastImage
                        source={require("../image/icon_close_black.png")}
                        resizeMode="contain"
                        style={{
                            width:screenWidth*0.03,
                            height:screenWidth*0.03,
                        }}
                    />
                </TouchableOpacity>
                <View style={{flex:0.5}}/>
                <Text style={[globalStyle.textBasicStyle, mStyle.textWelcome,{marginStart:20}]}>{langObj.loginWithPhone}</Text>
                <Text style={[globalStyle.textBasicStyle,mStyle.textInstruction,{marginStart:20, marginTop:10}]}>{langObj.phoneInputInstruction}</Text>
                <View style={{flexDirection:"row", alignItems:"center", margin:20}}>
                    <RNFloatingInput
                        editable={true}
                        label={langObj.yourPhoneNumber}
                        labelSize={12}
                        labelSizeLarge={14}
                        keyboardType={"numeric"}
                        labelColor={c_label_grey}
                        textInputStyle={[globalStyle.textBasicStyle, mStyle.textInputEmail,{borderWidth:0, flex: 1,height: 40,justifyContent:"center",margin:0, fontWeight:'bold',}]}
                        containerStyle={{marginEnd:5, padding: 3,flex:1}}
                        inputValue={this.state.phone}
                        onChangeTextInput={(text) => {
                            this.setState({phone: text})
                        }}>
                    </RNFloatingInput>
                    <View style={{flexDirection: 'column', alignSelf:'stretch', marginStart:3, padding: 3,
                        borderRadius: 7, borderColor: c_dark_line, borderWidth:1, flex:1}}>
                        <Text style={[globalStyle.textBasicStyle,mStyle.textLabel,{color:c_label_grey, margin:2, padding:0}]}>{langObj.country}</Text>
                        <TouchableOpacity
                            onPress={()=>{
                                this.showSelectCountryView();
                            }}
                            style={{flexDirection: "row", alignSelf:'flex-start', alignItems: 'center'}}>
                            <Text style={[globalStyle.textBasicStyle,mStyle.textInputEmail,{flex:1, marginEnd:10}]}>{this.state.countryPhoneCode}</Text>
                            <PhoneInput
                                style={{width:screenWidth*0.1, marginEnd: 5}}
                                ref={this.countryPicker}
                                onPressFlag={()=>{
                                    this.showSelectCountryView();
                                }}
                            />
                            <FastImage
                                source={langObj.isRTL ? require("../image/icon_arrow_left_black.png"): require("../image/icon_arrow_right_black.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.045*(70/139),
                                    height:screenWidth*0.045
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{flex:1}}/>
                <TouchableOpacity
                    onPress={()=>{
                        if (this.state.phone != "") {
                            this.showConfirmDialog();
                        } else {
                            alert (langObj.allFieldMandatory);
                        }
                    }}
                    style={{flexDirection: 'row', marginStart: 20, marginEnd: 20, marginTop: 15, marginBottom:20 ,padding: 10,
                    alignSelf:'stretch', alignItems: 'center',
                    backgroundColor: this.state.phone == "" ? "rgba(18, 210, 179, 0.5)" : "rgb(18, 210, 179)" , borderRadius: 7}}>
                    <Text style={[globalStyle.textBasicStyle, mStyle.textButton,{flex:1, textAlign:'center',
                    color: this.state.phone == "" ? "rgba(0, 189, 133, 0.5)" : "#ffffff" }]}>{langObj.next}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={()=>{
                        this.closeConfirmDialog();
                    }}
                    style={{width:screenWidth, height:screenHeight, backgroundColor: greyHasOpacity,
                        flexDirection: 'column' ,alignItems: 'center', justifyContent: 'center',
                        position:"absolute", top:0, left:this.state.showConfirmDialog? 0 : -screenWidth}}>
                    <View style={{width:screenWidth*0.9, backgroundColor: "#ffffff", borderRadius: 10, padding:10,
                        flexDirection:"column"}}>
                        <Text style={[globalStyle.textBasicStyle,mStyle.textWelcome,{marginTop:20}]}>{langObj.confirmNumber}</Text>
                        <Text style={[globalStyle.textBasicStyle,mStyle.textInstruction,{marginTop:20}]}>{langObj.confirmNumberMessage+ " " + this.state.countryPhoneCode+this.state.phone + "?"}</Text>
                        <View style={{flexDirection: "row", alignItems: 'center', marginTop: 40}}>
                            <TouchableOpacity
                                onPress={()=>{
                                    this.closeConfirmDialog();
                                }}
                                style={{flex:1,flexDirection: "row", alignItems: "center", justifyContent: 'center',
                                    padding:15, backgroundColor: "rgba(18, 210, 179, 0.2)" , borderRadius: 7}}>
                                <Text style={[mStyle.textButton,{flex:1, textAlign:'center', color: c_text_green }]}>{langObj.edit}</Text>
                            </TouchableOpacity>
                            <View style={{width:10}}/>
                            <TouchableOpacity
                                onPress={()=>{
                                    this.setState({showConfirmDialog: false}, ()=>{
                                        this.sendSmsCode();
                                    })
                                }}
                                style={{flex:1,flexDirection: "row", alignItems: "center", justifyContent: 'center',
                                    padding:15, backgroundColor: "rgb(18, 210, 179)" , borderRadius: 7}}>
                                <Text style={[globalStyle.textBasicStyle,mStyle.textButton,{flex:1, textAlign:'center', color: "#ffffff" }]}>{langObj.yes}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={()=>{
                        this.closeSelectCountryView(null);
                    }}
                    style={{width:screenWidth, height:screenHeight, flexDirection: 'column' ,backgroundColor: greyHasOpacity, padding:screenWidth*0.1,
                        position:"absolute", top:0, left:this.state.showCountrySelect? 0 : -screenWidth}}>
                    <TextInput
                        style={[globalStyle.textBasicStyle,mStyle.textButton,{alignSelf:'stretch', margin:0, marginStart:0, flex: 1,height: 40,justifyContent:"center",
                            textAlign: langObj.isRTL? "right" : "left", backgroundColor:"#ffffff"}]}
                        value={this.state.searchText}
                        onChangeText={(text)=>{
                            let allState = this.state;
                            allState.searchText = text;
                            allState.pickerData = [];
                            let fullList = this.countryPicker.current.getPickerData();
                            for (let i = 0; i < fullList.length; i++) {
                                let countryItem = fullList[i];
                                if (countryItem.label.toLowerCase().includes(text.toLowerCase())) {
                                    allState.pickerData.push(countryItem);
                                }
                            }
                            this.setState(allState);
                        }}/>
                    <FlatList
                        style={{ marginTop:1, backgroundColor: "#ffffff"}}
                        data={this.state.pickerData}
                        showsVerticalScrollIndicator={false}
                        renderItem={({item, index}) =>
                            <TouchableOpacity
                                onPress={()=>{
                                    this.closeSelectCountryView(item);
                                }}
                                style={{padding:10, flexDirection: "row", borderBottomColor:"#000000", borderWidth:0.5}}>
                                <Text style={[globalStyle.textBasicStyle,mStyle.textButton,{width:screenWidth*0.2}]}>{item.dialCode}</Text>
                                <Text style={[globalStyle.textBasicStyle,mStyle.textButton, {flex:1}]}>{item.label}</Text>
                            </TouchableOpacity>
                        }
                        keyExtractor={(item) => item.key}
                    />
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
        fontWeight:'bold'
    },
    textInstruction : {
        fontSize: 14,
    },
    textLabel : {
        fontSize: 12,
    },
    textInputEmail : {
        fontSize: 12,
    },
    textButton: {
        fontSize: 14,
        fontWeight: 'bold'
    }
})
