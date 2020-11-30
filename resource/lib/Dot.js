import React,{useState}  from 'react'
import { View, Text } from 'react-native'
import {create} from 'react-native-pixel-perfect'
import {getDesignDimension} from '../LanguageSupport'
let prefectSize=create(getDesignDimension())
export default function Dot(props) {
     return (
        <View style={{
            width:props.visible?prefectSize(30):prefectSize(24),
            height: props.visible?prefectSize(30):prefectSize(24),
            borderRadius: prefectSize(15),
            borderWidth:prefectSize(2),
            marginEnd:prefectSize(2),
            borderStyle: "solid",
            borderColor: props.visible?"#f7ba48":"#ffffff",
            backgroundColor:props.visible? "#46474b":"#707070",
          }}>
    </View>
    )
}
