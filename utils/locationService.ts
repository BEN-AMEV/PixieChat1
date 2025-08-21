import * as Location from 'expo-location';
import api from '../app/api/api';

export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  activity?: string;
  speed?: number;
}

export interface FriendLocation {
  id: string;
  latitude: number;
  longitude: number;
  status: string;
  activity: string;
  speed: number;
  isOnline: boolean;
  shareLocation: boolean;
  lastLocationUpdate: number;
}

class LocationService {
  private locationSubscription: Location.LocationSubscription | null = null;
  private isSharing = false;
  private updateInterval: number | null = null;

  // Request location permissions
  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  // Get current location
  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: Date.now(),
        activity: 'using app',
        speed: location.coords.speed || 0,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  // Start sharing location
  async startSharingLocation(): Promise<void> {
    if (this.isSharing) return;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Location permission denied');
    }

    this.isSharing = true;

    // Share initial location
    const currentLocation = await this.getCurrentLocation();
    if (currentLocation) {
      await this.shareLocation(currentLocation);
    }

    // Set up periodic location updates
    this.updateInterval = setInterval(async () => {
      if (this.isSharing) {
        const location = await this.getCurrentLocation();
        if (location) {
          await this.shareLocation(location);
        }
      }
    }, 30000); // Update every 30 seconds
  }

  // Stop sharing location
  stopSharingLocation(): void {
    this.isSharing = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Share location with friends
  private async shareLocation(locationData: LocationData): Promise<void> {
    try {
      await api.post('/location/share', locationData);
      console.log('Location shared successfully');
    } catch (error) {
      console.error('Error sharing location:', error);
    }
  }

  // Get friends' locations
  async getFriendsLocations(): Promise<FriendLocation[]> {
    try {
      const response = await api.get('/friends/locations');
      return response.data?.friends || [];
    } catch (error) {
      console.error('Error fetching friends locations:', error);
      return [];
    }
  }

  // Watch location changes
  async watchLocation(callback: (location: LocationData) => void): Promise<void> {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Location permission denied');
    }

    this.locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000, // Update every 10 seconds
        distanceInterval: 10, // Update every 10 meters
      },
      (location) => {
        const locationData: LocationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: Date.now(),
          activity: 'moving',
          speed: location.coords.speed || 0,
        };
        callback(locationData);
      }
    );
  }

  // Stop watching location
  stopWatchingLocation(): void {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
  }

  // Calculate distance between two points
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Get activity based on speed
  getActivityFromSpeed(speed: number): string {
    if (speed > 50) return 'driving';
    if (speed > 20) return 'cycling';
    if (speed > 5) return 'walking';
    return 'stationary';
  }

  // Check if location is recent (within 5 minutes)
  isLocationRecent(timestamp: number): boolean {
    return Date.now() - timestamp < 300000; // 5 minutes
  }

  // Check if user is online based on last activity
  isUserOnline(lastSeen: number): boolean {
    return Date.now() - lastSeen < 300000; // 5 minutes
  }
}

export default new LocationService(); 