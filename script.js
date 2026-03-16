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
  center: [-79.33, 43.73], // starting point, longitude/latitude
  zoom: 10.2, // starting zoom level
  bearing: -17,
  pitch: 0,
});

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

let collision_point;

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

      // convert bbox array to polygon feature
      const bboxPolygon = turf.bboxPolygon(bbox);
      console.log("bbox polygon:", bboxPolygon);

      // scale bbox polygon by 10%
      const scaledBboxPolygon = turf.transformScale(bboxPolygon, 1.1);
      console.log("scaled bbox polygon:", scaledBboxPolygon);

      // convert scaled polygon back to bbox array
      const scaledBbox = turf.bbox(scaledBboxPolygon);
      console.log("scaled bbox:", scaledBbox);

      const hexgrid = turf.hexGrid(scaledBbox, 0.6);
      console.log(hexgrid);

      const collishex = turf.collect(hexgrid, collision_point, "_id", "values");
      collishex.features.forEach((feature) => {
        feature.properties.COUNT = feature.properties.values.length;
      });
      console.log(collishex);

      let maxcollis = 0;
      collishex.features.forEach((feature) => {
        feature.properties.COUNT = feature.properties.values.length;
        if (feature.properties.COUNT > maxcollis) {
          console.log(feature);
          maxcollis = feature.properties.COUNT;
        }
      });
      console.log(maxcollis);

      // Add datasource using GeoJSON variable

      map.addSource("input-data", {
        type: "geojson",
        data: "https://raw.githubusercontent.com/JessicaCHuang26/ggr472-lab4-main/refs/heads/main/data/pedcyc_collision_06-21.geojson",
      });

      // map.addSource("hexgrid", {
      //   type: "geojson",
      //   data: hexgrid,
      // });

      map.addSource("hexgrid", {
        type: "geojson",
        data: collishex,
      });

      // Set style for when new points are added to the data source
      map.addLayer({
        id: "input-pnts",
        type: "circle",
        source: "input-data",
        paint: {
          "circle-radius": 2,
          "circle-color": "black",
        },
      });

      // map.addLayer({
      //   id: "hexgrid-fill",
      //   type: "fill",
      //   source: "hexgrid",
      //   paint: {
      //     "fill-color": "#62d1ea",
      //     "fill-opacity": 0.3,
      //     "fill-outline-color": "#000000",
      //   },
      // });

      map.addLayer({
        id: "hexgrid-fill",
        type: "fill",
        source: "hexgrid",
        paint: {
          "fill-color": [
            "step", // STEP expression produces stepped results based on value pairs
            ["get", "COUNT"], // GET expression retrieves property value from 'capacity' data field
            "#ffffff", // Colours assigned to values >= each step
            0,
            "#f9e8e8",
            5,
            "#f8b1b1",
            10,
            "#f5a0a0",
            15,
            "#fb7474",
            20,
            "#f52020",
            25,
            "#c51b1b",
            30,
            "#9b1515",
            35,
            "#800f0f",
            40,
            "#550a0a",
            45,
            "#350808",
            50,
            "#031a1a",
          ],
          "fill-opacity": 0.4,
          "fill-outline-color": "#000000",
        },
      });
    });
  });

// /*--------------------------------------------------------------------
// Step 5: FINALIZE YOUR WEB MAP
// --------------------------------------------------------------------*/
//HINT: Think about the display of your data and usability of your web map.
//      Update the addlayer paint properties for your hexgrid using:
//        - an expression
//        - The COUNT attribute
//        - The maximum number of collisions found in a hexagon
//      Add a legend and additional functionality including pop-up windows

//Add map navigation buttons and controls to bottom right of map
map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
const legendItemsContainer = document.getElementById("legend-items");
//Create legend items
// const legenditems = [
//   { label: "0-5", colour: "#ffffff", value: "COUNT", id: "0-5" },
//   { label: "5-10", colour: "#f9e8e8", value: "COUNT", id: "5-10" },
//   { label: "10-15", colour: "#f8b1b1", value: "COUNT", id: "10-15" },
//   { label: "15-20", colour: "#f5a0a0", value: "COUNT", id: "15-20" },
//   { label: "20-25", colour: "#fb7474", value: "COUNT", id: "20-25" },
//   { label: "25-30", colour: "#f52020", value: "COUNT", id: "25-30" },
//   { label: "30-35", colour: "#c51b1b", value: "COUNT", id: "30-35" },
//   { label: "35-40", colour: "#c51b1b", value: "COUNT", id: "35-40" },
//   { label: "40-45", colour: "#9b1515", value: "COUNT", id: "40-45" },
//   { label: "45-50", colour: "#800f0f", value: "COUNT", id: "45-50" },
//   { label: "50-55", colour: "#550a0a", value: "COUNT", id: "50-55" },
// ];

const legenditems = [
  { label: "0-5", colour: "#ffffff", id: "0-5", min: 0, max: 5 },
  { label: "5-10", colour: "#f9e8e8", id: "5-10", min: 5, max: 10 },
  { label: "10-15", colour: "#f8b1b1", id: "10-15", min: 10, max: 15 },
  { label: "15-20", colour: "#f5a0a0", id: "15-20", min: 15, max: 20 },
  { label: "20-25", colour: "#fb7474", id: "20-25", min: 20, max: 25 },
  { label: "25-30", colour: "#f52020", id: "25-30", min: 25, max: 30 },
  { label: "30-35", colour: "#c51b1b", id: "30-35", min: 30, max: 35 },
  { label: "35-40", colour: "#9b1515", id: "35-40", min: 35, max: 40 },
  { label: "40-45", colour: "#800f0f", id: "40-45", min: 40, max: 45 },
  { label: "45-50", colour: "#550a0a", id: "45-50", min: 45, max: 50 },
  { label: "50+", colour: "#350808", id: "50plus", min: 50, max: Infinity },
];

//Create legend items(label, checkbox, and circle symbology)
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

//Implement the checkbox filtering functionality
legendItemsContainer.addEventListener("change", () => {
  applyFilters();
});

function getCheckedRanges() {
  return legenditems.filter((item) => document.getElementById(item.id).checked);
}

function applyFilters() {
  if (!map.getLayer("hexgrid-fill")) return;

  const checkedRanges = getCheckedRanges();

  if (checkedRanges.length === 0) {
    map.setFilter("hexgrid-fill", ["==", ["get", "COUNT"], -9999]);
    return;
  }

  const rangeFilters = checkedRanges.map((item) => {
    if (item.max === Infinity) {
      return [">=", ["get", "COUNT"], item.min];
    } else {
      return [
        "all",
        [">=", ["get", "COUNT"], item.min],
        ["<", ["get", "COUNT"], item.max],
      ];
    }
  });

  map.setFilter("hexgrid-fill", ["any", ...rangeFilters]);
}
