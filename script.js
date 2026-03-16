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
  center: [-79.39, 43.65], // starting point, longitude/latitude
  zoom: 11, // starting zoom level
});

/*--------------------------------------------------------------------
Step 2: VIEW GEOJSON POINT DATA ON MAP
--------------------------------------------------------------------*/
//HINT: Create an empty variable
//      Use the fetch method to access the GeoJSON from your online repository
//      Convert the response to JSON format and then store the response in your new variable

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

      const hexgrid = turf.hexGrid(scaledBbox, 0.5);
      console.log(hexgrid);

      const collishex = turf.collect(hexgrid, collision_point, "_id", "values");
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

      map.addSource("hexgrid", {
        type: "geojson",
        data: hexgrid,
      });

      // Set style for when new points are added to the data source
      map.addLayer({
        id: "input-pnts",
        type: "circle",
        source: "input-data",
        paint: {
          "circle-radius": 5,
          "circle-color": "blue",
        },
      });

      map.addLayer({
        id: "hexgrid-fill",
        type: "fill",
        source: "hexgrid",
        paint: {
          "fill-color": "#62d1ea",
          "fill-opacity": 0.3,
          "fill-outline-color": "#000000",
        },
      });
    });
  });

/*--------------------------------------------------------------------
    Step 3: CREATE BOUNDING BOX AND HEXGRID
--------------------------------------------------------------------*/
//HINT: All code to create and view the hexgrid will go inside a map load event handler
//      First create a bounding box around the collision point data
//      Access and store the bounding box coordinates as an array variable
//      Use bounding box coordinates as argument in the turf hexgrid function
//      **Option: You may want to consider how to increase the size of your bbox to enable greater geog coverage of your hexgrid
//                Consider return types from different turf functions and required argument types carefully here

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
