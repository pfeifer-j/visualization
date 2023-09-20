/**
 * network.ts - Client-side API for managing network devices.
 *
 * Purpose:
 * This module provides functions to retrieve, manage, and visualize devices in a network.
 *
 * Author: Jan Pfeifer
 *
 * Notes:
 * - This file focuses on achieving core functionality.
 * - Critical security measures like authentication are currently omitted and must be addressed in future iterations.
 * - Dependencies: Assumes the python server is running responding to specified routes.
 */

// Imports for the demonstrative network
import deviceDataSmall from './demo/devices-small.json';
import deviceDataMedium from './demo/devices-mid.json';
import deviceDataLarge from './demo/devices-large.json';
import sdnData from './demo/devices-sdn.json';
import communicationData from "./demo/communications.json";


// Contains the api url entry point.
// Change to homeassistant.local in smart home environment or localhost in docker environment.
const homeAssistant = "http://localhost:5000";

// Retrieve devices from the OpenWRT router
export function getDevices(openWrtIP) {
    let processedDeviceList = [];

    return fetch(homeAssistant + '/devices')
        .then(response => response.json())

        // Push the source node and add other devices to the list
        .then(deviceList => {
            // todo
            let sourceNode = {
                hostname: "OpenWrt",
                ip: openWrtIP,
                mac: "--:--:--:--:--:--",
                reachable: "true",
                host: "192.168.1.1"
            };
            processedDeviceList.push(sourceNode)
            for (let device of deviceList) {
                let deviceEntry = {
                    hostname: device.hostname,
                    ip: device.ip,
                    mac: device.mac,
                    reachable: device.reachable,
                    host: device.host
                };
                processedDeviceList.push(deviceEntry);
            }
            return processedDeviceList;
        })
        .catch(error => {
            console.error('Error:', error);
            return processedDeviceList;
        });
}


// Retrieve mac-based communications from Open vSwitch
export function getCommunications() {
    let communicationList = [];

    return fetch(homeAssistant + '/communications')
        .then(response => response.json())
        .then(communicationData => {
            // Process the communicationData as needed
            for (let communication of communicationData) {
                let communicationEntry = {
                    sourceMac: communication.source_mac,
                    destinationMac: communication.destination_mac
                };
                communicationList.push(communicationEntry);
            }
            return communicationList;
        })
        .catch(error => {
            // Handle any errors that occur during the request
            console.error('Error:', error);
            return communicationList;
        });
}

// Retrieve isolated devices from the Open vSwitch
export function getIsolatedDevices() {
    return [];
    /*return fetch(homeAssistant + '/isolated_devices')
        .then(response => response.json())
        .then(deviceList => {
            let isolatedDeviceList = deviceList.map(device => device.ip);
            return isolatedDeviceList;
        })
        .catch(error => {
            // Handle any errors that occur during the request
            console.error('Error:', error);
            return [];
        });*/
}

// Isolate the device with the given MAC address
export function isolateDeviceByMac(selectedMac) {
    return fetch(homeAssistant + '/isolate_mac/' + selectedMac, {
        method: 'POST'
    })
        .then(response => response.json())
        .catch(error => {
            // Handle any errors that occur during the request
            console.error('Error:', error);
        });
}

// Include the device with the given MAC address
export function includeDeviceByMac(selectedMac) {
    console.log(selectedMac + " is no longer isolated.");

    return fetch(homeAssistant + '/include_mac/' + selectedMac, {
        method: 'POST'
    })
        .then(response => response.json())
        .catch(error => {
            // Handle any errors that occur during the request
            console.error('Error:', error);
        });
}

/*
    The following methods are used for the demo network and testing.
*/

// Return the devices from small demo network with 20 devices
export function getSmallNetwork() {
    let deviceList = [];

    for (let device of deviceDataSmall) {
        let deviceEntry = {
            hostname: device.hostname,
            ip: device.ip,
            mac: device.mac,
            reachable: device.reachable,
            host: device.host
        };
        deviceList.push(deviceEntry);
    }
    return deviceList;
}

// Return the devices from medium sized demo network with 100 devices
export function getMediumNetwork() {
    let deviceList = [];

    for (let device of deviceDataMedium) {
        let deviceEntry = {
            hostname: device.hostname,
            ip: device.ip,
            mac: device.mac,
            reachable: device.reachable,
            host: device.host
        };
        deviceList.push(deviceEntry);
    }
    return deviceList;
}

// Return the devices from large demo network 250 with devices
export function getLargeNetwork() {
    let deviceList = [];

    for (let device of deviceDataLarge) {
        let deviceEntry = {
            hostname: device.hostname,
            ip: device.ip,
            mac: device.mac,
            reachable: device.reachable,
            host: device.host
        };
        deviceList.push(deviceEntry);
    }
    return deviceList;
}

// Return the devices for the small demo network using the sdn structure
export function getDemoSdn() {
    let deviceList = [];

    for (let device of sdnData) {
        let deviceEntry = {
            hostname: device.hostname,
            ip: device.ip,
            mac: device.mac,
            reachable: device.reachable,
            host: device.host
        };
        deviceList.push(deviceEntry);
    }
    return deviceList;
}

// Return the communication flow for the small demo network
export function getDemoCommunications() {
    let communicationList = [];

    for (let communication of communicationData.flow_table) {
        let communicationEntry = {
            src: communication.match.ipv4_src,
            dst: communication.match.ipv4_dst,
        };
        communicationList.push(communicationEntry);
    }
    return communicationList;
}