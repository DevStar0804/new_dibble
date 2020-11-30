//
//  CaptureBuyerResponse.h
//  PMLib
//
//  Created by DSOFT on 6/24/16.
//  Copyright © 2016 DSoft. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface CaptureBuyerResponse : NSObject

@property (nonatomic, assign) int statusCode;
@property (nonatomic, assign) NSString *buyerKey;
@property (nonatomic, assign) NSString *buyerName;
@property (nonatomic, strong) NSString *buyerEmail;
@property (nonatomic, strong) NSString *buyerPhone;
@property (nonatomic, assign) NSString *buyerCardMask;
@property (nonatomic, assign) NSString *buyerCardExp;
@property (nonatomic, assign) NSString *buyerSocialId;

- (id) initWithJson:(NSDictionary *)json;

@end
