import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = any;

export default function AccountScreen(p: Props) {
  const { s, C, Header, Glass, user, setUser, isIOSPrompt, notify, setScreen, Setting, Section, Button, signOut } = p;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={s.pad}>
        <Header title="Your account" subtitle="Profile and preferences" />
        <Glass style={s.profile}>
          <View style={s.profileIcon}>
            <Ionicons name="person" color={C.teal} size={28} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.profileName}>{user?.name || 'Guest user'}</Text>
            <Text style={s.muted}>{user?.email || 'Sign in to manage your account'}</Text>
            <View style={s.rolePill}>
              <Text style={{ fontSize: 12, color: C.teal, fontWeight: '800' }}>{user?.role || 'Guest'} account</Text>
            </View>
          </View>
          <Pressable
            onPress={() => {
              if (isIOSPrompt) {
                (Alert as any).prompt(
                  'Edit profile name',
                  'Enter your display name',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Save', onPress: (value: string) => {
                      if (value?.trim() && user) setUser({ ...user, name: value.trim() });
                    } },
                  ],
                  'plain-text',
                );
              } else {
                notify('Profile editing requires connected account settings');
              }
            }}
          >
            <Ionicons name="create-outline" color={C.teal} size={22} />
          </Pressable>
        </Glass>
        {user?.role === 'Dealer' ? (
          <Glass style={s.verification}>
            <Ionicons name="shield-checkmark-outline" color={C.gold} size={22} />
            <View style={{ flex: 1 }}>
              <Text style={s.carName}>Dealer verification</Text>
              <Text style={s.muted}>Pending until reviewed by an authorized admin.</Text>
            </View>
            <Text style={s.pending}>PENDING</Text>
          </Glass>
        ) : null}
        <Section title="Preferences" />
        <Setting icon="notifications-outline" title="Notifications" subtitle="Listing updates and enquiries" />
        <Setting icon="shield-checkmark-outline" title="Privacy & safety" subtitle="Keep your details protected" />
        <Setting icon="help-circle-outline" title="Help & support" subtitle="Get help using the marketplace" />
        <Setting
          icon="document-text-outline"
          title="Vehicle disclaimer"
          subtitle="Read marketplace guidance"
          onPress={() => Alert.alert('Vehicle disclaimer', 'Listings are provided by sellers. Independently verify documents, condition and ownership before purchase.')}
        />
        <Setting icon="information-circle-outline" title="App information" subtitle="SM Associate Cars · v1.0.0" />
        <View style={{ marginTop: 23 }}>
          {!user ? (
            <Button title="Sign in / Create account" onPress={() => setScreen('role')} />
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              onPress={() => Alert.alert(
                'Sign out',
                'Are you sure you want to sign out?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Sign out', style: 'destructive', onPress: () => { void signOut?.(); } },
                ],
              )}
              style={({ pressed }) => ({
                minHeight: 53,
                borderRadius: 18,
                backgroundColor: '#E53935',
                borderWidth: 1,
                borderColor: '#FF7773',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 9,
                paddingHorizontal: 18,
                marginTop: 10,
                opacity: pressed ? 0.82 : 1,
              })}
            >
              <Ionicons name="log-out-outline" color="#FFFFFF" size={19} />
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800' }}>Sign out</Text>
            </Pressable>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
