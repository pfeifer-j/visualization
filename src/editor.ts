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
      <form class="table">
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
            @change="${this.handleChangedEvent}"
            class="value cell" id="renderInterval" value="${this._config.renderInterval}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="openWrtIP">OpenWrt IP:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="openWrtIP" value="${this._config.openWrtIP}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="openWrtColor">OpenWrt Color:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="openWrtColor" value="${this._config.openWrtColor}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="unselectedRadius">Unselected Radius:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="unselectedRadius" value="${this._config.unselectedRadius}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="communicatedRadius">Communicated Radius:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="communicatedRadius" value="${this._config.communicatedRadius}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="selectedRadius">Selected Radius:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="selectedRadius" value="${this._config.selectedRadius}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="nodeReachable">Node Reachable Color:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="nodeReachable" value="${this._config.nodeReachable}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="nodeUnreachable">Node Unreachable Color:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="nodeUnreachable" value="${this._config.nodeUnreachable}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="nodeHighlighted">Node Highlighted Color:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="nodeHighlighted" value="${this._config.nodeHighlighted}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="rowDefault">Row Default Color:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="rowDefault" value="${this._config.rowDefault}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="rowSelected">Row Selected Color:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="rowSelected" value="${this._config.rowSelected}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="fontDefault">Default Font Color:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="fontDefault" value="${this._config.fontDefault}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="fontSelected">Selected Font Color:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="fontSelected" value="${this._config.fontSelected}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="linkDefault">Default Link Color:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="linkDefault" value="${this._config.linkDefault}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="linkHighlighted">Highlighted Link Color:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="linkHighlighted" value="${this._config.linkHighlighted}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="linkWidthDefault">Default Link Width:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="linkWidthDefault" value="${this._config.linkWidthDefault}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="linkWidthHighlighted">Highlighted Link Width:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="linkWidthHighlighted" value="${this._config.linkWidthHighlighted}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="graphForce">Graph Force:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="graphForce" value="${this._config.graphForce}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="duration">Duration:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="duration" value="${this._config.duration}"
          ></input>
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
      case "openWrtColor":
        newConfig.openWrtColor = target.value;
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
      default:
        break; // Do nothing if the target.id doesn't match any case
    }

    const messageEvent = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(messageEvent);
  }
}
