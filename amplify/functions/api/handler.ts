/// <reference types="node" />
import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({});

const ASSETS_TABLE = process.env.ASSETS_TABLE!;
const MESSAGES_TABLE = process.env.MESSAGES_TABLE!;
const VERSIONS_TABLE = process.env.VERSIONS_TABLE!;
const STORAGE_BUCKET = process.env.STORAGE_BUCKET_NAME!;

const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

export const handler: APIGatewayProxyHandler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const path = event.path;
    const method = event.httpMethod;
    const userId = event.requestContext.authorizer?.claims?.sub || 'anonymous';

    try {
        // POST /assets - Create new asset
        if (method === 'POST' && path === '/assets') {
            const body = JSON.parse(event.body || '{}');
            const assetId = randomUUID();
            const timestamp = new Date().toISOString();

            const asset = {
                assetId,
                userId,
                title: body.title || 'Untitled Asset',
                createdAt: timestamp,
                updatedAt: timestamp,
            };

            await docClient.send(new PutCommand({
                TableName: ASSETS_TABLE,
                Item: asset,
            }));

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify(asset),
            };
        }

        // GET /assets - List user's assets
        if (method === 'GET' && path === '/assets') {
            const result = await docClient.send(new ScanCommand({
                TableName: ASSETS_TABLE,
                FilterExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId,
                },
            }));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result.Items || []),
            };
        }

        // GET /assets/{id} - Get specific asset
        if (method === 'GET' && path.startsWith('/assets/')) {
            const assetId = path.split('/')[2];

            const result = await docClient.send(new GetCommand({
                TableName: ASSETS_TABLE,
                Key: { assetId, userId },
            }));

            if (!result.Item) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Asset not found' }),
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result.Item),
            };
        }

        // POST /upload-url - Get presigned upload URL
        if (method === 'POST' && path === '/upload-url') {
            const body = JSON.parse(event.body || '{}');
            const key = `images/${userId}/${randomUUID()}-${body.filename}`;

            const command = new PutObjectCommand({
                Bucket: STORAGE_BUCKET,
                Key: key,
                ContentType: body.contentType || 'image/jpeg',
            });

            const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ uploadUrl, key }),
            };
        }

        // Default 404
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Not found' }),
        };
    } catch (error) {
        console.error('API Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
