// app/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import WelcomeScreen from '../components/WelcomeScreen';
import MainDisplay from '../components/MainDisplay';
import ImportForm from '../components/ImportForm';
import AudioUnlocker from '../components/AudioUnlocker'; //  <-- AudioUnlocker 在 layout 里了，其实这里可以删掉，但留着也无害
import { wordService } from '../lib/client/wordService';
import { SimpleCharacterSet } from '../lib/types';
import toast from 'react-hot-toast'; // <-- 只导入 toast

export default function HomePage() {
  const [activeCharacterSetId, setActiveCharacterSetId] = useState<string | null>(null);
  const [characterSets, setCharacterSets] = useState<SimpleCharacterSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showImportForm, setShowImportForm] = useState(false);

  const loadCharacterSets = useCallback(async () => {
    try {
      const sets = await wordService.getAllCharacterSets();
      setCharacterSets(sets);

      const defaultSet = sets.find(s => s.isDefault);
      if (defaultSet) {
        setActiveCharacterSetId(defaultSet.id);
      } else if (sets.length > 0) {
        setActiveCharacterSetId(sets[0].id);
      } else {
        setActiveCharacterSetId(null);
      }
    } catch (error) {
      console.error('Failed to load character sets:', error);
      toast.error('加载字库列表失败。');
      setCharacterSets([]);
      setActiveCharacterSetId(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCharacterSets();
  }, [loadCharacterSets]);

  const handleImportSuccess = (newSet: { id: string; name: string }) => {
    toast.success(`字库 "${newSet.name}" 已设为当前字库!`);
    setActiveCharacterSetId(newSet.id);
    setShowImportForm(false);
    loadCharacterSets();
  };

  const handleRequestImport = () => {
    setShowImportForm(true);
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-2xl font-bold text-gray-700">正在加载...</div>;
    }

    if (showImportForm) {
      return (
        <ImportForm
          onSuccess={handleImportSuccess}
          onCancel={() => setShowImportForm(false)}
        />
      );
    }

    if (activeCharacterSetId) {
      return (
        <MainDisplay
          key={activeCharacterSetId}
          initialSetId={activeCharacterSetId}
          onSetsChanged={loadCharacterSets}
          onAddNewSet={handleRequestImport}
        />
      );
    }
    
    return <WelcomeScreen onImportClick={handleRequestImport} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center p-3">
      {/* 确保这里没有 <Toaster /> 组件 */}
      {renderContent()}
    </div>
  );
}
