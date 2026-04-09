'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressSkeleton } from '@/components/feedback/ListSkeletons';
import { BodyMeasurementForm, type BodyMeasurementFormValues } from '@/components/forms/BodyMeasurementForm';
import { useProgress, useMeasurements, useAddMeasurement, useDeleteMeasurement } from '@/hooks/api/useProgress';
import { formatMeasurement, getDisplayUnit } from '@/lib/utils/unitConverter';
import { useSettings } from '@/hooks/api/useSettings';

// Lazy-load chart component to reduce initial bundle
const ProgressChart = dynamic(
  () => import('@/components/charts/ProgressChart').then((m) => m.ProgressChart),
  { ssr: false, loading: () => <div className="h-72 animate-pulse rounded-lg bg-default-100" /> },
);

/** Progress tracking page — exercise progress charts and body measurements */
export default function ProgressPage(): React.ReactElement {
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [timeRange, setTimeRange] = useState('90');

  const { data: progressData, isLoading: progressLoading } = useProgress(
    selectedExercise || undefined,
    timeRange,
  );
  const { data: measurementsData, isLoading: measurementsLoading } = useMeasurements();
  const { mutate: addMeasurement, isPending: isAdding } = useAddMeasurement();
  const { mutate: deleteMeasurement, isPending: isDeleting } = useDeleteMeasurement();
  const { data: settingsData } = useSettings();

  const preferredUnits = settingsData?.data?.preferredUnits ?? 'METRIC';

  const exercises = progressData?.data ?? [];

  const handleAddMeasurement = (data: BodyMeasurementFormValues): void => {
    addMeasurement({
      measurementType: data.measurementType,
      value: data.value,
      unit: data.unit,
      measurementDate: data.measurementDate,
      notes: data.notes,
    });
  };

  const handleDeleteMeasurement = (id: string): void => {
    if (window.confirm('Delete this measurement?')) {
      deleteMeasurement(id);
    }
  };

  const measurements = measurementsData?.data ?? [];

  return (
    <div className='mx-auto max-w-7xl px-4 py-8'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Progress Tracking</h1>
        <p className='mt-1 text-default-500'>View your improvement over time</p>
      </div>

      {/* Filters */}
      <div className='mb-6 flex flex-wrap gap-4'>
        <div className='w-64'>
          <label className='mb-1 block text-sm font-medium' htmlFor='exerciseFilter'>
            Exercise
          </label>
          <select
            id='exerciseFilter'
            className='w-full rounded border border-default-300 bg-transparent p-2 text-sm'
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
          >
            <option value=''>All exercises</option>
            {exercises.map((ex) => (
              <option key={ex.exerciseId} value={ex.exerciseId}>
                {ex.exerciseName}
              </option>
            ))}
          </select>
        </div>
        <div className='w-40'>
          <label className='mb-1 block text-sm font-medium' htmlFor='timeRange'>
            Time Range
          </label>
          <select
            id='timeRange'
            className='w-full rounded border border-default-300 bg-transparent p-2 text-sm'
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value='30'>Last 30 days</option>
            <option value='90'>Last 90 days</option>
            <option value='180'>Last 6 months</option>
            <option value='365'>Last year</option>
          </select>
        </div>
      </div>

      {/* Progress Charts */}
      {progressLoading && <ProgressSkeleton />}

      {!progressLoading && exercises.length === 0 && (
        <Card>
          <div className='py-8 text-center'>
            <p className='text-lg text-default-500'>No progress data yet</p>
            <p className='mt-1 text-sm text-default-400'>
              Start logging workouts to see your progress charts
            </p>
          </div>
        </Card>
      )}

      <div className='mb-8 space-y-6'>
        {exercises.map((ex) => (
          <div key={ex.exerciseId}>
            <div className='mb-2 flex items-center gap-2'>
              <h2 className='text-lg font-semibold'>{ex.exerciseName}</h2>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  ex.trend === 'increasing'
                    ? 'bg-success-100 text-success-700'
                    : ex.trend === 'decreasing'
                      ? 'bg-danger-100 text-danger-700'
                      : 'bg-default-100 text-default-600'
                }`}
              >
                {ex.changePercent > 0 ? '+' : ''}
                {ex.changePercent}%
              </span>
            </div>
            <ProgressChart
              title=''
              data={ex.dataPoints.map((dp) => ({
                workoutDate: dp.workoutDate,
                weight: dp.weight,
                volume: dp.volume,
              }))}
            />
          </div>
        ))}
      </div>

      <div className='my-8 border-t border-default-200' />

      {/* Body Measurements */}
      <div className='mb-6'>
        <h2 className='text-2xl font-bold'>Body Measurements</h2>
        <p className='mt-1 text-default-500'>Track your body measurements over time</p>
      </div>

      <div className='mb-8'>
        <BodyMeasurementForm onSubmit={handleAddMeasurement} isSubmitting={isAdding} />
      </div>

      {measurementsLoading && <p className='text-default-400'>Loading measurements...</p>}

      {measurements.length > 0 && (
        <Card>
          <div className='overflow-x-auto p-4'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-default-200'>
                  <th className='py-2 text-left text-sm font-medium text-default-500'>
                    Type
                  </th>
                  <th className='py-2 text-right text-sm font-medium text-default-500'>
                    Value
                  </th>
                  <th className='py-2 text-left text-sm font-medium text-default-500'>
                    Date
                  </th>
                  <th className='py-2 text-right text-sm font-medium text-default-500'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m) => {
                  const displayUnit = getDisplayUnit(m.measurementType, preferredUnits);
                  return (
                    <tr
                      key={m.id}
                      className='border-b border-default-100 last:border-0'
                    >
                      <td className='py-2 text-sm'>
                        {m.measurementType.replace(/_/g, ' ')}
                      </td>
                      <td className='py-2 text-right text-sm tabular-nums'>
                        {formatMeasurement(m.value, displayUnit)}
                      </td>
                      <td className='py-2 text-sm text-default-500'>
                        {new Date(m.measurementDate).toLocaleDateString()}
                      </td>
                      <td className='py-2 text-right'>
                        <Button
                          size='sm'
                          color='danger'
                          variant='light'
                          isLoading={isDeleting}
                          onPress={() => handleDeleteMeasurement(m.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
