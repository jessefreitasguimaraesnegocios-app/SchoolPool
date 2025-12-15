import { Vehicle, Student, VehicleStatus, Coordinates, RouteStop } from '../types';

// Center around São Paulo, Brazil (Av. Paulista area)
const CENTER_LAT = -23.5614;
const CENTER_LNG = -46.6565;

export const AVAILABLE_DRIVERS = [
  "John Doe", "Sarah Smith", "Mike Ross", "Emily Blunt", 
  "David Kim", "Jessica Chen", "Robert Ford", "Lisa Wong"
];

export const PRESET_DESTINATIONS = [
  "Lincoln High", 
  "Washington Elementary", 
  "Roosevelt Middle School", 
  "Jefferson Academy"
];

// Helper to generate coordinates near the center
const nearbyCoord = (latOffset = 0, lngOffset = 0): Coordinates => ({
  lat: CENTER_LAT + latOffset + (Math.random() * 0.01 - 0.005),
  lng: CENTER_LNG + lngOffset + (Math.random() * 0.01 - 0.005),
});

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    driverName: 'John Doe',
    plateNumber: 'SCH-2024',
    type: 'VAN',
    capacity: 12,
    currentPassengers: 4,
    location: nearbyCoord(0.002, -0.002),
    status: VehicleStatus.EN_ROUTE,
    route: [
      nearbyCoord(0.002, -0.002), 
      nearbyCoord(0.005, 0.005), 
      { lat: -23.5505, lng: -46.6333 } // Sé Square (School)
    ],
    nextStopEta: 5,
    destinationSchool: 'Lincoln High',
  },
  {
    id: 'v2',
    driverName: 'Sarah Smith',
    plateNumber: 'BUS-99',
    type: 'BUS',
    capacity: 40,
    currentPassengers: 32,
    location: nearbyCoord(-0.005, 0.005),
    status: VehicleStatus.DELAYED,
    route: [
      nearbyCoord(-0.005, 0.005), 
      nearbyCoord(0, 0), 
      { lat: -23.5505, lng: -46.6333 }
    ],
    nextStopEta: 12,
    destinationSchool: 'Lincoln High',
  },
  {
    id: 'v3',
    driverName: 'Mike Ross',
    plateNumber: 'VAN-X1',
    type: 'VAN',
    capacity: 10,
    currentPassengers: 0,
    location: nearbyCoord(-0.01, -0.01),
    status: VehicleStatus.IDLE,
    route: [],
    nextStopEta: 0,
    destinationSchool: 'Washington Elementary',
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 's1',
    name: 'Alice Johnson',
    address: 'R. Augusta, 1500',
    location: nearbyCoord(0.004, 0.004),
    status: 'WAITING',
    vehicleId: 'v1',
  },
  {
    id: 's2',
    name: 'Bob Williams',
    address: 'Av. Paulista, 900',
    location: nearbyCoord(0.006, 0.006),
    status: 'WAITING',
    vehicleId: 'v1',
  },
  {
    id: 's3',
    name: 'Charlie Brown',
    address: 'R. da Consolação, 500',
    location: nearbyCoord(0.001, -0.001),
    status: 'PICKED_UP',
    vehicleId: 'v1',
  }
];

// Driver's specific route (Mocked for v1)
export const DRIVER_ROUTE: RouteStop[] = [
  {
    id: 'stop1',
    studentId: 's3',
    location: nearbyCoord(0.001, -0.001),
    completed: true,
    type: 'PICKUP',
    eta: 'Completed',
  },
  {
    id: 'stop2',
    studentId: 's1',
    location: nearbyCoord(0.004, 0.004),
    completed: false,
    type: 'PICKUP',
    eta: '5 min',
  },
  {
    id: 'stop3',
    studentId: 's2',
    location: nearbyCoord(0.006, 0.006),
    completed: false,
    type: 'PICKUP',
    eta: '12 min',
  },
  {
    id: 'stop4',
    location: { lat: -23.5505, lng: -46.6333 },
    completed: false,
    type: 'SCHOOL',
    eta: '25 min',
  }
];

// Function to move vehicles slightly towards their next target
export const moveVehicles = (vehicles: Vehicle[]): Vehicle[] => {
  return vehicles.map(v => {
    if (v.status === VehicleStatus.IDLE || v.route.length < 2) return v;

    const target = v.route[1]; // Current target is the next point in route
    const dx = target.lng - v.location.lng;
    const dy = target.lat - v.location.lat;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 0.0001) return v; // Close enough (approx 10m)

    const speed = 0.0003; // degrees per tick (approx 30m)
    const ratio = Math.min(speed / distance, 1);

    return {
      ...v,
      location: {
        lng: v.location.lng + dx * ratio,
        lat: v.location.lat + dy * ratio,
      }
    };
  });
};