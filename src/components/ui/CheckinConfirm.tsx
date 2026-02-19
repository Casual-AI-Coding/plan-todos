'use client';

import { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import { Circulation } from '@/lib/api';

interface CheckinConfirmProps {
  circulation: Circulation;
  open: boolean;
  onConfirm: (note: string) => void;
  onCancel: () => void;
}

export function CheckinConfirm({ circulation, open, onConfirm, onCancel }: CheckinConfirmProps) {
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    onConfirm(note);
    setNote('');
  };

  const handleCancel = () => {
    setNote('');
    onCancel();
  };

  return (
    <Modal
      open={open}
      title="确认打卡"
      onClose={handleCancel}
      width="sm"
      footer={
        <>
          <Button variant="secondary" onClick={handleCancel}>
            取消
          </Button>
          <Button onClick={handleConfirm}>
            确认打卡
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="text-center py-4">
          <div className="text-2xl font-bold" style={{ color: '#134E4A' }}>
            {circulation.title}
          </div>
          {circulation.circulation_type === 'periodic' && (
            <div className="text-sm text-gray-500 mt-2">
              当前连续: {circulation.streak_count} 天
            </div>
          )}
          {circulation.circulation_type === 'count' && (
            <div className="text-sm text-gray-500 mt-2">
              当前进度: {circulation.current_count} / {circulation.target_count || '∞'}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            添加备注 (可选)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="记录一下今天的感受..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>
      </div>
    </Modal>
  );
}
