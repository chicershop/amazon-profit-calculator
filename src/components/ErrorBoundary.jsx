/**
 * 描画エラーをキャッチし、画面が真っ白になるのを防ぐ
 */
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          maxWidth: '600px',
          margin: '2rem auto',
          fontFamily: 'sans-serif',
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
        }}>
          <h2 style={{ color: '#856404', marginBottom: '1rem' }}>エラーが発生しました</h2>
          <p style={{ marginBottom: '0.5rem' }}>画面が真っ白な場合は、ブラウザの開発者ツール（F12）の「コンソール」タブに表示されている赤いエラーを確認してください。</p>
          <pre style={{
            background: '#f5f5f5',
            padding: '1rem',
            overflow: 'auto',
            fontSize: '12px',
            marginTop: '1rem',
          }}>
            {this.state.error?.toString?.() || '不明なエラー'}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
