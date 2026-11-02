'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Navigation, TabType } from '@/components/Navigation';
import { InicioTab } from '@/components/tabs/InicioTab';
import { MovimientosTab } from '@/components/tabs/MovimientosTab';
import { NominaTab } from '@/components/tabs/NominaTab';
import { PatrimonioTab } from '@/components/tabs/PatrimonioTab';
import { AjustesTab } from '@/components/tabs/AjustesTab';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<TabType>('inicio');

  return (
    <div className="min-h-screen bg-app-bg text-slate-900 flex flex-col justify-between selection:bg-blue-100">
      {/* Top iOS Header */}
      <Header />

      {/* Main Tab Screen Content */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-4">
        {currentTab === 'inicio' && <InicioTab onNavigateToTab={setCurrentTab} />}
        {currentTab === 'movimientos' && <MovimientosTab />}
        {currentTab === 'nomina' && <NominaTab />}
        {currentTab === 'patrimonio' && <PatrimonioTab />}
        {currentTab === 'ajustes' && <AjustesTab />}
      </main>

      {/* Floating Bottom Pill Navigation Bar */}
      <Navigation currentTab={currentTab} onChangeTab={setCurrentTab} />
    </div>
  );
}

