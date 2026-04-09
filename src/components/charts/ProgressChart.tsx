'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/Card';

interface DataPoint {
  workoutDate: string;
  weight: number;
  volume: number;
}

interface ProgressChartProps {
  title: string;
  data: DataPoint[];
  emptyMessage?: string;
}

/** Line chart showing weight and volume progression over time */
export function ProgressChart({
  title,
  data,
  emptyMessage = 'No progress data yet. Start logging workouts to see your progress.',
}: ProgressChartProps): React.ReactElement {
  if (!data || data.length === 0) {
    return (
      <Card>
        <div className='p-4'>
          <h2 className='text-lg font-semibold'>{title}</h2>
        </div>
        <div className='flex h-48 items-center justify-center text-default-500'>
          <p>{emptyMessage}</p>
        </div>
      </Card>
    );
  }

  const chartData = data
    .map((d) => ({
      date: new Date(d.workoutDate).toLocaleDateString(),
      weight: d.weight,
      volume: d.volume,
    }))
    .sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

  return (
    <Card>
      <div className='p-4'>
        <h2 className='text-lg font-semibold'>{title}</h2>
      </div>
      <div className='p-4'>
        <ResponsiveContainer width='100%' height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='date' tick={{ fontSize: 12 }} />
            <YAxis yAxisId='left' tick={{ fontSize: 12 }} />
            <YAxis yAxisId='right' orientation='right' tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line
              yAxisId='left'
              type='monotone'
              dataKey='weight'
              stroke='#8884d8'
              strokeWidth={2}
              dot={{ r: 4 }}
              name='Weight'
            />
            <Line
              yAxisId='right'
              type='monotone'
              dataKey='volume'
              stroke='#82ca9d'
              strokeWidth={2}
              dot={{ r: 4 }}
              name='Volume'
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
