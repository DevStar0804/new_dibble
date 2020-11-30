//
//  PaySubscriptionRequest.h
//  payme
//
//  Created by DSOFT on 5/28/16.
//  Copyright © 2016 DSoft. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface PaySubscriptionRequest : NSObject

@property (nonatomic, assign) NSString *subPaymeId;
@property (nonatomic, assign) NSString *creditCardNumber;
@property (nonatomic, strong) NSString *creditCardExp;
@property (nonatomic, strong) NSString *creditCardCVV;
@property (nonatomic, assign) NSString *buyerName;
@property (nonatomic, assign) NSString *buyerSocialId;
@property (nonatomic, assign) NSString *buyerPhone;
@property (nonatomic, assign) NSString *buyerEmail;

- (id) init;

@end
