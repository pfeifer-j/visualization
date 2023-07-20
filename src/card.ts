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
    };
  }

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
      generateView(this, this._config); // Pass the _config object to the generateView function
    }, 0);

    return html`
      <div class="centered-container">
        <ha-card header="${this._header}">
          <div class="card-content">${content}</div>
        </ha-card>
      </div>
    `;
  }
}