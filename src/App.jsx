import React, { useState, useCallback } from 'react';
import ProfitCalculator from './components/ProfitCalculator';
import ProfitResult from './components/ProfitResult';
import JudgmentButtons from './components/JudgmentButtons';
import DetailResearch from './components/DetailResearch';
import ChatworkOutput from './components/ChatworkOutput';
import ProductListingGenerator from './components/ProductListingGenerator';
import HistoryList from './components/HistoryList';
import Settings from './components/Settings';
import Login from './components/Login';
import SetOwnerScreen from './components/SetOwnerScreen';
import PendingApprovalScreen from './components/PendingApprovalScreen';
import AccessManagement from './components/AccessManagement';
import { useHistory, useSettings } from './hooks/useLocalStorage';
import { useFirestoreHistory } from './hooks/useFirestoreHistory';
import { useCalculation } from './hooks/useCalculation';
import { useAuth } from './contexts/AuthContext';
import { getMissingFirebaseEnvKeys } from './firebase';
import './App.css';

// アプリケーションのステート
const VIEWS = {
  CALCULATOR: 'calculator',
  HISTORY: 'history',
  SETTINGS: 'settings',
  ACCESS_MANAGEMENT: 'access_management',
};

const STEPS = {
  INPUT: 'input',
  RESULT: 'result',
  JUDGMENT: 'judgment',
  DETAIL_RESEARCH: 'detail_research',
  CHATWORK: 'chatwork',
  PRODUCT_LISTING: 'product_listing',
  COMPLETE: 'complete',
};

function App() {
  const [currentView, setCurrentView] = useState(VIEWS.CALCULATOR);
  const [currentStep, setCurrentStep] = useState(STEPS.INPUT);
  const [currentHistoryId, setCurrentHistoryId] = useState(null);

  const { user, loading, isFirebaseEnabled, showOwnerSetup, isOwner, isApprovedUser, ensurePendingRequest, signOut } = useAuth();
  const localHistory = useHistory();
  const firestoreHistory = useFirestoreHistory();
  const historyApi = isFirebaseEnabled && user ? firestoreHistory : localHistory;
  const { history, addHistory, updateHistory, deleteHistory, clearHistory, getHistoryById } = historyApi;

  const { settings, updateSettings, resetSettings, defaultSettings } = useSettings();
  const calculation = useCalculation(settings);

  // ※ フックは常に同じ順で呼ぶ必要があるため、早期 return の前にすべて定義する
  // 計算実行（既存プロジェクトなら更新、なければ新規追加）
  const handleCalculate = useCallback(async () => {
    const result = calculation.calculate();
    if (result) {
      const payload = {
        asin: calculation.inputs.asin,
        productLink: calculation.inputs.productLink,
        productName: calculation.inputs.productName,
        inputs: { ...calculation.inputs },
        result,
        status: 'pending',
      };
      if (currentHistoryId) {
        await updateHistory(currentHistoryId, payload);
        setCurrentStep(STEPS.RESULT);
      } else {
        const id = await addHistory(payload);
        setCurrentHistoryId(id);
        setCurrentStep(STEPS.RESULT);
      }
    }
  }, [calculation, addHistory, updateHistory, currentHistoryId]);

  // OK判定
  const handleJudgmentOk = useCallback(() => {
    if (currentHistoryId) {
      updateHistory(currentHistoryId, { status: 'ok' });
    }
    setCurrentStep(STEPS.DETAIL_RESEARCH);
  }, [currentHistoryId, updateHistory]);

  // NG判定
  const handleJudgmentNg = useCallback(() => {
    if (currentHistoryId) {
      updateHistory(currentHistoryId, { status: 'ng' });
    }
    // リセットして最初に戻る
    calculation.resetInputs();
    setCurrentStep(STEPS.INPUT);
    setCurrentHistoryId(null);
  }, [currentHistoryId, updateHistory, calculation]);

  // 保存（承認待ち）— 同じプロジェクトのまま入力画面に戻る
  const handleSave = useCallback(() => {
    if (currentHistoryId) {
      updateHistory(currentHistoryId, { status: 'awaiting_approval' });
    }
    setCurrentStep(STEPS.INPUT);
  }, [currentHistoryId, updateHistory]);

  // 詳細リサーチ保存
  const handleDetailResearchSave = useCallback((data) => {
    if (currentHistoryId) {
      updateHistory(currentHistoryId, {
        detailResearch: data,
        status: 'in_progress',
      });
    }
    setCurrentStep(STEPS.CHATWORK);
  }, [currentHistoryId, updateHistory]);

  // 詳細リサーチキャンセル
  const handleDetailResearchCancel = useCallback(() => {
    setCurrentStep(STEPS.RESULT);
  }, []);

  // 商品ページ作成へ遷移（特記する仕様を履歴に保存してから遷移）
  const handleGoToProductListing = useCallback((specialSpecs = '') => {
    if (currentHistoryId) {
      const current = getHistoryById(currentHistoryId);
      updateHistory(currentHistoryId, {
        detailResearch: { ...(current?.detailResearch || {}), specialSpecs },
      });
    }
    setCurrentStep(STEPS.PRODUCT_LISTING);
  }, [currentHistoryId, getHistoryById, updateHistory]);

  // マニュアル広告ワードを履歴に保存（商品ページ作成支援ページから）
  const handleSaveManualAdWords = useCallback(
    (manualAdWords) => {
      if (!currentHistoryId) return;
      const current = getHistoryById(currentHistoryId);
      updateHistory(currentHistoryId, {
        detailResearch: { ...(current?.detailResearch || {}), manualAdWords: manualAdWords || [] },
      });
    },
    [currentHistoryId, getHistoryById, updateHistory]
  );

  // Chatwork画面に戻る
  const handleBackToChatwork = useCallback(() => {
    setCurrentStep(STEPS.CHATWORK);
  }, []);

  // 詳細リサーチ画面に戻る
  const handleBackToDetailResearch = useCallback(() => {
    setCurrentStep(STEPS.DETAIL_RESEARCH);
  }, []);

  // 完了（特記する仕様を履歴に保存してから完了）
  const handleComplete = useCallback((specialSpecs = '') => {
    if (currentHistoryId) {
      const current = getHistoryById(currentHistoryId);
      updateHistory(currentHistoryId, {
        detailResearch: { ...(current?.detailResearch || {}), specialSpecs },
        status: 'completed',
      });
    }
    calculation.resetInputs();
    setCurrentStep(STEPS.INPUT);
    setCurrentHistoryId(null);
  }, [currentHistoryId, getHistoryById, updateHistory, calculation]);

  // 利益計算タブへ（現在のプロジェクトがあればそのデータのみ表示、なければ新規の空）
  const handleNewResearch = useCallback(() => {
    setCurrentView(VIEWS.CALCULATOR);
    setCurrentStep(STEPS.INPUT);
    if (currentHistoryId) {
      const item = getHistoryById(currentHistoryId);
      calculation.resetInputs();
      if (item?.inputs) calculation.updateInputs(item.inputs);
    } else {
      calculation.resetInputs();
    }
  }, [calculation, currentHistoryId, getHistoryById]);

  // 新規作成（プロジェクトをリセットして空の入力から開始）
  const handleStartNewResearch = useCallback(() => {
    calculation.resetInputs();
    setCurrentHistoryId(null);
    setCurrentStep(STEPS.INPUT);
    setCurrentView(VIEWS.CALCULATOR);
  }, [calculation]);

  // 履歴から選択（常にその1件として扱い、入力はその項目のデータで上書き）
  const handleSelectHistory = useCallback((item) => {
    setCurrentHistoryId(item.id);
    calculation.resetInputs();
    calculation.updateInputs(item.inputs || {});

    // ステータスに応じてステップを設定
    if (item.status === 'ng') {
      setCurrentStep(STEPS.RESULT);
    } else if (item.status === 'awaiting_approval') {
      setCurrentStep(STEPS.RESULT);
    } else if (item.status === 'completed') {
      setCurrentStep(STEPS.CHATWORK);
    } else if (item.status === 'ok' || item.status === 'in_progress') {
      setCurrentStep(STEPS.DETAIL_RESEARCH);
    } else {
      setCurrentStep(STEPS.RESULT);
    }

    setCurrentView(VIEWS.CALCULATOR);
  }, [calculation]);

  // 履歴削除
  const handleDeleteHistory = useCallback((id) => {
    if (window.confirm('この履歴を削除しますか？')) {
      deleteHistory(id);
      if (currentHistoryId === id) {
        calculation.resetInputs();
        setCurrentStep(STEPS.INPUT);
        setCurrentHistoryId(null);
      }
    }
  }, [deleteHistory, currentHistoryId, calculation]);

  // 履歴クリア
  const handleClearHistory = useCallback(() => {
    if (window.confirm('すべての履歴を削除しますか？この操作は取り消せません。')) {
      clearHistory();
      calculation.resetInputs();
      setCurrentStep(STEPS.INPUT);
      setCurrentHistoryId(null);
    }
  }, [clearHistory, calculation]);

  // 承認（オーナーのみ・承認待ち→完了）
  const handleApprove = useCallback((id) => {
    updateHistory(id, { status: 'completed' });
  }, [updateHistory]);

  // 現在の履歴データを取得
  const currentHistoryItem = currentHistoryId ? getHistoryById(currentHistoryId) : null;

  // ここから下は表示の分岐（フックはすべて上で呼び済み）
  if (loading) {
    return (
      <div className="app-loading">
        <p>読み込み中...</p>
      </div>
    );
  }
  if (isFirebaseEnabled && !user) {
    return <Login />;
  }
  if (showOwnerSetup) {
    return <SetOwnerScreen />;
  }
  if (isFirebaseEnabled && user && !isApprovedUser) {
    return (
      <PendingApprovalScreen
        user={user}
        onEnsurePending={ensurePendingRequest}
        onSignOut={signOut}
      />
    );
  }

  // メインコンテンツのレンダリング
  const renderMainContent = () => {
    switch (currentView) {
      case VIEWS.HISTORY:
        return (
          <HistoryList
            history={history}
            onSelect={handleSelectHistory}
            onDelete={handleDeleteHistory}
            onClear={handleClearHistory}
            onApprove={handleApprove}
            isOwner={isOwner}
          />
        );

      case VIEWS.SETTINGS:
        return (
          <Settings
            settings={settings}
            onUpdate={updateSettings}
            onReset={resetSettings}
            defaultSettings={defaultSettings}
          />
        );

      case VIEWS.ACCESS_MANAGEMENT:
        return <AccessManagement />;

      case VIEWS.CALCULATOR:
      default:
        return renderCalculatorContent();
    }
  };

  // 計算機コンテンツのレンダリング
  const renderCalculatorContent = () => {
    switch (currentStep) {
      case STEPS.INPUT:
        return (
          <ProfitCalculator
            inputs={calculation.inputs}
            onInputChange={calculation.updateInput}
            onCalculate={handleCalculate}
            onStartNew={handleStartNewResearch}
            error={calculation.error}
            settings={settings}
            fbaFeeResult={calculation.fbaFeeResult}
          />
        );

      case STEPS.RESULT:
      case STEPS.JUDGMENT:
        return (
          <>
            <ProfitResult result={calculation.result} settings={settings} />
            <JudgmentButtons
              result={calculation.result}
              threshold={settings.profitThreshold}
              onOk={handleJudgmentOk}
              onNg={handleJudgmentNg}
              onSave={handleSave}
            />
            <div className="back-button-container">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCurrentStep(STEPS.INPUT)}
              >
                入力画面に戻る
              </button>
            </div>
          </>
        );

      case STEPS.DETAIL_RESEARCH:
        return (
          <DetailResearch
            key={currentHistoryId ?? 'new'}
            initialData={currentHistoryItem?.detailResearch}
            onSave={handleDetailResearchSave}
            onCancel={handleDetailResearchCancel}
          />
        );

      case STEPS.CHATWORK:
        return (
          <ChatworkOutput
            productTitle={currentHistoryItem?.productName || currentHistoryItem?.inputs?.productName || calculation.inputs.asin}
            productLink={currentHistoryItem?.productLink || calculation.inputs.productLink}
            initialSpecialSpecs={currentHistoryItem?.detailResearch?.specialSpecs ?? ''}
            onComplete={handleComplete}
            onBack={handleBackToDetailResearch}
            onGoToProductListing={handleGoToProductListing}
          />
        );

      case STEPS.PRODUCT_LISTING:
        return (
          <ProductListingGenerator
            historyItem={currentHistoryItem}
            onBack={handleBackToChatwork}
            onSaveManualAdWords={handleSaveManualAdWords}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Amazon利益計算ツール</h1>
        <nav className="app-nav">
          <button
            className={`nav-button ${currentView === VIEWS.CALCULATOR ? 'active' : ''}`}
            onClick={handleNewResearch}
          >
            利益計算
          </button>
          <button
            className={`nav-button ${currentView === VIEWS.HISTORY ? 'active' : ''}`}
            onClick={() => setCurrentView(VIEWS.HISTORY)}
          >
            履歴
          </button>
          <button
            className={`nav-button ${currentView === VIEWS.SETTINGS ? 'active' : ''}`}
            onClick={() => setCurrentView(VIEWS.SETTINGS)}
          >
            設定
          </button>
          {isOwner && (
            <button
              className={`nav-button ${currentView === VIEWS.ACCESS_MANAGEMENT ? 'active' : ''}`}
              onClick={() => setCurrentView(VIEWS.ACCESS_MANAGEMENT)}
            >
              アクセス管理
            </button>
          )}
          {user && (
            <span className="header-user">
              <span className="user-email">{user.email}</span>
              {isOwner && <span className="owner-badge">オーナー</span>}
              <button type="button" className="btn btn-small btn-secondary" onClick={signOut}>
                ログアウト
              </button>
            </span>
          )}
        </nav>
      </header>

      <main className="app-main">
        {renderMainContent()}
      </main>

      <footer className="app-footer">
        <p>Amazon販売 利益計算ツール v1.0</p>
        <p className="firebase-status" aria-live="polite">
          {isFirebaseEnabled
            ? 'Firebase: 有効（履歴は共有されます）'
            : (
                <>
                  Firebase: 無効（履歴はこの端末のみ）。
                  {(() => {
                    const missing = getMissingFirebaseEnvKeys();
                    if (missing.length > 0) {
                      return (
                        <span className="firebase-missing-keys">
                          {' '}
                          Vercel の Environment Variables に次を追加し、Production にチェックを入れてから再デプロイしてください: {missing.join(', ')}
                        </span>
                      );
                    }
                    return ' 本番の環境変数を確認し、再デプロイしてください。';
                  })()}
                </>
              )}
        </p>
      </footer>
    </div>
  );
}

export default App;
