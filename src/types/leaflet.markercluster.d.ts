declare module 'leaflet.markercluster' {
  export class MarkerClusterGroup {
    constructor(options?: any);
    addLayer(layer: any): void;
    removeLayer(layer: any): void;
    clearLayers(): void;
    getChildCount(): number;
  }
  
  const markerCluster: any;
  export default markerCluster;
}
