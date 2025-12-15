import React, { useState } from 'react';
import { Vehicle, Student, VehicleStatus, Language } from '../types';
import MapEngine from './MapEngine';
import { generateFleetReport } from '../services/geminiService';
import { AVAILABLE_DRIVERS, PRESET_DESTINATIONS } from '../services/mockData';
import { BarChart, Activity, Sparkles, LayoutDashboard, Users, Bus as BusIcon, Truck, Settings, X, Save } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { t, translateStatus, translateStudentStatus } from '../services/i18n';

type Theme = 'light' | 'dark';

interface AdminInterfaceProps {
  vehicles: Vehicle[];
  students: Student[];
  onUpdateVehicle: (vehicleId: string, updates: Partial<Vehicle>) => void;
  lang: Language;
  theme: Theme;
}

const AdminInterface: React.FC<AdminInterfaceProps> = ({ vehicles, students, onUpdateVehicle, lang, theme }) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'MAP' | 'FLEET' | 'STUDENTS'>('DASHBOARD');
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Derived Stats
  const activeVehicles = vehicles.filter(v => v.status === 'EN_ROUTE').length;
  const delayedVehicles = vehicles.filter(v => v.status === 'DELAYED').length;
  const studentsPickedUp = students.filter(s => s.status === 'PICKED_UP').length;
  const totalStudents = students.length;

  const handleGenerateReport = async () => {
    setLoadingAi(true);
    const report = await generateFleetReport(vehicles, lang);
    setAiReport(report);
    setLoadingAi(false);
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      onUpdateVehicle(editingVehicle.id, {
        driverName: editingVehicle.driverName,
        destinationSchool: editingVehicle.destinationSchool,
        status: editingVehicle.status
      });
      setEditingVehicle(null);
    }
  };

  const chartData = [
    { name: t('on_time', lang), value: activeVehicles, color: '#22c55e' },
    { name: t('delayed', lang), value: delayedVehicles, color: '#ef4444' },
    { name: t('idle', lang), value: vehicles.length - activeVehicles - delayedVehicles, color: '#94a3b8' },
  ];

  return (
    <div className={`flex h-screen overflow-hidden relative transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'
    }`}>
      {/* Sidebar */}
      <aside className={`w-64 flex flex-col hidden md:flex transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border-r border-slate-200'
      }`}>
        <div className={`p-6 border-b transition-colors duration-300 ${
          theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <h1 className="text-2xl font-bold tracking-tight">SchoolPool<span className="text-blue-500">.</span></h1>
          <p className={`text-xs mt-1 transition-colors duration-300 ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {t('director_console', lang)}
          </p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('DASHBOARD')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'DASHBOARD'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                : theme === 'dark'
                  ? 'text-slate-400 hover:bg-slate-800'
                  : 'text-slate-600 hover:bg-slate-100'
            }`}>
            <LayoutDashboard size={20} />
            <span className="font-medium">{t('dashboard', lang)}</span>
          </button>
          <button 
            onClick={() => setActiveTab('MAP')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'MAP'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                : theme === 'dark'
                  ? 'text-slate-400 hover:bg-slate-800'
                  : 'text-slate-600 hover:bg-slate-100'
            }`}>
            <BarChart size={20} />
            <span className="font-medium">{t('live_map', lang)}</span>
          </button>
          <button 
            onClick={() => setActiveTab('FLEET')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'FLEET'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                : theme === 'dark'
                  ? 'text-slate-400 hover:bg-slate-800'
                  : 'text-slate-600 hover:bg-slate-100'
            }`}>
            <Truck size={20} />
            <span className="font-medium">{t('fleet', lang)}</span>
          </button>
          <button 
             onClick={() => setActiveTab('STUDENTS')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
               activeTab === 'STUDENTS'
                 ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                 : theme === 'dark'
                   ? 'text-slate-400 hover:bg-slate-800'
                   : 'text-slate-600 hover:bg-slate-100'
             }`}>
            <Users size={20} />
            <span className="font-medium">{t('students', lang)}</span>
          </button>
        </nav>
        <div className={`p-4 border-t transition-colors duration-300 ${
          theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">D</div>
             <div className="text-sm">
               <div className="font-medium">Director Smith</div>
               <div className={`text-xs transition-colors duration-300 ${
                 theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
               }`}>
                 {t('admin_access', lang)}
               </div>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className={`md:hidden p-4 flex justify-between items-center transition-colors duration-300 ${
          theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border-b border-slate-200'
        }`}>
          <h1 className="font-bold">SchoolPool Admin</h1>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('DASHBOARD')} className={`p-2 rounded ${activeTab === 'DASHBOARD' ? 'bg-blue-600' : ''}`}><LayoutDashboard size={18} /></button>
            <button onClick={() => setActiveTab('MAP')} className={`p-2 rounded ${activeTab === 'MAP' ? 'bg-blue-600' : ''}`}><BarChart size={18} /></button>
            <button onClick={() => setActiveTab('FLEET')} className={`p-2 rounded ${activeTab === 'FLEET' ? 'bg-blue-600' : ''}`}><Truck size={18} /></button>
          </div>
        </div>

        {activeTab === 'DASHBOARD' && (
          <div className="p-6 overflow-y-auto h-full">
            <h2 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              {t('overview', lang)}
            </h2>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className={`p-5 rounded-2xl shadow-sm border transition-colors duration-300 ${
                theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <div className="flex justify-between items-start mb-2">
                   <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Activity size={20} /></div>
                   {delayedVehicles > 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">{t('alert', lang)}</span>}
                </div>
                <div className={`text-3xl font-bold transition-colors duration-300 ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}>
                  {activeVehicles}
                </div>
                <div className={`text-sm transition-colors duration-300 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {t('active_vehicles', lang)}
                </div>
              </div>
              <div className={`p-5 rounded-2xl shadow-sm border transition-colors duration-300 ${
                theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <div className="flex justify-between items-start mb-2">
                   <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Users size={20} /></div>
                </div>
                <div className={`text-3xl font-bold transition-colors duration-300 ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}>
                  {studentsPickedUp}<span className={`text-lg ${
                    theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                  }`}>/{totalStudents}</span>
                </div>
                <div className={`text-sm transition-colors duration-300 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {t('students_picked_up', lang)}
                </div>
              </div>
              <div className={`p-5 rounded-2xl shadow-sm border col-span-1 md:col-span-2 transition-colors duration-300 ${
                theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                 <div className="flex items-center gap-4 h-full">
                    <div className="w-24 h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={chartData} innerRadius={25} outerRadius={40} paddingAngle={5} dataKey="value">
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                       <div className={`font-semibold transition-colors duration-300 ${
                         theme === 'dark' ? 'text-white' : 'text-slate-800'
                       }`}>
                         {t('fleet_status', lang)}
                       </div>
                       <div className={`text-xs flex flex-col gap-1 mt-1 transition-colors duration-300 ${
                         theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                       }`}>
                          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> {t('on_time', lang)}</div>
                          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> {t('delayed', lang)}</div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* AI Assistant Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="text-yellow-300" />
                <h3 className="text-xl font-bold">{t('ai_analyst', lang)}</h3>
              </div>
              <p className="text-indigo-100 mb-6 max-w-2xl">
                {t('ai_desc', lang)}
              </p>
              
              {!aiReport ? (
                <button 
                  onClick={handleGenerateReport}
                  disabled={loadingAi}
                  className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {loadingAi ? t('analyzing', lang) : t('generate_report', lang)}
                  {!loadingAi && <Sparkles size={16} />}
                </button>
              ) : (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 animate-fade-in">
                  <h4 className="font-bold mb-2 text-yellow-300">{t('analysis_result', lang)}</h4>
                  <div className="prose prose-invert prose-sm max-w-none whitespace-pre-line">
                    {aiReport}
                  </div>
                  <button 
                    onClick={() => setAiReport(null)}
                    className="mt-4 text-xs text-indigo-200 hover:text-white underline">
                    {t('clear_report', lang)}
                  </button>
                </div>
              )}
            </div>

            {/* Recent Activity List */}
            <h3 className={`text-lg font-bold mb-4 transition-colors duration-300 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              {t('live_activity', lang)}
            </h3>
            <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors duration-300 ${
              theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}>
               {vehicles.map((v) => (
                 <div key={v.id} className={`p-4 border-b flex items-center justify-between transition-colors duration-300 ${
                   theme === 'dark'
                     ? 'border-slate-700 hover:bg-slate-700'
                     : 'border-slate-100 hover:bg-slate-50'
                 }`}>
                    <div className="flex items-center gap-4">
                       <div className={`p-2 rounded-full ${
                         v.status === 'DELAYED'
                           ? 'bg-red-100 text-red-600'
                           : theme === 'dark'
                             ? 'bg-slate-700 text-slate-300'
                             : 'bg-slate-100 text-slate-600'
                       }`}>
                         <BusIcon size={20} />
                       </div>
                       <div>
                          <div className={`font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-slate-900'
                          }`}>
                            {v.plateNumber} <span className={`font-normal ${
                              theme === 'dark' ? 'text-slate-400' : 'text-slate-400'
                            }`}>
                              ({v.driverName})
                            </span>
                          </div>
                          <div className={`text-xs ${
                            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            {t('destination', lang)}: {v.destinationSchool}
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className={`text-sm font-bold ${v.status === 'DELAYED' ? 'text-red-500' : 'text-green-500'}`}>
                         {translateStatus(v.status, lang)}
                       </div>
                       <div className={`text-xs ${
                         theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                       }`}>
                         {t('eta', lang)} {v.nextStopEta} min
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'MAP' && (
           <div className="h-full w-full relative">
              <MapEngine 
                vehicles={vehicles} 
                students={students} 
                showRoutes={true}
                className="h-full w-full"
              />
              <div className={`absolute top-4 left-4 backdrop-blur p-4 rounded-xl shadow-lg border max-w-sm transition-colors duration-300 ${
                theme === 'dark'
                  ? 'bg-slate-800/90 border-slate-700'
                  : 'bg-white/90 border-slate-200'
              }`}>
                <h3 className={`font-bold mb-2 transition-colors duration-300 ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}>
                  {t('live_tracking', lang)}
                </h3>
                <p className={`text-xs transition-colors duration-300 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {t('tracking_desc', lang)}
                </p>
              </div>
           </div>
        )}

        {activeTab === 'FLEET' && (
          <div className="p-6 h-full overflow-y-auto">
            <h2 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              {t('fleet_management', lang)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((v) => (
                <div key={v.id} className={`rounded-2xl shadow-sm border p-6 hover:shadow-md transition-all duration-300 ${
                  theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                      <Truck size={24} />
                    </div>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                      v.status === 'EN_ROUTE' ? 'bg-green-100 text-green-700' :
                      v.status === 'DELAYED' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {translateStatus(v.status, lang)}
                    </span>
                  </div>
                  
                  <h3 className={`text-lg font-bold transition-colors duration-300 ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    {v.plateNumber}
                  </h3>
                  <p className={`text-sm mb-4 transition-colors duration-300 ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {v.type}
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm">
                      <Users size={16} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
                      <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>
                        <span className="font-semibold">{t('driver', lang)}:</span> {v.driverName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <BusIcon size={16} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
                      <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>
                        <span className="font-semibold">{t('route', lang)}:</span> {v.destinationSchool}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setEditingVehicle(v)}
                    className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                      theme === 'dark'
                        ? 'bg-slate-700 text-white hover:bg-slate-600'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}>
                    <Settings size={16} /> {t('manage_assignment', lang)}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'STUDENTS' && (
          <div className="p-6">
            <h2 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              {t('student_registry', lang)}
            </h2>
            <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors duration-300 ${
              theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}>
              <table className="w-full text-left">
                <thead className={`border-b transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'
                }`}>
                  <tr>
                    <th className={`p-4 text-xs font-bold uppercase transition-colors duration-300 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {t('name', lang)}
                    </th>
                    <th className={`p-4 text-xs font-bold uppercase transition-colors duration-300 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {t('address', lang)}
                    </th>
                    <th className={`p-4 text-xs font-bold uppercase transition-colors duration-300 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {t('assigned_vehicle', lang)}
                    </th>
                    <th className={`p-4 text-xs font-bold uppercase transition-colors duration-300 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {t('status', lang)}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className={`border-b transition-colors duration-300 ${
                      theme === 'dark'
                        ? 'border-slate-700 hover:bg-slate-700'
                        : 'border-slate-100 hover:bg-slate-50'
                    }`}>
                      <td className={`p-4 font-medium transition-colors duration-300 ${
                        theme === 'dark' ? 'text-white' : 'text-slate-900'
                      }`}>
                        {s.name}
                      </td>
                      <td className={`p-4 text-sm transition-colors duration-300 ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        {s.address}
                      </td>
                      <td className={`p-4 text-sm transition-colors duration-300 ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        {vehicles.find(v => v.id === s.vehicleId)?.plateNumber || t('unassigned', lang)}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold
                          ${s.status === 'PICKED_UP' ? 'bg-green-100 text-green-700' : 
                            s.status === 'WAITING' ? 'bg-yellow-100 text-yellow-700' : theme === 'dark' ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                          {translateStudentStatus(s.status, lang)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Editing Modal */}
      {editingVehicle && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up transition-colors duration-300 ${
            theme === 'dark' ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className={`flex justify-between items-center p-6 border-b transition-colors duration-300 ${
              theme === 'dark' ? 'border-slate-700' : 'border-slate-100'
            }`}>
              <h3 className={`text-xl font-bold transition-colors duration-300 ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                {t('manage_vehicle', lang)}
              </h3>
              <button 
                onClick={() => setEditingVehicle(null)}
                className={`p-2 rounded-full transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-slate-700 text-slate-400'
                    : 'hover:bg-slate-100 text-slate-500'
                }`}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveVehicle} className="p-6 space-y-4">
              <div>
                <label className={`block text-xs font-bold uppercase mb-2 transition-colors duration-300 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {t('vehicle_plate', lang)}
                </label>
                <input 
                  type="text" 
                  value={editingVehicle.plateNumber} 
                  disabled 
                  className={`w-full border rounded-lg p-3 transition-colors duration-300 ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase mb-2 transition-colors duration-300 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {t('assigned_driver', lang)}
                </label>
                <select 
                  value={editingVehicle.driverName}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, driverName: e.target.value })}
                  className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  {AVAILABLE_DRIVERS.map(driver => (
                    <option key={driver} value={driver}>{driver}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase mb-2 transition-colors duration-300 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {t('destination_route', lang)}
                </label>
                <select 
                   value={editingVehicle.destinationSchool}
                   onChange={(e) => setEditingVehicle({ ...editingVehicle, destinationSchool: e.target.value })}
                   className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                     theme === 'dark'
                       ? 'bg-slate-700 border-slate-600 text-white'
                       : 'bg-white border-slate-200 text-slate-800'
                   }`}
                >
                  {PRESET_DESTINATIONS.map(dest => (
                    <option key={dest} value={dest}>{dest}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase mb-2 transition-colors duration-300 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {t('operational_status', lang)}
                </label>
                <select 
                  value={editingVehicle.status}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, status: e.target.value as VehicleStatus })}
                  className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  {Object.values(VehicleStatus).map(status => (
                    <option key={status} value={status}>{translateStatus(status, lang)}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditingVehicle(null)}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-700 text-white hover:bg-slate-600'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}>
                  {t('cancel', lang)}
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <Save size={18} /> {t('save_changes', lang)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInterface;