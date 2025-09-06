import { defineFunction } from '@aws-amplify/backend';

export const apiFunction = defineFunction({
    name: 'api-handler',
    entry: './handler.ts',
    runtime: 20,
    timeoutSeconds: 30,
    memoryMB: 512,
    environment: {
        // Will add provider API keys here later
    },
});
