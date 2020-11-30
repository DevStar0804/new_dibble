//
//  PayMe.h
//  payme
//
//  Created by DSOFT on 5/27/16.
//  Copyright © 2016 DSoft. All rights reserved.
//

#define STAGING 1
#define PRODUCTION 2

#define SETTING        [Setting sharedInstant]

#import <Foundation/Foundation.h>
#import "PaySaleRequest.h"
#import "PaySubscriptionRequest.h"
#import "PaySaleResponse.h"
#import "PaySubscriptionResponse.h"
#import "PayMeError.h"
#import "Setting.h"
#import "CaptureBuyerRequest.h"
#import "CaptureBuyerResponse.h"

@interface PayMe : NSObject

+ (id)sharedInstant:(NSString *)sellerkey stage:(int)stage;

@property (strong, nonatomic) NSURLSession *markerSession;

-(void) paySale:(PaySaleRequest *)request success:(void (^)(PaySaleResponse *responseObject))success failure:(void (^)(PayMeError *error))failure;

-(void) paySubscription:(PaySubscriptionRequest *)request success:(void (^)(PaySubscriptionResponse *responseObject))success failure:(void (^)(PayMeError *error))failure;

-(void) captureBuyer:(CaptureBuyerRequest *)request success:(void (^)(CaptureBuyerResponse *responseObject))success failure:(void (^)(PayMeError *error))failure;

@end
