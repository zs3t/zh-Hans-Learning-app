// components/ImportForm.tsx
"use client";

import { useState, useRef } from 'react';
import { importFont } from '@/lib/actions';
import { toast } from 'react-hot-toast';
import { FileInput } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

// *** FIX: Define props for communication with the parent page ***
interface ImportFormProps {
  onSuccess: (newSet: { id: string; name: string }) => void;
  onCancel: () => void;
}

export default function ImportForm({ onSuccess, onCancel }: ImportFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      toast.error('请选择一个字库文件！');
      return;
    }

    setIsImporting(true);
    const loadingToastId = toast.loading('正在导入字库...');

    const formData = new FormData();
    formData.append('fontFile', file);

    try {
      const result = await importFont(formData);

      toast.dismiss(loadingToastId);

      if (result.success && result.characterSet) {
        toast.success(result.message || '字库导入成功！');
        // *** FIX: Call the parent's onSuccess function with the new data ***
        // This lets the parent page handle the UI transition.
        onSuccess(result.characterSet);
      } else {
        toast.error(result.error || '字库导入失败。');
      }
    } catch (unexpectedError: any) {
      toast.dismiss(loadingToastId);
      console.error('导入字库时出现意外错误:', unexpectedError);
      toast.error(`导入时出现意外错误: ${unexpectedError.message || ''}`);
    } finally {
      setIsImporting(false);
      // We don't need to clear the file input here anymore,
      // as the component will be unmounted upon success.
    }
  };

  return (
    <Card className="w-[350px] animate-in fade-in-0 zoom-in-95">
      <CardHeader>
        <CardTitle>导入新字库</CardTitle>
        <CardDescription>
          选择一个 .txt 文件，文件需包含汉字，每行一个。
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="fontFile" className="text-sm font-medium">
                选择字库文件
              </label>
              <input
                id="fontFile"
                name="fontFile"
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={isImporting}
                className="block w-full text-sm text-gray-500
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-md file:border-0
                           file:text-sm file:font-semibold
                           file:bg-green-50 file:text-green-700
                           hover:file:bg-green-100"
              />
              {file && <p className="text-sm text-gray-600 mt-2">已选择: {file.name}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button type="button" onClick={onCancel} disabled={isImporting} variant="outline">
                取消
            </Button>
            <Button type="submit" disabled={isImporting || !file}>
                {isImporting ? '正在导入...' : '上传字库'}
                {!isImporting && <FileInput className="ml-2 h-4 w-4" />}
            </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
