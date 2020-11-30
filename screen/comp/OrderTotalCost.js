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
import {c_grey_darker, c_text_header} from '../../resource/BaseValue';
import {globalStyle} from '../../resource/style/GlobalStyle';
import getLanguage from '../../resource/LanguageSupport';

export default class OrderTotalCostComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        productList: this.props.productList,
        deliverCost: this.props.deliverCost,
        shippingFee: this.props.shippingFee,
      };
    }

    componentDidMount() {
        
    }

    loadGrandTotalOrderPrice () {
        let totalCost =  parseFloat(this.loadOrderAmout()) + parseFloat(this.state.deliverCost) + parseFloat(this.state.shippingFee);
        return totalCost;
    }

    update = (nProductList, nDeliverCost, nShippingFee) =>{
        this.setState({
            productList: nProductList,
            deliverCost: nDeliverCost,
            shippingFee: nShippingFee,
        })
    }

    loadOrderAmout () {
        let tCost = 0;
        if (this.state.productList != null) {
            for (let i = 0; i < this.state.productList.length; i++) {
                tCost = tCost + parseInt(this.state.productList[i]['amount']) * parseFloat(this.state.productList[i]['price']);
            }
        }
        return tCost;
    }

    render() {
        return (
            <View style={[mStyle.mainContainer]}>
                <View style={[mStyle.labelContainer]}>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,{flex:1}]}>{langObj.orderAmount}</Text>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,]}>{langObj.priceUnit + " " + this.loadOrderAmout().toFixed(2)}</Text>
                    </View>
                    <View style={[mStyle.labelContainer]}>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,{flex:1}]}>{langObj.deliverCost}</Text>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,]}>{langObj.priceUnit + " " + this.state.deliverCost}</Text>
                    </View>
                    <View style={[mStyle.labelContainer]}>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,{flex:1, color: c_grey_darker}]}>{langObj.shippingFee}</Text>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,{color: c_grey_darker}]}>{langObj.priceUnit + " " + this.state.shippingFee}</Text>
                    </View>
                    <View style={[mStyle.labelContainer, {marginTop: 20}]}>
                        <Text style={[globalStyle.textBasicBoldStyle,{fontSize:22, flex:1}]}>{langObj.grandTotal}</Text>
                        <Text style={[globalStyle.textBasicBoldStyle,{fontSize:22}]}>{langObj.priceUnit + " " + this.loadGrandTotalOrderPrice().toFixed(2)}</Text>
                    </View>
            </View>
          );
    }
}

let langObj = getLanguage();
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const mStyle = StyleSheet.create({
    mainContainer: {
        width:screenWidth-40,
        marginStart:20,
        marginTop:10,
        marginBottom:10,
        flexDirection:'column',
        padding:10,
        backgroundColor:"#ffffff",
        alignItems:'center',
    },
    labelContainer: {
        flexDirection:'row',
        alignItems:'center',
        marginEnd:20,
        marginBottom:10
    },
    textLabel: {
        fontSize: 18,
        color:c_text_header,
    },
})