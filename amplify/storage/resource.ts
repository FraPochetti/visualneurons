import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
    name: 'visualneurons-images',
    access: (allow) => ({
        'images/*': [
            allow.authenticated.to(['read', 'write', 'delete']),
        ],
        'thumbnails/*': [
            allow.authenticated.to(['read']),
        ],
    }),
});
