/**
 * @fileoverview Main orchestrator component for PDF evaluation workflow
 * 
 * Application Flow:
 * ---------------
 * 1. User uploads PDF and selects regulation in UploadPanel
 * 2. PDF is evaluated (API or local test data)
 * 3. Results display in EvaluationPanel
 * 4. User can navigate PDF with evidence highlighting
 * 
 * Component Communication:
 * ----------------------
 * - UploadPanel -> RunEvaluationPage: File upload and evaluation trigger
 * - RunEvaluationPage -> EvaluationPanel: Evaluation results display
 * - EvaluationPanel -> RunEvaluationPage -> AdvancedPDFViewer: PDF navigation
 * 
 * State Management:
 * ---------------
 * - Centralized state management for PDF viewing and evaluation
 * - Handles file upload, evaluation, and PDF navigation coordination
 */

import { useState } from "react";
import AdvancedPDFViewer from "../components/AdvancedPDFViewer";
import EvaluationPanel from "../components/EvaluationPanel";
import UploadPanel from "../components/UploadPanel";
import testResult from "../data/nordea_llm_result_v1.json";
import logger from '../logger';

// Configuration constants
const API_BASE = "http://localhost:8000";
const IS_PROD = true;

const RunEvaluationPage = () => {
  // State Management
  const [evaluationData, setEvaluationData] = useState(null);  // Stores evaluation results
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);         // PDF preview URL
  const [pdfVisible, setPdfVisible] = useState(false);        // PDF viewer visibility
  const [error, setError] = useState(null);                   // Error messages
  const [isLoading, setIsLoading] = useState(false);          // Loading indicator
  const [targetPage, setTargetPage] = useState(null);         // Current PDF page

  /**
   * Makes API call to backend for PDF evaluation
   * @param {File} file - PDF file to evaluate
   * @param {FormData} formData - Form data with file
   * @returns {Promise<Object>} Evaluation results
   */
  const evaluateWithAPI = async (formData) => {
    const response = await fetch(`${API_BASE}/evaluate-erisa`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      logger.error('Failed to evaluate PDF', { status: response.status });
      throw new Error("Evaluation failed. Please try again.");
    }

    return await response.json();
  };

  /**
   * Simulates API response using local test data
   * @returns {Promise<Object>} Test evaluation results
   */
  const evaluateLocally = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return testResult;
  };

  /**
   * Handles PDF evaluation workflow
   * @param {File} file - Uploaded PDF file
   * @param {string} regulation - Selected regulation type
   */
  const handleEvaluate = async (file, regulation) => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const blobUrl = URL.createObjectURL(file);
    setPdfBlobUrl(blobUrl);
    logger.info('Starting evaluation', { file: file.name, regulation, mode: IS_PROD ? 'production' : 'local' });
    setPdfVisible(false);

    try {
      let result;
      if (IS_PROD) {
        const formData = new FormData();
        formData.append("file", file);
        result = await evaluateWithAPI(formData);
      } else {
        result = await evaluateLocally();
      }

      setEvaluationData(result);
      logger.info('Evaluation completed', { mode: IS_PROD ? 'production' : 'local', result });
    } catch (err) {
      setError(err.message || "Analysis failed. Please try again.");
      logger.error('Evaluation error', { error: err, mode: IS_PROD ? 'production' : 'local' });
      setEvaluationData(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles PDF navigation requests
   * @param {number} pageNumber - Target page number
   */
  const handleOpenPDF = (pageNumber) => {
    logger.info('PDF page requested', { pageNumber });
    setTargetPage(pageNumber);
    if (!pdfVisible) setPdfVisible(true);
  };

  /**
   * Extracts evidence entries for PDF highlighting
   * @param {Array} rules - Evaluation rules with evidence
   * @returns {Array} Flattened evidence entries
   */
  const getAllEvidences = (rules) => {
    if (!rules) return [];

    return rules.flatMap(rule => {
      if (rule.ruleName === "Contemplated Transactions") {
        return rule.transactionDetails.flatMap(transaction =>
          transaction.evidence.map(ev => ({
            pageNumber: ev.pageNumber,
            evidence: ev.pageText
          }))
        );
      }
      return rule.evidence?.map(ev => ({
        pageNumber: ev.pageNumber,
        evidence: ev.pageText
      })) || [];
    });
  };

  return (
    <div className={`flex overflow-hidden h-full ${!pdfVisible ? 'block' : 'flex'}`}>
      <div className={`${!pdfVisible ? 'w-full' : 'w-1/2'} p-4 overflow-y-auto space-y-6 border-r border-gray-200 transition-all duration-300`}>
        <UploadPanel
          onEvaluate={handleEvaluate}
          isLoading={isLoading}
          error={error}
        />
        <EvaluationPanel
          data={evaluationData}
          onOpenPDF={handleOpenPDF}
        />
      </div>

      {pdfVisible && (
        <div className="w-1/2 animate-fadeIn">
          <AdvancedPDFViewer
            file={pdfBlobUrl}
            evidences={getAllEvidences(evaluationData?.rules)}
            targetPage={targetPage}
          />
        </div>
      )}
    </div>
  );
};

export default RunEvaluationPage;