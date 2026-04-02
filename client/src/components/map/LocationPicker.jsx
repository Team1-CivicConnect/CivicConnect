import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { Crosshair } from 'lucide-react';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl, iconUrl, shadowUrl,
});

export default function LocationPicker({ position, setPosition, setAddress, readOnly = false }) {
    const [mapRef, setMapRef] = useState(null);
    const [locking, setLocking] = useState(false);

    const reverseGeocode = async (lat, lng) => {
        if (setAddress) setAddress('Acquiring topographical data...');
        try {
            const { data } = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (data && data.display_name && setAddress) setAddress(data.display_name);
            else if (setAddress) setAddress(`GEO-PIN: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        } catch (error) {
            if (setAddress) setAddress(`SYS-ERR | GEO-PIN: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
    };

    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                if (readOnly) return;
                const { lat, lng } = e.latlng;
                setPosition([lat, lng]);
                reverseGeocode(lat, lng);
                if (mapRef) mapRef.flyTo(e.latlng, mapRef.getZoom());
            },
        });
        return position === null ? null : <Marker position={position}></Marker>;
    };

    const handleCurrentLocation = () => {
        if (readOnly) return;
        setLocking(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    setPosition([lat, lng]);
                    reverseGeocode(lat, lng);
                    if (mapRef) mapRef.flyTo([lat, lng], 17, { duration: 1.5 });
                    setLocking(false);
                },
                (err) => {
                    setLocking(false);
                    alert('Sensor blocked. Please authorize GPS access in your browser.');
                }, { enableHighAccuracy: true }
            );
        } else {
            setLocking(false);
        }
    };

    return (
        <div className="h-full w-full relative z-0 overflow-hidden bg-gray-100">
            <MapContainer
                center={position || [13.0827, 80.2707]} zoom={position ? 16 : 12}
                style={{ height: '100%', width: '100%' }} ref={setMapRef}
                zoomControl={!readOnly} dragging={!readOnly} doubleClickZoom={!readOnly} scrollWheelZoom={!readOnly}
            >
                {/* Advanced Corporate CartoDB layer instead of generic OSM */}
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <LocationMarker />
            </MapContainer>

            {!readOnly && (
                <button
                    onClick={handleCurrentLocation}
                    className="absolute bottom-6 right-6 z-[400] bg-gray-900 text-white px-5 py-3.5 rounded-[20px] shadow-2xl hover:bg-black transition-all flex items-center gap-2 font-black uppercase tracking-widest text-[10px] border border-gray-700 hover:scale-105"
                >
                    <Crosshair size={18} className={`${locking ? 'animate-pulse text-ub-blue-hero' : 'text-ub-green-light'}`} />
                    {locking ? 'Locating...' : 'Satellite Lock'}
                </button>
            )}
        </div>
    );
}
