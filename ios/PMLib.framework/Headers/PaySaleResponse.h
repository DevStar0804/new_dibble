//
//  PaySaleResponse.h
//  payme
//
//  Created by DSOFT on 5/28/16.
//  Copyright © 2016 DSoft. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface PaySaleResponse : NSObject

@property (nonatomic, assign) int statusCode;
@property (nonatomic, assign) int statusErrorCode;
@property (nonatomic, assign) int paymeSaleCode;
@property (nonatomic, assign) NSString *paymeStatus;
@property (nonatomic, assign) NSString *paymeSaleId;
@property (nonatomic, strong) NSString *saleCreated;
@property (nonatomic, strong) NSString *paymeSaleStatus;
@property (nonatomic, assign) NSString *saleStatus;
@property (nonatomic, assign) NSString *currency;
@property (nonatomic, assign) NSString *transactionId;
@property (nonatomic, assign) bool isTokenSale;
@property (nonatomic, assign) int price;
@property (nonatomic, assign) NSString *paymeSignature;
@property (nonatomic, assign) NSString *paymeTransactionId;
@property (nonatomic, strong) NSString *paymeTransactionTotal;
@property (nonatomic, strong) NSString *paymeTransactionCardBrand;
@property (nonatomic, assign) NSString *paymeTransactionAuthNumber;
@property (nonatomic, assign) NSString *buyerName;
@property (nonatomic, assign) NSString *buyerEmail;
@property (nonatomic, assign) NSString *buyerPhone;
@property (nonatomic, assign) NSString *buyerCardMask;
@property (nonatomic, strong) NSString *buyerCardExp;
@property (nonatomic, strong) NSString *buyerSocialId;
@property (nonatomic, assign) int installments;
@property (nonatomic, assign) NSString *salePaidDate;
@property (nonatomic, assign) NSString *saleReleaseDate;

- (id) initWithJson:(NSDictionary *)json;

@end
