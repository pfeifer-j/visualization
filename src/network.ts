import deviceData from './data/devices.json';
import sdnData from './data/devices_sdn.json';
import communicationData from "./data/communications.json";
import isolatedData from "./data/isolated_devices.json";

// Return the devices from the example-json
export function getDevicesStatic() {
    let deviceList = [];

    for (let device of deviceData) {
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

// Return the devices from the example-json
export function getDevicesSDN() {
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

// Return the communications from the example-json
export function getCommunicationsStatic() {
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

// Retrieve devices from the router
export function getDevices() {
    let processedDeviceList = [];
    return fetch('http://localhost:5000/devices')
        .then(response => response.json())
        .then(deviceList => {
            let sourceNode = {
                hostname: "OpenWrt",
                ip: "192.168.1.1",
                mac: "12:34:45:67:89",
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


// Retrieve communications from OVS
export function getCommunications() {
    let communicationList = [];

    return fetch('http://localhost:5000/communications')
        .then(response => response.json())
        .then(communicationData => {
            // Process the communicationData as needed
            for (let communication of communicationData) {
                let communicationEntry = [
                    communication.match.ipv4_src,
                    communication.match.ipv4_dst
                ];
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

// Retrieve isolated devices from the router
export function getIsolatedDevices() {
    return fetch('http://localhost:5000/isolated_devices')
        .then(response => response.json())
        .then(deviceList => {
            let isolatedDeviceList = deviceList.map(device => device.ip);
            return isolatedDeviceList;
        })
        .catch(error => {
            // Handle any errors that occur during the request
            console.error('Error:', error);
            return [];
        });
}


// Sends a api-request to isolate the device with the given ip from the network.
export function isolateDevice(selectedIP) {
    console.log(selectedIP + " is now isolated from the network.")

    return fetch('http://localhost:5000/isolate/' + selectedIP, {
        method: 'POST'
    })
        .then(response => response.json())
        .catch(error => {
            // Handle any errors that occur during the request
            console.error('Error:', error);
        });
}


// Sends a api-request to remove the isolation of the device with the given ip.
export function includeDevice(selectedIP) {
    console.log(selectedIP + " is no longer isolated.")

    return fetch('http://localhost:5000/include/' + selectedIP, {
        method: 'POST'
    })
        .then(response => response.json())
        .catch(error => {
            // Handle any errors that occur during the request
            console.error('Error:', error);
        });
}