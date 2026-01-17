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
exports.WebsiteCheckerLambda = void 0;
const constructs_1 = require("constructs");
const aws_lambda_nodejs_1 = require("aws-cdk-lib/aws-lambda-nodejs");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const path = __importStar(require("path"));
class WebsiteCheckerLambda extends constructs_1.Construct {
    function;
    constructor(scope, id, props) {
        super(scope, id);
        this.function = new aws_lambda_nodejs_1.NodejsFunction(this, 'Function', {
            entry: path.join(__dirname, '../../../service/src/handlers/website-checker.ts'),
            handler: 'handler',
            runtime: aws_lambda_1.Runtime.NODEJS_18_X,
            timeout: props?.timeout ?? aws_cdk_lib_1.Duration.seconds(30),
            memorySize: props?.memorySize ?? 256,
            bundling: {
                externalModules: ['aws-sdk'],
                forceDockerBundling: false,
            },
            environment: props?.environment ?? {},
        });
    }
}
exports.WebsiteCheckerLambda = WebsiteCheckerLambda;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vic2l0ZS1jaGVja2VyLWxhbWJkYS5jb25zdHJ1Y3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3ZWJzaXRlLWNoZWNrZXItbGFtYmRhLmNvbnN0cnVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwyQ0FBdUM7QUFDdkMscUVBQStEO0FBQy9ELHVEQUFpRDtBQUNqRCw2Q0FBdUM7QUFDdkMsMkNBQTZCO0FBUTdCLE1BQWEsb0JBQXFCLFNBQVEsc0JBQVM7SUFDakMsUUFBUSxDQUFpQjtJQUV6QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQWlDO1FBQ3pFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFakIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLGtDQUFjLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUNuRCxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsa0RBQWtELENBQUM7WUFDL0UsT0FBTyxFQUFFLFNBQVM7WUFDbEIsT0FBTyxFQUFFLG9CQUFPLENBQUMsV0FBVztZQUM1QixPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sSUFBSSxzQkFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDL0MsVUFBVSxFQUFFLEtBQUssRUFBRSxVQUFVLElBQUksR0FBRztZQUNwQyxRQUFRLEVBQUU7Z0JBQ1IsZUFBZSxFQUFFLENBQUMsU0FBUyxDQUFDO2dCQUM1QixtQkFBbUIsRUFBRSxLQUFLO2FBQzNCO1lBQ0QsV0FBVyxFQUFFLEtBQUssRUFBRSxXQUFXLElBQUksRUFBRTtTQUN0QyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFuQkQsb0RBbUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XHJcbmltcG9ydCB7IE5vZGVqc0Z1bmN0aW9uIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYS1ub2RlanMnO1xyXG5pbXBvcnQgeyBSdW50aW1lIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XHJcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSAnYXdzLWNkay1saWInO1xyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBXZWJzaXRlQ2hlY2tlckxhbWJkYVByb3BzIHtcclxuICByZWFkb25seSB0aW1lb3V0PzogRHVyYXRpb247XHJcbiAgcmVhZG9ubHkgbWVtb3J5U2l6ZT86IG51bWJlcjtcclxuICByZWFkb25seSBlbnZpcm9ubWVudD86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBXZWJzaXRlQ2hlY2tlckxhbWJkYSBleHRlbmRzIENvbnN0cnVjdCB7XHJcbiAgcHVibGljIHJlYWRvbmx5IGZ1bmN0aW9uOiBOb2RlanNGdW5jdGlvbjtcclxuXHJcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBXZWJzaXRlQ2hlY2tlckxhbWJkYVByb3BzKSB7XHJcbiAgICBzdXBlcihzY29wZSwgaWQpO1xyXG5cclxuICAgIHRoaXMuZnVuY3Rpb24gPSBuZXcgTm9kZWpzRnVuY3Rpb24odGhpcywgJ0Z1bmN0aW9uJywge1xyXG4gICAgICBlbnRyeTogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uL3NlcnZpY2Uvc3JjL2hhbmRsZXJzL3dlYnNpdGUtY2hlY2tlci50cycpLFxyXG4gICAgICBoYW5kbGVyOiAnaGFuZGxlcicsXHJcbiAgICAgIHJ1bnRpbWU6IFJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIHRpbWVvdXQ6IHByb3BzPy50aW1lb3V0ID8/IER1cmF0aW9uLnNlY29uZHMoMzApLFxyXG4gICAgICBtZW1vcnlTaXplOiBwcm9wcz8ubWVtb3J5U2l6ZSA/PyAyNTYsXHJcbiAgICAgIGJ1bmRsaW5nOiB7XHJcbiAgICAgICAgZXh0ZXJuYWxNb2R1bGVzOiBbJ2F3cy1zZGsnXSxcclxuICAgICAgICBmb3JjZURvY2tlckJ1bmRsaW5nOiBmYWxzZSxcclxuICAgICAgfSxcclxuICAgICAgZW52aXJvbm1lbnQ6IHByb3BzPy5lbnZpcm9ubWVudCA/PyB7fSxcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG4iXX0=