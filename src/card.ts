import { html, LitElement, TemplateResult, nothing } from "lit";
import { styles } from "./card.styles";
import { state } from "lit/decorators/state";
import * as d3 from "d3";
import { initializeD3 } from './graphGeneration';
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
  private _hass: HomeAssistant;

  // Lifecycle interface
  public setConfig(config: Config) {
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
    const content: TemplateResult = html`<svg id="networkSvg"></svg>`;

    const svgId = 'networkSvg';
    const svgSelector = `#${svgId}`;

    setTimeout(() => {
      const svg = d3.select(this.renderRoot.querySelector(svgSelector));
      initializeD3(this);
    }, 0);

    return html`
      <ha-card header="${this._header}">
        <div class="card-content">${content}</div>
      </ha-card>
    `;
  }
}
