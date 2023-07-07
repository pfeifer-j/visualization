import { css } from "lit";

export const styles = css`
  .tooltip {
    position: relative;
    display: inline-block;
    border-bottom: 1px dotted black; /* If you want dots under the hoverable text */
  }
  .card-content {
    overflow: visible;
    height: 100%;
  }
  .graph-container {
    width: 100%;
    height: 100%;
    overflow: visible;
    position: relative;
  }
`;
