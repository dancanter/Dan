import { useSearchParams } from 'react-router-dom';
import { PageHeader, Tabs } from '@/components/ui';
import { RunningTab } from './performance/Running';
import { GymTab } from './performance/Gym';
import { PlanTab } from './performance/Plan';

type Tab = 'running' | 'gym' | 'plan';

export default function Performance() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab) ?? 'running';
  return (
    <div>
      <PageHeader eyebrow="Performance" title="Run fast. Build muscle. Recover." subtitle="An adaptive running coach and a hypertrophy programme designed to coexist — every prescription explains itself." />
      <Tabs<Tab> value={tab} onChange={(t) => setParams({ tab: t })} tabs={[{ value: 'running', label: 'Running' }, { value: 'gym', label: 'Gym' }, { value: 'plan', label: 'Weekly plan' }]} />
      {tab === 'running' && <RunningTab />}
      {tab === 'gym' && <GymTab start={params.get('start')} />}
      {tab === 'plan' && <PlanTab />}
    </div>
  );
}
