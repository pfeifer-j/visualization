# Exploring Visualization Techniques for Wi-Fi Networks in Smart Homes

The increasing adoption of smart home devices, driven by the Internet of Things (IoT), has revolutionized home technology. This project introduces a straightforward Wi-Fi network visualization approach integrated within the Home Assistant platform, presenting both hardware-based and software-defined network structures of a smart home in a user-friendly format.

**Abstract**:  
The increasing adoption of smart home devices, fueled by the Internet of Things (IoT), has transformed home technology. While this offers benefits such as improved convenience, it also reveals complexities, especially in the field of network visualization. Current visualization tools are often either too intricate or too expensive for most users, highlighting the need for simpler, user-focused solutions. This research introduces a straightforward Wi-Fi network visualization approach for smart homes. Within the Home Assistant platform, the system showcases a force-directed graph that represents both the hardware-based and software- defined network structures of the smart home. Accompanying this visualization is a table detailing key device attributes, such as name, MAC, and IP address. Updated at user- defined intervals, this visualization provides real-time insights, with an emphasis on user customization and ease of use. Implementing this visualization within a Software-Defined Network (SDN) allows not just for visualizing the network flow but also limited network control, letting users manage their devices through interactive visuals. An evaluation reviewed the visualization tool considering user-friendliness, efficiency, and adaptability. This tool offers the possibility to easily identify critical security indicators, such as hidden devices or potential security breaches, enabling users to fortify their smart home defenses. Emphasizing user-friendliness and customizability, it appeals to a broad user base. In essence, this research presents a transformative approach to SDN visualization and control in smart homes.

**Project Context**:
This visualization tool was developed during a bachelor's thesis in computer science. For an in-depth understanding, details, and methodology, please refer to the thesis located as a PDF in this repository.

## Installation - Quick Guide

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

