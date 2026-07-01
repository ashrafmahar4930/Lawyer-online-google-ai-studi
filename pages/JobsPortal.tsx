import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, Briefcase, Globe2, MapPin, Search, Building2, MapPin as MapPinIcon, Clock, AlertCircle } from 'lucide-react';
import { getAuthorities } from '../services/mockDataService';

const JOB_REGIONS = [
  {
    region: 'Pakistan',
    sites: [
      { id: 'fpsc-pk', name: 'Federal Public Service Commission (FPSC)', url: 'https://www.fpsc.gov.pk/' },
      { id: 'ppsc-pk', name: 'Punjab Public Service Commission (PPSC)', url: 'https://www.ppsc.gop.pk/' },
      { id: 'supreme-court-pk', name: 'Supreme Court of Pakistan', url: 'https://www.supremecourt.gov.pk/careers/' },
      { id: 'rozee-pk-legal', name: 'Rozee.pk - Legal Jobs', url: 'https://www.rozee.pk/job/search/legal' }
    ]
  },
  {
    region: 'India',
    sites: [
      { id: 'upsc-in', name: 'Union Public Service Commission (UPSC)', url: 'https://upsc.gov.in/' },
      { id: 'sci-in', name: 'Supreme Court of India', url: 'https://main.sci.gov.in/recruitment' },
      { id: 'naukri-legal', name: 'Naukri - Legal Jobs', url: 'https://www.naukri.com/legal-jobs' }
    ]
  },
  {
    region: 'United Kingdom',
    sites: [
      { id: 'civil-service', name: 'Civil Service Jobs', url: 'https://www.civilservicejobs.service.gov.uk/' },
      { id: 'judiciary-uk', name: 'UK Judiciary Careers', url: 'https://www.judiciary.uk/about-the-judiciary/diversity/judicial-careers/' },
      { id: 'law-society-uk', name: 'The Law Society Jobs', url: 'https://jobs.lawsociety.org.uk/' }
    ]
  },
  {
    region: 'North America (USA & Canada)',
    sites: [
      { id: 'usajobs', name: 'USAJOBS (Federal)', url: 'https://www.usajobs.gov/' },
      { id: 'uscourts', name: 'US Courts Careers', url: 'https://www.uscourts.gov/careers' },
      { id: 'canada-jobs', name: 'Government of Canada Jobs', url: 'https://www.canada.ca/en/services/jobs/opportunities/government.html' }
    ]
  },
  {
    region: 'Australia & New Zealand',
    sites: [
      { id: 'aps-au', name: 'Australian Public Service Jobs', url: 'https://www.apsjobs.gov.au/' },
      { id: 'law-council-au', name: 'Law Council of Australia', url: 'https://lawcouncil.au/about-us/careers' },
      { id: 'careers-nz', name: 'New Zealand Government Jobs', url: 'https://jobs.govt.nz/' }
    ]
  },
  {
    region: 'Middle East',
    sites: [
      { id: 'dubai-careers', name: 'Dubai Careers', url: 'https://dubaicareers.ae/' },
      { id: 'bayt-legal', name: 'Bayt - Legal Jobs in Middle East', url: 'https://www.bayt.com/en/international/jobs/roles/legal/' }
    ]
  },
  {
    region: 'International & Global',
    sites: [
      { id: 'un-jobs', name: 'United Nations Careers', url: 'https://careers.un.org/' },
      { id: 'world-bank', name: 'World Bank Legal Careers', url: 'https://www.worldbank.org/en/about/careers' },
      { id: 'icc', name: 'International Criminal Court', url: 'https://www.icc-cpi.int/jobs' }
    ]
  }
];

const PLATFORM_JOBS: any[] = [];

export default function JobsPortal() {
  const [activeTab, setActiveTab] = useState<'platform' | 'official'>('platform');
  const [activeRegion, setActiveRegion] = useState('Pakistan');
  const [searchQuery, setSearchQuery] = useState('');
  const [authorities, setAuthorities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'official') {
      const fetchAuthorities = async () => {
        setIsLoading(true);
        try {
          const data = await getAuthorities();
          setAuthorities(data);
          if (data.length > 0 && !data.some(a => a.region === activeRegion)) {
             // Maybe set first region as active if current one isn't in DB
          }
        } catch (err) {
          console.error("Failed to load authorities:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchAuthorities();
    }
  }, [activeTab]);

  const filteredPlatformJobs = PLATFORM_JOBS.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    job.lawFirm.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group authorities by region for the sidebar
  const authoritiesByRegion = authorities.reduce((acc: any, auth: any) => {
    const region = auth.region || 'Others';
    if (!acc[region]) acc[region] = [];
    acc[region].push(auth);
    return acc;
  }, {});

  const regions = Object.keys(authoritiesByRegion).sort();
  const displayRegions = regions.length > 0 ? regions : JOB_REGIONS.map(r => r.region);
  
  useEffect(() => {
    if (regions.length > 0 && activeRegion === 'Pakistan') {
      setActiveRegion(regions[0]);
    }
  }, [regions]);

  const seoSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Global Legal Job Portals",
    "description": "Your centralized gateway to discover legal career opportunities worldwide. Browse official government, judicial, and international career portals.",
    "url": "https://lawyeronline.pk/jobs",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": JOB_REGIONS.flatMap((region, rIdx) => 
        region.sites.map((site, sIdx) => ({
          "@type": "ListItem",
          "position": rIdx * 100 + sIdx + 1,
          "name": site.name,
          "url": site.url
        }))
      )
    }
  };

  return (
    <>
      <Helmet>
        <title>Global Legal Job Portals - Find Lawyer Jobs Worldwide | LawyerOnline</title>
        <meta name="description" content="Your centralized gateway to discover legal career opportunities worldwide. Browse official government, judicial, and international career portals." />
        <meta name="keywords" content="legal jobs, lawyer jobs, international court careers, federal jobs, supreme court jobs, legal careers, advocate jobs" />
        <script type="application/ld+json">
          {JSON.stringify(seoSchema)}
        </script>
      </Helmet>
      <div className="container mx-auto px-4 py-8 max-w-6xl animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          <Globe2 className="w-8 h-8 text-blue-600" />
          Global Legal Job Portals
        </h1>
        <p className="text-slate-600 mt-2 text-lg">
          Your centralized gateway to discover legal career opportunities worldwide. Browse official government, judicial, and international career portals.
        </p>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl mb-8 w-full max-w-md">
        <button
          onClick={() => setActiveTab('platform')}
          className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-lg transition ${
            activeTab === 'platform' ? 'bg-white text-blue-700 shadow flex items-center justify-center gap-2' : 'text-slate-600 hover:text-slate-800 flex items-center justify-center gap-2'
          }`}
        >
          <Building2 className="w-4 h-4" /> Platform Jobs
        </button>
        <button
          onClick={() => setActiveTab('official')}
          className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-lg transition ${
            activeTab === 'official' ? 'bg-white text-blue-700 shadow flex items-center justify-center gap-2' : 'text-slate-600 hover:text-slate-800 flex items-center justify-center gap-2'
          }`}
        >
          <Globe2 className="w-4 h-4" /> Official Portals
        </button>
      </div>

      {activeTab === 'platform' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-96">
              <input 
                type="text" 
                placeholder="Search job title or law firm..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <button className="whitespace-nowrap px-4 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition">
              Post a Job (Lawyers)
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {filteredPlatformJobs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Direct Openings Currently</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                  There are no jobs posted directly on our platform right now. However, you can explore thousands of legal opportunities through official portals worldwide.
                </p>
                <button 
                  onClick={() => setActiveTab('official')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2 mx-auto"
                >
                  <Globe2 className="w-5 h-5" />
                  Explore Official Portals
                </button>
              </div>
            ) : (
              filteredPlatformJobs.map((job) => (
                <div key={job.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 hover:text-blue-600 transition cursor-pointer">{job.title}</h2>
                      <div className="flex items-center gap-2 text-slate-600 mt-1 font-medium">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        {job.lawFirm}
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-sm">
                      {job.type}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-6">{job.description}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5"><MapPinIcon className="w-4 h-4" /> {job.location}</span>
                      <span className="flex items-center gap-1.5 text-blue-600 font-semibold">{job.salary}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {job.postedAt}</span>
                    </div>
                    <button className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
                      Apply Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'official' && (
        <div className="flex flex-col md:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0 space-y-2">
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-200 rounded-lg w-full"></div>)}
              </div>
            ) : regions.length > 0 ? (
              regions.map((region) => (
                <button
                  key={region}
                  onClick={() => setActiveRegion(region)}
                  className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg font-semibold transition ${
                    activeRegion === region 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                  {region}
                </button>
              ))
            ) : (
              JOB_REGIONS.map((regionGroup) => (
                <button
                  key={regionGroup.region}
                  onClick={() => setActiveRegion(regionGroup.region)}
                  className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg font-semibold transition ${
                    activeRegion === regionGroup.region 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {regionGroup.region === 'International & Global' ? <Globe2 className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                  {regionGroup.region}
                </button>
              ))
            )}
          </div>

          {/* Portal Links */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isLoading ? (
              [1,2,3,4].map(i => <div key={i} className="h-40 bg-white border border-slate-200 rounded-xl animate-pulse"></div>)
            ) : (authoritiesByRegion[activeRegion] || JOB_REGIONS.find(r => r.region === activeRegion)?.sites || []).map((site: any) => (
              <a
                key={site.id || site.name}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition block"
              >
                <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition text-lg">{site.name}</h3>
                <p className="text-sm text-slate-500 mt-2 truncate flex-1">{site.url}</p>
                <div className="mt-6 flex justify-between items-center w-full">
                  <span className="text-blue-600 text-sm font-bold bg-blue-50 px-3 py-1.5 rounded-full group-hover:bg-blue-100 transition">Open Portal</span>
                  <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition" />
                </div>
              </a>
            ))}
            
            {/* Become Admin Provider Prompt */}
            <div className="col-span-1 border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
              <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mb-3">
                <Globe2 className="w-6 h-6 text-slate-500" />
              </div>
              <h3 className="font-bold text-slate-700">Missing a Legal Portal?</h3>
              <p className="text-sm text-slate-500 mt-2 mb-4">Admins can add more region-specific government and judicial sites globally.</p>
              <span className="text-sm font-bold text-slate-600 border border-slate-300 px-4 py-2 rounded-lg bg-white">Suggest to Admin</span>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
