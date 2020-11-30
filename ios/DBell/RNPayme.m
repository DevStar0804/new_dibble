//
//  RNPayme.m
//  DBell
//
//  Created by Yadid Levi on 12/11/2020.
//
#import <React/RCTLog.h>
#import "RNPayme.h"
#import "Contants.h"
#import <PMLib/Setting.h>
#import <PMLib/CaptureBuyerRequest.h>
#import <PMLib/CaptureBuyerResponse.h>
#import <PMLib/PayMeError.h>


@implementation RNPayme

// To export a module named CalendarManager
RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(stringFunc:(NSString *)name)
{
  RCTLogInfo(@"Pretending to create an event %@ ", name);
}

RCT_EXPORT_METHOD(requestPaymentToken: (NSDictionary *)details errorCallback: (RCTResponseSenderBlock)errorCallback successCallback: (RCTResponseSenderBlock)successCallback)
{
  BOOL buyerIsPermanent = YES;

  CaptureBuyerRequest *request = [[CaptureBuyerRequest alloc] init];
  request.sellerPaymeId = @"MPL16043-04252RWD-SEXUYYCU-EZAOMF4J";
  request.creditCardNumber = details[@"card_num"];
  request.creditCardExp = [NSString stringWithFormat:@"%@%@", details[@"valid_thru_month"], details[@"valid_thru_year"]];
   
  request.creditCardCvv = details[@"cvv"];
  request.buyerName = details[@"name"];
  request.buyerSocialId = @"014555555";
  request.buyerPhone = @"12345678";
  request.buyerEmail = details[@"notify_email"];
  request.buyerIsPermanent = &buyerIsPermanent;
  
  [WEBSERVICE captureBuyer:request success:^(CaptureBuyerResponse *responseObject) {
      if(responseObject != nil)
      {
          //do something
        successCallback(@[[responseObject buyerKey]]);
      }
  } failure:^(PayMeError *error) {
      //do something
      if(error != nil)
      {
        errorCallback(@[error.statusErrorDetails]);
      }
  }];
}
@end

