/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View, FlatList, Text, Image, StyleSheet,ImageBackground,
    Dimensions, TextInput, TouchableOpacity, ActivityIndicator, I18nManager,
} from 'react-native';
import * as RNLocalize from "react-native-localize";
import {
    apiUrl, c_bg_search_box_dark, c_cursor_textInput,
    c_loading_icon, c_main_background, greyHasOpacity,
    isForceRTL, key_recent_search, key_user_info,
    ProductDetailScreenName, rc_success, rq_search_products,
} from '../resource/BaseValue';
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage, {getDesignDimension} from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';
import FastImage from 'react-native-fast-image'
import {recentSearchMaxChildCount} from '../resource/Config';
import SearchNoResult from './comp/SearchNoResult';
import { create } from 'react-native-pixel-perfect'
import { makeAPostRequest } from '../resource/SupportFunction';

export default class SearchResultScreen extends React.Component {
    constructor (props) {
        super(props);
        this.flatlist = React.createRef();
        this.state = ({
            searchText:"",
            isRefresh: true,
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            next_product_id: 0,
            indicatorDisplay: false,
            flatlistNumColumns:2,
            key:1,
            products: [

            ],
            orderType:2,
            isShowOrder:false,
            isFirstTime:true,
        })
    }


    componentDidMount (){
        console.log(RNLocalize.getLocales());
        RNLocalize.addEventListener("change", () => {
            // do localization related stuff…
        });
        let allState = this.state;
        allState.searchText = this.props.route.params.searchText;
        allState.isFirstTime = true;
        this.setState(allState, ()=>{
            this.loadUserInfo();
        });
        console.log(this.state);
    }

    componentWillReceiveProps(nextProps: Props, nextContext: *): * {
        if (this.flatlist != null && this.flatlist.current != null) {
            this.flatlist.current.scrollToOffset({offset: 0});
        }
        setTimeout(()=>{
            if(this.props.route.params.searchText != null) {
                let allState = this.state;
                allState.next_product_id = 0;
                allState.searchText = this.props.route.params.searchText;
                allState.isFirstTime = true;
                this.setState(allState, () =>{
                    this.startSearch(0);
                })
            }
        },500);
    }

    selectOrder = async (orderTypeIndex)=>{
        if (orderTypeIndex != this.state.orderType){
            this.setState(
                {orderType:orderTypeIndex,
                        isShowOrder:false},
                ()=>{
                    this.setState({products:[{
                            "product_id": 0,
                            "name": "",
                            "catalog_number": "",
                            "description": "",
                            "price": 0,
                            "image": "",
                            "categories": [

                            ]
                        }]},()=>{
                        this.startSearch(0);
                    })
            })
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
                this.startSearch(this.state.next_product_id);
            } else {

            }
        } catch(e) {
            // error reading value

        }
    }

    saveRecentSearch = async () => {
        let searchText = this.state.searchText;
        let rs = await AsyncStorage.getItem(key_recent_search);
        let recentSearchList;
        if (rs != null) {
            recentSearchList = JSON.parse(rs);
            let haveSearched = false;
            for (let i = 0; i < recentSearchList.length && !haveSearched; i++) {
                if (recentSearchList[i] == searchText) {
                    haveSearched = true;
                }
            }
            if (!haveSearched) {
                if (recentSearchList.length < recentSearchMaxChildCount) {
                    recentSearchList.unshift(searchText);
                } else {
                    recentSearchList.slice(0, 1);
                    recentSearchList.unshift(searchText);
                }
            }
        } else {
            recentSearchList = [];
            recentSearchList.push(searchText);
        }
        console.log("bsave: " + recentSearchList);
        try {
            AsyncStorage.setItem(key_recent_search, JSON.stringify(recentSearchList));
            console.log("save: " + recentSearchList);
        } catch (e) {
            alert (e);
        }
    }

    startSearch = async (startProductId) => {
        this.setState({
            isFirstTime : true
        }, ()=>{
            if (this.state.searchText != "") {
                if (startProductId == 0) {
                    this.saveRecentSearch();
                }
                this._showLoadingBox();
                let dataObj = {
                    request: rq_search_products,
                    token: this.state.userInfo.token,
                    search_phrase: this.state.searchText,
                    start_with_product_id: startProductId,
                    order_by:this.state.orderType
                }
                console.log(dataObj);
                makeAPostRequest(dataObj,
                    ()=>this._showLoadingBox(),
                    ()=>this._closeLoadingBox(),
                    (isSucceed, responseJson)=>{
                        if (isSucceed){
                            let allState = this.state;
                            if (allState.next_product_id == 0) {
                                allState.products = responseJson.products;
                            } else {
                                for (let i = 0; i < responseJson.products.length; i++) {
                                    allState.products.push(responseJson.products[i]);
                                }
                            }
                            allState.next_product_id = responseJson.next_product_id;
                            for (let i = 0; i < allState.products.length; i++) {
                                allState.products[i]["isOnSale"] = (Math.random() > 0.5);
                            }
                            allState.isFirstTime = false;
                            this.setState({
                                products: allState.products
                            }, ()=>{
                                this._closeLoadingBox();
                            });
                        } else {
                            this.setState({
                                isFirstTime:false
                            }, ()=>{
                                this._closeLoadingBox();
                            })
                        }
                    }
                );
            }
        });
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

    getListCategoriesNameString (categories) {
        let categoryNameList = "";
        for (let i = 0; i < categories.length; i++) {
            if (categoryNameList == "") {
                categoryNameList = categories[i]['category_name'];
            } else {
                categoryNameList = categoryNameList + " - " + categories[i]['category_name'];
            }
        }
        return categoryNameList;
    }

    displayResultItem = (item, index) => {
        if (this.state.flatlistNumColumns == 1) {
            return (
                <TouchableOpacity
                    onPress={()=>{
                        this.props.navigation.navigate(ProductDetailScreenName, {product_id: item.product_id});
                    }}
                    style={[mStyle.itemContainerList]}>
                    <FastImage
                        source={{uri: item.image}}
                        resizeMode="contain"
                        style={{width:perfectSize(170), height:perfectSize(196), marginStart:screenWidth*0.1, marginEnd:10, alignSelf: 'flex-end'}}
                    />
                    <Text
                        numberOfLines={3}
                        style={[globalStyle.textProductItemName,{flex:1, alignSelf:'center'}]}>{item.name}</Text>
                    <View style={{flexDirection: 'column', alignItems:'center',marginStart:10}}>
                        <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                            <Text
                                numberOfLines={1}
                                style={[globalStyle.textProductItemPrice]}>{item.price}</Text>
                            <Text
                                numberOfLines={1}
                                style={[globalStyle.textProductItemName, {marginStart:5}]}>{langObj.priceUnit}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={()=>{
                                this.props.navigation.navigate(ProductDetailScreenName, {product_id: item.product_id});
                            }}
                            style={[mStyle.buttonBuy]}>
                            <Text style={[globalStyle.textBasicStyle,mStyle.buttonBuyText]}>{langObj.buy}</Text>
                        </TouchableOpacity>
                    </View>
                    <ImageBackground
                        source={require('../image/icon_logo.png')}
                        resizeMode="contain"
                        style={[mStyle.promotionContainer, {bottom:5,start:5, opacity: item.isOnSale?1:0}]}>
                        <Text style={[globalStyle.textBasicBoldStyle,mStyle.promotionText]}>{langObj.saleOfMonth}</Text>
                    </ImageBackground>
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity
                    onPress={()=>{
                        this.props.navigation.navigate(ProductDetailScreenName, {product_id: item.product_id});
                    }}
                    style={[mStyle.itemContainerGallery]}>
                    <FastImage
                        source={{uri: item.image}}
                        resizeMode="contain"
                        style={{width:perfectSize(320), height:perfectSize(360), margin:5}}
                    />
                    <Text
                        numberOfLines={3}
                        style={[globalStyle.textProductItemName,{flex:1, alignSelf:'center', textAlign:'center', margin:5}]}>{item.name}</Text>
                    <View style={{flexDirection: 'row', alignItems: 'flex-end', }}>
                        <Text
                            numberOfLines={1}
                            style={[globalStyle.textProductItemPrice]}>{item.price}</Text>
                        <Text
                            numberOfLines={1}
                            style={[globalStyle.textProductItemName, {marginStart:5}]}>{langObj.priceUnit}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={()=>{
                            this.props.navigation.navigate(ProductDetailScreenName, {product_id: item.product_id});
                        }}
                        style={[mStyle.buttonBuy,{marginBottom:10}]}>
                        <Text style={[mStyle.buttonBuyText]}>{langObj.buy}</Text>
                    </TouchableOpacity>
                    <ImageBackground
                        source={require('../image/icon_logo.png')}
                        resizeMode="contain"
                        style={[mStyle.promotionContainer, {top:5,end:5,opacity: item.isOnSale?1:0}]}>
                        <Text style={[globalStyle.textBasicBoldStyle,mStyle.promotionText]}>{langObj.saleOfMonth}</Text>
                    </ImageBackground>
                </TouchableOpacity>
            )
        }
    }

    render () {
        const {flatlistNumColumns, key} = this.state;
        return (
            <View style={{flex:1, flexDirection:"column", backgroundColor:c_main_background}}>
                <View style={[globalStyle.header,{width:screenWidth, paddingStart:5, paddingEnd:5,flexDirection:'column',alignItems:'center',
                    backgroundColor:"#ffffff",marginBottom:10, }]}>
                    <View style={{flexDirection: 'row', width: screenWidth, alignItems:'center',justifyContent:'center',marginTop:10}}>
                        <Text style={[globalStyle.textBasicBoldStyle, {fontWeight:'bold'}]}>{langObj.appName}</Text>
                        <FastImage
                            source={require("../image/icon_logo.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.05,
                                height:screenWidth*0.05*(312/298),marginStart:5}}
                        />
                    </View>
                    <View style={{flexDirection:'row'}}>
                        <TouchableOpacity
                            style={{marginStart:10, flexDirection: 'row', alignItems:'center'}}
                            onPress={()=>{
                                this.props.navigation.goBack();
                            }}>
                            <FastImage
                                source={langObj.isRTL ? require("../image/icon_arrow_right_black.png"): require("../image/icon_arrow_left_black.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.045*(70/139),
                                    height:screenWidth*0.045
                                }}
                            />
                        </TouchableOpacity>
                        <View style={{flexDirection:'row', alignItems:'center', flex:1, margin:10,
                            backgroundColor:c_bg_search_box_dark, borderRadius:10, paddingStart:10, paddingEnd:10}}>
                            <TextInput
                                style={[globalStyle.textSearch,{textAlign:'right'}]}
                                value={this.state.searchText}
                                selectionColor={c_cursor_textInput}
                                onSubmitEditing={()=>{
                                    if (this.state.searchText != "") {
                                        this.startSearch(this.state.next_product_id);
                                    }
                                }}
                                onChangeText={(text)=>{
                                    this.setState({searchText: text})
                                }}
                                placeholder={langObj.searchTextInMain}

                            />
                            <TouchableOpacity
                                onPress={()=>{
                                    this.setState({searchText:""});
                                }}
                                style={{paddingTop:15, paddingBottom:15, paddingStart:10, paddingEnd:5}}>
                                <FastImage
                                    source={require("../image/icon_close_black.png")}
                                    resizeMode="contain"
                                    style={{
                                        width:screenWidth*0.03,
                                        height:screenWidth*0.03}}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={{flex:1, flexDirection:'column'}}>
                    <View style={{display: this.state.products.length > 0 && !this.state.isFirstTime ?"flex": "none", flexDirection:'column', flex:1}}>
                        <View style={{flexDirection: "row", alignItems:'center',margin: 5}}>
                            <View style={{flexDirection: 'row', flex:1,alignItems:'center', justifyContent:'center'}}>
                                <TouchableOpacity
                                    style={{marginEnd:20}}
                                    onPress={()=>{
                                        let {flatlistNumColumns,key} = this.state
                                        this.setState({
                                            flatlistNumColumns:flatlistNumColumns==1 ? 2 : 1,
                                            key:key+1

                                        });
                                        // this.flatlistNumColumns = this.flatlistNumColumns==1 ? 2 :1;
                                    }}>
                                    <FastImage
                                        source={this.state.flatlistNumColumns==1 ? require('../image/icon_display_grid.png'):require('../image/icon_display_list.png')}
                                        resizeMode="contain"
                                        style={{
                                            width:screenWidth*0.06,
                                            height:screenWidth*0.06}}
                                    />
                                </TouchableOpacity>
                                <Text style={[globalStyle.textBasicBoldStyle,mStyle.textTopControl]}>{langObj.view}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={()=>{
                                    this.setState({isShowOrder:!this.state.isShowOrder});
                                }}
                                style={{flexDirection: 'row', flex:1,alignItems:'center', justifyContent:'center'}}>
                                <Text style={[globalStyle.textBasicBoldStyle,mStyle.textTopControl]}>{langObj.orderBy}</Text>
                                <FastImage
                                    source={require("../image/icon_arrow_down_black.png")}
                                    resizeMode="contain"
                                    style={{
                                        width:screenWidth*0.025*(139/70),
                                        height:screenWidth*0.025,marginStart:20}}
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={[globalStyle.horizontalLine, {width:screenWidth*0.95,marginTop:10,alignSelf:'center'}]}></View>
                        <Text style={[globalStyle.textBasicStyle, mStyle.textLabel]}>{this.state.products.length} {langObj.results}</Text>
                        <View style={{flex:1, flexDirection: 'column'}}>
                            <FlatList
                                key={key}
                                numColumns={flatlistNumColumns}
                                ref={this.flatlist}
                                onEndReachedThreshold={0.3}
                                onEndReached={()=>{
                                    console.log("onEndReached");
                                    if (this.state.next_product_id != 0) {
                                        this.startSearch(this.state.next_product_id);
                                    }
                                }}
                                style={{ marginTop:10}}
                                data={this.state.products}
                                showsVerticalScrollIndicator={false}
                                renderItem={({item, index}) =>
                                    this.displayResultItem(item, index)
                                }
                                keyExtractor={(item) => item.product_id}
                            />
                        </View>
                    </View>
                    <View style={{display: this.state.isFirstTime ? "none" : this.state.products.length > 0 ? "none" : "flex", flex:1}} >
                        <SearchNoResult navigation={this.props.navigation}/>
                    </View>
                </View>
                <View style={[mStyle.orderContainer,
                    {position:this.state.isShowOrder?"absolute":"relative",
                        display:this.state.isShowOrder?"flex":"none",
                        left: perfectSize(530), top:perfectSize(400)}]}>
                    <TouchableOpacity
                        onPress={()=>{
                            this.selectOrder(1);
                        }}
                        style={[mStyle.orderRow]}>
                        <View style={[mStyle.dot, {opacity:this.state.orderType==1?1:0}]}/>
                        <Text style={[globalStyle.textBasicStyle,mStyle.orderText]}>{langObj.orderRecommend}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={()=>{
                            this.selectOrder(2);
                        }}
                        style={[mStyle.orderRow]}>
                        <View style={[mStyle.dot, {opacity:this.state.orderType==2?1:0}]}/>
                        <Text style={[globalStyle.textBasicStyle,mStyle.orderText]}>{langObj.orderWhatNew}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={()=>{
                            this.selectOrder(3);
                        }}
                        style={[mStyle.orderRow]}>
                        <View style={[mStyle.dot, {opacity:this.state.orderType==3?1:0}]}/>
                        <Text style={[globalStyle.textBasicStyle,mStyle.orderText]}>{langObj.orderPriceHighToLow}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={()=>{
                            this.selectOrder(4);
                        }}
                        style={[mStyle.orderRow]}>
                        <View style={[mStyle.dot, {opacity:this.state.orderType==4?1:0}]}/>
                        <Text style={[globalStyle.textBasicStyle,mStyle.orderText]}>{langObj.orderPriceLowToHigh}</Text>
                    </TouchableOpacity>
                </View>
                <View style={{width:this.state.indicatorSizeW, height:this.state.indicatorSizeH, backgroundColor: greyHasOpacity,
                    flexDirection:"column",alignItems:"center", justifyContent:"center", position:"absolute",top:0,left:0}}>
                    <ActivityIndicator animating={this.state.indicatorDisplay} size="large" color={c_loading_icon} />
                </View>
            </View>
        );
    }
}
let perfectSize = create(getDesignDimension());
let langObj = getLanguage();
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const mStyle = StyleSheet.create({
    textLabel: {
        fontSize: 18,
        width: '100%',
        textAlign:'center',
        marginTop:10,
        letterSpacing:-1,
        color:'#46474b'
    },
    itemContainerList :{
        //width:screenWidth,
        flex: 1,
        flexDirection: "row",
        margin: 10,
        paddingStart:5,
        paddingEnd:5,
        paddingTop:10,
        paddingBottom:10,
        backgroundColor:'#ffffff',
        marginTop:10,
        shadowColor: 'rgb(0, 0, 0)',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.11,
        shadowRadius: 3,
        elevation: 2.5,
    },
    itemContainerGallery :{
        //width:screenWidth,
        width:(screenWidth/2)-20,
        // flex: 1,
        flexDirection: "column",
        alignItems:'center',
        justifyContent:'center',
        margin: 10,
        paddingStart:5,
        paddingEnd:5,
        paddingTop:10,
        paddingBottom:10,
        backgroundColor:'#ffffff',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    textTopControl: {
        fontSize: 20,
    },
    promotionContainer: {
        width:screenWidth*0.1,
        height: screenWidth*0.1*(312/298),
        alignItems:'center',
        justifyContent:'center',
        position:'absolute'
    },
    promotionText: {
        fontSize:8,
        color:"#000000",
        textAlign:'center'
    },
    buttonBuy : {
        backgroundColor: "#000000",
        padding:10,
        marginTop: 10,
        width:screenWidth*0.2,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonBuyText: {
        color:'#ffffff',
        fontSize:14,
        textAlign:'center'
    },
    orderContainer : {
        alignSelf:'flex-end',
        flexDirection:'column',
        width:screenWidth*0.5,
        top:0,
        left:0,
        padding:5,
        // end:10,
        // top:42,
        backgroundColor:"#ffffff",
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex:1
    },
    orderRow:{
        marginTop:5,
        marginBottom:5,
        flexDirection:'row',
        alignItems:'center'
    },
    dot:{
        width:10,
        height:10,
        borderRadius:15,
        backgroundColor:"#000000",
        margin:10
    },
    orderText:{
        fontSize:18,
        marginStart:5,
        textAlign:I18nManager.isRTL || isForceRTL ? 'right' : 'left',
    }
})
