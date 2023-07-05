import * as d3 from "d3";

// Initialize the d3.js visualization
export function initializeD3(asdf) {

    // Select the svg and add zooming
    let svgSelector = '#networkSvg';
    let svgElement = asdf.renderRoot.querySelector(svgSelector);
    let svg = d3.select(svgElement).call(d3.zoom().on("zoom", function (event) {
        svg.attr("transform", event.transform);
    })).append("g");

    // Define the dimensions of the card and the SVG element
    let width = 500;
    let height = 500;
    let padding = 20;
    svgElement.setAttribute('width', (width - padding).toString());
    svgElement.setAttribute('height', (height - padding).toString());
    svgElement.parentElement?.setAttribute('style', `width: ${width}px; height: ${height}px; overflow: visible;`);

    // Generate graph
    let graphData = {
        nodes: [],
        links: []
    };

    let devices = getDevices();
    devices.forEach(device => {
        let [hostname, ip, mac, reachable] = device;

        graphData.nodes.push({
            name: ip,
            hostname: hostname,
            mac: mac,
            reachable: reachable
        });

        if (ip !== '192.168.1.1') {
            graphData.links.push({ source: '192.168.1.1', target: ip });
        }
    });

    // Add the hardcoded device to the nodes array
    graphData.nodes.push({
        name: '192.168.1.1',
        hostname: 'OpenWRT',
        mac: '00:00:00:00:00:00',
        reachable: true
    });

    let links = svg
        .append("g")
        .selectAll("line")
        .data(graphData.links)
        .enter()
        .append("line")
        .attr("stroke-width", 1)
        .style("stroke", "darkgray");

    let nodes = svg
        .append("g")
        .selectAll("circle")
        .data(graphData.nodes)
        .enter()
        .append("circle")
        .attr("r", 10)
        .attr("fill", node => (node.reachable ? "#43AF11" : "#F03A47"))
        .attr("ip", node => node.name)
        .attr("hostname", node => node.hostname)
        .attr("mac", node => node.mac)
        .attr("reachable", node => node.reachable)
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut);

    let tooltip = svg.append("g")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Select the node with IP "192.168.1.1" and update its attributes
    let routerNode = svg
        .select("circle[ip='192.168.1.1']")
        .attr("r", 12)
        .attr("fill", "lightblue");


    // Add Events to nodes
    function handleMouseOver(event, d) {
        d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 15);

        let content =
            "IP: " + this.getAttribute("ip") + "<br/>" +
            "Hostname: " + this.getAttribute("hostname") + "<br/>" +
            "MAC: " + this.getAttribute("mac");

        console.log(content);

        let tooltipElement = document.querySelector(".tooltip");
        let tooltip = d3.select(tooltipElement);

        if (tooltip) {
            tooltip.transition()
                .duration(100)
                .style("opacity", 1);

            // Add content to the tooltip
            tooltip.html(content);
            tooltip.style("left", event.pageX + 10 + "px");
            tooltip.style("top", event.pageY - 15 + "px");
        }
    }

    function handleMouseOut(event, d) {
        d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 10)
            .attr("r", this.getAttribute("ip") == "192.168.1.1" ? 13 : 10);

        let tooltip = this.renderRoot.querySelector(".tooltip");
        let tooltip2 = this.renderRoot.querySelector(".tooltip");

        if (tooltip) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        }

    }
    // retrieve devices from router
    function getDevices() {

        //let data = '[{ "dev": "br0", "stale": false, "mac": "76:AA:93:FD:81:22", "noarp": false, "permanent": false, "failed": false, "family": 4, "proxy": false, "router": false, "reachable": true, "probe": false, "delay": false, "incomplete": false, "ip": "192.168.1.89", "hostname": "M2012K11AG", "host": "192.168.1.1" }, { "dev": "br0", "stale": true, "mac": "54:EF:44:37:83:F1", "noarp": false, "permanent": false, "failed": false, "family": 4, "proxy": false, "router": false, "reachable": false, "probe": false, "delay": false, "incomplete": false, "ip": "192.168.1.74", "hostname": null, "host": "192.168.1.1" }]';
        let data = '[' + '{ "dev": "br0", "stale": true, "mac": "76:AA:93:FD:81:22", "noarp": false, "permanent": false, "failed": false, "family": 4, "proxy": false, "router": false, "reachable": false, "probe": false, "delay": false, "incomplete": false, "ip": "192.168.1.89", "hostname": "M2012K11AG", "host": "192.168.1.1" }, { "dev": "br0", "stale": false, "mac": "54:EF:44:37:83:F1", "noarp": false, "permanent": false, "failed": false, "family": 4, "proxy": false, "router": false, "reachable": true, "probe": false, "delay": false, "incomplete": false, "ip": "192.168.1.74", "hostname": null, "host": "192.168.1.1" }, { "dev": "br0", "stale": false, "mac": "34:E1:2D:E3:49:7D", "noarp": false, "permanent": false, "failed": false, "family": 4, "proxy": false, "router": false, "reachable": true, "probe": false, "delay": false, "incomplete": false, "ip": "192.168.1.67", "hostname": null, "host": "192.168.1.1" }, { "dev": "br0", "stale": false, "mac": "E4:5F:01:A5:72:2A", "noarp": false, "permanent": false, "failed": false, "family": 4, "proxy": false, "router": false, "reachable": true, "probe": false, "delay": false, "incomplete": false, "ip": "192.168.1.20", "hostname": "homeassistant", "host": "192.168.1.1" }, { "dev": "br0", "stale": true, "mac": "BA:EC:46:AE:46:E1", "noarp": false, "permanent": false, "failed": false, "family": 4, "proxy": false, "router": false, "reachable": false, "probe": false, "delay": false, "incomplete": false, "ip": "192.168.1.90", "hostname": null, "host": "192.168.1.1" }, { "dev": "eth0", "stale": false, "mac": "00:25:90:BA:B3:63", "noarp": false, "permanent": false, "failed": false, "family": 4, "proxy": false, "router": false, "reachable": true, "probe": false, "delay": false, "incomplete": false, "ip": "132.231.14.129", "hostname": null, "host": "192.168.1.1" }, { "dev": "br0", "stale": true, "mac": "B4:B0:24:44:D3:E2", "noarp": false, "permanent": false, "failed": false, "family": 4, "proxy": false, "router": false, "reachable": false, "probe": false, "delay": false, "incomplete": false, "ip": "192.168.1.85", "hostname": null, "host": "192.168.1.1" }' + ']';
        let devices = JSON.parse(data);
        let deviceList = [];

        for (let device of devices) {
            let deviceEntry = [
                device.hostname,
                device.ip,
                device.mac,
                device.reachable
            ];
            deviceList.push(deviceEntry);
        }

        return deviceList;
    }

    // Add force-direction
    let simulation = d3
        .forceSimulation(graphData.nodes)
        .force("charge", d3.forceManyBody().strength(-1000))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("link", d3.forceLink(graphData.links).id(d => d.name))
        .on("tick", ticked);

    let drag = d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);

    nodes.call(drag);


    //updating the position
    function ticked() {
        nodes
            .attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            });
        links
            .attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });
    }

    function dragstarted(event, d) {
        //your alpha hit 0 it stops! make it run again
        simulation.alphaTarget(0.3).restart();
        d.fx = event.x;
        d.fy = event.y;
    }
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        // alpha min is 0, head there
        simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}
