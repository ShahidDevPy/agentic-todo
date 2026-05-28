/** Auth flows: sign-in helpers, password reset, account security. */
export const authCopy = {
  forgotPassword: {
    title: "Reset your password",
    description:
      "Enter the email for your account. We’ll send a link to set a new password.",
    emailLabel: "Email",
    submit: "Send reset link",
    sending: "Sending…",
    success:
      "If an account exists for that email, you’ll receive a reset link shortly. Check your inbox and spam folder.",
    backToSignIn: "Back to sign in",
    googleHint:
      "Signed up with Google? Use the same email here to set a password, or recover your Google account at Google.",
  },

  resetPassword: {
    title: "Choose a new password",
    description: "Enter a new password for your account.",
    newPasswordLabel: "New password",
    confirmPasswordLabel: "Confirm password",
    submit: "Update password",
    saving: "Saving…",
    success: "Password updated. Redirecting…",
    noSession:
      "This reset link is invalid or has expired. Request a new link from the sign-in page.",
    requestAgain: "Request a new reset link",
    mismatch: "Passwords do not match.",
    tooShort: "Password must be at least 6 characters.",
  },

  login: {
    forgotPassword: "Forgot password?",
  },
} as const;
