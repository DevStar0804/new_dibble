//
//  CaptureBuyerRequest.h
//  PMLib
//
//  Created by DSOFT on 6/24/16.
//  Copyright © 2016 DSoft. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface CaptureBuyerRequest : NSObject

@property (nonatomic, assign) NSString *sellerPaymeId;
@property (nonatomic, assign) NSString *creditCardNumber;
@property (nonatomic, strong) NSString *creditCardExp;
@property (nonatomic, strong) NSString *creditCardCvv;
@property (nonatomic, assign) NSString *buyerName;
@property (nonatomic, assign) NSString *buyerSocialId;
@property (nonatomic, assign) NSString *buyerEmail;
@property (nonatomic, assign) NSString *buyerPhone;
@property (nonatomic, assign) BOOL *buyerIsPermanent;

- (id) init;

@end
