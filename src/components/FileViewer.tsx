import React, { useState, useEffect } from 'react';
import { X, Download, FileText, Image, Code, Archive, Eye } from 'lucide-react';

interface FileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileUrl: string;
  fileType: 'pdf' | 'doc' | 'docx' | 'txt' | 'jpg' | 'png' | 'zip' | 'code' | 'unknown';
}

const FileViewer: React.FC<FileViewerProps> = ({
  isOpen,
  onClose,
  fileName,
  fileUrl,
  fileType,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      // Simulate loading time
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = () => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-600" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-8 h-8 text-blue-600" />;
      case 'txt':
        return <FileText className="w-8 h-8 text-gray-600" />;
      case 'jpg':
      case 'png':
        return <Image className="w-8 h-8 text-green-600" />;
      case 'zip':
        return <Archive className="w-8 h-8 text-purple-600" />;
      case 'code':
        return <Code className="w-8 h-8 text-orange-600" />;
      default:
        return <FileText className="w-8 h-8 text-gray-600" />;
    }
  };

  const renderFileContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading file...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-600 mb-2">Error loading file</p>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        </div>
      );
    }

    switch (fileType) {
      case 'pdf':
        return (
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Document</h3>
              <p className="text-gray-600 mb-4">This is a PDF file containing setup instructions and resources.</p>
              <button
                onClick={handleDownload}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center mx-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        );

      case 'txt':
        return (
          <div className="h-96 bg-gray-50 rounded-lg p-6 overflow-y-auto">
            <div className="bg-white rounded border p-4 font-mono text-sm">
              <h3 className="font-bold mb-4">Setup Instructions</h3>
              <div className="space-y-2 text-gray-700">
                <p># React Development Environment Setup</p>
                <p></p>
                <p>## Prerequisites</p>
                <p>- Node.js (v16 or higher)</p>
                <p>- npm or yarn package manager</p>
                <p>- Code editor (VS Code recommended)</p>
                <p></p>
                <p>## Installation Steps</p>
                <p>1. Install Node.js from https://nodejs.org</p>
                <p>2. Verify installation: `node --version`</p>
                <p>3. Create new React app: `npx create-react-app my-app`</p>
                <p>4. Navigate to project: `cd my-app`</p>
                <p>5. Start development server: `npm start`</p>
                <p></p>
                <p>## Recommended Extensions</p>
                <p>- ES7+ React/Redux/React-Native snippets</p>
                <p>- Prettier - Code formatter</p>
                <p>- Auto Rename Tag</p>
                <p>- Bracket Pair Colorizer</p>
                <p></p>
                <p>## Troubleshooting</p>
                <p>If you encounter any issues, check the official React documentation at https://reactjs.org</p>
              </div>
            </div>
          </div>
        );

      case 'zip':
        return (
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Archive className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Archive File</h3>
              <p className="text-gray-600 mb-4">This archive contains project files, templates, and resources.</p>
              <div className="bg-white rounded-lg p-4 mb-4 text-left max-w-md">
                <h4 className="font-semibold mb-2">Contents:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>📁 src/ - Source code files</li>
                  <li>📁 public/ - Public assets</li>
                  <li>📄 package.json - Dependencies</li>
                  <li>📄 README.md - Documentation</li>
                  <li>📄 .gitignore - Git ignore rules</li>
                </ul>
              </div>
              <button
                onClick={handleDownload}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center mx-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Archive
              </button>
            </div>
          </div>
        );

      case 'jpg':
      case 'png':
        return (
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm max-w-md">
                <div className="w-48 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Image className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Setup Diagram</h3>
                <p className="text-gray-600 text-sm mb-4">Visual guide showing the development environment setup process.</p>
                <button
                  onClick={handleDownload}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center mx-auto"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Image
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              {getFileIcon()}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">File Preview</h3>
              <p className="text-gray-600 mb-4">This file type cannot be previewed in the browser.</p>
              <button
                onClick={handleDownload}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center mx-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Download File
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            {getFileIcon()}
            <div className="ml-3">
              <h2 className="text-xl font-bold text-gray-900">{fileName}</h2>
              <p className="text-sm text-gray-500">Setup File</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Download file"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderFileContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            <Eye className="w-4 h-4 inline mr-1" />
            File viewer - Click download to save to your device
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleDownload}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileViewer;