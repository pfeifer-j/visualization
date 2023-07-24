import * as d3 from "d3";
// Live Imports
import { getDevices } from "./network";
import { getIsolatedDevices } from "./network";
import { getCommunications } from "./network";
import { isolateDevice } from "./network";
import { includeDevice } from "./network";

//Example Imports
import { getDevicesStatic } from "./network";
import { getCommunicationsStatic } from "./network";

// Generate the view and update it after a set interval if the device list has changed
export async function generateView(htmlSource, config) {
    const devices = config.isDemo ? await getDevicesStatic() : await getDevices();

    generateSvg(htmlSource, config, devices);

    setInterval(() => {
        updateGraph(htmlSource, config, devices);
    }, config.renderInterval || 60000); // 60 seconds is the default
}

// Function to check for changes in the devices list and update the graph if needed
async function updateGraph(htmlSource, config, devices) {
    const newDevices = config.isDemo ? await getDevicesStatic() : await getDevices();

    if (JSON.stringify(devices) !== JSON.stringify(newDevices)) {
        devices = newDevices;
        generateSvg(htmlSource, config, devices);
    }
}

// Initialize the d3.js visualization
export async function generateSvg(htmlSource, config, devices) {

    // Visualisation constants and default settings
    const graphWidth = 500;
    const graphHeight = 500;
    const tableWidth = 350;
    const tableHeight = 500;
    const unselectedRadius = config.unselectedRadius || 10;
    const communicatedRadius = config.communicatedRadius || 12;
    const selectedRadius = config.selectedRadius || 15;
    const nodeReachable = config.nodeReachable || "#3BD16F";
    const nodeUnreachable = config.nodeUnreachable || "#F03A47";
    const nodeHighlighted = config.nodeHighlighted || "orange";
    const nodeIsolated = config.nodeIsolated || "darkgray";
    const rowDefault = config.rowDefault || "transparent";
    const rowSelected = config.rowSelected || "white";
    const fontDefault = config.fontDefault || "white";
    const fontSelected = config.fontSelected || "black";
    const linkDefault = config.linkDefault || "darkgray";
    const linkHighlighted = config.linkHighlighted || "orange";
    const linkWidthDefault = config.linkWidthDefault || 1;
    const linkWidthHighlighted = config.linkWidthHighlighted || 5;
    const openWrtIP = config.openWrtIP || "192.168.1.1";
    const openWrtColor = config.openWrtColor || "lightblue";
    const graphForce = config.graphForce || -300;
    const duration = config.duration || 200;

    //ToDo: Implement multiple shapes
    const shape = "circle"; //config.shape || "circle";

    // Get the network data
    let data = {
        nodes: [],
        links: [],
    };

    try {
        // Generate device nodes
        devices.forEach((device) => {
            let [hostname, ip, mac, reachable, host] = device;

            data.nodes.push({
                host: host,
                name: hostname,
                ip: ip,
                mac: mac,
                reachable: reachable,
            });

            data.links.push({ source: host, target: ip, marked: false });
        });
    } catch (error) {
        console.error('Error generating the devicelist:', error);
    }

    // Generate graph
    let graphSelector = "#graphSvg";
    let graphElement = htmlSource.renderRoot.querySelector(graphSelector);
    let graphSvg = d3
        .select(graphElement)
        .call(
            d3.zoom().on("zoom", function (event) {
                graphSvg.attr("transform", event.transform);
            })
        )
        .on("dblclick.zoom", null)
        .append("g");

    // Clear existing visualisation in the graph
    clearExistingVisualization(graphElement, "circle");
    clearExistingVisualization(graphElement, "line");

    // Define the dimensions of the card and the SVG element
    graphElement.setAttribute('width', graphWidth);
    graphElement.setAttribute('height', graphHeight);

    // Add background to graphSvg
    graphSvg.append("rect")
        .attr("width", graphWidth)
        .attr("height", graphHeight)
        .attr("fill", "transparent")
        .on("click", clearSelection);

    // Read isolated devices
    let isolatedDevices = await getIsolatedDevices();

    // Fill graph with data
    let links = graphSvg
        .append("g")
        .selectAll("line")
        .data(data.links)
        .enter()
        .append("line")
        .attr("source", (link) => link.source)
        .attr("target", (link) => link.target)
        .style("stroke", linkDefault)
        .attr("stroke-width", linkWidthDefault)
        .attr("marked", "false");

    let nodes = graphSvg
        .append("g")
        .selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("r", unselectedRadius)
        .attr("fill", (node) => isolatedDevices.includes(node.ip) ? nodeIsolated : (node.reachable ? nodeReachable : nodeUnreachable)
        )
        .attr("name", (node) => node.name)
        .attr("ip", (node) => node.ip)
        .attr("mac", (node) => node.mac)
        .attr("host", (node) => node.host)
        .attr("reachable", (node) => node.reachable)
        .attr("selected", false)
        .attr("isolated", (node) => isolatedDevices.includes(node.ip));

    // Mark source node
    graphSvg
        .select("circle[ip='" + openWrtIP + "']")
        .attr("fill", openWrtColor);

    // Add physics to the graph
    let simulation = d3
        .forceSimulation(data.nodes)
        .force("charge", d3.forceManyBody().strength(graphForce))
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

    // Generate table
    let tableSelector = "#tableSvg";
    let tableElement = htmlSource.renderRoot.querySelector(tableSelector);
    let tableSvg = d3
        .select(tableElement)
        .append("g");

    // Clear existing visualisation in the table
    clearExistingVisualization(tableElement, "tr");

    // Define the dimensions of the card and the SVG element
    tableElement.setAttribute('width', tableWidth);
    tableElement.setAttribute('height', tableHeight);

    // Create the table structure
    const tableData = data.nodes.map(node => [node.name, node.ip, node.mac]);
    const table = d3.create("table");
    table.classed("table-border", true);

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
    rows.each(function (event, index) {
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
        .attr("width", tableWidth)
        .attr("height", tableHeight)
        .append("xhtml:div")
        .style("width", "100%")
        .style("height", "100%")
        .style("overflow", "auto")
        .append("xhtml:body")
        .style("margin", "5px")
        .style("padding", "0px");

    tableContainer.append(() => table.node());

    // Add events to nodes, blank space, and table rows
    nodes
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("click", handleClick);

    d3
        .select("body")
        .on("keydown", handleKeyPress);

    tbody
        .selectAll("tr")
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("click", handleClick);

    function handleMouseOver(event, element) {
        let selectedIP = getIP(element);

        // Get the node
        let selectedNode = graphSvg
            .selectAll("circle")
            .filter(function () {
                return this.getAttribute("ip") === selectedIP;
            })
            .node();

        // Get the row
        let selectedRow = tableSvg
            .selectAll("tr")
            .filter(function () {
                return this.querySelector('td.ip') ? this.querySelector('td.ip').textContent === selectedIP : false;
            })
            .node();

        // Highlight node and row
        if (selectedNode.getAttribute("selected") === "false") {
            d3.select(selectedRow)
                .style("background-color", rowSelected)
                .style("color", fontSelected);

            d3.select(selectedNode)
                .transition()
                .duration(duration)
                .attr("r", selectedRadius);
        }
    }

    function handleMouseOut(event, element) {
        let selectedIP = getIP(element);

        // Get the node
        let selectedNode = graphSvg
            .selectAll("circle")
            .filter(function () {
                return this.getAttribute("ip") === selectedIP;
            })
            .node();

        // Get the row
        let selectedRow = tableSvg
            .selectAll("tr")
            .filter(function () {
                return this.querySelector('td.ip') ? this.querySelector('td.ip').textContent === selectedIP : false;
            })
            .node();

        // Remove highlighting
        if (selectedNode.getAttribute("selected") === "false") {
            d3.select(selectedNode)
                .transition()
                .duration(duration)
                .attr("r", unselectedRadius);

            d3.select(selectedRow)
                .style("background-color", rowDefault)
                .style("color", fontDefault);
        }
    }

    function handleClick(event, element) {
        let selectedIP = getIP(element);

        // Get the node
        let selectedNode = graphSvg
            .selectAll("circle")
            .filter(function () {
                return this.getAttribute("ip") === selectedIP;
            })
            .node();

        // Get the row
        let selectedRow = tableSvg
            .selectAll("tr")
            .filter(function () {
                return this.querySelector('td.ip') ? this.querySelector('td.ip').textContent === selectedIP : false;
            })
            .node();

        clearSelection();

        // Update selection
        if (selectedNode.getAttribute("selected") === "false") {
            d3.select(selectedNode)
                .transition()
                .duration(duration)
                .attr("r", selectedRadius)
                .attr("fill", selectedNode.getAttribute("isolated") === "true" ? nodeIsolated : nodeHighlighted)
                .attr("selected", "true");

            d3.select(selectedRow)
                .transition()
                .duration(duration)
                .style("background-color", rowSelected)
                .style("color", fontSelected)
                .attr("selected", "true");

            showCommunication(selectedIP);
        }
    }

    function handleKeyPress(event) {
        switch (event.key) {
            case "Escape":
                clearSelection();
                break;
            case "Delete":
                graphSvg.selectAll("circle")
                    .filter(function (d) {
                        let selected = this.getAttribute("selected") === "true";
                        if (selected) {
                            let selectedIP = this.getAttribute("ip");
                            isolateDevice(selectedIP);
                        }
                        return selected;
                    })
                    .transition()
                    .duration(duration)
                    .attr("fill", nodeIsolated)
                    .attr("isolated", "true");

                break;
            case "Enter":
                graphSvg.selectAll("circle")
                    .filter(function (d) {
                        let selected = this.getAttribute("selected") === "true";
                        if (selected) {
                            let selectedIP = this.getAttribute("ip");
                            includeDevice(selectedIP);
                        }
                        return selected;
                    })
                    .transition()
                    .duration(duration)
                    .attr("r", selectedRadius)
                    .attr("fill", nodeHighlighted)
                    .attr("isolated", "false");
                break;
        }
    }

    function clearSelection() {
        // Clear nodes
        graphSvg
            .selectAll("circle")
            .filter(function () {
                return this.getAttribute("isolated") === "false";
            })
            .transition()
            .duration(duration)
            .attr("r", unselectedRadius)
            .attr("fill", (node) => (node.reachable ? nodeReachable : nodeUnreachable))
            .attr("selected", "false");

        graphSvg
            .selectAll("circle")
            .filter(function () {
                return this.getAttribute("isolated") === "true";
            })
            .transition()
            .duration(duration)
            .attr("r", unselectedRadius)
            .attr("selected", "false");

        graphSvg
            .transition()
            .duration(duration)
            .select("circle[ip='" + openWrtIP + "']")
            .attr("r", unselectedRadius)
            .attr("fill", openWrtColor);

        // Clear links
        graphSvg
            .selectAll("line")
            .transition()
            .duration(duration)
            .style("stroke", linkDefault)
            .attr("stroke-width", linkWidthDefault)
            .attr("marked", "false");

        // Clear table
        tableSvg
            .selectAll("tr")
            .transition()
            .duration(duration)
            .style("background-color", rowDefault)
            .style("color", fontDefault);
    }

    async function showCommunication(selectedIP) {
        let communications = getCommunicationsStatic;
        let linkedIPs = [];

        // try {
        //     communications = await getCommunications();

        //     // Get the connected IP's
        //     communications.forEach(function (communication) {
        //         if (communication[0] === selectedIP) {
        //             linkedIPs.push(communication[1]);
        //         } else if (communication[1] === selectedIP) {
        //             linkedIPs.push(communication[0]);
        //         }
        //     });

        //     // Rest of your code to highlight nodes and links
        // } catch (error) {
        //     console.error('Error generating the connections:', error);
        // }

        // Highlight nodes
        graphSvg
            .selectAll("circle")
            .filter(function () {
                return linkedIPs.includes(this.getAttribute("ip"));
            })
            .transition()
            .duration(duration)
            .attr("r", communicatedRadius)
            .attr("fill", nodeHighlighted);

        // Highlight links
        graphSvg
            .selectAll("line")
            .filter(function (line) {
                let sourceIP = line.source.ip;
                let targetIP = line.target.ip;

                // Check if the link is part of the shortest path
                let isPartOfShortestPath = linkedIPs.includes(sourceIP) && linkedIPs.includes(targetIP);

                // Check if the link is the selected IP or connected to it
                let isConnectedToSelectedIP = sourceIP === selectedIP || targetIP === selectedIP;

                return isPartOfShortestPath || isConnectedToSelectedIP;
            })
            .transition()
            .duration(duration)
            .style("stroke", linkHighlighted)
            .attr("stroke-width", linkWidthHighlighted)
    }

    // Returns the IP of a node or a row
    function getIP(element) {
        if (element.ip) {
            return element.ip;
        }
        else if (element[1]) {
            return element[1];
        }
        else {
            return undefined;
        }
    }

    // Remove existing visualisations if the design is changed within the Home Assistant Editor
    function clearExistingVisualization(svgElement, elementSelector) {
        const svg = d3.select(svgElement);
        svg.selectAll(elementSelector).remove();
    }
}