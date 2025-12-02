import React, { useState, useRef, useEffect } from 'react';
import { GeneratorStep, HandAnalysis } from '../types';
import { useAuth } from '../context/SupabaseAuthContext';
import { supabaseApi } from '../lib/supabaseApi';
import { safeStorage } from '../lib/storage';
import { analyzeHandImage, generateHennaDesign, analyzeOutfitImage, generateStyleThumbnail } from '../services/geminiService';
import SEOHead, { SEO_CONFIGS } from './SEOHead';

interface DesignFlowProps {
  onBack: () => void;
  onViewSaved: () => void;
  onBookConsultation: (designName?: string) => void;
  onGallery?: () => void;
  onArtists?: () => void;
}

// Local HennaStyle interface with camelCase for component use
interface HennaStyle {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  promptModifier: string;
  category?: string;
  complexity?: string;
  coverage?: string;
}

// Approved template interface matching API response
interface ApprovedTemplate {
  id: string;
  generatedImageUrl: string;
  userRating: number;
  style: { id: string; name: string; category?: string } | null;
  user: { name: string } | null;
  createdAt: string;
}

const DEFAULT_PALETTE = ['#f3e0d5', '#8f3e27', '#ffecb3', '#f8f6f6', '#d32f2f', '#c2185b', '#1976d2', '#388e3c', '#7b1fa2', '#ff9800'];
const STYLE_KEYWORDS = ['Embroidered', 'Minimalist', 'Floral', 'Heavy', 'Geometric', 'Traditional', 'Modern', 'Bridal'];

const DesignFlow: React.FC<DesignFlowProps> = ({ onBack, onViewSaved, onBookConsultation, onGallery, onArtists }) => {
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<GeneratorStep>(GeneratorStep.UPLOAD);
  
  // Hand Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<HandAnalysis | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Outfit Wizard State
  const [outfitFile, setOutfitFile] = useState<File | null>(null);
  const [outfitPreviewUrl, setOutfitPreviewUrl] = useState<string | null>(null);
  const [outfitType, setOutfitType] = useState<string>('');
  const [outfitColors, setOutfitColors] = useState<string[]>([]);
  const [outfitTags, setOutfitTags] = useState<string[]>([]);
  
  // Generation State
  const [styles, setStyles] = useState<HennaStyle[]>([]);
  const [approvedTemplates, setApprovedTemplates] = useState<ApprovedTemplate[]>([]);
  const [regeneratingStyleId, setRegeneratingStyleId] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<HennaStyle | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const outfitInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    loadStyles();
    loadApprovedTemplates();
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const loadStyles = async () => {
    try {
      const data = await supabaseApi.getStyles();
      // API now returns pre-transformed camelCase data
      setStyles(data as HennaStyle[]);
    } catch {
      setStyles(FALLBACK_STYLES);
    }
  };

  const loadApprovedTemplates = async () => {
    try {
      const templates = await supabaseApi.getPublicTemplates();
      // API now returns pre-transformed ApprovedTemplate format
      setApprovedTemplates(Array.isArray(templates) ? templates : []);
    } catch (error) {
      // Silently fail - templates are optional enhancement
      setApprovedTemplates([]);
    }
  };

const FALLBACK_STYLES: HennaStyle[] = [
  { id: 'regal-bloom', name: 'Regal Bloom', description: 'Intricate floral and paisley mehendi design suitable for grand occasions.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxAJLz5irj-Bjns_y5dVhmq1L-mydTwGUOkSg2ySegnF3bo-fzHfk7YV9qd2s9U-97xeos90F9JxS4D3SP-gKIpxgQfc5VMYWv5QqcAdPLanxAglR6zTW-o-k5Av2OwWqLQbb-xP2bj-JuOWjFiiTCx6KmyDTt530DPEIzX7QNpPl1JhGjGKBSNCtX6CaUq2O8a7-zBhhUIDQa81T3cZUjATp4T5XCkGYhiDF9pfi6b4s6sesCRmtsyjYQsUtL9j0hmdldsP506w', promptModifier: 'regal bloom style, intricate floral and paisley mehendi design, highly detailed, traditional, heavy coverage', category: 'Traditional', complexity: 'High', coverage: 'Full' },
  { id: 'modern-vine', name: 'Modern Vine', description: 'A contemporary vine-like pattern trailing elegantly up the hand.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuWPAch47zv4IVC5CsrXCORQ1o3VujEzTFKZU6ZI_ga_ExLDvxN1NTWYK0NMA2Leq10lSa2dEAJrlb2m7GkjCXMHQFMZNAvmu_7Rdwx-ZHeA_1Ulsj7aP2dnHssGvQ11Q-jskHUIJoCV2nVaxnXZVeCOQUuPVh34cQyVCOo7Ujv-tUPyQIYeg79pnd3XetnOEyimc9Ymh90gi2ngR_ObW6oT_fZNRSKiiqHZazrWYKeEbLUgEs1YJQ03aCnXHkNzhJqhE9pZux6Q', promptModifier: 'modern vine style, trailing vine-like mehendi pattern, elegant curves, leaves, contemporary, flowing', category: 'Modern', complexity: 'Medium', coverage: 'Partial' },
  { id: 'royal-mandala', name: 'Royal Mandala', description: 'A grand, symmetrical mandala centerpiece for a majestic look.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkxyS7fIYgO3GbES7nKGKMNIA5ErhQoqLRooM1OpSUbL-hdZ-Q-W1x02saTGQrMkWNRJRQdQU-UK5l2tVR51m7_9X9S-bRYvKtZVxwHvl7v3Tt859ktY-iAiabCrakKUbPDN0R4uXdHyxON91-zmicTVfBc9n9Z6PiGNYIqGd-PZ80JLmjqWR6Bm75t6iUP3y5hMuBeJN6pz0SsVI_NWcLugoNhUfNhy8vFaEwYKqeqTyB1_o9B6IqhZdHcUNHKnNn71CJLuxC_A', promptModifier: 'royal mandala style, grand mandala design, center hand, symmetrical, circular patterns, detailed petals', category: 'Traditional', complexity: 'High', coverage: 'Full' },
  { id: 'delicate-flora', name: 'Delicate Flora', description: 'Minimalist floral touches focusing on fingers and wrist.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMiq0nDG6lC6dGMBBMmxWXXeKROdSEhTNK45foL4Y-8whY6v1qwdbmLOHzVaAtNFqEzmI_jFPdAGRZBmBr7W7oonpED8FyQeTnMMWi9jraFgxArcf4Jzc8Fb2c4F-V_aaMl8a-O5i7x-EVVVNnDKWh4oF-nN2gi7x4EBK1bgZmoKhHzOY-p73dyDvqdlrlEunoMb3f8NtPdUbMjOFqMXLTKBLLqer02HGOLrH_a0f45tsvoiLT4jMHcETMHDZxLkWnQC77kp1YNw', promptModifier: 'delicate flora style, minimalist floral mehendi design, fingers and wrist focus, simple, elegant, light coverage', category: 'Minimalist', complexity: 'Low', coverage: 'Minimal' },
];

  const openCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; }
      setIsCameraOpen(true);
    } catch (error: any) {
      if (error.name === 'NotAllowedError') setCameraError('Camera access denied. Please allow camera permissions.');
      else if (error.name === 'NotFoundError') setCameraError('No camera found on this device.');
      else setCameraError('Unable to access camera. Please try uploading instead.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            handleFile(file);
            closeCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const closeCamera = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; }
    setIsCameraOpen(false);
  };

  const handleFile = (file: File) => { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) handleFile(file); };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]?.type.startsWith('image/')) { handleFile(e.dataTransfer.files[0]); e.dataTransfer.clearData(); }
  };

  const handleOutfitFile = async (file: File) => {
    setOutfitFile(file);
    setOutfitPreviewUrl(URL.createObjectURL(file));
    setIsLoading(true);
    try {
      const base64 = await convertToBase64(file);
      const analysis = await analyzeOutfitImage(base64);
      setOutfitType(analysis.outfitType);
      setOutfitColors(analysis.dominantColors);
      setOutfitTags(analysis.styleKeywords);
    } catch (e) { console.error("Outfit analysis failed", e); }
    finally { setIsLoading(false); }
  };

  const onOutfitDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]?.type.startsWith('image/')) { handleOutfitFile(e.dataTransfer.files[0]); e.dataTransfer.clearData(); }
  };

  const convertToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
  });

  const startAnalysis = async () => {
    if (!selectedFile) return;
    setStep(GeneratorStep.ANALYSIS);
    setIsLoading(true);
    try {
      const base64 = await convertToBase64(selectedFile);
      const result = await analyzeHandImage(base64);
      setAnalysis(result);
    } catch {
      setAnalysis({ skinTone: "Detected", handShape: "Classic", coverage: "Optimal for full coverage", keyFeature: "Unique finger length", fingerShape: "Highlights elegant structure", wristArea: "Ideal for intricate wrist work", recommendedStyles: ["Arabic", "Mandala"] });
    } finally { setIsLoading(false); }
  };

  const toggleColor = (color: string) => {
    if (outfitColors.includes(color)) setOutfitColors(outfitColors.filter(c => c !== color));
    else if (outfitColors.length < 4) setOutfitColors([...outfitColors, color]);
  };

  const toggleTag = (tag: string) => {
    if (outfitTags.includes(tag)) setOutfitTags(outfitTags.filter(t => t !== tag));
    else if (outfitTags.length < 4) setOutfitTags([...outfitTags, tag]);
  };

  const handleRegenerateStyle = async (e: React.MouseEvent, style: HennaStyle) => {
    e.stopPropagation();
    setRegeneratingStyleId(style.id);
    try { const newImageUrl = await generateStyleThumbnail(style.name, style.description); setStyles(prev => prev.map(s => s.id === style.id ? { ...s, imageUrl: newImageUrl } : s)); }
    catch { console.error("Failed to regenerate style"); }
    finally { setRegeneratingStyleId(null); }
  };

  const generateDesign = async (styleOverride?: HennaStyle) => {
    const styleToUse = styleOverride || selectedStyle;
    if (!styleToUse || !selectedFile) return;
    if (styleOverride) setSelectedStyle(styleOverride);
    setIsLoading(true);
    try {
      const base64 = await convertToBase64(selectedFile);
      const outfitContext = outfitType ? `${outfitType} style in ${outfitColors.join(', ')} colors, featuring ${outfitTags.join(', ')} elements` : 'elegant bridal style';
      const resultImage = await generateHennaDesign(base64, styleToUse.promptModifier, outfitContext);
      setGeneratedImage(resultImage);
      setIsSaved(false);
      setStep(GeneratorStep.RESULT);
    } catch (error: any) {
      const msg = error?.message || '';
      if (msg.includes('429') || msg.includes('quota') || msg.includes('rate')) alert("API rate limit reached. Please wait 30 seconds and try again.");
      else alert("Something went wrong generating the design. Please try again.");
    } finally { setIsLoading(false); }
  };

  const saveDesign = async () => {
    if (!generatedImage || !selectedStyle) return;
    try {
      const outfitContext = outfitType ? `${outfitType} - ${outfitColors.join(', ')} - ${outfitTags.join(', ')}` : 'Custom';
      
      if (isAuthenticated && user) {
        // Save to Supabase for authenticated users
        await supabaseApi.createDesign({
          styleId: selectedStyle.id,
          handImageUrl: previewUrl || generatedImage,
          generatedImageUrl: generatedImage,
          outfitContext,
          handAnalysis: analysis || undefined,
          isPublic: false,
        });
        setIsSaved(true);
      } else {
        // Save to safeStorage for anonymous users
        const newDesign = { 
          id: Date.now().toString(), 
          imageUrl: generatedImage, 
          styleName: selectedStyle.name, 
          date: new Date().toLocaleDateString(), 
          analysis: analysis || undefined, 
          outfitContext 
        };
        const savedDesigns = JSON.parse(safeStorage.getItem('henna_saved_designs') || '[]');
        savedDesigns.push(newDesign);
        safeStorage.setItem('henna_saved_designs', JSON.stringify(savedDesigns));
        setIsSaved(true);
      }
    } catch (error: any) { 
      console.error('Save design error:', error);
      alert("Unable to save design: " + (error.message || 'Unknown error')); 
    }
  };

  const onBookClick = () => { selectedStyle ? onBookConsultation(selectedStyle.name) : onBookConsultation(); };

  // --- RENDER STEP 1: UPLOAD ---
  if (step === GeneratorStep.UPLOAD) {
    return (
      <div className="relative flex min-h-[80vh] w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8 animate-fadeIn">
        <SEOHead {...SEO_CONFIGS.design} />
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button onClick={onBack} className="text-[#2B1810]/50 hover:text-[#913e27] flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="font-medium">Back to Home</span>
          </button>
        </div>

        {isCameraOpen && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col">
            <div className="flex-1 relative">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-80 border-2 border-white/50 rounded-2xl relative">
                  <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full whitespace-nowrap">Position your hand here</span>
                </div>
              </div>
            </div>
            <div className="bg-black p-6 flex items-center justify-center gap-8">
              <button onClick={closeCamera} className="p-4 bg-white/20 rounded-full text-white hover:bg-white/30"><span className="material-symbols-outlined text-2xl">close</span></button>
              <button onClick={capturePhoto} className="p-6 bg-white rounded-full text-primary hover:bg-gray-100 shadow-lg"><span className="material-symbols-outlined text-3xl">photo_camera</span></button>
              <div className="w-14" />
            </div>
          </div>
        )}

        <div className="w-full max-w-4xl rounded-xl bg-[#FFF8F2] p-8 sm:p-12 lg:p-16 shadow-lg border border-[#F3E0D5]">
          <div className="flex flex-col max-w-[960px] flex-1 mx-auto">
            <div className="flex justify-center gap-2 mb-6">{[1, 2, 3, 4].map((num) => (<div key={num} className={`h-2 w-12 rounded-full transition-all ${num === 1 ? 'bg-primary' : 'bg-gray-200'}`} />))}</div>
            <h1 className="text-[#2B1810] text-[32px] font-bold text-center pb-3 pt-6 font-headline">Step 1: Capture Your Hand</h1>
            <p className="text-[#2B1810]/60 text-center mb-6">Take a photo or upload an image of your hand for personalized designs</p>
            
            <div className="flex flex-col p-4 mt-2">
              {cameraError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">{cameraError}</div>}
              {previewUrl ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="relative w-full max-w-[280px] aspect-[3/4] group">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-xl shadow-lg" />
                    <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 shadow-md hover:bg-red-600"><span className="material-symbols-outlined text-sm">close</span></button>
                  </div>
                  <p className="text-green-600 font-medium flex items-center gap-2"><span className="material-symbols-outlined">check_circle</span>Image ready for analysis</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button onClick={openCamera} className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-primary/30 px-6 py-10 transition-all hover:border-primary hover:bg-primary/5 cursor-pointer group">
                    <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors"><span className="material-symbols-outlined text-4xl text-primary">photo_camera</span></div>
                    <div className="text-center"><p className="text-[#2B1810] text-lg font-bold">Take a Photo</p><p className="text-[#2B1810]/60 text-sm mt-1">Use your camera</p></div>
                  </button>
                  <div className={`flex flex-col items-center gap-4 rounded-xl border-2 border-dashed px-6 py-10 transition-all cursor-pointer group ${isDragging ? 'border-primary bg-primary/5' : 'border-[#F3E0D5] hover:border-primary/50 hover:bg-[#F3E0D5]/20'}`} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={() => fileInputRef.current?.click()}>
                    <div className="p-4 bg-[#F3E0D5] rounded-full group-hover:bg-primary/10 transition-colors"><span className="material-symbols-outlined text-4xl text-[#2B1810]/50 group-hover:text-primary">upload_file</span></div>
                    <div className="text-center"><p className="text-[#2B1810] text-lg font-bold">Upload Image</p><p className="text-[#2B1810]/60 text-sm mt-1">Drag & drop or click</p></div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
                </div>
              )}
            </div>

            <div className="w-full flex flex-col items-center gap-4 pt-10 pb-6">
              <button className="flex min-w-[84px] w-full max-w-xs cursor-pointer items-center justify-center rounded-full h-12 px-6 bg-[#913e27] text-white text-base font-medium shadow-[0_4px_14px_0_rgba(143,62,39,0.3)] transition-colors hover:bg-[#a1553d] disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed" disabled={!selectedFile} onClick={startAnalysis}>
                <span className="material-symbols-outlined mr-2">auto_awesome</span>Analyze My Hand
              </button>
              <div className="flex gap-4 text-sm">
                {onGallery && <button onClick={onGallery} className="text-primary hover:underline">Browse Gallery</button>}
                {onArtists && onGallery && <span className="text-[#2B1810]/30">•</span>}
                {onArtists && <button onClick={onArtists} className="text-primary hover:underline">Meet Our Artists</button>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  // --- RENDER STEP 2: ANALYSIS (Streamlined with Skip Option) ---
  if (step === GeneratorStep.ANALYSIS) {
    return (
      <div className="px-4 sm:px-8 md:px-20 lg:px-40 flex flex-1 justify-center items-center py-10 animate-fadeIn min-h-screen">
        <div className="flex flex-col w-full max-w-[960px] flex-1">
          {/* Progress Bar */}
          <div className="flex justify-center gap-2 mb-8">{[1, 2, 3, 4].map((num) => (<div key={num} className={`h-2 w-12 rounded-full transition-all ${num <= 2 ? 'bg-primary' : 'bg-gray-200'}`} />))}</div>
          
          <div className="flex flex-col lg:flex-row bg-[#fff8f2] dark:bg-[#2b1810] rounded-2xl shadow-xl overflow-hidden border border-[#e4d7d3] dark:border-primary/20">
            {/* Image Preview */}
            <div className="w-full lg:w-2/5 p-6 flex flex-col justify-center items-center bg-gradient-to-br from-[#fbf9f9] to-[#f3e0d5] dark:from-[#211815] dark:to-[#2b1810]">
              <div className="w-full max-w-[200px] aspect-[3/4] flex-shrink-0 rounded-xl overflow-hidden shadow-lg">
                {previewUrl && <img src={previewUrl} alt="Your hand" className="w-full h-full object-cover" />}
              </div>
              <p className="text-sm text-[#2B1810]/60 mt-4 text-center">Your uploaded image</p>
            </div>
            
            {/* Analysis Content */}
            <div className="w-full lg:w-3/5 p-6 md:p-8 flex flex-col justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-[#191210] dark:text-white text-lg font-medium">Analyzing your hand...</p>
                  <p className="text-[#2B1810]/60 text-sm">Finding optimal mehendi placement</p>
                </div>
              ) : analysis ? (
                <div className="flex flex-col animate-fadeIn">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-full"><span className="material-symbols-outlined text-green-600">check_circle</span></div>
                    <h2 className="text-[#191210] dark:text-white text-2xl font-bold">Analysis Complete</h2>
                  </div>
                  
                  {/* Compact Analysis Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { label: 'Coverage', value: analysis.coverage, icon: 'layers' },
                      { label: 'Key Feature', value: analysis.keyFeature, icon: 'star' },
                      { label: 'Finger Shape', value: analysis.fingerShape, icon: 'pan_tool' },
                      { label: 'Wrist Area', value: analysis.wristArea, icon: 'watch' },
                    ].map((item) => (
                      <div key={item.label} className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined text-primary text-sm">{item.icon}</span>
                          <p className="text-[#8d6458] dark:text-primary/80 text-xs font-medium">{item.label}</p>
                        </div>
                        <p className="text-[#191210] dark:text-white text-sm font-medium line-clamp-2">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={() => setStep(GeneratorStep.OUTFIT_SELECTION)} className="flex-1 flex items-center justify-center gap-2 rounded-full bg-primary text-white font-medium px-6 py-3 shadow-md hover:bg-primary/90 transition-colors">
                      <span>Continue to Outfit Wizard</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                    <button onClick={() => setStep(GeneratorStep.STYLE_SELECTION)} className="flex items-center justify-center gap-2 rounded-full border-2 border-primary/30 text-primary font-medium px-6 py-3 hover:bg-primary/5 transition-colors">
                      <span>Skip to Designs</span>
                      <span className="material-symbols-outlined text-sm">skip_next</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER STEP 3: OUTFIT SELECTION (Polished UI) ---
  if (step === GeneratorStep.OUTFIT_SELECTION) {
    const outfitTypes = [
      { name: 'Traditional Lehenga', icon: '👗', desc: 'Classic bridal wear' },
      { name: 'Modern Gown', icon: '✨', desc: 'Contemporary elegance' },
      { name: 'Saree', icon: '🌸', desc: 'Timeless grace' },
      { name: 'Sharara', icon: '💫', desc: 'Festive charm' },
      { name: 'Anarkali', icon: '🌺', desc: 'Royal flair' },
      { name: 'Western', icon: '👠', desc: 'Modern fusion' },
    ];

    return (
      <div className="relative flex min-h-screen w-full flex-col items-center py-8 px-4 sm:px-6 lg:px-8 animate-fadeIn">
        <div className="w-full max-w-5xl">
          {/* Header with Progress */}
          <div className="mb-8">
            <button onClick={() => setStep(GeneratorStep.ANALYSIS)} className="text-[#2B1810]/50 hover:text-primary flex items-center gap-1 mb-4 transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span className="text-sm">Back</span>
            </button>
            <div className="flex justify-center gap-2 mb-4">{[1, 2, 3, 4].map((num) => (<div key={num} className={`h-2 w-12 rounded-full transition-all ${num <= 3 ? 'bg-primary' : 'bg-gray-200'}`} />))}</div>
            <div className="text-center">
              <h1 className="text-[#2B1810] dark:text-white text-3xl sm:text-4xl font-bold font-headline">Match Your Outfit</h1>
              <p className="text-[#2B1810]/60 dark:text-gray-400 mt-2">Help us create a design that complements your look</p>
            </div>
          </div>

          <div className="bg-[#FFF8F2] dark:bg-[#2B1810] rounded-2xl p-6 sm:p-8 shadow-lg border border-[#F3E0D5] dark:border-primary/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Outfit Upload & Type */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-[#2B1810] dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">upload</span>
                    Upload Your Outfit (Optional)
                  </h3>
                  <div className={`relative rounded-xl border-2 border-dashed p-6 transition-all ${isDragging || isLoading ? 'border-primary bg-primary/5' : 'border-[#F3E0D5] dark:border-[#3f2d26] hover:border-primary/50'}`} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onOutfitDrop}>
                    {isLoading ? (
                      <div className="flex flex-col items-center py-4">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-primary font-medium">Analyzing outfit...</p>
                      </div>
                    ) : outfitPreviewUrl ? (
                      <div className="flex items-center gap-4">
                        <img src={outfitPreviewUrl} alt="Outfit" className="w-20 h-20 object-cover rounded-lg" />
                        <div className="flex-1">
                          <p className="font-medium text-[#2B1810] dark:text-white">{outfitFile?.name}</p>
                          <p className="text-sm text-green-600 flex items-center gap-1 mt-1"><span className="material-symbols-outlined text-sm">check</span>Analyzed</p>
                        </div>
                        <button onClick={() => { setOutfitFile(null); setOutfitPreviewUrl(null); }} className="p-2 hover:bg-red-50 rounded-full text-red-500"><span className="material-symbols-outlined">close</span></button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center cursor-pointer" onClick={() => outfitInputRef.current?.click()}>
                        <span className="material-symbols-outlined text-3xl text-[#2B1810]/30 mb-2">add_photo_alternate</span>
                        <p className="text-[#2B1810]/60 text-sm">Drop image or click to upload</p>
                      </div>
                    )}
                    <input type="file" ref={outfitInputRef} className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleOutfitFile(file); }} />
                  </div>
                </div>

                <div>
                  <h3 className="text-[#2B1810] dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">checkroom</span>
                    Outfit Type
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {outfitTypes.map(type => (
                      <button key={type.name} onClick={() => setOutfitType(type.name)} className={`p-4 rounded-xl text-left transition-all ${outfitType === type.name ? 'bg-primary text-white shadow-md scale-[1.02]' : 'bg-white/50 dark:bg-black/20 hover:bg-primary/10 border border-transparent hover:border-primary/20'}`}>
                        <span className="text-2xl mb-2 block">{type.icon}</span>
                        <p className={`font-medium text-sm ${outfitType === type.name ? 'text-white' : 'text-[#2B1810] dark:text-white'}`}>{type.name}</p>
                        <p className={`text-xs mt-0.5 ${outfitType === type.name ? 'text-white/80' : 'text-[#2B1810]/50 dark:text-gray-400'}`}>{type.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Colors & Tags */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-[#2B1810] dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">palette</span>
                    Outfit Colors
                    <span className="text-xs font-normal text-[#2B1810]/50 ml-auto">Select up to 4</span>
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {DEFAULT_PALETTE.map(color => (
                      <button key={color} onClick={() => toggleColor(color)} className={`h-12 w-12 rounded-xl transition-all shadow-sm ${outfitColors.includes(color) ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'hover:scale-105'}`} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  {outfitColors.length > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm text-[#2B1810]/60">Selected:</span>
                      <div className="flex gap-1">{outfitColors.map(c => <div key={c} className="h-6 w-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c }} />)}</div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-[#2B1810] dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">sell</span>
                    Style Keywords
                    <span className="text-xs font-normal text-[#2B1810]/50 ml-auto">Select up to 4</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {STYLE_KEYWORDS.map(tag => (
                      <button key={tag} onClick={() => toggleTag(tag)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${outfitTags.includes(tag) ? 'bg-primary text-white shadow-md' : 'bg-white/70 dark:bg-black/20 text-[#2B1810] dark:text-gray-200 hover:bg-primary/10 border border-[#F3E0D5] dark:border-[#3f2d26]'}`}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary Card */}
                {(outfitType || outfitColors.length > 0 || outfitTags.length > 0) && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                    <h4 className="font-bold text-[#2B1810] dark:text-white mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                      Your Style Profile
                    </h4>
                    <div className="space-y-2 text-sm">
                      {outfitType && <p className="text-[#2B1810]/80 dark:text-gray-300"><span className="font-medium">Outfit:</span> {outfitType}</p>}
                      {outfitColors.length > 0 && <div className="flex items-center gap-2"><span className="font-medium text-[#2B1810]/80 dark:text-gray-300">Colors:</span><div className="flex gap-1">{outfitColors.map(c => <div key={c} className="h-4 w-4 rounded-full" style={{ backgroundColor: c }} />)}</div></div>}
                      {outfitTags.length > 0 && <p className="text-[#2B1810]/80 dark:text-gray-300"><span className="font-medium">Style:</span> {outfitTags.join(', ')}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => setStep(GeneratorStep.STYLE_SELECTION)} className="flex items-center justify-center gap-2 rounded-full bg-primary text-white font-bold px-8 py-4 shadow-lg hover:bg-primary/90 transition-all">
                <span>Find Matching Designs</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <button onClick={() => setStep(GeneratorStep.STYLE_SELECTION)} className="flex items-center justify-center gap-2 rounded-full border-2 border-[#2B1810]/20 text-[#2B1810]/60 font-medium px-6 py-4 hover:bg-[#2B1810]/5 transition-all">
                Skip this step
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  // --- RENDER STEP 4: STYLE SELECTION (With Approved Templates) ---
  if (step === GeneratorStep.STYLE_SELECTION) {
    return (
      <div className="relative flex min-h-screen w-full flex-col items-center py-8 px-4 sm:px-6 md:px-8 animate-fadeIn" style={{backgroundColor: '#FFF8F2'}}>
        <div className="w-full max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <button onClick={() => setStep(GeneratorStep.OUTFIT_SELECTION)} className="text-[#2B1810]/50 hover:text-primary flex items-center gap-1 mb-4 transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span className="text-sm">Back to Outfit Wizard</span>
            </button>
            <div className="flex justify-center gap-2 mb-4">{[1, 2, 3, 4].map((num) => (<div key={num} className={`h-2 w-12 rounded-full transition-all ${num <= 4 ? 'bg-primary' : 'bg-gray-200'}`} />))}</div>
            <div className="text-center">
              <h1 className="text-[#2B1810] text-3xl sm:text-4xl font-bold font-headline">Choose Your Design Style</h1>
              <p className="text-[#2B1810]/60 mt-2">Select a style to preview on your hand</p>
            </div>
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-black/50 z-50 flex flex-col items-center justify-center">
              <div className="bg-white p-8 rounded-2xl flex flex-col items-center shadow-2xl">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <h3 className="text-xl font-bold text-primary">Creating Your Design</h3>
                <p className="text-gray-500 mt-2 text-center max-w-xs">Applying {selectedStyle?.name || 'your selected'} style...</p>
              </div>
            </div>
          )}

          {/* Toggle between Styles and Community Templates */}
          {approvedTemplates.length > 0 && (
            <div className="flex justify-center mb-6">
              <div className="inline-flex rounded-full bg-white shadow-sm border border-[#F3E0D5] p-1">
                <button onClick={() => setShowTemplates(false)} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${!showTemplates ? 'bg-primary text-white' : 'text-[#2B1810]/60 hover:text-primary'}`}>
                  Design Styles ({styles.length})
                </button>
                <button onClick={() => setShowTemplates(true)} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${showTemplates ? 'bg-primary text-white' : 'text-[#2B1810]/60 hover:text-primary'}`}>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    Community Favorites ({approvedTemplates.length})
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Styles Grid */}
          {!showTemplates ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {styles.map((style) => (
                <div key={style.id} className={`relative flex flex-col rounded-2xl border-2 overflow-hidden shadow-sm transition-all hover:shadow-lg bg-white group ${selectedStyle?.id === style.id ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/30'}`}>
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img src={style.imageUrl} alt={style.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <button onClick={(e) => handleRegenerateStyle(e, style)} className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white text-primary transition-all shadow-sm opacity-0 group-hover:opacity-100" title="Generate unique AI preview" disabled={regeneratingStyleId === style.id}>
                      <span className={`material-symbols-outlined text-lg ${regeneratingStyleId === style.id ? 'animate-spin' : ''}`}>{regeneratingStyleId === style.id ? 'sync' : 'auto_awesome'}</span>
                    </button>
                    {/* Category Badge */}
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                      <span className="text-white text-xs font-medium">{style.category}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-[#2B1810] mb-1">{style.name}</h3>
                    <p className="text-xs text-[#2B1810]/60 line-clamp-2 mb-3">{style.description}</p>
                    <button onClick={() => generateDesign(style)} className="w-full py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-sm">brush</span>
                      Preview on My Hand
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Approved Templates Grid */
            <div>
              <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 rounded-xl mb-6">
                <p className="text-[#2B1810] flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">verified</span>
                  <span className="font-medium">Community Favorites</span>
                  <span className="text-[#2B1810]/60">— Designs loved and approved by our community</span>
                </p>
              </div>
              
              {approvedTemplates.length === 0 ? (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-6xl text-[#2B1810]/20 mb-4">image</span>
                  <p className="text-[#2B1810]/50">No community templates available yet</p>
                  <button onClick={() => setShowTemplates(false)} className="mt-4 text-primary hover:underline">Browse design styles instead</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {approvedTemplates.map((template) => (
                    <div key={template.id} className="relative flex flex-col rounded-2xl border-2 border-transparent overflow-hidden shadow-sm transition-all hover:shadow-lg hover:border-primary/30 bg-white group">
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <img src={template.generatedImageUrl} alt={template.style?.name || 'Design'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {/* Rating Badge */}
                        {template.userRating && (
                          <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-400/90 backdrop-blur-sm rounded-full flex items-center gap-1">
                            <span className="material-symbols-outlined text-white text-xs">star</span>
                            <span className="text-white text-xs font-bold">{template.userRating}</span>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 p-1.5 bg-green-500 rounded-full">
                          <span className="material-symbols-outlined text-white text-sm">verified</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-[#2B1810] mb-1">{template.style?.name || 'Custom Design'}</h3>
                        <p className="text-xs text-[#2B1810]/60 mb-3">
                          {template.user?.name ? `By ${template.user.name}` : 'Community Design'}
                        </p>
                        <button onClick={() => {
                          if (template.style) {
                            const matchingStyle = styles.find(s => s.id === template.style?.id);
                            if (matchingStyle) generateDesign(matchingStyle);
                            else alert('Style not available. Please try another design.');
                          }
                        }} className="w-full py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-sm">brush</span>
                          Try This Style
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- RENDER STEP 5: RESULT ---
  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-start py-8 px-4 animate-fadeIn">
      <div className="w-full max-w-4xl bg-white dark:bg-background-dark/50 rounded-3xl shadow-2xl overflow-hidden min-h-[600px] flex flex-col relative border border-primary/10">
        
        <div className="w-full bg-background-light dark:bg-background-dark border-b border-primary/10 p-6 flex justify-between items-center">
          <button onClick={() => setStep(GeneratorStep.STYLE_SELECTION)} className="text-primary font-bold flex items-center gap-2 hover:opacity-70 transition-opacity">
            <span className="material-symbols-outlined">arrow_back</span>
            Back
          </button>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((num) => (<div key={num} className="h-2 w-10 rounded-full bg-primary" />))}
          </div>
        </div>

        <div className="flex-1 p-8 flex flex-col items-center justify-center w-full">
          {step === GeneratorStep.RESULT && generatedImage && (
            <div className="flex flex-col items-center gap-6 w-full animate-fadeIn">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-full mb-2">
                  <span className="material-symbols-outlined text-primary text-4xl">check_circle</span>
                </div>
                <h1 className="text-[#2B1810] dark:text-white text-4xl font-bold font-headline">Your Bespoke Design!</h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">Ready to bring your bridal vision to life?</p>
              </div>

              <div className="relative w-full max-w-sm aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl group border border-primary/10">
                <img src={generatedImage} alt="Generated Design" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <a href={generatedImage} download="henna-design.png" className="bg-white text-primary p-3 rounded-full hover:scale-110 transition-transform" title="Download">
                    <span className="material-symbols-outlined">download</span>
                  </a>
                  <button className="bg-white text-primary p-3 rounded-full hover:scale-110 transition-transform" onClick={() => setStep(GeneratorStep.STYLE_SELECTION)} title="Try another style">
                    <span className="material-symbols-outlined">replay</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full max-w-sm mt-4">
                <button onClick={onBookClick} className="w-full py-4 rounded-full font-bold bg-primary text-white shadow-lg hover:bg-[#a15842] transition-all transform hover:scale-105">
                  Book a Consultation
                </button>
                <button onClick={onViewSaved} className="w-full py-4 rounded-full font-bold border-2 border-accent-gold text-[#2B1810] dark:text-white hover:bg-accent-gold/10 transition-all">
                  View Saved Designs
                </button>
                
                <button onClick={saveDesign} disabled={isSaved} className={`w-full py-2 rounded-full font-medium text-sm transition-all flex items-center justify-center gap-2 ${isSaved ? 'text-green-600 cursor-default' : 'text-primary hover:text-primary/70'}`}>
                  {isSaved ? (<><span className="material-symbols-outlined text-lg">check</span>Added to Collection</>) : (<><span className="material-symbols-outlined text-lg">bookmark_add</span>Add to Collection</>)}
                </button>
              </div>
              
              <div className="w-full max-w-sm border-t border-primary/10 my-4 pt-4 text-center">
                <p className="text-sm font-medium text-gray-500 mb-4">Share Your Design</p>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => {
                      if (navigator.share && generatedImage) {
                        navigator.share({
                          title: 'My Henna Design',
                          text: `Check out my ${selectedStyle?.name || 'custom'} henna design!`,
                          url: window.location.href
                        }).catch(() => {});
                      } else {
                        alert('Sharing is not supported on this device');
                      }
                    }}
                    className="p-3 rounded-full bg-primary/5 hover:bg-primary/10 text-primary transition-colors"
                    title="Share"
                  >
                    <span className="material-symbols-outlined">share</span>
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href).then(() => {
                        alert('Link copied to clipboard!');
                      }).catch(() => {
                        alert('Failed to copy link');
                      });
                    }}
                    className="p-3 rounded-full bg-primary/5 hover:bg-primary/10 text-primary transition-colors"
                    title="Copy Link"
                  >
                    <span className="material-symbols-outlined">link</span>
                  </button>
                  <button 
                    onClick={() => {
                      const subject = encodeURIComponent('Check out my Henna Design!');
                      const body = encodeURIComponent(`I created this beautiful ${selectedStyle?.name || 'custom'} henna design. Take a look!`);
                      window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
                    }}
                    className="p-3 rounded-full bg-primary/5 hover:bg-primary/10 text-primary transition-colors"
                    title="Email"
                  >
                    <span className="material-symbols-outlined">mail</span>
                  </button>
                  <button 
                    onClick={saveDesign}
                    disabled={isSaved}
                    className={`p-3 rounded-full transition-colors ${isSaved ? 'bg-red-100 text-red-500' : 'bg-primary/5 hover:bg-primary/10 text-primary'}`}
                    title={isSaved ? 'Saved!' : 'Save to Favorites'}
                  >
                    <span className="material-symbols-outlined">{isSaved ? 'favorite' : 'favorite_border'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignFlow;
