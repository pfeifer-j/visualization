# Network Visualization for Smart Homes

The increasing adoption of smart home devices, driven by the Internet of Things (IoT), has revolutionized home technology. This project introduces a straightforward Wi-Fi network visualization approach integrated within the Home Assistant platform, presenting both hardware-based and software-defined network structures of a smart home in a user-friendly format.

**Abstract**:  
The modern smart home, laden with IoT devices, has transformed the landscape of home technology, promising improved convenience. Yet, it's not devoid of complexities, especially in network visualization. Many existing tools are intricate or pricey, emphasizing the need for simpler, more accessible solutions. This project fulfills this gap by presenting a force-directed graph on the Home Assistant platform that offers an insight into both hardware and software-defined structures of the smart home network. Furthermore, it provides real-time data, user customization, and a level of network control, allowing users to interact with and manage their devices visually. An evaluation proved its user-friendliness, efficiency, and adaptability. Notably, it facilitates easy identification of crucial security metrics, such as unseen devices or possible security lapses, empowering users to bolster their smart home's security. Designed with user-friendliness and adaptability at its core, this tool is truly transformative for SDN visualization and control in smart homes.

**Project Context**:
This visualization tool was developed during a bachelor's thesis in computer science. For an in-depth understanding, details, and methodology, please refer to the thesis located as a PDF in this repository.

## Installation

1. **Prerequisites**:
   - A Raspberry Pi 4 Model B or equivalent.
   - Various IoT devices.
   - A very basic understanding of Home Assistant, OpenWRT, and Open vSwitch (OVS) platforms. Explanations can be found in the thesis.
   
2. **Hardware Configuration**:
   - Consult the architecture section of the thesis for the preferred physical layout.
   - Connect the IoT devices to the WiFi network.

3. **Software Configuration**:
   - Adhere to the software versions mentioned in the thesis. Ensure the installation of Home Assistant, OpenWRT, OVS, and Ryu.
   - Utilize configuration files and backups available in this repository for setup and configuration.

## Usage

1. **Accessing the Tool**:
   - Launch Home Assistant via the preferred way.
   - Add to the network visualization tool. 

2. **Interacting with the Visualization**:
   - Devices are symbolized as nodes on the graph.
   - Select a node to view its details, such as IP and MAC addresses.
   - Employ the editor for a personalized visualization experience.

3. **Network Traffic Management**:
   - View communication partners and isolate devices.

## Features

1. **Network Visualization**: Understand your network's layout with nodes representing each device. Monitor communication routes and interactions.

2. **Timely Updates**: Define your update frequency. Experience real-time network activity as the visualization auto-refreshes.

3. **Network Control**: Effortlessly isolate devices to ensure they communicate solely with the router.

4. **Customizability**: Modify various visual elements, such as node color and link thickness, for a personalized visualization.

---

For questions, feedback, or support, please refer to the GitHub issues or contact me directly.

