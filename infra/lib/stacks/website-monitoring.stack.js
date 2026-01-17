"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteMonitoringStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const website_checker_lambda_construct_1 = require("../constructs/website-checker-lambda.construct");
class WebsiteMonitoringStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Create the website checker Lambda
        const websiteChecker = new website_checker_lambda_construct_1.WebsiteCheckerLambda(this, 'WebsiteChecker', {
            timeout: cdk.Duration.seconds(30),
            memorySize: 256,
            environment: {
            // Add any environment variables here
            },
        });
        // Output the Lambda function name
        new cdk.CfnOutput(this, 'WebsiteCheckerFunctionName', {
            value: websiteChecker.function.functionName,
            description: 'Website Checker Lambda Function Name',
        });
        // Output the Lambda function ARN
        new cdk.CfnOutput(this, 'WebsiteCheckerFunctionArn', {
            value: websiteChecker.function.functionArn,
            description: 'Website Checker Lambda Function ARN',
        });
    }
}
exports.WebsiteMonitoringStack = WebsiteMonitoringStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vic2l0ZS1tb25pdG9yaW5nLnN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsid2Vic2l0ZS1tb25pdG9yaW5nLnN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFtQztBQUVuQyxxR0FBc0Y7QUFFdEYsTUFBYSxzQkFBdUIsU0FBUSxHQUFHLENBQUMsS0FBSztJQUNuRCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLG9DQUFvQztRQUNwQyxNQUFNLGNBQWMsR0FBRyxJQUFJLHVEQUFvQixDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUN0RSxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ2pDLFVBQVUsRUFBRSxHQUFHO1lBQ2YsV0FBVyxFQUFFO1lBQ1gscUNBQXFDO2FBQ3RDO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsa0NBQWtDO1FBQ2xDLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsNEJBQTRCLEVBQUU7WUFDcEQsS0FBSyxFQUFFLGNBQWMsQ0FBQyxRQUFRLENBQUMsWUFBWTtZQUMzQyxXQUFXLEVBQUUsc0NBQXNDO1NBQ3BELENBQUMsQ0FBQztRQUVILGlDQUFpQztRQUNqQyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLDJCQUEyQixFQUFFO1lBQ25ELEtBQUssRUFBRSxjQUFjLENBQUMsUUFBUSxDQUFDLFdBQVc7WUFDMUMsV0FBVyxFQUFFLHFDQUFxQztTQUNuRCxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUF6QkQsd0RBeUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcclxuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XHJcbmltcG9ydCB7IFdlYnNpdGVDaGVja2VyTGFtYmRhIH0gZnJvbSAnLi4vY29uc3RydWN0cy93ZWJzaXRlLWNoZWNrZXItbGFtYmRhLmNvbnN0cnVjdCc7XHJcblxyXG5leHBvcnQgY2xhc3MgV2Vic2l0ZU1vbml0b3JpbmdTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XHJcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xyXG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSB3ZWJzaXRlIGNoZWNrZXIgTGFtYmRhXHJcbiAgICBjb25zdCB3ZWJzaXRlQ2hlY2tlciA9IG5ldyBXZWJzaXRlQ2hlY2tlckxhbWJkYSh0aGlzLCAnV2Vic2l0ZUNoZWNrZXInLCB7XHJcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcclxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxyXG4gICAgICBlbnZpcm9ubWVudDoge1xyXG4gICAgICAgIC8vIEFkZCBhbnkgZW52aXJvbm1lbnQgdmFyaWFibGVzIGhlcmVcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE91dHB1dCB0aGUgTGFtYmRhIGZ1bmN0aW9uIG5hbWVcclxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdXZWJzaXRlQ2hlY2tlckZ1bmN0aW9uTmFtZScsIHtcclxuICAgICAgdmFsdWU6IHdlYnNpdGVDaGVja2VyLmZ1bmN0aW9uLmZ1bmN0aW9uTmFtZSxcclxuICAgICAgZGVzY3JpcHRpb246ICdXZWJzaXRlIENoZWNrZXIgTGFtYmRhIEZ1bmN0aW9uIE5hbWUnLFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gT3V0cHV0IHRoZSBMYW1iZGEgZnVuY3Rpb24gQVJOXHJcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnV2Vic2l0ZUNoZWNrZXJGdW5jdGlvbkFybicsIHtcclxuICAgICAgdmFsdWU6IHdlYnNpdGVDaGVja2VyLmZ1bmN0aW9uLmZ1bmN0aW9uQXJuLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ1dlYnNpdGUgQ2hlY2tlciBMYW1iZGEgRnVuY3Rpb24gQVJOJyxcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG4iXX0=