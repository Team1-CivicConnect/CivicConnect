import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix leaflet icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

export default function LocationPicker({ position, setPosition, setAddress }) {
    const [mapRef, setMapRef] = useState(null);

    const reverseGeocode = async (lat, lng) => {
        setAddress('Locating nearest address...');
        try {
            const { data } = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (data && data.display_name) {
                setAddress(data.display_name);
            } else {
                setAddress("Location pin set.");
            }
        } catch (error) {
            console.error("Geocoding failed", error);
            setAddress("Geo-coding unavailable, but coordinates saved.");
        }
    };

    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setPosition([lat, lng]);
                reverseGeocode(lat, lng);
                if (mapRef) mapRef.flyTo(e.latlng, mapRef.getZoom());
            },
        });

        return position === null ? null : <Marker position={position}></Marker>;
    };

    const handleCurrentLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    setPosition([lat, lng]);
                    reverseGeocode(lat, lng);
                    if (mapRef) mapRef.flyTo([lat, lng], 15);
                },
                (err) => {
                    console.error(err);
                    alert('Please allow location access in your browser');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center mb-2">
                <label className="!mb-0 text-ub-text-muted">Drag map or tap to drop pin</label>
                <button
                    type="button"
                    onClick={handleCurrentLocation}
                    className="text-xs font-semibold text-white bg-ub-blue-hero px-3 py-1.5 rounded flex items-center gap-1 hover:bg-ub-blue-dark transition-colors"
                >
                    📍 Use My Location
                </button>
            </div>
            <div className="h-[300px] w-full rounded-xl overflow-hidden shadow-sm border border-ub-border relative z-0">
                <MapContainer
                    center={position || [13.0827, 80.2707]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    ref={setMapRef}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker />
                </MapContainer>
            </div>
        </div>
    );
}
