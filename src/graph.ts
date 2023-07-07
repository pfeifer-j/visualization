import * as d3 from "d3";
import { getDevicesStatic } from "./router";
import { getDevicesDynamic } from "./router";
import { getCommunicationStatic as getCommunicationsStatic } from "./switch";
import { getCommunicationDynamic as getCommunicationsDynamic } from "./switch";

// Initialize the d3.js visualization
export function generateGraph(htmlSource) {
    // Select the svg and add zooming
    let svgSelector = "#networkSvg";
    let svgElement = htmlSource.renderRoot.querySelector(svgSelector);
    let svg = d3
        .select(svgElement)
        .call(
            d3.zoom().on("zoom", function (event) {
                svg.attr("transform", event.transform);
            })
        )
        .on("dblclick.zoom", null)
        .append("g");

    // Define the dimensions of the card and the SVG element
    let width = 500;
    let height = 500;
    let padding = 50;
    svgElement.setAttribute('width', (width - padding).toString());
    svgElement.setAttribute('height', (height - padding).toString());
    svgElement.parentElement?.setAttribute('style', `width: ${width}px; height: ${height}px; overflow: visible;`);


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

    let links = svg
        .append("g")
        .selectAll("line")
        .data(graphData.links)
        .enter()
        .append("line")
        .attr("source", (link) => link.source)
        .attr("target", (link) => link.target)
        .attr("stroke-width", 1)
        .attr("marked", "false")
        .style("stroke", "darkgray");

    let nodes = svg
        .append("g")
        .selectAll("circle")
        .data(graphData.nodes)
        .enter()
        .append("circle")
        .attr("r", 10)
        .attr("fill", (node) => (node.reachable ? "#3BD16F" : "#F03A47"))
        .attr("name", (node) => node.name)
        .attr("ip", (node) => node.ip)
        .attr("mac", (node) => node.mac)
        .attr("host", (node) => node.host)
        .attr("reachable", (node) => node.reachable)
        .attr("selected", (node) => node.selected)
        .attr("isolated", (node) => node.isolated)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("click", handleNodeClick);

    d3.select("body").on("keydown", handleDelete);


    //TODO:  Implement tooltip. Check why append(body) doesnt work
    let tooltip = svg.append("g").attr("class", "tooltip").style("opacity", 0);
    svg.select("circle[ip='192.168.1.1']").attr("fill", "lightblue");


    // Add Events to nodes
    function handleMouseOver(event, d) {
        if (d.selected === true) {
            return;
        }

        d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 15);

        let content = "IP: " + d.ip + " Name: " + d.name + " MAC: " + d.mac;

        let tooltipElement = document.querySelector(".tooltip");
        let tooltip = d3.select(tooltipElement);

        if (tooltip) {
            tooltip
                .transition()
                .duration(100)
                .style("opacity", 1);

            // Add content to the tooltip
            tooltip.html(content);
            tooltip.style("left", event.pageX + 10 + "px");
            tooltip.style("top", event.pageY - 15 + "px");

        }
    }

    function handleMouseOut(event, d) {
        if (d.selected === true) {
            return;
        }

        d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 10);

        //let tooltip = this.renderRoot.querySelector(".tooltip");

        if (tooltip) {
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0);
        }
    }

    function handleNodeClick(event, d) {
        let selectedIP = d.ip;

        svg.selectAll("circle")
            .filter(function (circle) {
                return circle.ip != d.ip;
            })
            .transition()
            .duration(200)
            .attr("r", 10)
            .attr("selected", "false");

        svg.selectAll("line")
            .transition()
            .duration(200)
            .style("stroke", "darkgray")
            .style("stroke-width", "1")
            .attr("marked", "false");

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

            svg.selectAll("line")
                .filter(function (line) {
                    line.marked = linkedIPs.includes(line.target.ip) || (line.target == selectedIP);
                    return line.marked;
                })
                .transition()
                .duration(200)
                .attr("marked", "true")
                .style("stroke", "orange")
                .style("stroke-width", "3");
        }
    }

    function handleDelete(event, node) {
        if (event.key === "Delete") {
            svg.selectAll("circle")
                .filter(function (d) {
                    // TODO: Execute only once
                    return (d.selected === true);
                })
                .transition()
                .duration(200)
                .attr("fill", "darkgrey")
                .attr("isolated", "true")

        } else if (event.key === "Enter") {
            svg.selectAll("circle")
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

    // Add force-direction
    let simulation = d3
        .forceSimulation(graphData.nodes)
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("link", d3.forceLink(graphData.links).id((d) => d.ip))
        .on("tick", ticked);

    let drag = d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);

    nodes.call(drag);

    // Updating the position
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
        // Your alpha hit 0 it stops! make it run again
        simulation.alphaTarget(0.3).restart();
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        // Alpha min is 0, head there
        simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}
