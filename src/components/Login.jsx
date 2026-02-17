/**
 * ログイン・新規登録
 */
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { signIn, signUp, user, isFirebaseEnabled } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err) {
      setError(err.message || 'エラーが発生しました');
    } finally {
      setBusy(false);
    }
  };

  if (!isFirebaseEnabled) {
    return (
      <div className="login-screen">
        <div className="login-box">
          <h2>Amazon利益計算ツール</h2>
          <p className="help-text">
            Firebase が未設定です。.env に REACT_APP_FIREBASE_* を設定してから再読み込みしてください。
          </p>
          <p className="help-text">設定しない場合は、これまで通りローカル（この端末のみ）で利用できます。</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="login-screen">
        <div className="login-box">
          <h2>ログイン</h2>
          <p className="help-text">共有データを利用するにはログインしてください。</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label>パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>
            {error && <p className="help-text error">{error}</p>}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {mode === 'signin' ? 'ログイン' : '新規登録'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
              >
                {mode === 'signin' ? '新規登録する' : 'ログインに戻る'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return null;
}
