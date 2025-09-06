import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { storage } from './storage/resource.js';
import { apiFunction } from './functions/api/resource.js';
import { Stack } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
  auth,
  storage,
  apiFunction,
});

// Place API and related infra in the same stack as the function to avoid cycles
const backendStack = Stack.of(backend.apiFunction.resources.lambda);

// Create DynamoDB tables
const assetsTable = new dynamodb.Table(backendStack, 'AssetsTable', {
  partitionKey: { name: 'assetId', type: dynamodb.AttributeType.STRING },
  sortKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
});

const messagesTable = new dynamodb.Table(backendStack, 'MessagesTable', {
  partitionKey: { name: 'assetId', type: dynamodb.AttributeType.STRING },
  sortKey: { name: 'messageId', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
});

const versionsTable = new dynamodb.Table(backendStack, 'VersionsTable', {
  partitionKey: { name: 'assetId', type: dynamodb.AttributeType.STRING },
  sortKey: { name: 'versionId', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
});

// Grant Lambda permissions to access tables
assetsTable.grantReadWriteData(backend.apiFunction.resources.lambda);
messagesTable.grantReadWriteData(backend.apiFunction.resources.lambda);
versionsTable.grantReadWriteData(backend.apiFunction.resources.lambda);

// Avoid circular dependency (storage <-> auth) by attaching S3 access only to the
// Lambda role (do not modify the bucket policy from this stack)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lambdaRole: any = (backend.apiFunction.resources.lambda as any).role;
lambdaRole.addToPrincipalPolicy(new iam.PolicyStatement({
  actions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
  resources: [
    `${backend.storage.resources.bucket.bucketArn}/*`,
  ],
}));
lambdaRole.addToPrincipalPolicy(new iam.PolicyStatement({
  actions: ['s3:ListBucket'],
  resources: [backend.storage.resources.bucket.bucketArn],
}));

// Set environment variables for Lambda (cast to Function to access addEnvironment)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lambdaFn: any = backend.apiFunction.resources.lambda;
lambdaFn.addEnvironment('ASSETS_TABLE', assetsTable.tableName);
lambdaFn.addEnvironment('MESSAGES_TABLE', messagesTable.tableName);
lambdaFn.addEnvironment('VERSIONS_TABLE', versionsTable.tableName);
lambdaFn.addEnvironment('STORAGE_BUCKET_NAME', backend.storage.resources.bucket.bucketName);

// Create REST API
const api = new apigateway.RestApi(backendStack, 'VisualNeuronsAPI', {
  restApiName: 'visualneurons-api',
  defaultCorsPreflightOptions: {
    allowOrigins: apigateway.Cors.ALL_ORIGINS,
    allowMethods: apigateway.Cors.ALL_METHODS,
    allowHeaders: ['Content-Type', 'Authorization'],
  },
});

// Create Lambda integration
const lambdaIntegration = new apigateway.LambdaIntegration(backend.apiFunction.resources.lambda);

// Create Cognito authorizer
const authorizer = new apigateway.CognitoUserPoolsAuthorizer(backendStack, 'Authorizer', {
  cognitoUserPools: [backend.auth.resources.userPool],
});

// Define API routes
const assets = api.root.addResource('assets');
assets.addMethod('GET', lambdaIntegration, { authorizer });
assets.addMethod('POST', lambdaIntegration, { authorizer });

const asset = assets.addResource('{id}');
asset.addMethod('GET', lambdaIntegration, { authorizer });

const messages = asset.addResource('messages');
messages.addMethod('GET', lambdaIntegration, { authorizer });
messages.addMethod('POST', lambdaIntegration, { authorizer });

const uploadUrl = api.root.addResource('upload-url');
uploadUrl.addMethod('POST', lambdaIntegration, { authorizer });

// Export API URL
backendStack.exportValue(api.url, {
  name: 'api-url',
});
