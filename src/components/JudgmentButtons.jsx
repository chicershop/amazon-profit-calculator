import React from 'react';

/**
 * OK/NG判定ボタンコンポーネント
 */
const JudgmentButtons = ({ result, threshold, onOk, onNg, onSave }) => {
  if (!result) return null;

  // 基準値以上の場合は自動的に詳細リサーチへ
  if (result.meetsThreshold) {
    return (
      <div className="judgment-section">
        <div className="judgment-auto">
          <p className="judgment-message success">
            粗利益率が{threshold}%以上のため、詳細リサーチに進みます
          </p>
          <div className="judgment-buttons">
            <button className="btn btn-primary" onClick={onOk}>
              詳細リサーチへ進む
            </button>
            <button className="btn btn-secondary" onClick={onSave}>
              保存（後で判定）
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 基準値未満の場合はOK/NGボタンを表示
  return (
    <div className="judgment-section">
      <div className="judgment-manual">
        <p className="judgment-message warning">
          粗利益率が{threshold}%未満です。詳細リサーチに進みますか？
        </p>
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
