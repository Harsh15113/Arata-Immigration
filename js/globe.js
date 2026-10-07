// Hero background globe — amCharts 5 (orthographic projection).
// Purely decorative: auto-rotates 360° every 30s on an infinite loop and
// ignores all mouse/touch input so the page scrolls normally over it.
document.addEventListener('DOMContentLoaded', function () {
  var globeDiv = document.getElementById('hero-globe');
  if (!globeDiv) return;
  if (typeof am5 === 'undefined' || typeof am5map === 'undefined' || typeof am5geodata_worldLow === 'undefined') {
    // amCharts failed to load (offline, CDN blocked, etc.) — hero still
    // works fine with its plain gradient background.
    return;
  }

  var ORANGE = 0xED6B21;
  var ORANGE_DARK = 0xC6540F;
  var WHITE = 0xFFFFFF;

  am5.ready(function () {
    var root = am5.Root.new('hero-globe');
    root.setThemes([am5themes_Animated.new(root)]);

    var chart = root.container.children.push(
      am5map.MapChart.new(root, {
        projection: am5map.geoOrthographic(),
        panX: 'none',
        panY: 'none',
        wheelX: 'none',
        wheelY: 'none',
        pinchZoom: false,
        rotationX: -10,
        rotationY: -15,
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0
      })
    );

    // Background "ocean" sphere — bold theme orange.
    var backgroundSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {}));
    backgroundSeries.mapPolygons.template.setAll({
      fill: am5.color(ORANGE),
      stroke: am5.color(ORANGE),
      strokeWidth: 0,
      interactive: false
    });
    backgroundSeries.data.push({
      geometry: am5map.getGeoRectangle(90, 180, -90, -180)
    });

    // Graticule (lat/long grid) — soft white lines for depth against the orange base.
    var graticuleSeries = chart.series.push(am5map.GraticuleSeries.new(root, {}));
    graticuleSeries.mapLines.template.setAll({
      stroke: am5.color(WHITE),
      strokeOpacity: 0.22,
      strokeWidth: 1
    });

    // Countries.
    var polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow
      })
    );
    polygonSeries.mapPolygons.template.setAll({
      fill: am5.color(WHITE),
      fillOpacity: 0.96,
      stroke: am5.color(ORANGE_DARK),
      strokeWidth: 0.6,
      strokeOpacity: 0.8,
      interactive: false
    });

    // Auto-rotation: one full 360° turn every 30s, infinite loop.
    chart.animate({
      key: 'rotationX',
      from: chart.get('rotationX') || 0,
      to: (chart.get('rotationX') || 0) + 360,
      duration: 30000,
      loops: Infinity
    });
  });
});
