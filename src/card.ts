import { html, LitElement, TemplateResult, nothing } from "lit";
import { styles } from "./css";
import { state } from "lit/decorators/state";
import * as d3 from "d3";
import { generateView } from './view';

import { HomeAssistant, LovelaceCardConfig } from "custom-card-helpers";

interface Config extends LovelaceCardConfig {
  header: string;
  entity: string;
}

export class NetworkVisualization extends LitElement {
  // The internal reactive states
  @state() private _header: string | typeof nothing;

  // The configuration provided by the editor
  @state() private _config: Config | undefined;

  // Private property
  private _hass: HomeAssistant;

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
      openWrtColor: "lightblue",
      nodeReachable: "green",
      nodeUnreachable: "red",
      nodeHighlighted: "orange",
      nodeIsolated: "gray",
      rowDefault: "transparent",
      rowSelected: "white",
      fontDefault: "white",
      fontSelected: "black",
      linkDefault: "gray",
      linkHighlighted: "orange",
      unselectedRadius: 10,
      communicatedRadius: 12,
      selectedRadius: 15,
      linkWidthDefault: 1,
      linkWidthHighlighted: 3,
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

    // Graph
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