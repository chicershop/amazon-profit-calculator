import React, { useState, useEffect } from 'react';
import { extractProductName, generateChatworkText, copyToClipboard } from '../utils/extractProductName';

/**
 * チャットワーク依頼テキスト生成コンポーネント
 */
const ChatworkOutput = ({ productTitle, productLink, onComplete, onBack, onGoToProductListing }) => {
  const [productName, setProductName] = useState('');
  const [outputText, setOutputText] = useState('');
  const [copied, setCopied] = useState(false);

  // 商品タイトルから商品名を自動抽出
  useEffect(() => {
    if (productTitle) {
      const extracted = extractProductName(productTitle);
      setProductName(extracted);
    }
  }, [productTitle]);

  // 出力テキストを生成
  useEffect(() => {
    const text = generateChatworkText(productName || '商品名', productLink || '');
    setOutputText(text);
  }, [productName, productLink]);

  const handleCopy = async () => {
    const success = await copyToClipboard(outputText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="chatwork-output">
      <h2>チャットワーク依頼テキスト</h2>

      <div className="form-section">
        <div className="form-group">
          <label htmlFor="productName">商品名</label>
          <input
            type="text"
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="商品名を入力"
          />
          <p className="help-text">商品タイトルから自動抽出されます。必要に応じて編集してください。</p>
        </div>

        <div className="form-group">
          <label htmlFor="productLink">Amazonライバル商品リンク</label>
          <input
            type="url"
            id="productLink"
            value={productLink}
            readOnly
            className="readonly"
          />
        </div>
      </div>

      <div className="output-section">
        <h3>生成テキスト</h3>
        <div className="output-box">
          <pre>{outputText}</pre>
        </div>
        <div className="output-actions">
          <button
            type="button"
            className={`btn ${copied ? 'btn-success' : 'btn-primary'}`}
            onClick={handleCopy}
          >
            {copied ? 'コピーしました!' : 'クリップボードにコピー'}
          </button>
        </div>
      </div>

      <div className="form-actions">
        {onBack && (
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            前に戻る
          </button>
        )}
        {onGoToProductListing && (
          <button type="button" className="btn btn-primary" onClick={onGoToProductListing}>
            商品ページ作成
          </button>
        )}
        <button type="button" className="btn btn-success" onClick={onComplete}>
          完了
        </button>
      </div>
    </div>
  );
};

export default ChatworkOutput;
