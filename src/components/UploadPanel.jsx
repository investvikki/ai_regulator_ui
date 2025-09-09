/**
 * @fileoverview File upload and regulation selection component
 * 
 * Component Purpose:
 * ----------------
 * Handles PDF file upload and regulation selection for evaluation
 * 
 * Props:
 * -----
 * - onEvaluate(file, regulation): Callback for evaluation
 * - isLoading: Loading state indicator
 * - error: Error message to display
 * 
 * State:
 * -----
 * - selectedFile: Currently selected PDF file
 * - regulation: Selected regulation type
 */

import { useState } from "react";
import logger from '../logger';

const UploadPanel = ({ onEvaluate, isLoading, error }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [regulation, setRegulation] = useState("");

  /**
   * Handles file selection and validation
   * @param {Event} e - File input change event
   */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      logger.info('File selected:', file.name);

      if (file.type !== "application/pdf") {
        alert("Please upload a valid PDF file.");
        return;
      }

      setSelectedFile(file);
    } else {
      logger.warn('No file selected');
    }
  };

  /**
   * Validates inputs and triggers evaluation
   */
  const handleSubmit = () => {
    if (!selectedFile || !regulation) {
      logger.warn('Submission attempted with missing file or regulation');
      alert('Please upload a prospectus PDF and select a regulatory framework before proceeding.');
      return;
    }

    logger.info('Submitting evaluation', {
      file: selectedFile.name,
      regulation
    });
    onEvaluate(selectedFile, regulation);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Upload Issuer Prospectus</h2>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        disabled={isLoading}
        className="mb-4 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2">
        Select Target Regulation
      </h2>
      <div className="relative max-w-md">
        <select
          value={regulation}
          onChange={(e) => setRegulation(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2.5 w-full bg-white 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                   appearance-none cursor-pointer shadow-sm"
        >
          <option value="" disabled>Select Regulatory Framework</option>
          <option value="ERISA">ERISA</option>
          <option value="MIFID II">MIFID II</option>
          <option value="HIPAA">HIPAA</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <button
        className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 
                   text-white rounded-lg hover:from-blue-700 hover:to-blue-800 
                   transition-colors shadow-sm disabled:opacity-50 
                   disabled:cursor-not-allowed flex items-center justify-center gap-2"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          'Evaluate Compliance'
        )}
      </button>

      {error && (
        <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="mt-4 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200 flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Analyzing document...
        </div>
      )}
    </div>
  );
};

export default UploadPanel;