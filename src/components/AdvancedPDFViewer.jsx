/**
 * @fileoverview Advanced PDF viewer with navigation and highlighting
 * 
 * Component Flow:
 * 1. Component receives PDF blob URL and evidence data
 * 2. PDF loads and renders pages progressively
 * 3. User can navigate pages, adjust zoom, and set page offset
 * 4. Evidence text is highlighted automatically on target pages
 * 
 * Props:
 * - file: PDF blob URL to display
 * - evidences: Array of evidence entries to highlight
 * - targetPage: Page number to navigate to
 */

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Configure PDF.js worker - Required for PDF rendering
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.6.172/build/pdf.worker.min.js`;

const AdvancedPDFViewer = ({ file, evidences = [], targetPage }) => {
  // State Management
  const [numPages, setNumPages] = useState(null);          // Total pages in PDF
  const [zoom, setZoom] = useState(1.2);                   // Current zoom level
  const [renderedPages, setRenderedPages] = useState({}); // Tracks which pages are rendered
  const [userPageInput, setUserPageInput] = useState("");  // Manual page input value
  const [currentPage, setCurrentPage] = useState(null);    // Currently visible page
  const [pageOffset, setPageOffset] = useState(0);         // Offset for page numbering
  const [isEditingOffset, setIsEditingOffset] = useState(false); // Offset edit mode
  const [offsetInput, setOffsetInput] = useState("0");     // Temporary offset input
  const viewerRef = useRef();                              // Reference to viewer container

  // Called after all pages are rendered
  const isLoaded = numPages && Object.keys(renderedPages).length >= numPages;

  /**
   * Calculates page width based on container size and zoom level
   * Called during initial render and on zoom changes
   */
  const calculatePageWidth = () => {
    if (viewerRef.current) {
      return (viewerRef.current.offsetWidth - 32) * zoom;
    }
    return 800 * zoom; // Fallback width
  };

  /**
   * Scrolls to specific page with smooth animation
   * Called by:
   * - Manual page navigation
   * - URL hash navigation
   * - Target page navigation from evidence
   * @param {number} actualPageNum - Target page number
   */
  const scrollToPage = (actualPageNum) => {
    const el = document.getElementById(`page_${actualPageNum}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setCurrentPage(actualPageNum);
    }
  };

  /**
   * Handles manual page navigation from input field
   * Called when user clicks "Go" button
   */
  const handlePageJump = () => {
    const target = parseInt(userPageInput, 10);
    if (!isNaN(target)) {
      const actual = target + pageOffset;
      if (actual >= 1 && actual <= numPages) {
        scrollToPage(actual);
      }
    }
  };

  /**
   * Saves new page offset value
   * Called when user confirms offset change
   */
  const handleOffsetSave = () => {
    const newOffset = parseInt(offsetInput, 10);
    if (!isNaN(newOffset)) {
      setPageOffset(newOffset);
    }
    setIsEditingOffset(false);
  };

  /**
   * URL hash-based navigation
   * Triggered when:
   * - Component mounts
   * - URL hash changes
   * - Pages finish rendering
   */
  useEffect(() => {
    const tryScrollToAnchor = () => {
      const hash = window.location.hash;
      if (!isLoaded || !hash.startsWith("#page-")) return;
      const printedPage = parseInt(hash.replace("#page-", ""), 10);
      const actualPage = printedPage + pageOffset;
      if (renderedPages[actualPage]) {
        scrollToPage(actualPage);
      }
    };

    tryScrollToAnchor();
    window.addEventListener("hashchange", tryScrollToAnchor);
    return () => window.removeEventListener("hashchange", tryScrollToAnchor);
  }, [renderedPages, isLoaded]);

  /**
   * Handles navigation to target page from evidence
   * Triggered when:
   * - targetPage prop changes
   * - PDF finishes loading
   * - Page offset changes
   */
  useEffect(() => {
    if (targetPage && isLoaded) {
      const actualPage = targetPage + pageOffset;
      if (actualPage >= 1 && actualPage <= numPages) {
        scrollToPage(actualPage);
      }
    }
  }, [targetPage, isLoaded, numPages]);

  /**
   * Called when PDF document finishes loading
   * Sets total number of pages
   */
  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  /**
   * Called when each page finishes rendering
   * Updates renderedPages state to track loading progress
   */
  const onPageRenderSuccess = (pageNumber) => {
    setRenderedPages((prev) => ({ ...prev, [pageNumber]: true }));
  };

  /**
   * Highlights evidence text on specified page
   * Called after text layer renders for each page
   * Only highlights text on the target page
   */
  const tryHighlight = (pageNumber) => {
    if (targetPage === pageNumber) {
      const container = document.getElementById(`page_${pageNumber}`);
      if (!container) return;

      const evidenceText = evidences
        .filter((ev) => ev.pageNumber + pageOffset === pageNumber)
        .map((ev) => ev.evidence?.toLowerCase());

      if (evidenceText.length === 0) return;
      
      // Find and highlight matching text spans
      const spans = Array.from(container.querySelectorAll(".textLayer span"));
      spans.forEach((span) => {
        const spanText = span.textContent?.toLowerCase();
        if (!spanText) return;

        for (const search of evidenceText) {
          if (search && search.includes(spanText)) {
            span.classList.add(
              "bg-yellow-500",
              "rounded-sm",
              "px-[1px]",
              "opacity-50"
            );
          }
        }
      });
    }
  };

  /**
   * Gets evidence highlights for specific page
   * Currently unused but available for future features
   */
  const getHighlightsForPage = (pageNumber) =>
    evidences.filter((ev) => ev.page_number + pageOffset === pageNumber);

  // Don't render anything if no file is provided
  if (!file) return null;

  //component render code...
  return (
    <aside className="w-full h-screen bg-white shadow-inner border-l flex flex-col">
      {/* Toolbar */}
      <div className="flex justify-between items-center p-4">
        <h2 className="text-lg font-semibold">📄 PDF Viewer</h2>
        <div className="flex items-center space-x-2 text-sm">
          {/* Page offset control */}
          <div className="flex items-center mr-4">
            {isEditingOffset ? (
              <>
                <input
                  type="number"
                  className="w-20 px-2 py-1 border rounded"
                  value={offsetInput}
                  onChange={(e) => setOffsetInput(e.target.value)}
                  placeholder="Offset"
                />
                <button
                  onClick={handleOffsetSave}
                  className="ml-2 px-2 py-1 bg-green-500 text-white rounded"
                >
                  Save
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsEditingOffset(true);
                  setOffsetInput(pageOffset.toString());
                }}
                className="px-2 py-1 bg-gray-200 rounded flex items-center"
              >
                <span className="mr-1">Offset: {pageOffset}</span>
                ✏️
              </button>
            )}
          </div>

          <button
            onClick={() => setZoom((z) => z + 0.2)}
            className="px-2 py-1 bg-gray-200 rounded"
          >
            Zoom ➕
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
            className="px-2 py-1 bg-gray-200 rounded"
          >
            Zoom ➖
          </button>

          <button
            onClick={() => scrollToPage(Math.max(1, (currentPage || 1) - 1))}
            className="px-2 py-1 bg-gray-200 rounded"
          >
            ⬅
          </button>
          <button
            onClick={() =>
              scrollToPage(Math.min(numPages, (currentPage || 1) + 1))
            }
            className="px-2 py-1 bg-gray-200 rounded"
          >
            ➡
          </button>

          <input
            type="number"
            placeholder="Go to printed page"
            className="w-32 px-2 py-1 border rounded"
            value={userPageInput}
            onChange={(e) => setUserPageInput(e.target.value)}
          />
          <button
            onClick={handlePageJump}
            className="px-2 py-1 bg-blue-500 text-white rounded"
          >
            Go
          </button>
        </div>
      </div>

      {/* PDF Pages */}
      <div className="flex-1 relative overflow-hidden">
        {/* Spinner */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-[9999]">
            <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading PDF...</span>
          </div>
        )}

        <div className="absolute inset-0 overflow-auto px-4" ref={viewerRef}>
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading="Loading PDF..."
          >
            {Array.from(new Array(numPages), (_, i) => {
              const pageNumber = i + 1;

              return (
                <div
                  key={pageNumber}
                  id={`page_${pageNumber}`}
                  className="relative border rounded mb-6 shadow mx-auto flex justify-center"
                >
                  <Page
                    pageNumber={pageNumber}
                    width={calculatePageWidth()}
                    renderTextLayer={true}
                    onRenderSuccess={() => onPageRenderSuccess(pageNumber)}
                    onRenderTextLayerSuccess={() => tryHighlight(pageNumber)}
                  />
                </div>
              );
            })}
          </Document>
        </div>
      </div>
    </aside>
  );
};

export default AdvancedPDFViewer;