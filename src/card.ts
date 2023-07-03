import { html, LitElement, TemplateResult, nothing } from "lit";
import { styles } from "./card.styles";
import { state } from "lit/decorators/state";
import * as d3 from "d3";
import axios from 'axios';

import { HassEntity } from "home-assistant-js-websocket";
import { HomeAssistant, LovelaceCardConfig } from "custom-card-helpers";

interface Config extends LovelaceCardConfig {
  header: string;
  entity: string;
}

/**
 * The NetworkVisualization gathers information from the OpenWRT
 * router and the OVS Switch to generate a force-directed graph
 * within Home Assistant representing all devices connected to the network.
 */
export class NetworkVisualization extends LitElement {

  // The internal reactive states
  @state() private _header: string | typeof nothing;

  // Private property
  private _hass;

  // Lifecycle interface
  setConfig(config: Config) {
    this._header = config.header === "" ? nothing : config.header;

    // Call set hass() to immediately adjust to a changed entity
    // while editing the entity in the card editor
    if (this._hass) {
      this.hass = this._hass;
    }
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
  }

  // Declarative part
  static styles = styles;

  // Card configuration using the Home Assistant Editor
  static getConfigElement() {
    return document.createElement("network-visualization-editor");
  }

  // Default configuration
  static getStubConfig() {
    return {
      header: "My Network:",
    };
  }

  render() {
    let content: TemplateResult = html`<svg id="networkSvg"></svg>`;

    const svgId = 'networkSvg';
    const svgSelector = `#${svgId}`;

    setTimeout(() => {
      const svg = d3.select(this.renderRoot.querySelector(svgSelector));
      this.initializeD3();
    }, 0);

    return html`
      <ha-card header="${this._header}">
        <div class="card-content">${content}</div>
      </ha-card>
    `;
  }

  // Initialize the d3.js visualization
  private initializeD3() {

    const svgSelector = '#networkSvg';
    const svgElement = this.renderRoot.querySelector(svgSelector) as SVGElement;

    // Define the dimensions of the card and the SVG element
    const cardWidth = 500;
    const cardHeight = 500;
    const svgWidth = cardWidth - 20; // Subtracting padding
    const svgHeight = cardHeight - 20; // Subtracting padding

    // Create the zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 2]) // Limit the zoom range
      .on('zoom', zoomed);

    // Apply the zoom behavior to the SVG element
    svgElement.setAttribute('width', svgWidth.toString());
    svgElement.setAttribute('height', svgHeight.toString());

    svgElement.parentElement?.setAttribute('style', `width: ${cardWidth}px; height: ${cardHeight}px; overflow: auto;`);

    const svg = d3.select(svgElement).call(zoom);
    var width = svg.attr("width");
    var height = svg.attr("height");

    // generate graph
    var graphData = {
      nodes: [],
      links: []
    };

    const devices = getDevices();
    devices.forEach(device => {
      const [hostname, ip, mac, reachable] = device;

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

    const links = svg
      .append("g")
      .selectAll("line")
      .data(graphData.links)
      .enter()
      .append("line")
      .attr("stroke-width", 1)
      .style("stroke", "darkgray");

    links.append("text").text(d => d.name);

    let tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    const nodes = svg
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
      .on('mouseover', function () {
        d3.select(this).transition()
          .duration('200')
          .style("fill-opacity", 1);

        tooltip.transition()
          .duration(100)
          .style("opacity", 1);

        let content = "IP: " + this.name + "<br/>" + "Hostname: " + this.hostname + "<br/>" +
          "MAC: " + this.mac;

        content = "asfasdfasdf";
        console.log(content);

        // add content to the tooltips
        tooltip.html(content)
          .style("left", (this.getBoundingClientRect().x + 10) + "px")
          .style("top", (this.getBoundingClientRect().y - 15) + "px");

      })
      .on('mouseout', handleMouseOut);

    // Select the node with IP "192.168.1.1" and update its attributes
    const routerNode = svg
      .select("circle[ip='192.168.1.1']")
      .attr("r", 12)
      .attr("fill", "lightblue");

    function handleMouseOut(d, i) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", 10)
        .attr("fill", node => (node.reachable ? "#43AF11" : "#F03A47"));

      tooltip.transition()
        .duration(200)
        .style("opacity", 0);
    }

    var simulation = d3
      .forceSimulation(graphData.nodes)
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("link", d3.forceLink(graphData.links).id(d => d.name))
      .on("tick", ticked);

    /*
    var drag = d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);

    nodes.call(drag);
    */

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

    // Function to show the tooltip
    function showTooltip(d, event) {
      tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
      tooltip.html(`
          <strong>IP:</strong> ${d.name}<br>
          <strong>Hostname:</strong> ${d.hostname}<br>
          <strong>MAC:</strong> ${d.mac}<br>
          <strong>Reachable:</strong> ${d.reachable}
        `)
    }


    // Function to hide the tooltip
    function hideTooltip() {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    }

    // retrieve devices from router
    function getDevices() {

      //const data = '[{ "dev": "br0", "stale": false, "mac": "76:AA:93:FD:81:22", "noarp": false, "permanent": false, "failed": false, "family": 4, "proxy": false, "router": false, "reachable": true, "probe": false, "delay": false, "incomplete": false, "ip": "192.168.1.89", "hostname": "M2012K11AG", "host": "192.168.1.1" }, { "dev": "br0", "stale": true, "mac": "54:EF:44:37:83:F1", "noarp": false, "permanent": false, "failed": false, "family": 4, "proxy": false, "router": false, "reachable": false, "probe": false, "delay": false, "incomplete": false, "ip": "192.168.1.74", "hostname": null, "host": "192.168.1.1" }]';
      const data = '[' + '{ "dev": "br0", "stale": true, "mac": "76:AA:93:FD:81:22", "noarp": false, "permanent": false, "failed": false, "family": 4, "proxy": false, "router": false, "reachable": false, "probe": false, "delay": false, "incomplete": false, "ip": "192.168.1.89", "hostname": "M2012K11AG", "host": "192.168.1.1" }, { "dev": "br0", "stale": false, "mac": "54:EF:44:37:83:F1", "noarp": false, "permanent": false, "failed": false, "family": 4, "proxy": false, "router": false, "reachable": true, "probe": false, "delay": false, "incomplete": false, "ip": "192.168.1.74", "hostname": null, "host": "192.168.1.1" }, { "dev": "br0", "stale": false, "mac": "34:E1:2D:E3:49:7D", "noarp": false, "permanent": false, "failed": false, "family": 4, "proxy": false, "router": false, "reachable": true, "probe": false, "delay": false, "incomplete": false, "ip": "192.168.1.67", "hostname": null, "host": "192.168.1.1" }, { "dev": "br0", "stale": false, "mac": "E4:5F:01:A5:72:2A", "noarp": false, "permanent": false, "failed": false, "family": 4, "proxy": false, "router": false, "reachable": true, "probe": false, "delay": false, "incomplete": false, "ip": "192.168.1.20", "hostname": "homeassistant", "host": "192.168.1.1" }, { "dev": "br0", "stale": true, "mac": "BA:EC:46:AE:46:E1", "noarp": false, "permanent": false, "failed": false, "family": 4, "proxy": false, "router": false, "reachable": false, "probe": false, "delay": false, "incomplete": false, "ip": "192.168.1.90", "hostname": null, "host": "192.168.1.1" }, { "dev": "eth0", "stale": false, "mac": "00:25:90:BA:B3:63", "noarp": false, "permanent": false, "failed": false, "family": 4, "proxy": false, "router": false, "reachable": true, "probe": false, "delay": false, "incomplete": false, "ip": "132.231.14.129", "hostname": null, "host": "192.168.1.1" }, { "dev": "br0", "stale": true, "mac": "B4:B0:24:44:D3:E2", "noarp": false, "permanent": false, "failed": false, "family": 4, "proxy": false, "router": false, "reachable": false, "probe": false, "delay": false, "incomplete": false, "ip": "192.168.1.85", "hostname": null, "host": "192.168.1.1" }' + ']';
      const devices = JSON.parse(data);
      const deviceList = [];

      for (const device of devices) {
        const deviceEntry = [
          device.hostname,
          device.ip,
          device.mac,
          device.reachable
        ];
        deviceList.push(deviceEntry);
      }

      return deviceList;
    }

    function dragstarted(d) {
      //your alpha hit 0 it stops! make it run again
      //simulation.alphaTarget(0.3).restart();
      //d.fx = d3.event.x;
      //d.fy = d3.event.y;
    }
    function dragged(d) {
      //d.fx = d3.event.x;
      //d.fy = d3.event.y;
    }

    function dragended(d) {
      // alpha min is 0, head there
      //simulation.alphaTarget(0);
      //d.fx = null;
      //d.fy = null;
    }

    // Function to handle zooming
    function zoomed() {
      // TODO
      // svg.attr('transform', d3.event.transform);
    }
  }
}