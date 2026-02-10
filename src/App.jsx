import React, { useState, useCallback } from 'react';
import ProfitCalculator from './components/ProfitCalculator';
import ProfitResult from './components/ProfitResult';
import JudgmentButtons from './components/JudgmentButtons';
import DetailResearch from './components/DetailResearch';
import ChatworkOutput from './components/ChatworkOutput';
import ProductListingGenerator from './components/ProductListingGenerator';
import HistoryList from './components/HistoryList';
import Settings from './components/Settings';
import { useHistory, useSettings } from './hooks/useLocalStorage';
import { useCalculation } from './hooks/useCalculation';
import './App.css';

// アプリケーションのステート
const VIEWS = {
  CALCULATOR: 'calculator',
  HISTORY: 'history',
  SETTINGS: 'settings',
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

  const { settings, updateSettings, resetSettings, defaultSettings } = useSettings();
  const { history, addHistory, updateHistory, deleteHistory, clearHistory, getHistoryById } = useHistory();
  const calculation = useCalculation(settings);

  // 計算実行
  const handleCalculate = useCallback(() => {
    const result = calculation.calculate();
    if (result) {
      // 履歴に追加
      const id = addHistory({
        asin: calculation.inputs.asin,
        productLink: calculation.inputs.productLink,
        productName: calculation.inputs.productName,
        inputs: { ...calculation.inputs },
        result: result,
        status: 'pending',
      });
      setCurrentHistoryId(id);
      setCurrentStep(STEPS.RESULT);
    }
  }, [calculation, addHistory]);

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

  // 保存（承認待ち）
  const handleSave = useCallback(() => {
    if (currentHistoryId) {
      updateHistory(currentHistoryId, { status: 'awaiting_approval' });
    }
    calculation.resetInputs();
    setCurrentStep(STEPS.INPUT);
    setCurrentHistoryId(null);
  }, [currentHistoryId, updateHistory, calculation]);

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

  // 新規作成
  const handleNewResearch = useCallback(() => {
    calculation.resetInputs();
    setCurrentStep(STEPS.INPUT);
    setCurrentHistoryId(null);
    setCurrentView(VIEWS.CALCULATOR);
  }, [calculation]);

  // 履歴から選択
  const handleSelectHistory = useCallback((item) => {
    setCurrentHistoryId(item.id);
    calculation.updateInputs(item.inputs || {});

    // ステータスに応じてステップを設定
    if (item.status === 'ng') {
      // NGは閲覧のみ
      setCurrentStep(STEPS.RESULT);
    } else if (item.status === 'awaiting_approval') {
      // 承認待ちは結果画面へ
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

  // 現在の履歴データを取得
  const currentHistoryItem = currentHistoryId ? getHistoryById(currentHistoryId) : null;

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
        </nav>
      </header>

      <main className="app-main">
        {renderMainContent()}
      </main>

      <footer className="app-footer">
        <p>Amazon販売 利益計算ツール v1.0</p>
      </footer>
    </div>
  );
}

export default App;
