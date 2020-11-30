import React,{useCallback,useState} from 'react'
import { View, Text } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler';
import {create} from 'react-native-pixel-perfect'
import {globalStyle} from '../../resource/style/GlobalStyle';

import {getDesignDimension} from '../../resource/LanguageSupport'
let perfectSize = create(getDesignDimension());

export default function ReadMore(props) {
        
         const [textShown, setTextShown] = useState(false); //To show ur remaining Text
        const [lengthMore,setLengthMore] = useState(true); //to show the "Read more & Less Line"
        const toggleNumberOfLines = () => { //To toggle the show text or hide it
            setTextShown(!textShown);
        }
        
        const onTextLayout = useCallback(e =>{
            setLengthMore(e.nativeEvent.lines.length >=4); //to check the text is more than 4 lines or not
            // console.log(e.nativeEvent);
        },[]);
            
          return (
              <View >
                    {
                        textShown? props.text().map((p,index)=><Text
                        style={[globalStyle.technicalDescription]}
                        >{p}</Text>):props.text().map((p,index)=><Text style={[globalStyle.technicalDescription,{display:index<4 ?'flex':'none',opacity:1-index*0.2}]}>{p}</Text>)

                    }
         
                      {
                          lengthMore ?
                          <TouchableOpacity 
                          onPress={toggleNumberOfLines}
                          style={{flex:1,marginBottom:perfectSize(133),marginTop:textShown?perfectSize(100):perfectSize(200),marginStart:perfectSize(300),alignItems:'center',justifyContent:'center',alignContent:'center',height:perfectSize(100),width:perfectSize(291.9),borderWidth:perfectSize(6),borderColor:"#f7ba48"}}>
                          <Text
                          style={{fontSize:perfectSize(50),fontFamily:"OscarFM-Regular",color:"#f7ba48", lineHeight: 21, marginTop: 10 }}>{textShown ? 'קרא פחות' : 'קרא עוד'}</Text>
                          </TouchableOpacity>
                          :null

                      }
              </View>
          )
        }
  

