/**
 * editor.ts - Configuration editor for the Network Visualization card.
 *
 * Purpose:
 * Provides an interface for Home Assistant's UI Editor, allowing users to customize
 * the visual properties and behaviors of the Network Visualization card. This includes
 * aspects like colors, intervals, sizes, and network settings.
 *
 * Author: Jan Pfeifer
 */

import { css, html, LitElement } from "lit";
import { state } from "lit/decorators/state";

export class NetworkVisualizationEditor extends LitElement {
  @state() _config;

  setConfig(config) {
    this._config = config;
  }

  static styles = css`
    .table {
      display: table;
      width: 100%;
    }
    .row {
      display: table-row;
    }
    .cell {
      display: table-cell;
      padding: 0.5em;
    }
  `;

  render() {
    return html`
    <form class="table" id="editor-table">
    <h3>General:</h3>
    <div class="row">
       <label class="label cell" for="header">Header:</label>
       <input
          @change="${this.handleChangedEvent}"
          class="value cell" id="header" value="${this._config.header}"
          ></input>
    </div>
    <div class="row">
       <label class="label cell" for="renderInterval">Render Interval in ms:</label>
       <input
          type="range"
          min="1000" max="120000" step="1000"
          @change="${this.handleChangedEvent}"
          class="value cell" id="renderInterval" value="${this._config.renderInterval}"
          ></input>
       <span id="renderIntervalValue">${this._config.renderInterval}</span>
    </div>
    <div class="row">
       <label class="label cell" for="graphForce">Graph Force:</label>
       <input
          type="range"
          min="-1000" max="1000" step="50"
          @change="${this.handleChangedEvent}"
          class="value cell" id="graphForce" value="${this._config.graphForce}"
          ></input>
       <span id="graphForceValue">${this._config.graphForce}</span>
    </div>
    <div class="row">
       <label class="label cell" for="duration">Animation Duration in ms:</label>
       <input
          type="range"
          min="0" max="1000" step="50"
          @change="${this.handleChangedEvent}"
          class="value cell" id="duration" value="${this._config.duration}"
          ></input>
       <span id="durationValue">${this._config.duration}</span>
    </div>
    <h3>Network:</h3>
    <div class="row">
       <label class="label cell" for="openWrtIP">OpenWrt IP:</label>
       <input
          @change="${this.handleChangedEvent}"
          class="value cell" id="openWrtIP" value="${this._config.openWrtIP}"
          ></input>
    </div>
    <div class="row">
    <label class="label cell" for="hassIP">Home Assistant IP:</label>
    <input
       @change="${this.handleChangedEvent}"
       class="value cell" id="hassIP" value="${this._config.hassIP}"
       ></input>
    </div>
    <div class="row">
       <label class="label cell" for="mode">Network Mode:</label>
       <select
          id="mode"
          class="value cell"
          @change="${this.handleChangedEvent}">
          <option value="software" ?selected="${this._config.mode === 'software'}">Software</option>
          <option value="physical" ?selected="${this._config.mode === 'physical'}">Physical</option>
       </select>
    </div>
    <div class="row">
       <label class="label cell" for="isDemo">Demo Network:</label>
       <input type="checkbox"
          @change="${this.handleChangedEvent}"
          class="value cell" id="isDemo"
          ?checked="${this._config.isDemo}"
          ></input>
       <span class="slider round"></span>
    </div>
    <h3>Color:</h3>
    <div class="row">
       <label class="label cell" for="openWrtColor">OpenWrt Color:</label>
       <input
          type="color"
          @change="${this.handleChangedEvent}"
          class="value cell" id="openWrtColor" value="${this._config.openWrtColor}"
          ></input>
    </div>
    <div class="row">
    <label class="label cell" for="    <div class="row">
       <label class="label cell" for="vSwitchColor">OpenWrt Color:</label>
       <input
          type="color"
          @change="${this.handleChangedEvent}"
          class="value cell" id="vSwitchColor" value="${this._config.vSwitchColor}"
          ></input>
    </div>">OpenWrt Color:</label>
    <input
       type="color"
       @change="${this.handleChangedEvent}"
       class="value cell" id="openWrtColor" value="${this._config.openWrtColor}"
       ></input>
    </div>
    <div class="row">
       <label class="label cell" for="nodeReachable">Node Reachable Color:</label>
       <input
          type="color"
          @change="${this.handleChangedEvent}"
          class="value cell" id="nodeReachable" value="${this._config.nodeReachable}"
          ></input>
    </div>
    <div class="row">
       <label class="label cell" for="nodeUnreachable">Node Unreachable Color:</label>
       <input
          type="color"
          @change="${this.handleChangedEvent}"
          class="value cell" id="nodeUnreachable" value="${this._config.nodeUnreachable}"
          ></input>
    </div>
    <div class="row">
       <label class="label cell" for="nodeHighlighted">Node Highlighted Color:</label>
       <input
          type="color"
          @change="${this.handleChangedEvent}"
          class="value cell" id="nodeHighlighted" value="${this._config.nodeHighlighted}"
          ></input>
    </div>
    <div class="row">
       <label class="label cell" for="nodeIsolated">Node Isolated Color:</label>
       <input
          type="color"
          @change="${this.handleChangedEvent}"
          class="value cell" id="nodeIsolated" value="${this._config.nodeIsolated}"
          ></input>
    </div>
    <div class="row">
       <label class="label cell" for="rowDefault">Row Default Color:</label>
       <input
          type="color"
          @change="${this.handleChangedEvent}"
          class="value cell" id="rowDefault" value="${this._config.rowDefault}"
          ></input>
    </div>
    <div class="row">
       <label class="label cell" for="rowSelected">Row Selected Color:</label>
       <input
          type="color"
          @change="${this.handleChangedEvent}"
          class="value cell" id="rowSelected" value="${this._config.rowSelected}"
          ></input>
    </div>
    <div class="row">
       <label class="label cell" for="fontDefault">Default Font Color:</label>
       <input
          type="color"
          @change="${this.handleChangedEvent}"
          class="value cell" id="fontDefault" value="${this._config.fontDefault}"
          ></input>
    </div>
    <div class="row">
       <label class="label cell" for="fontSelected">Selected Font Color:</label>
       <input
          type="color"
          @change="${this.handleChangedEvent}"
          class="value cell" id="fontSelected" value="${this._config.fontSelected}"
          ></input>
    </div>
    <div class="row">
       <label class="label cell" for="linkDefault">Default Link Color:</label>
       <input
          type="color"
          @change="${this.handleChangedEvent}"
          class="value cell" id="linkDefault" value="${this._config.linkDefault}"
          ></input>
    </div>
    <div class="row">
       <label class="label cell" for="linkHighlighted">Highlighted Link Color:</label>
       <input
          type="color"
          @change="${this.handleChangedEvent}"
          class="value cell" id="linkHighlighted" value="${this._config.linkHighlighted}"
          ></input>
    </div>
    <h3>Shape:</h3>
    <div class="row">
       <label class="label cell" for="unselectedRadius">Unselected Radius:</label>
       <input
          type="range"
          min="1" max="50" step="1"
          @change="${this.handleChangedEvent}"
          class="value cell" id="unselectedRadius" value="${this._config.unselectedRadius}"
          ></input>
       <span id="unselectedRadiusValue">${this._config.unselectedRadius}</span>
    </div>
    <div class="row">
       <label class="label cell" for="communicatedRadius">Communicated Radius:</label>
       <input
          type="range"
          min="1" max="50" step="1"
          @change="${this.handleChangedEvent}"
          class="value cell" id="communicatedRadius" value="${this._config.communicatedRadius}"
          ></input>
       <span id="communicatedRadiusValue">${this._config.communicatedRadius}</span>
    </div>
    <div class="row">
       <label class="label cell" for="selectedRadius">Selected Radius:</label>
       <input
          type="range"
          min="1" max="50" step="1"
          @change="${this.handleChangedEvent}"
          class="value cell" id="selectedRadius" value="${this._config.selectedRadius}"
          ></input>
       <span id="selectedRadiusValue">${this._config.selectedRadius}</span>
    </div>
    <div class="row">
       <label class="label cell" for="linkWidthDefault">Default Link Width:</label>
       <input
          type="range"
          min="0.1" max="10" step="0.1"
          @change="${this.handleChangedEvent}"
          class="value cell" id="linkWidthDefault" value="${this._config.linkWidthDefault}"
          ></input>
       <span id="linkWidthDefaultValue">${this._config.linkWidthDefault}</span>
    </div>
    <div class="row">
       <label class="label cell" for="linkWidthHighlighted">Highlighted Link Width:</label>
       <input
          type="range"
          min="0.1" max="10" step="0.1"
          @change="${this.handleChangedEvent}"
          class="value cell" id="linkWidthHighlighted" value="${this._config.linkWidthHighlighted}"
          ></input>
       <span id="linkWidthHighlightedValue">${this._config.linkWidthHighlighted}</span>
    </div>
 </form>
`;
  }

  handleChangedEvent(changedEvent) {
    const target = changedEvent.target;
    const newConfig = { ...this._config }; // Use spread operator for object copying

    switch (target.id) {
      case "header":
        newConfig.header = target.value;
        break;
      case "renderInterval":
        newConfig.renderInterval = parseInt(target.value);
        break;
      case "openWrtIP":
        newConfig.openWrtIP = target.value;
        break;
      case "hassIP":
        newConfig.hassIP = target.value;
        break;
      case "mode":
        newConfig.mode = target.value;
        break;
      case "isDemo":
        newConfig.isDemo = target.checked;
        break;
      case "openWrtColor":
        newConfig.openWrtColor = target.value;
        break;
      case "vSwitchColor":
        newConfig.vSwitchColor = target.value;
        break;
      case "unselectedRadius":
        newConfig.unselectedRadius = parseInt(target.value);
        break;
      case "communicatedRadius":
        newConfig.communicatedRadius = parseInt(target.value);
        break;
      case "selectedRadius":
        newConfig.selectedRadius = parseInt(target.value);
        break;
      case "nodeReachable":
        newConfig.nodeReachable = target.value;
        break;
      case "nodeUnreachable":
        newConfig.nodeUnreachable = target.value;
        break;
      case "nodeHighlighted":
        newConfig.nodeHighlighted = target.value;
        break;
      case "nodeIsolated":
        newConfig.nodeIsolated = target.value;
        break;
      case "rowDefault":
        newConfig.rowDefault = target.value;
        break;
      case "rowSelected":
        newConfig.rowSelected = target.value;
        break;
      case "fontDefault":
        newConfig.fontDefault = target.value;
        break;
      case "fontSelected":
        newConfig.fontSelected = target.value;
        break;
      case "linkDefault":
        newConfig.linkDefault = target.value;
        break;
      case "linkHighlighted":
        newConfig.linkHighlighted = target.value;
        break;
      case "linkWidthDefault":
        newConfig.linkWidthDefault = parseInt(target.value);
        break;
      case "linkWidthHighlighted":
        newConfig.linkWidthHighlighted = parseInt(target.value);
        break;
      case "graphForce":
        newConfig.graphForce = parseInt(target.value);
        break;
      case "duration":
        newConfig.duration = parseInt(target.value);
        break;
      case "shape":
        newConfig.shape = target.value;
        break;
      default:
        break;
    }

    const messageEvent = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(messageEvent);
  }
}