import React, { useState, useRef, useEffect } from 'react';
import { GeneratorStep, HennaStyle, HandAnalysis } from '../types';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { analyzeHandImage, generateHennaDesign, analyzeOutfitImage, generateStyleThumbnail } from '../services/geminiService';

interface DesignFlowProps {
  onBack: () => void;
  onViewSaved: () => void;
  onBookConsultation: (designName?: string) => void;
  onGallery?: () => void;
  onArtists?: () => void;
}

const DEFAULT_PALETTE = ['#f3e0d5', '#8f3e27', '#ffecb3', '#f8f6f6', '#d32f2f', '#c2185b'];
const STYLE_KEYWORDS = ['Embroidered', 'Minimalist', 'Floral', 'Heavy', 'Geometric'];

const DesignFlow: React.FC<DesignFlowProps> = ({ onBack, onViewSaved, onBookConsultation, onGallery, onArtists }) => {
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState<GeneratorStep>(GeneratorStep.UPLOAD);
  
  // Hand Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<HandAnalysis | null>(null);
  
  // Outfit Wizard State
  const [outfitFile, setOutfitFile] = useState<File | null>(null);
  const [outfitType, setOutfitType] = useState<string>('Modern Gown');
  const [outfitColors, setOutfitColors] = useState<string[]>(['#f3e0d5', '#d32f2f']);
  const [outfitTags, setOutfitTags] = useState<string[]>(['Embroidered', 'Geometric']);
  
  // Generation State
  const [styles, setStyles] = useState<HennaStyle[]>([]);
  const [regeneratingStyleId, setRegeneratingStyleId] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<HennaStyle | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const outfitInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadStyles();
  }, []);

  const loadStyles = async () => {
    try {
      const data = await api.getStyles();
      setStyles(data);
    } catch {
      // Fallback styles if API fails
      setStyles(FALLBACK_STYLES);
    }
  };


const FALLBACK_STYLES: HennaStyle[] = [
  {
    id: 'regal-bloom',
    name: 'Regal Bloom',
    description: 'Intricate floral and paisley mehndi design suitable for grand occasions.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxAJLz5irj-Bjns_y5dVhmq1L-mydTwGUOkSg2ySegnF3bo-fzHfk7YV9qd2s9U-97xeos90F9JxS4D3SP-gKIpxgQfc5VMYWv5QqcAdPLanxAglR6zTW-o-k5Av2OwWqLQbb-xP2bj-JuOWjFiiTCx6KmyDTt530DPEIzX7QNpPl1JhGjGKBSNCtX6CaUq2O8a7-zBhhUIDQa81T3cZUjATp4T5XCkGYhiDF9pfi6b4s6sesCRmtsyjYQsUtL9j0hmdldsP506w',
    promptModifier: 'regal bloom style, intricate floral and paisley mehndi design, highly detailed, traditional, heavy coverage',
    category: 'Traditional',
    complexity: 'High',
    coverage: 'Full',
  },
  {
    id: 'modern-vine',
    name: 'Modern Vine',
    description: 'A contemporary vine-like pattern trailing elegantly up the hand.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuWPAch47zv4IVC5CsrXCORQ1o3VujEzTFKZU6ZI_ga_ExLDvxN1NTWYK0NMA2Leq10lSa2dEAJrlb2m7GkjCXMHQFMZNAvmu_7Rdwx-ZHeA_1Ulsj7aP2dnHssGvQ11Q-jskHUIJoCV2nVaxnXZVeCOQUuPVh34cQyVCOo7Ujv-tUPyQIYeg79pnd3XetnOEyimc9Ymh90gi2ngR_ObW6oT_fZNRSKiiqHZazrWYKeEbLUgEs1YJQ03aCnXHkNzhJqhE9pZux6Q',
    promptModifier: 'modern vine style, trailing vine-like mehndi pattern, elegant curves, leaves, contemporary, flowing',
    category: 'Modern',
    complexity: 'Medium',
    coverage: 'Partial',
  },
  {
    id: 'royal-mandala',
    name: 'Royal Mandala',
    description: 'A grand, symmetrical mandala centerpiece for a majestic look.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkxyS7fIYgO3GbES7nKGKMNIA5ErhQoqLRooM1OpSUbL-hdZ-Q-W1x02saTGQrMkWNRJRQdQU-UK5l2tVR51m7_9X9S-bRYvKtZVxwHvl7v3Tt859ktY-iAiabCrakKUbPDN0R4uXdHyxON91-zmicTVfBc9n9Z6PiGNYIqGd-PZ80JLmjqWR6Bm75t6iUP3y5hMuBeJN6pz0SsVI_NWcLugoNhUfNhy8vFaEwYKqeqTyB1_o9B6IqhZdHcUNHKnNn71CJLuxC_A',
    promptModifier: 'royal mandala style, grand mandala design, center hand, symmetrical, circular patterns, detailed petals',
    category: 'Traditional',
    complexity: 'High',
    coverage: 'Full',
  },
  {
    id: 'delicate-flora',
    name: 'Delicate Flora',
    description: 'Minimalist floral touches focusing on fingers and wrist.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMiq0nDG6lC6dGMBBMmxWXXeKROdSEhTNK45foL4Y-8whY6v1qwdbmLOHzVaAtNFqEzmI_jFPdAGRZBmBr7W7oonpED8FyQeTnMMWi9jraFgxArcf4Jzc8Fb2c4F-V_aaMl8a-O5i7x-EVVVNnDKWh4oF-nN2gi7x4EBK1bgZmoKhHzOY-p73dyDvqdlrlEunoMb3f8NtPdUbMjOFqMXLTKBLLqer02HGOLrH_a0f45tsvoiLT4jMHcETMHDZxLkWnQC77kp1YNw',
    promptModifier: 'delicate flora style, minimalist floral mehndi design, fingers and wrist focus, simple, elegant, light coverage',
    category: 'Minimalist',
    complexity: 'Low',
    coverage: 'Minimal',
  },
];

  // --- Hand Upload Logic ---
  const handleFile = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleFile(file);
        e.dataTransfer.clearData();
      }
    }
  };


  // --- Outfit Upload Logic ---
  const handleOutfitFile = async (file: File) => {
    setOutfitFile(file);
    setIsLoading(true);
    try {
      const base64 = await convertToBase64(file);
      const analysis = await analyzeOutfitImage(base64);
      setOutfitType(analysis.outfitType);
      setOutfitColors(analysis.dominantColors);
      setOutfitTags(analysis.styleKeywords);
    } catch (e) {
      console.error("Outfit analysis failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  const onOutfitDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleOutfitFile(file);
        e.dataTransfer.clearData();
      }
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let encoded = reader.result as string;
        encoded = encoded.split(',')[1];
        resolve(encoded);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // --- Actions ---
  const startAnalysis = async () => {
    if (!selectedFile) return;
    setStep(GeneratorStep.ANALYSIS);
    setIsLoading(true);
    try {
      const base64 = await convertToBase64(selectedFile);
      const result = await analyzeHandImage(base64);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
      setAnalysis({
        skinTone: "Detected",
        handShape: "Classic",
        coverage: "Optimal for full coverage",
        keyFeature: "Unique finger length",
        fingerShape: "Highlights elegant structure",
        wristArea: "Ideal for intricate wrist work",
        recommendedStyles: ["Arabic", "Mandala"]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleColor = (color: string) => {
    if (outfitColors.includes(color)) {
      setOutfitColors(outfitColors.filter(c => c !== color));
    } else if (outfitColors.length < 3) {
      setOutfitColors([...outfitColors, color]);
    }
  };

  const toggleTag = (tag: string) => {
    if (outfitTags.includes(tag)) {
      setOutfitTags(outfitTags.filter(t => t !== tag));
    } else if (outfitTags.length < 3) {
      setOutfitTags([...outfitTags, tag]);
    }
  };

  const handleRegenerateStyle = async (e: React.MouseEvent, style: HennaStyle) => {
    e.stopPropagation();
    setRegeneratingStyleId(style.id);
    try {
      const newImageUrl = await generateStyleThumbnail(style.name, style.description);
      setStyles(prev => prev.map(s => s.id === style.id ? { ...s, imageUrl: newImageUrl } : s));
    } catch (error) {
      console.error("Failed to regenerate style", error);
    } finally {
      setRegeneratingStyleId(null);
    }
  };

  const generateDesign = async (styleOverride?: HennaStyle) => {
    const styleToUse = styleOverride || selectedStyle;
    if (!styleToUse || !selectedFile) return;
    
    if (styleOverride) setSelectedStyle(styleOverride);
    setIsLoading(true);
    
    try {
      const base64 = await convertToBase64(selectedFile);
      const outfitContext = `${outfitType} style in ${outfitColors.join(', ')} colors, featuring ${outfitTags.join(', ')} elements`;
      const resultImage = await generateHennaDesign(base64, styleToUse.promptModifier, outfitContext);
      setGeneratedImage(resultImage);
      setIsSaved(false);
      setStep(GeneratorStep.RESULT);
    } catch (error: any) {
      console.error(error);
      const msg = error?.message || '';
      if (msg.includes('429') || msg.includes('quota') || msg.includes('rate')) {
        alert("API rate limit reached. Please wait 30 seconds and try again.");
      } else {
        alert("Something went wrong generating the design. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };


  const saveDesign = async () => {
    if (!generatedImage || !selectedStyle) return;

    try {
      // Always use localStorage for simplicity
      const newDesign = {
        id: Date.now().toString(),
        imageUrl: generatedImage,
        styleName: selectedStyle.name,
        date: new Date().toLocaleDateString(),
        analysis: analysis || undefined,
        outfitContext: `${outfitType} - ${outfitColors.join(', ')} - ${outfitTags.join(', ')}`
      };
      const existingSaved = localStorage.getItem('henna_saved_designs');
      const savedDesigns = existingSaved ? JSON.parse(existingSaved) : [];
      savedDesigns.push(newDesign);
      localStorage.setItem('henna_saved_designs', JSON.stringify(savedDesigns));
      setIsSaved(true);
    } catch (e) {
      console.error("Failed to save design", e);
      alert("Unable to save design.");
    }
  };

  const onBookClick = () => {
    if (selectedStyle) {
      onBookConsultation(selectedStyle.name);
    } else {
      onBookConsultation();
    }
  };

  // --- RENDER STEP 1: UPLOAD ---
  if (step === GeneratorStep.UPLOAD) {
    return (
      <div className="relative flex min-h-[80vh] w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8 animate-fadeIn">
        {/* Breadcrumb Navigation */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button onClick={onBack} className="text-[#2B1810]/50 hover:text-[#913e27] flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="font-medium">Back to Home</span>
          </button>
          <div className="hidden md:flex items-center gap-2 text-sm text-[#2B1810]/50">
            <span>Home</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-medium">Design Studio</span>
          </div>
        </div>

        <div className="w-full max-w-4xl rounded-xl bg-[#FFF8F2] p-8 sm:p-12 lg:p-16 shadow-lg border border-[#F3E0D5]">
          <div className="flex flex-col max-w-[960px] flex-1 mx-auto">
            {/* Progress Indicator */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className={`h-2 w-12 rounded-full transition-all ${num === 1 ? 'bg-primary' : 'bg-gray-200'}`} />
              ))}
            </div>

            <h1 className="text-[#2B1810] text-[32px] font-bold text-center pb-3 pt-6 font-headline">
              Step 1: Upload Your Hand
            </h1>
            
            <div className="flex flex-col p-4 mt-6">
              <div 
                className={`flex flex-col items-center gap-6 rounded-xl border-2 border-dashed px-6 py-14 transition-all duration-300 cursor-pointer 
                  ${isDragging ? 'border-[#913e27] bg-[#913e27]/5' : 'border-[#F3E0D5] hover:bg-[#F3E0D5]/20'}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <div className="relative w-full max-w-[240px] aspect-[3/4] group">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg shadow-md" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setPreviewUrl(null); }}
                      className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">close</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-4xl text-[#2B1810] opacity-50">upload_file</span>
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-[#2B1810] text-lg font-medium text-center">Drag & Drop Your Hand Image Here</p>
                      <p className="text-[#2B1810] text-sm text-center opacity-70">or Click to Upload</p>
                    </div>
                  </>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
            </div>

            <div className="w-full flex flex-col items-center gap-4 pt-12 pb-6">
              <button 
                className="flex min-w-[84px] w-full max-w-xs cursor-pointer items-center justify-center rounded-full h-12 px-6 bg-[#913e27] text-white text-base font-medium shadow-[0_4px_14px_0_rgba(143,62,39,0.3)] transition-colors hover:bg-[#a1553d] disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed" 
                disabled={!selectedFile}
                onClick={startAnalysis}
              >
                Next: AI Analysis
              </button>
              <div className="flex gap-4 text-sm">
                {onGallery && (
                  <button onClick={onGallery} className="text-primary hover:underline">
                    Browse Gallery for Inspiration
                  </button>
                )}
                {onArtists && (
                  <span className="text-[#2B1810]/30">•</span>
                )}
                {onArtists && (
                  <button onClick={onArtists} className="text-primary hover:underline">
                    Meet Our Artists
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  // --- RENDER STEP 2: ANALYSIS ---
  if (step === GeneratorStep.ANALYSIS) {
    return (
      <div className="px-4 sm:px-8 md:px-20 lg:px-40 flex flex-1 justify-center items-center py-10 animate-fadeIn min-h-screen">
        <div className="flex flex-col w-full max-w-[960px] flex-1">
          <div className="flex flex-col lg:flex-row bg-[#fff8f2] dark:bg-[#2b1810] rounded-lg shadow-lg overflow-hidden border border-[#e4d7d3] dark:border-primary/20">
            <div className="w-full lg:w-1/2 p-6 md:p-8 flex flex-col justify-center items-center bg-[#fbf9f9] dark:bg-[#211815]">
              <div className="w-full max-w-sm aspect-[2/3] flex-shrink-0">
                {previewUrl && (
                  <div className="w-full h-full bg-center bg-no-repeat bg-cover rounded-lg flex-1 shadow-md border border-[#e4d7d3]" 
                    style={{backgroundImage: `url("${previewUrl}")`}}></div>
                )}
              </div>
            </div>
            <div className="w-full lg:w-1/2 p-6 md:p-10 flex flex-col justify-center">
              {isLoading ? (
                <div className="flex flex-col gap-4 text-center">
                  <p className="text-[#191210] dark:text-background-light text-base font-medium">
                    Analyzing your hand for optimal mehndi placement...
                  </p>
                  <div className="rounded-full bg-[#e4d7d3] dark:bg-primary/20 overflow-hidden">
                    <div className="h-2 rounded-full bg-primary w-full animate-pulse"></div>
                  </div>
                </div>
              ) : analysis ? (
                <div className="flex flex-col mt-4 animate-fadeIn">
                  <h2 className="text-[#191210] dark:text-background-light text-[28px] font-bold text-center pb-2">Analysis Complete!</h2>
                  <p className="text-[#191210] dark:text-gray-300 text-base pb-6 text-center">Ready to explore designs?</p>
                  <div className="border-t border-solid border-t-[#e4d7d3] dark:border-primary/30">
                    <div className="grid grid-cols-1 sm:grid-cols-2">
                      <div className="flex flex-col gap-1 py-4 pr-2 border-b sm:border-b-0 sm:border-r border-solid border-[#e4d7d3] dark:border-primary/30">
                        <p className="text-[#8d6458] dark:text-primary/80 text-sm">Coverage</p>
                        <p className="text-[#191210] dark:text-background-light text-sm font-medium">{analysis.coverage}</p>
                      </div>
                      <div className="flex flex-col gap-1 py-4 sm:pl-4">
                        <p className="text-[#8d6458] dark:text-primary/80 text-sm">Key Feature</p>
                        <p className="text-[#191210] dark:text-background-light text-sm font-medium">{analysis.keyFeature}</p>
                      </div>
                      <div className="flex flex-col gap-1 pt-4 pr-2 border-t border-solid sm:border-r border-[#e4d7d3] dark:border-primary/30">
                        <p className="text-[#8d6458] dark:text-primary/80 text-sm">Finger Shape</p>
                        <p className="text-[#191210] dark:text-background-light text-sm font-medium">{analysis.fingerShape}</p>
                      </div>
                      <div className="flex flex-col gap-1 pt-4 sm:pl-4 border-t border-solid border-[#e4d7d3] dark:border-primary/30">
                        <p className="text-[#8d6458] dark:text-primary/80 text-sm">Wrist Area</p>
                        <p className="text-[#191210] dark:text-background-light text-sm font-medium">{analysis.wristArea}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-center">
                    <button 
                      onClick={() => setStep(GeneratorStep.OUTFIT_SELECTION)}
                      className="flex items-center justify-center gap-2 rounded-full bg-primary text-white text-base font-medium px-8 py-3 shadow-md hover:bg-opacity-90 transition-colors"
                    >
                      <span>Next: Outfit Style Wizard</span>
                      <span className="material-symbols-outlined">arrow_forward</span>
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


  // --- RENDER STEP 3: OUTFIT SELECTION ---
  if (step === GeneratorStep.OUTFIT_SELECTION) {
    return (
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8 animate-fadeIn">
        <div className="w-full max-w-5xl rounded-lg bg-[#FFF8F2] dark:bg-[#2B1810] p-6 sm:p-8 md:p-12 shadow-lg border border-[#F3E0D5] dark:border-primary/20">
          <div className="mb-8">
            <div className="flex gap-6 justify-between"><p className="text-sm font-medium text-[#2B1810] dark:text-gray-300">Step 3 of 4</p></div>
            <div className="mt-2 rounded-full bg-[#F3E0D5] dark:bg-[#3f2d26]"><div className="h-2 rounded-full bg-primary" style={{width: '75%'}}></div></div>
          </div>
          
          <div className="text-center mb-10">
            <h1 className="text-[#2B1810] dark:text-white text-3xl sm:text-4xl font-bold pb-2 font-headline">Outfit Style Wizard</h1>
            <p className="text-[#2B1810] dark:text-gray-300 text-base max-w-md mx-auto">Tell us about your outfit to perfectly match your mehndi.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="flex flex-col gap-6">
              <h3 className="text-[#2B1810] dark:text-white text-lg font-bold">Upload or Select Your Outfit Style</h3>
              
              <div 
                className={`flex flex-col items-center gap-6 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all cursor-pointer ${isDragging || isLoading ? 'border-primary bg-primary/5' : 'border-[#F3E0D5] dark:border-[#3f2d26] hover:bg-[#F3E0D5]/20'}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onOutfitDrop}
              >
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-primary font-medium">Analyzing Outfit...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-[#2B1810] dark:text-white text-lg font-bold">
                      {outfitFile ? outfitFile.name : "Drag & drop an image or click to upload"}
                    </p>
                    <button 
                      onClick={() => outfitInputRef.current?.click()}
                      className="rounded-full h-10 px-6 bg-[#f1ebe9] dark:bg-[#3f2d26] text-[#2B1810] dark:text-white text-sm font-bold hover:bg-[#F3E0D5] transition-colors"
                    >
                      Upload Photo
                    </button>
                    <input type="file" ref={outfitInputRef} className="hidden" accept="image/*" 
                      onChange={(e) => { const file = e.target.files?.[0]; if (file) handleOutfitFile(file); }} />
                  </>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: 'Traditional Lehenga', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjopQaeinro1ob4pvA42ha5qMmo-QGnUuWRU2AByLOsW43jekX9Zyn1tqRCFQGh8X_zOyqOo5Zt6yh13FpqDcCzJrFOtZj-5Ola5CqQKquO2MJoXOunzZWUsKuo17KrQn_UnwR4a27N90qTZ5DnaXYlvZj9s6f9_ynAC2hhoTQtDQNFDeFKXa6fdbsaj0eyYXKLmlBbbi2-z_JYoa0UPS8RQ0Ti5GNyb5mIGGLaJjJL_08PTVL8FRPs4qd1QksZfSzDZtFh71SHg' },
                  { name: 'Modern Gown', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwpfZ5_oZw3rSAhPuoGbF0yMVgfUeBn5vDYr4yo_BC3LMHdGdgeqUvqpgEwHJGrSch6oEZ_C1aNhSIpY4Nr19SBwpW9OZjlf5O0LAMO8iIcUINKJZIVc4hX6pAPZsCfZ5pkdu2BsSMk7a-G1CtnOMfRrZMve65AGd_VszIl0wRW1ddKB9CIckJigu_3Gc0pZc8x9yt_ytNF3Nsa7-KmFLg6yOIzBUCrfP2IbVkkoAdUOnZGpcAqvKOU79KDMkzJPrLZosLLFO5vA' },
                  { name: 'Saree', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyNcepaWyrdAsYlZaLEtsu00NkR8xVp0UPxzLMyD7P3lgJGp0naP7T4kYuoJvN5lGweqtto9L7ubCaslyBm8RkmiIDMNCvxGdt8ugkanaNslQJWS1hZRxfygaBASdaUpemP4lFcFE2_k21LU3N7LdkxthaMlTY_V3t6J_BZ3JwFMI6c5I83sjijux44gbepJotIqoisCVh6OzUSSJ1uFCOqJmWA9sskp7BbuAJ1iw_dO6SSjgldrpH8hxktUibJG5DmYvevoQ6yw' }
                ].map(type => (
                  <div 
                    key={type.name}
                    onClick={() => setOutfitType(type.name)}
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-lg border text-center cursor-pointer transition-all ${outfitType === type.name ? 'border-primary bg-primary/10 shadow-md' : 'border-[#F3E0D5] dark:border-[#3f2d26] bg-white/50 dark:bg-black/20 hover:bg-[#F3E0D5] dark:hover:bg-[#3f2d26]'}`}
                  >
                    <img alt={type.name} className="h-16 w-16 object-contain" src={type.img}/>
                    <p className={`text-sm font-medium ${outfitType === type.name ? 'text-primary' : 'text-[#2B1810] dark:text-gray-200'}`}>{type.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-[#2B1810] dark:text-white text-lg font-bold mb-3">Dominant Colors</h3>
                <div className="flex flex-wrap gap-3">
                  {DEFAULT_PALETTE.map(color => (
                    <button 
                      key={color}
                      onClick={() => toggleColor(color)}
                      className={`h-10 w-10 rounded-full border-2 transition-all ${outfitColors.includes(color) ? 'border-transparent ring-2 ring-primary ring-offset-2 scale-110' : 'border-transparent hover:ring-2 hover:ring-primary/50'}`}
                      style={{ backgroundColor: color }}
                    ></button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-[#2B1810] dark:text-white text-lg font-bold mb-3">Describe the Style</h3>
                <div className="flex flex-wrap gap-3">
                  {STYLE_KEYWORDS.map(tag => (
                    <button 
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full px-4 py-2 text-sm font-medium border-2 transition-colors ${outfitTags.includes(tag) ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-white border-primary' : 'bg-[#F3E0D5] dark:bg-[#3f2d26] text-[#2B1810] dark:text-gray-200 border-transparent hover:bg-primary/20'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-2">
                <h3 className="text-[#2B1810] dark:text-white text-lg font-bold mb-3">Your Style Summary</h3>
                <div className="p-4 rounded-lg bg-[#F3E0D5]/50 dark:bg-[#3f2d26]/50 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm text-[#2B1810] dark:text-gray-200">
                    <span className="material-symbols-outlined text-base">style</span>
                    <span className="font-medium">Outfit Type:</span>
                    <span>{outfitType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#2B1810] dark:text-gray-200">
                    <span className="material-symbols-outlined text-base">palette</span>
                    <span className="font-medium">Colors:</span>
                    <div className="flex gap-1.5 ml-1">
                      {outfitColors.map(c => (
                        <div key={c} className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: c }}></div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#2B1810] dark:text-gray-200">
                    <span className="material-symbols-outlined text-base">sell</span>
                    <span className="font-medium">Tags:</span>
                    <span>{outfitTags.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <button 
              onClick={() => setStep(GeneratorStep.STYLE_SELECTION)}
              className="flex min-w-[84px] w-full sm:w-auto cursor-pointer items-center justify-center rounded-full h-12 px-8 bg-primary text-white text-base font-bold shadow-primary-soft hover:bg-primary/90 transition-all"
            >
              Next: Matching Designs
            </button>
          </div>
        </div>
      </div>
    );
  }


  // --- RENDER STEP 4: STYLE SELECTION ---
  if (step === GeneratorStep.STYLE_SELECTION) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 md:p-8 animate-fadeIn" style={{backgroundColor: '#FFF8F2'}}>
        <div className="flex h-full w-full max-w-5xl grow flex-col">
          <div className="flex flex-1 flex-col items-center justify-center py-5">
            <div className="flex w-full flex-1 flex-col items-center">
              <button 
                onClick={() => setStep(GeneratorStep.OUTFIT_SELECTION)} 
                className="self-start mb-4 text-[#2B1810]/50 hover:text-[#913e27] flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Back
              </button>
              
              <h1 className="text-[#2B1810] text-center text-[32px] font-bold px-4 pb-3 pt-6">
                Discover bespoke mehndi designs perfectly matched to your style.
              </h1>
              
              {isLoading && (
                <div className="fixed inset-0 bg-black/50 z-50 flex flex-col items-center justify-center">
                  <div className="bg-white p-8 rounded-2xl flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <h3 className="text-xl font-bold text-primary">Creating Your Masterpiece</h3>
                    <p className="text-gray-500 mt-2 text-center max-w-xs">
                      Applying {selectedStyle?.name} style to your hand...
                    </p>
                  </div>
                </div>
              )}

              <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 p-4">
                {styles.map((style) => (
                  <div 
                    key={style.id}
                    className={`relative flex flex-col gap-4 rounded-xl border p-3 shadow-sm transition-all hover:shadow-md hover:border-primary/30 bg-white/50
                      ${selectedStyle?.id === style.id ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'}`}
                  >
                    <div 
                      className="bg-cover bg-center rounded-lg aspect-[3/4] relative" 
                      style={{backgroundImage: `url("${style.imageUrl}")`}}
                    >
                      <button 
                        onClick={(e) => handleRegenerateStyle(e, style)}
                        className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white text-primary transition-all shadow-sm z-10"
                        title="Generate unique AI preview"
                        disabled={regeneratingStyleId === style.id}
                      >
                        <span className={`material-symbols-outlined text-lg ${regeneratingStyleId === style.id ? 'animate-spin' : ''}`}>
                          {regeneratingStyleId === style.id ? 'sync' : 'auto_awesome'}
                        </span>
                      </button>
                    </div>
                    <div className="flex flex-col items-start gap-3">
                      <p className="text-base font-bold text-[#2B1810]">{style.name}</p>
                      <button 
                        onClick={() => generateDesign(style)}
                        className="flex w-full cursor-pointer items-center justify-center rounded-full h-10 px-4 bg-primary text-sm font-bold text-[#fbf9f9] transition-colors hover:bg-primary/90"
                      >
                        Preview on My Hand
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
            {[GeneratorStep.UPLOAD, GeneratorStep.ANALYSIS, GeneratorStep.OUTFIT_SELECTION, GeneratorStep.STYLE_SELECTION, GeneratorStep.RESULT].map((s, idx) => {
              const stepOrder = [GeneratorStep.UPLOAD, GeneratorStep.ANALYSIS, GeneratorStep.OUTFIT_SELECTION, GeneratorStep.STYLE_SELECTION, GeneratorStep.RESULT];
              const currentIndex = stepOrder.indexOf(step);
              const isCompleted = idx <= currentIndex;
              return <div key={s} className={`h-2 w-10 rounded-full transition-all duration-500 ${isCompleted ? 'bg-primary' : 'bg-gray-200'}`} />;
            })}
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
                <button 
                  onClick={onBookClick}
                  className="w-full py-4 rounded-full font-bold bg-primary text-white shadow-lg hover:bg-[#a15842] transition-all transform hover:scale-105"
                >
                  Book a Consultation
                </button>
                <button 
                  onClick={onViewSaved}
                  className="w-full py-4 rounded-full font-bold border-2 border-accent-gold text-[#2B1810] dark:text-white hover:bg-accent-gold/10 transition-all"
                >
                  View Saved Designs
                </button>
                
                <button 
                  onClick={saveDesign}
                  disabled={isSaved}
                  className={`w-full py-2 rounded-full font-medium text-sm transition-all flex items-center justify-center gap-2
                    ${isSaved ? 'text-green-600 cursor-default' : 'text-primary hover:text-primary/70'}`}
                >
                  {isSaved ? (
                    <>
                      <span className="material-symbols-outlined text-lg">check</span>
                      Added to Collection
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">bookmark_add</span>
                      Add to Collection
                    </>
                  )}
                </button>
              </div>
              
              <div className="w-full max-w-sm border-t border-primary/10 my-4 pt-4 text-center">
                <p className="text-sm font-medium text-gray-500 mb-4">Share Your Design</p>
                <div className="flex justify-center gap-4">
                  {['share', 'link', 'mail', 'favorite'].map(icon => (
                    <button key={icon} className="p-3 rounded-full bg-primary/5 hover:bg-primary/10 text-primary transition-colors">
                      <span className="material-symbols-outlined">{icon}</span>
                    </button>
                  ))}
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
