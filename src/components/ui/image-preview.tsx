import React, { useState } from "react";
import { Dialog, DialogContent } from "./dialog";
import { Button } from "./button";
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface ImagePreviewProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function ImagePreview({ 
  images, 
  initialIndex = 0, 
  isOpen, 
  onClose, 
  title 
}: ImagePreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoom(1);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
  };

  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 0.5));
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = images[currentIndex];
    link.download = `image-${currentIndex + 1}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'Escape') onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 border-0 [&>button]:hidden"
        onKeyDown={handleKeyDown}
      >
        <div className="relative w-full h-full flex flex-col">
          {/* Header (semi-opaque black bar) */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-black/80 p-4">
            <div className="flex items-center justify-between text-white">
               <div className="flex items-center space-x-4">
                 {title && <h3 className="text-lg font-semibold truncate">{title}</h3>}
                 {images.length > 1 && (
                   <span className="text-sm opacity-75">
                     {currentIndex + 1} / {images.length}
                   </span>
                 )}
               </div>
               
               <div className="flex items-center space-x-2">
                 {/* Desktop controls */}
                <div className="hidden sm:flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={zoomOut}
                    disabled={zoom <= 0.5}
                    className="text-white bg-black/80 hover:bg-blue-700/80 rounded-full p-2 border border-white/10 shadow-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  
                  <span className="text-sm px-3 py-1 text-white bg-black/60 rounded-md border border-white/10">
                    {Math.round(zoom * 100)}%
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={zoomIn}
                    disabled={zoom >= 3}
                    className="text-white bg-black/80 hover:bg-blue-700/80 rounded-full p-2 border border-white/10 shadow-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={downloadImage}
                    className="text-white bg-black/80 hover:bg-blue-700/80 rounded-full p-2 border border-white/10 shadow-sm transition-colors duration-150 hover:scale-105"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white bg-black/80 hover:bg-blue-700/80 rounded-full p-2 border border-white/10 shadow-sm transition-colors duration-150 hover:scale-105"
                >
                  <X className="w-4 h-4" />
                </Button>
               </div>
             </div>
           </div>

           {/* Main image area */}
          <div className="flex-1 relative overflow-hidden">
            {/* Navigation arrows positioned at the edges of the dialog */}
            {images.length > 1 && (
              <>
                {/* Previous button */}
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={prevImage}
                  className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 z-20 text-white hover:bg-blue-700/80 bg-blue-600/80 backdrop-blur-sm rounded-full w-10 h-10 sm:w-14 sm:h-14 p-0 shadow-lg border border-white/20 transition-all duration-200 hover:scale-105"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
                
                {/* Next button */}
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={nextImage}
                  className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 z-20 text-white hover:bg-blue-700/80 bg-blue-600/80 backdrop-blur-sm rounded-full w-10 h-10 sm:w-14 sm:h-14 p-0 shadow-lg border border-white/20 transition-all duration-200 hover:scale-105"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
              </>
            )}
            
            {/* Image container */}
            <div className="w-full h-full flex items-center justify-center">
              <div 
                className="max-w-full max-h-full transition-transform duration-200 ease-out"
                style={{ transform: `scale(${zoom})` }}
              >
                <ImageWithFallback
                  src={images[currentIndex]}
                  alt={`Изображение ${currentIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                  style={{ maxHeight: 'calc(90vh - 120px)' }}
                />
              </div>
            </div>
          </div>

          {/* Mobile controls (semi-opaque black bar) */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4 sm:hidden">
            <div className="flex items-center justify-center space-x-4">
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={zoomOut}
                 disabled={zoom <= 0.5}
                className="text-white bg-black/80 hover:bg-blue-700/80 rounded-full p-2 border border-white/10 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
               >
                 <ZoomOut className="w-4 h-4" />
               </Button>
               
              <span className="text-sm px-3 py-1 text-white bg-black/60 rounded-md border border-white/10">
                 {Math.round(zoom * 100)}%
               </span>
               
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={zoomIn}
                 disabled={zoom >= 3}
                className="text-white bg-black/80 hover:bg-blue-700/80 rounded-full p-2 border border-white/10 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
               >
                 <ZoomIn className="w-4 h-4" />
               </Button>
               
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={downloadImage}
                className="text-white bg-black/80 hover:bg-blue-700/80 rounded-full p-2 border border-white/10 shadow-sm transition-colors duration-150 hover:scale-105"
               >
                 <Download className="w-4 h-4" />
               </Button>
             </div>
           </div>

          {/* Thumbnail strip for multiple images */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 hidden sm:block">
              <div className="flex space-x-2 bg-black/80 backdrop-blur-sm rounded-lg p-2 border border-white/20 shadow-lg">
                 {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setZoom(1);
                    }}
                    className={`w-12 h-12 rounded overflow-hidden border-2 transition-all duration-200 ${
                      index === currentIndex 
                        ? 'border-blue-400 shadow-lg shadow-blue-500/50 scale-110' 
                        : 'border-transparent opacity-60 hover:opacity-90 hover:border-blue-400/50 hover:scale-105'
                    }`}
                  >
                    <ImageWithFallback
                      src={image}
                      alt={`Миниатюра ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
