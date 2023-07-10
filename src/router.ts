import deviceData from './example/devices.json';

// Communicate with the OpenWRT - Router unsing the defaults.
export function getDevicesDynamic() {

    const fetch = require('node-fetch');

    // TODO: Remove credentials
    const routerIP = '192.168.1.1';
    const username = 'root';
    const password = 'admin';

    // Function to make authenticated requests to the LuCI RPC API
    async function makeRpcRequest(method, params = {}) {
        const url = `http://${routerIP}/cgi-bin/luci/rpc`;

        const authHeader = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

        const body = JSON.stringify({
            id: 1,
            method: method,
            params: [params],
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: body,
        });

        const result = await response.json();
        return result;
    }

    // TODO: Implement JSON generation
    makeRpcRequest('system', 'board').then(response => {
        console.log(response.result);
    }).catch(error => {
        console.error('Error:', error);
    });
}

// Retrieve devices from router
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