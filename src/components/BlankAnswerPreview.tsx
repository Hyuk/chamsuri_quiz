import { StyleSheet, Text, View } from 'react-native';

interface Props {
  wordLengths: number[];
}

export function BlankAnswerPreview({ wordLengths }: Props) {
  return (
    <View style={styles.row}>
      {wordLengths.map((length, wordIndex) => (
        <View key={wordIndex} style={styles.word}>
          {Array.from({ length }).map((_, charIndex) => (
            <View key={charIndex} style={styles.blank} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  word: {
    flexDirection: 'row',
    gap: 4,
  },
  blank: {
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#C7CDD6',
  },
});

export function blankAnswerLabel({ wordLengths }: Props): string {
  return wordLengths.map((length) => '○'.repeat(length)).join('  ');
}
