/** Auth flows: sign-in helpers, password reset, account security. */
export const authCopy = {
  login: {
    signInTab: "Sign in",
    signUpTab: "Create account",
    signInDescription:
      "Tasks, priorities, and your daily brief — all in one place.",
    signUpDescription: "Create your workspace. We’ll greet you by first name.",
    forgotPassword: "Forgot password?",
    continueWithGoogle: "Continue with Google",
    redirectingGoogle: "Redirecting…",
    orEmail: "or email",
    firstNameLabel: "First name",
    lastNameLabel: "Last name",
    emailLabel: "Email",
    passwordLabel: "Password",
    passwordHint: "At least 6 characters",
    signInSubmit: "Sign in",
    signUpSubmit: "Sign up",
    pleaseWait: "Please wait…",
    signUpTrust: "Free personal workspace. No credit card.",
    authCallbackError: "Could not complete sign-in. Try again.",
    supabaseNotConfigured: "Supabase is not configured.",
    enterEmailPassword: "Enter email and password.",
    enterName: "Enter your first and last name.",
    emailAlreadyRegistered:
      "This email is already registered. Sign in instead, or use Google.",
    checkEmailConfirm:
      "Check your email to confirm your account, then sign in.",
    unavailableTitle: "Sign in unavailable",
    redirectHintTasks: "You’ll return to My tasks after sign in.",
    redirectHintBrief: "You’ll return to Daily brief after sign in.",
    features: [
      "Daily brief that summarizes your open tasks",
      "Add tasks in plain English",
      "Priorities and due dates in one view",
    ],
  },

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
    unavailableTitle: "Reset unavailable",
    supabaseNotConfigured: "Supabase is not configured.",
    enterEmail: "Enter your email address.",
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
    unavailableTitle: "Reset unavailable",
    supabaseNotConfigured: "Supabase is not configured.",
  },
} as const;
