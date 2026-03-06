import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { approveAccess, revokeAccess, removePendingAccess } from '../services/firestore';

/**
 * オーナー用：アクセス承認・無効化
 */
const AccessManagement = () => {
  const { pendingAccess, approvedEmails, refreshConfig, user } = useAuth();
  const [busy, setBusy] = useState(null);

  const handleApprove = async (email) => {
    setBusy(email);
    try {
      await approveAccess(email);
      await refreshConfig();
    } catch (e) {
      window.alert(e.message || '承認に失敗しました');
    } finally {
      setBusy(null);
    }
  };

  const handleDeny = async (email) => {
    setBusy(email);
    try {
      await removePendingAccess(email);
      await refreshConfig();
    } catch (e) {
      window.alert(e.message || '拒否に失敗しました');
    } finally {
      setBusy(null);
    }
  };

  const handleRevoke = async (email) => {
    if (email === user?.email) {
      window.alert('自分自身のアクセスは無効にできません。');
      return;
    }
    if (!window.confirm(`${email} のアクセスを無効にしますか？`)) return;
    setBusy(email);
    try {
      await revokeAccess(email);
      await refreshConfig();
    } catch (e) {
      window.alert(e.message || '無効化に失敗しました');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="access-management">
      <h2>アクセス管理</h2>
      <p className="help-text">
        新規登録されたメールアドレスを承認するか、既存の利用者のアクセスを無効にできます。
      </p>

      <div className="form-section">
        <h3>承認待ち（新規登録者）</h3>
        {!pendingAccess?.length ? (
          <p className="no-data">承認待ちのアカウントはありません</p>
        ) : (
          <ul className="access-list">
            {pendingAccess.map((p, i) => (
              <li key={i} className="access-list-item">
                <span className="access-email">{p.email}</span>
                <span className="access-meta">
                  {p.requestedAt ? new Date(p.requestedAt).toLocaleString('ja-JP') : ''}
                </span>
                <div className="access-actions">
                  <button
                    type="button"
                    className="btn btn-success btn-small"
                    onClick={() => handleApprove(p.email)}
                    disabled={busy !== null}
                  >
                    {busy === p.email ? '処理中...' : '承認'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-small"
                    onClick={() => handleDeny(p.email)}
                    disabled={busy !== null}
                  >
                    拒否
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="form-section">
        <h3>アクセス可（承認済み）</h3>
        {!approvedEmails?.length ? (
          <p className="no-data">承認済みアカウントはありません（オーナーは常にアクセス可）</p>
        ) : (
          <ul className="access-list">
            {approvedEmails.map((email, i) => (
              <li key={i} className="access-list-item">
                <span className="access-email">{email}</span>
                <span className="access-badge">アクセス可</span>
                <div className="access-actions">
                  <button
                    type="button"
                    className="btn btn-danger btn-small"
                    onClick={() => handleRevoke(email)}
                    disabled={busy !== null || email === user?.email}
                    title={email === user?.email ? '自分自身は無効にできません' : ''}
                  >
                    {busy === email ? '処理中...' : 'アクセス不可にする'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AccessManagement;
