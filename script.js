/*--------------------------------------------------------------------
GGR472 LAB 4: Incorporating GIS Analysis into web maps using Turf.js 
--------------------------------------------------------------------*/

/*--------------------------------------------------------------------
Step 1: INITIALIZE MAP
--------------------------------------------------------------------*/
// Define access token
mapboxgl.accessToken =
  "pk.eyJ1IjoiamVzc2ljYWh1YW5nIiwiYSI6ImNtazNjNmdmeTBkN3AzZnEyZHRscHdod28ifQ.Pa9LhzBk1H75KBMwBngDjA"; //****ADD YOUR PUBLIC ACCESS TOKEN*****

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
    let envresult = turf.envelope(collision_point);
    console.log(envresult.bbox);

    bboxgeojson = {
      type: "Feature Collection",
      features: [envresult],
    };

    console.log(bboxgeojson.features[0].geometry.coordinates[0][0][1]);
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

map.on("load", () => {
  // Add datasource using GeoJSON variable
  map.addSource("input-data", {
    type: "geojson",
    data: "https://raw.githubusercontent.com/JessicaCHuang26/ggr472-lab4-main/refs/heads/main/data/pedcyc_collision_06-21.geojson",
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
});

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
