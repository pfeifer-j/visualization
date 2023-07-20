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
          <label class="label cell" for="graphWidth">Graph Width:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="graphWidth" value="${this._config.graphWidth || 500}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="graphHeight">Graph Height:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="graphHeight" value="${this._config.graphHeight || 500}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="tableWidth">Table Width:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="tableWidth" value="${this._config.tableWidth || 350}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="tableHeight">Table Height:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="tableHeight" value="${this._config.tableHeight || 500}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="unselectedRadius">Unselected Radius:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="unselectedRadius" value="${this._config.unselectedRadius || 10}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="communicatedRadius">Communicated Radius:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="communicatedRadius" value="${this._config.communicatedRadius || 12}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="selectedRadius">Selected Radius:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="selectedRadius" value="${this._config.selectedRadius || 15}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="nodeReachable">Node Reachable Color:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="nodeReachable" value="${this._config.nodeReachable || "#3BD16F"}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="nodeUnreachable">Node Unreachable Color:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="nodeUnreachable" value="${this._config.nodeUnreachable || "#F03A47"}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="nodeHighlighted">Node Highlighted Color:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="nodeHighlighted" value="${this._config.nodeHighlighted || "orange"}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="rowDefault">Row Default Color:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="rowDefault" value="${this._config.rowDefault || "transparent"}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="rowSelected">Row Selected Color:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="rowSelected" value="${this._config.rowSelected || "white"}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="fontDefault">Default Font Color:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="fontDefault" value="${this._config.fontDefault || "white"}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="fontSelected">Selected Font Color:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="fontSelected" value="${this._config.fontSelected || "black"}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="linkDefault">Default Link Color:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="linkDefault" value="${this._config.linkDefault || "darkgray"}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="linkHighlighted">Highlighted Link Color:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="linkHighlighted" value="${this._config.linkHighlighted || "orange"}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="linkWidthDefault">Default Link Width:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="linkWidthDefault" value="${this._config.linkWidthDefault || 1}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="linkWidthHighlighted">Highlighted Link Width:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="linkWidthHighlighted" value="${this._config.linkWidthHighlighted || 5}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="openWrtIP">OpenWrt IP:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="openWrtIP" value="${this._config.openWrtIP || "192.168.1.1"}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="openWrtColor">OpenWrt Color:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="openWrtColor" value="${this._config.openWrtColor || "lightblue"}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="graphForce">Graph Force:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="graphForce" value="${this._config.graphForce || -300}"
          ></input>
        </div>
        <div class="row">
          <label class="label cell" for="duration">Duration:</label>
          <input
            @change="${this.handleChangedEvent}"
            class="value cell" id="duration" value="${this._config.duration || 200}"
          ></input>
        </div>
      </form>
    `;
  }

  handleChangedEvent(changedEvent: Event) {
    const target = changedEvent.target as HTMLInputElement;
    // this._config is readonly, copy needed
    const newConfig = Object.assign({}, this._config);
    if (target.id == "header") {
      newConfig.header = target.value;
    } else if (target.id == "graphWidth") {
      newConfig.graphWidth = parseInt(target.value);
    } else if (target.id == "graphHeight") {
      newConfig.graphHeight = parseInt(target.value);
    } else if (target.id == "tableWidth") {
      newConfig.tableWidth = parseInt(target.value);
    } else if (target.id == "tableHeight") {
      newConfig.tableHeight = parseInt(target.value);
    } else if (target.id == "unselectedRadius") {
      newConfig.unselectedRadius = parseInt(target.value);
    } else if (target.id == "communicatedRadius") {
      newConfig.communicatedRadius = parseInt(target.value);
    } else if (target.id == "selectedRadius") {
      newConfig.selectedRadius = parseInt(target.value);
    } else if (target.id == "nodeReachable") {
      newConfig.nodeReachable = target.value;
    } else if (target.id == "nodeUnreachable") {
      newConfig.nodeUnreachable = target.value;
    } else if (target.id == "nodeHighlighted") {
      newConfig.nodeHighlighted = target.value;
    } else if (target.id == "rowDefault") {
      newConfig.rowDefault = target.value;
    } else if (target.id == "rowSelected") {
      newConfig.rowSelected = target.value;
    } else if (target.id == "fontDefault") {
      newConfig.fontDefault = target.value;
    } else if (target.id == "fontSelected") {
      newConfig.fontSelected = target.value;
    } else if (target.id == "linkDefault") {
      newConfig.linkDefault = target.value;
    } else if (target.id == "linkHighlighted") {
      newConfig.linkHighlighted = target.value;
    } else if (target.id == "linkWidthDefault") {
      newConfig.linkWidthDefault = parseInt(target.value);
    } else if (target.id == "linkWidthHighlighted") {
      newConfig.linkWidthHighlighted = parseInt(target.value);
    } else if (target.id == "openWrtIP") {
      newConfig.openWrtIP = target.value;
    } else if (target.id == "openWrtColor") {
      newConfig.openWrtColor = target.value;
    } else if (target.id == "graphForce") {
      newConfig.graphForce = parseInt(target.value);
    } else if (target.id == "duration") {
      newConfig.duration = parseInt(target.value);
    }
    const messageEvent = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(messageEvent);
  }
}
