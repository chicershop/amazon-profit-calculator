import React, { useEffect } from 'react';

/**
 * オーナーに承認されるまで表示する画面
 */
const PendingApprovalScreen = ({ user, onEnsurePending, onSignOut }) => {
  useEffect(() => {
    onEnsurePending();
  }, [onEnsurePending]);

  return (
    <div className="pending-approval-screen">
      <div className="pending-approval-box">
        <h2>承認待ちです</h2>
        <p>
          <strong>{user?.email}</strong> でログインしています。
        </p>
        <p>
          オーナーがアカウントを承認すると、このサイトを利用できるようになります。
          <br />
          承認されるまでお待ちください。
        </p>
        <p className="pending-approval-note">
          オーナーは「アクセス管理」画面で登録されたメールアドレスを承認できます。承認されたら、このページを再読み込みしてください。
        </p>
        <button type="button" className="btn btn-secondary" onClick={onSignOut}>
          ログアウト
        </button>
      </div>
    </div>
  );
};

export default PendingApprovalScreen;
