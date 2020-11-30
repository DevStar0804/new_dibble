/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View, Text, Image, ScrollView, Dimensions, ActivityIndicator,
    TouchableOpacity, StyleSheet, I18nManager, FlatList,
} from 'react-native';
import {
    key_user_info, c_loading_icon, c_main_orange, c_text_header, c_grey_light,
    c_grey_darker, ShippingInfoScreenName, LandingStackName, MyCartScreenName,
    key_screen_comeback, key_products_cart,
} from '../resource/BaseValue';
import * as RNLocalize from "react-native-localize";
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';
import FastImage from 'react-native-fast-image'
import SearchHeaderBarFunc from './SearchHeaderBarFunc';
import { connect } from "react-redux";
import {callUpdateCart} from './redux/appCart';
import CartEmpty from './comp/EmptyCart';
import moment from 'moment';

class MyCartScreen extends React.Component {
    constructor (props) {
        super(props);
        this.state = ({
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            productList:[],
            orderCreatedOn:"",
            status:"",
            totalPrice:"",
        })
    }



    componentDidMount (){
        console.log(RNLocalize.getLocales());
        RNLocalize.addEventListener("change", () => {
            // do localization related stuff…
        });
        this.loadUserInfo();
    }

    componentWillReceiveProps() {
        this.loadUserInfo();
        // this.loadActiveOrder();
    }

    loadUserInfo = async  () => {
        try {
            const value = await AsyncStorage.getItem(key_user_info)
            if(value != null) {
                // value previously stored
                const jsonValue = JSON.parse(value);
                let allState = this.state;
                allState.userInfo = jsonValue;
                this.setState(allState, ()=>{
                    this.loadActiveOrder();
                });
            } else {

            }
        } catch(e) {
            // error reading value

        }
    }

    loadActiveOrder = async () => {
        this._showLoadingBox();
        let productInCartStr = await AsyncStorage.getItem(key_products_cart);
        if (productInCartStr != null && productInCartStr != ""){
            let productList = JSON.parse(productInCartStr);
            let allState = this.state;
            allState.productList = [];
            for (let i = 0; i < productList.length; i++) {
                let productItem = {
                    product_id : productList[i]['product_id'],
                    product_name : productList[i]['product_name'],
                    product_image : productList[i]['product_image'],
                    amount : productList[i]['amount'],
                    fAmount : productList[i]['amount'],
                }
                if (productList[i]['isSelected'] != null) {
                    productItem['isSelected'] = productList[i]['isSelected'];
                } else {
                    productItem['isSelected'] = true;
                }

                if (productList[i]['sale_price'] != null && productList[i]['sale_price'] != 0) {
                    productItem['price'] = productList[i]['sale_price'];
                } else {
                    productItem['price'] = productList[i]['price'];
                }
                allState.productList.push(productItem);
            }
            this.setState(allState, ()=> {
                this._closeLoadingBox();
            });
        } else {
            let allState = this.state;
            allState.productList = [];
            allState.orderCreatedOn = "";
            allState.status = "";
            allState.totalPrice = "";
            this.setState(allState, ()=> {
                this._closeLoadingBox();
            });
        }
    }

    callChangeAmountApi = async (index) => {
        AsyncStorage.setItem(key_products_cart, JSON.stringify(this.state.productList))
            .then (()=>{
                let allState = this.state;
                allState.productList[index]['fAmount'] = allState.productList[index]['amount'];
                this.setState(allState, ()=>{
                    let amount = 0;
                    for (let i = 0; i < this.state.productList.length; i++) {
                        amount = amount + this.state.productList[i]['amount'];
                    }
                    this.props.callUpdateCart(amount);
                });
            });
    }

    removeProductFromCart = async (index) =>{
        this.callRemoveProductFromOrder(index);
    }

    callRemoveProductFromOrder = async (index) => {
        let allState = this.state;
        allState.productList.splice(index, 1);
        this.setState(allState, ()=>{
            AsyncStorage.setItem(key_products_cart, JSON.stringify(this.state.productList)).then(()=>{
                let amount = 0;
                for (let i = 0; i < this.state.productList.length; i++) {
                    amount = amount + this.state.productList[i]['amount'];
                }
                this.props.callUpdateCart(amount);
            });
        });
    }

    getTotalPrice () {
        let totalPrice = 0;
        if (this.state.productList != null && this.state.productList.length > 0) {
            for (let i = 0; i < this.state.productList.length; i++) {
                if (this.state.productList[i]['isSelected']) {
                    totalPrice = totalPrice + (this.state.productList[i]['price']*this.state.productList[i]['amount']);
                }
            }
        }
        return totalPrice.toFixed(2);
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

    placeOrder = async () => {
        if (this.state.userInfo.token != null && this.state.userInfo.token != "") {
            AsyncStorage.setItem(key_products_cart, JSON.stringify(this.state.productList)).then(()=>{
                this.props.navigation.navigate(ShippingInfoScreenName, {
                    refreshScreen: moment(new Date()).millisecond
                });
            });
        } else {
            AsyncStorage.setItem(key_screen_comeback, MyCartScreenName);
            this.props.navigation.navigate(LandingStackName,{
                previousScreen: MyCartScreenName
            });
        }
    }


    render () {
        return (
            <View style={{flex:1, flexDirection:"column", alignItems:"center", justifyContent:'center', backgroundColor:c_grey_light}}>
                <SearchHeaderBarFunc navigation={this.props.navigation} title={MyCartScreenName}/>
                <View style={{flex:1, flexDirection:"column"}}>
                    <ScrollView style={{flex:1,width:screenWidth, paddingTop:10, paddingBottom:10, display: this.state.productList.length > 0 ? "flex":"none"}}>
                        <View style={[globalStyle.sectionTitleContainer]}>
                            <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                                <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection]}>{langObj.shoppingCart}</Text>
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
                        <FlatList
                            style={{ marginTop:0}}
                            data={this.state.productList}
                            extraData={this.state}
                            showsVerticalScrollIndicator={false}
                            renderItem={({item, index}) =>
                                <View style={[mStyle.itemSectionContainer]}>
                                    <TouchableOpacity
                                        onPress={()=>{
                                            let allState = this.state;
                                            allState.productList[index]['isSelected'] = !allState.productList[index]['isSelected'];
                                            this.setState(allState);
                                        }}>
                                        <FastImage
                                            source={item.isSelected ? require("../image/icon_checked_black.png") : require("../image/icon_checked_not.png")}
                                            resizeMode="contain"
                                            style={{
                                                width:screenWidth*0.08,
                                                height:screenWidth*0.08, marginEnd:5}}
                                        />
                                    </TouchableOpacity>
                                    <FastImage
                                        source={{uri:item.product_image}}
                                        resizeMode={FastImage.resizeMode.contain}
                                        style={{
                                            width:screenWidth*0.15,
                                            height:screenWidth*0.15}}
                                    />
                                    <View style={{flexDirection:'column', marginStart:10, alignItems:'flex-start', flex:1}}>
                                        <View style={{flexDirection:'row'}}>
                                            <Text style={[globalStyle.textBasicStyle,mStyle.textNormalContent, {flex:1}]}>{item.product_name}</Text>
                                            <TouchableOpacity
                                                onPress={()=>{
                                                    this.removeProductFromCart(index);
                                                }}
                                                style={{marginStart:5, padding:10}}>
                                                <FastImage
                                                    source={require('../image/icon_close_black.png')}
                                                    resizeMode="cover"
                                                    style={{
                                                        width:screenWidth*0.04,
                                                        height:screenWidth*0.04}}
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={{flexDirection:'row'}}>
                                            <View style={{flexDirection:"column", flex:0.7, alignItems:'center'}}>
                                                <Text style={[globalStyle.textBasicStyle, {color:c_grey_darker, fontSize:15}]}>{langObj.price}</Text>
                                                <Text style={[globalStyle.textBasicBoldStyle, mStyle.textBasicBoldStyle, {fontSize:20, marginTop:10}]}>{item.price + " " + langObj.priceUnit }</Text>
                                            </View>
                                            <View style={{flexDirection:"column", flex:1, alignItems:'center'}}>
                                                <Text style={[globalStyle.textBasicStyle, {color:c_grey_darker, fontSize:15}]}>{langObj.amount}</Text>
                                                <View style={{flexDirection:'row', alignItems:'center'}}>
                                                    <TouchableOpacity
                                                        onPress={()=>{
                                                            if (item.amount > 1) {
                                                                let allState = this.state;
                                                                allState.productList[index].amount = allState.productList[index].amount -1;
                                                                this.setState(allState, ()=>{
                                                                    this.callChangeAmountApi(index);
                                                                });
                                                            }
                                                        }}
                                                        style={[mStyle.itemColorSelectNormal,{backgroundColor: "#000000", borderColor: "#000000"}]}>
                                                        <FastImage
                                                            source={require('../image/icon_devide_white.png')}
                                                            resizeMode="contain"
                                                            style={{
                                                                width:screenWidth*0.03,
                                                                height:screenWidth*0.03*(18/92)}}
                                                        />
                                                    </TouchableOpacity>
                                                    <View style={{marginStart:10, padding:5, borderRadius: 5, borderWidth: 1, borderColor: c_grey_light,
                                                        flexDirection: 'row', alignItems: 'center'}}>
                                                        <Text style={[globalStyle.textBasicBoldStyle,mStyle.textAmountValue,{marginStart:10, marginEnd:10}]}>{item.amount}</Text>
                                                    </View>
                                                    <TouchableOpacity
                                                        onPress={()=>{
                                                            let allState = this.state;
                                                            allState.productList[index].amount = allState.productList[index].amount +1;
                                                            this.setState(allState,()=>{
                                                                this.callChangeAmountApi(index);
                                                            });
                                                        }}
                                                        style={[mStyle.itemColorSelectNormal,{backgroundColor: "#000000", borderColor: "#000000"}]}>
                                                        <FastImage
                                                            source={require('../image/icon_plus_white.png')}
                                                            resizeMode="contain"
                                                            style={{
                                                                width:screenWidth*0.03,
                                                                height:screenWidth*0.03*(88/92)}}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            }
                            keyExtractor={(item) => item}
                        />
                        <View style={[mStyle.labelContainer]}>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,{flex:1, fontSize: 24}]}>{langObj.grandTotal}</Text>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,{fontSize: 24}]}>{this.getTotalPrice() + " "+ langObj.priceUnit }</Text>
                        </View>
                        <View style={[mStyle.labelContainer]}>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,{flex:1}]}></Text>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,]}>{langObj.doesNotIncludeVAT}</Text>
                        </View>
                        <View style={[mStyle.labelContainer, {marginTop: 0}]}>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,{flex:1}]}></Text>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,]}>{langObj.doesNotIncludeShippingCost}</Text>
                        </View>
                        <TouchableOpacity disabled={this.state.productList.filter(p=>p.isSelected).length<1}
                            onPress={()=>{
                                this.placeOrder();
                            }}
                            style={[mStyle.buttonDarker]}>
                            <Text style={[globalStyle.textBasicBoldStyle, {color:"#ffffff", fontSize:24}]}>{langObj.paymentAndOrderConfirm}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                    <View style={{display: this.state.productList.length > 0 ? "none" : "flex"}} >
                        <CartEmpty navigation={this.props.navigation}/>
                    </View>
                </View>
                <View style={{width:this.state.indicatorSizeW, height:this.state.indicatorSizeH, backgroundColor: "#ffffff",
                    flexDirection:"column",alignItems:"center", justifyContent:"center", position:"absolute"}}>
                    <ActivityIndicator animating={this.state.indicatorDisplay} size="large" color={c_loading_icon} />
                </View>
            </View>
        );
    }
}
const mapStateToProps = state =>  ({

});
const mapDispatchToProps = dispatch => {
    return {
        callUpdateCart: (amount)  => dispatch(callUpdateCart(amount))
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(MyCartScreen);

let langObj = getLanguage();
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const mStyle = StyleSheet.create({
    textNormalContent: {
        fontSize:18,
    },
    textBoldContent: {
        fontSize:14,
    },
    itemSectionContainer: {
        width:'100%',
        marginTop:10,
        marginBottom:10,
        flexDirection:'row',
        padding:10,
        backgroundColor:"#ffffff",
        alignItems:'center'
    },
    labelContainer: {
        flexDirection:'row',
        alignItems:'center',
        marginStart:30,
        marginEnd:20,
        marginTop:20
    },
    textLabel: {
        fontSize: 16,
        color:c_text_header,
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
    textAmountValue: {
        fontSize: 20
    },
    itemColorSelectNormal: {
        marginStart:10,
        width: screenWidth*0.07,
        height: screenWidth*0.07,
        borderRadius:screenWidth*0.035,
        borderColor:"#ffffff",
        borderWidth:2,
        alignItems: 'center',
        justifyContent:'center'
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
    textTitle:{
        fontSize:18,
    },
})
