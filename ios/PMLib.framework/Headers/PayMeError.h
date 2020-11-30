//
//  PayMeError.h
//  payme
//
//  Created by DSOFT on 5/28/16.
//  Copyright © 2016 DSoft. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface PayMeError : NSObject

@property (nonatomic, assign) int statusCode;
@property (nonatomic, assign) NSString *statusAdditionalInfo;
@property (nonatomic, assign) int statusErrorCode;
@property (nonatomic, strong) NSString *statusErrorDetails;

- (id) initWithJson:(NSDictionary *)json;

@end
