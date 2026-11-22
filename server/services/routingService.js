/**
 * Calculate Great-circle distance between two [lng, lat] points using Haversine formula
 */
const calculateDistanceKm = (coord1, coord2) => {
  if (!coord1 || !coord2) return 0;
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(2);
};

/**
 * Calculate compass bearing (heading) in degrees (0 - 360)
 */
const calculateBearing = (startCoord, endCoord) => {
  if (!startCoord || !endCoord) return 0;
  const [lon1, lat1] = startCoord;
  const [lon2, lat2] = endCoord;

  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);

  return Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360);
};

/**
 * Generate a realistic fallback curved road path between start and destination
 */
const generateFallbackRoute = (startCoord, destCoord, numPoints = 25) => {
  const [lon1, lat1] = startCoord;
  const [lon2, lat2] = destCoord;
  const waypoints = [];

  // Perpendicular vector for realistic road curves
  const midLon = (lon1 + lon2) / 2;
  const midLat = (lat1 + lat2) / 2;
  const dx = lon2 - lon1;
  const dy = lat2 - lat1;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Linear interpolation
    let currLon = lon1 + dx * t;
    let currLat = lat1 + dy * t;

    // Add gentle bezier sinusoidal curve to simulate road curves
    const curveAmp = 0.008 * Math.sin(Math.PI * t);
    currLon += -dy * curveAmp;
    currLat += dx * curveAmp;

    waypoints.push([+currLon.toFixed(6), +currLat.toFixed(6)]);
  }

  return waypoints;
};

/**
 * Fetch real route from OSRM with graceful fallback
 */
const getRouteWaypoints = async (startCoord, destCoord) => {
  try {
    const [startLng, startLat] = startCoord;
    const [destLng, destLat] = destCoord;

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(osrmUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (
        data &&
        data.routes &&
        data.routes.length > 0 &&
        data.routes[0].geometry &&
        data.routes[0].geometry.coordinates
      ) {
        const coords = data.routes[0].geometry.coordinates;
        const totalDist = +(data.routes[0].distance / 1000).toFixed(2);
        const totalDurationMin = Math.round(data.routes[0].duration / 60);

        return {
          waypoints: coords,
          totalDistanceKm: totalDist,
          estimatedMinutes: Math.max(5, totalDurationMin),
          isRealRoad: true,
        };
      }
    }
  } catch (err) {
    // Network timeout, rate limit, or offline - fallback safely
    console.debug('OSRM routing request bypassed, using realistic road generator:', err.message);
  }

  // Fallback
  const fallbackWaypoints = generateFallbackRoute(startCoord, destCoord, 24);
  const dist = calculateDistanceKm(startCoord, destCoord);
  // Average city ambulance speed ~ 40 km/h -> ~1.5 mins per km
  const estimatedMin = Math.max(5, Math.round(dist * 1.6));

  return {
    waypoints: fallbackWaypoints,
    totalDistanceKm: dist,
    estimatedMinutes: estimatedMin,
    isRealRoad: false,
  };
};

module.exports = {
  calculateDistanceKm,
  calculateBearing,
  generateFallbackRoute,
  getRouteWaypoints,
};
