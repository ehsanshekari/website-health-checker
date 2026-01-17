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
exports.InfraStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const aws_lambda_nodejs_1 = require("aws-cdk-lib/aws-lambda-nodejs");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
const path = __importStar(require("path"));
class InfraStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Lambda function built from the service handler
        // Points to service/src/handlers/website-checker.ts and uses the exported `handler`
        new aws_lambda_nodejs_1.NodejsFunction(this, 'WebsiteCheckerFunction', {
            entry: path.join(__dirname, '../../service/src/handlers/website-checker.ts'),
            handler: 'handler',
            runtime: aws_lambda_1.Runtime.NODEJS_18_X,
            bundling: {
                // Keep aws-sdk out (provided by Lambda), everything else will be bundled
                externalModules: ['aws-sdk'],
                forceDockerBundling: false,
            },
            environment: {
            // Add any environment variables your handler needs here
            },
        });
    }
}
exports.InfraStack = InfraStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5mcmEtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmZyYS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFFbkMscUVBQStEO0FBQy9ELHVEQUFpRDtBQUNqRCwyQ0FBNkI7QUFFN0IsTUFBYSxVQUFXLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDdkMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixpREFBaUQ7UUFDakQsb0ZBQW9GO1FBQ3BGLElBQUksa0NBQWMsQ0FBQyxJQUFJLEVBQUUsd0JBQXdCLEVBQUU7WUFDakQsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLCtDQUErQyxDQUFDO1lBQzVFLE9BQU8sRUFBRSxTQUFTO1lBQ2xCLE9BQU8sRUFBRSxvQkFBTyxDQUFDLFdBQVc7WUFDNUIsUUFBUSxFQUFFO2dCQUNSLHlFQUF5RTtnQkFDekUsZUFBZSxFQUFFLENBQUMsU0FBUyxDQUFDO2dCQUM1QixtQkFBbUIsRUFBRSxLQUFLO2FBQzNCO1lBQ0QsV0FBVyxFQUFFO1lBQ1gsd0RBQXdEO2FBQ3pEO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBcEJELGdDQW9CQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCB7IE5vZGVqc0Z1bmN0aW9uIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYS1ub2RlanMnO1xuaW1wb3J0IHsgUnVudGltZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuZXhwb3J0IGNsYXNzIEluZnJhU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvLyBMYW1iZGEgZnVuY3Rpb24gYnVpbHQgZnJvbSB0aGUgc2VydmljZSBoYW5kbGVyXG4gICAgLy8gUG9pbnRzIHRvIHNlcnZpY2Uvc3JjL2hhbmRsZXJzL3dlYnNpdGUtY2hlY2tlci50cyBhbmQgdXNlcyB0aGUgZXhwb3J0ZWQgYGhhbmRsZXJgXG4gICAgbmV3IE5vZGVqc0Z1bmN0aW9uKHRoaXMsICdXZWJzaXRlQ2hlY2tlckZ1bmN0aW9uJywge1xuICAgICAgZW50cnk6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi8uLi9zZXJ2aWNlL3NyYy9oYW5kbGVycy93ZWJzaXRlLWNoZWNrZXIudHMnKSxcbiAgICAgIGhhbmRsZXI6ICdoYW5kbGVyJyxcbiAgICAgIHJ1bnRpbWU6IFJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBidW5kbGluZzoge1xuICAgICAgICAvLyBLZWVwIGF3cy1zZGsgb3V0IChwcm92aWRlZCBieSBMYW1iZGEpLCBldmVyeXRoaW5nIGVsc2Ugd2lsbCBiZSBidW5kbGVkXG4gICAgICAgIGV4dGVybmFsTW9kdWxlczogWydhd3Mtc2RrJ10sXG4gICAgICAgIGZvcmNlRG9ja2VyQnVuZGxpbmc6IGZhbHNlLFxuICAgICAgfSxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIC8vIEFkZCBhbnkgZW52aXJvbm1lbnQgdmFyaWFibGVzIHlvdXIgaGFuZGxlciBuZWVkcyBoZXJlXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG59XG4iXX0=