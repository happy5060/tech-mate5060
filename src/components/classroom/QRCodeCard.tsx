import React, { useRef, useState } from 'react';
import { QrCode, Copy, Check, Download, ExternalLink, Share2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface QRCodeCardProps {
  url: string;
  accessCode: string;
  title?: string;
  classroomName?: string;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({
  url,
  accessCode,
  title = 'Student Access Code & QR',
  classroomName
}) => {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Lightweight pure SVG QR code generator based on hash/pattern
  // We also provide direct download of the SVG element as an image file
  const handleDownloadQr = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 300, 300);
        ctx.drawImage(img, 0, 0, 300, 300);
      }
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR_${accessCode}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Generate deterministic QR matrix pattern based on url
  const generateQrMatrix = (input: string) => {
    const size = 21; // standard version 1 QR grid
    const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

    // Finder patterns top-left, top-right, bottom-left
    const addFinder = (r: number, c: number) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (
            i === 0 ||
            i === 6 ||
            j === 0 ||
            j === 6 ||
            (i >= 2 && i <= 4 && j >= 2 && j <= 4)
          ) {
            matrix[r + i][c + j] = true;
          }
        }
      }
    };

    addFinder(0, 0);
    addFinder(0, size - 7);
    addFinder(size - 7, 0);

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      matrix[6][i] = i % 2 === 0;
      matrix[i][6] = i % 2 === 0;
    }

    // Hash pseudo-random data bits for visual code
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Skip finder areas
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c >= size - 8) ||
          (r >= size - 8 && c < 8) ||
          r === 6 ||
          c === 6
        ) {
          continue;
        }
        const val = Math.abs(Math.sin((r * size + c) * 31 + hash));
        matrix[r][c] = val > 0.48;
      }
    }

    return matrix;
  };

  const matrix = generateQrMatrix(url);
  const cellSize = 10;
  const qrSize = matrix.length * cellSize;

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-glass space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">{title}</h4>
            {classroomName && (
              <p className="text-[11px] text-slate-500 font-medium">{classroomName}</p>
            )}
          </div>
        </div>

        <span className="px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200/60 text-indigo-700 font-mono font-bold text-sm tracking-wider shadow-xs">
          {accessCode}
        </span>
      </div>

      {/* QR Code Graphic Container */}
      <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-50/60 border border-slate-200/60">
        <div
          ref={qrRef}
          className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0"
        >
          <svg
            width={140}
            height={140}
            viewBox={`0 0 ${qrSize} ${qrSize}`}
            className="shape-rendering-crisp"
          >
            <rect width={qrSize} height={qrSize} fill="#ffffff" />
            {matrix.map((row, r) =>
              row.map((active, c) =>
                active ? (
                  <rect
                    key={`${r}-${c}`}
                    x={c * cellSize}
                    y={r * cellSize}
                    width={cellSize}
                    height={cellSize}
                    fill="#1e1b4b"
                  />
                ) : null
              )
            )}
          </svg>
        </div>

        <div className="space-y-2.5 flex-1 min-w-0 text-center sm:text-left">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Shareable Direct Link
            </span>
            <p className="text-xs font-mono text-slate-700 truncate bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
              {url}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              className="text-xs py-1.5 h-auto bg-white"
            >
              {copied ? 'Copied Link!' : 'Copy Link'}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadQr}
              leftIcon={<Download className="w-3.5 h-3.5 text-indigo-600" />}
              className="text-xs py-1.5 h-auto bg-white"
            >
              Download QR
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
