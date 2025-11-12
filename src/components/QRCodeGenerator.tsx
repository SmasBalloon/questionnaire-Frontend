import { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

interface QRCodeGeneratorProps {
  quizCode?: string;
  size?: number;
  showDownloadButton?: boolean;
}

export const QRCodeGenerator = ({ 
  quizCode, 
  size = 300,
  showDownloadButton = true 
}: QRCodeGeneratorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);

  // URL avec code du quiz si fourni
  const qrUrl = quizCode 
    ? `https://quiz.smashballoon.fr/join?code=${quizCode}`
    : 'https://quiz.smashballoon.fr/join';

  useEffect(() => {
    // Initialiser le QR Code
    if (!qrCodeRef.current) {
      qrCodeRef.current = new QRCodeStyling({
        width: size,
        height: size,
        data: qrUrl,
        margin: 10,
        image: undefined,
        dotsOptions: {
          color: '#000000',
          type: 'square',
        },
        backgroundOptions: {
          color: '#ffffff',
        },
        cornersSquareOptions: {
          type: 'square',
          color: '#000000',
        },
        cornersDotOptions: {
          color: '#000000',
          type: 'square',
        },
      });

      if (containerRef.current) {
        qrCodeRef.current.append(containerRef.current);
      }
    }
  }, [qrUrl, size]);

  const downloadQRCode = () => {
    if (qrCodeRef.current) {
      qrCodeRef.current.download({
        name: `quiz-qrcode-${quizCode || 'general'}`,
        extension: 'png',
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Scannez pour rejoindre
        </h3>
        <p className="text-sm text-gray-600">
          {quizCode ? `Quiz: ${quizCode}` : 'Rejoignez le quiz'}
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
        <div ref={containerRef} />
      </div>

      {showDownloadButton && (
        <button
          onClick={downloadQRCode}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          📥 Télécharger QR Code
        </button>
      )}

      <p className="text-xs text-gray-500 text-center max-w-xs">
        URL: {qrUrl}
      </p>
    </div>
  );
};

export default QRCodeGenerator;
