/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */
import { Icon } from 'react-native-elements'
import ReadMore from './comp/ReadMore'
import * as React from 'react';
import {
    View, FlatList, Text, ScrollView, Image, StyleSheet, Dimensions,
    TouchableOpacity, ActivityIndicator, ImageBackground, Vibration
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import * as RNLocalize from "react-native-localize";
import {
    c_bg_product_image, c_grey_darker, c_grey_light,
    c_inactive_dot, c_loading_icon, c_main_orange, c_red,
    greyHasOpacity, key_products_cart, key_screen_comeback,
    key_user_info, LandingStackName, MyCartScreenName, ProductDetailScreenName,
    rc_token_expire, rq_get_product, rq_set_user_product_like,
} from '../resource/BaseValue';
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage from '../resource/LanguageSupport';
import {makeAPostRequest} from '../resource/SupportFunction';
import {globalStyle} from '../resource/style/GlobalStyle';
import HTML from "react-native-render-html";
import FastImage from 'react-native-fast-image'
import { SliderBox } from "../resource/lib/SliderBox";
import SearchHeaderBarFunc from './SearchHeaderBarFunc';
import { connect } from "react-redux";
import {callUpdateCart, callUpdateLikeProduct} from './redux/appCart';
import {create} from 'react-native-pixel-perfect'
import {getDesignDimension} from '../resource/LanguageSupport';
import { TextInput } from 'react-native';
const scaling_factor=1.7;

let perfectSize = create(getDesignDimension());

class ProductDetailScreen extends React.Component {
    constructor (props) {
        super(props);
        this.scrollMain = React.createRef();
        this.state = ({
          
            isRefresh: true,
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            productInfo: {
                images:[],
                price:0,
                sale_price:0,
                is_liked: false
            },
            orderId: 0,
            addedToCart: false,
            isBackFromInvalidToken : false,
            otherProducts: [

            ]
        })
    }


    componentDidMount (){
        console.log("componentDidMount");
        RNLocalize.addEventListener("change", () => {
            // do localization related stuff…
        });
        let allState = this.state;
        allState.addedToCart = false;
        allState.product_id = this.props.route.params.product_id;
        this.setState(allState, ()=>{
            this.loadUserInfo();
        });
        console.log(this.props.route);
    }

    componentWillReceiveProps(nextProps: Props, nextContext: *): * {
        console.log("componentWillReceiveProps");
        console.log(this.props);
        this.setState({productInfo:{images:[]}});
        setTimeout(()=>{
            if (this.props.route != null
                && this.props.route.params != null
                && this.props.route.params.product_id != null) {
                console.log(this.props.route);
                let allState = this.state;
                allState.addedToCart = false;
                allState.product_id = this.props.route.params.product_id;
                allState.orderId = 0;
                if (this.props.route.params.refresh != null) {
                    allState.isBackFromInvalidToken = true;
                }
                this.setState(allState, ()=>{
                    this.loadUserInfo();
                });
            } else {
                this.loadUserInfo();
            }
        }, 500);
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

    loadUserInfo = async  () => {
        try {
            const value = await AsyncStorage.getItem(key_user_info)
            if(value != null) {
                // value previously stored
                const jsonValue = JSON.parse(value);
                let allState = this.state;
                allState.userInfo = jsonValue;
                this.setState(allState);
                this.loadProductDetails();
            } else {

            }
        } catch(e) {
            // error reading value

        }
    }

    loadProductDetails = async () => {
        this._showLoadingBox();
        let dataObj = {
            request: rq_get_product,
            token: this.state.userInfo.token,
            product_id: this.state.product_id,
        }
        makeAPostRequest(dataObj,
            ()=>{this._showLoadingBox()},
            ()=>{this._closeLoadingBox()},
            (isSuccess, responseJson)=>{
                if(isSuccess) {
                    let allState = this.state;
                    allState.productInfo = responseJson;
                    // allState.productInfo.isLiked = false;
                    allState.productInfo.images = [];
                    allState.productInfo.images.push(allState.productInfo.image);
                    for (let i = 0; i < allState.productInfo.other_images.length; i++) {
                        allState.productInfo.images.push(allState.productInfo.other_images[i]['image']);
                    }
                    allState.productInfo.imageViewFull = allState.productInfo.image;
                    allState.otherProducts = responseJson.other_searched;
                    this.state.productInfo.purchaseAmount = 1;
                    this.setState({chosen_option:allState.productInfo.options[0].name})
                    this.setState(allState, ()=> {
                        if (this.state.isBackFromInvalidToken) {
                            this.addProductToOrder();
                        }
                        this.scrollMain.current.scrollTo(0);
                    });
                } else {
       //  alert (responseJson);
                }
            });
    }
    getOptionName(){
        return this.state.productInfo.options_name
    }
    getOptions(){
        if(this.state.productInfo.options){
        let res= this.state.productInfo.options.map((option=>option["name"]))
        return res.length>0? res:null
        }
    }
    getOptionPrice(optionName){
        let result =this.state.productInfo.options.find((obj)=>obj["name"]==optionName)
        if (result!==undefined){
            let to_return= result["price"]
            return String(to_return)
        }
    }
    displayProductDetail () {
        let detailedContent = [];
        if (this.state.productInfo.details != null) {
            for (let i = 0; i < this.state.productInfo.details.length; i++) {
                let detailsItem = this.state.productInfo.details[i];
                detailedContent.push(
                   detailsItem['name'] + ": " + detailsItem['details']
                )
            }
        }
        return detailedContent;
    }

    toogleLikeProduct = async () => {
        if (this.state.userInfo.token != null && this.state.userInfo.token != "") {
            let data = {
                request : rq_set_user_product_like,
                token: this.state.userInfo.token,
                product_id: this.state.productInfo.product_id,
                is_like : !this.state.productInfo.is_liked
            }
            makeAPostRequest(data,
                ()=>function(){},
                ()=> function(){},
                (isSuccess, dataResponse)=>{
                    if (isSuccess) {
                        let allState = this.state;
                        allState.productInfo.is_liked = !allState.productInfo.is_liked;
                        this.setState(allState, ()=>{
                            this.props.callUpdateLikeProduct();
                        });
                    } else {
                        if (dataResponse == rc_token_expire) {
                            AsyncStorage.setItem(key_screen_comeback, ProductDetailScreenName);
                            this.props.navigation.navigate(LandingStackName,{
                                previousScreen: ProductDetailScreenName
                            });
                        } else {
                         //   alert (dataResponse);
                        }
                    }
                });
        } else {
            AsyncStorage.setItem(key_screen_comeback, ProductDetailScreenName);
            this.props.navigation.navigate(LandingStackName,{
                previousScreen: ProductDetailScreenName
            });
        }

    }

    setChosenOption=(option)=>{
    this.setState({chosen_option:option})
}
    addProductToOrder = async () => {
        if (!this.state.addedToCart ) {
            // this._showLoadingBox();
            let productsInCart = await AsyncStorage.getItem(key_products_cart);
            if (productsInCart != null && productsInCart != "") {
                console.log(productsInCart);
                let productLists = JSON.parse(productsInCart);
                let isAdded = false;
                if (productLists.length > 0) {
                    for (let i = 0; i < productLists.length && !isAdded; i++) {
                        if (productLists[i]['product_id'] == this.state.productInfo.product_id) {
                            productLists[i]['amount'] = parseInt(productLists[i]['amount']) + this.state.productInfo.purchaseAmount;
                            isAdded = true;
                        }
                    }
                }
                if (!isAdded) {
                    let productItems = {
                        product_id : this.state.productInfo.product_id,
                        amount : this.state.productInfo.purchaseAmount,
                        product_name : this.state.productInfo.name,
                        price : this.state.productInfo.price,
                        sale_price : this.state.productInfo.sale_price,
                        product_image : this.state.productInfo.image
                    }
                    productLists.push(productItems);
                }
                AsyncStorage.setItem(key_products_cart, JSON.stringify(productLists)).then(
                    ()=>{
                        let amount = 0;
                        for (let i = 0; i < productLists.length; i++) {
                            amount = amount + productLists[i]['amount'];
                        }
                        this.props.callUpdateCart(amount);
                        Vibration.vibrate();
                        let allState = this.state;
                        allState.addedToCart = true;
                        this.setState(allState)
                    }
                )
            } else {
                let productItems = {
                    product_id : this.state.productInfo.product_id,
                    amount : this.state.productInfo.purchaseAmount,
                    product_name : this.state.productInfo.name,
                    price : this.state.productInfo.price,
                    sale_price : this.state.productInfo.sale_price,
                    product_image : this.state.productInfo.image
                }
                let productLists = [];
                productLists.push(productItems);
                AsyncStorage.setItem(key_products_cart, JSON.stringify(productLists)).then(
                    ()=>{
                        let amount = 0;
                        for (let i = 0; i < productLists.length; i++) {
                            amount = amount + productLists[i]['amount'];
                        }
                        this.props.callUpdateCart(amount);
                        Vibration.vibrate();
                        let allState = this.state;
                        allState.addedToCart = true;
                        this.setState(allState)
                    }
                )
            }
            this._closeLoadingBox();
        } else {
            this.props.navigation.navigate(MyCartScreenName, {
                orderId :this.state.orderId
            });
        }
    }

    render () {
        return (

            <View style={{flex:1, flexDirection:"column", alignItems:"center", backgroundColor:'#ffffff'}}>
        
                <SearchHeaderBarFunc navigation={this.props.navigation} title={ProductDetailScreenName}/>
                <View style={{flex:1, flexDirection: 'column'}}>
        
                    <ScrollView
                        ref={this.scrollMain}
                        style={{flex:1 }}>
             <View style={{flex:1,height:perfectSize(800)}}>
               <SliderBox
                                        // style={{backgroundColor:c_bg_product_image}}
                                        ImageComponentStyle={{resizeMode:"contain",backgroundColor:'white'}}
                                        circleLoop
                                         disableOnPress={true}
                                         sliderBoxHeight={perfectSize(1125)}
                                         sliderboxWidth={perfectSize(1125)}
                                         dotColor="#000000"
                                        inactiveDotColor={c_inactive_dot}
                                        dotStyle={{
                                            width: perfectSize(24),
                                            height: perfectSize(24),
                                            borderRadius: 15,
                                            padding:0,
                                            marginStart: -5,
                                            marginEnd: -5,
                                            marginBottom: 0,
                                            borderStyle: "solid",
                                            borderWidth: perfectSize(2),
                                            borderColor: "#f7ba48"
                                        }}
                                        images={this.state.productInfo.images} />
                                        </View>
                             
                             
                                    <View style={{ flexDirection:"column" ,alignItems:"flex-end",marginEnd:perfectSize(43),height:perfectSize(100),marginTop:-30}}>
                                        <FastImage
                                        source={require('../image/icon_upload.png')}
                                        resizeMode="contain"
                                        style={[{height:perfectSize(43.9*scaling_factor),width:perfectSize(50.3*scaling_factor)}]}
                                    />
                                         
                                            <TouchableOpacity   onPress={()=>{
                                            this.toogleLikeProduct();
                                        }} style={{  paddingTop:perfectSize(70) }}>
                                             <FastImage
                                            source={this.state.productInfo.is_liked ? require('../image/icon_heart_orange.png') : require('../image/icon_heart_grey.png')}
                                             style={[{height:perfectSize(45*scaling_factor),width:perfectSize(50*scaling_factor)}]}
                                        />
                                        </TouchableOpacity>
                                     </View>
                         <View style={{flex:1}} >                                        
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.itemName,{fontSize:perfectSize(50),marginTop:perfectSize(41*scaling_factor),marginStart:perfectSize(42),textAlign:'left',width:perfectSize(800)}]}>{this.state.productInfo.name}</Text>
                          <View                              style={{fontFamily:'AlmoniDLAAA',color:'#858586',fontWeight:'normal',fontSize:perfectSize(40),marginStart:perfectSize(42),width:perfectSize(930)}}
>
                            <HTML
                                html={this.state.productInfo.description}
                                ignoredStyles={['text-align']}
                                {...defaultRenderer}
                                imagesMaxWidth={screenWidth}/>
                     </View>
                            {/*<Text>{this.state.productInfo.description}</Text>*/}
                            {/*<HTMLView*/}
                            {/*    value={this.state.productInfo.description}*/}
                            {/*    stylesheet={{*/}
                            {/*        div:{*/}
                            {/*           textAlign:'right',*/}
                            {/*            display:"flex",*/}
                            {/*            alignItems:'flex-start'*/}
                            {/*        },*/}
                            {/*        p:{*/}

                            {/*        },*/}
                            {/*        ul: {*/}
                            {/*            listStyleType:'arabic-indic',*/}
                            {/*            direction:'rtl',*/}
                            {/*            textAlign: 'right'*/}
                            {/*        }*/}
                            {/*    }}*/}
                            {/*    style={[globalStyle.textBasicStyle, mStyle.itemDescription]}*/}
                            {/*/>*/}
                        </View >





                        <View style={[mStyle.labelContainer,{flexDirection:'row',paddingTop:perfectSize(52)}]}>
                            <Text style={[globalStyle.textLabelDesc ]}>{langObj.price}</Text>
                            <Text style={{fontFamily:'OscarFM-Regular',fontSize:perfectSize(75),letterSpacing:perfectSize(-1.5),color:this.state.productInfo.sale_price>0?"#d30000":'black',marginStart:perfectSize(44.5)}}>₪{
                            this.getOptions()?this.getOptionPrice(this.state.chosen_option):
                            this.state.productInfo.sale_price>0?this.state.productInfo.sale_price:this.state.productInfo.price} </Text>


{/* Has Sale out??? */}
                        {this.state.productInfo.sale_price>0?(
                         <View style={{flexDirection:'row',marginStart:perfectSize(24)}}>
                           <View style={{flexDirection:'row'}}>
                                     <Text style={[globalStyle.sale_price]}>{this.state.productInfo.price}</Text>
                        <Text style={[globalStyle.price]}> {langObj.NIS}</Text>
                                    </View>
                         <Text style={{marginTop:perfectSize(30),marginStart:perfectSize(24),fontSize:perfectSize(40),color:'black',fontWeight:'normal',textShadowColor:"#f7ba48",textShadowRadius:perfectSize(8),fontFamily:'OscarFM-Regular'}}>{langObj.saleOfMonth}</Text>
                         </View>
                         ):<View/> }


                         </View>
                    {/* Color preview */}
                        
                        <View style={[mStyle.labelContainer,{display:this.getOptionName()===langObj.volume?"flex":"none",paddingTop:perfectSize(30)}]}>
                            <Text style={[globalStyle.textLabelDesc]}>{langObj.color}</Text>



                          <View 
                          style={[{ 
                          alignItems:'center',
                          alignContent:'center',
                          marginStart:perfectSize(57.5),
                          justifyContent:'center',
                          width:perfectSize(250),
                          height:perfectSize(100), 
                          shadowOffset:{width:0,height:0},
                          shadowOpacity:1.0,
                          shadowRadius:perfectSize(15),
                          shadowColor:'rgba(0,0,0,0.1)',
                          borderRadius:perfectSize(20),
                          borderWidth:perfectSize(1),
                          borderStyle:'solid',
                          borderColor:"#f1f1f3"},globalStyle.shadow_box]}>
                           {/* Selected color Preview */}
                            <View style={{height:perfectSize(72),width:perfectSize(223),backgroundColor:"#ffca1a",borderRadius:perfectSize(16)}}></View>
                            </View>
                            <Text style={globalStyle.insert_color_code}>{langObj.insertColorCode}</Text>
                          {/* Select color input */}
                             <TextInput
                             style={[globalStyle.shadow_box,{
                                 marginStart:perfectSize(18),
                                width: perfectSize(250),
                                height: perfectSize(100),
                                borderRadius: perfectSize(20),
                                backgroundColor:'white',
                                borderStyle: "solid",
                                borderWidth: perfectSize(1),
                                borderColor: "#f1f1f3"}
                             ]}
                         />
                        </View>
                        {this.getOptions()?(<View style={[mStyle.labelContainer,{paddingTop:perfectSize(30)}]}>
                            
                            <Text style={[globalStyle.textLabelDesc]}>{this.state.productInfo.options_name}</Text>
        
<DropDownPicker
    items={[
        ...this.getOptions().map((option,index)=>
            {
                return {label: option, value: option,selected:index==0?true:false}
            })]}
    placeholderStyle={{
        fontWeight: 'bold',
        textAlign: 'center'
    }}
    defaultValue={this.state.chosen_option}
    containerStyle={{borderRadius:perfectSize(20),height: perfectSize(100),width:perfectSize(240),marginStart:perfectSize(26.5)}}
    style={{backgroundColor: 'white'}}
    itemStyle={{
        justifyContent: 'center',
        alignItems:'center',
        
    }}
    labelStyle={{ direction:'rtl',
    fontSize:perfectSize(60),fontFamily:'AlmoniDLAAA-Black',letterSpacing:perfectSize(-1.5)}}
    arrowStyle={{marginStart:perfectSize(40.5),height:perfectSize(30.3),width:perfectSize(46.7),color:"#8c8d8f"}}
    
    onChangeItem={item => this.setChosenOption(item.value)}
/> 
                         </View>):<View></View>}
                        <View style={[mStyle.labelContainer,{paddingTop:perfectSize(30)}]}>
                            <Text style={[globalStyle.textLabelDesc]}>{langObj.amount}</Text>
                            <TouchableOpacity
                                onPress={()=>{
                                    if (this.state.productInfo.purchaseAmount > 1) {
                                        let allState = this.state;
                                        allState.productInfo.purchaseAmount = allState.productInfo.purchaseAmount -1;
                                        this.setState(allState);
                                    }
                                }}
                            // Minus Picture
                            
                                >
                                <View style={[mStyle.itemColorSelectNormal,{marginEnd:perfectSize(25),
                                    height:perfectSize(68),width:perfectSize(68),backgroundColor: "#46474b", borderColor: "#000000", marginStart: 10,opacity: 1}]
                                    }
                                    
                                    opacity={this.state.productInfo.purchaseAmount>1?1:0.2}
                                    >
                                <FastImage
                                    source={require('../image/icon_devide_white.png')}
                                    resizeMode="contain"
                                    style={{
                                        width:perfectSize(31),
                                        height:perfectSize(6)}}
                                />
                                </View>
                            </TouchableOpacity>
                            <View style={{height:perfectSize(100),borderColor:"#f1f1f3",shadowColor:"rgba(0, 0, 0, 0.1)",borderWidth:perfectSize(2),borderRadius:perfectSize(20),width:perfectSize(130),backgroundColor:'white',flexDirection: 'row',justifyContent:"center", alignItems: 'center'}}>
                            {/* Quantity text */}
                                <Text style={[{fontSize:perfectSize(75),marginEnd:perfectSize(25),fontFamily:'AlmoniDLAAA-Black'}]}>{this.state.productInfo.purchaseAmount}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={()=>{
                                    let allState = this.state;
                                    allState.productInfo.purchaseAmount = allState.productInfo.purchaseAmount + 1;
                                    this.setState(allState);
                                }}
                                style={[mStyle.itemColorSelectNormal,{backgroundColor: "#46474b",height:perfectSize(68),width:perfectSize(68), borderColor: "#000000", marginStart: 10}]}>
                                <FastImage
                                    source={require('../image/icon_plus_white.png')}
                                    resizeMode="contain"
                                         style={{
                                            width:perfectSize(31),
                                            height:perfectSize(31)}}
                                />
                            </TouchableOpacity>
                        </View>
                        {/* <View style={[mStyle.sectionContainer,{flex:1,alignItems:'center',alignContent:'center',height:perfectSize(140),backgroundColor:"#46474b"}]}>
                            <Text style={[globalStyle.textBasicBoldStyle,mStyle.textLabel,{fontSize:perfectSize(50),color:"#ffffff",flex:1}]}>{langObj.importantDetails}</Text>
                            <FastImage
                                source={require('../image/icon_arrow_white_down.png')}
                                resizeMode="contain"
                                style={{
                                    width:perfectSize(48),
                                    height:perfectSize(29.6),
                                marginTop:perfectSize(14)}}
                            />
                        </View>
                        <View style={{flexDirection:'row', alignItems:'center',paddingStart: 40, paddingEnd:20}}>
                            <View style={{flexDirection:"column", alignItems:'center'}}>
                                <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,{fontSize: 25}]}>4.7</Text>
                                <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel]}>{langObj.outOf} 5</Text>
                            </View>
                            <View style={{flexDirection:"column", alignItems:'center', flex:1}}>
                                <Text style={[globalStyle.textBasicStyle, mStyle.textLabel, {fontSize: 10}]}>{langObj.rateNow}</Text>
                            </View>
                        </View>

                        <View style={{flexDirection:'row', alignItems:'center', marginTop: 30,marginStart: 20, marginEnd:20}}>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel, {width: screenWidth*0.2}]}>{langObj.speed}</Text>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel, {width: screenWidth*0.15}]}>8/10</Text>
                            <View style={{flex:1, flexDirection:'row', width:screenWidth*0.5, marginStart:10}}>
                                <View style={{height:10, width:screenWidth*0.4, backgroundColor:c_main_orange}}></View>
                                <View style={{height:10, width:screenWidth*0.1, backgroundColor:c_main_orange, opacity:0.2}}></View>
                            </View>
                        </View>
                        <View style={{flexDirection:'row', alignItems:'center', marginTop: 10,marginStart: 20, marginEnd:20}}>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel, {width: screenWidth*0.2}]}>{langObj.power}</Text>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel, {width: screenWidth*0.15}]}>9/10</Text>
                            <View style={{flex:1, flexDirection:'row', width:screenWidth*0.5, marginStart:10}}>
                                <View style={{height:10, width:screenWidth*0.45, backgroundColor:c_main_orange}}></View>
                                <View style={{height:10, width:screenWidth*0.05, backgroundColor:c_main_orange, opacity:0.2}}></View>
                            </View>
                        </View>
                        <View style={{flexDirection:'row', alignItems:'center', marginTop: 10,marginStart: 20, marginEnd:20}}>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel, {width: screenWidth*0.2}]}>{langObj.speed}</Text>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel, {width: screenWidth*0.15}]}>8/10</Text>
                            <View style={{flex:1, flexDirection:'row', width:screenWidth*0.5, marginStart:10}}>
                                <View style={{height:10, width:screenWidth*0.4, backgroundColor:c_main_orange}}></View>
                                <View style={{height:10, width:screenWidth*0.1, backgroundColor:c_main_orange, opacity:0.2}}></View>
                            </View>
                        </View>
                        <View style={{flexDirection:'row', alignItems:'center', marginTop: 10,marginStart: 20, marginEnd:20}}>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel, {width: screenWidth*0.2}]}>{langObj.power}</Text>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel, {width: screenWidth*0.15}]}>9/10</Text>
                            <View style={{flex:1, flexDirection:'row', width:screenWidth*0.5, marginStart:10}}>
                                <View style={{height:10, width:screenWidth*0.45, backgroundColor:c_main_orange}}></View>
                                <View style={{height:10, width:screenWidth*0.05, backgroundColor:c_main_orange, opacity:0.2}}></View>
                            </View>
                        </View> */}


{/* Technical Details Section */}

                        {this.state.productInfo.details&&this.state.productInfo.details.length?(
                        
                        <View>
                        <View style={[mStyle.sectionContainer,{height:perfectSize(140),flex:1, backgroundColor:"#46474b"}]}>
                            <Text style={[globalStyle.textBasicBoldStyle,mStyle.textLabel,{fontSize:perfectSize(50),color:"white",flex:1}]}>{langObj.technicalDetails}</Text>
                            <FastImage
                                source={require('../image/icon_arrow_white_down.png')}
                                resizeMode="contain"
                                style={{
                                    width:perfectSize(48),
                                    height:perfectSize(29.6),
                                    marginTop:perfectSize(14)}}

                             />
                        </View>

                        <View style={{flex:1, width:screenWidth, paddingStart:20, paddingEnd:20}}>
                            <ReadMore text={this.displayProductDetail.bind(this)}></ReadMore>
                        </View></View>
                        ):<Text></Text>
                    
                    }
                        
                     
                        <View style={{width:screenWidth, flexDirection:'column', backgroundColor: 'white'}}>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.buttonText,
                                {color: "#e4e4e4", marginStart: 20, marginTop:10,fontSize:perfectSize(75)}]}>{langObj.otherAlsoForSearch}</Text>
                            <FlatList
                                numColumns={2}
                                style={{ marginTop:10}}
                                data={this.state.otherProducts}
                                showsVerticalScrollIndicator={false}
                                renderItem={({item, index}) =>
                                    <TouchableOpacity
                                        onPress={()=>{
                                            let allState = this.state;
                                            allState.addedToCart = false;
                                            allState.product_id = item.product_id;
                                            this.setState(allState, ()=>{
                                                this.loadProductDetails();
                                            })
                                        }}
                                        style={[mStyle.itemContainerGallery]}>
                                        <FastImage
                                            source={{uri: item.image}}
                                            resizeMode="contain"
                                            style={{width:screenWidth*0.2, height:screenWidth*0.3, margin:5}}
                                        />
                                        <Text
                                            numberOfLines={3}
                                            style={[globalStyle.textProductItemName,{flex:1, alignSelf:'center', textAlign:'center', margin:5}]}>{item.name} {item.description}</Text>
                                        <View style={{flexDirection: 'row', alignItems: 'flex-end', }}>
                                            <Text
                                                numberOfLines={1}
                                                style={[globalStyle.textProductItemPrice]}>{
                                                 item.price}</Text>
                                            <Text
                                                numberOfLines={1}
                                                style={[globalStyle.textProductItemName, {marginStart:5}]}>{langObj.NIS}</Text>
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
                                            style={[mStyle.promotionContainer, {top:5,end:5,opacity: item.sale_price != 0 ?1:0}]}>
                                            <Text style={[globalStyle.textBasicBoldStyle,mStyle.promotionText]}>{langObj.saleOfMonth}</Text>
                                        </ImageBackground>
                                    </TouchableOpacity>
                                }
                                keyExtractor={(item) => item.product_id}
                            />
                        </View>

                    </ScrollView>
                    <TouchableOpacity
                        onPress={()=>{
                            this.addProductToOrder();
                        }}
                        style={{alignItems:'center', justifyContent:'center', marginBottom:20,marginStart: perfectSize(42), marginEnd:perfectSize(43), height:perfectSize(140),marginTop:10,
                            borderRadius:5,padding:5, backgroundColor:this.state.addedToCart?c_main_orange:"#000000"}}>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.buttonText,{color:this.state.addedToCart?"#ffffff":c_main_orange}]}>{this.state.addedToCart?langObj.viewShoppingCart:langObj.addToCart}</Text>
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
const mapStateToProps = state =>  ({

});
const mapDispatchToProps = dispatch => {
    return {
        callUpdateCart: (amount)  => dispatch(callUpdateCart(amount)),
        callUpdateLikeProduct: ()  => dispatch(callUpdateLikeProduct()),
    }
}

const defaultRenderer = {renderers: {
    p: (htmlAttribs, children, convertedCSSStyles, passProps) => {
      return <Text style={[globalStyle.htmlFixAlign]}>{children}</Text>;
    },
  },
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductDetailScreen);
let langObj = getLanguage();
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const mStyle = StyleSheet.create({
    itemName: {
        fontSize: 25,
        marginStart:10,
        marginEnd: 10,
        marginTop: 5,
    },
    buttonText: {
        fontSize: 25,
        marginStart:5,
        marginEnd: 5,
        marginTop: 5,
    },
    iconImageGallery : {
        width:screenWidth*0.08,
        height:screenWidth*0.08,
        marginBottom:10
    },
    itemDescription: {
        fontSize: 13,
        margin:5,
    },
    labelContainer: {
        flexDirection:'row',
        alignItems:"center",
        marginStart:20,
        marginTop:10
    },
    textLabel: {
        fontSize: 15,
    },
    textLabelContent: {
        fontSize: 15
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
    sectionContainer: {
        flexDirection: 'row',
        alignItems:'center',
        margin:20,
        paddingTop:15,
        paddingBottom:15,
        paddingStart:10,
        paddingEnd:10
    },
    itemContainerGallery :{
        //width:screenWidth,
        flex: 1,
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
    promotionContainerInImage: {
        width:screenWidth*0.15,
        height: screenWidth*0.15*(249/400),
        padding: 10,
        alignItems:'center',
        justifyContent:'center',
    },
    promotionTextInImage: {
        fontSize:10,
        color:"#000000",
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
    }
})
