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
    AddAddressesScreenName,
    c_dark_text,
    c_loading_icon,
    c_main_background,
    c_main_orange,
    c_text_grey,
    greyHasOpacity,
    key_screen_comeback,
    key_user_info,
    LandingStackName,
    MyAddressesScreenName,
    rc_token_expire,
    rq_add_address,
    rq_delete_address,
    rq_get_addresses,
    rq_set_address_as_default,
} from '../resource/BaseValue';
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';
import SearchHeaderBarFunc from './SearchHeaderBarFunc';
import {makeAPostRequest} from '../resource/SupportFunction';
import FastImage from 'react-native-fast-image';

export default class MyAddressesScreen extends React.Component {
    constructor (props) {
        super(props);
        this.state = ({
            searchText:"אימפקט",
            isRefresh: true,
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            addresses:[
                {
                    address_id:1,
                    title:langObj.newAddress,
                    address:langObj.addNewAddress,
                    floor:"",
                    appartment: "",
                    type : 0,
                    notes:"",
                    is_default:0,
                    lat:0,
                    lon:0
                }
            ],
            isShowMenuList: false,
            isShowDeleteDialog: false,
            selectedAddress:"",
            selectedAddressIndex:-1
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
                this.loadMyAddresses();
            }
        }, 500);
    }

    loadMyAddresses = async () => {
        let dataObj = {
            request: rq_get_addresses,
            token: this.state.userInfo.token,
        }
        makeAPostRequest(dataObj,
            ()=>this._showLoadingBox(),
            ()=>this._closeLoadingBox(),
            (isSuccess, dataResponse)=>{
                if (isSuccess) {
                    let allState = this.state;
                    allState.addresses = dataResponse.addresses;
                    allState.addresses.push({
                        address_id:0,
                        title:langObj.newAddress,
                        address:langObj.addNewAddress,
                        floor:"",
                        appartment: "",
                        type : 0,
                        notes:""
                    })
                    this.setState(allState);
                } else {
                    if (dataResponse == rc_token_expire) {
                        AsyncStorage.setItem(key_screen_comeback, MyAddressesScreenName);
                        this.props.navigation.navigate(LandingStackName, {
                            previousScreen: MyAddressesScreenName
                        });
                    } else {
                        alert(dataResponse);
                    }
                }
            })
    }

    deleteAddress = async () =>{
        let dataObj = {
            request: rq_delete_address,
            token: this.state.userInfo.token,
            address_id: this.state.addresses[this.state.selectedAddressIndex].address_id
        }
        makeAPostRequest(dataObj,
            ()=>this._showLoadingBox(),
            ()=>{},
            (isSuccess, dataResponse)=>{
                if (isSuccess) {
                    this.loadMyAddresses();
                } else {
                    this._closeLoadingBox();
                    if (dataResponse == rc_token_expire) {
                        AsyncStorage.setItem(key_screen_comeback, MyAddressesScreenName);
                        this.props.navigation.navigate(LandingStackName, {
                            previousScreen: MyAddressesScreenName
                        });
                    } else {
                        alert(dataResponse);
                    }
                }
            })
    }


    loadUserInfo = async  () => {
        try {
            const value = await AsyncStorage.getItem(key_user_info)
            if(value != null) {
                // value previously stored
                const jsonValue = JSON.parse(value);
                let allState = this.state;
                allState.userInfo = jsonValue;
                this.setState(allState, ()=>this.loadMyAddresses());
            } else {

            }
        } catch(e) {
            // error reading value
        }
    }

    getAddressTypeIcon = (type) => {
        if (type == 1) {
            return require("../image/add_home.png");
        } else if (type == 2) {
            return require("../image/add_work.png");
        } else if (type == 3) {
            return require("../image/add_place.png");
        } else {
            return require("../image/add_addnew.png");
        }
    }

    setAddressFavourite = async  () =>{
        let dataObj = {
            request: rq_set_address_as_default,
            token: this.state.userInfo.token,
            address_id: this.state.addresses[this.state.selectedAddressIndex].address_id
        }
        makeAPostRequest(dataObj,
            ()=>this._showLoadingBox(),
            ()=>this._closeLoadingBox(),
            (isSuccess, dataResponse)=>{
                if (isSuccess) {
                    let allState = this.state;
                    for (let i = 0; i < allState.addresses.length; i++) {
                        if (i == this.state.selectedAddressIndex) {
                            allState.addresses[i].is_default = 1;
                        } else {
                            allState.addresses[i].is_default = 0;
                        }

                    }
                    allState.isShowMenuList = false;
                    this.setState(allState);
                } else {
                    this._closeLoadingBox();
                    if (dataResponse == rc_token_expire) {
                        AsyncStorage.setItem(key_screen_comeback, MyAddressesScreenName);
                        this.props.navigation.navigate(LandingStackName, {
                            previousScreen: MyAddressesScreenName
                        });
                    } else {
                        alert(dataResponse);
                    }
                }
            })
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
                <SearchHeaderBarFunc navigation={this.props.navigation} title={MyAddressesScreenName} />
                <View style={[globalStyle.sectionTitleContainer, {paddingTop:20, paddingBottom:10, marginEnd: 10}]}>
                    <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                        <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection, {color:c_text_grey}]}>{langObj.myAddress}</Text>
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
                    data={this.state.addresses}
                    extraData={this.state}
                    showsVerticalScrollIndicator={false}
                    renderItem={({item, index}) =>
                        <TouchableOpacity
                            onPress={()=>{
                                if (index == this.state.addresses.length-1) {
                                    this.props.navigation.navigate(AddAddressesScreenName);
                                } else {
                                    this.setState({
                                        selectedAddress: item.title,
                                        selectedAddressIndex: index,
                                        isShowMenuList: true,
                                    })
                                }

                            }}
                            style={[mStyle.itemSectionContainer, {borderRadius:10}]}>
                            <FastImage
                                source={this.getAddressTypeIcon(item.type)}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.1,
                                    height:screenWidth*0.1}}
                            />
                            <View style={{flexDirection:'column', alignItems: 'flex-start', flex:1, opacity: item.type == "" ? 0.3:1, marginEnd:5}}>
                                <Text numberOfLines={1} style={[globalStyle.textBasicBoldStyle,mStyle.textTitle]}>{item.title}</Text>
                                <View style={{flexDirection:'row', alignItems:'center'}}>
                                    <FastImage
                                        source={require("../image/icon_pin_location.png")}
                                        resizeMode="contain"
                                        style={{
                                            width:screenWidth*0.02,
                                            height:screenWidth*0.02*(54/36), marginEnd: 5}}
                                    />
                                    <Text numberOfLines={1} style={[globalStyle.textBasicStyle,mStyle.textNormalContent]}>{item.address}</Text>
                                </View>
                            </View>
                            <FastImage
                                source={require("../image/add_default.png")}
                                resizeMode="contain"
                                style={{
                                    display: item.is_default==1 ? "flex": "none",
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
                    keyExtractor={(item) => item.product_id}
                />
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
                            <Text style={[globalStyle.textBasicStyle,mStyle.textAction]}>{langObj.safeToDeleteConfirm}</Text>
                            <TouchableOpacity
                                onPress={()=>{
                                    this.setState({isShowDeleteDialog: false}, ()=>{
                                        this.deleteAddress();
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
                                <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection]}>{this.state.selectedAddress}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={()=>{
                                    this.setState({isShowMenuList: false}, ()=>{
                                        this.setAddressFavourite();
                                    })
                                }}>
                                <Text style={[globalStyle.textBasicStyle,mStyle.textAction]}>{langObj.setAsDefault}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={()=>{
                                    this.setState({
                                        isShowMenuList:false
                                    }, ()=>{
                                        this.props.navigation.navigate(AddAddressesScreenName, {
                                            addressItem : this.state.addresses[this.state.selectedAddressIndex]
                                        })
                                    })
                                }}>
                                <Text style={[globalStyle.textBasicStyle,mStyle.textAction]}>{langObj.editAddress}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={()=>{
                                    this.setState({
                                        isShowMenuList:false,
                                        isShowDeleteDialog: true,
                                    })
                                }}>
                                <Text style={[globalStyle.textBasicStyle,mStyle.textAction,{color:'red'}]}>{langObj.removeAddress}</Text>
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
