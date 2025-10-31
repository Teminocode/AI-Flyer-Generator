import React, { useMemo, useRef, useCallback, useState, useLayoutEffect, useEffect } from 'react';
import type { ImageFile, CanvasFormat } from '../types';
import { DownloadIcon, SpinnerIcon } from './icons';

// Declare the htmlToImage and QRCode libraries as global variables.
declare const htmlToImage: any;
declare const QRCode: any;

interface FlyerPreviewProps {
  htmlContent: string;
  logo: ImageFile | null;
  speakerImage: ImageFile | null;
  backgroundImage: ImageFile | null;
  qrCodeDataUrl: string | null;
  canvasFormat: CanvasFormat;
}

const getCanvasDimensions = (format: CanvasFormat): { width: number, height: number } => {
    switch (format) {
        case 'Instagram Post (Square 1080x1080)': return { width: 1080, height: 1080 };
        case 'Instagram Post (Portrait 1080x1350)': return { width: 1080, height: 1350 };
        case 'Instagram Story (1080x1920)': return { width: 1080, height: 1920 };
        case 'Landscape (1920x1080)': return { width: 1920, height: 1080 };
        case 'A4 Document (2480x3508)': return { width: 2480, height: 3508 };
        default: return { width: 1080, height: 1080 };
    }
}

const FlyerPreview: React.FC<FlyerPreviewProps> = ({ htmlContent, logo, speakerImage, backgroundImage, qrCodeDataUrl, canvasFormat }) => {
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const downloadIframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0);
  const [isDownloadSourceReady, setDownloadSourceReady] = useState(false);

  const { width, height } = getCanvasDimensions(canvasFormat);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (containerRef.current && width > 0) {
        const containerWidth = containerRef.current.offsetWidth;
        setScale(containerWidth / width);
      }
    });
    observer.observe(containerRef.current);
    if (containerRef.current && width > 0) {
        const containerWidth = containerRef.current.offsetWidth;
        setScale(containerWidth / width);
    }
    return () => observer.disconnect();
  }, [width]);

  const processedHtml = useMemo(() => {
    let finalHtml = htmlContent;
    if (logo?.dataUrl) {
      finalHtml = finalHtml.replace(/\[LOGO_IMAGE_URL\]/g, logo.dataUrl);
    }
    if (speakerImage?.dataUrl) {
      finalHtml = finalHtml.replace(/\[SPEAKER_IMAGE_URL\]/g, speakerImage.dataUrl);
    }
    if (backgroundImage?.dataUrl) {
        finalHtml = finalHtml.replace(/\[BACKGROUND_IMAGE_URL\]/g, backgroundImage.dataUrl);
    }
    if (qrCodeDataUrl) {
        finalHtml = finalHtml.replace(/\[QR_CODE_IMAGE_URL\]/g, qrCodeDataUrl);
    }
    return finalHtml;
  }, [htmlContent, logo, speakerImage, backgroundImage, qrCodeDataUrl]);

  const fullIframeContent = useMemo(() => `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body style="margin: 0;">
        <div id="flyer-container" style="width: ${width}px; height: ${height}px;">
          ${processedHtml}
        </div>
      </body>
    </html>
  `, [processedHtml, width, height]);


  useEffect(() => {
    const iframe = downloadIframeRef.current;
    if (iframe) {
        setDownloadSourceReady(false);
        iframe.onload = () => {
            setTimeout(() => {
                setDownloadSourceReady(true);
            }, 300); // Increased delay slightly for complex images
        };
        const doc = iframe.contentDocument;
        if (doc) {
            doc.open();
            doc.write(fullIframeContent);
            doc.close();
        }
    }
  }, [fullIframeContent]);

  const handleDownload = useCallback(async (format: 'png' | 'jpeg') => {
    const iframe = downloadIframeRef.current;
    if (!iframe?.contentDocument) {
        console.error("Download source element is not ready.");
        return;
    }
    
    const nodeToCapture = iframe.contentDocument.getElementById('flyer-container');
    if (!nodeToCapture) {
        console.error('Could not find flyer content to download.');
        return;
    }

    try {
        let dataUrl;
        const options = {
            width,
            height,
            quality: 0.98,
            canvasWidth: width,
            canvasHeight: height,
            // Attempt to fetch external images (like from Unsplash) via a proxy
            // Note: This is a best-effort approach and might be blocked by CORS policies.
            // For production apps, a dedicated server-side proxy is more reliable.
            fetchRequestInit: {
                mode: 'cors' as RequestMode,
                credentials: 'omit' as RequestCredentials,
            }
        };

        if (format === 'png') {
            dataUrl = await htmlToImage.toPng(nodeToCapture, options);
        } else {
            dataUrl = await htmlToImage.toJpeg(nodeToCapture, options);
        }
        
        const link = document.createElement('a');
        link.download = `flyer-design.${format}`;
        link.href = dataUrl;
        link.click();

    } catch (error) {
        console.error('Download error:', error);
        alert('Could not download the flyer. This may be due to browser security restrictions on external images. Try using a custom uploaded background instead of a stock photo.');
    }
  }, [width, height]);


  return (
    <div className="w-full max-w-5xl flex flex-col items-center gap-4">
       <iframe
          ref={downloadIframeRef}
          title="Flyer Download Source"
          style={{
              width: `${width}px`,
              height: `${height}px`,
              position: 'absolute',
              top: 0,
              left: '-9999px',
              zIndex: -1,
          }}
       />

       <div 
        ref={containerRef}
        className="w-full relative shadow-lg rounded-lg overflow-hidden bg-gray-200" 
        style={{ paddingBottom: `${(height / width) * 100}%` }}
       >
          <iframe
            ref={previewIframeRef}
            srcDoc={fullIframeContent}
            title="Flyer Preview"
            sandbox="allow-scripts"
            className="absolute top-0 left-0 border-0 transition-opacity duration-300"
            style={{
                width: `${width}px`,
                height: `${height}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                opacity: scale > 0 ? 1 : 0,
            }}
          />
       </div>
       <div className="flex justify-center gap-2">
        <button 
          onClick={() => handleDownload('png')} 
          disabled={!isDownloadSourceReady}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isDownloadSourceReady ? <DownloadIcon className="w-4 h-4" /> : <SpinnerIcon className="w-4 h-4" />}
          PNG
        </button>
        <button 
          onClick={() => handleDownload('jpeg')} 
          disabled={!isDownloadSourceReady}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isDownloadSourceReady ? <DownloadIcon className="w-4 h-4" /> : <SpinnerIcon className="w-4 h-4" />}
          JPEG
        </button>
      </div>
    </div>
  );
};

export default FlyerPreview;