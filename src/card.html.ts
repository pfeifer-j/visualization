import { html } from "lit";

export const format = html`

<template>
  <dl class="dl">
    <dt class="dt">${_name}</dt>
    <dd class="dd" @click="${doToggle}">
      <span class="toggle ${_status}">
        <span class="button"></span>
      </span>
      <span class="value">${_status}</span>
    </dd>
  </dl>
  <div id="container">d3 Container test
    <svg id="mySvg"></svg>
  </div>
</template>
`
