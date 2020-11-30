/*eslint prettier/prettier:0*/
/**
 * @format
 * @prittier
 */

import * as React from 'react';
import {
  View, Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {c_bg_search_box_dark, c_grey_darker, c_main_orange, c_text_header} from '../../resource/BaseValue';
import {globalStyle} from '../../resource/style/GlobalStyle';
import getLanguage from '../../resource/LanguageSupport';
import moment from 'moment';
import 'moment/locale/he';
moment.locale('he')

export default class OrderStatusBarComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        order: this.props.order
      };
    }

    componentDidMount() {
    
    }

    componentWillReceiveProps () {
       
    }

    update = (newOrder) => {
        this.setState({
            order :newOrder
        });
    }

    getStatusMessage = () => {
        let displayText = "";
        console.log(JSON.stringify(this.state.order));
        if (this.state.order != null) {
            console.log("order Status: " + this.state.order.status);
            switch (this.state.order.status) {
                case 1: 
                    displayText = langObj.statusOrder1;
                break;
    
                case 2: 
                    displayText = langObj.statusOrder1;
                break;
    
                case 3: 
                    displayText = langObj.statusOrder2;
                break;
    
                case 4: 
                    displayText = langObj.statusOrder2;
                break;
    
                case 5: 
                    displayText = langObj.statusOrder3b;
                break;
    
                case 6: 
                    displayText = langObj.statusOrder3a;
                break;
    
                case 7: 
                    displayText = langObj.statusOrder4;
                break;
            }
        }

        return displayText;
    }

    getEstimateTimeOfArrival = () =>{
        if (this.state.order != null) {
            //let momentDeliveryTime = moment.utc(this.state.order.delivery_time).local();
            //let momentNow = moment();
            //let diffTime = momentDeliveryTime.diff(momentNow);
            //diffTime = - diffTime;
            //let tempTime = moment.duration(diffTime);
            return moment.utc(this.state.order.delivery_time).local().format("HH:mm")
            //return tempTime.hours() + ":" + tempTime.minutes();
        } else {
            return "00:00";
        }
    }
   

    render() {
        return (
            <View style={[globalStyle.bgShadow, mStyle.statusBarContainer]}>
                <View style={{flexDirection:'row'}}>
                    <View style={[mStyle.statusBoxItem, {backgroundColor: this.state.order.status != 1 ? c_main_orange : c_bg_search_box_dark}]}></View>
                    <View style={[mStyle.statusBoxItem, {backgroundColor: this.state.order.status > 2 ? c_main_orange : c_bg_search_box_dark}]}></View>
                    <View style={[mStyle.statusBoxItem, {backgroundColor: this.state.order.status > 4 ? c_main_orange : c_bg_search_box_dark}]}></View>
                    <View style={[mStyle.statusBoxItem, {backgroundColor: this.state.order.status == 7 ? c_main_orange : c_bg_search_box_dark}]}></View>
                </View>
                <Text style={[globalStyle.textBasicBoldStyle, {fontSize:18, marginTop:10, textAlign:'center'}]}>
                    {this.getStatusMessage()} 
                </Text>
                <Text style={[globalStyle.textBasicStyle, {fontSize:15, marginTop:5, color:c_grey_darker}]}>
                {langObj.timeOfArrival + " " + this.getEstimateTimeOfArrival()}      
                </Text>
            </View>
          );
    }
}

let langObj = getLanguage();
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const mStyle = StyleSheet.create({
    statusBarContainer : {
        width:screenWidth-40,
        margin:20,
        padding:10,
        flexDirection:"column",
        alignItems:'center',
        justifyContent:'center',
        borderRadius:10,
        backgroundColor:"#ffffff"
    },
    statusBoxItem : {
        margin:5,
        height:10,
        flex:1
    },
})