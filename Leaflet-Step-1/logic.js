// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
  // The data.features object is in the GeoJSON standard
  console.log(data.features);
      
  function mapStyle(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: mapColor(feature.properties.mag),
      color: "#000000",
      radius: mapRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    }
  };
  function mapColor(mag) {
    switch (true) {
      case mag > 5:
        return "#ea2c2c";
      case mag > 4:
        return "#eaa92c";
      case mag > 3:
        return "#d5ea2c";
      case mag > 2:
        return "#92ea2c";
      case mag > 1:
        return "#2ceabf";
      default:
        return "#2c99ea";
    }
  };

  function mapRadius(mag) {
    if (mag === 0) {
      return 1;
    }

    return mag * 4;
  };

  // This is it! Leaflet knows what to do with 
  // each type of feature (held in the `geometry` key) and draws the correct markers.
  var earthquakes = L.geoJSON(data.features, {
    onEachFeature: onEachFeatureFunc,
    style: mapStyle,
    pointToLayer: pointToLayerFunc
  });
  

  // The rest of this is all the same
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
});

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
});

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create color function
function getColor(magnitude) {
  if (magnitude > 5) {
      return 'red'
  } else if (magnitude > 4) {
      return 'orange'
  } else if (magnitude > 3) {
      return 'yellow'
  } else if (magnitude > 2) {
      return 'lightgreen'
  } else if (magnitude > 1) {
      return 'green'
  } else {
      return 'magenta'
  }
};
  // Create Legend
  var legend = L.control({
    position: "bottomleft"
  });

   // details for the legend
   legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "info legend");

    var grades = [0, 1, 2, 3, 4, 5];
    var colors = [];


  // loop through color intervals to put it in the label
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
        '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
}
    return div;

  };

  legend.addTo(myMap)

});

// // https://leafletjs.com/examples/geojson/
// // L.geoJSON() also gives us handy options, almost like a built in `.forEach()`
// // Define a function we want to run once for each feature in the features array
// // Give each feature a popup describing the place and time of the earthquake
function onEachFeatureFunc(feature, layer) {
  layer.bindPopup("<h3> Magnitude:" + feature.properties.mag + "<br>Location: " + feature.properties.place +
    "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
}

var geojsonMarkerOptions = {
  radius: 8,
  fillColor: "#ff7800",
  color: "#000",
  weight: 1,
  opacity: 1,
  fillOpacity: 0.8
};

function pointToLayerFunc(feature, latlng) {
  return L.circleMarker(latlng, geojsonMarkerOptions);
}

