"""
This script is used to communicate with the LUCI API and the OVS both located on the OpenWRT.
"""

from flask import Flask, jsonify
from flask_cors import CORS
from openwrt_luci_rpc import OpenWrtRpc
import requests
import json
import yaml

app = Flask(__name__)
CORS(app)

# Load the secrets.yaml file
with open("../../../../config/secrets.yaml", "r") as file:
    secrets = yaml.safe_load(file)

# Use the secrets in your Python code
ROUTER_IP = secrets["router_ip"]
ROUTER_USER = secrets["router_user"]
ROUTER_PASSWORD = secrets["router_password"]
RYU_DATAPATH = secrets.get("ryu_datapath") or get_switch_dpid()

RYU_PORT = secrets["ryu_port"]

# MQTT broker details
BROKER_ADDRESS = secrets["broker_address"]
BROKER_PORT = secrets["broker_port"]
TOPIC = secrets["topic"]

# OVS switch details
SWITCH_ADDRESS = secrets["switch_address"]
SWITCH_PORT = secrets["switch_port"]

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


def get_switch_dpid():
    """Get the DPID of the switch."""
    try:
        url = f"http://{ROUTER_IP}:{RYU_PORT}/stats/switches"
        response = requests.get(url, timeout=5)

        if response.ok:
            switches = response.json()
            if switches:
                return switches[0]
            else:
                print("No switches found.")
                return None
        else:
            print(f"Failed to retrieve switches. Status code: {response.status_code}")
            return None
    except Exception as error:
        print(f"Error while retrieving DPID: {str(error)}")
        return None


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


@app.route("/communications")
def get_communications():
    """Retrieves a list of all communications."""
    try:
        if not RYU_DATAPATH:
            return jsonify({"error": "Could not retrieve switch DPID"}), 500

        url = f"http://{ROUTER_IP}:{RYU_PORT}/stats/flow/{RYU_DATAPATH}"
        response = requests.get(url, timeout=5)

        if response.ok:
            raw_flow_table = response.json().get(str(RYU_DATAPATH), [])

            # Convert the raw data to desired format
            formatted_flow_table = []

            for flow in raw_flow_table:
                match_data = flow.get("match", {})
                src_ip = match_data.get("ipv4_src")
                dst_ip = match_data.get("ipv4_dst")

                # If both source and destination IP are available, process the data
                if src_ip and dst_ip:
                    formatted_flow = {
                        "match": {"ipv4_src": src_ip, "ipv4_dst": dst_ip},
                        # Assuming all actions result in 'allow_packet' for now
                        # You might want to add specific checks based on your actual OVS rules to set appropriate actions
                        "actions": ["allow_packet"],
                    }

                    formatted_flow_table.append(formatted_flow)

            return jsonify({"flow_table": formatted_flow_table})
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


@app.route("/isolate_mac/<mac_address>", methods=["POST"])
def isolate_mac(mac_address):
    # First GET request
    try:
        response = requests.get("http://{SWITCH_ADDRESS}:{SWITCH_PORT}/stats/s")
        response.raise_for_status()
        print(
            response.json()
        )  # Print the response for the GET request (or process it however you want)
    except requests.RequestException as e:
        print(f"Error during GET request: {e}")

    # Second POST request
    post_payload = {
        "dpid": RYU_DATAPATH,
        "cookie": 1,
        "cookie_mask": 1,
        "table_id": 0,
        "idle_timeout": 0,
        "hard_timeout": 0,
        "priority": 1000,
        "flags": 1,
        "match": {"dl_src": mac_address},
        "actions": [],
    }

    try:
        response = requests.post(
            "http://192.168.1.10:8080/stats/flowentry/add", json=post_payload
        )
        response.raise_for_status()
        print(
            response.json()
        )  # Print the response for the POST request (or process it however you want)
    except requests.RequestException as e:
        print(f"Error during POST request: {e}")


@app.route("/include_mac/<mac_address>", methods=["POST"])
def include_mac(mac_address):
    # First GET request
    try:
        response = requests.get(f"http://{SWITCH_ADDRESS}:{SWITCH_PORT}/stats/s")
        response.raise_for_status()
        print(response.json())  # Print the response for the GET request
    except requests.RequestException as e:
        print(f"Error during GET request: {e}")

    # Second POST request for deleting the flow entry
    post_payload = {
        "dpid": RYU_DATAPATH,
        "cookie": 1,
        "cookie_mask": 1,
        "table_id": 0,
        "idle_timeout": 0,
        "hard_timeout": 0,
        "priority": 1000,
        "flags": 1,
        "match": {"dl_src": mac_address},
    }

    try:
        response = requests.post(
            "http://192.168.1.10:8080/stats/flowentry/delete", json=post_payload
        )  # This is where the endpoint has been corrected.
        response.raise_for_status()
        print(response.json())  # Print the response for the POST request
        return jsonify(response.json()), 200
    except requests.RequestException as e:
        print(f"Error during POST request: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
