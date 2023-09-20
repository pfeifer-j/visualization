**Network Visualization for Smart Homes** 

This project provides a comprehensive tool for visualizing and managing network activity within a smart home. Integrating devices, from light bulbs to routers, this system offers both a bird's eye view of network activity and the granular control needed for network administrators.

This tool was created during the writing of the bachelors thesis in computer science. The thesis can be found as a pdf in the repository.

## Installation

1. **Prerequisites**:
   - Ensure you have a Raspberry Pi 4 Model B, or an equivalent system, set up and ready to go.
   - A selection of IoT devices.
   - Familiarize yourself with Home Assistant, OpenWRT, and Open vSwitch (OVS) platforms.
   
2. **Setup Hardware**:
   - Follow a physical layout depicted in the architecture section of the thesis.
   - Connect the IoT devices to the WiFi.

3. **Setup Software**:
   - Install the specified versions of the software as outlined in the table. Particularly, ensure you have Home Assistant, OpenWRT, OVS, and Ryu.
   - Use the provided configuration files and scripts from the project repository to set up and configure the software on the respective devices.

4. **Post Installation**:
   - Once all software is set up, ensure your network is up and running. Test with some basic network commands or tools to validate the setup.

## Usage

1. **Launching the Project**:
   - Access the Home Assistant interface via the designated IP address (typically http://localhost:8124 for local installations).
   - Navigate through the interface to locate the network visualization tool.

2. **Interacting with the Visualization**:
   - Devices will be represented as nodes on the visualization graph.
   - Click on a node to view details, such as its IP and MAC addresses.
   - Use the editor to customize the visualization to your liking.

3. **Managing Network Traffic**:
   - Using the tool, you can isolate devices, view communication endpoints, and even initiate certain network flow controls. Detailed guidance is provided in the tool's help section.

## Features

1. **Network and Communication Flow Visualization**: View the entire network layout with nodes representing each device. Track communication flows and see which devices are communicating with each other.

2. **Automatic Updates**: Set your preferred update interval. The visualization will refresh periodically to show real-time network activity.

3. **Network Flow Control**: Isolate devices with a single click, ensuring they can only communicate with the router.

4. **Customization**: Adjust various visualization parameters, such as node color, link thickness, and more, to make the graph tailored to your preferences.
