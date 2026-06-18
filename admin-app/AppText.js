import { Text } from 'react-native';
import colors from '../theme/colors';

export function Title({ children }) {
  return (
    <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text }}>
      {children}
    </Text>
  );
}

export function Subtitle({ children }) {
  return (
    <Text style={{ fontSize: 14, color: colors.mutedText }}>
      {children}
    </Text>
  );
}
