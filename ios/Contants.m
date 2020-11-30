//
//  Contants.m
//  payme
//
//  Created by DSOFT on 5/28/16.
//  Copyright © 2016 DSoft. All rights reserved.
//

#import "Contants.h"
#import <UIKit/UIKit.h>
//#import "MBProgressHUD.h"
#import "AppDelegate.h"

static Contants *_contants;

@implementation Contants


+ (id)sharedInstant{
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        _contants = [[Contants alloc]init];
    });
    return _contants;
}

- (void)showHub:(BOOL)isShow{
//    if (isShow) {
//        [MBProgressHUD showHUDAddedTo:APPDELEGATE.window animated:YES];
//    }else{
//        [MBProgressHUD hideAllHUDsForView:APPDELEGATE.window animated:YES];
//    }
}

- (void)showMessage:(NSString *)message{
    
    
    // Executing the method in the main thread, since its involving the UI updates.
        dispatch_async(dispatch_get_main_queue(), ^{
            UIAlertController* alert = [UIAlertController alertControllerWithTitle:@"" message:message preferredStyle:UIAlertControllerStyleAlert];

        [alert addAction:[UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleDefault
                                               handler:^(UIAlertAction * action) {}]];
//        if (optionalPrompt) {
//            [alert addAction:[UIAlertAction actionWithTitle:optionalPrompt style:UIAlertActionStyleCancel handler:optionalHandler]];
//        }
        [[[UIApplication sharedApplication] keyWindow].rootViewController presentViewController:alert animated:true completion:nil];
    });
//
//
//    UIWindow* window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
//    window.rootViewController = [UIViewController new];
//    window.windowLevel = UIWindowLevelAlert + 1;
//
//    UIAlertController* alert = [UIAlertController alertControllerWithTitle:@""
//                               message:message
//                               preferredStyle:UIAlertControllerStyleAlert];
//
//    UIAlertAction* defaultAction = [UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleDefault
//                                   handler:^(UIAlertAction * action) {}];
//
//    [alert addAction:defaultAction];
//
//    [window.rootViewController presentViewController:alert animated:YES completion:nil];
}

@end

