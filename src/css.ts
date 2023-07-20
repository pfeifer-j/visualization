import { css } from "lit";

export const styles = css`
  ha-card {
    width: fit-content;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
  #element-preview{
    overflow: auto;
  }
  #network-visualization{
    overflow: auto;
  }
  .card-content {
    flex: 1;
    display: flex;
    width: 80vb;
    overflow: hidden;
  }
  .card-container {
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
  .graph-container,
    justify-content: left;
    flex: 1;
    display: flex;
    overflow: hidden;
    user-select: text;
  }
  .table-container {
    justify-content: r;
    flex: 1;
    display: flex;
    overflow: hidden;
    user-select: text;
  }
  #graphSvg {
    width: 100%;
    height: 500px;
    box-sizing: border-box;
    padding: 2px;
    user-select: text;
  }
  #tableSvg {
    width: 100%;
    height: 500px;
    box-sizing: border-box;
    border: 2px solid darkgray;
    padding: 2px;
    user-select: text;
  }
`;