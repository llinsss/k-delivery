export interface Coordinate { latitude: number; longitude: number }
export interface RouteEstimate { distanceKm: number; durationMinutes: number; provider: string }
export interface RoutingService { estimate(origin: Coordinate, destination: Coordinate): Promise<RouteEstimate> }

export class HaversineRoutingService implements RoutingService {
  async estimate(origin: Coordinate, destination: Coordinate): Promise<RouteEstimate> {
    const radians = (value: number) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const lat = radians(destination.latitude - origin.latitude);
    const lon = radians(destination.longitude - origin.longitude);
    const a = Math.sin(lat / 2) ** 2 + Math.cos(radians(origin.latitude)) * Math.cos(radians(destination.latitude)) * Math.sin(lon / 2) ** 2;
    const straightLineKm = earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const roadFactor = 1.25;
    const distanceKm = Math.round(straightLineKm * roadFactor * 10) / 10;
    return { distanceKm, durationMinutes: Math.max(8, Math.ceil((distanceKm / 18) * 60)), provider: "haversine-development" };
  }
}

