import React, { useEffect, useRef } from 'react';
import { Coordinates, Vehicle, Student } from '../types';
import mapboxgl from 'mapbox-gl';
import { createRoot } from 'react-dom/client';
import { Bus, MapPin, School, Truck } from 'lucide-react';

interface MapEngineProps {
  vehicles: Vehicle[];
  students?: Student[];
  userLocation?: Coordinates;
  showRoutes?: boolean;
  highlightVehicleId?: string;
  onVehicleClick?: (vehicle: Vehicle) => void;
  className?: string;
  disableAutoCenter?: boolean; // New prop to disable auto-centering
}

// Custom Marker Component helpers
const VehicleMarker = ({ 
  type, 
  color, 
  plateNumber, 
  isHighlighted,
  status 
}: { 
  type: string; 
  color: string; 
  plateNumber: string;
  isHighlighted: boolean;
  status: string;
}) => {
  const isVan = type === 'VAN';
  const isMoving = status === 'EN_ROUTE';
  
  return (
    <div className="relative">
      <div className={`${isVan ? 'p-1.5' : 'p-2.5'} rounded-full shadow-xl border-2 border-white transform transition-all hover:scale-110 ${color} ${isMoving ? 'animate-pulse' : ''}`}>
        {isVan ? (
          <Truck size={isHighlighted ? 20 : 18} className="text-white" fill="currentColor" />
        ) : (
          <Bus size={isHighlighted ? 24 : 22} className="text-white" fill="currentColor" />
        )}
      </div>
      {isHighlighted && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap font-semibold">
          {plateNumber}
        </div>
      )}
    </div>
  );
};

const StudentMarker = ({ status, name }: { status: string; name: string }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'WAITING':
        return 'text-orange-500 fill-orange-400';
      case 'PICKED_UP':
        return 'text-green-500 fill-green-400';
      case 'DROPPED_OFF':
        return 'text-blue-500 fill-blue-400';
      default:
        return 'text-slate-400 fill-slate-300';
    }
  };

  const getOpacity = () => {
    return status === 'WAITING' ? 'opacity-100' : status === 'PICKED_UP' ? 'opacity-80' : 'opacity-50';
  };

  return (
    <div className={`flex flex-col items-center transition-all ${getOpacity()}`}>
      <MapPin size={32} className={`${getStatusColor()} drop-shadow-lg`} />
      {status === 'WAITING' && (
        <div className="mt-1 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold whitespace-nowrap shadow-md">
          {name.split(' ')[0]}
        </div>
      )}
    </div>
  );
};

const SchoolMarker = () => (
  <div className="bg-blue-600 p-2 rounded-full shadow-lg border-2 border-white">
    <School size={20} className="text-white" />
  </div>
);

const MapEngine: React.FC<MapEngineProps> = ({
  vehicles,
  students = [],
  userLocation,
  showRoutes = false,
  highlightVehicleId,
  onVehicleClick,
  className = "",
  disableAutoCenter = false
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const rootsRef = useRef<Map<string, any>>(new Map()); // Store React roots to avoid re-creation
  const routeLayersRef = useRef<Set<string>>(new Set()); // Track route layers for cleanup

  // Initialize Map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // Robust check for Mapbox presence
    if (!mapboxgl || !mapboxgl.Map) {
      console.error("Mapbox GL JS is not loaded correctly.");
      return;
    }

    try {
      mapboxgl.accessToken = 'pk.eyJ1IjoiamVzc2VmcmVpIiwiYSI6ImNtZ3B3ZWx6NzJjNmYyanExY2t3emk4M2IifQ.fbnPMTAQOmTK2-5XqOn-RA';

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-46.6565, -23.5614], // São Paulo
        zoom: 12,
        minZoom: 10,
        maxZoom: 18,
        pitch: 45,
        attributionControl: false,
        // Helper to prevent frame blocking issues on resource loading
        transformRequest: (url, resourceType) => {
           return { url };
        }
      });

      // Add navigation controls with better positioning
      map.current.addControl(new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true
      }), 'top-right');

      // Wait for map to load before adding markers
      map.current.on('load', () => {
        // Add School Marker (Static for mock)
        const el = document.createElement('div');
        const root = createRoot(el);
        root.render(<SchoolMarker />);
        new mapboxgl.Marker(el)
          .setLngLat([-46.6333, -23.5505])
          .addTo(map.current!);
      });
        
      map.current.on('error', (e) => {
        // Suppress specific frame access errors that don't impact functionality
        if (e.error && e.error.message && (e.error.message.includes('Location') || e.error.message.includes('href'))) {
          // console.warn('Mapbox Location/Frame error suppressed');
          return;
        }
        console.warn('Mapbox error:', e);
      });

    } catch (e) {
      console.error("Error initializing Mapbox:", e);
    }
  }, []);

  // Update Markers & Routes
  useEffect(() => {
    if (!map.current) return;
    
    // Wait for map to be ready
    const updateMarkers = () => {
      if (!map.current) return;
      
      try {
        // Get current vehicle and student IDs for cleanup
      const currentVehicleIds = new Set(vehicles.map(v => v.id));
      const currentStudentIds = new Set(students.map(s => s.id));

      // Cleanup removed vehicle markers
      markersRef.current.forEach((marker, id) => {
        if (id.startsWith('vehicle-') && !currentVehicleIds.has(id.replace('vehicle-', ''))) {
          marker.remove();
          markersRef.current.delete(id);
          const root = rootsRef.current.get(id);
          if (root) {
            root.unmount();
            rootsRef.current.delete(id);
          }
        }
      });

      // Cleanup removed student markers
      markersRef.current.forEach((marker, id) => {
        if (id.startsWith('student-') && !currentStudentIds.has(id.replace('student-', ''))) {
          marker.remove();
          markersRef.current.delete(id);
          const root = rootsRef.current.get(id);
          if (root) {
            root.unmount();
            rootsRef.current.delete(id);
          }
        }
      });

      // Cleanup removed route layers
      if (map.current.isStyleLoaded()) {
        routeLayersRef.current.forEach(layerId => {
          const vehicleId = layerId.replace('route-', '');
          if (!currentVehicleIds.has(vehicleId)) {
            try {
              if (map.current?.getLayer(layerId)) {
                map.current.removeLayer(layerId);
              }
              if (map.current?.getSource(layerId)) {
                map.current.removeSource(layerId);
              }
              routeLayersRef.current.delete(layerId);
            } catch (e) {
              console.warn("Error removing route layer:", e);
            }
          }
        });
      }

      // --- 1. Vehicle Markers ---
      vehicles.forEach(vehicle => {
        // Validation for location
        if (!vehicle.location || typeof vehicle.location.lat !== 'number' || typeof vehicle.location.lng !== 'number') {
            return;
        }

        const markerId = `vehicle-${vehicle.id}`;
        let marker = markersRef.current.get(markerId);

        if (!marker) {
          // Create new marker
          const el = document.createElement('div');
          el.className = 'vehicle-marker cursor-pointer';
          el.onclick = () => onVehicleClick && onVehicleClick(vehicle);
          
          const root = createRoot(el);
          const isHighlighted = highlightVehicleId === vehicle.id;
          // Different colors for VAN (blue) and BUS (orange/purple)
          let color = '';
          if (isHighlighted) {
            color = 'bg-black';
          } else if (vehicle.status === 'DELAYED') {
            color = 'bg-red-500';
          } else {
            color = vehicle.type === 'VAN' ? 'bg-blue-500' : 'bg-orange-500';
          }
          
          root.render(
            <VehicleMarker 
              type={vehicle.type} 
              color={color}
              plateNumber={vehicle.plateNumber}
              isHighlighted={isHighlighted}
              status={vehicle.status}
            />
          );
          rootsRef.current.set(markerId, root);

          try {
            marker = new mapboxgl.Marker(el)
              .setLngLat([vehicle.location.lng, vehicle.location.lat])
              .addTo(map.current!);
            markersRef.current.set(markerId, marker);
          } catch (err) {
             console.warn("Failed to create marker:", err);
          }
        } else {
          // Update position
          try {
             marker.setLngLat([vehicle.location.lng, vehicle.location.lat]);
          } catch(err) {
             console.warn("Failed to update marker position:", err);
          }
          
          // Update styling via existing React Root
          const root = rootsRef.current.get(markerId);
          if (root) {
              const isHighlighted = highlightVehicleId === vehicle.id;
              let color = '';
              if (isHighlighted) {
                color = 'bg-black';
              } else if (vehicle.status === 'DELAYED') {
                color = 'bg-red-500';
              } else {
                color = vehicle.type === 'VAN' ? 'bg-blue-500' : 'bg-orange-500';
              }
              root.render(
                <VehicleMarker 
                  type={vehicle.type} 
                  color={color}
                  plateNumber={vehicle.plateNumber}
                  isHighlighted={isHighlighted}
                  status={vehicle.status}
                />
              );
          }
        }
      });

      // --- 2. Student Markers ---
      students.forEach(student => {
        if (!student.location || typeof student.location.lat !== 'number') return;

        const markerId = `student-${student.id}`;
        const marker = markersRef.current.get(markerId);

        if (!marker) {
          const el = document.createElement('div');
          const root = createRoot(el);
          root.render(<StudentMarker status={student.status} name={student.name} />);
          rootsRef.current.set(markerId, root);
          
          const newMarker = new mapboxgl.Marker(el)
            .setLngLat([student.location.lng, student.location.lat])
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="p-2">
                <div class="font-bold text-sm">${student.name}</div>
                <div class="text-xs text-slate-600">${student.address}</div>
                <div class="text-xs mt-1">
                  <span class="px-2 py-0.5 rounded ${student.status === 'WAITING' ? 'bg-orange-100 text-orange-700' : student.status === 'PICKED_UP' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}">
                    ${student.status === 'WAITING' ? 'Aguardando' : student.status === 'PICKED_UP' ? 'Embarcado' : 'Entregue'}
                  </span>
                </div>
              </div>
            `))
            .addTo(map.current!);
          
          markersRef.current.set(markerId, newMarker);
        } else {
          // Update position and styling
          try {
            marker.setLngLat([student.location.lng, student.location.lat]);
          } catch(err) {
            console.warn("Failed to update student marker position:", err);
          }
          
          const root = rootsRef.current.get(markerId);
          if (root) {
            root.render(<StudentMarker status={student.status} name={student.name} />);
          }
        }
      });

      // --- 3. Routes (Polylines) ---
      if (showRoutes && map.current && map.current.isStyleLoaded()) {
         vehicles.forEach(vehicle => {
            const sourceId = `route-${vehicle.id}`;
            
            // Safety check for route
            if (!vehicle.route || !Array.isArray(vehicle.route)) return;

            const coordinates = vehicle.route
                .filter(pt => pt && typeof pt.lat === 'number' && typeof pt.lng === 'number')
                .map(pt => [pt.lng, pt.lat]);
            
            // Mapbox LineString needs at least 2 coordinates
            if (coordinates.length < 2) return;

            const isHighlighted = highlightVehicleId === vehicle.id;
            const routeColor = vehicle.type === 'VAN' 
              ? (isHighlighted ? '#2563eb' : '#60a5fa')
              : (isHighlighted ? '#ea580c' : '#fb923c');

            if (map.current?.getSource(sourceId)) {
               (map.current.getSource(sourceId) as mapboxgl.GeoJSONSource).setData({
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: coordinates
                  }
               });
               // Update layer paint properties
               if (map.current.getLayer(sourceId)) {
                 map.current.setPaintProperty(sourceId, 'line-color', routeColor);
                 map.current.setPaintProperty(sourceId, 'line-width', isHighlighted ? 4 : 2);
                 map.current.setPaintProperty(sourceId, 'line-dasharray', isHighlighted ? [] : [2, 1]);
               }
            } else {
               try {
                  map.current.addSource(sourceId, {
                    type: 'geojson',
                    data: {
                      type: 'Feature',
                      properties: {},
                      geometry: { type: 'LineString', coordinates: coordinates }
                    }
                  });
                  map.current.addLayer({
                    id: sourceId,
                    type: 'line',
                    source: sourceId,
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: {
                      'line-color': routeColor,
                      'line-width': isHighlighted ? 4 : 2,
                      'line-dasharray': isHighlighted ? [] : [2, 1]
                    }
                  });
                  routeLayersRef.current.add(sourceId);
               } catch (e) {
                  console.warn("Error adding route layer:", e);
               }
            }
         });
      }
      } catch (e) {
        console.warn("Error updating map entities:", e);
      }
    };

    if (map.current.isStyleLoaded()) {
      updateMarkers();
    } else {
      map.current.once('style.load', updateMarkers);
    }
  }, [vehicles, students, highlightVehicleId, showRoutes, onVehicleClick]);

  // Handle Highlight FlyTo separately - Disabled auto-centering for better user control
  // Uncomment below if you want auto-centering with delay
  // useEffect(() => {
  //   if (highlightVehicleId && map.current) {
  //      const v = vehicles.find(v => v.id === highlightVehicleId);
  //      if (v && v.location && typeof v.location.lat === 'number') {
  //         // Delay auto-centering to allow user to zoom/pan freely
  //         const timeoutId = setTimeout(() => {
  //           try {
  //             map.current?.flyTo({ 
  //               center: [v.location.lng, v.location.lat], 
  //               zoom: 15, 
  //               speed: 1.5, 
  //               curve: 1,
  //               duration: 2000 // Slower animation
  //             });
  //           } catch(e) {
  //             console.warn("FlyTo error:", e);
  //           }
  //         }, 3000); // 3 second delay before auto-centering
  //         
  //         return () => clearTimeout(timeoutId);
  //      }
  //   }
  // }, [highlightVehicleId, vehicles]); 

  return (
    <div className={`relative bg-slate-100 overflow-hidden ${className}`} style={{ height: '100%', width: '100%', position: 'relative' }}>
      <div ref={mapContainer} className="w-full h-full" style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default MapEngine;