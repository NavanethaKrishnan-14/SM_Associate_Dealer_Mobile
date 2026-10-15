import React from 'react';
import AuthScreen from './AuthScreen';

/** Dedicated sign-up route with its own screen identity and navigation entry. */
type Props = React.ComponentProps<typeof AuthScreen>;

export default function SignUpScreen(props: Props) {
  return <AuthScreen {...props} authMode="signup" />;
}
