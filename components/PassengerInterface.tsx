import React, { useState } from 'react';
import { Vehicle, Student, Language } from '../types';
import MapEngine from './MapEngine';
import { Clock, Phone, Shield, ChevronRight, Bus } from 'lucide-react';
import { t } from '../services/i18n';

type Theme = 'light' | 'dark';

interface PassengerInterfaceProps {
  currentUser: Student;
  vehicles: Vehicle[];
  lang: Language;
  theme: Theme;
}

const PassengerInterface: React.FC<PassengerInterfaceProps> = ({ currentUser, vehicles, lang, theme }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(
    vehicles.find(v => v.id === currentUser.vehicleId) || null
  );

  const assignedVehicle = vehicles.find(v => v.id === currentUser.vehicleId);

  return (
    <div className={`flex flex-col h-full relative transition-colors duration-300 overflow-hidden ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-white'
    }`} style={{ height: '100%', width: '100%' }}>
      {/* Search Header */}
      <div className={`p-4 shadow-sm z-10 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-900 border-b border-slate-700' : 'bg-white'
      }`}>
        <div className={`p-3 rounded-full flex items-center gap-3 transition-colors duration-300 ${
          theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            theme === 'dark' ? 'bg-slate-500' : 'bg-slate-400'
          }`}></div>
          <span className="text-sm font-medium">{t('to', lang)} {assignedVehicle?.destinationSchool || 'School'}</span>
        </div>
      </div>

      {/* Map - Full height, panel overlays on top */}
      <div className="flex-1 relative" style={{
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
        width: '100%',
        flex: '1 1 auto'
      }}>
        <MapEngine
          vehicles={vehicles}
          userLocation={currentUser.location}
          showRoutes={false}
          highlightVehicleId={selectedVehicle?.id}
          onVehicleClick={setSelectedVehicle}
          className="h-full w-full"
          disableAutoCenter={true}
        />
        
        {/* Floating ETA Card for assigned vehicle */}
        {assignedVehicle && assignedVehicle.status === 'EN_ROUTE' && (
          <div className={`absolute top-4 right-4 rounded-lg shadow-lg p-3 flex flex-col items-center animate-fade-in-up transition-colors duration-300 z-10 ${
            theme === 'dark' ? 'bg-slate-800' : 'bg-white'
          }`}>
            <span className={`text-xs font-medium uppercase ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {t('eta', lang)}
            </span>
            <span className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              {assignedVehicle.nextStopEta}<span className="text-sm align-top">min</span>
            </span>
          </div>
        )}
      </div>

      {/* Bottom Information Panel - Overlays on top of map */}
      <div className={`absolute bottom-0 left-0 right-0 rounded-t-3xl shadow-[0_-5px_25px_rgba(0,0,0,0.1)] z-30 p-5 min-h-[250px] transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-white'
      }`}>
        {selectedVehicle ? (
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className={`text-xl font-bold mb-1 transition-colors duration-300 ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  {selectedVehicle.plateNumber}
                </h2>
                <div className={`flex items-center gap-2 text-sm ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedVehicle.type}
                  </span>
                  <span>•</span>
                  <span>{selectedVehicle.driverName}</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
              }`}>
                 <Bus className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} size={24} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className={`p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1 transition-colors duration-300 ${
                theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'
              }`}>
                <Clock size={18} className="text-blue-500" />
                <span className={`text-xs ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {t('arrival', lang)}
                </span>
                <span className={`font-bold text-sm ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}>
                  {selectedVehicle.nextStopEta} min
                </span>
              </div>
              <div className={`p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition-colors duration-300 ${
                theme === 'dark'
                  ? 'bg-slate-700 hover:bg-slate-600'
                  : 'bg-slate-50 hover:bg-slate-100'
              }`}>
                <Phone size={18} className="text-green-500" />
                <span className={`text-xs ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {t('contact', lang)}
                </span>
                <span className={`font-bold text-sm ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}>
                  {t('call', lang)}
                </span>
              </div>
              <div className={`p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1 transition-colors duration-300 ${
                theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'
              }`}>
                <Shield size={18} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
                <span className={`text-xs ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {t('safety', lang)}
                </span>
                <span className={`font-bold text-sm ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}>
                  {t('verified', lang)}
                </span>
              </div>
            </div>

            <button className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${
              theme === 'dark'
                ? 'bg-white text-slate-900 hover:bg-slate-100'
                : 'bg-black text-white hover:bg-slate-800'
            }`}>
              {t('share_trip', lang)}
            </button>
          </>
        ) : (
          <div className={`text-center py-8 transition-colors duration-300 ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {t('tap_vehicle', lang)}
          </div>
        )}
      </div>
    </div>
  );
};

export default PassengerInterface;