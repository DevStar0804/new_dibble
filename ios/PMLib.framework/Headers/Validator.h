//
//  Validator.h
//  payme
//
//  Created by DSOFT on 5/28/16.
//  Copyright © 2016 DSoft. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "PaySaleRequest.h"
#import "PaySubscriptionRequest.h"

@interface Validator : NSObject

-(NSString *) validatorSale :(PaySaleRequest *)paySale;
-(NSString *) validatorSubscription :(PaySubscriptionRequest *)paySubscription;

@end
