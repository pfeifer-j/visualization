"""
This script is used to communicate with the LUCI API and the OVS both located on the OpenWRT.
"""

from flask import Flask, jsonify
from flask_cors import CORS
from openwrt_luci_rpc import OpenWrtRpc
import requests
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

ROUTER_IP = "192.168.1.1"
ROUTER_USER = "root"
ROUTER_PASSWORD = "MySmartHome!"
RYU_DATAPATH = "placeholder"
RYU_PORT = 8080

# MQTT broker details
BROKER_ADDRESS = "192.168.1.10"
BROKER_PORT = 1883
TOPIC = "isolator"

# OVS switch details
SWITCH_ADDRESS = "192.168.1.1"
SWITCH_PORT = "8080"

# Extension for JSON support
BLOCKED_IPS = []
BLOCKED_IP_JSON = "src/data/isolated_devices.json"


def save_ips_to_file(ip_list, filename):
    """Retrieves a list of all connected devices."""
    with open(filename, "w") as file:
        json.dump(ip_list, file)


def load_ips_from_file(filename):
    """Retrieves a list of all connected devices."""
    try:
        with open(filename, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        return []


@app.route("/devices")
def get_devices():
    """Retrieves a list of all connected devices."""
    try:
        router = OpenWrtRpc(ROUTER_IP, ROUTER_USER, ROUTER_PASSWORD)
        result = router.get_all_connected_devices(only_reachable=False)
        print(dir(router))

        device_list = [device._asdict() for device in result]
        return jsonify(device_list)
    except Exception as error:
        print(f"Failed to retrieve devices: {str(error)}")
        return jsonify({"error": str(error)}), 500


@app.route("/devices-sdn")
def get_devices():
    """Retrieves a list of all connected devices."""
    try:
        router = OpenWrtRpc(ROUTER_IP, ROUTER_USER, ROUTER_PASSWORD)
        result = router.get_all_connected_devices(only_reachable=False)
        print(dir(router))

        device_list = [device._asdict() for device in result]
        return jsonify(device_list)
    except Exception as error:
        print(f"Failed to retrieve devices: {str(error)}")
        return jsonify({"error": str(error)}), 500


@app.route("/communications")
def get_communications():
    """Retrieves a list of all communications."""
    try:
        url = f"http://{ROUTER_IP}:{RYU_PORT}/stats/flow/" + RYU_DATAPATH
        response = requests.get(url, timeout=5)

        if response.ok:
            flow_table = response.json()
            return jsonify(flow_table)
        else:
            print(f"Failed to retrieve flow table. Status code: {response.status_code}")
            return (
                jsonify(
                    {
                        "error": f"Failed to retrieve flow table. Status code: {response.status_code}"
                    }
                ),
                500,
            )
    except Exception as error:
        print(f"Error while retrieving communications: {str(error)}")
        return jsonify({"error": str(error)}), 500


@app.route("/isolated_devices")
def get_isolated_devices():
    """Return the content of isolated_devices.json."""
    try:
        ips = load_ips_from_file(BLOCKED_IP_JSON)
        return jsonify(ips)
    except Exception as error:
        print(f"Failed to retrieve devices: {str(error)}")
        return jsonify({"error": str(error)}), 500


@app.route("/isolate/<ip_address>", methods=["POST"])
def isolate(ip_address):
    """Adds a device with a given IP address to the json file"""
    flow = {
        "dpid": "br0",
        "cookie": 0,
        "table_id": 0,
        "priority": 100,
        "match": {"nw_src": ip_address},
        "actions": [{"type": "OUTPUT", "port": "CONTROLLER"}],
    }
    url = f"http://{SWITCH_ADDRESS}:{SWITCH_PORT}/stats/flowentry/add"
    headers = {"Content-type": "application/json"}

    try:
        response = requests.post(url, data=json.dumps(flow), headers=headers)
        response.raise_for_status()
    except requests.exceptions.HTTPError as http_error:
        print(f"HTTP Error occurred while trying to isolate {ip_address}: {http_error}")
    except Exception as error:
        print(f"Other error occurred while trying to isolate {ip_address}: {error}")
    else:
        if ip_address not in BLOCKED_IPS:
            BLOCKED_IPS.append(ip_address)
            print(f"Added {ip_address} to the blacklist")
        else:
            print(f"{ip_address} is already on the blacklist")

    ips = load_ips_from_file(BLOCKED_IP_JSON)
    ip_dict = {"ip": ip_address}
    if ip_dict not in ips:
        ips.append(ip_dict)
        save_ips_to_file(ips, BLOCKED_IP_JSON)
    return jsonify({"status": "success"}), 200


@app.route("/include/<ip_address>", methods=["POST"])
def include_ip(ip_address):
    """
    Removes a device with a given IP address from the json file.
    """
    flow = {
        "dpid": "br0",
        "cookie": 0,
        "table_id": 0,
        "priority": 100,
        "match": {"nw_src": ip_address},
        "actions": [{"type": "OUTPUT", "port": "NORMAL"}],
    }
    url = f"http://{SWITCH_ADDRESS}:{SWITCH_PORT}/stats/flowentry/delete_strict"
    headers = {"Content-type": "application/json"}

    try:
        response = requests.post(url, data=json.dumps(flow), headers=headers)
        response.raise_for_status()
    except requests.exceptions.HTTPError as http_error:
        print(f"HTTP Error occurred while trying to include {ip_address}: {http_error}")
    except Exception as error:
        print(f"Other error occurred while trying to include {ip_address}: {error}")
    else:
        if ip_address in BLOCKED_IPS:
            BLOCKED_IPS.remove(ip_address)
            print(f"Removed {ip_address} from the blacklist")
        else:
            print(f"{ip_address} was not blacklisted")

    ips = load_ips_from_file(BLOCKED_IP_JSON)
    ip_dict = {"ip": ip_address}
    if ip_dict in ips:
        ips.remove(ip_dict)
        save_ips_to_file(ips, BLOCKED_IP_JSON)
    return jsonify({"status": "success"}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
