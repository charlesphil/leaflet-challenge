// Constant for accessing all earthquake data from the past 7 days
const URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(URL).then(data => {
    // Get features from response in promise
    let features = data["features"];
    // Run our create features function
    createFeatures(features);
});

let colors = ["#a3f600", "#dcf400", "#f7db11", "#fdb72a", "#fca35d", "#ff5f65"];
let categories = ["<10", "10-30", "30-50", "50-70", "70-90", ">90"];

function setCircleColor(depth) {
    if (depth >= 90) {
        return colors[5];
    } else if (depth >=70) {
        return colors[4];
    } else if (depth >= 50) {
        return colors[3];
    } else if (depth >= 30) {
        return colors[2];
    } else if (depth >= 10) {
        return colors[1];
    } else {
        return colors[0];
    }
}

// Adds marker to location of earthquake
function createFeatures (earthquakeData) {
    // Define inner function to create popup for each marker
    function onEachFeature (feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p><p>${new Date(feature.properties.time)}</p>`);
    }

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function(feature, latlng) {
            return new L.circle(latlng, {
                radius: feature.properties.mag * 20000,
                fillOpacity: 0.85,
                stroke: true,
                color: 'black',
                weight: 1,
                fillColor: setCircleColor(feature.geometry.coordinates[2])
            });
        }
    });

    // Send our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {
    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    let host = 'https://maps.omniscale.net/v2/{id}/style.grayscale/{z}/{x}/{y}.png?hq={hq}';

    let attribution = '&copy; 2022 &middot; <a href="https://maps.omniscale.com/">Omniscale</a> ' +
        '&middot; Map data: <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

    let grayscale = L.tileLayer(host, {
        id: 'my-grayscale-720e1d78',
        hq: L.Browser.retina,
        attribution: attribution
    });

    // Create a baseMaps object.
    let baseMaps = {
        "Grayscale Map": grayscale,
        "Topographic Map": topo,
        "Street Map": street
    };

    // Create an overlay object to hold our overlay.
    let overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [grayscale, earthquakes]
    });

    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Add the legend
    let legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend');
        labels = ['<strong>Depth of Epicenter</strong><br>'];
        example= [0, 10, 30, 50, 70, 90];
        for (let i = 0; i < categories.length; i++) {
            div.innerHTML +=
                labels.push(
                    '<i class="circle" style="background:' + setCircleColor(example[i]) + '"></i> ' +
                    (categories[i] ? categories[i] : '+'));
        }
        div.innerHTML = labels.join('<br>');
        return div;
    };
    legend.addTo(myMap);
}
