import { NetworkVisualization } from "./card";
import { NetworkVisualizationEditor } from "./editor";

declare global {
  interface Window {
    customCards: Array<Object>;
  }
}

customElements.define("network-visualization", NetworkVisualization);
customElements.define("network-visualization-editor", NetworkVisualizationEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "network-visualization",
  name: "Network Visualization",
  description: "Through the combination of OpenWRT and OVS all connected wifi devices and their network-flow can be visualized.",
});
