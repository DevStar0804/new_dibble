//
//  Contants.h
//  payme
//
//  Created by DSOFT on 5/28/16.
//  Copyright © 2016 DSoft. All rights reserved.
//


#import <Foundation/Foundation.h>
#import <PMLib/PayMe.h>
#define SELLERKEY      @"MPL16043-04252RWD-SEXUYYCU-EZAOMF4J"

#define WEBSERVICE      [PayMe sharedInstant:SELLERKEY stage:STAGING]
#define CONTANTS        [Contants sharedInstant]

@interface Contants : NSObject

+ (id)sharedInstant;
- (void)showHub:(BOOL)isShow;
- (void)showMessage:(NSString *)message;

@end
