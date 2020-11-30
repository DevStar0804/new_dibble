/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View, Text, Image, StyleSheet, FlatList,
    Dimensions, TouchableOpacity, ActivityIndicator, I18nManager, Modal, ScrollView,
} from 'react-native';
import {
    AddAddressesScreenName, AddCardScreenName,
    c_dark_text,
    c_loading_icon,
    c_main_background,
    c_main_orange, c_red,
    c_text_grey,
    greyHasOpacity,
    key_screen_comeback,
    key_user_info,
    LandingStackName,
    MyAddressesScreenName,
    PaymentMethodScreenName,
    rc_token_expire,
    rq_add_address, rq_add_creditcard,
    rq_delete_address, rq_delete_creditcard,
    rq_get_addresses, rq_get_creditcards, rq_set_default_creditcard,
} from '../resource/BaseValue';
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';
import SearchHeaderBarFunc from './SearchHeaderBarFunc';
import {makeAPostRequest} from '../resource/SupportFunction';
import moment from 'moment';
import FastImage from 'react-native-fast-image';

export default class PaymentMethodScreen extends React.Component {
    constructor (props) {
        super(props);
        this.state = ({
            searchText:"אימפקט",
            isRefresh: true,
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            dibbleCards:[
                {
                    card_id:1,
                    name:langObj.DibbleCoin,
                    content:langObj.requestCreditOneClick,
                    cardNumber:"",
                    valid_thru_month: "",
                    valid_thru_year: "",
                }
            ],
            creditcards:[
                {
                    creditcard_id: 0,
                    name: langObj.newCard,
                    content:langObj.addCreditCard,
                    type: 2,
                    notify_email: "phyc@Gmail.com",
                    card_num: "123456789",
                    valid_thru_month: 11,
                    valid_thru_year: 20,
                    cvv: "555",
                    is_default: 0
                }
            ],
            isShowMenuList: false,
            isShowDeleteDialog: false,
            selectedMethod:1,
            selectedCardTitle:"",
            selectedCardIndex:-1
        })
    }


    componentDidMount (){
        this.loadUserInfo();
    }

    componentWillReceiveProps () {
        console.log("componentWillReceiveProps");
        setTimeout(()=>{
            if (this.props.route != null
                && this.props.route.params != null
                && this.props.route.params.refreshScreen != null) {
                this.loadMyCard();
            }
        }, 500);
    }

    loadMyCard = async () => {
        if (this.state.userInfo.token != null && this.state.userInfo.token != "") {
            let data = {
                request : rq_get_creditcards,
                token : this.state.userInfo.token,
            }
            makeAPostRequest(data,
                ()=>this._showLoadingBox(),
                ()=>this._closeLoadingBox(),
                (isSuccess, dataResponse)=>{
                    if (isSuccess) {
                        let allState = this.state;
                        allState.creditcards = dataResponse.creditcards;
                        allState.creditcards.push({
                            creditcard_id: 0,
                            name: langObj.newCard,
                            content:langObj.addCreditCard,
                            type: 2,
                            notify_email: "",
                            card_num: "",
                            valid_thru_month: 0,
                            valid_thru_year: 0,
                            cvv: "",
                            is_default: 0
                        })
                        this.setState(allState);
                    } else {
                        if (dataResponse == rc_token_expire) {
                            AsyncStorage.setItem(key_screen_comeback, PaymentMethodScreenName);
                            this.props.navigation.navigate(LandingStackName,{
                                previousScreen: PaymentMethodScreenName
                            });
                        } else {
                            alert (dataResponse);
                        }
                    }
                })
        } else {
            AsyncStorage.setItem(key_screen_comeback, PaymentMethodScreenName);
            this.props.navigation.navigate(LandingStackName,{
                previousScreen: PaymentMethodScreenName
            });
        }
    }

    deleteCard = async () =>{
        if (this.state.selectedMethod == 2) {
            let cardId = this.state.creditcards[this.state.selectedCardIndex].creditcard_id;
            let data = {
                request : rq_delete_creditcard,
                token : this.state.userInfo.token,
                creditcard_id:cardId
            }
            makeAPostRequest(data,
                ()=>this._showLoadingBox(),
                ()=>this._closeLoadingBox(),
                (isSuccess, dataResponse)=>{
                    if (isSuccess) {
                        this.loadMyCard();
                    } else {
                        if (dataResponse == rc_token_expire) {
                            AsyncStorage.setItem(key_screen_comeback, PaymentMethodScreenName);
                            this.props.navigation.navigate(LandingStackName,{
                                previousScreen: PaymentMethodScreenName
                            });
                        } else {
                            alert (dataResponse);
                        }
                    }
                })
        }
    }

    setDefault = async () =>{
        if (this.state.selectedMethod == 2) {
            let cardId = this.state.creditcards[this.state.selectedCardIndex].creditcard_id;
            let data = {
                request : rq_set_default_creditcard,
                token : this.state.userInfo.token,
                creditcard_id:cardId
            }
            makeAPostRequest(data,
                ()=>this._showLoadingBox(),
                ()=>this._closeLoadingBox(),
                (isSuccess, dataResponse)=>{
                    if (isSuccess) {
                        this.loadMyCard();
                    } else {
                        if (dataResponse == rc_token_expire) {
                            AsyncStorage.setItem(key_screen_comeback, PaymentMethodScreenName);
                            this.props.navigation.navigate(LandingStackName,{
                                previousScreen: PaymentMethodScreenName
                            });
                        } else {
                            alert (dataResponse);
                        }
                    }
                })
        }
    }

    loadCreditCardIcon (cardItem) {
        if (cardItem.name == langObj.newCard){
            return require("../image/add_addnew.png");
        } else {
            return require("../image/icon_card_black.png");
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
                this.setState(allState, ()=>this.loadMyCard());
            } else {

            }
        } catch(e) {
            // error reading value
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
            <View style={{flex:1, flexDirection:"column", backgroundColor:c_main_background}}>
                <SearchHeaderBarFunc navigation={this.props.navigation} title={PaymentMethodScreenName} />
                <ScrollView>
                    <View style={[globalStyle.sectionTitleContainer, {paddingTop:20, paddingBottom:10, marginEnd: 10}]}>
                        <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                            <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection, {color:c_text_grey}]}>{langObj.DibbleCoin}</Text>
                            <FastImage
                                source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_black_d2.png") : require("../image/icon_arrow_right_black_d2.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.08,
                                    height:screenWidth*0.08* (108/156),marginStart:5}}
                            />
                            <View style={{flex:1}}/>
                        </View>
                    </View>
                    <FlatList
                        style={{ marginTop:0}}
                        data={this.state.dibbleCards}
                        extraData={this.state}
                        showsVerticalScrollIndicator={false}
                        renderItem={({item, index}) =>
                            <TouchableOpacity
                                onPress={()=>{
                                    this.setState({
                                        selectedMethod:1,
                                        selectedCardTitle:item.name,
                                        selectedCardIndex:index,
                                        isShowMenuList: true
                                    })

                                }}
                                style={[globalStyle.sectionContainer]}>
                                <FastImage
                                    source={require("../image/icon_dibble_coin.png")}
                                    resizeMode="contain"
                                    style={{
                                        width:screenWidth*0.1,
                                        height:screenWidth*0.1}}
                                />
                                <View style={{flexDirection:'column', alignItems: 'flex-start', flex:1, opacity: item.type == "" ? 0.3:1, marginEnd:5,marginStart:5}}>
                                    <Text numberOfLines={1} style={[globalStyle.textBasicBoldStyle,mStyle.textTitle]}>{item.name}</Text>
                                    <Text numberOfLines={1} style={[globalStyle.textBasicStyle,mStyle.textNormalContent]}>{item.content}</Text>
                                </View>
                                <FastImage
                                    source={require("../image/add_default.png")}
                                    resizeMode="contain"
                                    style={{
                                        display: item.isDefault ? "flex": "none",
                                        width:screenWidth*0.1,
                                        height:screenWidth*0.1* (108/156)}}
                                />
                                <FastImage
                                    source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_black.png") : require("../image/icon_arrow_right_black.png")}
                                    resizeMode="contain"
                                    style={{
                                        opacity: item.type == "" ? 0.3:1,
                                        width:screenWidth*0.08,
                                        height:screenWidth*0.08* (108/156)}}
                                />
                            </TouchableOpacity>
                        }
                        keyExtractor={(item) => item.card_id}
                    />
                    <View style={[globalStyle.sectionTitleContainer, {paddingTop:20, paddingBottom:10, marginEnd: 10}]}>
                        <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                            <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection, {color:c_text_grey}]}>{langObj.billingCreditCard}</Text>
                            <FastImage
                                source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_black_d2.png") : require("../image/icon_arrow_right_black_d2.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.08,
                                    height:screenWidth*0.08* (108/156),marginStart:5}}
                            />
                            <View style={{flex:1}}/>
                        </View>
                    </View>
                    <FlatList
                        style={{ marginTop:0}}
                        data={this.state.creditcards}
                        extraData={this.state}
                        showsVerticalScrollIndicator={false}
                        renderItem={({item, index}) =>
                            <TouchableOpacity
                                onPress={()=>{
                                    if (index == this.state.creditcards.length-1) {
                                        this.props.navigation.navigate(AddCardScreenName);
                                    } else {
                                        this.setState({
                                            selectedMethod:2,
                                            selectedCardTitle:item.name,
                                            selectedCardIndex:index,
                                            isShowMenuList: true
                                        })
                                    }
                                }}
                                style={[globalStyle.sectionContainer]}>
                                <FastImage
                                    source={this.loadCreditCardIcon(item)}
                                    resizeMode="contain"
                                    style={{
                                        width:screenWidth*0.1,
                                        height:screenWidth*0.1}}
                                />
                                <View style={{flexDirection:'column', alignItems: 'flex-start', flex:1, opacity: item.name == langObj.newCard ? 0.3:1, marginEnd:5, marginStart:5}}>
                                    <Text numberOfLines={1} style={[globalStyle.textBasicBoldStyle,mStyle.textTitle]}>{item.name}</Text>
                                    <Text numberOfLines={1} style={[globalStyle.textBasicStyle,mStyle.textNormalContent]}>{index == this.state.creditcards.length-1?langObj.addCreditCard:langObj.masterCard + " " + item.card_num}</Text>
                                </View>
                                <FastImage
                                    source={require("../image/add_default.png")}
                                    resizeMode="contain"
                                    style={{
                                        display: item.is_default == 1 ? "flex": "none",
                                        width:screenWidth*0.1,
                                        height:screenWidth*0.1* (108/156)}}
                                />
                                <FastImage
                                    source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_black.png") : require("../image/icon_arrow_right_black.png")}
                                    resizeMode="contain"
                                    style={{
                                        opacity: item.name == langObj.newCard ? 0.3:1,
                                        width:screenWidth*0.08,
                                        height:screenWidth*0.08* (108/156)}}
                                />
                            </TouchableOpacity>
                        }
                        keyExtractor={(item) => item.card_id}
                    />
                </ScrollView>
                <Modal
                    animationType="fade"
                    transparent
                    visible={this.state.isShowDeleteDialog}>
                    <View style={{flexDirection: "column", height:'100%' ,justifyContent:'flex-end', backgroundColor:'rgba(0,0,0,0.8)'}}>
                        <TouchableOpacity
                            onPress={()=>{
                                this.setState({isShowDeleteDialog: false})
                            }}
                            activeOpacity={1}
                            style={{flex:1, width:screenWidth}}
                        />
                        <View style={[mStyle.modalContainer]}>
                            <FastImage
                                source={require("../image/icon_delete_address.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.15,
                                    height:screenWidth*0.15* (108/140)}}
                            />
                            <View style={[globalStyle.sectionTitleCenterContainer,{marginBottom:10, paddingBottom: 10}]}>
                                <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection]}>{langObj.safeToDelete}</Text>
                            </View>
                            <Text style={[globalStyle.textBasicStyle,mStyle.textAction]}>{langObj.deleteCardConfirmMessage}</Text>
                            <TouchableOpacity
                                onPress={()=>{
                                    this.setState({isShowDeleteDialog: false}, ()=>{
                                        this.deleteCard();
                                    })
                                }}
                                style={[mStyle.buttonDarker,{marginTop:20}]}>
                                <Text style={[globalStyle.textBasicBoldStyle, {color:"#ffffff", fontSize:24}]}>{langObj.approve}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={()=>{
                                    this.setState({isShowDeleteDialog: false})
                                }}>
                                <Text style={[globalStyle.textBasicStyle,mStyle.textAction]}>{langObj.cancel}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Modal
                    animationType="fade"
                    transparent
                    visible={this.state.isShowMenuList}>
                    <View style={{flexDirection: "column", height:'100%' ,justifyContent:'flex-end', backgroundColor:'rgba(0,0,0,0.8)'}}>
                        <TouchableOpacity
                            onPress={()=>{
                                this.setState({isShowMenuList: false})
                            }}
                            activeOpacity={1}
                            style={{flex:1, width:screenWidth}}
                        />
                        <View style={[mStyle.modalContainer]}>
                            <View style={[globalStyle.sectionTitleCenterContainer,{marginBottom:10, paddingBottom: 10}]}>
                                <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection]}>{this.state.selectedCardTitle}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={()=>{
                                    let allState = this.state;
                                    if (allState.selectedMethod == 1) {
                                        for (let i = 0; i < allState.dibbleCards.length; i++) {
                                            if (i == this.state.selectedCardIndex) {
                                                allState.dibbleCards[i].isDefault = true;
                                            } else {
                                                allState.dibbleCards[i].isDefault = false;
                                            }

                                        }
                                    } else {
                                        for (let i = 0; i < allState.creditcards.length; i++) {
                                            if (i == this.state.selectedCardIndex) {
                                                allState.creditcards[i].is_default = 1;
                                            } else {
                                                allState.creditcards[i].is_default = 0;
                                            }

                                        }
                                    }
                                    allState.isShowMenuList = false;
                                    this.setState(allState, ()=>{
                                        this.setDefault();
                                    });
                                }}>
                                <Text style={[globalStyle.textBasicStyle,mStyle.textAction]}>{langObj.setThisCardAsDefault}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={()=>{
                                    this.setState({
                                        isShowMenuList:false
                                    }, ()=>{
                                        if (this.state.selectedMethod == 1) {
                                            this.props.navigation.navigate(AddCardScreenName, {
                                                cardItem : this.state.dibbleCards[this.state.selectedCardIndex]
                                            })
                                        } else {
                                            this.props.navigation.navigate(AddCardScreenName, {
                                                cardItem : this.state.creditcards[this.state.selectedCardIndex]
                                            })
                                        }
                                    })
                                }}>
                                <Text style={[globalStyle.textBasicStyle,mStyle.textAction]}>{langObj.editCardDetails}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={()=>{
                                    this.setState({
                                        isShowMenuList:false,
                                        isShowDeleteDialog: true,
                                    })
                                }}>
                                <Text style={[globalStyle.textBasicStyle,mStyle.textAction, {color:c_red}]}>{langObj.deleteCard}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <View style={{width:this.state.indicatorSizeW, height:this.state.indicatorSizeH, backgroundColor: greyHasOpacity,
                    flexDirection:"column",alignItems:"center", justifyContent:"center", position:"absolute",top:0,left:0}}>
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
    itemSectionContainer: {
        width: screenWidth-40,
        marginStart:20,
        marginTop:10,
        marginBottom:10,
        flexDirection:'row',
        paddingTop:20,
        paddingBottom:20,
        paddingStart:10,
        paddingEnd:10,
        backgroundColor:"#ffffff",
        alignItems:'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    textNormalContent: {
        fontSize:18,
    },
    textTitle: {
        fontSize: 20,
    },
    modalContainer: {
        flexDirection:'column',
        padding:10,
        borderTopLeftRadius:20,
        borderTopRightRadius:20,
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
    textAction:{
        fontSize:18,
        marginTop: 10,
        marginBottom: 15,
        color: c_dark_text,
        textAlign:'center'
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
})
