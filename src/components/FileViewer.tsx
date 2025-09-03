import React, { useState, useEffect } from 'react';
import { X, Download, FileText, Image, Code, Archive, Eye, ExternalLink, Share2, Copy, Info } from 'lucide-react';

interface FileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileUrl: string;
  fileType: 'pdf' | 'doc' | 'docx' | 'txt' | 'jpg' | 'png' | 'zip' | 'code' | 'unknown';
  fileSize?: string;
  description?: string;
  downloadCount?: number;
}

const FileViewer: React.FC<FileViewerProps> = ({
  isOpen,
  onClose,
  fileName,
  fileUrl,
  fileType,
  fileSize = '2.4 MB',
  description,
  downloadCount = 1247,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fileUrl);
    alert('File link copied to clipboard!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: fileName,
        text: description || `Check out this file: ${fileName}`,
        url: fileUrl,
      });
    } else {
      setShowShareMenu(!showShareMenu);
    }
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

  const getFileTypeLabel = () => {
    switch (fileType) {
      case 'pdf':
        return 'PDF Document';
      case 'doc':
      case 'docx':
        return 'Word Document';
      case 'txt':
        return 'Text File';
      case 'jpg':
      case 'png':
        return 'Image File';
      case 'zip':
        return 'Archive File';
      case 'code':
        return 'Code File';
      default:
        return 'File';
    }
  };

  const getFileDescription = () => {
    if (description) return description;
    
    switch (fileType) {
      case 'pdf':
        return 'This PDF contains detailed setup instructions, configuration guides, and troubleshooting tips for the course project.';
      case 'txt':
        return 'Step-by-step setup instructions with commands and configuration details for your development environment.';
      case 'zip':
        return 'Complete project starter files including source code, configuration files, and documentation.';
      case 'jpg':
      case 'png':
        return 'Visual diagram showing the setup process and architecture overview for better understanding.';
      default:
        return 'Course resource file containing important materials for your learning journey.';
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
              <div className="bg-white rounded-xl p-8 shadow-lg max-w-md mx-auto">
                <FileText className="w-20 h-20 text-red-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">PDF Document</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{getFileDescription()}</p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{fileSize}</div>
                      <div className="text-gray-500">File Size</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{downloadCount.toLocaleString()}</div>
                      <div className="text-gray-500">Downloads</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center font-medium"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                  <button
                    onClick={handleShare}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'txt':
        return (
          <div className="h-96 bg-gray-50 rounded-lg overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="bg-white border-b p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Setup Instructions</h3>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{fileSize}</span>
                    <span>•</span>
                    <span>{downloadCount.toLocaleString()} downloads</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="bg-white rounded border p-4 font-mono text-sm">
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
            </div>
          </div>
        );

      case 'zip':
        return (
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="bg-white rounded-xl p-8 shadow-lg max-w-lg mx-auto">
                <Archive className="w-20 h-20 text-purple-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Project Starter Files</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{getFileDescription()}</p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold mb-3 text-gray-900">📦 Archive Contents:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>📁 src/ - Source code files</li>
                  <li>📁 public/ - Public assets</li>
                  <li>📄 package.json - Dependencies</li>
                  <li>📄 README.md - Documentation</li>
                  <li>📄 .gitignore - Git ignore rules</li>
                </ul>
              </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="font-semibold text-purple-900">{fileSize}</div>
                    <div className="text-purple-600">Compressed Size</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="font-semibold text-purple-900">{downloadCount.toLocaleString()}</div>
                    <div className="text-purple-600">Downloads</div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center font-medium"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Archive
                  </button>
                  <button
                    onClick={handleShare}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'jpg':
      case 'png':
        return (
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="bg-white rounded-xl p-8 shadow-lg max-w-md mx-auto">
                <div className="w-56 h-36 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-6 mx-auto border-2 border-dashed border-gray-300">
                  <Image className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Setup Diagram</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{getFileDescription()}</p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{fileSize}</div>
                      <div className="text-gray-500">File Size</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">1920×1080</div>
                      <div className="text-gray-500">Resolution</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center font-medium"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Image
                  </button>
                  <button
                    onClick={handleShare}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="bg-white rounded-xl p-8 shadow-lg max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6">
                  {getFileIcon()}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{getFileTypeLabel()}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{getFileDescription()}</p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{fileSize}</div>
                      <div className="text-gray-500">File Size</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{downloadCount.toLocaleString()}</div>
                      <div className="text-gray-500">Downloads</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center font-medium"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </button>
                  <button
                    onClick={handleShare}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
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
            <div className="w-10 h-10 mr-4">
              {getFileIcon()}
            </div>
            <div className="ml-3">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{fileName}</h2>
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <span className="flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  {getFileTypeLabel()}
                </span>
                <span>{fileSize}</span>
                <span>{downloadCount.toLocaleString()} downloads</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Share file"
              >
                <Share2 className="w-5 h-5" />
              </button>
              
              {showShareMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                  <button
                    onClick={handleCopyLink}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </button>
                  <button
                    onClick={() => window.open(fileUrl, '_blank')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </button>
                </div>
              )}
            </div>
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
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              <span>File viewer • {getFileTypeLabel()} • {fileSize}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{getFileDescription()}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCopyLink}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center text-sm"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </button>
            <button
              onClick={handleDownload}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center text-sm font-medium"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
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