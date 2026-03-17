/*--------------------------------------------------------------------
GGR472 LAB 4: Incorporating GIS Analysis into web maps using Turf.js 
--------------------------------------------------------------------*/

/*--------------------------------------------------------------------
Step 1: INITIALIZE MAP
--------------------------------------------------------------------*/
//define access token
mapboxgl.accessToken =
  "pk.eyJ1IjoiamVzc2ljYWh1YW5nIiwiYSI6ImNtazNjNmdmeTBkN3AzZnEyZHRscHdod28ifQ.Pa9LhzBk1H75KBMwBngDjA";

//initialize map
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/jessicahuang/cmmnx7kte003n01s125302mbb", //add my own Mapbox style
  center: [-79.36, 43.73],
  zoom: 10.2, //set starting zoom level
  bearing: -17, //turn map orientation to upright
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

/*--------------------------------------------------------------------
Step 5: FINALIZE YOUR WEB MAP
--------------------------------------------------------------------*/
//HINT: Think about the display of your data and usability of your web map.
//      Update the addlayer paint properties for your hexgrid using:
//        - an expression
//        - The COUNT attribute
//        - The maximum number of collisions found in a hexagon
//      Add a legend and additional functionality including pop-up windows

let collision_point; //create empty variable for collision point data
let point_click_enabled = false;
//set point to unclickable first, limit user to only be able to click on point feature after they clicked onto a hexagon to zoom into it
let measuring = false;
//default mode has measuring tool turned off (prevent the function to overlap with other click or hover events)

const point_zoom = 13; //set a throshold to only enable point hover and click feature when user zoom into an hexagon
const distanceContainer = document.getElementById("distance");
const measureButton = document.getElementById("measure-toggle");

//create variable for feature collection to store geometry created by user from the distance measuring tool
const measureGeojson = {
  type: "FeatureCollection",
  features: [],
};

//create variable for string geometry created by distance measuring tool
const measureLineString = {
  type: "Feature",
  geometry: {
    type: "LineString",
    coordinates: [],
  },
  properties: {},
};

//implement preset view button
//create initial view variable for the 'reset view' button to return to
const initialView = {
  center: [-79.33, 43.73],
  zoom: 10.2,
  bearing: -17,
  pitch: 0,
};

//implement the 'reset view' button click to fly back to default view and orientation
document.getElementById("reset-view").addEventListener("click", () => {
  map.flyTo({
    center: initialView.center,
    zoom: initialView.zoom,
    bearing: initialView.bearing,
    pitch: initialView.pitch,
    duration: 1000,
  });
});

//Implement distance measuring button tool
measureButton.addEventListener("click", (e) => {
  e.stopPropagation(); //prevent this click from triggering other click events

  measuring = !measuring;
  measureButton.textContent = measuring
    ? "Exit Measure Mode"
    : "Measure Distance";
  //update button text depending on whether use is in measring mode

  if (!measuring) {
    measureGeojson.features = []; //if user is not in measuring mode, reset all feature and remove text for measuring

    distanceContainer.innerHTML = "";

    if (map.getSource("measure-geojson")) {
      map.getSource("measure-geojson").setData(measureGeojson);
    }

    if (map.getLayer("hexgrid-hover")) {
      map.setFilter("hexgrid-hover", ["==", ["get", "COUNT"], -100]);
      //reset hexagon hover highlight (hide it using and impossible value)
    }

    if (map.getLayer("input-pnts-hover")) {
      map.setFilter("input-pnts-hover", ["==", ["get", "_id"], -100]);
    }

    map.getCanvas().style.cursor = "";
  }
});

//fetch collision point data, create bbox and calculate maximum number of collision
fetch(
  "https://jessicachuang26.github.io/ggr472-lab4-main/data/pedcyc_collision_06-21.geojson",
)
  .then((response) => response.json())
  .then((response) => {
    console.log(response);
    collision_point = response;

    map.on("load", () => {
      const bbox = turf.bbox(collision_point);
      console.log("bbox:", bbox); //calculate and print bbox array in console

      const bboxPolygon = turf.bboxPolygon(bbox);
      console.log("bbox polygon:", bboxPolygon); //return box polygon geometry

      const scaledBboxPolygon = turf.transformScale(bboxPolygon, 1.1);
      console.log("scaled bbox polygon:", scaledBboxPolygon); //increase bbox size by 10%

      const scaledBbox = turf.bbox(scaledBboxPolygon);
      console.log("scaled bbox:", scaledBbox);
      //convert bbox polygon back to coordinate array to create hexgrid

      const hexgrid = turf.hexGrid(scaledBbox, 0.6);
      console.log(hexgrid);
      //create a hexagonal grid on the bounding box with 0.6 km size

      const collishex = turf.collect(hexgrid, collision_point, "_id", "values");
      console.log(collishex);
      //collect and count the number of collision points that falls into each hexgrid

      //calculate maximum number of collision occured in a hexagon
      let maxcollis = 0; //set an accumulator with initial collision count = 0
      collishex.features.forEach((feature, index) => {
        feature.id = index;
        feature.properties.COUNT = feature.properties.values.length;
        //if current collision count in this hexagon > the accumulator, set the accumulate to this new larger value
        if (feature.properties.COUNT > maxcollis) {
          maxcollis = feature.properties.COUNT;
        }
      });
      console.log(maxcollis); //print out maximum collision count
      //(the maximum count in my 0.6km hexgrids is 76)

      //add collision data source
      map.addSource("input-data", {
        type: "geojson",
        data: "https://jessicachuang26.github.io/ggr472-lab4-main/data/pedcyc_collision_06-21.geojson",
      });

      //add hexagon data source
      map.addSource("hexgrid", {
        type: "geojson",
        data: collishex,
      });

      //add hexagon layer with preset fill that matches with the legend later
      map.addLayer({
        id: "hexgrid-fill",
        type: "fill",
        source: "hexgrid",
        paint: {
          "fill-color": [
            "step",
            ["get", "COUNT"], //use the 'get' function to grab collision count data
            "#ffffff",
            1,
            "#fee5d9",
            14,
            "#fcbba1",
            27,
            "#fc9272",
            40,
            "#fb6a4a",
            53,
            "#de2d26",
            66,
            "#a50f15", //maximum is 76 calculated from above
          ],
          "fill-opacity": 0.65, //adjust opacoty to show basemap better
          "fill-outline-color": "#8a8a8a",
        },
      });

      //add another hexgrid layer to show yellow colour when hover over
      map.addLayer({
        id: "hexgrid-hover",
        type: "fill",
        source: "hexgrid",
        paint: {
          "fill-color": "yellow",
          "fill-opacity": 0.7,
          "fill-outline-color": "#8a8a8a",
        },
        filter: ["==", ["get", "COUNT"], -100], //set a impossible filter so this layer is hidden unless collision count = -100(which isn't possible)
      });

      //add point feature for collision data
      map.addLayer({
        id: "input-pnts",
        type: "circle",
        source: "input-data",
        paint: {
          "circle-radius": [
            "interpolate", //use interpolate so that points size changes according to how far user zooms the map
            ["linear"],
            ["zoom"],
            10, //manually set the point size according to zoom size
            1.5,
            12,
            3,
            14,
            5,
            16,
            8,
          ],
          "circle-color": "white",
          "circle-stroke-color": "black", //symbolize the points with black outline
          "circle-stroke-width": 1,
        },
      });

      //add another collision point layer to show green colour when hover over
      map.addLayer({
        id: "input-pnts-hover",
        type: "circle",
        source: "input-data",
        paint: {
          "circle-radius": [
            "interpolate", //use interpolate so that points size changes according to how far user zooms the map
            ["linear"],
            ["zoom"],
            10, //manually set the point size according to zoom size
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
        filter: ["==", ["get", "_id"], -100], //set a impossible filter so this layer is hidden unless _id = -100(which isn't possible)
      });

      //add distance measure tool source
      map.addSource("measure-geojson", {
        type: "geojson",
        data: measureGeojson,
      });

      //add layer for the points between line segments distance measuring tool
      map.addLayer({
        id: "measure-points",
        type: "circle",
        source: "measure-geojson",
        paint: {
          "circle-radius": 5,
          "circle-color": "#000000",
        },
        filter: ["in", "$type", "Point"], //filter to show only Point geometires from the meaure-geojson source
      });

      //add layer for the lines segments of the distane measuring tool
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
        filter: ["in", "$type", "LineString"], //filter to show only LineString geometires from the meaure-geojson
      });

      //implement measuring funtion
      map.on("click", (e) => {
        if (!measuring) return; //only perform the following if we are measuring, else do nothing

        const features = map.queryRenderedFeatures(e.point, {
          layers: ["measure-points"],
        }); //check if user clicked on an existing point

        if (measureGeojson.features.length > 1) {
          measureGeojson.features.pop();
        }

        distanceContainer.innerHTML = "";

        if (features.length) {
          const id = features[0].properties.id; // if user clicked on an existing point → remove it
          measureGeojson.features = measureGeojson.features.filter(
            (point) => point.properties.id !== id,
          ); //remove the clicked point from GeoJSON
        } else {
          const point = {
            //otherwise → add a new point where user clicked
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [e.lngLat.lng, e.lngLat.lat],
            },
            properties: {
              id: String(Date.now()),
            },
          };

          measureGeojson.features.push(point); //add new point to collection
        }
        //if at least 2 points are created, then draw a line
        if (measureGeojson.features.length > 1) {
          measureLineString.geometry.coordinates = measureGeojson.features.map(
            (point) => point.geometry.coordinates,
          );
          //convert all points into LineString
          measureGeojson.features.push(measureLineString);

          const value = document.createElement("pre");
          const distance = turf.length(measureLineString, {
            units: "kilometers",
          });
          //calculate total line distance using Turf.js in km
          value.textContent = `Total distance: ${distance.toFixed(2)} km`;
          distanceContainer.appendChild(value);
        }

        map.getSource("measure-geojson").setData(measureGeojson);
        //update map with the new points and line
      });

      map.on("mousemove", (e) => {
        if (!measuring) return; //only apply following when measuring mode is active

        const features = map.queryRenderedFeatures(e.point, {
          layers: ["measure-points"],
        });

        map.getCanvas().style.cursor = features.length
          ? "pointer"
          : "crosshair";
      });

      //when mouse moves over hexagon, add highlight and popup
      map.on("mousemove", "hexgrid-fill", (e) => {
        if (measuring) return; //only apply following when measuring mode is active
        if (!e.features.length) return;

        const feature = e.features[0];
        map.getCanvas().style.cursor = "pointer";

        map.setFilter("hexgrid-hover", ["==", ["id"], feature.id]);
        //filter to highlight only the hovered hexagon that matches the feature id
        hoverPopup
          .setLngLat(e.lngLat)
          .setHTML(`<strong>Collisions:</strong> ${feature.properties.COUNT}`)
          //display number of collisions inside popup
          .addTo(map);
      });

      //when mouse leaves a hexagon, reset the hover state
      map.on("mouseleave", "hexgrid-fill", () => {
        if (measuring) return;

        map.getCanvas().style.cursor = "";
        map.setFilter("hexgrid-hover", ["==", ["get", "COUNT"], -100]);
        hoverPopup.remove(); //remove popup
      });

      //when user clicks on a hexagon, they will zoom into an enlarged view
      map.on("click", "hexgrid-fill", (e) => {
        if (measuring) return;

        const feature = e.features[0];
        const center = turf.centroid(feature);
        //find the centroid of hexagon using Turf

        map.flyTo({
          center: center.geometry.coordinates, //fly to the centroid of hexagon
          zoom: 14,
          duration: 1000,
        });

        point_click_enabled = true; //only allow user to click on point feature after they click and zoom into an hexagon
      });

      //implement hovering effect when user hover over points
      map.on("mousemove", "input-pnts", (e) => {
        if (measuring) return;
        //only let user to have this effect after they clicked and zoom into an hexagon
        if (!point_click_enabled || map.getZoom() < point_zoom) {
          map.getCanvas().style.cursor = "";
          map.setFilter("input-pnts-hover", ["==", ["get", "_id"], -100]);
          return;
        }
        if (!e.features.length) return;
        const hoveredId = e.features[0].properties._id;
        map.getCanvas().style.cursor = "pointer";
        //change cursor to indicate clickable feature
        map.setFilter("input-pnts-hover", ["==", ["get", "_id"], hoveredId]);
        //highlight the hovered point by matching its id
      });

      map.on("mouseleave", "input-pnts", () => {
        if (measuring) return; //disable any action if user is using the measuring tool

        map.getCanvas().style.cursor = "";
        map.setFilter("input-pnts-hover", ["==", ["get", "_id"], -100]);
        //remove hover hight off the collision points when cursor leaves the point
      });
      //when user clicks on a collision point, it should show popup
      map.on("click", "input-pnts", (e) => {
        if (measuring) return; //this cannot happen in the emasuring mode
        if (!point_click_enabled || map.getZoom() < point_zoom) return;
        //this is only allowed if user clicked onto a hexagon and is zoomed into it
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
          ) //show collision information from the original dataset
          .addTo(map);
      });
      //set popup for number of collision count when hovering over hexagon
      const hoverPopup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
      });

      //restrict popup and highlight of point feature when zoom level becomes smaller
      map.on("zoomend", () => {
        if (map.getZoom() < point_zoom) {
          point_click_enabled = false;
          map.setFilter("input-pnts-hover", ["==", ["get", "_id"], -100]);
        }
      });
      map.moveLayer("measure-lines"); //move the measuring tool layer on top so it's not obstructed by the hexagon layer
      map.moveLayer("measure-points");
      applyLayerToggles(); //apply the toggle helper function
    });
  });

//add map control functionality to the bottom right corner of map
map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

//create legend variables for the two legends
const legendItemsContainer = document.getElementById("legend-items");
const legendItemsContainer2 = document.getElementById("legend-items2");

//hard code values and colour for legend 1
const legenditems = [
  { label: "0", colour: "#ffffff", id: "0", min: 0, max: 0 },
  { label: "1-13", colour: "#fee5d9", id: "1-13", min: 1, max: 13 },
  { label: "14-26", colour: "#fcbba1", id: "14-26", min: 14, max: 26 },
  { label: "27-39", colour: "#fc9272", id: "27-39", min: 27, max: 39 },
  { label: "40-52", colour: "#fb6a4a", id: "40-52", min: 40, max: 52 },
  { label: "53-65", colour: "#de2d26", id: "53-65", min: 53, max: 65 },
  { label: "66-76", colour: "#a50f15", id: "66-76", min: 66, max: 76 },
];

//specify items to go onto legend 2
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

//create checkbox function for legend 2
legenditems2.forEach(({ label, id }) => {
  const row = document.createElement("label");
  row.className = "legend-row"; //create a row container for each legend item

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = id;
  checkbox.checked = true;

  const text = document.createElement("span");
  text.textContent = label;

  row.append(checkbox, text); //add checkbox and label text into the row
  legendItemsContainer2.appendChild(row);
});

legendItemsContainer2.addEventListener("change", () => {
  applyLayerToggles(); //update map and apply the changes whenever the checkboxes are checked
});

//helper function to toggle layer based on checkboxes
function applyLayerToggles() {
  legenditems2.forEach((item) => {
    if (item.type !== "layer") return;

    const checkbox = document.getElementById(item.id);
    if (!checkbox) return;
    if (!map.getLayer(item.layerId)) return;

    map.setLayoutProperty(
      item.layerId,
      "visibility",
      checkbox.checked ? "visible" : "none", //show layer if checkbox is checked only
    );
  });

  applyFilters();
}
//function to apply filters to hexgrid layer based on legend selections
function applyFilters() {
  if (!map.getLayer("hexgrid-fill")) return;

  const checkedRanges = get_checked();

  const rangeFilters =
    checkedRanges.length === 0
      ? [["==", ["get", "COUNT"], -100]]
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
  //check whether "Show Empty" is enabled

  const finalFilter = showEmpty
    ? ["any", ...rangeFilters] //if showing empty, then only apply the selected ranges
    : ["all", [">", ["get", "COUNT"], 0], ["any", ...rangeFilters]];
  //if hiding empty then it must show the matched selected ranges
  map.setFilter("hexgrid-fill", finalFilter); //apply the combined filter to the hexgrid layer
}

//create legend with checkboxes
legenditems.forEach(({ label, colour, id }) => {
  const row = document.createElement("label");
  row.className = "legend-row";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = id;
  checkbox.checked = true; //checkbox is set visible in default

  const colcircle = document.createElement("span");
  colcircle.className = "legend-colcircle";
  colcircle.style.setProperty("--legendcolour", colour);
  //create circle symbology for each collision count range

  const text = document.createElement("span");
  text.textContent = label; //label text of the collision count ranges

  row.append(checkbox, colcircle, text); //set up each row of the legend
  legendItemsContainer.appendChild(row); //add rows to the legend container
});

legendItemsContainer.addEventListener("change", () => {
  applyFilters(); //reapply filters whenever user toggles
});

//helper function to return all checked items from the checkbox
function get_checked() {
  return legenditems.filter((item) => document.getElementById(item.id).checked);
}
