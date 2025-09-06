import { Amplify } from 'aws-amplify';
import outputs from '../../../amplify_outputs.json';

// Override the API URL if provided via environment variable
const config = {
  ...outputs,
  custom: {
    ...outputs.custom,
    api_url: process.env.NEXT_PUBLIC_API_URL || outputs.custom?.api_url || '',
  },
};

Amplify.configure(config);

export default config;
