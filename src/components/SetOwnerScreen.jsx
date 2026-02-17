/**
 * オーナー設定画面（初回ログイン時）
 */
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function SetOwnerScreen() {
  const { setOwner, dismissOwnerSetup } = useAuth();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSetOwner = async () => {
    setError('');
    setBusy(true);
    try {
      await setOwner();
      dismissOwnerSetup();
    } catch (err) {
      setError(err.message || 'オーナー設定に失敗しました');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-box">
        <h2>オーナーに設定</h2>
        <p className="help-text">
          このアカウントを「オーナー」にすると、相手が保存した「承認待ち」のリサーチを承認できるようになります。最初にログインした方をオーナーにすることを推奨します。
        </p>
        {error && <p className="help-text error">{error}</p>}
        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={handleSetOwner} disabled={busy}>
            このアカウントをオーナーに設定
          </button>
          <button type="button" className="btn btn-secondary" onClick={dismissOwnerSetup}>
            スキップしてアプリを開く
          </button>
        </div>
      </div>
    </div>
  );
}
