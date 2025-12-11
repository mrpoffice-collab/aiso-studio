'use client';

import { ReactNode } from 'react';
import TierSimulator from './TierSimulator';
import Footer from './Footer';
import { useSubscription } from '@/hooks/useSubscription';

interface DashboardWrapperProps {
  children: ReactNode;
}

export default function DashboardWrapper({ children }: DashboardWrapperProps) {
  const { actualTier, simulatedTier, setSimulatedTier } = useSubscription();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {children}
      </div>
      <Footer />
      <TierSimulator
        onTierChange={setSimulatedTier}
        currentSimulatedTier={simulatedTier}
        actualTier={actualTier}
      />
    </div>
  );
}
