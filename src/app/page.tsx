'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Navigation, TabType } from '@/components/Navigation';
import { InicioTab } from '@/components/tabs/InicioTab';
import { IngresosTab } from '@/components/tabs/IngresosTab';
import { EgresosTab } from '@/components/tabs/EgresosTab';
import { AhorroTab } from '@/components/tabs/AhorroTab';
import { PatrimonioTab } from '@/components/tabs/PatrimonioTab';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<TabType>('inicio');

  return (
    <div className="min-h-screen bg-app-bg text-slate-900 flex flex-col justify-between selection:bg-blue-100">
      {/* Top Header with Month Selector */}
      <Header />

      {/* Main Tab Screen Content */}
      <main className="flex-1 w-full max-w-md mx-auto px-4">
        {currentTab === 'inicio' && <InicioTab />}
        {currentTab === 'ingresos' && <IngresosTab />}
        {currentTab === 'egresos' && <EgresosTab onNavigateToTab={setCurrentTab} />}
        {currentTab === 'ahorro' && <AhorroTab />}
        {currentTab === 'patrimonio' && <PatrimonioTab />}
      </main>

      {/* Floating Bottom Pill Navigation Bar */}
      <Navigation currentTab={currentTab} onChangeTab={setCurrentTab} />
    </div>
  );
}
