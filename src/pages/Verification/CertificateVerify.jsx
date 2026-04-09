import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, AlertCircle, Loader2, ArrowLeft, FileText, 
  BadgeCheck, GraduationCap, Calendar, User, Hash, Fingerprint, QrCode
} from 'lucide-react';
import axios from '../../api/axios';

const CertificateVerify = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [inputtedId, setInputtedId] = useState("");

  const isLookupMode = !certificateId || certificateId === 'lookup';

  const verifyCertificate = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/verification/verify/${id}`);
      if (response.data && response.data.valid) {
        setData(response.data.data); 
      } else {
        setError(response.data?.message || "Verification failed.");
      }
    } catch (err) {
      setData(null);
      const errorMsg = err.response?.data?.detail || "Certificate record not found.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certificateId && certificateId !== 'lookup') {
      verifyCertificate(certificateId);
    }
  }, [certificateId]);

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (inputtedId.trim()) navigate(`/verify/${inputtedId.trim()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#1e40af] animate-spin mb-4" />
        <p className="text-slate-500 font-medium text-xs tracking-widest uppercase">Verifying...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 print:p-0 print:bg-white font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-container { 
            box-shadow: none !important; 
            border: 1px solid #e2e8f0 !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 500px !important;
            border-radius: 12px !important;
            position: relative;
          }
          .watermark {
            display: block !important;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 60px;
            color: rgba(0,0,0,0.03);
            font-weight: bold;
            z-index: 0;
            pointer-events: none;
            white-space: nowrap;
          }
        }
      `}} />

      <div className="bg-white shadow-xl rounded-xl max-w-lg w-full overflow-hidden border border-slate-200 print-container relative">
        <div className="watermark hidden">OFFICIAL VERIFICATION</div>
        
        {/* Header - Home click action and cursor-pointer removed */}
        <div className="bg-[#1e40af] bg-gradient-to-r from-[#1e40af] to-[#1e3a8a] text-white py-4 px-6 text-center relative">
          <img 
            src="https://www.gbu.ac.in/Content/img/logo_gbu.png" 
            alt="GBU Logo" 
            className="w-14 h-14 mx-auto bg-white rounded-full p-1 mb-2 shadow-lg select-none"
          />
          <h1 className="text-lg font-bold uppercase tracking-tight leading-tight">Gautam Buddha University</h1>
          <p className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest opacity-90">Verification Transcript</p>
        </div>

        <div className="p-6 relative z-10">
          {isLookupMode ? (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-800">Verify Document</h2>
                <p className="text-slate-500 text-xs">Enter the unique Certificate ID below</p>
              </div>

              <form onSubmit={handleManualSearch} className="space-y-3">
                <div className="relative">
                  <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text"
                    placeholder="GBU-ND-XXXX-XXXX"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={inputtedId}
                    onChange={(e) => setInputtedId(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-[#1e40af] hover:bg-blue-800 text-white rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2">
                  <BadgeCheck className="w-4 h-4" /> Verify
                </button>
              </form>
            </div>
          ) : (
            <>
              {data && !error ? (
                <div className="animate-in fade-in duration-500">
                  <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 p-2 rounded-full">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-800 leading-none">Authenticity Verified</h2>
                        <p className="text-emerald-600 text-[10px] font-bold uppercase mt-1">Status: Valid Document</p>
                      </div>
                    </div>
                    {/* QR Code Placeholder for printed authenticity */}
                    <div className="hidden print:block text-slate-300">
                        <QrCode size={40} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-y-0.5 bg-slate-50/80 p-4 rounded-lg border border-slate-100 mb-4 backdrop-blur-sm">
                    <InfoRow label="Certificate No" value={data.certificate_number} isMono isBlue />
                    <InfoRow label="App Ref" value={data.application_ref} isMono />
                    <InfoRow label="Student Name" value={data.student_name} isBold />
                    <InfoRow label="Enrollment No" value={data.enrollment_number} />
                    <InfoRow label="Roll Number" value={data.roll_number} />
                    <InfoRow label="Issued Date" value={data.issued_on} />
                  </div>
                  
                  <div className="flex flex-col gap-2 no-print">
                    <button onClick={() => window.print()} className="w-full py-2.5 bg-[#1e40af] text-white text-sm font-bold rounded-lg hover:bg-blue-800 transition-colors">
                       Download / Print Transcript
                    </button>
                    <button onClick={() => navigate('/verify/lookup')} className="w-full py-2 text-slate-500 font-semibold text-xs flex items-center justify-center gap-1">
                      <ArrowLeft className="w-3 h-3" /> Verify Another
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                  <h2 className="text-lg font-bold text-slate-800">Verification Failed</h2>
                  <p className="text-slate-500 text-xs mt-1 mb-6 px-2">{error}</p>
                  <button onClick={() => navigate('/verify/lookup')} className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-bold text-sm">
                    Try Again
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
          <p className="text-[9px] text-slate-400 font-medium tracking-tight">
            This is a system-generated transcript verified on {new Date().toLocaleDateString('en-GB')} <br/>
            &copy; Gautam Buddha University, Greater Noida.
          </p>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, isMono, isBlue, isBold }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-200/40 last:border-0">
    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tight">{label}</span>
    <span className={`text-xs text-right truncate max-w-[200px] ${isMono ? 'font-mono' : ''} ${isBlue ? 'text-blue-700 font-bold' : 'text-slate-800'} ${isBold ? 'font-bold' : 'font-medium'}`}>
      {value || '—'}
    </span>
  </div>
);

export default CertificateVerify;