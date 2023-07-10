import communicationData from "./example/communications.json";

// Communicating witch the OpenVSwitch using the defaults.
export function getCommunicationDynamic() {

    // TODO: Implement retrieving ip from Home Assistant configuration
    const controllerIp = '192.168.1.1';
    const controllerPort = 8080;

    const url = `http://${controllerIp}:${controllerPort}/stats/flow`;

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
        })
        .then(flowTable => {
            // Process the flow table data as needed
            console.log(flowTable);
        })
        .catch(error => {
            console.error(error);
        });
}

// Retrieve devices from router
export function getCommunicationStatic() {
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