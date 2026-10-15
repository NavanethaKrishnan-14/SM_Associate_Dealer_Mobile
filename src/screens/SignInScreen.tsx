import React from 'react';
import AuthScreen from './AuthScreen';

/** Dedicated sign-in route. AuthScreen is shared only for the common visual shell. */
type Props = React.ComponentProps<typeof AuthScreen>;

export default function SignInScreen(props: Props) {
  return <AuthScreen {...props} authMode="signin" />;
}
