import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Line, Circle, Polyline, Text as SvgText } from 'react-native-svg';
import { Colors, Typography, Spacing, BorderRadius, getScoreColor } from '@/src/constants/theme';
import { ProgressionPoint } from '@/src/hooks/usePlayerStats';
import { Strings } from '@/src/constants/strings.fr';

interface ProgressionChartProps {
  data: ProgressionPoint[];
}

const CHART_HEIGHT = 180;
const PADDING_LEFT = 32;
const PADDING_RIGHT = 16;
const PADDING_TOP = 24;
const PADDING_BOTTOM = 36;

function formatChartDate(date: Date): string {
  const d = date.getDate();
  const months = [
    'jan', 'fév', 'mar', 'avr', 'mai', 'jun',
    'jul', 'aoû', 'sep', 'oct', 'nov', 'déc',
  ];
  return `${d} ${months[date.getMonth()]}`;
}

export function ProgressionChart({ data }: ProgressionChartProps) {
  const [chartWidth, setChartWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    setChartWidth(e.nativeEvent.layout.width);
  };

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{Strings.profile.progression}</Text>
        <Text style={styles.noData}>{Strings.profile.noData}</Text>
      </View>
    );
  }

  // Cas 1 séance : afficher un point unique
  if (data.length === 1) {
    const point = data[0];
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{Strings.profile.progression}</Text>
        <View style={styles.singlePointContainer}>
          <View style={[styles.singlePointBadge, { borderColor: getScoreColor(point.score) }]}>
            <Text style={[styles.singlePointScore, { color: getScoreColor(point.score) }]}>
              {Math.round(point.score)}
            </Text>
          </View>
          <Text style={styles.singlePointDate}>{formatChartDate(point.date)}</Text>
          <Text style={styles.singlePointHint}>{Strings.profile.oneSessionHint}</Text>
        </View>
      </View>
    );
  }

  if (chartWidth === 0) {
    return (
      <View style={styles.container} onLayout={onLayout}>
        <Text style={styles.title}>{Strings.profile.progression}</Text>
        <View style={{ height: CHART_HEIGHT }} />
      </View>
    );
  }

  const plotWidth = chartWidth - PADDING_LEFT - PADDING_RIGHT;
  const plotHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  // Limiter à 10 points max pour la lisibilité
  const visibleData = data.length > 10 ? data.slice(data.length - 10) : data;

  const points = visibleData.map((d, i) => ({
    x: PADDING_LEFT + (visibleData.length === 1 ? plotWidth / 2 : (i / (visibleData.length - 1)) * plotWidth),
    y: PADDING_TOP + plotHeight - (d.score / 100) * plotHeight,
    score: d.score,
    date: d.date,
  }));

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  // N'afficher les labels de date que pour un sous-ensemble pour éviter le chevauchement
  const labelStep = Math.max(1, Math.ceil(points.length / 5));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{Strings.profile.progression}</Text>
      <View style={styles.chartContainer} onLayout={onLayout}>
        <Svg width={chartWidth} height={CHART_HEIGHT}>
          {/* Lignes de grille horizontales */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = PADDING_TOP + plotHeight - (val / 100) * plotHeight;
            return (
              <React.Fragment key={val}>
                <Line
                  x1={PADDING_LEFT}
                  y1={y}
                  x2={chartWidth - PADDING_RIGHT}
                  y2={y}
                  stroke={Colors.border}
                  strokeWidth={1}
                  strokeDasharray="4,4"
                />
                <SvgText
                  x={PADDING_LEFT - 6}
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

          {/* Points + scores + dates */}
          {points.map((p, i) => (
            <React.Fragment key={i}>
              {/* Score au-dessus du point */}
              <SvgText
                x={p.x}
                y={p.y - 10}
                fontSize={10}
                fontWeight="600"
                fill={getScoreColor(p.score)}
                textAnchor="middle"
              >
                {Math.round(p.score)}
              </SvgText>

              {/* Point */}
              <Circle
                cx={p.x}
                cy={p.y}
                r={5}
                fill={Colors.surface}
                stroke={getScoreColor(p.score)}
                strokeWidth={2.5}
              />

              {/* Date en bas (sous-ensemble) */}
              {i % labelStep === 0 && (
                <SvgText
                  x={p.x}
                  y={CHART_HEIGHT - 6}
                  fontSize={9}
                  fill={Colors.textSecondary}
                  textAnchor="middle"
                >
                  {formatChartDate(p.date)}
                </SvgText>
              )}
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
    paddingVertical: Spacing.sm,
  },
  // Cas 1 séance
  singlePointContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  singlePointBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  singlePointScore: {
    ...Typography.h2,
    fontSize: 22,
  },
  singlePointDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  singlePointHint: {
    ...Typography.small,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
