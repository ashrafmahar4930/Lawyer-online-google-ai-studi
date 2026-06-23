
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom'; // Added Link
import * as db from '../services/mockDataService';
import { LawyerProfile } from '../types';
import SearchableSelect from '../components/SearchableSelect';

export default function FindLawyers() {
  const [searchParams] = useSearchParams();
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
  
  // Filters
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || '');
  const [country, setCountry] = useState(searchParams.get('country') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [searchName, setSearchName] = useState('');

  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    db.getAllLawyers().then(setLawyers);
    db.getCountries().then(countries => setAvailableCountries(countries.map(c => c.name)));
  }, []);

  // Update dynamic city list when country selection changes
  useEffect(() => {
    const loadCities = async () => {
      if (country) {
        const cities = await db.getCitiesByCountry(country);
        setAvailableCities(cities);
        if (!isInitialLoad) {
          setCity('');
        } else {
          setIsInitialLoad(false);
        }
      } else {
        setAvailableCities([]);
        if (!isInitialLoad) {
          setCity('');
        } else {
          setIsInitialLoad(false);
        }
      }
    };
    loadCities();
  }, [country]);

  const filteredLawyers = lawyers.filter(l => {
      const matchSpec = specialty ? (l.specialty === specialty || (l.specialties && l.specialties.includes(specialty))) : true;
      const matchCountry = country ? l.country?.toLowerCase() === country.toLowerCase() : true;
      const matchCity = city ? l.city?.toLowerCase() === city.toLowerCase() : true;
      const matchName = searchName ? l.fullName?.toLowerCase().includes(searchName.toLowerCase()) : true;
      return matchSpec && matchCountry && matchCity && matchName;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-20">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b">
                     <h3 className="font-bold text-lg text-slate-800">Filter Results</h3>
                     <button onClick={() => {setCity(''); setCountry(''); setSpecialty(''); setSearchName('')}} className="text-xs text-red-600 hover:underline font-bold">Reset</button>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Search Name</label>
                          <input className="w-full border p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition" value={searchName} onChange={e => setSearchName(e.target.value)} placeholder="e.g. Ali Khan" />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Country</label>
                          <SearchableSelect 
                              options={availableCountries.map(c => ({ value: c, label: c }))}
                              value={country}
                              onChange={val => setCountry(val)}
                              placeholder="All Countries"
                          />
                      </div>

                      <div className="relative z-10">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">City</label>
                          <SearchableSelect 
                              disabled={!country}
                              options={availableCities.map(c => ({ value: c, label: c }))}
                              value={city}
                              onChange={val => setCity(val)}
                              placeholder={country ? "All Cities" : "Select Country First"}
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Specialty</label>
                          <SearchableSelect 
                              options={[
                                { value: "Family Law", label: "Family Law" },
                                { value: "Criminal Law", label: "Criminal Law" },
                                { value: "Corporate Law", label: "Corporate Law" },
                                { value: "Tax Law", label: "Tax Law" },
                                { value: "Civil Litigation", label: "Civil Litigation" },
                                { value: "Real Estate", label: "Real Estate" },
                                { value: "Immigration", label: "Immigration" },
                              ]}
                              value={specialty}
                              onChange={val => setSpecialty(val)}
                              placeholder="All Specialties"
                          />
                      </div>
                  </div>
              </div>
          </div>

          {/* Results */}
          <div className="flex-grow">
              <h2 className="text-xl font-bold mb-6 text-slate-800">{filteredLawyers.length} Lawyers Found</h2>
              
              <div className="grid grid-cols-1 gap-6">
                  {filteredLawyers.map(lawyer => (
                      <div key={lawyer.uid} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition duration-200">
                          <div className="flex flex-col sm:flex-row">
                              
                              {/* Left: Image */}
                              <div className="w-full sm:w-48 h-48 sm:h-auto relative bg-slate-50 flex-shrink-0">
                                  <img 
                                    src={lawyer.picture || `https://ui-avatars.com/api/?name=${lawyer.fullName}&background=random&size=200`} 
                                    alt={lawyer.fullName} 
                                    className="w-full h-full object-cover" 
                                  />
                                  {lawyer.isVerified && (
                                      <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center">
                                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                                          VERIFIED
                                      </div>
                                  )}
                              </div>

                              {/* Right: Content */}
                              <div className="p-6 flex-grow flex flex-col justify-between">
                                  <div>
                                      <div className="flex justify-between items-start">
                                          <div>
                                              <h3 className="text-xl font-bold text-slate-900 font-serif hover:text-blue-600 transition">
                                                  <Link to={`/lawyer/${lawyer.uid}`}>{lawyer.fullName}</Link>
                                              </h3>
                                              <p className="text-blue-600 font-medium text-sm">{lawyer.title} &bull; {lawyer.specialty}</p>
                                          </div>
                                          <div className="flex items-center bg-amber-50 px-2 py-1 rounded border border-amber-100">
                                              <span className="text-amber-500 text-sm">★</span>
                                              <span className="text-slate-800 font-bold ml-1 text-sm">{lawyer.rating || '5.0'}</span>
                                              <span className="text-slate-400 text-xs ml-1">({lawyer.reviewCount || 10})</span>
                                          </div>
                                      </div>
                                      
                                      <div className="mt-3 text-sm text-slate-500 space-y-1">
                                          <p className="flex items-center">
                                              <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                              {lawyer.officeName || 'Independent Practice'}
                                          </p>
                                          <p className="flex items-center">
                                              <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                              {lawyer.city}, {lawyer.country}
                                          </p>
                                      </div>
                                      
                                      <p className="mt-4 text-slate-600 text-sm line-clamp-2">
                                          {lawyer.aboutMe || "Experienced legal professional dedicated to providing high-quality representation."}
                                      </p>
                                  </div>

                                  <div className="mt-6 flex gap-3 pt-4 border-t border-slate-50">
                                      <Link 
                                        to={`/lawyer/${lawyer.uid}`}
                                        className="flex-1 bg-slate-900 text-white text-center py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition shadow-sm"
                                      >
                                          View Full Profile
                                      </Link>
                                      <button className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-50 transition">
                                          Book Consultation
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
                  
                  {filteredLawyers.length === 0 && (
                      <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-100">
                          <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                          <p className="text-slate-500 text-lg">No lawyers found matching your criteria.</p>
                          <button onClick={() => {setCity(''); setCountry(''); setSpecialty(''); setSearchName('')}} className="mt-4 text-blue-600 font-medium hover:underline">Clear all filters</button>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
}
