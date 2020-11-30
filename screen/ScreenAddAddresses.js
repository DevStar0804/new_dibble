/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View, Text, Image, StyleSheet, TextInput, Keyboard,
    Dimensions, TouchableOpacity, ActivityIndicator, I18nManager, ScrollView, Platform, KeyboardAvoidingView,
} from 'react-native';
import {
    AddAddressesScreenName, AddCardScreenName,
    c_cursor_textInput,
    c_dark_text,
    c_grey_light,
    c_loading_icon,
    c_main_orange,
    c_text_grey,
    greyHasOpacity,
    isForceRTL,
    key_screen_comeback,
    key_user_info, LandingStackName,
    MyAddressesScreenName, PaymentMethodScreenName,
    placeApiKey,
    rc_token_expire,
    rq_add_address, rq_update_address,
} from '../resource/BaseValue';
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage, {getLanguageCode} from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';
import SearchHeaderBarFunc from './SearchHeaderBarFunc';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import {makeAPostRequest} from '../resource/SupportFunction';
import moment from 'moment';
import 'moment/locale/he';
moment.locale('he');
import FastImage from 'react-native-fast-image';

export default class AddAddressesScreen extends React.Component {
    constructor (props) {
        super(props);
        this.placesSearch = React.createRef();
        this.state = ({
            isRefresh: true,
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            addressInfo:{
                address : "",
                floor:"",
                appartment:"",
                type:1,
                notes:"",
                lat:31.0461,
                lon:34.8516,
                title:""
            },
            isAddressConfirmed: true,

        })
    }

    componentDidMount (){
        this.loadUserInfo();
        if (this.props.route != null
            && this.props.route.params != null) {
            let allState = this.state;
            if (this.props.route.params.addressItem != null) {
                allState.addressInfo = this.props.route.params.addressItem;
            }
            if (this.props.route.params.previousScreen != null) {
                allState.previousScreen = this.props.route.params.previousScreen;
            }
            if (allState.addressInfo.lat == null) {
                allState.addressInfo.lat = 31.0461;
            }
            if (allState.addressInfo.lon == null) {
                allState.addressInfo.lon = 34.8516;
            }
            console.log("addressInfo: " + JSON.stringify(allState));
            this.setState (allState,()=>{
                this.placesSearch.current.setAddressText(this.state.addressInfo.address);
            });
        }
    }

    componentWillReceiveProps () {
        console.log("componentWillReceiveProps");
        this.setState({addressInfo:{
                address : "",
                floor:"",
                appartment:"",
                type:1,
                notes:"",
                lat:31.0461,
                lon:34.8516,
                title:""
            }})
        setTimeout(()=>{
            if (this.props.route != null
                && this.props.route.params != null) {
                let allState = this.state;
                if (this.props.route.params.addressItem != null) {
                    allState.addressInfo = this.props.route.params.addressItem;
                }
                if (this.props.route.params.previousScreen != null) {
                    allState.previousScreen = this.props.route.params.previousScreen;
                }
                allState.addressInfo = this.props.route.params.addressItem;
                if (allState.addressInfo.lat == null) {
                    allState.addressInfo.lat = 31.0461;
                }
                if (allState.addressInfo.lon == null) {
                    allState.addressInfo.lon = 34.8516;
                }
                console.log("addressInfo: " + JSON.stringify(allState));
                this.setState (allState,()=>{
                    this.placesSearch.current.setAddressText(this.state.addressInfo.address);
                });
            }
        }, 500);
    }


    addAddress = async () => {
        let allState = this.state;
        if (allState.addressInfo.address != "") {
            let dataObj = {};
            console.log("addressItem: " + JSON.stringify(allState.addressInfo));
            if (allState.addressInfo.address_id != null && allState.addressInfo.address_id != 0) {
                dataObj = {
                    request: rq_update_address,
                    token: this.state.userInfo.token,
                    address_id: this.state.addressInfo.address_id,
                    title: allState.addressInfo.title,
                    address: allState.addressInfo.address,
                    floor: allState.addressInfo.floor,
                    appartment: allState.addressInfo.appartment,
                    type: allState.addressInfo.type,
                    notes: allState.addressInfo.notes,
                    lat:allState.addressInfo.lat,
                    lon:allState.addressInfo.lon
                }
            } else {
                 dataObj = {
                    request: rq_add_address,
                    token: this.state.userInfo.token,
                    title: allState.addressInfo.title,
                    address: allState.addressInfo.address,
                    floor: allState.addressInfo.floor,
                    appartment: allState.addressInfo.appartment,
                    type: allState.addressInfo.type,
                    notes: allState.addressInfo.notes,
                     lat:allState.addressInfo.lat,
                     lon:allState.addressInfo.lon
                }
            }
            makeAPostRequest(dataObj,
                ()=>this._showLoadingBox(),
                ()=>this._closeLoadingBox(),
                (isSuccess, responseJson)=>{
                    if (isSuccess) {
                        // address_id
                        if (this.state.previousScreen != null && this.state.previousScreen != "") {
                            this.props.navigation.navigate(this.state.previousScreen, {
                                previousScreen: AddAddressesScreenName,
                                refreshScreen: moment(new Date()).millisecond
                            })
                        } else {
                            this.props.navigation.navigate(MyAddressesScreenName, {
                                refreshScreen: moment(new Date()).millisecond
                            })
                        }
                    } else {
                        if (responseJson == rc_token_expire) {
                            AsyncStorage.setItem(key_screen_comeback, AddAddressesScreenName);
                            this.props.navigation.navigate(LandingStackName, {
                                previousScreen: AddAddressesScreenName
                            });
                        } else {
                            alert(responseJson);
                        }
                    }
                })
        } else {

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
                style={{flex:1, flexDirection:"column", backgroundColor:c_grey_light}}>
                <SearchHeaderBarFunc navigation={this.props.navigation} title={AddAddressesScreenName} />
                <View style={{flex:1, flexDirection: 'column'}}>
                    <ScrollView
                        keyboardShouldPersistTaps='always'>
                        <View style={[globalStyle.sectionTitleContainer, {paddingTop:20, paddingBottom:10, marginEnd: 10}]}>
                            <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                                <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection, {color:c_text_grey}]}>{langObj.addAnAddress}</Text>
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
                        <View style={[mStyle.itemSectionContainer]}>
                            <TextInput
                                style={[globalStyle.textBasicStyle, mStyle.textInputNormal, {marginStart:10}]}
                                value={this.state.addressInfo.title}
                                selectionColor={c_cursor_textInput}
                                onChangeText={(text) => {
                                    let allState = this.state;
                                    allState.addressInfo.title = text;
                                    this.setState(allState);
                                }}
                            />
                            <Text style={[globalStyle.textBasicStyle, mStyle.textInputTitle, {marginStart:10, color:"#000000"}]}>{langObj.titleOfPlaceWithExample}</Text>
                            <View style={{flexDirection:'row', alignItems: 'flex-start', borderBottomWidth:1, borderBottomColor:"#000000",padding:0, marginStart: 10, marginTop:20}}>
                                <GooglePlacesAutocomplete
                                    ref={this.placesSearch}
                                    styles={{
                                        textInputContainer: {
                                            backgroundColor: "#ffffff",
                                            borderWidth: 0,
                                            borderTopWidth:0,
                                            flex:1,
                                            margin:0
                                        },
                                        textInput: {
                                            fontFamily: 'OscarFM-Regular',
                                            autoCorrect:false,
                                            autoCompleteType:"off",
                                            writingDirection: I18nManager.isRTL || isForceRTL ? 'rtl' : 'ltr',
                                            textAlign: I18nManager.isRTL || isForceRTL ? 'right' : 'left',
                                            fontSize: 18,
                                            marginStart:0
                                        }
                                    }}
                                    placeholder={langObj.newAddress}
                                    GooglePlacesDetailsQuery={{ fields: 'geometry,formatted_address', }}
                                    fetchDetails={true}
                                    onPress={(data, details = null) => {
                                        // 'details' is provided when fetchDetails = true
                                        // console.log("places: " + JSON.stringify(details));
                                        console.log("location: " + JSON.stringify(details));
                                        let allState = this.state;
                                        allState.addressInfo.lat = details.geometry.location.lat;
                                        allState.addressInfo.lon = details.geometry.location.lng;
                                        allState.addressInfo.address = details.formatted_address;
                                        allState.isAddressConfirmed = false;
                                        this.setState(allState);
                                    }}
                                    query={{
                                        key: placeApiKey,
                                        language: getLanguageCode(),
                                    }}
                                />
                                <FastImage
                                    source={require("../image/icon_search_static.png")}
                                    resizeMode="contain"
                                    style={{
                                        width:screenWidth*0.07,
                                        height:screenWidth*0.07*(138/148),marginEnd:5,marginTop:10}}
                                />
                            </View>
                            <View style={[mStyle.mapContainer]}>
                                <MapView
                                    provider={PROVIDER_GOOGLE}
                                    style={mStyle.mapObj}
                                    onRegionChange={(region)=>{
                                        let allState = this.state;
                                        allState.addressInfo.lat = region.latitude;
                                        allState.addressInfo.lon = region.longitude;
                                        this.setState(allState);
                                    }}
                                    initialRegion={{
                                        latitude: this.state.addressInfo.lat,
                                        longitude: this.state.addressInfo.lon,
                                        latitudeDelta: 0.0025,
                                        longitudeDelta: 0.0025
                                    }}>
                                    {/*<Marker*/}
                                    {/*    draggable*/}
                                    {/*    onDragEnd={(e) => {*/}
                                    {/*        let allState = this.state;*/}
                                    {/*        allState.addressInfo.lat = e.nativeEvent.coordinate.latitude;*/}
                                    {/*        allState.addressInfo.lon = e.nativeEvent.coordinate.longitude;*/}
                                    {/*        this.setState(allState);*/}
                                    {/*    }}*/}
                                    {/*    coordinate={{ latitude: this.state.addressInfo.lat, longitude: this.state.addressInfo.lon }}*/}
                                    {/*    title={""}*/}
                                    {/*    description={""}*/}
                                    {/*/>*/}
                                </MapView>
                                <FastImage
                                    source={require("../image/icon_location.png")}
                                    resizeMode="contain"
                                    style={{
                                        width:screenWidth*0.09,
                                        height:screenWidth*0.09,
                                        position:"absolute",
                                        start:screenWidth*(0.5-0.09)-14,
                                        top:screenWidth*(0.3-0.09)-2
                                    }}
                                />
                            </View>
                            <Text style={[globalStyle.textBasicStyle,{fontSize:18, textAlign:'center', marginTop:10, display: this.state.isAddressConfirmed ? "none":"flex"}]}>
                                {langObj.approveLocationMessage}
                            </Text>
                            <View style={{flexDirection:'column', display: this.state.isAddressConfirmed?"flex":"none"}}>
                                <TextInput
                                    style={[globalStyle.textBasicStyle, mStyle.textInputNormal]}
                                    value={this.state.addressInfo.floor}
                                    selectionColor={c_cursor_textInput}
                                    onChangeText={(text) => {
                                        let allState = this.state;
                                        allState.addressInfo.floor = text;
                                        this.setState(allState);
                                    }}
                                />
                                <Text style={[globalStyle.textBasicStyle, mStyle.textInputTitle]}>{langObj.floor}</Text>
                                <TextInput
                                    style={[globalStyle.textBasicStyle, mStyle.textInputNormal]}
                                    value={this.state.addressInfo.appartment}
                                    selectionColor={c_cursor_textInput}
                                    onChangeText={(text) => {
                                        let allState = this.state;
                                        allState.addressInfo.appartment = text;
                                        this.setState(allState);
                                    }}
                                />
                                <Text style={[globalStyle.textBasicStyle, mStyle.textInputTitle]}>{langObj.apartment}</Text>
                                <Text style={[globalStyle.textBasicStyle, mStyle.textInputTitle]}>{langObj.approve}</Text>
                                <Text style={[globalStyle.textBasicBoldStyle, globalStyle.textSection, {marginTop: 20}]}>{langObj.placeType}</Text>
                                <View style={{flexDirection:"row", alignItems:'center', justifyContent:'space-between', marginTop:10, paddingEnd: 20}}>
                                    <TouchableOpacity
                                        onPress={()=>{
                                            if (this.state.addressInfo.type != 1){
                                                let allState = this.state;
                                                allState.addressInfo.type = 1;
                                                this.setState(allState);
                                            }
                                        }}
                                        style={{flexDirection:"row", alignItems:'center'}}>
                                        <View style={[this.state.addressInfo.type == 1 ? mStyle.checkedItems : mStyle.checkItems]}></View>
                                        <Text style={[globalStyle.textBasicStyle, mStyle.textAddressType]}>{langObj.home}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={()=>{
                                            if (this.state.addressInfo.type != 2){
                                                let allState = this.state;
                                                allState.addressInfo.type = 2;
                                                this.setState(allState);
                                            }
                                        }}
                                        style={{flexDirection:"row", alignItems:'center'}}>
                                        <View style={[this.state.addressInfo.type == 2 ? mStyle.checkedItems : mStyle.checkItems]}></View>
                                        <Text style={[globalStyle.textBasicStyle, mStyle.textAddressType]}>{langObj.office}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={()=>{
                                            if (this.state.addressInfo.type != 3){
                                                let allState = this.state;
                                                allState.addressInfo.type = 3;
                                                this.setState(allState);
                                            }
                                        }}
                                        style={{flexDirection:"row", alignItems:'center'}}>
                                        <View style={[this.state.addressInfo.type == 3 ? mStyle.checkedItems : mStyle.checkItems]}></View>
                                        <Text style={[globalStyle.textBasicStyle, mStyle.textAddressType]}>{langObj.place}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={()=>{
                                this.setState({isAddressConfirmed:true})
                            }}
                            style={[mStyle.buttonDarker,{display: this.state.isAddressConfirmed ? "none":"flex"}]}>
                            <Text style={[globalStyle.textBasicBoldStyle, {color:"#ffffff", fontSize:24}]}>{langObj.approve}</Text>
                        </TouchableOpacity>
                        <View style={{flexDirection:'column', display: this.state.isAddressConfirmed?"flex":"none"}}>
                            <View style={[globalStyle.sectionTitleContainer, {paddingTop:20, paddingBottom:10, marginEnd: 10}]}>
                                <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                                    <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection, {color:c_text_grey}]}>{langObj.addressNote}</Text>
                                    <View style={{flex:1}}/>
                                </View>
                            </View>
                            <TextInput
                                style={[globalStyle.textBasicStyle, mStyle.textInputNote, {textAlignVertical: 'top', minHeight:screenHeight*0.2}]}
                                numberOfLines={6}
                                onBlur={() => {
                                    console.log("on Blur;");
                                    Keyboard.dismiss();
                                }}
                                value={this.state.addressInfo.notes}
                                placeholder={langObj.addressNotePlaceholder}
                                onChangeText={(text) => {
                                    let allState = this.state;
                                    allState.addressInfo.notes = text;
                                    this.setState(allState);
                                }}
                            />
                            <TouchableOpacity
                                onPress={()=>{
                                    this.addAddress();
                                }}
                                style={[mStyle.buttonDarker,{marginTop:20}]}>
                                <Text style={[globalStyle.textBasicBoldStyle, {color:"#ffffff", fontSize:24}]}>{langObj.approve}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{height:80}}/>
                    </ScrollView>
                </View>
                <View style={{width:this.state.indicatorSizeW, height:this.state.indicatorSizeH, backgroundColor: greyHasOpacity,
                    flexDirection:"column",alignItems:"center", justifyContent:"center", position:"absolute",top:0,left:0}}>
                    <ActivityIndicator animating={this.state.indicatorDisplay} size="large" color={c_loading_icon} />
                </View>
            </KeyboardAvoidingView>
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
        flexDirection:'column',
        paddingTop:20,
        paddingBottom:20,
        paddingStart:10,
        paddingEnd:10,
        backgroundColor:"#ffffff",
        borderRadius:10
    },
    mapContainer: {
        flexDirection:'column',
        alignItems:'center',
        justifyContent: 'center',
        marginTop:20,
        height:screenHeight*0.3,
        width: screenWidth-60
    },
    mapObj:{
        width: screenWidth-60,
        height:screenHeight*0.3,
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
    textInputNormal:{
        fontSize:18,
        borderBottomColor:c_text_grey,
        borderBottomWidth:1,
        paddingBottom: 5,
        marginTop:15,
        textAlign: I18nManager.isRTL || isForceRTL ? 'right' : 'left',
    },
    textInputNote:{
        fontSize:18,
        textAlignVertical:'top',
        backgroundColor:"#ffffff",
        padding: 10,
        marginTop:15,
        textAlign: I18nManager.isRTL || isForceRTL ? 'right' : 'left',
        width:screenWidth-40,
        marginStart:20,
        borderRadius:5
    },
    textInputTitle: {
        fontSize:18,
        color:c_text_grey
    },
    textAddressType: {
        fontSize:18,
        color:"#000000"
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
        color: c_dark_text
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
    }
})
