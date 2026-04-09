import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { useApplications } from '../../contexts/ApplicationContext';

export default function ApprovalControls({ appId, role }) {
  const { approveApplication, rejectApplication } = useApplications();
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onApprove = async () => {
    setError('');
    if (!comment.trim()) return setError('Comment is required');
    setLoading(true);
    try {
      await approveApplication(appId, role, comment);
    } catch (e) {
      setError(e?.message || 'Failed to approve');
    } finally { setLoading(false); }
  };

  const onReject = async () => {
    setError('');
    if (!comment.trim()) return setError('Comment is required');
    setLoading(true);
    try {
      await rejectApplication(appId, role, comment);
    } catch (e) {
      setError(e?.message || 'Failed to reject');
    } finally { setLoading(false); }
  };

  return (
    <div className="mt-3 space-y-2">
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add comment (required)" className="w-full p-2 border rounded" />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex gap-2">
        <button onClick={onApprove} disabled={loading} className="px-3 py-2 bg-green-600 text-white rounded">Approve</button>
        <button onClick={onReject} disabled={loading} className="px-3 py-2 bg-red-600 text-white rounded">Reject</button>
      </div>
    </div>
  );
}
