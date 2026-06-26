import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Settings,
  Search,
  X,
  Loader2,
  Download,
  Share2,
  Sun,
  Moon,
  RotateCcw,
  LayoutGrid,
  FileText,
} from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button, Badge, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Bookmark {
  id: string;
  page: number;
  title: string;
  created_at: string;
}

interface PDFReaderProps {
  bookId: string;
  pdfUrl: string;
  title?: string;
  onSaveProgress?: (page: number, progress: number) => void;
  onLoadProgress?: (progress: number) => void;
  onClose?: () => void;
}

export function PDFReader({
  bookId,
  pdfUrl,
  title = 'PDF Reader',
  onSaveProgress,
  onLoadProgress,
}: PDFReaderProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showBookmarks, setShowBookmarks] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rotation, setRotation] = useState<number>(0);
  const [layout, setLayout] = useState<'single' | 'scroll'>('scroll');

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Load saved progress
  useEffect(() => {
    const loadProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_library')
          .select('current_page, reading_progress')
          .eq('user_id', user.id)
          .eq('book_id', bookId)
          .single();
        if (data) {
          setCurrentPage(data.current_page || 1);
        }
      }
    };
    loadProgress();
  }, [bookId]);

  // Save progress periodically
  useEffect(() => {
    const saveProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && numPages > 0) {
        const progress = (currentPage / numPages) * 100;
        await supabase
          .from('user_library')
          .upsert({
            user_id: user.id,
            book_id: bookId,
            current_page: currentPage,
            reading_progress: progress,
            last_read_at: new Date().toISOString(),
          }, { onConflict: 'user_id,book_id' });
        onSaveProgress?.(currentPage, progress);
      }
    };

    const interval = setInterval(saveProgress, 30000); // Save every 30 seconds
    return () => clearInterval(interval);
  }, [bookId, currentPage, numPages, onSaveProgress]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    onLoadProgress?.(100);
    toast.success('PDF loaded successfully');
  };

  const onPageLoad = (page: number) => {
    if (currentPage !== page) {
      setCurrentPage(page);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= numPages) {
      setCurrentPage(page);
      pageRefs.current.get(page)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const goToNextPage = () => goToPage(Math.min(currentPage + 1, numPages));
  const goToPrevPage = () => goToPage(Math.max(currentPage - 1, 1));

  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => setScale(1.0);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleBookmark = async () => {
    const existing = bookmarks.find(b => b.page === currentPage);
    const { data: { user } } = await supabase.auth.getUser();

    if (existing) {
      await supabase.from('bookmarks').delete().eq('id', existing.id);
      setBookmarks(prev => prev.filter(b => b.id !== existing.id));
      toast.success('Bookmark removed');
    } else if (user) {
      const { data } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          book_id: bookId,
          page: currentPage,
          title: `Page ${currentPage}`,
        })
        .select()
        .single();
      if (data) {
        setBookmarks(prev => [...prev, data as Bookmark]);
        toast.success('Bookmark added');
      }
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToNextPage();
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goToPrevPage();
    if (e.key === 'Escape' && isFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const progress = numPages > 0 ? (currentPage / numPages) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        'fixed inset-0 z-50 flex flex-col',
        isDark ? 'bg-dark-950' : 'bg-white'
      )}
    >
      {/* Header */}
      <header className={cn(
        'flex items-center justify-between px-4 py-3 border-b',
        isDark ? 'glass border-dark-800/50' : 'bg-gray-100 border-gray-200'
      )}>
        <div className="flex items-center gap-4">
          <h2 className={cn(
            'font-semibold truncate max-w-xs sm:max-w-md',
            isDark ? 'text-white' : 'text-gray-900'
          )}>
            {title}
          </h2>
          <Badge variant={isDark ? 'primary' : 'default'}>
            Page {currentPage} of {numPages}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="hidden sm:flex items-center gap-3 flex-1 max-w-xs mx-4">
          <div className="flex-1 h-1.5 bg-dark-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className={cn('text-sm', isDark ? 'text-dark-400' : 'text-gray-600')}>
            {progress.toFixed(0)}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isDark ? 'text-dark-400 hover:text-white hover:bg-dark-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            )}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              showSettings
                ? 'text-primary-400 bg-primary-500/20'
                : isDark ? 'text-dark-400 hover:text-white hover:bg-dark-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            )}
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Bookmarks */}
          <button
            onClick={toggleBookmark}
            className={cn(
              'p-2 rounded-lg transition-colors',
              bookmarks.some(b => b.page === currentPage)
                ? 'text-primary-400 bg-primary-500/20'
                : isDark ? 'text-dark-400 hover:text-white hover:bg-dark-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            )}
          >
            {bookmarks.some(b => b.page === currentPage) ? (
              <BookmarkCheck className="w-5 h-5" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isDark ? 'text-dark-400 hover:text-white hover:bg-dark-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            )}
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>

          {/* Close */}
          <button
            onClick={() => window.history.back()}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isDark ? 'text-dark-400 hover:text-white hover:bg-dark-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={cn(
              'overflow-hidden border-b',
              isDark ? 'bg-dark-900 border-dark-800' : 'bg-gray-50 border-gray-200'
            )}
          >
            <div className="px-4 py-4 flex flex-wrap items-center gap-4">
              {/* Zoom */}
              <div className="flex items-center gap-2">
                <span className={cn('text-sm font-medium', isDark ? 'text-dark-300' : 'text-gray-600')}>
                  Zoom:
                </span>
                <Button size="sm" variant="ghost" onClick={zoomOut}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className={cn('w-12 text-center text-sm', isDark ? 'text-white' : 'text-gray-900')}>
                  {Math.round(scale * 100)}%
                </span>
                <Button size="sm" variant="ghost" onClick={zoomIn}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={resetZoom}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {/* Rotation */}
              <div className="flex items-center gap-2">
                <span className={cn('text-sm font-medium', isDark ? 'text-dark-300' : 'text-gray-600')}>
                  Rotate:
                </span>
                <Button
                  size="sm"
                  variant={rotation === 0 ? 'primary' : 'ghost'}
                  onClick={() => setRotation(0)}
                >
                  0°
                </Button>
                <Button
                  size="sm"
                  variant={rotation === 90 ? 'primary' : 'ghost'}
                  onClick={() => setRotation(90)}
                >
                  90°
                </Button>
                <Button
                  size="sm"
                  variant={rotation === 180 ? 'primary' : 'ghost'}
                  onClick={() => setRotation(180)}
                >
                  180°
                </Button>
              </div>

              {/* Layout */}
              <div className="flex items-center gap-2">
                <span className={cn('text-sm font-medium', isDark ? 'text-dark-300' : 'text-gray-600')}>
                  Layout:
                </span>
                <Button
                  size="sm"
                  variant={layout === 'single' ? 'primary' : 'ghost'}
                  onClick={() => setLayout('single')}
                >
                  <FileText className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={layout === 'scroll' ? 'primary' : 'ghost'}
                  onClick={() => setLayout('scroll')}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm z-10">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
              <p className={cn('text-sm', isDark ? 'text-dark-300' : 'text-gray-600')}>
                Loading PDF...
              </p>
            </div>
          </div>
        )}

        <div
          className={cn(
            'flex justify-center py-8',
            layout === 'scroll' ? 'flex-col items-center gap-4' : 'items-center min-h-full'
          )}
        >
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={null}
            error={
              <div className="text-center py-20">
                <FileText className={cn('w-16 h-16 mx-auto mb-4', isDark ? 'text-dark-600' : 'text-gray-400')} />
                <p className={isDark ? 'text-dark-400' : 'text-gray-600'}>Failed to load PDF</p>
              </div>
            }
          >
            {layout === 'single' ? (
              <div className="flex flex-col items-center">
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  rotate={rotation}
                  renderTextLayer
                  className={cn(
                    'shadow-2xl rounded-lg overflow-hidden',
                    isDark ? 'shadow-black/50' : 'shadow-gray-300/50'
                  )}
                />
              </div>
            ) : (
              Array.from(new Array(numPages), (_, index) => (
                <div
                  key={`page-${index + 1}`}
                  ref={(el) => {
                    if (el) pageRefs.current.set(index + 1, el);
                  }}
                  data-page={index + 1}
                >
                  <Page
                    pageNumber={index + 1}
                    scale={scale}
                    rotate={rotation}
                    renderTextLayer
                    className={cn(
                      'shadow-2xl rounded-lg overflow-hidden mb-4',
                      isDark ? 'shadow-black/50' : 'shadow-gray-300/50',
                      currentPage === index + 1 && 'ring-2 ring-primary-500'
                    )}
                  />
                </div>
              ))
            )}
          </Document>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className={cn(
        'flex items-center justify-between px-4 py-3 border-t',
        isDark ? 'glass border-dark-800/50' : 'bg-gray-100 border-gray-200'
      )}>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
              className="w-16 text-center"
              min={1}
              max={numPages}
            />
            <span className={cn('text-sm', isDark ? 'text-dark-400' : 'text-gray-600')}>
              / {numPages}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage >= numPages}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile progress */}
        <div className="flex sm:hidden items-center gap-2 flex-1 mx-4">
          <div className="flex-1 h-1.5 bg-dark-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <span className={cn('text-xs', isDark ? 'text-dark-400' : 'text-gray-600')}>
            {progress.toFixed(0)}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Bookmarks list */}
          {bookmarks.length > 0 && (
            <select
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value))}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm',
                isDark
                  ? 'bg-dark-800 text-white border-dark-700'
                  : 'bg-white text-gray-900 border-gray-300'
              )}
            >
              <option value="">Bookmarks</option>
              {bookmarks.map((b) => (
                <option key={b.id} value={b.page}>
                  Page {b.page}
                </option>
              ))}
            </select>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(pdfUrl, '_blank')}
          >
            <Download className="w-5 h-5" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
