//
//  Setting.h
//  payme
//
//  Created by DSOFT on 5/28/16.
//  Copyright © 2016 DSoft. All rights reserved.
//

#import <Foundation/Foundation.h>

#define PRODUCTION_ADDRESS                @"https://ng.paymeservice.com/api%@"
#define STAGING_ADDRESS                @"https://preprod.paymeservice.com/api%@"


@interface Setting : NSObject

+ (id)sharedInstant;
-(NSString *) getBaseUrl;
-(void) setEnvironment:(int) environment key:(NSString *)key;
-(NSString *) getSellerKey;

@end
