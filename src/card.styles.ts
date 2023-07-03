import { css } from "lit";

export const styles = css`
  .error {
    color: red;
  }
  .dl {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .dt {
    display: flex;
    align-content: center;
    flex-wrap: wrap;
  }
  .dd {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, auto) minmax(0, 2fr));
    margin: 0;
  }
  .toggle {
    padding: 0.6em;
    border: grey;
    border-radius: 50%;
  }
  .toggle.on {
    background-color: blue;
  }
  .toggle.off {
    background-color: orange;
  }
  .button {
    display: block;
    border: outset 0.2em;
    border-radius: 50%;
    border-color: silver;
    background-color: silver;
    width: 1.4em;
    height: 1.4em;
  }
  .value {
    padding-left: 0.5em;
    display: flex;
    align-content: center;
    flex-wrap: wrap;
  }
  body {
    font: 12px sans-serif;
  }
  svg {
      font: 10px sans-serif;
  }
  .container {
      display: table-cell;
      vertical-align: top;
      height: 500px;
      padding: 10px;
      border: 0px solid black;
  }
  .instructions {
      color: red;
  }
  .optional {
      color: darkgreen;
  }
  .axis line,
  .axis path {
      fill: none;
      stroke: #000;
      shape-rendering: crispEdges;
  }
  .axis text {
      fill: black;
  }
  fieldset {
      border-width: 0;
  }
  #legend {
      border: 1px solid black;
      padding: 10px;
  }
  /* the style for the close-button in the legend */
  .close {
      display: inline-block;
      padding: 1px 5px;
      margin: 4px;
      border: 1px solid black;
      color: #000;
      background: #fff;
      font-weight: bold;
      cursor: pointer;
      user-select: none;
  }
  .close:hover {
      background: #ddd;
      cursor: pointer;
  }
  /* the style for the circle in the legend */
  .color-circle {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
  }
  /* the style for dots in the scatterplot */
  .dot {
      cursor: pointer;
  }
  /* tooltip for the scatterplot */
  div.tooltip {
      position: absolute;
      text-align: left;
      padding: .2rem;
      margin: 1rem;
      background: #313639;
      color: #f9f9f9;
      border: 0px;
      border-radius: 8px;
      pointer-events: none;
      font-size: .7rem;
  }
  .card-content {
    overflow: auto;
    height: 100%;
  }
  .graph-container {
    width: 100%;
    height: 100%;
    overflow: auto;
    position: relative;
  }
`;
