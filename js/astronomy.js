const Astro = (() => {
  const DEG = Math.PI / 180;
  const RAD = 180 / Math.PI;

  function julianDate(date) {
    return date.getTime() / 86400000 + 2440587.5;
  }

  // Greenwich Mean Sidereal Time in degrees
  function gmst(date) {
    const JD = julianDate(date);
    const T  = (JD - 2451545.0) / 36525.0;
    let g = 280.46061837
          + 360.98564736629 * (JD - 2451545.0)
          + 0.000387933 * T * T
          - (T * T * T) / 38710000.0;
    return ((g % 360) + 360) % 360;
  }

  // Local Apparent Sidereal Time in degrees
  function lst(date, longitudeDeg) {
    return ((gmst(date) + longitudeDeg) % 360 + 360) % 360;
  }

  // Equatorial (RA/Dec degrees) → Horizontal (alt/az degrees)
  function equatorialToHorizontal(raDeg, decDeg, latDeg, lstDeg) {
    const H    = ((lstDeg - raDeg) % 360 + 360) % 360;
    const Hrad = H   * DEG;
    const dRad = decDeg * DEG;
    const lRad = latDeg * DEG;

    const sinAlt = Math.sin(lRad) * Math.sin(dRad)
                 + Math.cos(lRad) * Math.cos(dRad) * Math.cos(Hrad);
    const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * RAD;

    const cosAlt = Math.cos(alt * DEG);
    if (Math.abs(cosAlt) < 1e-10) return { alt, az: 0 };

    const cosAz = (Math.sin(dRad) - Math.sin(lRad) * sinAlt) / (cosAlt * Math.cos(lRad));
    let az = Math.acos(Math.max(-1, Math.min(1, cosAz))) * RAD;
    if (Math.sin(Hrad) > 0) az = 360 - az;

    return { alt, az };
  }

  // Azimuthal equidistant projection
  // Returns {x, y} in [-1, 1], with (0,0) = zenith, North = up
  function project(alt, az) {
    if (alt < -1) return null;           // below horizon (small margin)
    const r   = (90 - alt) / 90;        // 0 at zenith, 1 at horizon
    const ang = az * DEG;
    return {
      x:  r * Math.sin(ang),
      y: -r * Math.cos(ang),
    };
  }

  // Clamp altitude and project to canvas pixel coords
  function toCanvas(alt, az, cx, cy, radius) {
    const p = project(alt, az);
    if (!p) return null;
    return { x: cx + p.x * radius, y: cy + p.y * radius };
  }

  return { julianDate, gmst, lst, equatorialToHorizontal, project, toCanvas };
})();
