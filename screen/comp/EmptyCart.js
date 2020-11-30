/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions, ScrollView,
    TouchableOpacity, Text, I18nManager, ImageBackground, FlatList,
} from 'react-native';
import {
    c_dark_line,
    c_dark_line_opacity,
    c_main_orange,
    c_red,
    c_text_grey, key_recommend_for_user,
    ProductDetailScreenName,
} from '../../resource/BaseValue';
import {globalStyle} from '../../resource/style/GlobalStyle';
import getLanguage from '../../resource/LanguageSupport';
import AsyncStorage from '@react-native-community/async-storage';

export default class CartEmpty extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          productList:[]
      };
    }

    componentDidMount() {
        this.loadRecommendProduct();
    }

    loadRecommendProduct = async () =>{
        let listStr = await AsyncStorage.getItem(key_recommend_for_user);
        console.log("loadRecommendProduct: " + listStr);
        if (listStr != null && listStr != "") {
            let products = JSON.parse(listStr);
            this.setState({
                productList: products
            })
        }
    }

    render() {
        const {number, onNumberChange,isVisible, navigation, ...props} = this.props;
        return (
            <ScrollView style={{flexDirection: 'column', width:screenWidth, flex:1}}>
                <View style={[globalStyle.sectionTitleContainer, {paddingTop:10, paddingBottom:10, marginEnd: 10}]}>
                    <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                        <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection, {color:c_text_grey}]}>{langObj.shoppingCart}</Text>
                        <Image
                            source={I18nManager.isRTL || langObj.isRTL ? require("../../image/icon_arrow_left_black_d2.png") : require("../../image/icon_arrow_right_black_d2.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.08,
                                height:screenWidth*0.08* (108/156),marginStart:5}}
                        />
                        <View style={{flex:1}}/>
                    </View>                    
                </View>
                <View style={{flexDirection:"column", alignItems:"center", marginTop:screenHeight*0.1,marginBottom:screenHeight*0.1}}>
                    <Image
                        source={require("../../image/icon_circle_draw.png")}
                        resizeMode="contain"
                        style={{
                            width:screenWidth*0.2,
                            height:screenWidth*0.2}}
                    />
                    <Text style={[globalStyle.textBasicBoldStyle, mStyle.textEmotions]}>{langObj.oops}</Text>
                    <Text style={[globalStyle.textBasicStyle, mStyle.textMessage]}>{langObj.emptyCartMessage}</Text>
                </View>
                <View style={[globalStyle.sectionTitleContainer, {paddingTop:10, paddingBottom:10}]}>
                    <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                        <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection, {color:"#000000"}]}>{langObj.recommendForYou}</Text>
                        <Image
                            source={I18nManager.isRTL || langObj.isRTL ? require("../../image/icon_arrow_left_black_d3.png") : require("../../image/icon_arrow_right_black_d3.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.08,
                                height:screenWidth*0.08* (108/156),marginStart:5}}
                        />
                        <View style={{flex:1}}/>

                    </View>
                </View>
                <FlatList
                    numColumns={2}
                    style={{ marginTop:10}}
                    data={this.state.productList}
                    showsVerticalScrollIndicator={false}
                    renderItem={({item, index}) =>
                        <TouchableOpacity
                            onPress={()=>{
                                this.props.navigation.navigate(ProductDetailScreenName, {product_id: item.product_id});
                            }}
                            style={[mStyle.itemContainerGallery]}>
                            <Image
                                source={{uri: item.image}}
                                resizeMode="contain"
                                style={{width:screenWidth*0.2, height:screenWidth*0.3, margin:5}}
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
                                    style={[globalStyle.textProductItemName, {marginStart:5}]}>{langObj.NIS}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={()=>{
                                    this.props.navigation.navigate(ProductDetailScreenName, {product_id: item.product_id});
                                }}
                                style={[mStyle.buttonBuy,{marginBottom:10}]}>
                                <Text style={[globalStyle.textBasicStyle,mStyle.buttonBuyText]}>{langObj.buy}</Text>
                            </TouchableOpacity>
                            <ImageBackground
                                source={require('../../image/icon_logo.png')}
                                resizeMode="contain"
                                style={[mStyle.promotionContainer, {top:5,end:5,opacity: item.isOnSale?1:0}]}>
                                <Text style={[globalStyle.textBasicBoldStyle,mStyle.promotionText]}>{langObj.saleOfMonth}</Text>
                            </ImageBackground>
                        </TouchableOpacity>
                    }
                    keyExtractor={(item) => item.product_id}
                />
            </ScrollView>
          );
    }
}

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
let langObj = getLanguage();
const mStyle = StyleSheet.create({
    textEmotions: {
        fontSize: 22,
        color:"#000000",
        marginTop:15
    },
    textMessage : {
        marginTop: 15,
        fontSize:18,
        textAlign:'center'
    },
    itemContainerGallery :{
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
        marginTop:10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
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
    }
})
