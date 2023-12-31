/**
 * styles.ts - Styling module for the Network Visualization card in Home Assistant.
 *
 * Purpose:
 * Provides CSS styles tailored for the Network Visualization card's visual appearance and layout.
 * This module defines the aesthetic and spatial attributes of elements, ensuring clarity,
 * responsiveness, and a user-friendly interface in the Home Assistant environment.
 *
 * Author: Jan Pfeifer
 */

import { css } from "lit";

export const styles = css`
  ha-card {
    width: fit-content;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
  .card-content {
    flex: 1;
    display: flex;
    width: 80vb;
    overflow: hidden;
  }
  .centered-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
  .card-container {
    display: flex;
    flex-wrap: nowrap;
  }
  #editor-table {
    table-layout: fixed;
    width: 100%;
  }
  .table-border {
    border: 2px solid darkgray;
    box-sizing: border-box;
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
    height: 100%;
    box-sizing: border-box;
    padding: 2px;
    user-select: text;
  }
  #tableSvg {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 2px;
    user-select: text;
  }
`;