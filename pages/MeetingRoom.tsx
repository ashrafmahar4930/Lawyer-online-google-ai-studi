import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';

export default function MeetingRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [meetingMode, setMeetingMode] = useState<'real' | 'simulated'>('real');
  
  // Create solid fallback displayName
  const myName = user?.displayName || user?.email?.split('@')[0] || 'Guest Participant';
  const displayRoomId = roomId || 'lobby';

  // State for simulated preview media
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (meetingMode === 'simulated' && cameraActive) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          setLocalStream(stream);
          const videoEl = document.getElementById('localSimVideo') as HTMLVideoElement;
          if (videoEl) {
            videoEl.srcObject = stream;
          }
        })
        .catch(err => {
          console.warn("Could not access camera for local simulation:", err);
        });
    } else {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [meetingMode, cameraActive]);

  const copyInvitation = () => {
    const meetUrl = `${window.location.origin}/meeting/${displayRoomId}`;
    navigator.clipboard.writeText(`Assert justice! Please join my secure legal audio/video consultation room at: ${meetUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 3050);
  };

  const handleEndCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    // Safely redirect back based on user role
    if (user?.role === 'lawyer') {
      navigate('/dashboard/lawyer');
    } else if (user?.role === 'client') {
      navigate('/dashboard/client');
    } else {
      navigate('/');
    }
  };

  // Lobby mode if roomId is literally 'lobby'
  if (displayRoomId === 'lobby') {
    const [customRoomInput, setCustomRoomInput] = useState('');
    
    const generateAndJoin = () => {
      const randId = `juris-${Math.random().toString(36).substring(2, 9)}`;
      navigate(`/meeting/${randId}`);
    };

    const joinCustom = (e: React.FormEvent) => {
      e.preventDefault();
      if (customRoomInput.trim()) {
        navigate(`/meeting/${customRoomInput.trim().toLowerCase()}`);
      }
    };

    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-3xl">
            🤝
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-serif">Secure P2P Meeting Lobby</h1>
            <p className="text-slate-500 text-sm mt-2">Create or enter a secure consultation room with military-grade transport protection.</p>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <button 
              onClick={generateAndJoin}
              className="w-full h-12 bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              🚀 Generate Instant Meeting Room
            </button>
            
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="px-3 text-slate-400 text-xs font-bold uppercase">OR</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <form onSubmit={joinCustom} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter pre-existing Room ID" 
                value={customRoomInput}
                onChange={e => setCustomRoomInput(e.target.value)}
                className="flex-grow border border-slate-300 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <button 
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 rounded-xl font-bold transition text-sm"
              >
                Join
              </button>
            </form>
          </div>

          <div className="text-xs text-slate-400 pt-4">
            No software installation required. Our real-time communication modules execute fully inside your modern browser sandbox.
          </div>
        </div>
      </div>
    );
  }

  // Active meeting room layout:
  const jitsiEmbeddedUrl = `https://meet.jit.si/lawyeronline-${displayRoomId}#userInfo.displayName="${encodeURIComponent(myName)}"&config.prejoinPageEnabled=false&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_BRAND_WATERMARK=false&interfaceConfig.MOBILE_APP_PROMO=false`;

  return (
    <div className="bg-slate-950 text-white min-h-[calc(100vh-70px)] flex flex-col xl:flex-row">
      
      {/* 1. Main Video Panel */}
      <div className="flex-grow flex flex-col p-4 md:p-6 space-y-4 justify-between h-[calc(100vh-140px)] xl:h-auto min-h-[500px]">
        {/* Header containing meta status */}
        <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-2xl border border-white/5 backdrop-blur">
          <div>
            <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 font-bold px-2 py-0.5 rounded uppercase tracking-widest text-[10px]">● Live Connection</span>
            <h1 className="text-sm font-bold text-white font-serif mt-1 flex items-center gap-1.5">
              Secure Room: <span className="font-mono text-blue-400 select-all">{displayRoomId}</span>
            </h1>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setMeetingMode(meetingMode === 'real' ? 'simulated' : 'real')}
              className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-lg transition text-slate-300 font-semibold"
            >
              Switch Mode ({meetingMode === 'real' ? 'WebRTC Real' : 'Local Preview'})
            </button>
            <button 
              onClick={copyInvitation}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${copied ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'}`}
            >
              {copied ? '✓ Coppied Link!' : '📋 Copy Invitation'}
            </button>
          </div>
        </div>

        {/* Video Stage Frame */}
        <div className="flex-grow relative bg-slate-900 rounded-3xl border border-white/15 overflow-hidden shadow-inner flex items-center justify-center my-4">
          
          {meetingMode === 'real' ? (
            <iframe 
              src={jitsiEmbeddedUrl}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="w-full h-full border-none"
              title="Secure P2P Legal Connection Workspace"
            />
          ) : (
            <div className="w-full h-full flex flex-col relative items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-920">
              {/* Fake grid of caller profiles for sandbox visualization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full p-6">
                
                {/* Participant 1: Local Stream */}
                <div className="bg-slate-950/80 border border-white/20 rounded-2xl relative overflow-hidden flex items-center justify-center shadow-lg">
                  {cameraActive ? (
                    <video 
                      id="localSimVideo" 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover rounded-2xl scale-x-[-1]"
                    />
                  ) : (
                    <div className="text-white/40 flex flex-col items-center">
                      <span className="text-5xl">📷</span>
                      <p className="text-xs font-bold uppercase tracking-wider mt-3">Camera Disabled</p>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-slate-950/85 text-xs text-white border border-white/10 px-3 py-1 rounded-full font-bold">
                    {myName} (You)
                  </div>
                </div>

                {/* Participant 2: Advisor Placeholder */}
                <div className="bg-slate-950/80 border border-white/15 rounded-2xl relative overflow-hidden flex items-center justify-center shadow-lg">
                  <div className="text-center p-6 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-white/20 flex items-center justify-center text-4xl mb-4 font-serif text-slate-300">
                      ⚖️
                    </div>
                    <p className="font-bold font-serif text-lg text-slate-100">Professional Advisor Mode</p>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">Waiting for your lawyer or guest client to connect via invitation link.</p>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-slate-950/85 text-xs text-slate-300 border border-white/10 px-3 py-1 rounded-full font-bold">
                    Opposing Side / Client Representative
                  </div>
                </div>

              </div>

              {/* Sim Controllers bar overlay */}
              <div className="absolute bottom-6 flex justify-center items-center gap-4 bg-slate-900/95 border border-white/15 px-6 py-3.5 rounded-full shadow-2xl backdrop-blur">
                <button 
                  onClick={() => setMicActive(!micActive)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition ${micActive ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-600 text-white'}`}
                  title={micActive ? 'Mute Mic' : 'Unmute Mic'}
                >
                  {micActive ? '🎙️' : '🔇'}
                </button>
                <button 
                  onClick={() => setCameraActive(!cameraActive)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition ${cameraActive ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-600 text-white'}`}
                  title={cameraActive ? 'Mute Video' : 'Unmute Video'}
                >
                  {cameraActive ? '📹' : '🛑'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions block */}
        <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-2xl border border-white/5 backdrop-blur select-none">
          <div className="text-xs text-slate-400">
             Your connection is safeguarded using secure transport protocols. Leave room safely using the action button.
          </div>
          <button 
            onClick={handleEndCall}
            className="bg-red-600 hover:bg-red-500 hover:scale-105 active:scale-95 text-white font-extrabold px-6 py-3 rounded-xl transition shadow text-xs uppercase tracking-widest flex items-center gap-1.5"
          >
            🛑 End Consultation
          </button>
        </div>
      </div>

      {/* 2. Side Panel - JuriSconnect Consultation Room Control Desk */}
      <div className="w-full xl:w-96 bg-slate-900/90 border-t xl:border-t-0 xl:border-l border-white/10 p-6 flex flex-col justify-between space-y-6 select-none shrink-0 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-blue-400 uppercase tracking-widest text-[11px]">Consultation Assistant</h2>
            <p className="text-slate-400 text-xs mt-1">Real-time reference and quick toolkit during legal video meetings.</p>
          </div>

          {/* Quick Legal Checklist */}
          <div className="bg-slate-950/65 rounded-2xl p-4 border border-white/5 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Before starting review:</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">✔</span> Ensure proper identification cards are ready.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">✔</span> Prepare copies of power of attorneys & agreements.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">✔</span> State your goals & desired legal outcomes clearly.
              </li>
            </ul>
          </div>

          {/* Copy invitation block handy */}
          <div className="bg-slate-950/65 rounded-2xl p-4 border border-white/5 space-y-2 text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wide text-[10px]">Invite Others</span>
            <p className="text-slate-500 text-[10px] leading-tight mt-0.5">Send this conference room link to your advisor or opponent to begin instant P2P peer communications.</p>
            <div className="flex gap-2 mt-2">
              <input 
                type="text" 
                readOnly 
                value={`${window.location.origin}/meeting/${displayRoomId}`}
                className="bg-slate-900 border border-white/10 rounded px-2 py-1 flex-grow text-[9px] font-mono text-zinc-300 focus:outline-none"
              />
              <button 
                onClick={copyInvitation}
                className="bg-white/10 hover:bg-white/15 px-2.5 py-1 text-slate-100 font-bold text-[10px] rounded transition active:scale-95"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 text-[10px] text-slate-500 text-center space-y-2.5">
          <p>Powered by Peer-to-Peer browser sandbox architecture. Private encryption shields video frames natively.</p>
          <div>
            <Link to="/" className="text-blue-500 hover:underline">Support & Help Desk</Link>
          </div>
        </div>
      </div>

    </div>
  );
}
