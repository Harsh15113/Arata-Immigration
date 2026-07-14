// Hero background globe — amCharts 5 (orthographic projection).
// Auto-rotates 360° every 30s on an infinite loop; pauses while the user
// drags the globe or the slider, then resumes from wherever it was left.
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
        panX: 'rotateX',
        panY: 'rotateY',
        wheelY: 'zoom',
        wheelSensitivity: 0.7,
        minZoomLevel: 0.9,
        maxZoomLevel: 5,
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
      tooltipText: '{name}',
      fill: am5.color(WHITE),
      fillOpacity: 0.96,
      stroke: am5.color(ORANGE_DARK),
      strokeWidth: 0.6,
      strokeOpacity: 0.8,
      interactive: true,
      cursorOverStyle: 'pointer'
    });
    polygonSeries.mapPolygons.template.states.create('hover', {
      fill: am5.color(ORANGE_DARK)
    });
    polygonSeries.mapPolygons.template.states.create('active', {
      fill: am5.color(ORANGE_DARK),
      stroke: am5.color(WHITE),
      strokeWidth: 1.5
    });

    // Click to select a country (toggle).
    var selected;
    polygonSeries.mapPolygons.template.events.on('click', function (ev) {
      var target = ev.target;
      if (selected && selected !== target) selected.set('active', false);
      var nowActive = !target.get('active');
      target.set('active', nowActive);
      selected = nowActive ? target : undefined;
    });

    // ---- Auto-rotation: one full 360° turn every 30s, infinite loop. ----
    var rotationAnimation;
    function startAutoRotate() {
      var current = chart.get('rotationX') || 0;
      rotationAnimation = chart.animate({
        key: 'rotationX',
        from: current,
        to: current + 360,
        duration: 30000,
        loops: Infinity
      });
    }
    function stopAutoRotate() {
      if (rotationAnimation) {
        rotationAnimation.stop();
        rotationAnimation = undefined;
      }
    }
    startAutoRotate();

    // Pause on manual drag / zoom interaction, resume shortly after release.
    var resumeTimer;
    function pauseForInteraction() {
      stopAutoRotate();
      clearTimeout(resumeTimer);
    }
    function scheduleResume() {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(startAutoRotate, 1400);
    }
    globeDiv.addEventListener('pointerdown', pauseForInteraction);
    globeDiv.addEventListener('wheel', function () {
      pauseForInteraction();
      scheduleResume();
    }, { passive: true });
    window.addEventListener('pointerup', function () {
      scheduleResume();
    });

    // ---- Slider control: drag to spin the globe horizontally. ----
    var slider = document.getElementById('globe-slider');
    if (slider) {
      var sliderActive = false;
      slider.addEventListener('pointerdown', function () {
        sliderActive = true;
        pauseForInteraction();
      });
      slider.addEventListener('input', function () {
        chart.set('rotationX', parseFloat(slider.value));
      });
      slider.addEventListener('pointerup', function () {
        sliderActive = false;
        scheduleResume();
      });

      // Keep the slider in sync while the globe auto-rotates.
      setInterval(function () {
        if (sliderActive) return;
        var rot = chart.get('rotationX') || 0;
        var normalized = ((rot % 360) + 360) % 360;
        slider.value = normalized;
      }, 250);
    }
  });
});
