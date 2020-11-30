package com.dibble.client;

import com.facebook.react.bridge.Callback;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.JSApplicationCausedNativeException;


import java.util.Map;
import java.util.HashMap;

public class RNPayme extends ReactContextBaseJavaModule {
  private static ReactApplicationContext reactContext;

  RNPayme(ReactApplicationContext context) {
    super(context);
    reactContext = context;
  }

  @Override
  public String getName() {
    return "RNPayme";
  }

  @ReactMethod
  public void requestPaymentToken(ReadableMap datails,Callback errorCallback,Callback successCallback) {

    successCallback.invoke(datails.getString("card_num"));


    // CaptureBuyerRequest request = new CaptureBuyerRequest();
    // //Name - Required
    // request.setBuyerName(edtBuyerName.getText().toString());
    // //Phone - Required
    // request.setBuyerPhone(edtPhone.getText().toString());
    // //Email - Required
    // request.setBuyerEmail(edtEmail.getText().toString());
    // //ID - Required Only for israeli cards
    // request.setBuyerSocialID(edtSocialId.getText().toString());
    // //Permanent
    // request.setBuyerIsPermanent(editIsPermanent.isChecked());

    // //Credit Card Number - Required
    // request.setCreditCardNumber(edtCreditCardNumber.getText().toString());
    // //CreditCard CVV - Required
    // request.setCreditCardCVV(edtCreditCardCvv.getText().toString());
    // //Credit Card Expiration - Required
    // request.setCreditCardExp(edtCreditCardExp.getText().toString());

    // if (!isValid(request)) {
    //   //Stop execution if request is not valid
    //   return;
    // }

    // PayMe.captureBuyer(request, new PayMe.TransactionListener<CaptureBuyerResponse>() {
    //   @Override public void onSuccess(CaptureBuyerResponse response) {
    //     successCallback.invoke(response.buyerKey);
    //   }

    //   @Override public void onFailed(Exception exception, PayMeError error) {
    //     errorCallback.invoke(e.getMessage());
    //   }
    // });
  }
}