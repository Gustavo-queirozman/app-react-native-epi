import { useRef, useState } from 'react';
import { View, type GestureResponderEvent } from 'react-native';
export type Point = [number, number];
export function SignaturePad({ strokes, onChange, disabled }: { strokes: Point[][]; onChange: (value: Point[][]) => void; disabled: boolean }) {
  const current = useRef<Point[]>([]);
  const [draft, setDraft] = useState<Point[]>([]);
  const point = (e: GestureResponderEvent): Point => [Math.round(Math.max(0, Math.min(280, e.nativeEvent.locationX))), Math.round(Math.max(0, Math.min(180, e.nativeEvent.locationY)))];
  const finish = () => { if (current.current.length >= 2) onChange([...strokes, current.current]); current.current = []; setDraft([]); };
  return <View accessibilityLabel="Área para desenhar assinatura" style={{ width: 280, height: 180, backgroundColor: '#fff', borderWidth: 1, borderColor: '#536B83', overflow: 'hidden' }}
    onStartShouldSetResponder={() => !disabled && strokes.length < 100}
    onMoveShouldSetResponder={() => !disabled}
    onResponderGrant={e => { current.current = [point(e)]; setDraft([...current.current]); }}
    onResponderMove={e => { if (current.current.length < 500) { current.current.push(point(e)); setDraft([...current.current]); } }}
    onResponderRelease={finish} onResponderTerminate={() => { current.current = []; setDraft([]); }} onResponderTerminationRequest={() => false}>
    <View pointerEvents="none" style={{ position: 'absolute', inset: 0 }}>{[...strokes, draft].flatMap((stroke, s) => stroke.slice(1).map(([x, y], i) => {
      const [a, b] = stroke[i]; const length = Math.hypot(x - a, y - b);
      return <View key={`${s}-${i}`} style={{ position: 'absolute', left: (a + x) / 2 - length / 2, top: (b + y) / 2 - 1, width: length, height: 2, backgroundColor: '#12355B', transform: [{ rotate: `${Math.atan2(y - b, x - a)}rad` }] }} />;
    }))}</View>
  </View>;
}
