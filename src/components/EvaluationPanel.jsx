import { useRef, useState } from "react";
import logger from '../logger';

const EvaluationPanel = ({ data, onOpenPDF }) => {
  const [expandedRules, setExpandedRules] = useState({});
  const [isFinalDecisionExpanded, setIsFinalDecisionExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState('final-decision');
  const finalDecisionRef = useRef(null);

  if (!data) return (
    <div className="flex items-center justify-center h-full text-gray-500">
      <div className="text-center">
        <p className="text-xl mb-2">Upload a prospectus to begin analysis</p>
        <p className="text-sm">Evaluation results will appear here</p>
      </div>
    </div>
  );

  const handleDownloadJSON = () => {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'erisa_analysis_result.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      logger.info('JSON download initiated from EvaluationPanel');
    } catch (err) {
      logger.error('JSON download failed in EvaluationPanel', err);
    }
  };

  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .split(' ')
      .map((word, index) => index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)
      .join(' ')
      .trim();
  };

  const renderRuleContent = (rule) => {
    const isTransactionRule = rule.ruleName === "Contemplated Transactions";

    return (
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg shadow-lg border border-blue-200 space-y-6">
        {/* Rule Summary Card */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          {Object.entries(rule).map(([key, value]) => {
            if (key === 'evidence' || key === 'transactionDetails' || key === 'ruleName') return null;

            if (typeof value === 'boolean') {
              return (
                <div key={key} className="flex items-center gap-4 py-2 border-b border-gray-200 last:border-0">
                  <span className="font-medium text-gray-700 min-w-[120px]">
                    {formatLabel(key)}:
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                    ${value
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200'}`}>
                    {value ? 'Yes' : 'No'}
                  </span>
                </div>
              );
            }

            if (Array.isArray(value)) {
              if (value.length === 0) return null;
              return (
                <div key={key} className="py-3 border-b border-gray-200 last:border-0">
                  <span className="text-gray-700 font-medium block mb-2">
                    {formatLabel(key)}:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {value.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              );
            }

            if (typeof value === 'string' && value) {
              const isDetails = key === 'details';
              return (
                <div key={key} className={`py-2 border-b border-gray-200 last:border-0 ${isDetails ? '' : 'flex items-center gap-4'}`}>
                  <span className="font-medium text-gray-700 min-w-[120px]">
                    {formatLabel(key)}:
                  </span>
                  {isDetails ? (
                    <p className="mt-2 text-gray-800 leading-relaxed">{value}</p>
                  ) : (
                    <span className="text-gray-800">{value}</span>
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Evidence Section */}
        {isTransactionRule ? (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-blue-500">📋</span>
              Transactions
            </h4>
            {rule.transactionDetails.map((transaction, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 space-y-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <h5 className="font-medium text-gray-900 capitalize">
                    {transaction.transaction}
                  </h5>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm border border-purple-200">
                    Transaction
                  </span>
                </div>
                <p className="text-gray-700">{transaction.impact}</p>
                <div className="space-y-3">
                  {transaction.evidence.map((ev, evIdx) => (
                    <div key={evIdx} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                      <p className="text-gray-700 mb-3">{ev.pageText}</p>
                      <button
                        onClick={() => {
                          logger.info('Opening PDF for transaction evidence', {
                            transaction: transaction.transaction,
                            pageNumber: ev.pageNumber
                          });
                          onOpenPDF(ev.pageNumber);
                        }}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded-full transition-all"
                      >
                        <span className="mr-2">📄</span>
                        Page {ev.pageNumber}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          rule.evidence && rule.evidence.length > 0 && (
            <div className="space-y-4 bg-white p-4 rounded-lg border-l-4 border-blue-400 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-blue-500">📋</span>
                Evidence
              </h4>
              {rule.evidence.map((ev, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 mb-3">{ev.pageText}</p>
                  <button
                    onClick={() => {
                      logger.info('Opening PDF for evidence', {
                        pageNumber: ev.pageNumber
                      });
                      onOpenPDF(ev.pageNumber);
                    }}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded-full transition-all"
                  >
                    <span className="mr-2">📄</span>
                    Page {ev.pageNumber}
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
      {/* Sticky Navigation Header */}
      <nav className="sticky top-0 bg-white z-10 p-4 border-b shadow-sm">
        <div className="flex justify-between items-start">
          <div className="flex flex-wrap gap-2 flex-1 mr-4">
            <button
              onClick={() => setActiveSection('final-decision')}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeSection === 'final-decision'
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              Final Decision
            </button>
            {data.rules.map((rule, index) => (
              <button
                key={index}
                onClick={() => setActiveSection(`rule-${index}`)}
                className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeSection === `rule-${index}`
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {rule.ruleName}
              </button>
            ))}
          </div>
          <button
            onClick={handleDownloadJSON}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg 
                     hover:from-blue-600 hover:to-blue-700 transition-colors flex items-center gap-2 
                     shadow-sm hover:shadow shrink-0"
          >
            <span>⬇️</span>
            <span className="hidden sm:inline">Download JSON</span>
          </button>
        </div>
      </nav>

      {/* Content Section */}
      <div className="mt-4">
        {/* Final Decision Content */}
        {activeSection === 'final-decision' && (
          <div ref={finalDecisionRef}>
            {data.final_decision && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg shadow-lg border border-blue-200">
                <div className="grid gap-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">ERISA Eligible</span>
                      <span className={`px-4 py-1 rounded-full text-sm font-medium transition-colors
                        ${data.final_decision.isERISAEligible
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-red-100 text-red-800 border border-red-200'}`}>
                        {data.final_decision.isERISAEligible ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Confidence Score</span>
                      <span className="px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                        {data.final_decision.confidenceScore}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <span className="font-medium text-gray-700 block mb-2">Supporting Rules</span>
                    <div className="flex flex-wrap gap-2">
                      {data.final_decision.supportingRules?.map((ruleNumber) => (
                        <span
                          key={ruleNumber}
                          className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium border border-purple-200"
                        >
                          Rule {ruleNumber}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <span className="font-medium text-gray-700 block mb-2">Reasoning</span>
                    <p className="text-gray-800 leading-relaxed">
                      {data.final_decision.reasoning}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rules Content */}
        {data.rules.map((rule, index) => (
          activeSection === `rule-${index}` && (
            <div key={index}>
              {renderRuleContent(rule)}
            </div>
          )
        ))}
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleDownloadJSON}
          className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full 
                   shadow-lg hover:shadow-xl transition-all"
          aria-label="Download JSON"
        >
          ⬇️
        </button>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="p-3 bg-white text-gray-600 rounded-full shadow-lg 
                   hover:shadow-xl transition-all opacity-70 hover:opacity-100"
          aria-label="Scroll to top"
        >
          ↑
        </button>
      </div>
    </div>
  );
};

export default EvaluationPanel;