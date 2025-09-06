import { defineAuth } from "@aws-amplify/backend";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: 'CODE',
      verificationEmailSubject: 'Verify your VisualNeurons account',
      verificationEmailBody: (createCode) =>
        `Your verification code is ${createCode()}. Enter this code to verify your account.`,
    },
  },
  userAttributes: {
    email: {
      required: true,
      mutable: true,
    },
  },
});
