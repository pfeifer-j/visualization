import * as d3 from "d3";
import { getDevicesStatic } from "./router";
import { getDevicesDynamic } from "./router";
import { getCommunicationStatic as getCommunicationsStatic } from "./switch";
import { getCommunicationDynamic as getCommunicationsDynamic } from "./switch";

// Visualisation constants
const selectedRadius = 15;
const unselectedRadius = 10;
const nodeReachableColor = "#3BD16F";
const nodeUnreachableColor = "#F03A47"
const openWrtIP = "192.168.1.1"
const openWrtColor = "lightblue";
const duration = 200;
const graphForce = -200;
const graphWidth = 500;
const graphHeight = 500;
const tableWidth = 350;
const tableHeight = 500;

// Initialize the d3.js visualization
export function generateView(htmlSource) {

    // Get the network data
    let data = {
        nodes: [],
        links: [],
    };

    let devices = getDevicesStatic();

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

    // Define the dimensions of the card and the SVG element
    graphElement.setAttribute('width', graphWidth);
    graphElement.setAttribute('height', graphHeight);

    // Add background to graphSvg
    graphSvg.append("rect")
        .attr("width", graphWidth)
        .attr("height", graphHeight)
        .attr("fill", "transparent")
        .on("click", clearSelection);

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
        .attr("r", unselectedRadius)
        .attr("fill", (node) => (node.reachable ? nodeReachableColor : nodeUnreachableColor))
        .attr("name", (node) => node.name)
        .attr("ip", (node) => node.ip)
        .attr("mac", (node) => node.mac)
        .attr("host", (node) => node.host)
        .attr("reachable", (node) => node.reachable)
        .attr("selected", false)
        .attr("isolated", false);

    // Color source node
    graphSvg.select("circle[ip='" + openWrtIP + "']").attr("fill", openWrtColor);

    // Add Events to nodes and blank space
    nodes.on("mouseover", handleGraphMouseOver)
        .on("mouseout", handleGraphMouseOut)
        .on("click", handleGraphClick);

    d3.select("body").on("keydown", handleKeyPress);

    function handleGraphMouseOver(event, node) {
        if (node.selected === true) {
            return;
        }

        d3.select(this)
            .transition()
            .duration(duration)
            .attr("r", selectedRadius);

        // Highlight the table row
        tableSvg
            .selectAll("tr")
            .filter(function () {
                return this.querySelector('td.ip') ? this.querySelector('td.ip').textContent === node.ip : false;
            })
            .transition()
            .duration(duration)
            .style("background-color", "white")
            .style("color", "black");
    }

    function handleGraphMouseOut(event, node) {
        if (node.selected === true) {
            return;
        }

        d3.select(this)
            .transition()
            .duration(duration)
            .attr("r", unselectedRadius);

        tableSvg.selectAll("tr")
            .filter(function () {
                return this.querySelector('td.ip') ? this.querySelector('td.ip').textContent === node.ip : false;
            })
            .transition()
            .duration(duration)
            .style("background-color", "transparent")
            .style("color", "white");
    }

    function handleGraphClick(event, node) {
        let selectedIP = node.ip;
        let wasSelected = node.selected;
        clearSelection();

        if (wasSelected) {
            d3.select(this)
                .transition()
                .duration(duration)
                .attr("r", unselectedRadius)
                .attr("selected", "false");

        } else {
            node.selected = true;

            d3.select(this)
                .transition()
                .duration(duration)
                .attr("selected", "true")
                .attr("r", selectedRadius);

            highlightLinks(this, selectedIP);

            tableSvg
                .selectAll("tr")
                .filter(function () {
                    let ipElement = this.querySelector('td.ip');
                    if (ipElement) {
                        return ipElement.textContent === selectedIP;
                    } else {
                        return false;
                    }
                })
                .transition()
                .duration(duration)
                .style("background-color", "white")
                .style("color", "black")
                .attr("selected", "true");
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
                        // TODO: Execute only once
                        return (d.selected === true);
                    })
                    .transition()
                    .duration(duration)
                    .attr("fill", "darkgrey")
                    .attr("isolated", "true");
                break;
            case "Enter":
                graphSvg.selectAll("circle")
                    .filter(function (d) {
                        return (d.selected === true);
                    })
                    .transition()
                    .duration(duration)
                    .attr("r", selectedRadius)
                    .attr("fill", (node) => (node.reachable ? "#3BD16F" : "#F03A47"))
                    .attr("isolated", "true");
                break;
        }
    }

    function clearSelection() {
        graphSvg
            .selectAll("circle")
            .transition()
            .duration(duration)
            .attr("r", unselectedRadius)
            .attr("selected", "false");

        data.nodes.forEach(node => {
            node.selected = false;
        });

        graphSvg
            .selectAll("line")
            .transition()
            .duration(duration)
            .style("stroke", "darkgray")
            .style("stroke-width", "1")
            .attr("marked", "false");

        tableSvg
            .selectAll("tr")
            .transition()
            .duration(duration)
            .style("background-color", "transparent")
            .style("color", "white");
    }


    function highlightLinks(element, selectedIP) {
        // Get communications
        let linkedIPs = [];
        let communications = getCommunicationsStatic();

        communications.forEach(function (communication) {
            if (communication[0] === element.ip) {
                linkedIPs.push(communication[1]);
            } else if (communication[1] === element.ip) {
                linkedIPs.push(communication[0]);
            }
        });

        graphSvg
            .selectAll("line")
            .filter(function (line) {
                line.marked =
                    linkedIPs.includes(line.target.ip) || line.target === selectedIP || linkedIPs.includes(selectedIP);
                return line.marked;
            })
            .transition()
            .duration(200)
            .attr("marked", "true")
            .style("stroke", "orange")
            .style("stroke-width", "3");
    }

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
    let tableSvgElement = htmlSource.renderRoot.querySelector(tableSelector);
    let tableSvg = d3
        .select(tableSvgElement)
        .append("g");

    // Define the dimensions of the card and the SVG element
    tableSvgElement.setAttribute('width', tableWidth);
    tableSvgElement.setAttribute('height', tableHeight);

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

    // Add events to table
    tbody
        .selectAll("tr")
        .on("mouseover", handleTableMouseOver)
        .on("mouseout", handleTableMouseOut)
        .on("click", handleTableClick);

    function handleTableMouseOver(event, row) {
        let selectedNode = graphSvg
            .selectAll("circle")
            .filter(function () {
                return this.getAttribute("ip") === row[1];
            })
            .node()

        if (selectedNode.getAttribute("selected") === true) {
            return;
        }

        d3.select(this)
            .style("background-color", "white")
            .style("color", "black");

        graphSvg
            .selectAll("circle")
            .filter(function () {
                return this.getAttribute("ip") === row[1];
            })
            .transition()
            .duration(duration)
            .attr("r", selectedRadius);
    }

    function handleTableMouseOut(event, row) {
        let selectedNode = graphSvg
            .selectAll("circle")
            .filter(function () {
                return this.getAttribute("ip") === row[1];
            })
            .node()

        if (selectedNode.getAttribute("selected") === true) {
            return;
        }


        d3.select(this)
            .style("background-color", "transparent")
            .style("color", "white");

        graphSvg
            .selectAll("circle")
            .filter(function () {
                return this.getAttribute("ip") === row[1];
            })
            .transition()
            .duration(duration)
            .attr("r", unselectedRadius);
    }

    function handleTableClick(event, row) {
        let selectedIP = row[1];
        let selectedNode = graphSvg
            .selectAll("circle")
            .filter(function () {
                return this.getAttribute("ip") === selectedIP;
            })
            .node()

        let wasSelected = selectedNode.getAttribute("selected");

        //clearSelection();

        if (wasSelected == true) {

            d3.select(this.parentNode).attr("selected", false)

            d3.select(this)
                .transition()
                .duration(duration)
                .attr("r", unselectedRadius)
                .attr("selected", "false");

        } else {
            d3.select(this.parentNode).attr("selected", true)

            d3.select(selectedNode)
                .transition()
                .duration(duration)
                .attr("r", unselectedRadius)
                .attr("selected", "true");

            highlightLinks(this, selectedIP);
        }
    }

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

    // Append the table to the table container
    tableContainer.append(() => table.node());
}
