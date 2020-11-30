import {StyleSheet, I18nManager} from 'react-native';
import {bg_shadow_color, c_main_orange, c_text_grey, isForceRTL} from '../BaseValue';
import {create} from 'react-native-pixel-perfect'
import {getDesignDimension} from '../LanguageSupport'
let perfectSize = create(getDesignDimension());

// notice: not set font weight to Oscar FM, it will make font broken in android.
export const globalStyle = StyleSheet.create({
  header: {
    shadowColor: bg_shadow_color,
    shadowOffset: {
      width: 0,
      height: 30,
    },
    shadowOpacity: 0.58,
    shadowRadius: 30,
    elevation: 7,
  },
  technicalDescription:{
fontFamily:'AlmoniDLAAA',
fontSize:perfectSize(40),
color:"#46474b",
letterSpacing:perfectSize(-1.2)
  },
  bgShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }, 
  textBasicStyle: {
    // fontFamily: 'HelveticaNeue',
    fontFamily: 'AlmoniDLAAA',
    writingDirection: I18nManager.isRTL || isForceRTL ? 'rtl' : 'ltr',
  },
  textBasicBoldStyle: {
    // fontFamily: 'HelveticaNeue-Bold',
    fontFamily: 'OscarFM-Regular',
    writingDirection: I18nManager.isRTL || isForceRTL ? 'rtl' : 'ltr',
  },
  textLabelDesc:{
     fontFamily: 'OscarFM-Regular',
    fontSize:perfectSize(50),
    textAlign:'right',
    letterSpacing:perfectSize(-1),
    color:"#8c8d8f"
  },
  shadow_box:{
    shadowColor: "#000",
shadowOffset: {
	width: 0,
	height: 2,
},
shadowOpacity: 0.32,
shadowRadius: perfectSize(15),
elevation: 1,
  },
  textBoldHeaderNotHStyle: {
    fontFamily: 'HelveticaNeue-Bold',
    // fontFamily: 'OscarFM-Regular',
    writingDirection: I18nManager.isRTL || isForceRTL ? 'rtl' : 'ltr',
  },
  textHeader: {
    fontFamily: 'Oscar FM',
    fontSize: 13,
    writingDirection: I18nManager.isRTL || isForceRTL ? 'rtl' : 'ltr',
  },
  textSearch: {
    fontFamily: 'AlmoniDLAAA',
    fontSize: 14,
    writingDirection: I18nManager.isRTL || isForceRTL ? 'rtl' : 'ltr',
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  textItemName: {
    fontFamily: 'OscarFM-Regular',
    fontSize: 11,
    margin: 5,
    writingDirection: I18nManager.isRTL || isForceRTL ? 'rtl' : 'ltr',
  },
  textItemDescription: {
    fontFamily: 'AlmoniDLAAA',
    fontSize: 11,
    margin: 5,
    writingDirection: I18nManager.isRTL || isForceRTL ? 'rtl' : 'ltr',
  },
  volume_item:{

    fontFamily:'AlmoniDLAAA',
    color:'yellow',
    fontWeight:'bold'    
  },
  textProductItemName: {
    fontFamily: 'AlmoniDLAAA-Bold',
    fontSize: 15,
    // fontWeight: 'bold',
    writingDirection: I18nManager.isRTL || isForceRTL ? 'rtl' : 'ltr',
  },
  insert_color_code:{fontWeight:'normal',color:"#8c8d8f",fontFamily:'AlmoniDLAAA',fontSize:perfectSize(45),letterSpacing:perfectSize(-1.35),marginStart:perfectSize(59.5)},
  price:{
    fontSize:perfectSize(40) ,color:"#d1d2d4",fontFamily:'AlmoniDLAAA' ,letterSpacing:perfectSize(-3),marginTop:8,fontWeight:'bold'
  },
  sale_price:{
    fontSize:perfectSize(60),
    marginStart:perfectSize(24),
    color:"#d1d2d4",
    fontFamily:'AlmoniDLAAA',
    letterSpacing:perfectSize(-3),
    textDecorationLine: 'line-through',
    paddingBottom:5,
   },
  textProductItemPrice: {
    fontFamily: 'OscarFM-Regular',
    fontSize: 18,
    writingDirection: I18nManager.isRTL || isForceRTL ? 'rtl' : 'ltr',
  },
  horizontalLine: {
    height: 1,
    backgroundColor: c_main_orange,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    marginStart: 20,
    marginEnd: 20,
    marginTop: 10,
  },
  textSection: {
    fontSize: 22,
    color: c_text_grey,
  },
  sectionTitleCenterContainer: {
    flexDirection: 'row',
    marginTop: 20,
    borderBottomColor: c_main_orange,
    borderBottomWidth: 5,
    paddingBottom: 5,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSectionCenter: {
    fontFamily: 'OscarFM-Regular',
    fontSize: 22,
    color: c_text_grey,
    textAlign: 'center',
  },
  buttonBlack: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#000000',
    borderRadius: 10,
    marginStart: 20,
    marginEnd: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  buttonBlackLabel: {
    flex:1,
    textAlign:"center",
    color:"#ffffff",
    fontFamily: 'OscarFM-Regular',
    fontSize: 22,
  },
  htmlFixAlign: {
    textAlign: I18nManager.isRTL || isForceRTL ? 'left' : 'right',
  },
  sectionContainer: {
    alignSelf: 'stretch',
    marginStart: 20,
    marginEnd: 20,
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    paddingTop: 20,
    paddingBottom: 20,
    paddingStart: 10,
    paddingEnd: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
