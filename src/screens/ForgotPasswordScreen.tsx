import React from 'react';
import AuthScreen from './AuthScreen';

/** Dedicated password-recovery route. */
type Props = React.ComponentProps<typeof AuthScreen>;

export default function ForgotPasswordScreen(props: Props) {
  return <AuthScreen {...props} authMode="forgot" />;
}
