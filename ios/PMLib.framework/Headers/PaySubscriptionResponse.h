//
//  PaySubscriptionResponse.h
//  payme
//
//  Created by DSOFT on 5/28/16.
//  Copyright © 2016 DSoft. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface PaySubscriptionResponse : NSObject

@property (nonatomic, assign) int statusCode;
@property (nonatomic, assign) int statusErrorCode;
@property (nonatomic, assign) int subPaymeCode;
@property (nonatomic, assign) NSString *paymeStatus;
@property (nonatomic, assign) NSString *sellerPaymeId;
@property (nonatomic, strong) NSString *sellerId;
@property (nonatomic, strong) NSString *subPaymeId;
@property (nonatomic, assign) NSString *subCreated;
@property (nonatomic, assign) NSString *subStartDate;
@property (nonatomic, assign) NSString *subPrevDate;
@property (nonatomic, strong) NSString *subNextDate;
@property (nonatomic, strong) NSString *subCurrency;
@property (nonatomic, assign) NSString *subDescription;

@property (nonatomic, assign) int subStatus;
@property (nonatomic, assign) int subIterationType;
@property (nonatomic, assign) int subPrice;
@property (nonatomic, assign) int subIterations;
@property (nonatomic, assign) int subIterationsCompleted;
@property (nonatomic, assign) int subIterationsLeft;

@property (nonatomic, assign) bool subPaid;

@property (nonatomic, assign) NSString *subErrorText;

@property (nonatomic, assign) NSString *subPaymentDate;
@property (nonatomic, assign) NSString *buyerCardMask;
@property (nonatomic, strong) NSString *buyerName;
@property (nonatomic, strong) NSString *buyerEmail;
@property (nonatomic, assign) NSString *buyerPhone;
@property (nonatomic, assign) NSString *buyerSocialId;


- (id) initWithJson:(NSDictionary *)json;

@end
