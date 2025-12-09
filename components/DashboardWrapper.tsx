'use client';

import { ReactNode } from 'react';
import TierSimulator from './TierSimulator';
import { useSubscription } from '@/hooks/useSubscription';

interface DashboardWrapperProps {
  children: ReactNode;
}

export default function DashboardWrapper({ children }: DashboardWrapperProps) {
  const { actualTier, simulatedTier, setSimulatedTier } = useSubscription();

  return (
    <>
      {children}
      <TierSimulator
        onTierChange={setSimulatedTier}
        currentSimulatedTier={simulatedTier}
        actualTier={actualTier}
      />
    </>
  );
}
