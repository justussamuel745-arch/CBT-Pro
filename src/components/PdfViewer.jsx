import { useEffect, useState } from "react";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import * as pdfjs from "pdfjs-dist";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import './PdfViewer.css';

import workerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";

export function PDFViewer({ fileUrl }) {
    const [dpr, setDpr] = useState(1);

    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        sidebarTabs: () => [],
    });

    useEffect(() => {
        // 3x DPI on mobile = super sharp. 2x on desktop
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        setDpr(isMobile? 3 : window.devicePixelRatio || 2);
    }, []);

    return (
        <div className="pdf-viewer-wrapper">
            <Worker workerUrl={workerUrl}>
                <Viewer
                    fileUrl={fileUrl}
                    plugins={[defaultLayoutPluginInstance]}
                    // Slight zoom in so text is bigger and sharper
                    defaultScale={SpecialZoomLevel.PageWidth} 
                    theme="light"
                    renderMode="canvas"
                    transformGetDocumentParams={(options) => ({
                     ...options,
                        standardFontDataUrl: `${import.meta.env.BASE_URL}standard_fonts/`,
                        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
                        cMapPacked: true,
                        disableFontFace: true,
                        useSystemFonts: false,
                        // THIS IS THE KEY FOR SHARPNESS
                        canvasFactory: {
                            create: (width, height) => {
                                const canvas = document.createElement('canvas');
                                const ctx = canvas.getContext('2d', { alpha: false });
                                canvas.width = width * dpr;
                                canvas.height = height * dpr;
                                canvas.style.width = `${width}px`;
                                canvas.style.height = `${height}px`;
                                ctx.scale(dpr, dpr);
                                return { canvas, context: ctx };
                            },
                            reset: (canvas, width, height) => {
                                const ctx = canvas.getContext('2d');
                                canvas.width = width * dpr;
                                canvas.height = height * dpr;
                                canvas.style.width = `${width}px`;
                                canvas.style.height = `${height}px`;
                                ctx.scale(dpr, dpr);
                            },
                            destroy: (canvas) => {
                                canvas.width = 0;
                                canvas.height = 0;
                                canvas = null;
                            }
                        }
                    })}
                />
            </Worker>
        </div>
    );
}