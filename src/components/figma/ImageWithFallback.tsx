import React, { useState } from "react";

const ERROR_IMG_SRC =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==";

export function ImageWithFallback(
  props: React.ImgHTMLAttributes<HTMLImageElement>
) {
  const [didError, setDidError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error("Image loading error:", props.src, e);
    setDidError(true);
    setIsLoading(false);
    if (props.onError) {
      props.onError(e);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const { src, alt, style, className, onError, onLoad, ...rest } = props;

  if (!src) {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${
          className ?? ""
        }`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <span className="text-gray-400 text-xs">No image</span>
        </div>
      </div>
    );
  }

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${
        className ?? ""
      }`}
      style={style}
      title={`Ошибка загрузки: ${src}`}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img
          src={ERROR_IMG_SRC}
          alt="Error loading image"
          {...rest}
          data-original-url={src}
        />
      </div>
    </div>
  ) : (
    <div className="relative">
      {isLoading && (
        <div
          className={`absolute inset-0 bg-gray-100 flex items-center justify-center ${
            className ?? ""
          }`}
        >
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        style={style}
        {...rest}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
}
