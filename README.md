# Toronto Pedestrian & Cyclist Collisions (2006–2021) Webmap

This interactive web map is built using Mapbox GL JS and Turf.js. It displays the locations of pedestrian and cyclist collisions between 2006 and 2021 across the City of Toronto. The map allows users to explore the number of collisions within 0.6 km hexagonal grids generated from the bounding box of the collision point data. The goal of this map is to help users better understand how collisions are distributed across Toronto and identify areas that are more prone to collisions.

The map includes several interactive tools that allow users to explore the data more easily. This is explianed in the 'Functionalities' section below.

The basemap of this web map is created using my Mapbox Styles. Here is the link to the style: https://api.mapbox.com/styles/v1/jessicahuang/cmmnx7kte003n01s125302mbb.html?title=copy&access_token=pk.eyJ1IjoiamVzc2ljYWh1YW5nIiwiYSI6ImNtazNjNmdmeTBkN3AzZnEyZHRscHdod28ifQ.Pa9LhzBk1H75KBMwBngDjA&zoomwheel=true&fresh=true#2/38/-34

## File Description and Data Sources:

- `data/pedcyc_collision_06-21.geojson`: Data file containing point locations of road collisions involving pedestrian and cyclists between 2006 and 2021 in Toronto
- `instructions/GGR472_Lab4`: Instructions document explaining steps required to complete the lab
- `index.html`: HTML file to render the map
- `style.css`: CSS file for positioning the map interface
- `script.js`: JavaScript file including code that creates and visualizes the map and collision data

## Functionalities:

- Legend (Collision Counts):
  The map includes a legend with checkbox filters that allow users to toggle hexagons on and off based on collision count ranges.

- Layer Control (Legend 2):
  A second legend allows users to toggle map layers, including collision points, the hexagonal grid, and empty hexagons (hexagons with zero collisions). This helps improve clarity when interpreting the map.

- Reset View Button:
  Located at the top left of the map, this button returns the map to its default zoom level and orientation after the user navigates away.

- Navigation Control:
  A standard Mapbox navigation control is included at the bottom right of the map to assist with zooming and panning.

- Measure Distance Tool:
  This tool is activated when the user clicks the "Measure Distance" button. Users can place points on the map to draw line segments and measure distances in kilometers. The tool can be exited by clicking the "Exit Measure Mode" button.

- Hexagon Hover Interaction:
  When users hover over hexagons, they are highlighted in yellow and a popup displays the total number of collisions within that hexagon.

- Hexagon Click (Zoom Function):
  Clicking on a hexagon zooms the map into that area for closer inspection.

- Point Interaction (Zoom-Dependent):
  (Point interactions are only enabled after user zooming into a hexagon by clicking it)
  - Hover:
    Points enlarge and turn green to indicate selection

  - Click:
    A popup displays detailed collision information, including year, neighbourhood, lighting conditions, and type of involvement

This webmap is created by Jessica Huang, solely for GGR472 Lab 4: Incorporating GIS analysis into web maps using Turf.js. (last updated March 17, 2026)
