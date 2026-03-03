import React from 'react';

/**
 * OK/NG判定ボタンコンポーネント
 * 利益率に関わらずOK・NG・保存のいずれも選択可能
 */
const JudgmentButtons = ({ result, threshold, onOk, onNg, onSave }) => {
  if (!result) return null;

  const meetsThreshold = result.meetsThreshold;
  const messageClass = meetsThreshold ? 'success' : 'warning';
  const messageText = meetsThreshold
    ? `粗利益率が${threshold}%以上です。詳細リサーチに進みますか？`
    : `粗利益率が${threshold}%未満です。詳細リサーチに進みますか？`;

  return (
    <div className="judgment-section">
      <div className={meetsThreshold ? 'judgment-auto' : 'judgment-manual'}>
        <p className={`judgment-message ${messageClass}`}>{messageText}</p>
        <div className="judgment-buttons">
          <button className="btn btn-success" onClick={onOk}>
            OK（詳細リサーチへ）
          </button>
          <button className="btn btn-danger" onClick={onNg}>
            NG（終了）
          </button>
          <button className="btn btn-secondary" onClick={onSave}>
            保存（後で判定）
          </button>
        </div>
      </div>
    </div>
  );
};

export default JudgmentButtons;
