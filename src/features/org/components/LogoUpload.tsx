import { useRef, useState } from 'react';
import { Upload, X, Image } from 'lucide-react';

interface LogoUploadProps {
    value: string;        // current base64 or URL
    onChange: (base64: string) => void;
    companyName?: string;
}

const MAX_SIZE_BYTES = 100 * 1024; // 100KB
const MAX_DIMENSION = 400;         // 400x400px

async function compressToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');

                // Calculate dimensions keeping aspect ratio
                let { width, height } = img;
                if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                    if (width > height) {
                        height = Math.round(height * MAX_DIMENSION / width);
                        width = MAX_DIMENSION;
                    } else {
                        width = Math.round(width * MAX_DIMENSION / height);
                        height = MAX_DIMENSION;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(img, 0, 0, width, height);

                // Reduce quality until < 100KB
                let quality = 0.9;
                let base64 = canvas.toDataURL('image/jpeg', quality);

                while (base64.length > MAX_SIZE_BYTES && quality > 0.1) {
                    quality -= 0.1;
                    base64 = canvas.toDataURL('image/jpeg', quality);
                }

                // Final check — if still too big try as webp
                if (base64.length > MAX_SIZE_BYTES) {
                    base64 = canvas.toDataURL('image/webp', 0.7);
                }

                resolve(base64);
            };
            img.onerror = reject;
            img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export const LogoUpload = ({ value, onChange, companyName }: LogoUploadProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFile = async (file: File) => {
        setError('');

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        // Validate raw file size (max 10MB before compression)
        if (file.size > 10 * 1024 * 1024) {
            setError('File too large. Max 10MB.');
            return;
        }

        setLoading(true);
        try {
            const base64 = await compressToBase64(file);
            const sizeKB = Math.round(base64.length / 1024);
            console.log(`Logo compressed to ${sizeKB}KB`);
            onChange(base64);
        } catch (err) {
            setError('Failed to process image');
        } finally {
            setLoading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const clearLogo = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    // Determine if value is base64 or URL
    const hasLogo = value && value.trim().length > 0;
    const isBase64 = value?.startsWith('data:');

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Company Logo</label>

            <div className="flex items-center gap-4">
                {/* Preview */}
                <div className="w-20 h-20 rounded-2xl border-2 border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {hasLogo ? (
                        <img
                            src={value}
                            alt={companyName || 'Logo'}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                                // If image fails to load show placeholder
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-1 text-gray-300">
                            <Image className="w-8 h-8" />
                            {companyName && (
                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 text-center px-1">
                                    {companyName.slice(0, 2).toUpperCase()}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Upload area */}
                <div className="flex-1">
                    <div
                        onClick={() => inputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="border-2 border-dashed border-gray-200 hover:border-red-400 hover:bg-red-50/30 rounded-2xl p-4 cursor-pointer transition-all text-center"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs font-bold text-gray-500">Compressing...</span>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
                                <p className="text-xs font-bold text-gray-500">Click or drag to upload</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, WEBP · Max 10MB · Auto-compressed to 100KB</p>
                            </>
                        )}
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-red-500 text-[10px] font-bold mt-1 pl-1">{error}</p>
                    )}

                    {/* Clear button + size info */}
                    {hasLogo && !loading && (
                        <div className="flex items-center justify-between mt-2 px-1">
                            <span className="text-[10px] text-gray-400">
                                {isBase64 ? `Stored as base64 (~${Math.round(value.length / 1024)}KB)` : 'External URL'}
                            </span>
                            <button
                                type="button"
                                onClick={clearLogo}
                                className="flex items-center gap-1 text-[10px] font-bold text-rose-500 hover:text-rose-700 transition-colors"
                            >
                                <X className="w-3 h-3" />
                                Remove
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Hidden file input */}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
            />
        </div>
    );
};
