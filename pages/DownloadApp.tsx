import React, { useState } from 'react';
import { Smartphone, MonitorSmartphone, Share, PlusSquare, ArrowRight, Download } from 'lucide-react';

export default function DownloadApp() {
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight flex justify-center items-center gap-4">
          <MonitorSmartphone className="w-10 h-10 text-blue-600" />
          Install the App
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mt-4">
          LawyerOnline is a Progressive Web App (PWA). You don't need to visit an App Store. 
          Simply add it to your home screen for quick access, offline capabilities, and instant notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Android Instructions */}
        <div className={`bg-white p-8 rounded-2xl border border-slate-200 shadow-sm transition ${activeTab === 'android' ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100 cursor-pointer'}`} onClick={() => setActiveTab('android')}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4483-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0003.5511-.4482.9997-.9993.9997zm-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4483-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997zm11.4045-6.02l1.9973-3.4592a.4158.4158 0 00-.1521-.5676.4164.4164 0 00-.5681.1523l-2.0305 3.5168C15.6983 8.3155 13.9213 7.892 12 7.892c-1.9216 0-3.6983.4235-5.1284 1.0717L4.841 5.4468a.4173.4173 0 00-.5677-.1523.4156.4156 0 00-.1521.5676l1.9969 3.4592C2.695 10.9576.321 15.2281 0 20.3158h24c-.321-5.0877-2.695-9.3582-6.1185-10.9944z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Android Chrome</h2>
          </div>
          
          <ol className="space-y-6 relative border-l-2 border-slate-100 ml-4 pb-4">
            <li className="pl-6 relative">
              <div className="absolute w-6 h-6 bg-blue-600 text-white font-bold text-xs rounded-full flex items-center justify-center -left-[13px] top-0 shadow-sm border-2 border-white">1</div>
              <p className="font-bold text-slate-800">Open Chrome options</p>
              <p className="text-slate-500 text-sm mt-1">Tap the 3 vertical dots (Menu) in the top right corner of Chrome.</p>
            </li>
            <li className="pl-6 relative">
              <div className="absolute w-6 h-6 bg-blue-600 text-white font-bold text-xs rounded-full flex items-center justify-center -left-[13px] top-0 shadow-sm border-2 border-white">2</div>
              <p className="font-bold text-slate-800 flex items-center gap-2">Select "Install app" <Download className="w-4 h-4 text-slate-400" /></p>
              <p className="text-slate-500 text-sm mt-1">Or looking for "Add to Home screen".</p>
            </li>
            <li className="pl-6 relative">
              <div className="absolute w-6 h-6 bg-blue-600 text-white font-bold text-xs rounded-full flex items-center justify-center -left-[13px] top-0 shadow-sm border-2 border-white">3</div>
              <p className="font-bold text-slate-800">Confirm Installation</p>
              <p className="text-slate-500 text-sm mt-1">Tap "Install" on the popup. The app will be added to your app drawer and home screen.</p>
            </li>
          </ol>
        </div>

        {/* iOS Instructions */}
        <div className={`bg-white p-8 rounded-2xl border border-slate-200 shadow-sm transition ${activeTab === 'ios' ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100 cursor-pointer'}`} onClick={() => setActiveTab('ios')}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-800" viewBox="0 0 24 24" fill="currentColor"><path d="M16.36 14c.08-.02.43-.16.92-.61.64-.58 1.15-1.4 1.4-2.22-.04-.02-1.57-.6-1.57-2.31 0-1.8 1.55-2.52 1.6-2.55-1.03-1.4-2.57-1.56-3.14-1.58-1.32-.15-2.61.76-3.29.76-.68 0-1.78-.73-2.88-.71-1.43.02-2.75.83-3.48 2.1-1.48 2.6-.37 6.45 1.07 8.52.71 1.02 1.54 2.14 2.65 2.1.13 0 .76-.23 1.83-.23s1.7.23 1.85.23c1.13.04 1.86-1.04 2.57-2.06.84-1.22 1.2-2.4 1.22-2.46l-.01.01zM11.96 5.56c.64 0 1.53-.55 1.94-1.28.37-.66.58-1.47.51-2.28-.76.04-1.63.51-2.15 1.1-.47.53-.94 1.34-.8 2.14.73.08 1.5-.06 1.84-.23l-.15.01-.01.02z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">iOS Safari</h2>
          </div>
          
          <ol className="space-y-6 relative border-l-2 border-slate-100 ml-4 pb-4">
            <li className="pl-6 relative">
              <div className="absolute w-6 h-6 bg-blue-600 text-white font-bold text-xs rounded-full flex items-center justify-center -left-[13px] top-0 shadow-sm border-2 border-white">1</div>
              <p className="font-bold text-slate-800 flex items-center gap-2">Tap the Share button <Share className="w-4 h-4 text-blue-500" /></p>
              <p className="text-slate-500 text-sm mt-1">Look for the share icon at the bottom center of the Safari browser.</p>
            </li>
            <li className="pl-6 relative">
              <div className="absolute w-6 h-6 bg-blue-600 text-white font-bold text-xs rounded-full flex items-center justify-center -left-[13px] top-0 shadow-sm border-2 border-white">2</div>
              <p className="font-bold text-slate-800 flex items-center gap-2">Select "Add to Home Screen" <PlusSquare className="w-4 h-4 text-slate-400" /></p>
              <p className="text-slate-500 text-sm mt-1">You may need to scroll down or swipe right to find this option.</p>
            </li>
            <li className="pl-6 relative">
              <div className="absolute w-6 h-6 bg-blue-600 text-white font-bold text-xs rounded-full flex items-center justify-center -left-[13px] top-0 shadow-sm border-2 border-white">3</div>
              <p className="font-bold text-slate-800">Tap "Add"</p>
              <p className="text-slate-500 text-sm mt-1">Confirm by tapping Add in the top right corner. The icon will appear on your home screen.</p>
            </li>
          </ol>
        </div>
      </div>
      
      <div className="mt-12 bg-indigo-50 border border-indigo-100 rounded-2xl p-6 md:p-8 text-center flex flex-col items-center">
        <Smartphone className="w-8 h-8 text-indigo-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">Why install our Web App?</h3>
        <p className="text-slate-600 mb-6 max-w-xl">
          It takes virtually no space on your phone, updates automatically, and securely connects you with lawyers without needing app store approvals.
        </p>
      </div>
    </div>
  );
}
