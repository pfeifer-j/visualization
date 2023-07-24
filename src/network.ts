import deviceData from './example/devices.json';
import communicationData from "./example/communications.json";


// Return the devices from the example-json
export function getDevicesStatic() {
    let deviceList = [];

    for (let device of deviceData) {
        let deviceEntry = [
            device.hostname,
            device.ip,
            device.mac,
            device.reachable,
            device.host
        ];
        deviceList.push(deviceEntry);
    }
    return deviceList;
}

// Return the communicationss from the example-json
export function getCommunicationsStatic() {
    let communicationList = [];

    for (let communication of communicationData.flow_table) {
        let communicationEntry = [
            communication.match.ipv4_src,
            communication.match.ipv4_dst,
        ];
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
            // Process the deviceList as needed

            let sourceNode = ["OpenWrt", "192.168.1.1", "12:34:45:67:89", "true", "192.168.1.1"];
            processedDeviceList.push(sourceNode)

            for (let device of deviceList) {
                let deviceEntry = [
                    device.hostname,
                    device.ip,
                    device.mac,
                    device.reachable,
                    device.host
                ];
                processedDeviceList.push(deviceEntry);
            }
            return processedDeviceList;
        })
        .catch(error => {
            // Handle any errors that occur during the request
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

// Sends a api-request to isolate the device with the given ip from the network.
export function isolateDevice(selectedIP) {
    console.log(selectedIP + " is now isolated from the network.")
}

// Sends a api-request to remove the isolation of the device with the given ip.
export function includeDevice(selectedIP) {
    console.log(selectedIP + " is no longer isolated.")
}

