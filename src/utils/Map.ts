import React from "react";

export interface Location {
  latitude: number;
  longitude: number;
}

export interface MapFunctionProps {
  GOOGLE_MAPS_KEY: string;
  location?: Location;
}

export const MapFunction = ({ GOOGLE_MAPS_KEY, location }: MapFunctionProps): string => {
  const lat = location?.latitude ?? 0;
  const lng = location?.longitude ?? 0;

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <style>
      html, body, #map {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
        // margin-top: -40px;
      }

      .location-boundary {
        position: absolute;
        width: 70px;
        height: 70px;
        top: 35%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background: rgba(33,150,243,0.15);
        border: 1.5px solid rgba(33,150,243,0.6);
        box-shadow: 0 0 15px rgba(33,150,243,0.3);
        pointer-events: none;
        z-index: 9;
        animation: pulse 2.8s infinite ease-in-out;
      }

      .location-pin {
        position: absolute;
        top: 35%;
        left: 50%;
        transform: translate(-50%, -100%);
        pointer-events: none;
        z-index: 10;
        transition: transform 0.3s ease;
      }

      @keyframes pulse {
        0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.8; }
        50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.5; }
        100% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.8; }
      }

      @keyframes bounce {
        0% { transform: translate(-50%, -95%); }
        50% { transform: translate(-50%, -110%); }
        100% { transform: translate(-50%, -100%); }
      }
    </style>

    <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}"></script>

    <script>
      let map;

      function initMap() {
        const userLoc = { lat: ${lat}, lng: ${lng} };

        // -----------------------------
        // Initialize Google Map
        // -----------------------------
        map = new google.maps.Map(document.getElementById("map"), {
          center: userLoc,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          gestureHandling: "greedy",
          zoomControl: true,
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          scaleControl: false,
        });

        // -----------------------------
        // User Location Marker
        // -----------------------------
        new google.maps.Marker({
          position: userLoc,
          map,
          clickable: false,
          optimized: true,
          icon: {
            url: "data:image/svg+xml;utf8,${encodeURIComponent(`
              <svg width='36' height='36' viewBox='0 0 24 24'>
                <path fill='%232196f3'
                  d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13
                  c0-3.87-3.13-7-7-7z'/>
                <circle cx='12' cy='9' r='2.5' fill='white'/>
              </svg>
            `)}",
            scaledSize: new google.maps.Size(36, 36),
          },
        });

        // -----------------------------
        // Notify RN MAP READY
        // -----------------------------
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: "MAP_READY" })
          );
        }

        // -----------------------------
        // MAP TAP EVENT
        // -----------------------------
        map.addListener("click", (e) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();

          map.panTo({ lat, lng });

          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({
                type: "MAP_TAP",
                latitude: lat,
                longitude: lng
              })
            );
          }

          const pin = document.querySelector(".location-pin");
          if (pin) {
            pin.style.animation = "none";
            void pin.offsetWidth;
            pin.style.animation = "bounce 0.35s ease";
          }
        });

        // ----------------------------------------------------
        // REAL SCROLL (DRAG) START / END + LAT/LNG
        // ----------------------------------------------------

        // Start dragging
        map.addListener("dragstart", () => {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({ type: "map-scroll-start" })
            );
          }
        });

        // User lifts finger (dragging stops)
        map.addListener("dragend", () => {
          const center = map.getCenter();
          const lat = center.lat();
          const lng = center.lng();

          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({
                type: "map-scroll-end",
                latitude: lat,
                longitude: lng
              })
            );
          }
        });

        // Map finishes movement (idle)
        map.addListener("idle", () => {
          const center = map.getCenter();
          const lat = center.lat();
          const lng = center.lng();

          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({
                type: "map-scroll-end",
                latitude: lat,
                longitude: lng
              })
            );
          }
        });

        // ----------------------------------------------------
        // RESTAURANT MARKERS FROM RN
        // ----------------------------------------------------
        window.markers = [];

        window.updateRestaurants = function(restaurants, selected) {
          window.markers.forEach(m => m.setMap(null));
          window.markers = [];

          restaurants.forEach(r => {
            const marker = new google.maps.Marker({
              position: { lat: r.latitude, lng: r.longitude },
              map,
              title: r.name,
              optimized: true,
              icon: {
                url: "data:image/svg+xml;utf8," + encodeURIComponent(\`
                  <svg width="34" height="34" viewBox="0 0 24 24">
                    <path fill="#e53935" stroke="white" stroke-width="1.2"
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13
                      c0-3.87-3.13-7-7-7z"/>
                    <circle cx="12" cy="9" r="2.5" fill="white"/>
                  </svg>
                \`),
                scaledSize: new google.maps.Size(34, 34),
              }
            });

            marker.addListener("click", () => {
              if (window.ReactNativeWebView)
                window.ReactNativeWebView.postMessage(JSON.stringify(r));
            });

            window.markers.push(marker);
          });
        };
      }

      // -----------------------------
      // RN → RECENTER MAP
      // -----------------------------
      window.setMapCenter = function(lat, lng) {
        if (map) map.panTo({ lat, lng });
      };
    </script>
  </head>

  <body onload="initMap()">
    <div id="map"></div>

    <div class="location-boundary"></div>

    <div class="location-pin">
      <svg width="42" height="42" viewBox="0 0 24 24">
        <path fill="#2196f3"
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13
          c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5" fill="#fff"/>
      </svg>
    </div>
  </body>
</html>
  `;
};