import React, { useState } from "react";
import { Dialog, DialogContent } from "./dialog";
import { Button } from "./button";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
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
  title,
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
    const link = document.createElement("a");
    link.href = images[currentIndex];
    link.download = `image-${currentIndex + 1}`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prevImage();
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "Escape") onClose();
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
                {title && (
                  <h3 
                    className="text-sm font-medium truncate max-w-xs"
                    style={{
                      color: 'white',
                      textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {title}
                  </h3>
                )}
                {images.length > 1 && (
                  <span 
                    className="text-xs opacity-90"
                    style={{
                      color: 'white',
                      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {currentIndex + 1} / {images.length}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {/* Desktop controls */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={zoomOut}
                    disabled={zoom <= 0.5}
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      opacity: zoom <= 0.5 ? '0.5' : '1',
                      cursor: zoom <= 0.5 ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (zoom > 0.5) {
                        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.9)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                    }}
                  >
                    <ZoomOut 
                      style={{
                        width: '12px',
                        height: '12px',
                        color: 'white',
                        filter: 'drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.8))',
                      }}
                    />
                  </Button>

                  <span 
                    style={{
                      fontSize: '14px',
                      padding: '6px 12px',
                      color: 'white',
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      minWidth: '50px',
                      textAlign: 'center',
                    }}
                  >
                    {Math.round(zoom * 100)}%
                  </span>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={zoomIn}
                    disabled={zoom >= 3}
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      opacity: zoom >= 3 ? '0.5' : '1',
                      cursor: zoom >= 3 ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (zoom < 3) {
                        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.9)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                    }}
                  >
                    <ZoomIn 
                      style={{
                        width: '12px',
                        height: '12px',
                        color: 'white',
                        filter: 'drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.8))',
                      }}
                    />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={downloadImage}
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.9)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <Download 
                      style={{
                        width: '12px',
                        height: '12px',
                        color: 'white',
                        filter: 'drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.8))',
                      }}
                    />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(220, 20, 20, 0.9)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.7)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <X 
                    style={{
                      width: '14px',
                      height: '14px',
                      color: 'white',
                      filter: 'drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.8))',
                    }}
                  />
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
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 20,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 0 20px rgba(0, 0, 0, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 1)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 0, 0, 0.9), inset 0 0 15px rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <ChevronLeft 
                    style={{
                      width: '16px',
                      height: '16px',
                      color: 'white',
                      filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8))',
                    }}
                  />
                </Button>

                {/* Next button */}
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={nextImage}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 20,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 0 20px rgba(0, 0, 0, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 1)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 0, 0, 0.9), inset 0 0 15px rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <ChevronRight 
                    style={{
                      width: '16px',
                      height: '16px',
                      color: 'white',
                      filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8))',
                    }}
                  />
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
                  style={{ maxHeight: "calc(90vh - 120px)" }}
                />
              </div>
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
                        ? "border-blue-400 shadow-lg shadow-blue-500/50 scale-110"
                        : "border-transparent opacity-60 hover:opacity-90 hover:border-blue-400/50 hover:scale-105"
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
