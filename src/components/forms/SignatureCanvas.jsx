// src/components/forms/SignatureCanvas.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
    Pen, 
    RotateCcw, 
    Check, 
    X, 
    Palette,
    Download,
    Trash2
} from 'lucide-react';

const SignatureCanvas = ({ onSignatureChange, error }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPoint, setLastPoint] = useState({ x: 0, y: 0 });
    const [hasSignature, setHasSignature] = useState(false);
    const [penColor, setPenColor] = useState('#000000');
    const [penWidth, setPenWidth] = useState(2);
    const [canvasSize, setCanvasSize] = useState({ width: 500, height: 200 });

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        
        // Set canvas size
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;
        
        // Set drawing properties
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penWidth;
        
        // Clear canvas with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add border and grid for better UX
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        
        // Draw border
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        
        // Draw dotted line for signature guide
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(50, canvas.height - 50);
        ctx.lineTo(canvas.width - 50, canvas.height - 50);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Reset stroke properties
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penWidth;
    }, [penColor, penWidth, canvasSize]);

    // Get coordinates relative to canvas
    const getCoordinates = useCallback((e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        if (e.touches) {
            // Touch events
            const touch = e.touches[0];
            return {
                x: (touch.clientX - rect.left) * scaleX,
                y: (touch.clientY - rect.top) * scaleY
            };
        } else {
            // Mouse events
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        }
    }, []);

    // Start drawing
    const startDrawing = useCallback((e) => {
        e.preventDefault();
        const coords = getCoordinates(e);
        setIsDrawing(true);
        setLastPoint(coords);
        setHasSignature(true);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
    }, [getCoordinates]);

    // Continue drawing
    const draw = useCallback((e) => {
        e.preventDefault();
        if (!isDrawing) return;

        const coords = getCoordinates(e);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.strokeStyle = penColor;
        ctx.lineWidth = penWidth;
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();

        setLastPoint(coords);
    }, [isDrawing, getCoordinates, penColor, penWidth]);

    // Stop drawing
    const stopDrawing = useCallback((e) => {
        e.preventDefault();
        setIsDrawing(false);
        
        // Generate signature data
        generateSignatureData();
    }, []);

    // Generate signature data and call parent callback
    const generateSignatureData = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        try {
            // Convert canvas to blob
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], 'signature.png', { type: 'image/png' });
                    const dataURL = canvas.toDataURL('image/png');
                    
                    // Call parent callback with signature data
                    if (onSignatureChange) {
                        onSignatureChange({
                            file,
                            dataURL,
                            blob
                        });
                    }
                }
            }, 'image/png', 0.9);
        } catch (error) {
            console.error('Error generating signature:', error);
        }
    }, [onSignatureChange]);

    // Clear canvas
    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Redraw border and guide
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(50, canvas.height - 50);
        ctx.lineTo(canvas.width - 50, canvas.height - 50);
        ctx.stroke();
        ctx.setLineDash([]);

        setHasSignature(false);
        
        // Notify parent that signature is cleared
        if (onSignatureChange) {
            onSignatureChange(null);
        }
    }, [onSignatureChange]);

    // Download signature
    const downloadSignature = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !hasSignature) return;

        const link = document.createElement('a');
        link.download = 'tanda-tangan.png';
        link.href = canvas.toDataURL();
        link.click();
    }, [hasSignature]);

    // Mouse events
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        // Touch events for mobile
        canvas.addEventListener('touchstart', startDrawing, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', stopDrawing, { passive: false });

        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseout', stopDrawing);
            
            canvas.removeEventListener('touchstart', startDrawing);
            canvas.removeEventListener('touchmove', draw);
            canvas.removeEventListener('touchend', stopDrawing);
        };
    }, [startDrawing, draw, stopDrawing]);

    return (
        <div className="space-y-4">
            {/* Canvas Container */}
            <div className={`relative border-2 border-dashed rounded-lg overflow-hidden ${
                error ? 'border-red-300' : hasSignature ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
            }`}>
                {/* Instructions overlay */}
                {!hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <div className="text-center text-gray-500">
                            <Pen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">Tanda tangani di area ini</p>
                            <p className="text-xs">Gunakan mouse atau sentuh untuk menggambar</p>
                        </div>
                    </div>
                )}

                {/* Canvas */}
                <canvas
                    ref={canvasRef}
                    className="block w-full h-auto cursor-crosshair"
                    style={{
                        maxWidth: '100%',
                        height: 'auto',
                        aspectRatio: `${canvasSize.width}/${canvasSize.height}`
                    }}
                />

                {/* Success indicator */}
                {hasSignature && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                        <Check className="h-4 w-4" />
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Left controls - Pen settings */}
                <div className="flex items-center space-x-3">
                    {/* Pen Color */}
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Warna:</label>
                        <div className="flex items-center space-x-1">
                            {['#000000', '#1e40af', '#dc2626', '#059669'].map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setPenColor(color)}
                                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                                        penColor === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                                    }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Pen Width */}
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Ukuran:</label>
                        <select
                            value={penWidth}
                            onChange={(e) => setPenWidth(Number(e.target.value))}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                            <option value={1}>Kecil</option>
                            <option value={2}>Sedang</option>
                            <option value={3}>Besar</option>
                            <option value={4}>Sangat Besar</option>
                        </select>
                    </div>
                </div>

                {/* Right controls - Actions */}
                <div className="flex items-center space-x-2">
                    {hasSignature && (
                        <button
                            type="button"
                            onClick={downloadSignature}
                            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                        </button>
                    )}
                    
                    <button
                        type="button"
                        onClick={clearCanvas}
                        disabled={!hasSignature}
                        className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>Hapus</span>
                    </button>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <p className="text-sm text-red-600 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    {error.message || 'Tanda tangan diperlukan'}
                </p>
            )}

            {/* Success message */}
            {hasSignature && !error && (
                <p className="text-sm text-green-600 flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    Tanda tangan berhasil dibuat
                </p>
            )}

            {/* Tips */}
            <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Tips:</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Gunakan mouse atau jari untuk menggambar tanda tangan</li>
                    <li>• Pastikan tanda tangan jelas dan mudah dibaca</li>
                    <li>• Gunakan warna hitam atau biru untuk dokumen resmi</li>
                    <li>• Klik "Hapus" untuk mengulangi jika kurang puas</li>
                </ul>
            </div>
        </div>
    );
};

export default SignatureCanvas;