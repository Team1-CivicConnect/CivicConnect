import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationPicker from '../components/map/LocationPicker';
import api from '../services/api';
import toast from 'react-hot-toast';
import { MapPin, CheckCircle, ArrowRight, ArrowLeft, Image as ImageIcon, FileText, UploadCloud, ShieldAlert } from 'lucide-react';

const CATEGORIES = [
    { id: 'pothole', icon: '🕳️', label: 'Road Pothole', desc: 'Asphalt fractures, sinkholes.' },
    { id: 'street_light', icon: '💡', label: 'Lighting Issue', desc: 'Broken bulbs, exposed wiring.' },
    { id: 'garbage', icon: '🗑️', label: 'Waste Violation', desc: 'Illegal dumping, biohazards.' },
    { id: 'water_leak', icon: '💧', label: 'Pipeline Fracture', desc: 'Main bursts, flooding.' },
    { id: 'fallen_tree', icon: '🌳', label: 'Fallen Tree', desc: 'Road blockages, hazard zones.' },
    { id: 'other', icon: '🌀', label: 'Uncategorized', desc: 'Anomalies outside primary scope.' },
];

export default function ReportPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [legalAgreed, setLegalAgreed] = useState(false);

    const [formData, setFormData] = useState({
        title: '', description: '', category: '', lat: null, lng: null, files: [], address: ''
    });

    // 1. SILENT AUTO-SAVE TO LOCALSTORAGE
    useEffect(() => {
        const savedDraft = localStorage.getItem('ubayog_report_draft');
        if (savedDraft) {
            try {
                const draftData = JSON.parse(savedDraft);
                setFormData(p => ({ ...p, ...draftData }));
            } catch (e) { }
        }
    }, []);

    useEffect(() => {
        const draftToSave = {
            title: formData.title, description: formData.description, category: formData.category,
            lat: formData.lat, lng: formData.lng, address: formData.address
        };
        localStorage.setItem('ubayog_report_draft', JSON.stringify(draftToSave));
    }, [formData.title, formData.description, formData.category, formData.lat, formData.lng, formData.address]);

    const handleNext = () => setStep(s => s + 1);
    const handlePrev = () => setStep(s => s - 1);

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        if (newFiles.length + formData.files.length > 5) return toast.error("Maximum 5 blocks allowed.");
        setFormData(prev => ({ ...prev, files: [...prev.files, ...newFiles] }));
    };

    const removeFile = (idx) => setFormData(p => ({ ...p, files: p.files.filter((_, i) => i !== idx) }));
    const setPosition = (coords) => setFormData(p => ({ ...p, lat: coords[0], lng: coords[1] }));
    const setAddress = (addr) => setFormData(p => ({ ...p, address: addr }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.category) return toast.error("Classification index required.");
        if (!legalAgreed) return toast.error("Legal compliance signature required to push to network.");
        setLoading(true);
        try {
            const payload = new FormData();
            payload.append('title', formData.title);
            payload.append('description', formData.description);
            payload.append('category', formData.category);
            if (formData.lat && formData.lng) {
                payload.append('lat', formData.lat); payload.append('lng', formData.lng);
                payload.append('address', formData.address || 'Geo-Targeted Region');
            }
            formData.files.forEach(f => payload.append('photos', f));

            const { data } = await api.post('/issues', payload, { headers: { 'Content-Type': 'multipart/form-data' } });

            // Clear drafts on perfect commit
            localStorage.removeItem('ubayog_report_draft');
            toast.success("Anomaly officially committed!");
            navigate(`/issue/${data.issue._id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || "Transmission failed.");
        } finally {
            setLoading(false);
        }
    };

    const stepsUI = [
        { id: 1, title: 'Location Details', icon: MapPin },
        { id: 2, title: 'Report Details', icon: FileText },
        { id: 3, title: 'Review & Submit', icon: ShieldAlert },
    ];

    return (
        <div className="bg-zinc-50 min-h-[calc(100vh-64px)] py-12 px-4 md:px-8 relative flex justify-center items-start overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

            <div className="w-full max-w-5xl bg-white border border-gray-100 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10 flex flex-col md:flex-row overflow-hidden min-h-[700px]">

                {/* Lateral Workflow Sidebar */}
                <div className="w-full md:w-1/3 bg-[#0A0F1C] text-white p-10 relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-ub-blue-hero blur-[120px] mix-blend-screen opacity-20 -translate-y-1/2 -translate-x-1/2 rounded-full"></div>

                    <div className="relative z-10 mb-16">
                        <div className="inline-block bg-white/10 border border-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-ub-green-medium mb-3">Citizen Portal</div>
                        <h2 className="text-3xl font-black tracking-tighter leading-tight">Report an <br /><span className="text-gray-400">Issue.</span></h2>
                    </div>

                    <div className="relative z-10 flex flex-col gap-8 flex-1">
                        {stepsUI.map((s, index) => {
                            const isActive = step === s.id;
                            const isPast = step > s.id;
                            return (
                                <div key={s.id} className="flex gap-4 relative">
                                    {index !== stepsUI.length - 1 && (
                                        <div className={`absolute top-10 left-[19px] bottom-[-20px] w-0.5 ${isPast ? 'bg-ub-green-medium' : 'bg-white/10'}`}></div>
                                    )}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10 transition-all duration-500 shadow-md ${isActive ? 'bg-ub-blue-hero border-none shadow-[0_0_20px_rgba(27,63,160,0.5)] scale-110' :
                                        isPast ? 'bg-ub-green-medium border-none text-white' : 'bg-white/5 border border-white/10 text-gray-500'
                                        }`}>
                                        {isPast ? <CheckCircle size={18} /> : <s.icon size={18} />}
                                    </div>
                                    <div className={`pt-2 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Step 0{s.id}</div>
                                        <div className="text-sm font-black tracking-wide text-white">{s.title}</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Primary Interaction Pane */}
                <div className="w-full md:w-2/3 p-8 md:p-12 bg-white relative flex flex-col">

                    {/* Phase 1: Locational Logic */}
                    {step === 1 && (
                        <div className="animate-fadeIn h-full flex flex-col">
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Select Location</h3>
                                    <p className="text-gray-500 font-medium text-sm">Drop a pin exactly where the issue is located.</p>
                                </div>
                                {formData.address && <div className="hidden md:block text-[9px] font-black uppercase text-ub-green-medium tracking-widest border border-green-200 bg-green-50 px-3 py-1.5 rounded-lg">Draft Activated</div>}
                            </div>

                            <div className="flex-1 space-y-6">
                                <div className="border border-gray-200 rounded-[24px] overflow-hidden shadow-sm p-1.5 bg-gray-50 h-[300px]">
                                    {/* Component updated with Auto GPS lock */}
                                    <LocationPicker position={formData.lat ? [formData.lat, formData.lng] : null} setPosition={setPosition} setAddress={setAddress} />
                                </div>
                                {formData.address && (
                                    <div className="bg-blue-50 border border-blue-100 text-ub-blue-hero p-4 rounded-xl text-sm flex items-start gap-3 font-bold animate-fadeIn shadow-sm">
                                        <MapPin size={20} className="mt-0.5 shrink-0" /> <span>{formData.address}</span>
                                    </div>
                                )}

                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Add Photos (Max 5)</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <label className="border-2 border-dashed border-gray-300 rounded-[20px] aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-ub-blue-hero transition-all group bg-white shadow-sm overflow-hidden relative">
                                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                                            <UploadCloud size={24} className="text-gray-400 group-hover:text-ub-blue-hero mb-2 transition-colors" />
                                            <span className="text-[10px] font-black text-gray-400 group-hover:text-ub-blue-hero uppercase tracking-widest">Select File</span>
                                        </label>
                                        {formData.files.map((file, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-[20px] overflow-hidden shadow-md group border border-gray-200 bg-black">
                                                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                                                <button onClick={(e) => { e.preventDefault(); removeFile(idx); }} className="absolute m-2 top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-black shadow-lg hover:bg-red-600 hover:scale-110 transition-all z-20">×</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 flex justify-end mt-auto">
                                <button onClick={handleNext} disabled={!formData.lat} className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all flex items-center gap-2 disabled:opacity-50">
                                    Next Step <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Phase 2: Metadata Assembly */}
                    {step === 2 && (
                        <div className="animate-fadeIn h-full flex flex-col">
                            <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Report Details</h3>
                            <p className="text-gray-500 font-medium text-sm mb-8">Provide clear information so we can process your request faster.</p>

                            <div className="flex-1 space-y-6">
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <input
                                            maxLength="100" placeholder=" "
                                            className="block px-5 pb-3 pt-6 w-full text-sm font-bold text-gray-900 bg-white border-2 border-gray-200 rounded-xl appearance-none focus:outline-none focus:border-ub-blue-hero peer shadow-sm transition-colors"
                                            value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                                        />
                                        <label className="absolute text-[10px] font-black tracking-widest text-gray-400 uppercase duration-300 transform -translate-y-2.5 scale-75 top-4 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-ub-blue-hero">Issue Title</label>
                                        <div className="absolute top-4 right-5 text-[9px] font-black text-gray-300">{formData.title.length}/100</div>
                                    </div>

                                    <div className="relative group">
                                        <textarea
                                            maxLength="800" rows="4" placeholder=" "
                                            className="block px-5 pb-3 pt-6 w-full text-sm font-bold text-gray-900 bg-white border-2 border-gray-200 rounded-xl appearance-none focus:outline-none focus:border-ub-blue-hero peer shadow-sm transition-colors resize-none"
                                            value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                        />
                                        <label className="absolute text-[10px] font-black tracking-widest text-gray-400 uppercase duration-300 transform -translate-y-2.5 scale-75 top-4 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-ub-blue-hero">Detailed Description</label>
                                        <div className="absolute top-4 right-5 text-[9px] font-black text-gray-300">{formData.description.length}/800</div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Select Category</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {CATEGORIES.map(cat => (
                                            <div key={cat.id} onClick={() => setFormData(p => ({ ...p, category: cat.id }))}
                                                className={`border-2 rounded-xl p-4 flex items-start gap-4 cursor-pointer transition-all shadow-sm select-none group 
                                                    ${formData.category === cat.id ? 'border-ub-blue-hero bg-blue-50/50' : 'border-gray-100 hover:border-gray-300 bg-white'}`}
                                            >
                                                <div className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</div>
                                                <div>
                                                    <div className={`text-xs font-black tracking-wide uppercase ${formData.category === cat.id ? 'text-ub-blue-hero' : 'text-gray-900'}`}>{cat.label}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 leading-tight mt-0.5">{cat.desc}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 flex justify-between mt-auto">
                                <button onClick={handlePrev} className="text-gray-500 hover:text-gray-900 px-6 py-4 font-black uppercase tracking-widest text-[11px] transition-colors flex items-center gap-2">
                                    <ArrowLeft size={16} /> Back
                                </button>
                                <button onClick={handleNext} disabled={!formData.title || !formData.description || !formData.category} className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all flex items-center gap-2 disabled:opacity-50">
                                    Review Report <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Phase 3: Commiting Node (Review & Legal) */}
                    {step === 3 && (
                        <div className="animate-fadeIn h-full flex flex-col">
                            <div className="mb-4">
                                <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Final Review</h3>
                                <p className="text-gray-500 font-medium text-sm">Review your report details closely before submitting.</p>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-2">
                                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200 space-y-6">
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 border-b border-gray-200 pb-1">Issue Title & Description</div>
                                        <div className="font-black text-gray-900 text-xl tracking-tight leading-snug pt-1">{formData.title}</div>
                                        <div className="text-sm font-medium text-gray-600 mt-2 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">{formData.description}</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Category</div>
                                            <div className="font-black text-ub-blue-hero uppercase tracking-wide flex items-center gap-2 text-[11px]">
                                                {CATEGORIES.find(c => c.id === formData.category)?.icon} {CATEGORIES.find(c => c.id === formData.category)?.label}
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Attached Photos</div>
                                            <div className="font-black text-gray-900 text-[11px] flex items-center gap-2"><ImageIcon size={14} className="text-gray-400" /> {formData.files.length} Block(s) Appended</div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 flex justify-between">
                                            <span>Location Details</span>
                                            <span className="text-ub-blue-hero">VERIFIED</span>
                                        </div>
                                        {/* Beautiful Read-Only Mini-Map rendering exactly where they dropped the pin */}
                                        <div className="h-[140px] rounded-xl overflow-hidden shadow-sm border-2 border-gray-200 pointer-events-none mb-2">
                                            <LocationPicker position={[formData.lat, formData.lng]} readOnly={true} />
                                        </div>
                                        <div className="text-[11px] font-bold text-gray-700 bg-white px-3 py-2 rounded-lg border border-gray-100 shadow-sm overflow-hidden text-ellipsis whitespace-nowrap">
                                            {formData.address || `LAT: ${formData.lat.toFixed(4)} | LNG: ${formData.lng.toFixed(4)}`}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Corporate Legal Checkbox */}
                            <div className="mt-4 mb-4">
                                <label className="flex items-start gap-3 cursor-pointer group bg-blue-50/50 p-4 border border-blue-100 rounded-xl transition-colors hover:bg-blue-50">
                                    <div className="relative flex items-center mt-0.5">
                                        <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-ub-blue-hero/40 rounded bg-white checked:bg-ub-blue-hero checked:border-ub-blue-hero transition-all"
                                            checked={legalAgreed} onChange={(e) => setLegalAgreed(e.target.checked)} />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity text-white">
                                            <CheckCircle size={14} />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-black text-gray-900 uppercase tracking-wide">Declaration</div>
                                        <div className="text-[10.5px] font-semibold text-gray-500 leading-tight mt-0.5">I confirm that all provided details and photos are accurate and true.</div>
                                    </div>
                                </label>
                            </div>

                            <div className="pt-4 flex justify-between mt-auto border-t border-gray-100">
                                <button onClick={handlePrev} className="text-gray-500 hover:text-gray-900 px-6 py-4 font-black uppercase tracking-widest text-[11px] transition-colors flex items-center gap-2">
                                    <ArrowLeft size={16} /> Back
                                </button>
                                <button onClick={handleSubmit} disabled={loading || !legalAgreed} className="bg-gradient-to-r from-[#21C55D] to-[#2E7D32] hover:scale-105 active:scale-95 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-[0_15px_30px_rgba(46,125,50,0.3)] transition-all flex items-center gap-3 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none">
                                    {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <>Submit Report <CheckCircle size={18} /></>}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
