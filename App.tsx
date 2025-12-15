import React, { useState, useEffect } from 'react';
import { UserRole, Vehicle, Student, Language } from './types';
import { INITIAL_VEHICLES, INITIAL_STUDENTS, DRIVER_ROUTE, moveVehicles } from './services/mockData';
import DriverInterface from './components/DriverInterface';
import PassengerInterface from './components/PassengerInterface';
import AdminInterface from './components/AdminInterface';
import { ShieldCheck, User, Bus } from 'lucide-react';
import { t } from './services/i18n';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.NONE);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [students] = useState<Student[]>(INITIAL_STUDENTS);
  const [lang, setLang] = useState<Language>('pt');
  const [theme, setTheme] = useState<Theme>('dark');

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prevVehicles => moveVehicles(prevVehicles));
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  const handleUpdateVehicle = (vehicleId: string, updates: Partial<Vehicle>) => {
    setVehicles(prevVehicles => 
      prevVehicles.map(v => v.id === vehicleId ? { ...v, ...updates } : v)
    );
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Helper to safely get the first vehicle and student
  const mainVehicle = vehicles.length > 0 ? vehicles[0] : null;
  const currentUser = students.length > 0 ? students[0] : null;

  // Role Selection Screen
  if (currentRole === UserRole.NONE) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-slate-900 text-white' 
          : 'bg-slate-50 text-slate-900'
      }`}>
        {/* Decorative Circles */}
        <div className={`absolute top-0 left-0 w-64 h-64 rounded-full blur-[100px] opacity-20 -translate-x-1/2 -translate-y-1/2 ${
          theme === 'dark' ? 'bg-blue-600' : 'bg-blue-300'
        }`}></div>
        <div className={`absolute bottom-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-20 translate-x-1/2 translate-y-1/2 ${
          theme === 'dark' ? 'bg-purple-600' : 'bg-purple-300'
        }`}></div>

        <div className="text-center mb-12 relative z-10">
          <div 
            onClick={toggleTheme}
            className={`inline-block p-4 rounded-3xl backdrop-blur-md border mb-6 shadow-2xl cursor-pointer transition-all hover:scale-110 ${
              theme === 'dark'
                ? 'bg-white/10 border-white/10 hover:bg-white/20'
                : 'bg-white/80 border-slate-200/50 hover:bg-white'
            }`}>
            <Bus size={48} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">SchoolPool</h1>
          <p className={`max-w-md mx-auto text-lg ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
          }`}>
            {t('app_subtitle', lang)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl relative z-10">
          {/* Driver Card */}
          <button 
            onClick={() => setCurrentRole(UserRole.DRIVER)}
            className={`group relative p-8 rounded-3xl transition-all duration-300 border hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center text-center ${
              theme === 'dark'
                ? 'bg-slate-800 hover:bg-blue-600 border-slate-700 hover:border-blue-500 hover:shadow-blue-900/50'
                : 'bg-white hover:bg-blue-100 border-slate-200 hover:border-blue-400 hover:shadow-blue-200/50'
            }`}>
            <div className={`p-4 rounded-2xl mb-4 transition-colors ${
              theme === 'dark'
                ? 'bg-slate-700 group-hover:bg-white/20'
                : 'bg-slate-100 group-hover:bg-blue-200/50'
            }`}>
              <Bus className={theme === 'dark' ? 'text-white' : 'text-slate-700'} size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('role_driver', lang)}</h3>
            <p className={`text-sm ${
              theme === 'dark'
                ? 'text-slate-400 group-hover:text-blue-100'
                : 'text-slate-600 group-hover:text-blue-800'
            }`}>
              {t('role_driver_desc', lang)}
            </p>
          </button>

          {/* Passenger Card */}
          <button 
             onClick={() => setCurrentRole(UserRole.PASSENGER)}
             className={`group relative p-8 rounded-3xl transition-all duration-300 border hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center text-center ${
              theme === 'dark'
                ? 'bg-slate-800 hover:bg-emerald-600 border-slate-700 hover:border-emerald-500 hover:shadow-emerald-900/50'
                : 'bg-white hover:bg-emerald-100 border-slate-200 hover:border-emerald-400 hover:shadow-emerald-200/50'
            }`}>
            <div className={`p-4 rounded-2xl mb-4 transition-colors ${
              theme === 'dark'
                ? 'bg-slate-700 group-hover:bg-white/20'
                : 'bg-slate-100 group-hover:bg-emerald-200/50'
            }`}>
              <User className={theme === 'dark' ? 'text-white' : 'text-slate-700'} size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('role_student', lang)}</h3>
            <p className={`text-sm ${
              theme === 'dark'
                ? 'text-slate-400 group-hover:text-emerald-100'
                : 'text-slate-600 group-hover:text-emerald-800'
            }`}>
              {t('role_student_desc', lang)}
            </p>
          </button>

          {/* Admin Card */}
          <button 
             onClick={() => setCurrentRole(UserRole.ADMIN)}
             className={`group relative p-8 rounded-3xl transition-all duration-300 border hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center text-center ${
              theme === 'dark'
                ? 'bg-slate-800 hover:bg-purple-600 border-slate-700 hover:border-purple-500 hover:shadow-purple-900/50'
                : 'bg-white hover:bg-purple-100 border-slate-200 hover:border-purple-400 hover:shadow-purple-200/50'
            }`}>
             <div className={`p-4 rounded-2xl mb-4 transition-colors ${
              theme === 'dark'
                ? 'bg-slate-700 group-hover:bg-white/20'
                : 'bg-slate-100 group-hover:bg-purple-200/50'
            }`}>
              <ShieldCheck className={theme === 'dark' ? 'text-white' : 'text-slate-700'} size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('role_director', lang)}</h3>
            <p className={`text-sm ${
              theme === 'dark'
                ? 'text-slate-400 group-hover:text-purple-100'
                : 'text-slate-600 group-hover:text-purple-800'
            }`}>
              {t('role_director_desc', lang)}
            </p>
          </button>
        </div>

        <div className={`mt-16 text-sm ${
          theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
        }`}>
          {t('powered_by', lang)}
        </div>
      </div>
    );
  }

  // Render Interface based on Role
  return (
    <div className={`h-screen w-full relative transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'
    }`}>
      <button 
        onClick={() => setCurrentRole(UserRole.NONE)}
        className={`fixed bottom-4 left-4 z-50 px-4 py-2 rounded-full text-xs font-bold shadow-lg opacity-50 hover:opacity-100 transition-opacity ${
          theme === 'dark'
            ? 'bg-slate-900 text-white'
            : 'bg-white text-slate-700 border border-slate-200'
        }`}>
        {t('switch_role', lang)}
      </button>

      {currentRole === UserRole.DRIVER && mainVehicle && (
        <DriverInterface 
          vehicle={mainVehicle}
          passengers={students.filter(s => s.vehicleId === mainVehicle.id)}
          route={DRIVER_ROUTE}
          lang={lang}
          theme={theme}
        />
      )}

      {currentRole === UserRole.PASSENGER && currentUser && (
        <PassengerInterface 
          currentUser={currentUser} 
          vehicles={vehicles}
          lang={lang}
          theme={theme}
        />
      )}

      {currentRole === UserRole.ADMIN && (
        <AdminInterface 
          vehicles={vehicles}
          students={students}
          onUpdateVehicle={handleUpdateVehicle}
          lang={lang}
          theme={theme}
        />
      )}
    </div>
  );
};

export default App;