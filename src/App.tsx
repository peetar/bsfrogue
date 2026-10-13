import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { LessonView } from './components/LessonView';
import { SettingsModal } from './components/SettingsModal';
import { BiblePopupModal } from './components/BiblePopupModal';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const MainApp: React.FC = () => {
  const { viewMode } = useApp();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setShowInstallBanner(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-[#0b0f19] sepia:bg-sepia-200 text-slate-900 dark:text-slate-100 sepia:text-sepia-950 transition-colors duration-200 overflow-x-hidden">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div className="bg-blue-700 text-white px-4 py-2 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Install BSF Romans on your phone or desktop for easy offline access!</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="bg-white text-blue-900 px-3 py-1 rounded-lg font-bold hover:bg-blue-50 transition"
            >
              Install App
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="p-1 hover:bg-blue-800 rounded"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 pb-16">
        {viewMode === 'home' ? <HomeView /> : <LessonView />}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <BiblePopupModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
};

export default App;
