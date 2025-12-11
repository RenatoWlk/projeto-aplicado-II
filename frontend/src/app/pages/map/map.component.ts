import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { MapService, Location } from './map.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { PreloaderComponent } from '../../shared/preloader/preloader.component';
import { AuthService } from '../../core/services/auth/auth.service';
import { NotificationBannerService } from '../../shared/notification-banner/notification-banner.service';

const MAP_ZOOM = 16;
const MAP_MIN_ZOOM = 8;
const MAP_MAX_ZOOM = 17;

/** Blue icon (user marker) */
const blueIcon = new L.Icon({
  iconUrl: 'assets/marker-icon-2x.png',
  shadowUrl: 'assets/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/** Red icon (locations) */
const redIcon = new L.Icon({
  iconUrl: 'assets/marker-icon-2x-red.png',
  shadowUrl: 'assets/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, PreloaderComponent],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnDestroy, AfterViewInit {
  private map!: L.Map;
  private markersLayer = L.layerGroup();
  private locationsSub?: Subscription;
  private userId!: string;
  private destroy$ = new Subject<void>();

  userLocation: Location | null = null;
  locations: Location[] = [];
  selectedLocation: Location | null = null;
  isLoadingLocations = true;

  constructor(
    private mapService: MapService,
    private authService: AuthService,
    private notificationBannerService: NotificationBannerService,
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getCurrentUserId();
    this.fetchUserLocation();
    this.fetchLocations();
  }

  ngOnDestroy(): void {
    this.locationsSub?.unsubscribe();
    this.map?.remove();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Used for size correction */
  ngAfterViewInit(): void {
    // Ensure that map will be resized after DOM is fully rendered
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 200);
  }

  /** Get user location from service */
  private fetchUserLocation(): void {
    this.mapService.getUserLocation(this.userId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (location) => {
        this.userLocation = location;
        if (this.locations.length > 0 && this.userLocation) {
          this.tryInitMap();
        }
      },
      error: () => {
        this.notificationBannerService.show("Não foi possível carregar a sua localização. Tente novamente mais tarde.", 'error', 3000);
      }
    })
  }

  /** Get all available locations from service */
  private fetchLocations(): void {
    this.locationsSub = this.mapService.getLocations().subscribe({
      next: (locations) => {
        this.locations = locations;
        this.isLoadingLocations = false;

        if (this.userLocation) {
          this.sortLocationsByDistance();
        }
        if (this.locations.length > 0 && this.userLocation) {
          this.tryInitMap();
        }
      },
      error: () => {
        this.notificationBannerService.show("Não foi possível carregar as localizações. Tente novamente mais tarde.", 'error', 1500);
      }
    });
  }

  /**
   * Initialize map only after both user location and location list are available.
   */
  private tryInitMap(): void {
    if (!this.userLocation || this.locations.length === 0 || this.map) {
      return;
    }

    this.map = L.map('map', {
      center: [this.userLocation.latitude, this.userLocation.longitude] as L.LatLngExpression,
      zoom: MAP_ZOOM,
      minZoom: MAP_MIN_ZOOM,
      maxZoom: MAP_MAX_ZOOM,
      zoomControl: true,
    });

    this.loadMapTiles();
    this.markersLayer.addTo(this.map);
    this.renderMarkers();

    this.map.whenReady(() => {
      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);
    });
  }

  /** Load OpenStreetMap tiles */
  private loadMapTiles(): void {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      subdomains: ['a', 'b', 'c'],
      detectRetina: true,
      maxZoom: 17,
      tileSize: 256,
      errorTileUrl: 'assets/tile-error.png',
    }).addTo(this.map);
  }

  /** Render all markers on the map */
  private renderMarkers(): void {
    this.markersLayer.clearLayers();

    if (this.userLocation) {
      this.addMarker(this.userLocation, true);
    }

    this.locations.forEach((loc) => this.addMarker(loc, false));
  }

  /** 
   * Add a marker to the map.
   * 
   * @param loc the location to put on the map
   * @param isUser if the marker is for the user logged in
   */
  private addMarker(loc: Location, isUser: boolean): void {
    const icon = isUser ? blueIcon : redIcon;
    const popupContent = isUser
      ? `<b>Você está aqui!</b><br><br><b>Endereço: </b>${loc.address.street} - ${loc.address.city}-${loc.address.state} - ${loc.address.zipCode}<br><b>Telefone:</b> ${loc.phone}`
      : `<b>${loc.name}</b><br><br><b>Endereço: </b>${loc.address.street} - ${loc.address.city}-${loc.address.state} - ${loc.address.zipCode}<br><br><b>Telefone: </b>${loc.phone}`;

    const marker = L.marker([loc.latitude, loc.longitude] as L.LatLngExpression, { icon })
      .on('click', () => this.selectLocation(loc))
      .bindPopup(popupContent);

    marker.addTo(this.markersLayer);
  }

  /** 
   * Focus the map on selected location
   * 
   * @param location the location to be focused on the map
   */
  selectLocation(location: Location): void {
    if (location === undefined) {
      this.notificationBannerService.show("Não foi possível selecionar a localização. Tente novamente mais tarde.", 'error', 3000);
      return;
    }

    if (this.map === undefined) {
      this.notificationBannerService.show("Não foi possível selecionar a localização. Tente novamente mais tarde.", 'error', 3000);
      return;
    }

    this.selectedLocation = location;
    this.map.setView([location.latitude, location.longitude] as L.LatLngExpression, 15);
  }

  /** Calculate distance between two coordinates using Haversine formula */
  private getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // returns km
  }

  /** Sort locations by distance to the current user */
  private sortLocationsByDistance(): void {
    if (!this.userLocation) return;

    const { latitude, longitude } = this.userLocation;

    this.locations.sort((a, b) => {
      const distA = this.getDistance(latitude, longitude, a.latitude, a.longitude);
      const distB = this.getDistance(latitude, longitude, b.latitude, b.longitude);
      return distA - distB;
    });
  }
}