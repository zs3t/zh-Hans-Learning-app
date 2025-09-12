// components/WelcomeScreen.tsx
"use client";

import { Button } from './ui/button';
import { BookOpen } from 'lucide-react';

interface WelcomeScreenProps {
  onImportClick: () => void;
}

export default function WelcomeScreen({ onImportClick }: WelcomeScreenProps) {
  return (
    <div className="text-center p-8 max-w-md mx-auto bg-white/70 backdrop-blur-sm rounded-xl shadow-lg animate-in fade-in-0 zoom-in-95">
      <BookOpen className="mx-auto h-16 w-16 text-green-600 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        欢迎来到汉字学习空间
      </h2>
      <p className="text-gray-600 mb-6">
        请先导入您的第一个汉字字库开始学习。
      </p>
      <Button onClick={onImportClick} size="lg">
        ➕ 导入字库
      </Button>
    </div>
  );
}
