/*--------------------------------------------------------------------
GGR472 LAB 4: Incorporating GIS Analysis into web maps using Turf.js 
--------------------------------------------------------------------*/

/*--------------------------------------------------------------------
Step 1: INITIALIZE MAP
--------------------------------------------------------------------*/
// Define access token
mapboxgl.accessToken =
  "pk.eyJ1IjoiamVzc2ljYWh1YW5nIiwiYSI6ImNtazNjNmdmeTBkN3AzZnEyZHRscHdod28ifQ.Pa9LhzBk1H75KBMwBngDjA";
//****ADD YOUR PUBLIC ACCESS TOKEN*****

// Initialize map and edit to your preference
const map = new mapboxgl.Map({
  container: "map", // container id in HTML
  style: "mapbox://styles/jessicahuang/cmmnx7kte003n01s125302mbb", // ****ADD MAP STYLE HERE *****
  center: [-79.36, 43.73], // starting point, longitude/latitude
  zoom: 10.2, // starting zoom level
  bearing: -17,
  pitch: 0,
});

const initialView = {
  center: [-79.33, 43.73],
  zoom: 10.2,
  bearing: -17,
  pitch: 0,
};

/*--------------------------------------------------------------------
Step 2: VIEW GEOJSON POINT DATA ON MAP
--------------------------------------------------------------------*/
//HINT: Create an empty variable
//      Use the fetch method to access the GeoJSON from your online repository
//      Convert the response to JSON format and then store the response in your new variable

/*--------------------------------------------------------------------
    Step 3: CREATE BOUNDING BOX AND HEXGRID
--------------------------------------------------------------------*/
//HINT: All code to create and view the hexgrid will go inside a map load event handler
//      First create a bounding box around the collision point data
//      Access and store the bounding box coordinates as an array variable
//      Use bounding box coordinates as argument in the turf hexgrid function
//      **Option: You may want to consider how to increase the size of your bbox to enable greater geog coverage of your hexgrid
//      Consider return types from different turf functions and required argument types carefully here

/*--------------------------------------------------------------------
Step 4: AGGREGATE COLLISIONS BY HEXGRID
--------------------------------------------------------------------*/
//HINT: Use Turf collect function to collect all '_id' properties from the collision points data for each heaxagon
//      View the collect output in the console. Where there are no intersecting points in polygons, arrays will be empty

// /*--------------------------------------------------------------------
// Step 5: FINALIZE YOUR WEB MAP
// --------------------------------------------------------------------*/
//HINT: Think about the display of your data and usability of your web map.
//      Update the addlayer paint properties for your hexgrid using:
//        - an expression
//        - The COUNT attribute
//        - The maximum number of collisions found in a hexagon
//      Add a legend and additional functionality including pop-up windows

let collision_point;
let pointClickEnabled = false;
const pointInteractionZoom = 13;
let measuring = false;

const distanceContainer = document.getElementById("distance");
const measureButton = document.getElementById("measure-toggle");
document.getElementById("reset-view").addEventListener("click", () => {
  map.flyTo({
    center: initialView.center,
    zoom: initialView.zoom,
    bearing: initialView.bearing,
    pitch: initialView.pitch,
    duration: 1000,
  });
});
const measureGeojson = {
  type: "FeatureCollection",
  features: [],
};

const measureLineString = {
  type: "Feature",
  geometry: {
    type: "LineString",
    coordinates: [],
  },
  properties: {},
};

measureButton.addEventListener("click", (e) => {
  e.stopPropagation();

  measuring = !measuring;
  measureButton.textContent = measuring
    ? "Exit Measure Mode"
    : "Measure Distance";

  if (!measuring) {
    measureGeojson.features = [];
    distanceContainer.innerHTML = "";

    if (map.getSource("measure-geojson")) {
      map.getSource("measure-geojson").setData(measureGeojson);
    }

    if (map.getLayer("hexgrid-hover")) {
      map.setFilter("hexgrid-hover", ["==", ["get", "COUNT"], -9999]);
    }

    if (map.getLayer("input-pnts-hover")) {
      map.setFilter("input-pnts-hover", ["==", ["get", "_id"], -1]);
    }

    map.getCanvas().style.cursor = "";
  }
});

fetch(
  "https://raw.githubusercontent.com/JessicaCHuang26/ggr472-lab4-main/refs/heads/main/data/pedcyc_collision_06-21.geojson",
)
  .then((response) => response.json())
  .then((response) => {
    console.log(response);
    collision_point = response;

    map.on("load", () => {
      const bbox = turf.bbox(collision_point);
      console.log("bbox:", bbox);

      const bboxPolygon = turf.bboxPolygon(bbox);
      console.log("bbox polygon:", bboxPolygon);

      const scaledBboxPolygon = turf.transformScale(bboxPolygon, 1.1);
      console.log("scaled bbox polygon:", scaledBboxPolygon);

      const scaledBbox = turf.bbox(scaledBboxPolygon);
      console.log("scaled bbox:", scaledBbox);

      const hexgrid = turf.hexGrid(scaledBbox, 0.6);
      console.log(hexgrid);

      const collishex = turf.collect(hexgrid, collision_point, "_id", "values");
      console.log(collishex);

      let maxcollis = 0;
      collishex.features.forEach((feature, index) => {
        feature.id = index;
        feature.properties.COUNT = feature.properties.values.length;

        if (feature.properties.COUNT > maxcollis) {
          maxcollis = feature.properties.COUNT;
        }
      });
      console.log(maxcollis);

      map.addSource("measure-geojson", {
        type: "geojson",
        data: measureGeojson,
      });

      map.addLayer({
        id: "measure-points",
        type: "circle",
        source: "measure-geojson",
        paint: {
          "circle-radius": 5,
          "circle-color": "#000000",
        },
        filter: ["in", "$type", "Point"],
      });

      map.addLayer({
        id: "measure-lines",
        type: "line",
        source: "measure-geojson",
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#007AFF",
          "line-width": 2.5,
        },
        filter: ["in", "$type", "LineString"],
      });

      map.addSource("input-data", {
        type: "geojson",
        data: "https://raw.githubusercontent.com/JessicaCHuang26/ggr472-lab4-main/refs/heads/main/data/pedcyc_collision_06-21.geojson",
      });

      map.addSource("hexgrid", {
        type: "geojson",
        data: collishex,
      });

      map.addLayer({
        id: "hexgrid-fill",
        type: "fill",
        source: "hexgrid",
        paint: {
          "fill-color": [
            "step",
            ["get", "COUNT"],
            "#ffffff", // 0
            1,
            "#fee5d9", // 1-13
            14,
            "#fcbba1", // 14-26
            27,
            "#fc9272", // 27-39
            40,
            "#fb6a4a", // 40-52
            53,
            "#de2d26", // 53-65
            66,
            "#a50f15", // 66-76
          ],
          "fill-opacity": 0.65,
          "fill-outline-color": "#8a8a8a",
        },
      });

      map.addLayer({
        id: "hexgrid-hover",
        type: "fill",
        source: "hexgrid",
        paint: {
          "fill-color": "yellow",
          "fill-opacity": 0.7,
          "fill-outline-color": "#8a8a8a",
        },
        filter: ["==", ["get", "COUNT"], -9999],
      });

      map.addLayer({
        id: "input-pnts",
        type: "circle",
        source: "input-data",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            1.5,
            12,
            3,
            14,
            5,
            16,
            8,
          ],
          "circle-color": "white",
          "circle-stroke-color": "black",
          "circle-stroke-width": 1,
        },
      });

      map.addLayer({
        id: "input-pnts-hover",
        type: "circle",
        source: "input-data",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            3,
            12,
            5,
            14,
            7,
            16,
            10,
          ],
          "circle-color": "green",
          "circle-stroke-color": "black",
          "circle-stroke-width": 2,
        },
        filter: ["==", ["get", "_id"], -1],
      });

      const hoverPopup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
      });

      map.on("click", (e) => {
        if (!measuring) return;

        const features = map.queryRenderedFeatures(e.point, {
          layers: ["measure-points"],
        });

        if (measureGeojson.features.length > 1) {
          measureGeojson.features.pop();
        }

        distanceContainer.innerHTML = "";

        if (features.length) {
          const id = features[0].properties.id;
          measureGeojson.features = measureGeojson.features.filter(
            (point) => point.properties.id !== id,
          );
        } else {
          const point = {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [e.lngLat.lng, e.lngLat.lat],
            },
            properties: {
              id: String(Date.now()),
            },
          };

          measureGeojson.features.push(point);
        }

        if (measureGeojson.features.length > 1) {
          measureLineString.geometry.coordinates = measureGeojson.features.map(
            (point) => point.geometry.coordinates,
          );

          measureGeojson.features.push(measureLineString);

          const value = document.createElement("pre");
          const distance = turf.length(measureLineString, {
            units: "kilometers",
          });
          value.textContent = `Total distance: ${distance.toFixed(2)} km`;
          distanceContainer.appendChild(value);
        }

        map.getSource("measure-geojson").setData(measureGeojson);
      });

      map.on("mousemove", (e) => {
        if (!measuring) return;

        const features = map.queryRenderedFeatures(e.point, {
          layers: ["measure-points"],
        });

        map.getCanvas().style.cursor = features.length
          ? "pointer"
          : "crosshair";
      });

      map.on("mousemove", "hexgrid-fill", (e) => {
        if (measuring) return;
        if (!e.features.length) return;

        const feature = e.features[0];
        map.getCanvas().style.cursor = "pointer";

        map.setFilter("hexgrid-hover", ["==", ["id"], feature.id]);

        hoverPopup
          .setLngLat(e.lngLat)
          .setHTML(`<strong>Collisions:</strong> ${feature.properties.COUNT}`)
          .addTo(map);
      });

      map.on("mouseleave", "hexgrid-fill", () => {
        if (measuring) return;

        map.getCanvas().style.cursor = "";
        map.setFilter("hexgrid-hover", ["==", ["get", "COUNT"], -9999]);
        hoverPopup.remove();
      });

      map.on("click", "hexgrid-fill", (e) => {
        if (measuring) return;

        const feature = e.features[0];
        const center = turf.centroid(feature);

        map.flyTo({
          center: center.geometry.coordinates,
          zoom: 14,
          duration: 1000,
        });

        pointClickEnabled = true;
      });

      map.on("mousemove", "input-pnts", (e) => {
        if (measuring) return;

        if (!pointClickEnabled || map.getZoom() < pointInteractionZoom) {
          map.getCanvas().style.cursor = "";
          map.setFilter("input-pnts-hover", ["==", ["get", "_id"], -1]);
          return;
        }

        if (!e.features.length) return;

        const hoveredId = e.features[0].properties._id;
        map.getCanvas().style.cursor = "pointer";

        map.setFilter("input-pnts-hover", ["==", ["get", "_id"], hoveredId]);
      });

      map.on("mouseleave", "input-pnts", () => {
        if (measuring) return;

        map.getCanvas().style.cursor = "";
        map.setFilter("input-pnts-hover", ["==", ["get", "_id"], -1]);
      });

      map.on("click", "input-pnts", (e) => {
        if (measuring) return;
        if (!pointClickEnabled || map.getZoom() < pointInteractionZoom) return;

        const props = e.features[0].properties;

        new mapboxgl.Popup()
          .setLngLat(e.features[0].geometry.coordinates)
          .setHTML(
            `
            <strong>Collision Details</strong><br>
            <strong>ID:</strong> ${props._id}<br>
            <strong>Year:</strong> ${props.YEAR}<br>
            <strong>Visibility:</strong> ${props.VISIBILITY}<br>
            <strong>Light:</strong> ${props.LIGHT}<br>
            <strong>Involved Type:</strong> ${props.INVTYPE}<br>
            <strong>Injury:</strong> ${props.INJURY}<br>
            <strong>Neighbourhood:</strong> ${props.NEIGHBOURHOOD_158}
          `,
          )
          .addTo(map);
      });

      map.on("zoomend", () => {
        if (map.getZoom() < pointInteractionZoom) {
          pointClickEnabled = false;
          map.setFilter("input-pnts-hover", ["==", ["get", "_id"], -1]);
        }
      });
      map.moveLayer("measure-lines");
      map.moveLayer("measure-points");
      applyLayerToggles();
    });
  });

// /*--------------------------------------------------------------------
// Step 5: FINALIZE YOUR WEB MAP
// --------------------------------------------------------------------*/

map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

const legendItemsContainer = document.getElementById("legend-items");
const legendItemsContainer2 = document.getElementById("legend-items2");

const legenditems = [
  { label: "0", colour: "#ffffff", id: "0", min: 0, max: 0 },
  { label: "1-13", colour: "#fee5d9", id: "1-13", min: 1, max: 13 },
  { label: "14-26", colour: "#fcbba1", id: "14-26", min: 14, max: 26 },
  { label: "27-39", colour: "#fc9272", id: "27-39", min: 27, max: 39 },
  { label: "40-52", colour: "#fb6a4a", id: "40-52", min: 40, max: 52 },
  { label: "53-65", colour: "#de2d26", id: "53-65", min: 53, max: 65 },
  { label: "66-76", colour: "#a50f15", id: "66-76", min: 66, max: 76 },
];

const legenditems2 = [
  {
    label: "Collision Points",
    layerId: "input-pnts",
    id: "collision_points",
    type: "layer",
  },
  {
    label: "Hexagon Grid",
    layerId: "hexgrid-fill",
    id: "hex_grid",
    type: "layer",
  },
  {
    label: "Show Empty Hexagons",
    id: "show_empty",
    type: "filter",
  },
];

legenditems2.forEach(({ label, id }) => {
  const row = document.createElement("label");
  row.className = "legend-row";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = id;
  checkbox.checked = true;

  const text = document.createElement("span");
  text.textContent = label;

  row.append(checkbox, text);
  legendItemsContainer2.appendChild(row);
});

legendItemsContainer2.addEventListener("change", () => {
  applyLayerToggles();
});

function applyLayerToggles() {
  legenditems2.forEach((item) => {
    if (item.type !== "layer") return;

    const checkbox = document.getElementById(item.id);
    if (!checkbox) return;
    if (!map.getLayer(item.layerId)) return;

    map.setLayoutProperty(
      item.layerId,
      "visibility",
      checkbox.checked ? "visible" : "none",
    );
  });

  applyFilters();
}

function applyFilters() {
  if (!map.getLayer("hexgrid-fill")) return;

  const checkedRanges = getCheckedRanges();

  const rangeFilters =
    checkedRanges.length === 0
      ? [["==", ["get", "COUNT"], -9999]]
      : checkedRanges.map((item) => {
          if (item.max === Infinity) {
            return [">=", ["get", "COUNT"], item.min];
          } else {
            return [
              "all",
              [">=", ["get", "COUNT"], item.min],
              ["<=", ["get", "COUNT"], item.max],
            ];
          }
        });
  const showEmpty = document.getElementById("show_empty")?.checked;

  const finalFilter = showEmpty
    ? ["any", ...rangeFilters] // show everything
    : ["all", [">", ["get", "COUNT"], 0], ["any", ...rangeFilters]]; // hide empty
  map.setFilter("hexgrid-fill", finalFilter);
}

legenditems.forEach(({ label, colour, id }) => {
  const row = document.createElement("label");
  row.className = "legend-row";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = id;
  checkbox.checked = true;

  const colcircle = document.createElement("span");
  colcircle.className = "legend-colcircle";
  colcircle.style.setProperty("--legendcolour", colour);

  const text = document.createElement("span");
  text.textContent = label;

  row.append(checkbox, colcircle, text);
  legendItemsContainer.appendChild(row);
});

legendItemsContainer.addEventListener("change", () => {
  applyFilters();
});

function getCheckedRanges() {
  return legenditems.filter((item) => document.getElementById(item.id).checked);
}
