import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
};

export default function PremiumPopup({
  visible, title, message, onClose, icon = 'shield-checkmark-outline', actionLabel = 'Got it',
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close popup" />
        <View style={styles.card}>
          <View style={styles.glow} />
          <View style={styles.iconHalo}>
            <LinearGradient colors={['rgba(49,230,180,.24)', 'rgba(49,230,180,.06)']} style={styles.iconGradient}>
              <Ionicons name={icon} size={29} color="#31E6B4" />
            </LinearGradient>
          </View>
          <View style={styles.accentLine} />
          <Text style={styles.eyebrow}>SM ASSOCIATE CARS</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <Pressable onPress={onClose} style={({ pressed }) => [styles.button, pressed && { opacity: .82 }]}>
            <LinearGradient colors={['#45F2C1', '#12C995']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>{actionLabel}</Text>
              <Ionicons name="arrow-forward" size={17} color="#03271D" />
            </LinearGradient>
          </Pressable>
          <View style={styles.footer}><Ionicons name="lock-closed-outline" size={12} color="#7C9C91" /><Text style={styles.footerText}>A more confident way to drive</Text></View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,5,4,.78)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 25 },
  card: { width: '100%', maxWidth: 390, overflow: 'hidden', alignItems: 'center', paddingHorizontal: 25, paddingTop: 27, paddingBottom: 21, borderRadius: 29, borderWidth: 1, borderColor: 'rgba(116,255,219,.42)', backgroundColor: 'rgba(6,22,17,.97)', shadowColor: '#31E6B4', shadowOpacity: .22, shadowRadius: 28, elevation: 24 },
  glow: { position: 'absolute', top: -88, width: 230, height: 160, borderRadius: 100, backgroundColor: 'rgba(49,230,180,.10)' },
  iconHalo: { width: 76, height: 76, borderRadius: 27, padding: 1, borderWidth: 1, borderColor: 'rgba(49,230,180,.35)', backgroundColor: 'rgba(49,230,180,.07)' },
  iconGradient: { flex: 1, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  accentLine: { width: 38, height: 3, borderRadius: 2, backgroundColor: '#F8C948', marginTop: 17, marginBottom: 13 },
  eyebrow: { color: '#31E6B4', fontSize: 9, fontWeight: '900', letterSpacing: 2.4, marginBottom: 8 },
  title: { color: '#F5FAF8', fontSize: 23, lineHeight: 29, fontWeight: '900', letterSpacing: -.4, textAlign: 'center' },
  message: { color: '#B8CBC4', fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 9 },
  button: { width: '100%', height: 51, borderRadius: 17, overflow: 'hidden', marginTop: 23, borderWidth: 1, borderColor: 'rgba(220,255,246,.72)' },
  buttonGradient: { flex: 1, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  buttonText: { color: '#03271D', fontSize: 15, fontWeight: '900' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 17 },
  footerText: { color: '#7C9C91', fontSize: 10, letterSpacing: .25 },
});