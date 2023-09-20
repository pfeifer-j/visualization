# Installation Guide for Network Visualization in Smart Homes

Follow this step-by-step guide to set up the network visualization tool for smart homes.

## 1. OpenWRT Installation

- **Recommended Hardware**: While you can install OpenWRT on a Raspberry Pi, it's highly recommended to use dedicated OpenWRT hardware for better performance and stability.
- **Firmware Update**: Ensure you install the latest firmware from the official OpenWRT website.
- **Installing OVS**: Once OpenWRT is set up, install Open vSwitch (OVS) on the router.

## 2. Configuring the SDN Controller

- **Ryu Controller**: In this guide, we use the Ryu SDN controller. Install it on a system running Raspbian.
- **Version Compatibility**: Refer to the versions specified in the thesis for ensuring compatibility and best performance.

## 3. Home Assistant Setup

- **Installation**: If you haven't already, install Home Assistant on your preferred system.
- **Custom Card Integration**:
  - Elmar Hinz has provided a comprehensive guide on integrating the custom card with Home Assistant. Follow Elmar Hinz's guide, as referenced in the thesis, to add the custom card to Home Assistant.

## 4. IoT Device Integration

- Add IoT devices to your network, ensuring they're properly configured to communicate with the router and other devices.

## 5. Visualization

- Once everything is set up, load the Home Assistant dashboard. If you've followed the steps correctly, you should now see the network visualization on the custom card you added.

## Troubleshooting

If the visualization isn't visible or you encounter any issues:
- Double-check all steps to ensure everything is configured correctly.
- Feel free to contact the project maintainer via GitHub for additional support or clarifications.

