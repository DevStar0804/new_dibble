//
//  PaySaleRequest.h
//  payme
//
//  Created by DSOFT on 5/28/16.
//  Copyright © 2016 DSoft. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface PaySaleRequest : NSObject

@property (nonatomic, assign) NSString *paymeSaleId;
@property (nonatomic, assign) NSString *creditCardNumber;
@property (nonatomic, strong) NSString *creditCardCVV;
@property (nonatomic, strong) NSString *creditCardExp;
@property (nonatomic, strong) NSString *installments;
@property (nonatomic, assign) NSString *buyerSocialID;
@property (nonatomic, assign) NSString *buyerEmail;
@property (nonatomic, assign) NSString *buyerName;

- (id) initWithJson:(NSDictionary *)json;
- (id) init;

@end
