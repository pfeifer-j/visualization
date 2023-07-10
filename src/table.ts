import * as d3 from "d3";
import { getDevicesStatic } from "./router";
import { getDevicesDynamic } from "./router";
import { getCommunicationStatic as getCommunicationsStatic } from "./switch";
import { getCommunicationDynamic as getCommunicationsDynamic } from "./switch";

// Initialize the d3.js visualization
export function generateTable(htmlSource) {
    // Select the svg and add zooming
    let svgSelector = "#tableSvg";
    let svgElement = htmlSource.renderRoot.querySelector(svgSelector);
    let svg = d3
        .select(svgElement)
        .attr("class", "bordered-svg")
        .append("g");

    // Define the dimensions of the card and the SVG element
    let width = 350;
    let height = 500;
    svgElement.setAttribute('width', (width).toString());
    svgElement.setAttribute('height', (height).toString());

    // Generate graph
    let graphData = {
        nodes: [],
        links: [],
    };

    let devices = getDevicesStatic();

    // Generate device nodes
    devices.forEach((device) => {
        let [deviceHostname, deviceIp, deviceMac, deviceReachable, deviceHost] = device;

        graphData.nodes.push({
            host: deviceHost,
            name: deviceHostname,
            ip: deviceIp,
            mac: deviceMac,
            reachable: deviceReachable,
            selected: false,
            isolated: false
        });

        console.log("Device: " + device);
        console.log("List: " + deviceHostname, deviceIp, deviceMac, deviceReachable, deviceHost);

        graphData.links.push({ source: deviceHost, target: deviceIp, marked: false });
    });

    // Create the table structure
    const tableData = graphData.nodes.map(node => [node.name, node.ip, node.mac]);
    const table = d3.create("table");
    const thead = table.append("thead");
    const tbody = table.append("tbody");

    // Add table headers
    thead.append("tr")
        .selectAll("th")
        .data(["Name", "IP", "MAC"])
        .enter()
        .append("th")
        .text(d => d);

    // Add table rows
    tbody.selectAll("tr")
        .data(tableData)
        .enter()
        .append("tr")
        .selectAll("td")
        .data(d => d)
        .enter()
        .append("td")
        .text(d => d);


    // Todo make with dynamical
    const tableWidth = table.node().getBoundingClientRect().width;


    // Create the table container
    const tableContainer = svg
        .append("foreignObject")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 350)
        .attr("height", height)
        .append("xhtml:div")
        .style("width", "100%")
        .style("height", "100%")
        .style("overflow", "auto")
        .append("xhtml:body")
        .style("margin", "5px")
        .style("padding", "0px");
    // Append the table to the table container
    tableContainer.append(() => table.node());
}
