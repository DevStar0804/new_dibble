

import * as React from 'react';
import {
    View,
    FlatList,
    Text,
    ScrollView,
    Image,
    StyleSheet,
    Dimensions,
    TextInput,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    NativeModules,
    ImageBackground,
    I18nManager,
} from 'react-native';
import * as RNLocalize from "react-native-localize";
import FastImage from 'react-native-fast-image'
import {
    apiUrl,
    c_active_dot, c_bg_search_box_dark,
    c_dark_line,
    c_dark_text,
    c_inactive_dot,
    c_loading_icon,
    c_text_green,
    greyHasOpacity, isForceRTL,
    key_user_info,
    LandingScreenName,
    ProductDetailScreenName,
    rc_success,
    rq_get_category_products,
    rq_get_sub_categories,
    SearchResultScreenName,
    c_cursor_textInput
} from '../resource/BaseValue';
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage, {getDesignDimension} from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';
import {create} from 'react-native-pixel-perfect';
import {makeAPostRequest} from '../resource/SupportFunction';

export default class CategoryScreen extends React.Component {
    constructor (props) {
        super(props);
        this.catFlatlist = React.createRef();
        this.state = ({
            searchText:"",
            isRefresh: true,
            category_id: "",
            category_name: "",
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            next_product_id: 0,
            products: [
            ],
            flatlistNumColumns:2,
            key:1,
            isShowOrder:false,
            orderType:2,
        })
    }


    componentDidMount (){
        console.log(RNLocalize.getLocales());
        RNLocalize.addEventListener("change", () => {
            // do localization related stuff…
        });
        let allState = this.state;
        allState.category_id = this.props.route.params.category_id;
        allState.category_name = this.props.route.params.category_name;
        this.setState(allState, ()=>{
            this.loadUserInfo();
        });
        console.log(this.state);
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
                this.loadProductsInCategory(this.state.next_product_id);
            } else {

            }
        } catch(e) {
            // error reading value

        }
    }

    loadProductsInCategory = async (startProductId) =>{
        this._showLoadingBox();
        let dataObj = {
            request: rq_get_category_products,
            token: this.state.userInfo.token,
            category_id: this.state.category_id,
            start_with_product_id: startProductId,
            order_by:this.state.orderType
        }
        console.log(dataObj);
        makeAPostRequest(dataObj,
            ()=>this._showLoadingBox(),
            ()=>this._closeLoadingBox(),
            (isSuccess, responseJson)=>{
                if (isSuccess){
                    let allState = this.state;
                    allState.next_product_id = responseJson.next_product_id;
                    allState.products = responseJson.products;
                    this.setState(allState);
                } else {
                    alert(responseJson);
                }
            });    
    }

    componentWillReceiveProps(nextProps: Props, nextContext: *): * {
        // if (this.catFlatlist.current != null) {
        //     this.catFlatlist.current.scrollToOffset({ animated: true, offset: 0 });
        // }
        this.setState({
            searchText:"",
            isRefresh: true,
            category_id: "",
            category_name: "",
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            next_product_id: 0,
            products: [
            ]
        })
        setTimeout(()=>{
            let allState = this.state;
            allState.category_id = this.props.route.params.category_id;
            allState.category_name = this.props.route.params.category_name;
            this.setState(allState, ()=>{
                this.loadProductsInCategory(this.state.next_product_id);
            });
        },500);
    }

    checkTokenForMenu = async  () => {
        try {
            const value = await AsyncStorage.getItem(key_user_info)
            if(value != null) {
                // value previously stored
                const jsonValue = JSON.parse(value);
                console.log(jsonValue);
                let allState = this.state;
                allState.userInfo = jsonValue;
                this.setState(allState);
                if (allState.userInfo.token == "") {
                    this.props.navigation.navigate(LandingScreenName);
                } else {
                    this.props.navigation.openDrawer();
                }
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
                        resizeMode={FastImage.resizeMode.contain}
                        style={{width:screenWidth*0.15, height:screenWidth*0.2, marginStart:screenWidth*0.1, marginEnd:10, alignSelf: 'flex-end'}}
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
                            <Text style={[mStyle.buttonBuyText]}>{langObj.buy}</Text>
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
                        resizeMode={FastImage.resizeMode.contain}
                        style={{width:screenWidth*0.2, height:screenWidth*0.3, margin:5}}
                    />
                    <Text
                        numberOfLines={3}
                        style={[globalStyle.textProductItemName,{flex:1, alignSelf:'center', textAlign:'center', margin:5}]}>{item.name} </Text>
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
                        <Text style={[globalStyle.textBasicStyle,mStyle.buttonBuyText]}>{langObj.buy}</Text>
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
                        //this.startSearch(0);
                        this.loadProductsInCategory(0);
                    })
                })
        }
    }

    render () {
        const {flatlistNumColumns, key} = this.state;
        return (
            <View style={{flex:1, flexDirection:"column", alignItems:"center", backgroundColor:'#ffffff'}}>
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
                                selectionColor={c_cursor_textInput}
                                value={this.state.searchText}
                                onSubmitEditing={()=>{
                                    this.props.navigation.navigate(SearchResultScreenName, {
                                        searchText: this.state.searchText
                                    })
                                }}
                                onChangeText={(text)=>{
                                    this.setState({searchText: text})
                                }}
                                placeholder={langObj.searchTextInMain}
                            />
                            <TouchableOpacity
                                onPress={()=>{
                                    this.setState({searchText:""});
                                }}>
                                <FastImage
                                    source={require("../image/icon_close_black.png")}
                                    resizeMode="contain"
                                    style={{
                                        width:screenWidth*0.03,
                                        height:screenWidth*0.03,marginEnd:5}}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={{flex:1, flexDirection: 'column'}}>
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
                    <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel, {margin: 10}]}>{this.state.category_name}</Text>
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
                    flexDirection:"column",alignItems:"center", justifyContent:"center", position:"absolute"}}>
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
    ttextLabel: {
        fontSize: 18,
        width: '100%',
        textAlign:'center',
        margin:10
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
    itemContainerGallery :{
        width:(screenWidth/2)-20,
        flexDirection: "column",
        alignItems:'center',
        justifyContent:'center',
        margin: 10,
        paddingStart:5,
        paddingEnd:5,
        paddingTop:10,
        paddingBottom:10,
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
