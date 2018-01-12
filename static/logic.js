// set the earthquake data url
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// get the earthquake data from api
d3.json(queryUrl,
  function(data) {
    var getInterval = function(eathquakeData) {
      return {
        start: eathquakeData.properties.time,
        end: eathquakeData.properties.time + eathquakeData.properties.mag * 1800000 * 2
      };
    };

    // set the timeline of earthquake using Leaflet's timeline method
    var earthquakeTime = L.timeline(data, {
      getInterval: getInterval,
      pointToLayer: function(eathquakeData, latlng) {
        return L.circleMarker(latlng, {
          radius: eathquakeData.properties.mag * 6,
          color: perc2color(50 - (eathquakeData.properties.mag * 10)),
          opacity: 0.75,
          fillOpacity: 0.75,
          weight: 0
        }).bindPopup("<h3>" + eathquakeData.properties.place +
        "</h3><hr><p>" + new Date(eathquakeData.properties.time) + "</p>" + "<p>" +"Magnitude: "+eathquakeData.properties.mag + "</p>");
      }
    });

    // create a slider control 
    var sliderControl = L.timelineSliderControl({
      formatOutput: function(date) {
        return new Date(date).toString();
      },
      steps: 500
    });

    // add slider to map
    sliderControl.addTo(myMap);
    sliderControl.addTimelines(earthquakeTime);
    earthquakeTime.addTo(slider);
    slider.addTo(myMap);


    // add the eathquake data to a Leaflet layer
    L.geoJson(data, {
      pointToLayer: function(eathquakeData, latlng) {
        return L.circleMarker(latlng, {
          radius: eathquakeData.properties.mag * 6,
          color: perc2color(50 - (eathquakeData.properties.mag * 10)),
          opacity: 0.75,
          fillOpacity: 0.75,
          weight: 0
        }).bindPopup("<h3>" + eathquakeData.properties.place +
        "</h3><hr><p>" + new Date(eathquakeData.properties.time) + "</p>" + "<p>" +"Magnitude: "+eathquakeData.properties.mag + "</p>");
      }
    }).addTo(earthquakes);

    // create a legend and add to the map
    var legend = L.control({
      position: "bottomright"
    });

    legend.onAdd = function () {
      
          var div = L.DomUtil.create('div', 'info legend'),
          grades = [0, 1, 2, 3, 4, 5],
          labels = [];
      
          for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
              '<i style="background:' + perc2color(50 - ((grades[i]) * 10)) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
    };
    
    legend.addTo(myMap);

    // get the faultline/tectonic plate data and add it to another layer
    var queryUrl1 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
    d3.json(queryUrl1,
      function(platedata) {
        L.geoJson(platedata, {
          color: "red",
          weight: 2
        }).addTo(
          faultlines
        );
        faultlines.addTo(myMap);
      }
    );
  }
);

// crete variables for various leaflet tileLayer and associate them to the map types from mapbox  
var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/sam34/cjc0oizjh2cs42so31yhgqq15/tiles/256/{z}/{x}/{y}?" + 
"access_token=pk.eyJ1Ijoic2FtMzQiLCJhIjoiY2pha2ExbGprMmN5MzJxbGQ0OWo0em90YSJ9." + 
"NNt33NeQg00DqV419ZEusw");

var greyscale = L.tileLayer("https://api.mapbox.com/styles/v1/sam34/cjc0odo7gglv22rml7p8b2453/tiles/256/{z}/{x}/{y}?" +
"access_token=pk.eyJ1Ijoic2FtMzQiLCJhIjoiY2pha2ExbGprMmN5MzJxbGQ0OWo0em90YSJ9." +
"NNt33NeQg00DqV419ZEusw");

var outdoor = L.tileLayer("https://api.mapbox.com/styles/v1/sam34/cjc0o9oy6glr32rmlr7nr34el/tiles/256/{z}/{x}/{y}?" +
"access_token=pk.eyJ1Ijoic2FtMzQiLCJhIjoiY2pha2ExbGprMmN5MzJxbGQ0OWo0em90YSJ9." +
"NNt33NeQg00DqV419ZEusw");

// create the map
var myMap = L.map("map", {
  center: [ 0, 0 ],
  zoom: 3,
  layers: [satellite, outdoor, greyscale]
});

// create various layers for map
var faultlines = new L.LayerGroup();
var earthquakes = new L.LayerGroup();
var slider = new L.LayerGroup();

// set the basemap layers
var baseMaps = {
  Outdoors: outdoor,
  Satellite: satellite,
  Grayscale: greyscale,
};

// set the overlay map layers
var overlays = {
  "Timeline": slider,
  "Fault Line": faultlines,
  "All Earthquakes": earthquakes
};

// add the layers to map
L.control.layers(baseMaps, overlays, {
  collapsed: false
}).addTo(myMap);

// function to create color 
function perc2color(perc) {
  var r, g, b = 0;
  if(perc < 50) {
    r = 255;
    g = Math.round(5.1 * perc);
  }
  else {
    g = 255;
    r = Math.round(510 - 5.10 * perc);
  }
  var h = r * 0x10000 + g * 0x100 + b * 0x1;
  return '#' + ('000000' + h.toString(16)).slice(-6);
}
