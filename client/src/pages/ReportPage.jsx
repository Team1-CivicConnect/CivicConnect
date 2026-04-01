import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationPicker from '../components/map/LocationPicker';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Camera, MapPin, Sparkles, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const CATEGORIES = [
    { id: 'pothole', icon: '🕳️', label: 'Road Pothole' },
    { id: 'street_light', icon: '💡', label: 'Lighting Issue' },
    { id: 'garbage', icon: '🗑️', label: 'Waste Violation' },
    { id: 'water_leak', icon: '💧', label: 'Pipeline Fracture' },
    { id: 'fallen_tree', icon: '🌳', label: 'Fallen Tree' },
    { id: 'other', icon: '🌀', label: 'Uncategorized' },
];

export default function ReportPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '', description: '', category: '', lat: null, lng: null, files: [], address: ''
    });
    const [aiSuggestion, setAiSuggestion] = useState(null);

    const handleNext = () => setStep(s => s + 1);
    const handlePrev = () => setStep(s => s - 1);

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        if (newFiles.length + formData.files.length > 5) return toast.error("Maximum 5 photos allowed");
        setFormData(prev => ({ ...prev, files: [...prev.files, ...newFiles] }));
    };

    const removeFile = (idx) => setFormData(p => ({ ...p, files: p.files.filter((_, i) => i !== idx) }));
    const setPosition = (coords) => setFormData(p => ({ ...p, lat: coords[0], lng: coords[1] }));
    const setAddress = (addr) => setFormData(p => ({ ...p, address: addr }));

    const handleAiSuggest = async () => {
        if (!formData.title || !formData.description) return toast.error("Please fill title and description first");
        setAiLoading(true);
        try {
            const { data } = await api.post('/ai/categorize', { title: formData.title, description: formData.description });
            setAiSuggestion(data);
            if (data.category && CATEGORIES.find(c => c.id === data.category)) {
                setFormData(p => ({ ...p, category: data.category }));
                toast.success(`AI classified this incident as ${data.category.replace('_', ' ')}`);
            }
        } catch (err) {
            toast.error("DeepVerify Engine Offline. Proceed manually.");
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.category) return toast.error("Select an anomaly classification");
        setLoading(true);
        try {
            const payload = new FormData();
            payload.append('title', formData.title);
            payload.append('description', formData.description);
            payload.append('category', formData.category);
            if (formData.lat && formData.lng) {
                payload.append('lat', formData.lat); payload.append('lng', formData.lng);
                payload.append('address', formData.address || 'Address not captured');
            }
            formData.files.forEach(f => payload.append('photos', f));

            const { data } = await api.post('/issues', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success("Anomaly submitted to Municipal Network!");
            navigate(`/issue/${data.issue._id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || "Transmission failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-12 px-4 md:px-8 relative overflow-hidden flex flex-col items-center">
            {/* Abstract Grid BG */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-multiply pointer-events-none"></div>

            <div className="max-w-3xl w-full mx-auto relative z-10 glass bg-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] border border-white overflow-hidden">

                {/* Dynamic Header */}
                <div className="bg-gradient-to-r from-ub-blue-dark to-ub-blue-hero px-8 py-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mt-10 -mr-10 animate-pulse"></div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 relative z-10">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">+{step}</div>
                        Incident Registration
                    </h1>
                    <p className="text-blue-100 text-sm font-medium mt-1 relative z-10">Log structural anomalies directly into the Ubayog grid.</p>
                </div>

                {/* Stepper Bar */}
                <div className="bg-gray-100 h-1.5 w-full overflow-hidden flex">
                    <div className="h-full bg-gradient-to-r from-ub-green-medium to-green-400 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(46,125,50,0.8)]" style={{ width: `${(step / 3) * 100}%` }}></div>
                </div>

                <div className="p-8 md:p-10">

                    {/* STEP 1: GEO & EVIDENCE */}
                    {step === 1 && (
                        <div className="space-y-8 animate-fadeIn">
                            <div>
                                <h2 className="text-lg font-black text-gray-900 mb-1">Geographic Targeting</h2>
                                <p className="text-sm font-semibold text-gray-500 mb-4">Drop a precise GPS coordinate constraint.</p>
                                <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm p-1 bg-white">
                                    <LocationPicker position={formData.lat ? [formData.lat, formData.lng] : null} setPosition={setPosition} setAddress={setAddress} />
                                </div>
                                {formData.address && (
                                    <div className="bg-ub-blue-hero/5 border border-ub-blue-hero/20 text-ub-blue-hero p-3.5 rounded-xl mt-3 text-sm flex items-start gap-2.5 font-bold animate-fadeIn">
                                        <MapPin size={18} className="mt-0.5 shrink-0" /> <span>{formData.address}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h2 className="text-lg font-black text-gray-900 mb-1">Photographic Evidence</h2>
                                <p className="text-sm font-semibold text-gray-500 mb-4">Attach up to 5 validation layers (max 5MB each).</p>

                                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 hover:border-ub-blue-hero transition-colors bg-white shadow-sm group cursor-pointer relative">
                                    <input type="file" id="photos" multiple accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileChange} />
                                    <div className="w-14 h-14 bg-blue-50 text-ub-blue-hero border border-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                                        <Camera size={26} />
                                    </div>
                                    <span className="font-black text-gray-900 block mb-1">Select from local storage</span>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">JPEG • PNG • WEBP</span>
                                </div>

                                {formData.files.length > 0 && (
                                    <div className="flex gap-4 mt-5 overflow-x-auto pb-2 custom-scrollbar">
                                        {formData.files.map((file, idx) => (
                                            <div key={idx} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden shadow-md group border border-gray-200">
                                                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                <button onClick={(e) => { e.preventDefault(); removeFile(idx); }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-black shadow-lg border-2 border-white hover:bg-red-600 transition-colors z-20">×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button onClick={handleNext} disabled={!formData.lat} className="btn-primary flex items-center gap-2 !px-8 !py-3.5 shadow-lg shadow-blue-500/20 disabled:opacity-50">
                                    Next Phase <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: METADATA & AI */}
                    {step === 2 && (
                        <div className="space-y-8 animate-fadeIn">

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                                <div>
                                    <h2 className="text-lg font-black text-gray-900 mb-1">Report Semantics</h2>
                                    <p className="text-sm font-semibold text-gray-500">Provide textual context for municipal routing.</p>
                                </div>
                                <button onClick={handleAiSuggest} disabled={aiLoading} className="bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm">
                                    <Sparkles size={16} /> {aiLoading ? 'Verifying...' : 'DeepVerify Classification'}
                                </button>
                            </div>

                            {aiSuggestion && (
                                <div className="bg-gradient-to-r from-purple-50 to-white border border-purple-200 p-5 rounded-2xl text-sm shadow-sm animate-fadeIn relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-24 h-24 bg-purple-200 blur-2xl rounded-full opacity-50 -mr-10 -mt-10 pointer-events-none"></div>
                                    <div className="font-black text-purple-900 mb-2 uppercase tracking-widest text-[10px] flex items-center gap-1.5"><Sparkles size={14} className="text-purple-600" /> DeepVerify Node Result</div>
                                    <div className="text-purple-900 font-medium mb-2 text-base">
                                        Classified as <span className="font-black bg-purple-100 px-2 py-0.5 rounded capitalize">{aiSuggestion.category}</span> issue.
                                        <br />System priority matrix set to: <span className="font-black uppercase tracking-wider text-purple-700">{aiSuggestion.priority}</span> <span className="text-xs text-purple-400 font-bold">({aiSuggestion.priorityScore}/100)</span>
                                    </div>
                                    <div className="text-purple-700/80 italic font-semibold text-xs border-l-2 border-purple-300 pl-3 leading-relaxed">"{aiSuggestion.reasoning}"</div>
                                </div>
                            )}

                            <div className="space-y-5">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Incident Designation</label>
                                    <input
                                        maxLength="150" placeholder="E.g. Large sinkhole intersection formation"
                                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-ub-blue-hero focus:outline-none font-bold text-gray-900 bg-white shadow-sm transition-colors text-sm"
                                        value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Contextual Description</label>
                                    <textarea
                                        maxLength="1000" rows="3" placeholder="Provide municipal context..."
                                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-ub-blue-hero focus:outline-none resize-none font-semibold text-gray-700 bg-white shadow-sm transition-colors text-sm"
                                        value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1 block mb-3">Classification Index</label>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                        {CATEGORIES.map(cat => (
                                            <div key={cat.id} onClick={() => setFormData(p => ({ ...p, category: cat.id }))}
                                                className={`border-2 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all shadow-sm select-none ${formData.category === cat.id
                                                    ? 'border-ub-blue-hero bg-blue-50/50 text-ub-blue-hero'
                                                    : 'border-gray-100 hover:border-gray-300 bg-white hover:bg-gray-50'
                                                    }`}
                                            >
                                                <span className="text-3xl mb-2 drop-shadow-sm">{cat.icon}</span>
                                                <span className="text-xs font-black tracking-wide text-center uppercase">{cat.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={handlePrev} className="btn-secondary w-1/3 !py-3.5 flex justify-center !text-sm"><ArrowLeft size={18} className="mr-1" /> Revert</button>
                                <button onClick={handleNext} disabled={!formData.title || !formData.description || !formData.category} className="btn-primary w-2/3 !py-3.5 flex justify-center shadow-lg shadow-blue-500/20 disabled:opacity-50 !text-sm">
                                    Inspect Matrix <ArrowRight size={18} className="ml-1" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: REVIEW */}
                    {step === 3 && (
                        <div className="space-y-8 animate-fadeIn">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-ub-green-dark text-white rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-green-500/30 scale-105">
                                    <CheckCircle size={40} />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">System Ready to Commit</h2>
                                <p className="text-sm font-semibold text-gray-500 mt-2">The architecture is prepared. Verify metadata before final push.</p>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-inner grid gap-5">
                                <div>
                                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1.5 border-b border-gray-200 pb-1">Primary Designation</div>
                                    <div className="font-bold text-gray-900 text-lg leading-snug">{formData.title}</div>
                                    <div className="text-sm font-medium text-gray-600 mt-1">{formData.description}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-6 bg-white p-4 rounded-xl border border-gray-100">
                                    <div>
                                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Route Class</div>
                                        <div className="font-black text-ub-blue-hero uppercase tracking-wide flex items-center gap-1.5 text-xs">
                                            {CATEGORIES.find(c => c.id === formData.category)?.icon} {CATEGORIES.find(c => c.id === formData.category)?.label}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Attachments</div>
                                        <div className="font-black text-gray-900 text-sm">{formData.files.length} Block(s)</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 border-b border-gray-200 pb-1">Geographic Coordinates</div>
                                    <div className="text-sm font-bold text-gray-800 flex items-start gap-2 pt-1"><MapPin size={16} className="text-ub-blue-hero shrink-0 mt-0.5" /> {formData.address || `LAT: ${formData.lat.toFixed(4)}, LNG: ${formData.lng.toFixed(4)}`}</div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={handlePrev} className="btn-secondary w-1/3 !py-4 flex justify-center !border-gray-300 font-bold bg-white shadow-sm !text-sm"><ArrowLeft size={18} className="mr-1" /> Edit</button>
                                <button onClick={handleSubmit} disabled={loading} className="w-2/3 bg-gray-900 text-white !py-4 rounded-xl flex justify-center items-center shadow-xl hover:bg-black transition-all font-black uppercase tracking-wider !text-sm disabled:opacity-70">
                                    {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Commit Transaction'}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
