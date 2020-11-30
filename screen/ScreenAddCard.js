/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View, Text, TextInput, Dimensions, ActivityIndicator, TouchableOpacity, StyleSheet,
    ScrollView, I18nManager, Platform, KeyboardAvoidingView, Modal, NativeModules, DeviceEventEmitter
} from 'react-native';
import {
    key_user_info, greyHasOpacity, c_loading_icon, isForceRTL, key_screen_comeback, c_main_orange,
    c_grey_darker, c_text_grey, c_grey_light, c_cursor_textInput, AddCardScreenName, c_dark_text,
    rc_token_expire, LandingStackName, rq_add_creditcard, PaymentMethodScreenName, rq_update_creditcard,
} from '../resource/BaseValue';
import * as RNLocalize from "react-native-localize";
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';
import SearchHeaderBarFunc from './SearchHeaderBarFunc';
import {makeAPostRequest} from '../resource/SupportFunction';
import moment from 'moment';
import FastImage from 'react-native-fast-image';

export default class AddCardScreen extends React.Component {
    constructor (props) {
        super(props);
        this.state = ({
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            canContinue: false,
            cardItem:{
                creditcard_id:0,
                name:"",
                type: 0,
                notify_email:"",
                card_num:"",
                valid_thru_month:"",
                valid_thru_year:"",
                cvv:""
            },
            payment_token:"",
            isShowConfirmDialog:false
        })
    }


    componentDidMount (){
        DeviceEventEmitter.addListener('onReceivePaymentToken', this._onReceivePaymentToken);
        console.log(RNLocalize.getLocales());
        RNLocalize.addEventListener("change", () => {
            // do localization related stuff…
        });
        this.loadUserInfo();
        if (this.props.route != null
            && this.props.route.params != null) {
            console.log(this.props.route.params.cardItem);
            let allState = this.state;
            if (this.props.route.params.cardItem != null) {
                allState.cardItem = this.props.route.params.cardItem;
            }
            if (this.props.route.params.previousScreen != null) {
                allState.previousScreen = this.props.route.params.previousScreen;
            }
            this.setState (allState);
        }
    }

    // _onReceivePaymentToken = (e) =>{
    //     if (e !=  null && e != "") {
    //         this.setState({
    //             payment_token: e
    //         }, ()=> {
    //             if (this.state.creditcard_id != 0 && this.state.creditcard_id != "") {
    //                 this.updateCard();
    //             } else {
    //                 this.addCard();
    //             }
    //         })
    //     }
    // }

    componentWillReceiveProps() {
        this.setState({
            canContinue: false,
            cardItem:{
                creditcard_id:0,
                name:"",
                type: 0,
                notify_email:"",
                card_num:"",
                valid_thru_month:"",
                valid_thru_year:"",
                cvv:""
            },
        })
        if (this.props.route != null
            && this.props.route.params != null) {
            let allState = this.state;
            if (this.props.route.params.cardItem != null) {
                allState.cardItem = this.props.route.params.cardItem;
            }
            if (this.props.route.params.previousScreen != null) {
                allState.previousScreen = this.props.route.params.previousScreen;
            } else {
                allState.previousScreen = "";
            }
            this.setState (allState);
        }
    }


    checkInvalidate = () =>{
        if (this.state.cardItem.valid_thru_month != "" && this.state.cardItem.valid_thru_year != ""
                && this.state.cardItem.notify_email != "" && this.state.cardItem.cvv != ""
                && this.state.cardItem.card_num != ""  && this.state.cardItem.name != "") {
            this.setState({canContinue:true});
        } else {
            this.setState({canContinue:false});
        }
    }


    loadUserInfo = async  () => {
        try {
            const value = await AsyncStorage.getItem(key_user_info)
            if(value != null) {
                // value previously stored
                const jsonValue = JSON.parse(value);
                let allState = this.state;
                allState.userInfo = jsonValue;
                this.setState(allState);
            } else {

            }
        } catch(e) {
            // error reading value
        }
    }

    updateCard = async () => {
        if (this.state.userInfo.token != null && this.state.userInfo.token != "") {
            let data = {
                request : rq_update_creditcard,
                token : this.state.userInfo.token,
                creditcard_id: this.state.cardItem.creditcard_id,
                name:this.state.cardItem.name,
                four_last_digits:this.state.cardItem.four_last_digits,
                valid_thru_month:this.state.cardItem.valid_thru_month,
                valid_thru_year:this.state.cardItem.valid_thru_year,
                cvv:this.state.cardItem.cvv,
                notify_email:this.state.cardItem.notify_email,
                payment_token : this.state.payment_token,
                type:this.state.type
            }

            makeAPostRequest(data,
                ()=>this._showLoadingBox(),
                ()=>this._closeLoadingBox(),
                (isSuccess, dataResponse)=>{
                    if (isSuccess) {
                        this.props.navigation.navigate(PaymentMethodScreenName, {
                            refreshScreen: moment(new Date()).millisecond
                        })
                    } else {
                        if (dataResponse == rc_token_expire) {
                            AsyncStorage.setItem(key_screen_comeback, AddCardScreenName);
                            this.props.navigation.navigate(LandingStackName,{
                                previousScreen: AddCardScreenName
                            });
                        } else {
                            alert (dataResponse);
                        }
                    }
                })
        } else {
            AsyncStorage.setItem(key_screen_comeback, AddCardScreenName);
            this.props.navigation.navigate(LandingStackName,{
                previousScreen: AddCardScreenName
            });
        }
    }

    addCard = async () =>{
        if (this.state.userInfo.token != null && this.state.userInfo.token != "") {
            let data = {
                request : rq_add_creditcard,
                token : this.state.userInfo.token,
                name:this.state.cardItem.name,
                four_last_digits:this.state.cardItem.card_num.slice(this.state.cardItem.card_num.length - 4),
                valid_thru_month:this.state.cardItem.valid_thru_month,
                valid_thru_year:this.state.cardItem.valid_thru_year,
                cvv:this.state.cardItem.cvv,
                notify_email:this.state.cardItem.notify_email,
                payment_token:this.state.payment_token,
                type : this.state.type
            }

            makeAPostRequest(data,
                ()=>this._showLoadingBox(),
                ()=>this._closeLoadingBox(),
                (isSuccess, dataResponse)=>{
                    if (isSuccess) {
                        if (this.state.previousScreen != null && this.state.previousScreen != "") {
                            this.props.navigation.navigate(this.state.previousScreen, {
                                previousScreen: AddCardScreenName,
                                refreshScreen: moment(new Date()).millisecond
                            })
                        } else {
                            this.props.navigation.navigate(PaymentMethodScreenName, {
                                refreshScreen: moment(new Date()).millisecond
                            })
                        }
                    } else {
                        if (dataResponse == rc_token_expire) {
                            AsyncStorage.setItem(key_screen_comeback, AddCardScreenName);
                            this.props.navigation.navigate(LandingStackName,{
                                previousScreen: AddCardScreenName
                            });
                        } else {
                            alert (dataResponse);
                        }
                    }
                })
        } else {
            AsyncStorage.setItem(key_screen_comeback, AddCardScreenName);
            this.props.navigation.navigate(LandingStackName,{
                previousScreen: AddCardScreenName
            });
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


    render () {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS == "ios" ? "padding" : "height"}
                style={{flex:1, flexDirection:"column", height:screenHeight}}>
                <SearchHeaderBarFunc navigation={this.props.navigation} title={AddCardScreenName}/>
                <ScrollView style={{backgroundColor:c_grey_light}}>
                    <View style={[globalStyle.sectionTitleContainer]}>
                        <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                            <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection]}>{langObj.addCard}</Text>
                            <FastImage
                                source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_black_d2.png") : require("../image/icon_arrow_right_black_d2.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.08,
                                    height:screenWidth*0.08* (108/156),marginStart:5}}
                            />
                        </View>
                        <View style={{flex:1}}/>
                    </View>
                    <View style={{backgroundColor:"#ffffff", borderRadius:10, margin:20, padding:20, flexDirection: 'column'}}>
                        <View style={[mStyle.inputContainer, {width: sectionInputWidth}]}>
                            <TextInput
                                editable={(this.state.cardItem.creditcard_id != null
                                && this.state.cardItem.creditcard_id != ""
                                && this.state.cardItem.creditcard_id != 0) ? false : true}
                                style={[globalStyle.textBasicBoldStyle, mStyle.textInputContent]}
                                value={this.state.cardItem.card_num}
                                selectionColor={c_cursor_textInput}
                                placeholder={langObj.creditCardNumber}
                                keyboardType="numeric"
                                onChangeText={(text)=>{
                                    let allState = this.state;
                                    allState.cardItem.card_num = text;
                                    this.setState(allState, ()=>{
                                        this.checkInvalidate();
                                    });
                                }}/>
                            <TouchableOpacity>
                                <FastImage
                                    source={require("../image/icon_card_search.png")}
                                    resizeMode="contain"
                                    style={{width:screenWidth*0.1, height:screenWidth*0.1*(176/231)}}
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={{width:sectionInputWidth, flexDirection: "row"}}>
                            <Text style={[globalStyle.textBasicStyle, mStyle.textLabel, {flex:1, marginStart: 0}]}>{langObj.creditCardNumber}</Text>
                            <Text style={[globalStyle.textBasicStyle, {width:screenWidth*0.1, color:c_text_grey}]}>{langObj.search}</Text>
                        </View>
                        <View style={{width:sectionInputWidth, flexDirection: 'row'}}>
                            <View style={[mStyle.inputContainer,{flex:1, paddingBottom:5}]}>
                                <TextInput
                                    editable={(this.state.cardItem.creditcard_id != null
                                        && this.state.cardItem.creditcard_id != ""
                                        && this.state.cardItem.creditcard_id != 0) ? false : true}
                                    style={[globalStyle.textBasicBoldStyle, mStyle.textInputContent,
                                        {flex:1, textAlign: 'center'}]}
                                    selectionColor={c_cursor_textInput}
                                    value={this.state.cardItem.valid_thru_month.toString()}
                                    keyboardType="numeric"
                                    maxLength={2}
                                    onChangeText={(text)=>{
                                        let allState = this.state;
                                        allState.cardItem.valid_thru_month = text;
                                        this.setState(allState,()=>{
                                            this.checkInvalidate();
                                        });
                                    }}/>
                                <Text style={[globalStyle.textBasicBoldStyle,{color:c_main_orange, fontSize:20, alignSelf:"center"}]}>/</Text>
                                <TextInput
                                    editable={(this.state.cardItem.creditcard_id != null
                                        && this.state.cardItem.creditcard_id != ""
                                        && this.state.cardItem.creditcard_id != 0) ? false : true}
                                    style={[globalStyle.textBasicBoldStyle, mStyle.textInputContent,
                                        {flex:1, textAlign: 'center'}]}
                                    selectionColor={c_cursor_textInput}
                                    value={this.state.cardItem.valid_thru_year.toString()}
                                    keyboardType="numeric"
                                    maxLength={2}
                                    onChangeText={(text)=>{
                                        let allState = this.state;
                                        allState.cardItem.valid_thru_year = text;
                                        this.setState(allState,()=>{
                                            this.checkInvalidate();
                                        });
                                    }}/>
                            </View>
                            <View style={[mStyle.inputContainer,{flex:0.5, marginStart: 20}]}>
                                <TextInput
                                    editable={(this.state.cardItem.creditcard_id != null
                                    && this.state.cardItem.creditcard_id != ""
                                    && this.state.cardItem.creditcard_id != 0) ? false : true}
                                    style={[globalStyle.textBasicBoldStyle, mStyle.textInputContent,
                                        {flex:1, textAlign: 'center'}]}
                                    value={this.state.cardItem.cvv}
                                    selectionColor={c_cursor_textInput}
                                    keyboardType="numeric"
                                    maxLength={3}
                                    onChangeText={(text)=>{
                                        let allState = this.state;
                                        allState.cardItem.cvv = text;
                                        this.setState(allState,()=>{
                                            this.checkInvalidate();
                                        });
                                    }}/>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', alignItems:'center'}}>
                            <Text style={[globalStyle.textBasicStyle, mStyle.textLabel, {textAlign: 'center', flex:1}]}>{langObj.cardValidity}</Text>
                            <Text style={[globalStyle.textBasicStyle, mStyle.textLabel, {textAlign: 'center', flex:0.8}]}>{langObj.cvv}</Text>
                        </View>
                        <View style={[mStyle.inputContainer, {width: sectionInputWidth}]}>
                            <TextInput
                                style={[globalStyle.textBasicBoldStyle, mStyle.textInputContent]}
                                value={this.state.cardItem.name}
                                selectionColor={c_cursor_textInput}
                                placeholder={langObj.nameOfCard}
                                onChangeText={(text)=>{
                                    let allState = this.state;
                                    allState.cardItem.name = text;
                                    this.setState(allState,()=>{
                                        this.checkInvalidate();
                                    });
                                }}/>
                        </View>
                        <Text style={[globalStyle.textBasicStyle, mStyle.textLabel]}>{langObj.nameOfCardExample}</Text>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textSection]}>{langObj.cardType}</Text>
                        <View style={{flexDirection: 'row', marginTop:10}}>
                            <TouchableOpacity
                                onPress={()=>{
                                    this.setState({
                                        type: 2
                                    });
                                }}
                                style={{flexDirection: 'row', flex:1, alignItems:'center'}}>
                                <View style={[this.state.type==2 ? mStyle.checkedItems : mStyle.checkItems]}></View>
                                <Text style={[globalStyle.textBasicStyle, mStyle.textLabel, {marginStart: 5}]}>{langObj.customerTypeBusiness}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={()=>{
                                    this.setState({
                                        type: 1
                                    });
                                }}
                                style={{flexDirection: 'row', flex:1, alignItems:'center'}}>
                                <View style={[this.state.type==1 ? mStyle.checkedItems : mStyle.checkItems]}></View>
                                <Text style={[globalStyle.textBasicStyle, mStyle.textLabel, {marginStart: 5}]}>{langObj.customerTypePrivate}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[mStyle.inputContainer, {width: sectionInputWidth}]}>
                            <TextInput
                                style={[globalStyle.textBasicBoldStyle, mStyle.textInputContent]}
                                value={this.state.cardItem.notify_email}
                                selectionColor={c_cursor_textInput}
                                placeholder={langObj.linkedEmail}
                                keyboardType="email-address"
                                onChangeText={(text)=>{
                                    let allState = this.state;
                                    allState.cardItem.notify_email = text;
                                    this.setState(allState,()=>{
                                        this.checkInvalidate();
                                    });
                                }}/>
                        </View>
                        <Text style={[globalStyle.textBasicStyle, mStyle.textLabel]}>{langObj.linkedEmailExplain}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={()=> {
                            if (this.state.canContinue) {
                                // this.setState({isShowConfirmDialog:true})
                                if (this.state.cardItem.creditcard_id != null
                                    && this.state.cardItem.creditcard_id != ""
                                    && this.state.cardItem.creditcard_id != 0){
                                    //We don't need to send anything to Payment service becuse user can update just meta data.
                                    this.updateCard();
                                } else {
                                    let data = {
                                        name:this.state.cardItem.name,
                                        card_num:this.state.cardItem.card_num,
                                        valid_thru_month:this.state.cardItem.valid_thru_month,
                                        valid_thru_year:this.state.cardItem.valid_thru_year,
                                        cvv:this.state.cardItem.cvv,
                                        notify_email:this.state.cardItem.notify_email,
                                        type : 1
                                    }
                                    // this.addCard();
                                    // NativeModules.NativeAct.requestPaymentToken(JSON.stringify(data));
                                    NativeModules.RNPayme.requestPaymentToken(data,
                                        error=>{
                                            alert(error);
                                        },
                                        token => {
                                            this.state.payment_token = token;
                                            this.addCard();
                                        });
                                }
                            } else {
                                alert(langObj.allFieldMandatory);
                            }
                        }}
                        style={[globalStyle.buttonBlack, {backgroundColor: this.state.canContinue ? "#000000" : c_grey_darker }]}>
                        <Text style={[globalStyle.textBasicBoldStyle, {fontSize:20, color:'white'}]}>{langObj.addCard}</Text>
                    </TouchableOpacity>
                    <View style={{height:Platform.OS == "ios" ?40 :30}}/>
                </ScrollView>
                <Modal
                    animationType="fade"
                    transparent
                    visible={this.state.isShowConfirmDialog}>
                    <View style={{flexDirection: "column", height:'100%' ,justifyContent:'flex-end', backgroundColor:'rgba(255,255,255,0.8)'}}>
                        <TouchableOpacity
                            onPress={()=>{
                                this.setState({isShowConfirmDialog: false})
                            }}
                            activeOpacity={1}
                            style={{flex:1, width:screenWidth}}
                        />
                        <View style={[mStyle.modalContainer]}>
                            <TouchableOpacity
                                onPress={()=>{
                                    this.setState({isShowConfirmDialog: false})
                                }}
                                style={{
                                    alignSelf: 'flex-end', padding:10, opacity:0.5
                                }}>
                                <FastImage
                                    source={require("../image/icon_close_black.png")}
                                    resizeMode="contain"
                                    style={{
                                        width:screenWidth*0.035,
                                        height:screenWidth*0.035}}
                                />
                            </TouchableOpacity>
                            <FastImage
                                source={require("../image/icon_card_black.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.15,
                                    height:screenWidth*0.15* (108/140)}}
                            />
                            <Text style={[globalStyle.textBasicBoldStyle,mStyle.textConfirm]}>{langObj.creditWithDibbleCardConfirm}</Text>
                            <TouchableOpacity
                                onPress={()=>{
                                    this.setState({isShowConfirmDialog: false}, ()=>{

                                    })
                                }}
                                style={[mStyle.buttonDarker,{marginTop:20}]}>
                                <Text style={[globalStyle.textBasicBoldStyle, {color:"#ffffff", fontSize:24}]}>{langObj.approve}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={()=>{
                                    this.setState({isShowConfirmDialog: false})
                                }}>
                                <Text style={[globalStyle.textBasicStyle,mStyle.textAction]}>{langObj.skip}</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            onPress={()=>{
                                this.setState({isShowConfirmDialog: false})
                            }}
                            activeOpacity={1}
                            style={{flex:1, width:screenWidth}}
                        />
                    </View>
                </Modal>
                <View style={{width:this.state.indicatorSizeW, height:this.state.indicatorSizeH, backgroundColor: greyHasOpacity,
                    flexDirection:"column",alignItems:"center", justifyContent:"center", position:"absolute"}}>
                    <ActivityIndicator animating={this.state.indicatorDisplay} size="large" color={c_loading_icon} />
                </View>
            </KeyboardAvoidingView>
        );
    }
}
let langObj = getLanguage();
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const sectionInputWidth = screenWidth*0.7;
const mStyle = StyleSheet.create({
    inputContainer : {
        flexDirection: 'row',
        marginTop: 20,
        marginBottom:5,
        borderBottomColor: c_main_orange,
        borderBottomWidth:1,
    },
    textInputContent: {
        fontSize:18,
        color:c_text_grey,
        fontWeight:'bold',
        flex:1,
        textAlign: I18nManager.isRTL || isForceRTL? "right" : "left"
    },
    textLabel: {
        fontSize:16,
        color: c_text_grey
    },
    textHyperLink: {
        fontSize:16,
        marginEnd:10,
        color: c_text_grey,
        fontWeight:'bold'
    },
    textSection: {
        marginTop: 30,
        fontSize:20,
        color: c_text_grey
    },
    checkItems: {
        width:screenWidth*0.06,
        height: screenWidth*0.06,
        borderRadius: screenWidth*0.05,
        borderColor:c_main_orange,
        borderWidth:1,
        margin:5
    },
    checkedItems: {
        width:screenWidth*0.06,
        height: screenWidth*0.06,
        borderRadius: screenWidth*0.05,
        borderColor:c_main_orange,
        borderWidth:7,
        margin:5
    },
    modalContainer: {
        flexDirection:'column',
        padding:10,
        marginStart: 20,
        marginEnd:20,
        borderRadius:20,
        backgroundColor:"#ffffff",
        alignItems:'center',
        minHeight:screenWidth*0.5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    textConfirm: {
        fontSize:20,
        color:c_text_grey,
        textAlign: 'center',
        marginTop:10,
        marginBottom: 10
    },
    buttonDarker: {
        alignSelf:'stretch',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        padding:15,
        backgroundColor:"#000000",
        borderRadius:10,
        marginStart:20,
        marginEnd:20,
        marginTop:10,
        marginBottom:10
    },
    textAction:{
        fontSize:18,
        marginTop: 10,
        marginBottom: 15,
        color: c_dark_text,
        textAlign:'center'
    },
})
