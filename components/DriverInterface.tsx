import React, { useState, useRef, useEffect } from 'react';
import { Vehicle, Student, RouteStop, Language } from '../types';
import MapEngine from './MapEngine';
import { Navigation, CheckCircle, Clock, MapPin, Users, Maximize2, Minimize2, ChevronUp } from 'lucide-react';
import { t } from '../services/i18n';

type Theme = 'light' | 'dark';

interface DriverInterfaceProps {
  vehicle: Vehicle;
  passengers: Student[];
  route: RouteStop[];
  lang: Language;
  theme: Theme;
}

const DriverInterface: React.FC<DriverInterfaceProps> = ({ vehicle, passengers, route, lang, theme }) => {
  const [activeStopId, setActiveStopId] = useState<string>(route.find(r => !r.completed)?.id || '');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [panelHeight, setPanelHeight] = useState(320); // Default height in px
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  
  const handleCompleteStop = (stopId: string) => {
    // In a real app, this would dispatch an action to the backend
    console.log(`Marking stop ${stopId} as complete`);
    // Optimistic UI update logic would go here
  };

  const nextStop = route.find(r => r.id === activeStopId);

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartY(clientY);
    setStartHeight(panelHeight);
  };

  // Handle drag move
  useEffect(() => {
    const handleDragMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaY = startY - clientY; // Inverted: dragging up increases height
      const newHeight = Math.max(200, Math.min(window.innerHeight - 100, startHeight + deltaY));
      setPanelHeight(newHeight);
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDragMove);
      document.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, startY, startHeight, panelHeight]);

  const toggleFullscreen = () => {
    const newFullscreen = !isFullscreen;
    setIsFullscreen(newFullscreen);
    if (newFullscreen) {
      // When entering fullscreen, minimize panel to show more map
      setPanelHeight(200);
    } else {
      // When exiting fullscreen, restore default height
      setPanelHeight(320);
    }
  };

  return (
    <div className={`flex flex-col h-full relative transition-colors duration-300 overflow-hidden ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'
    }`} style={{ height: '100%', width: '100%' }}>
      {/* Top Bar */}
      <div className={`p-4 shadow-md z-10 flex justify-between items-center transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border-b border-slate-200'
      }`}>
        <div>
           <div className={`text-xs font-medium ${
             theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
           }`}>
             {t('vehicle_id', lang)}
           </div>
           <div className="font-bold text-lg">{vehicle.plateNumber}</div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-slate-800 text-white'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
            title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          <div className="bg-green-500 px-3 py-1 rounded-full text-xs font-bold text-green-900">
            {t('online', lang)}
          </div>
        </div>
      </div>

      {/* Map Area - Full height, panel overlays on top */}
      <div className={`relative transition-all duration-300 ${isFullscreen ? 'h-screen' : 'flex-1'}`} style={{
        overflow: 'hidden',
        position: 'relative',
        height: isFullscreen ? '100vh' : '100%',
        width: '100%',
        flex: isFullscreen ? 'none' : '1 1 auto'
      }}>
        <MapEngine 
          vehicles={[vehicle]} 
          students={passengers} 
          showRoutes={true}
          highlightVehicleId={vehicle.id}
          className="h-full w-full"
          disableAutoCenter={true}
        />
        
        {/* Navigation Overlay - Only show when panel is minimized or in fullscreen */}
        {(isFullscreen || panelHeight < 250) && (
          <div className={`absolute top-4 left-4 right-4 backdrop-blur p-4 rounded-xl shadow-xl border transition-all duration-300 z-10 ${
            theme === 'dark'
              ? 'bg-slate-900/90 text-white border-slate-700'
              : 'bg-white/90 text-slate-900 border-slate-200'
          }`}>
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <Navigation className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} size={32} fill="currentColor" />
              </div>
              <div className="flex-1">
                <div className={`text-xs uppercase tracking-wider mb-1 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {t('next_stop', lang)} • {nextStop?.eta || t('arrived', lang)}
                </div>
                <div className="text-xl font-bold leading-tight">
                  {nextStop?.type === 'SCHOOL' 
                    ? vehicle.destinationSchool 
                    : passengers.find(p => p.id === nextStop?.studentId)?.address || t('unknown_address', lang)}
                </div>
                {nextStop?.studentId && (
                  <div className={`mt-2 flex items-center gap-2 text-sm ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                     <Users size={14} /> 
                     {t('pickup', lang)}: <span className={`font-medium ${
                       theme === 'dark' ? 'text-white' : 'text-slate-900'
                     }`}>
                       {passengers.find(p => p.id === nextStop?.studentId)?.name}
                     </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sheet / Action Panel - Overlays on top of map */}
      <div 
        ref={panelRef}
        className={`absolute bottom-0 left-0 right-0 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-30 transition-all duration-300 ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        } ${isDragging ? 'transition-none' : ''}`}
        style={{
          height: `${panelHeight}px`,
          maxHeight: isFullscreen ? '90vh' : '80vh',
          minHeight: '200px',
          // Add safe area padding for mobile
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        {/* Drag Handle */}
        <div 
          ref={dragHandleRef}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          className={`w-full py-3 flex flex-col items-center cursor-grab active:cursor-grabbing ${
            isDragging ? 'cursor-grabbing' : ''
          }`}
        >
          <div className={`w-12 h-1.5 rounded-full mb-2 ${
            theme === 'dark' ? 'bg-slate-600' : 'bg-slate-200'
          }`}></div>
          {!isFullscreen && (
            <ChevronUp 
              size={16} 
              className={`transition-transform ${panelHeight > 320 ? 'rotate-180' : ''} ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}
            />
          )}
        </div>
        
        <div className="px-4 pb-4 overflow-y-auto" style={{ 
          height: `calc(${panelHeight}px - 60px)`,
          maxHeight: `calc(${panelHeight}px - 60px)`
        }}>
          {/* Show compact view when panel is small */}
          {panelHeight < 250 ? (
            <div className="text-center py-4">
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('route_manifest', lang)} • {route.filter(r => !r.completed).length} {lang === 'pt' ? 'paradas restantes' : 'stops remaining'}
              </p>
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                {lang === 'pt' ? 'Arraste para cima para ver a lista completa' : 'Drag up to see full list'}
              </p>
            </div>
          ) : (
            <>
              <h3 className={`font-bold text-lg mb-4 transition-colors duration-300 ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                {t('route_manifest', lang)}
              </h3>
              
              <div className="space-y-4 pr-2">
              {route.map((stop, idx) => {
            const isNext = stop.id === activeStopId;
            const isDone = stop.completed;
            const student = passengers.find(p => p.id === stop.studentId);
            
            return (
              <div key={stop.id} className={`flex items-center gap-4 p-3 rounded-xl border transition-colors duration-300 ${
                isNext
                  ? theme === 'dark'
                    ? 'bg-blue-900/50 border-blue-700 ring-1 ring-blue-800'
                    : 'bg-blue-50 border-blue-200 ring-1 ring-blue-100'
                  : theme === 'dark'
                    ? 'border-slate-700'
                    : 'border-slate-100'
              }`}>
                <div className="flex flex-col items-center gap-1">
                   <div className={`w-0.5 h-3 ${
                     idx === 0
                       ? 'bg-transparent'
                       : theme === 'dark' ? 'bg-slate-600' : 'bg-slate-200'
                   }`}></div>
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                     ${isDone ? 'bg-green-100 text-green-700' : isNext ? 'bg-blue-600 text-white' : theme === 'dark' ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>
                     {idx + 1}
                   </div>
                   <div className={`w-0.5 h-3 ${
                     idx === route.length - 1
                       ? 'bg-transparent'
                       : theme === 'dark' ? 'bg-slate-600' : 'bg-slate-200'
                   }`}></div>
                </div>
                
                <div className="flex-1">
                  <div className={`font-semibold ${
                    isDone
                      ? theme === 'dark' ? 'text-slate-500 line-through' : 'text-slate-400 line-through'
                      : theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}>
                    {stop.type === 'SCHOOL' ? t('drop_off_school', lang) : student?.name}
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <MapPin size={10} /> {stop.type === 'SCHOOL' ? vehicle.destinationSchool : student?.address}
                  </div>
                </div>

                {isNext && (
                   <button 
                     onClick={() => handleCompleteStop(stop.id)}
                     className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors">
                     <CheckCircle size={20} />
                   </button>
                )}
                {isDone && <CheckCircle size={20} className="text-green-500" />}
              </div>
            );
          })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverInterface;