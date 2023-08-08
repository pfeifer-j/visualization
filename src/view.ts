import * as d3 from "d3";
// Live Imports
import { getDevices } from "./network";
import { getDevicesSDN } from "./network";
import { getIsolatedDevices } from "./network";
import { getCommunications } from "./network";
import { isolateDevice } from "./network";
import { includeDevice } from "./network";

//Example Imports
import { getDevicesStatic } from "./network";
import { getCommunicationsStatic } from "./network";

// Initialize the d3.js visualization
export async function generateView(htmlSource, config) {

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
    const mode = config.mode || "physical";

    //ToDo: Implement multiple shapes
    const shape = "circle"; //config.shape || "circle";

    // Get the network data
    let data = {
        nodes: [],
        links: [],
    };


    // Select the correct devices to be displayed
    let devices = await (!config.isDemo ? getDevices() : (config.mode == "software" ? getDevicesSDN() : getDevicesStatic()));

    try {
        devices.forEach((device) => {
            let hostname = device.hostname;
            let ip = device.ip;
            let mac = device.mac;
            let reachable = device.reachable;
            let host = device.host;

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

    let nodes = graphSvg.append('g')
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

    simulation.alpha(1);
    for (var i = 0; i < 50; ++i) simulation.tick();

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

    // invalidation.then(() => simulation.stop());
    // return Object.assign(graphSvg.node(), {
    //     update(newData) {
    //         const old = new Map(node.data().map(d => [d.ip, d]));
    //         data.nodes = newData.nodes.map(d => Object.assign(old.get(d.ip) || {}, d));
    //         data.links = newData.links.map(d => Object.assign({}, d));

    //         simulation.nodes(data.nodes);
    //         simulation.force("link").links(data.links);
    //         simulation.alpha(1).restart();

    //         node = node
    //             .data(data.nodes, d => d.ip)
    //             .join(enter => enter.append("circle")
    //                 .attr("r", 8)
    //                 .attr("fill", d => color(d.ip)));  // Replace color(d.ip) with your desired color function

    //         link = link
    //             .data(data.links, d => `${d.source.ip}\t${d.target.ip}`)
    //             .join("line");
    //     }
    // });

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


    // Update the graph within a set interval
    // setInterval(() => {
    //     updateGraph();
    // }, config.renderInterval || 15000);

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

                            // Error handling for isolation OpenWRT
                            if (selectedIP == openWrtIP) {
                                window.confirm("You cant isolate the source node!");
                            }

                            // Confirm dialog for isolation
                            let confirmDelete = window.confirm("Are you sure you want to isolate " + selectedIP + "?");
                            if (confirmDelete) {
                                isolateDevice(selectedIP);
                            }
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

                        // Confirm dialog for including devices
                        if (selected) {
                            let selectedIP = this.getAttribute("ip");
                            let confirmDelete = window.confirm("Are you sure you want to include " + selectedIP + "?");
                            if (confirmDelete) {
                                includeDevice(selectedIP);
                            }
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

    // Renders the network flow between devices
    async function showCommunication(selectedIP) {
        let communications = config.isDemo ? await getCommunicationsStatic() : await getCommunications();

        console.log(communications);

        let linkedIPs = [];

        try {
            // Get the connected IP's
            communications.forEach(function (communication) {
                console.log(communication);
                if (communication.src === selectedIP) {
                    linkedIPs.push(communication.dst);
                } else if (communication.dst === selectedIP) {
                    linkedIPs.push(communication.src);
                }
            });

            console.log(linkedIPs);

        } catch (error) {
            console.error('Error generating the connections:', error);
        }

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
        // graphSvg
        //     .selectAll("line")
        //     .filter(function (line) {
        //         let sourceIP = line.source.ip;
        //         let targetIP = line.target.ip;

        //         // Check if the link is part of the shortest path
        //         let isPartOfShortestPath = linkedIPs.includes(sourceIP) && linkedIPs.includes(targetIP);

        //         // Check if the link is the selected IP or connected to it
        //         let isConnectedToSelectedIP = sourceIP === selectedIP || targetIP === selectedIP;

        //         return isPartOfShortestPath || isConnectedToSelectedIP;
        //     })
        //     .transition()
        //     .duration(duration)
        //     .style("stroke", linkHighlighted)
        //     .attr("stroke-width", linkWidthHighlighted)
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

    // Update the graph after a set interval
    async function updateGraph() {
        // Only update if the devices have changed.
        const newDevices = config.isDemo ? await getDevicesStatic() : await getDevices();
        if (JSON.stringify(devices) === JSON.stringify(newDevices)) {
            return;
        }

        // Save the current selections and positions.
        let selections = new Map();
        let positions = new Map();
        nodes.each(function (d) {
            selections.set(d.ip, this.getAttribute("selected"));
            positions.set(d.ip, { x: d.x, y: d.y });
        });

        // Update the device information
        devices = newDevices;
        data.nodes = devices.map(device => {
            let hostname = device.hostname;
            let ip = device.ip;
            let mac = device.mac;
            let reachable = device.reachable;
            let host = device.host;

            return {
                host: host,
                name: hostname,
                ip: ip,
                mac: mac,
                reachable: reachable,
            }
        });

        // Re-calculate the links based on the new devices array
        data.links = devices.map(device => {
            return { source: device.host, target: device.ip, marked: false };
        });

        // Rebind the new data
        nodes = nodeGroup.selectAll("circle").data(data.nodes, d => d.ip);
        links = linkGroup.selectAll("line").data(data.links, d => d.source.ip + "-" + d.target.ip);

        // Remove old nodes
        nodes.exit().remove();
        links.exit().remove();

        // Update existing nodes
        nodes
            .attr("fill", (node) => isolatedDevices.includes(node.ip) ? nodeIsolated : (node.reachable ? nodeReachable : nodeUnreachable));

        // Create new nodes
        const newNodes = nodes.enter().append("circle");
        newNodes.attr("r", unselectedRadius)
        nodes.attr("fill", (node) => {
            // Retrieve the selected attribute
            let isSelected = d3.select(`circle[ip='${node.ip}']`).attr("selected") === "true";

            // Return color based on conditions
            return isSelected ? nodeHighlighted
                : (isolatedDevices.includes(node.ip) ? nodeIsolated
                    : (node.reachable ? nodeReachable
                        : nodeUnreachable))
        })
            .attr("name", (node) => node.name)
            .attr("ip", (node) => node.ip)
            .attr("mac", (node) => node.mac)
            .attr("host", (node) => node.host)
            .attr("reachable", (node) => node.reachable)
            .attr("selected", (node) => selections.get(node.ip) || false)
            .attr("isolated", (node) => isolatedDevices.includes(node.ip))
            .attr("cx", (node) => positions.has(node.ip) ? positions.get(node.ip).x : graphWidth / 2)
            .attr("cy", (node) => positions.has(node.ip) ? positions.get(node.ip).y : graphHeight / 2)
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut)
            .on("click", handleClick);

        // Mark source node
        graphSvg
            .select("circle[ip='" + openWrtIP + "']")
            .attr("fill", openWrtColor);

        // Merge the new nodes with the existing nodes
        nodes = newNodes.merge(nodes);

        // Create new links
        let newLinks = links.enter().append("line");

        newLinks.attr("source", (link) => link.source)
            .attr("target", (link) => link.target)
            .style("stroke", linkDefault)
            .attr("stroke-width", linkWidthDefault)
            .attr("marked", "false");

        // Merge the new links with the existing links
        links = newLinks.merge(links);

        // Restart the simulation with the new data
        simulation.nodes(data.nodes.concat(newNodes.data()));
        simulation.force("link").links(data.links);
        simulation.alpha(1).restart();
        simulation.alpha(1);
        for (var i = 0; i < 120; ++i) simulation.tick();

        nodes.attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; });

        links.attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });
    }
}