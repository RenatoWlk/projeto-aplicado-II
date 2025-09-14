import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { MapService, Location } from './map.service';
import { Subscription } from 'rxjs';
import { PreloaderComponent } from '../../shared/preloader/preloader.component';
import { AuthService } from '../../core/services/auth/auth.service';

const MAP_ZOOM = 16;

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

  userLocation: Location | null = null;
  locations: Location[] = [];
  selectedLocation: Location | null = null;
  isLoadingLocations = true;

  constructor(
    private mapService: MapService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getCurrentUserId();
    this.fetchUserLocation();
    this.fetchLocations();
  }

  ngOnDestroy(): void {
    this.locationsSub?.unsubscribe();
    this.map?.remove();
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
    this.mapService.getUserLocation(this.userId).subscribe((location) => {
      this.userLocation = location;
      this.tryInitMap();
    });
  }

  /** Get all available locations from service */
  private fetchLocations(): void {
    this.locationsSub = this.mapService.getLocations().subscribe((locations) => {
      this.locations = locations;
      this.isLoadingLocations = false;
      this.tryInitMap(); // Wait for both location and locations
    });
  }

  /**
   * Initialize map only after both user location and location list are available.
   */
  private tryInitMap(): void {
    if (!this.userLocation || this.locations.length === 0 || this.map) return;

    this.map = L.map('map', {
      center: [this.userLocation.latitude, this.userLocation.longitude] as L.LatLngExpression,
      zoom: MAP_ZOOM,
      minZoom: 11,
      maxZoom: 17,
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
    this.selectedLocation = location;
    this.map.setView(
      [location.latitude, location.longitude] as L.LatLngExpression,
      15
    );
  }
}
