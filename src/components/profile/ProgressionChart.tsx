import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Line, Circle, Polyline, Text as SvgText } from 'react-native-svg';
import { Colors, Typography, Spacing, BorderRadius , getScoreColor } from '@/src/constants/theme';
import { ProgressionPoint } from '@/src/hooks/usePlayerStats';
import { Strings } from '@/src/constants/strings.fr';

interface ProgressionChartProps {
  data: ProgressionPoint[];
}

const CHART_WIDTH = 320;
const CHART_HEIGHT = 160;
const PADDING = 30;

export function ProgressionChart({ data }: ProgressionChartProps) {
  if (data.length < 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{Strings.profile.progression}</Text>
        <Text style={styles.noData}>{Strings.profile.noData}</Text>
      </View>
    );
  }

  const maxScore = 100;
  const minScore = 0;
  const plotWidth = CHART_WIDTH - PADDING * 2;
  const plotHeight = CHART_HEIGHT - PADDING * 2;

  const points = data.map((d, i) => ({
    x: PADDING + (i / (data.length - 1)) * plotWidth,
    y: PADDING + plotHeight - ((d.score - minScore) / (maxScore - minScore)) * plotHeight,
    score: d.score,
    label: d.label,
  }));

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{Strings.profile.progression}</Text>
      <View style={styles.chartContainer}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          {/* Lignes de grille horizontales */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = PADDING + plotHeight - (val / 100) * plotHeight;
            return (
              <React.Fragment key={val}>
                <Line
                  x1={PADDING}
                  y1={y}
                  x2={CHART_WIDTH - PADDING}
                  y2={y}
                  stroke={Colors.border}
                  strokeWidth={1}
                  strokeDasharray="4,4"
                />
                <SvgText
                  x={PADDING - 5}
                  y={y + 4}
                  fontSize={10}
                  fill={Colors.textLight}
                  textAnchor="end"
                >
                  {val}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Ligne de progression */}
          <Polyline
            points={polylinePoints}
            fill="none"
            stroke={Colors.primary}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((p, i) => (
            <React.Fragment key={i}>
              <Circle
                cx={p.x}
                cy={p.y}
                r={5}
                fill={Colors.surface}
                stroke={getScoreColor(p.score)}
                strokeWidth={2.5}
              />
              <SvgText
                x={p.x}
                y={CHART_HEIGHT - 5}
                fontSize={10}
                fill={Colors.textSecondary}
                textAnchor="middle"
              >
                {p.label}
              </SvgText>
            </React.Fragment>
          ))}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  title: {
    ...Typography.h3,
    color: Colors.text,
  },
  noData: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
});
