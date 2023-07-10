import * as d3 from "d3";
import { getDevicesStatic } from "./router";
import { getDevicesDynamic } from "./router";
import { getCommunicationStatic as getCommunicationsStatic } from "./switch";
import { getCommunicationDynamic as getCommunicationsDynamic } from "./switch";

// Initialize the d3.js visualization
export function generateView(htmlSource) {


    // Get the network data
    let data = {
        nodes: [],
        links: [],
        tableRows: [],
    };

    let devices = getDevicesStatic();

    // Generate device nodes
    devices.forEach((device) => {
        let [deviceHostname, deviceIp, deviceMac, deviceReachable, deviceHost] = device;

        data.nodes.push({
            host: deviceHost,
            name: deviceHostname,
            ip: deviceIp,
            mac: deviceMac,
            reachable: deviceReachable,
            selected: false,
            isolated: false
        });

        //console.log("Device: " + device);
        //console.log("List: " + deviceHostname, deviceIp, deviceMac, deviceReachable, deviceHost);

        data.links.push({ source: deviceHost, target: deviceIp, marked: false });
    });



    // Generate table
    let tableSelector = "#tableSvg";
    let tableSvgElement = htmlSource.renderRoot.querySelector(tableSelector);
    let tableSvg = d3
        .select(tableSvgElement)
        .attr("class", "bordered-svg")
        .append("g");

    // Define the dimensions of the card and the SVG element
    let tableWidth = 350;
    let tableHeight = 500;
    tableSvgElement.setAttribute('width', (tableWidth).toString());
    tableSvgElement.setAttribute('height', (tableHeight).toString());

    // Create the table structure
    const tableData = data.nodes.map(node => [node.name, node.ip, node.mac]);
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
    const rows = tbody
        .selectAll("tr")
        .data(tableData)
        .enter()
        .append("tr")
        .selectAll("td")
        .data(d => d)
        .enter()
        .append("td")
        .text(d => d);

    // Add attributes as classes to the table rows
    rows.each(function (d, index) {
        const row = d3.select(this);
        if (index === 0) {
            row.classed("name", true);
        } else if (index === 1) {
            row.classed("ip", true);
        } else if (index === 2) {
            row.classed("mac", true);
        }
    });

    // Create the table container
    const tableContainer = tableSvg
        .append("foreignObject")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 350)
        .attr("height", tableHeight)
        .append("xhtml:div")
        .style("width", "100%")
        .style("height", "100%")
        .style("overflow", "auto")
        .append("xhtml:body")
        .style("margin", "5px")
        .style("padding", "0px");
    // Append the table to the table container
    tableContainer.append(() => table.node());

    // Generate graph
    let graphSelector = "#graphSvg";
    let graphElement = htmlSource.renderRoot.querySelector(graphSelector);
    let graphSvg = d3
        .select(graphElement)
        .attr("class", "bordered-svg")
        .call(
            d3.zoom().on("zoom", function (event) {
                graphSvg.attr("transform", event.transform);
            })
        )
        .on("dblclick.zoom", null)
        .append("g");

    // Define the dimensions of the card and the SVG element
    let graphWidth = 500;
    let graphHeight = 500;
    graphElement.setAttribute('width', (graphWidth).toString());
    graphElement.setAttribute('height', (graphHeight).toString());

    // Update the SVG viewBox to fit the graph
    let xExtent = d3.extent(data.nodes, d => d.x);
    let yExtent = d3.extent(data.nodes, d => d.y);
    let newWidth = Math.abs(xExtent[0]) + xExtent[1];
    let newHeight = Math.abs(yExtent[0]) + yExtent[1];
    graphElement.setAttribute("viewBox", `${xExtent[0]} ${yExtent[0]} ${newWidth} ${newHeight}`);

    // Fill graph with data
    let links = graphSvg
        .append("g")
        .selectAll("line")
        .data(data.links)
        .enter()
        .append("line")
        .attr("source", (link) => link.source)
        .attr("target", (link) => link.target)
        .attr("stroke-width", 1)
        .attr("marked", "false")
        .style("stroke", "darkgray");

    let nodes = graphSvg
        .append("g")
        .selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("id", (node, index) => "node-" + index)
        .attr("r", 10)
        .attr("fill", (node) => (node.reachable ? "#3BD16F" : "#F03A47"))
        .attr("name", (node) => node.name)
        .attr("ip", (node) => node.ip)
        .attr("mac", (node) => node.mac)
        .attr("host", (node) => node.host)
        .attr("reachable", (node) => node.reachable)
        .attr("selected", (node) => node.selected)
        .attr("isolated", (node) => node.isolated);

    // Add Events to nodes
    nodes.on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("click", handleNodeClick);

    d3.select("body").on("keydown", handleDelete);
    graphSvg.select("circle[ip='192.168.1.1']").attr("fill", "lightblue");

    function handleMouseOver(event, d) {
        if (d.selected === true) {
            return;
        }

        d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 15);
    }

    function handleMouseOut(event, d) {
        if (d.selected === true) {
            return;
        }

        d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 10);
    }

    function handleNodeClick(event, d) {
        let selectedIP = d.ip;

        graphSvg
            .selectAll("circle")
            .filter(function (circle) {
                return circle.ip != d.ip;
            })
            .transition()
            .duration(200)
            .attr("r", 10)
            .attr("selected", "false");

        graphSvg
            .selectAll("line")
            .transition()
            .duration(200)
            .style("stroke", "darkgray")
            .style("stroke-width", "1")
            .attr("marked", "false");

        tableSvg.selectAll("tr").classed("highlight", false);

        if (d.selected) {
            d.selected = false;
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 10)
                .attr("selected", "false");
        } else {
            // Get communications
            let linkedIPs = [];
            let communications = getCommunicationsStatic();

            communications.forEach(function (communication) {
                if (communication[0] === d.ip) {
                    linkedIPs.push(communication[1]);
                } else if (communication[1] === d.ip) {
                    linkedIPs.push(communication[0]);
                }
            });

            // Mark node and links
            d.selected = true;
            d3.select(this)
                .transition()
                .duration(200)
                .attr("selected", "true")
                .attr("r", 15);

            graphSvg
                .selectAll("line")
                .filter(function (line) {
                    line.marked =
                        linkedIPs.includes(line.target.ip) || line.target === selectedIP;
                    return line.marked;
                })
                .transition()
                .duration(200)
                .attr("marked", "true")
                .style("stroke", "orange")
                .style("stroke-width", "3");

            // Highlight the table row
            tableSvg
                .selectAll("tr")
                .filter(function (event, table) {
                    let ipElement = this.querySelector('td.ip');
                    if (ipElement) {
                        return ipElement.textContent === selectedIP;

                    } else {
                        return false;
                    }
                })
                .classed("highlight", true);
        }
    }

    function handleDelete(event, node) {
        if (event.key === "Delete") {
            graphSvg.selectAll("circle")
                .filter(function (d) {
                    // TODO: Execute only once
                    return (d.selected === true);
                })
                .transition()
                .duration(200)
                .attr("fill", "darkgrey")
                .attr("isolated", "true")

        } else if (event.key === "Enter") {
            graphSvg.selectAll("circle")
                .filter(function (d) {
                    return (d.selected === true);
                })
                .transition()
                .duration(200)
                .attr("r", 15)
                .attr("fill", (node) => (node.reachable ? "#3BD16F" : "#F03A47"))
                .attr("isolated", "true")
        }
    }

    // Add physics  to the graph
    let simulation = d3
        .forceSimulation(data.nodes)
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(graphWidth / 2, graphHeight / 2))
        .force("link", d3.forceLink(data.links).id((d) => d.ip))
        .force("x", d3.forceX().x((d) => Math.max(0, Math.min(graphWidth, d.x))).strength(0.1))
        .force("y", d3.forceY().y((d) => Math.max(0, Math.min(graphHeight, d.y))).strength(0.1))
        .on("tick", ticked);

    let drag = d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);

    nodes.call(drag);

    function ticked() {
        nodes.attr("cx", function (d) {
            return d.x;
        }).attr("cy", function (d) {
            return d.y;
        });

        links.attr("x1", function (d) {
            return d.source.x;
        }).attr("y1", function (d) {
            return d.source.y;
        }).attr("x2", function (d) {
            return d.target.x;
        }).attr("y2", function (d) {
            return d.target.y;
        });
    }

    function dragstarted(event, d) {
        simulation.alphaTarget(0.3).restart();
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}
