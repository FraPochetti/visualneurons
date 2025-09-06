import { Amplify } from 'aws-amplify';
import outputs from '../../../amplify_outputs.json';

// Configure Amplify with whatever the CI generated
Amplify.configure(outputs as unknown as Record<string, unknown>);

// Expose API URL for our custom REST API without assuming `custom` exists in outputs
export const API_URL: string =
  process.env.NEXT_PUBLIC_API_URL ||
  (((outputs as unknown as { custom?: { api_url?: string } }).custom?.api_url) ?? '');

export default outputs as unknown as Record<string, unknown>;
