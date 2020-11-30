/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View, Text, Image, StyleSheet, ImageBackground, Dimensions, ScrollView,
    TouchableOpacity, ActivityIndicator, I18nManager, FlatList,
} from 'react-native';
import {
    bg_shadow_color_24,
    c_dark_line, c_dark_text, c_grey_darker, c_grey_light,
    c_loading_icon, c_main_background, c_main_orange, c_text_greeting, c_text_grey, greyHasOpacity, key_screen_comeback,
    key_user_info, LandingStackName, MyAddressesScreenName, OrderHistoryScreenName, PaymentMethodScreenName,
    PersonalZoneScreenName, ProductDetailScreenName, rc_token_expire, rq_get_personal_area_info, SettingScreenName,
} from '../resource/BaseValue';
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage, {getDesignDimension} from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';
import SearchHeaderBarFunc from './SearchHeaderBarFunc';
import FastImage from 'react-native-fast-image'
import {makeAPostRequest} from '../resource/SupportFunction';
import {callUpdateLikeProduct} from './redux/appCart';
import {connect} from 'react-redux';
import { create } from 'react-native-pixel-perfect'
import Intercom from 'react-native-intercom';


class PersonalZoneScreen extends React.Component {
    constructor (props) {
        super(props);
        this.state = ({
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            userInfo:{
                firstName:""
            },
            personalInfo : {
                liked_products:[]
            }
        })
    }


    componentDidMount (){
        this.loadUserInfo();
    }

    componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any) {
        this.loadPersonalAreaInfo();
    }

    updateLikeProduct = async ()=>{
        console.log("updateLikeProduct");
    }

    loadUserInfo = async  () => {
        try {
            const value = await AsyncStorage.getItem(key_user_info)
            if(value != null) {
                // value previously stored
                console.log("user info: " +  value);
                const jsonValue = JSON.parse(value);
                let allState = this.state;
                allState.userInfo = jsonValue;
                this.setState(allState, () => {
                    this.loadPersonalAreaInfo();
                });
            } else {

            }
        } catch(e) {
            // error reading value
        }
    }

    loadPersonalAreaInfo = async () =>{
        if (this.state.userInfo.token != null && this.state.userInfo.token != "") {
            let data = {
                request : rq_get_personal_area_info,
                token : this.state.userInfo.token
            }

            makeAPostRequest(data,
                ()=>this._showLoadingBox(),
                ()=>this._closeLoadingBox(),
                (isSuccess, dataResponse)=>{
                    if (isSuccess) {
                        let allState = this.state;
                        allState.personalInfo = dataResponse;
                        this.setState(allState);
                    } else {
                        if (dataResponse == rc_token_expire) {
                            AsyncStorage.setItem(key_screen_comeback, PersonalZoneScreenName);
                            this.props.navigation.navigate(LandingStackName,{
                                previousScreen: PersonalZoneScreenName
                            });
                        } else {
                            alert (dataResponse);
                        }
                    }
                })
        } else {
            AsyncStorage.setItem(key_screen_comeback, PersonalZoneScreenName);
            this.props.navigation.navigate(LandingStackName,{
                previousScreen: PersonalZoneScreenName
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

    comeToShippingAddressSelect = () =>{
        this.props.navigation.navigate(ShippingAddressSelectScreenName);
    }


    render () {
        let greetingText = langObj.goodMorning;
        let curHour = new Date().getHours();
        if (curHour > 11 && curHour < 15){
            greetingText = langObj.goodAfternoon;
        } else if (curHour > 15 && curHour < 17) {
            greetingText = langObj.goodAfternoon2;
        } else if (curHour > 17 && curHour < 20) {
            greetingText = langObj.goodEvening;
        } else if (curHour > 20 || curHour < 6) {
            greetingText = langObj.goodNight;
        }
        return (
            <View style={{flex:1, flexDirection:"column", backgroundColor:c_main_background}}>
                <SearchHeaderBarFunc navigation={this.props.navigation} title={PersonalZoneScreenName} />
                <ScrollView>
                    <TouchableOpacity
                        style={{flexDirection:'column'}}>
                        <Text style={[globalStyle.textBasicBoldStyle, {fontSize:18, color:c_text_greeting, marginTop:20, textAlign:'center'}]}>{greetingText}</Text>
                        <Text style={[globalStyle.textBasicBoldStyle, {fontSize:24, color:c_text_grey, textAlign:'center'}]}>{this.state.userInfo.firstName + " " + this.state.userInfo.lastName}</Text>
                    </TouchableOpacity>
                    <View style={{flexDirection:'row', alignItems:"center", marginTop:10, width:screenWidth}}>
                        <View style={{flex:1}}/>
                        <View style={[mStyle.statisticContainer]}>
                            <FastImage
                                source={require("../image/icon_order.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.2,
                                    height:screenWidth*0.2}}
                            />
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textStatisticValue]}>{this.state.personalInfo.num_of_orders}</Text>
                            <Text style={[globalStyle.textBasicStyle, mStyle.textStatisticTitle]}>{langObj.orders}</Text>
                        </View>
                        <View style={[mStyle.statisticContainer]}>
                            <FastImage
                                source={require("../image/icon_line_credit.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.2,
                                    height:screenWidth*0.2}}
                            />
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textStatisticValue]}>{this.state.personalInfo.credit_amount}</Text>
                            <Text style={[globalStyle.textBasicStyle, mStyle.textStatisticTitle]}>{langObj.lineOfCredit}</Text>
                        </View>
                        <View style={[mStyle.statisticContainer]}>
                            <FastImage
                                source={require("../image/icon_chart_circle.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.2,
                                    height:screenWidth*0.2}}
                            />
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textStatisticValue]}>{this.state.personalInfo.used_credit_amount}</Text>
                            <Text style={[globalStyle.textBasicStyle, mStyle.textStatisticTitle]}>{langObj.survivor}</Text>
                        </View>
                        <View style={{flex:1}}/>
                    </View>
                    <TouchableOpacity
                        onPress={()=>{
                            // this.props.navigation.navigate(EmailValidateScreenName);
                        }}
                        style={[mStyle.buttonDarker]}>
                        <Text style={[globalStyle.textBasicBoldStyle, {color:"#ffffff", fontSize:24}]}>{langObj.getCreditLine}</Text>
                    </TouchableOpacity>


                    <View style={{flexDirection:'row', alignItems:'center', marginStart:25, marginTop:20}}>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textTitle]}>{langObj.itemYouLiked}</Text>
                        <FastImage
                            source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_yellow_d2.png") : require("../image/icon_arrow_right_yellow_d2.png")}
                            resizeMode="cover"
                            style={{
                                width:screenWidth*0.08,
                                height:screenWidth*0.08* (108/156),marginStart:5}}
                        />
                    </View>
                    <Text style={[globalStyle.textBasicStyle, mStyle.textTitleExplain,{ marginStart:25}]}>{this.state.personalInfo.liked_products.length + " " + langObj.productsFoundInThisCategory}</Text>
                    <FlatList
                        style={{ marginTop:10,alignSelf:"flex-end", width:screenWidth-20}}
                        contentContainerStyle={{alignItems:"flex-start", flexGrow: 1}}
                        data={this.state.personalInfo.liked_products}
                        showsHorizontalScrollIndicator={false}
                        horizontal={true}
                        renderItem={({item, index}) =>
                            <TouchableOpacity
                                onPress={()=> {
                                    this.props.navigation.navigate(ProductDetailScreenName,{
                                        product_id: item.product_id
                                    })
                                }}
                                style={[mStyle.productItemContainer]}>
                                <FastImage
                                    source={{uri:item.image}}
                                    resizeMode="contain"
                                    style={{
                                        width:screenWidth*0.35,
                                        height:screenWidth*0.35,
                                        borderTopRightRadius:10,
                                        borderTopLeftRadius:10,
                                        alignSelf:'center'}}
                                />
                                <Text
                                    // numberOfLines={1}
                                    style={[globalStyle.textBasicStyle,{marginTop:10, marginStart:5, marginEnd:5, fontSize:18, color:c_text_grey, textAlign:"center"}]}>{item.name}</Text>
                            </TouchableOpacity>
                        }
                        keyExtractor={item => item.id}
                    />


                    <View style={{flexDirection:'row', alignItems:'center', marginStart:20, marginTop:20}}>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textTitle]}>{langObj.personalCustomization}</Text>
                        <FastImage
                            source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_yellow_d2.png") : require("../image/icon_arrow_right_yellow_d2.png")}
                            resizeMode="cover"
                            style={{
                                width:screenWidth*0.08,
                                height:screenWidth*0.08* (108/156),marginStart:5}}
                        />
                    </View>
                    <TouchableOpacity
                        onPress={()=>{
                            this.props.navigation.navigate(OrderHistoryScreenName)
                        }}
                        style={[mStyle.itemContainer]}>
                        <ImageBackground
                            source={require("../image/icon_logo_grayscale.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.15, height:screenWidth*0.15*(312/298),
                                alignItems:'center', justifyContent: 'center'}}>
                            <FastImage
                                source={require("../image/icon_house.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.1,
                                    height:screenWidth*0.1}}
                            />
                        </ImageBackground>
                        <View style={{flexDirection:'column'}}>
                            <Text style={[globalStyle.textBasicBoldStyle,mStyle.textTitleCustomize]}>{langObj.orderHistory}</Text>
                            <View style={{flexDirection:'row', alignItems:'center'}}>
                                <Text style={[globalStyle.textBasicStyle,mStyle.textValue]}>{langObj.orderHistoryExplain}</Text>
                            </View>
                        </View>
                        <View style={{flex:1}}/>
                        <TouchableOpacity>
                            <FastImage
                                source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_black.png") : require("../image/icon_arrow_right_black.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.05,
                                    height:screenWidth*0.05}}
                            />
                        </TouchableOpacity>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={()=>{
                            this.props.navigation.navigate(MyAddressesScreenName)
                        }}
                        style={[mStyle.itemContainer]}>
                        <ImageBackground
                            source={require("../image/icon_logo_grayscale.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.15, height:screenWidth*0.15*(312/298),
                                alignItems:'center', justifyContent: 'center'}}>
                            <FastImage
                                source={require("../image/icon_house_personal.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.1,
                                    height:screenWidth*0.1}}
                            />
                        </ImageBackground>
                        <View style={{flexDirection:'column'}}>
                            <Text style={[globalStyle.textBasicBoldStyle,mStyle.textTitleCustomize]}>{langObj.myAddress}</Text>
                            <View style={{flexDirection:'row', alignItems:'center'}}>
                                <Text style={[globalStyle.textBasicStyle,mStyle.textValue]}>{langObj.updateOrAddMyAddress}</Text>
                            </View>
                        </View>
                        <View style={{flex:1}}/>
                        <TouchableOpacity>
                            <FastImage
                                source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_black.png") : require("../image/icon_arrow_right_black.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.05,
                                    height:screenWidth*0.05}}
                            />
                        </TouchableOpacity>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={()=>{
                            this.props.navigation.navigate(PaymentMethodScreenName)
                        }}
                        style={[mStyle.itemContainer]}>
                        <ImageBackground
                            source={require("../image/icon_logo_grayscale.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.15, height:screenWidth*0.15*(312/298),
                                alignItems:'center', justifyContent: 'center'}}>
                            <FastImage
                                source={require("../image/icon_card_black.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.1,
                                    height:screenWidth*0.1}}
                            />
                        </ImageBackground>
                        <View style={{flexDirection:'column'}}>
                            <Text style={[globalStyle.textBasicBoldStyle,mStyle.textTitleCustomize]}>{langObj.paymentOptions}</Text>
                            <View style={{flexDirection:'row', alignItems:'center'}}>
                                <Text style={[globalStyle.textBasicStyle,mStyle.textValue]}>{langObj.creditCardAndCreditDowels}</Text>
                            </View>
                        </View>
                        <View style={{flex:1}}/>
                        <TouchableOpacity>
                            <FastImage
                                source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_black.png") : require("../image/icon_arrow_right_black.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.05,
                                    height:screenWidth*0.05}}
                            />
                        </TouchableOpacity>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={()=>{
                            if (this.state.userInfo.token != null && this.state.userInfo.token != "") {
                                Intercom.registerIdentifiedUser({ userId:this.state.userInfo.phoneNumber ,email: this.state.userInfo.email})
                                    .then (()=>{
                                        let phoneNumber = "";
                                        if (this.state.userInfo.phoneNumber != null) {
                                            phoneNumber = this.state.userInfo.phoneNumber
                                        }
                                        Intercom.updateUser({
                                            // Pre-defined user attributes
                                            email: this.state.userInfo.email,
                                            name: this.state.userInfo.lastName + " " + this.state.userInfo.firstName,
                                            phone: phoneNumber
                                        });
                                    }).then(()=>{
                                        Intercom.displayMessageComposer()
                                    });
                            } else {
                                Intercom.registerUnidentifiedUser().then(()=>{
                                    Intercom.displayMessageComposer()
                                });
                            }
                        }}
                        style={[mStyle.itemContainer]}>
                        <ImageBackground
                            source={require("../image/icon_logo_grayscale.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.15, height:screenWidth*0.15*(312/298),
                                alignItems:'center', justifyContent: 'center'}}>
                            <FastImage
                                source={require("../image/icon_chat_personal.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.1,
                                    height:screenWidth*0.1}}
                            />
                        </ImageBackground>
                        <View style={{flexDirection:'column'}}>
                            <Text style={[globalStyle.textBasicBoldStyle,mStyle.textTitleCustomize]}>{langObj.chatWithRepresentative}</Text>
                            <View style={{flexDirection:'row', alignItems:'center'}}>
                                <Text style={[globalStyle.textBasicStyle,mStyle.textValue]}>{langObj.customServiceAndTroubleshooting}</Text>
                            </View>
                        </View>
                        <View style={{flex:1}}/>
                        <TouchableOpacity>
                            <FastImage
                                source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_black.png") : require("../image/icon_arrow_right_black.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.05,
                                    height:screenWidth*0.05}}
                            />
                        </TouchableOpacity>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={()=>{
                            this.props.navigation.navigate(SettingScreenName);

                        }}
                        style={[mStyle.itemContainer, {marginBottom:20}]}>
                        <ImageBackground
                            source={require("../image/icon_logo_grayscale.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.15, height:screenWidth*0.15*(312/298),
                                alignItems:'center', justifyContent: 'center'}}>
                            <FastImage
                                source={require("../image/icon_setting_personal.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.1,
                                    height:screenWidth*0.1}}
                            />
                        </ImageBackground>
                        <View style={{flexDirection:'column'}}>
                            <Text style={[globalStyle.textBasicBoldStyle,mStyle.textTitleCustomize]}>{langObj.additionalSetting}</Text>
                            <View style={{flexDirection:'row', alignItems:'center'}}>
                                <Text style={[globalStyle.textBasicStyle,mStyle.textValue]}>{langObj.additionalSettingExplain}</Text>
                            </View>
                        </View>
                        <View style={{flex:1}}/>
                        <TouchableOpacity>
                            <FastImage
                                source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_black.png") : require("../image/icon_arrow_right_black.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.05,
                                    height:screenWidth*0.05}}
                            />
                        </TouchableOpacity>
                    </TouchableOpacity>
                    <View style={{height:perfectSize(400)}}/>
                </ScrollView>

                <View style={{width:this.state.indicatorSizeW, height:this.state.indicatorSizeH, backgroundColor: greyHasOpacity,
                    flexDirection:"column",alignItems:"center", justifyContent:"center", position:"absolute",top:0,left:0}}>
                    <ActivityIndicator animating={this.state.indicatorDisplay} size="large" color={c_loading_icon} />
                </View>
            </View>
        );
    }
}

const mapStateToProps = state =>  ({
    likeProductsUpdate : state.likeProductsUpdate,
});
const mapDispatchToProps = dispatch => {
    return {
        callUpdateLikeProduct: ()  => dispatch(callUpdateLikeProduct())
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(PersonalZoneScreen);

let langObj = getLanguage();
let perfectSize = create(getDesignDimension());
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const mStyle = StyleSheet.create({
    statisticContainer: {
      flexDirection:'column',
      alignItems:'center',
      margin:5
    },
    textStatisticValue: {
      color:c_dark_line,
      fontSize:24,
      marginTop:10
    },
    textStatisticTitle: {
        color:'#858586',
        fontSize:18,
        marginTop:5
    },
    titleContainer: {
        fontSize:14,
        flexDirection:'row',
        textAlign:'center',
        alignItems: "center",
        justifyContent: "center",
        marginTop:10,
        marginStart:20,
        marginEnd:20,
        padding: 10,
        backgroundColor: c_grey_light,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    titleContainerText:{
        color:"#000000",
        fontSize:14,
    },
    textTitle:{
      fontSize:20
    },
    textTitleExplain:{
        fontSize:18,
        color:c_text_grey,
        marginStart:20,
    },
    textValue: {
        fontSize:17,
        marginStart:5
    },
    textTitleCustomize:{
        fontSize:24
    },
    buttonDarker: {
        alignSelf:'stretch',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        padding:15,
        backgroundColor:"#000000",
        borderRadius:10,
        margin:20,
    },
    itemContainer: {
        flexDirection:'row',
        width: screenWidth-40,
        height:screenWidth*0.23,
        alignItems:'center',
        padding:10,
        marginTop:20,
        marginStart:20,
        marginEnd: 20,
        backgroundColor:'#ffffff',
        borderRadius:10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    productItemContainer: {
        flexDirection:'column',
        width: screenWidth*0.35,
        alignSelf: "stretch",
        alignItems:'center',
        justifyContent:'flex-start',
        padding:0,
        margin:10,
        backgroundColor:'#ffffff',
        borderRadius:10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
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
})
