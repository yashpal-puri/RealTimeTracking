import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client'
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet'
import "leaflet/dist/leaflet.css";

const socket = io('https://realtimetracking.onrender.com');


const UpdateMapCenter = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(position, map.getZoom());
    }, [position, map]);
    return null;
}

const Map = () => {

    const [users, setUsers] = useState([]);
    const mapRef = useRef();
    const [position, setPosition] = useState([51.505, -0.09])

    useEffect(() => {
        let watchId;
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    socket.emit('joinMapRequest', { latitude: latitude, longitude: longitude }, (arg) => {
                    // socket.emit('joinMapRequest', { latitude, longitude }, (arg) => {
                        console.log(arg);
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        }
        socket.on('connectUser', (data) => {
            setUsers(prev => {
                const dt = prev.filter(ob => ob.id !== data.id);
                return [...dt, data];
            });
            setPosition([data.latitude,data.longitude]);            
        });
        socket.on('removeUser', (data) => {
            setUsers(prev => (prev.filter(skt => skt.id !== data.id)));
        });

        return () => {
            if (navigator.geolocation && watchId) {
                navigator.geolocation.clearWatch(watchId);
            }
            socket.off('connectUser');
            socket.off('removeUser');
        }
    }, []);



    return (
        <div>
            <MapContainer center={position} zoom={16} ref={mapRef} style={{ height: "90vh", width: "90vw" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <UpdateMapCenter position={position} />
                {
                    users.map(user => (
                        <Marker key={user.id} position={[user.latitude,user.longitude]}>
                            <Popup>
                                User - {user.id} || {users.length}
                            </Popup>
                        </Marker>
                    ))
                }
            </MapContainer>
        </div>
    );
}

export default Map;
