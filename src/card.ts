/**
 * card.ts - The entry point for visualizing networks in a Home Assistant environment.
 *
 * Purpose:
 * This module creates a custom card for the Home Assistant frontend, providing visualization tools
 * for network devices and their communications. The card visualizes the data on an SVG canvas and
 * includes a table for detailed device information.
 *
 * Author: Jan Pfeifer
 *
 * Notes:
 * - The card is built using the LitElement library and utilizes D3 for data-driven SVG rendering.
 * - The card's configuration is adjustable via the Home Assistant's Lovelace card editor.
 * - Default configuration values are provided for easy setup and can be overridden via the editor.
 */

import { html, LitElement, TemplateResult, nothing } from "lit";
import { styles } from "./css";
import { state } from "lit/decorators/state";
import * as d3 from "d3";
import { generateView } from './view';

import { HomeAssistant, LovelaceCardConfig } from "custom-card-helpers";

interface Config extends LovelaceCardConfig {
  header: string;
  entity: string;
  renderInterval: number;
}

export class NetworkVisualization extends LitElement {
  // The internal reactive states
  @state() private _header: string | typeof nothing;

  // The configuration provided by the editor
  @state() private _config: Config | undefined;

  // Private property
  private _hass: HomeAssistant;

  // The interval for updating the svg
  private _intervalId?: number;


  // Lifecycle interface
  public setConfig(config: Config) {
    this._config = config;
    this._header = config.header === "" ? nothing : config.header;

    // Call set hass() to immediately adjust to a changed entity
    // while editing the entity in the card editor
    if (this._hass) {
      this.hass = this._hass;
    }
  }

  public set hass(hass: HomeAssistant) {
    this._hass = hass;
  }

  connectedCallback(): void {
    super.connectedCallback();

    // Start the interval when the component is connected to the DOM
    if (this._config && this._config.renderInterval) {
      this._intervalId = window.setInterval(() => {
        this.requestUpdate();
      }, this._config.renderInterval);
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    // Clear the interval when the component is disconnected from the DOM
    if (this._intervalId !== undefined) {
      window.clearInterval(this._intervalId);
      this._intervalId = undefined;
    }
  }

  // Declarative part
  static styles = styles;

  // Card configuration using the Home Assistant Editor
  public static getConfigElement(): HTMLElement {
    return document.createElement("network-visualization-editor");
  }

  // Default configuration
  public static getStubConfig(): Record<string, unknown> {
    return {
      header: "My Network:",
      type: "custom: network- visualization",
      renderInterval: 15000,
      graphForce: -300,
      duration: 200,
      openWrtIP: "192.168.1.1",
      isDemo: false,
      mode: "physical",
      unselectedRadius: 10,
      communicatedRadius: 10,
      selectedRadius: 15,
      linkWidthDefault: 1,
      linkWidthHighlighted: 3,
      openWrtColor: "#627dea",
      nodeReachable: "#00ff33",
      nodeUnreachable: "#ff0000",
      nodeHighlighted: "#f0b056",
      nodeIsolated: "#ababab",
      rowDefault: "#ffffff",
      rowSelected: "#ffc800",
      fontSelected: "#ffffff",
      linkDefault: "#949494",
      linkHighlighted: "#ffbb00",
      fontDefault: "#474747",
    };
  }

  // Render the card
  public render(): TemplateResult {
    const content: TemplateResult = html`
      <div class="card-container">
        <div class="graph-container">
          <svg id="graphSvg"></svg>
        </div>
        <div class="table-container">
          <svg id="tableSvg"></svg>
        </div>
      </div>
    `;

    // Render the graph itself
    const graphId = 'graphSvg';
    const graphSelector = `#${graphId}`;

    setTimeout(() => {
      const graphSvg = d3.select(this.renderRoot.querySelector(graphSelector));
      if (this._config) {
        generateView(this, this._config);
      }
    }, 0);

    return html`
      <ha-card header="${this._header}">
        <div class="card-content">${content}</div>
      </ha-card>
    `;
  }
}