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

# OVS switch details
RYU_ADDRESS = secrets["ryu_address"]
RYU_PORT = secrets["ryu_port"]

# OVS switch details
SWITCH_ADDRESS = secrets["switch_address"]
SWITCH_PORT = secrets["switch_port"]


@app.route("/devices")
def get_devices():
    """Retrieves a list of all connected devices."""
    try:
        router = OpenWrtRpc(ROUTER_IP, ROUTER_USER, ROUTER_PASSWORD)
        result = router.get_all_connected_devices(only_reachable=False)

        device_list = [device._asdict() for device in result]
        return jsonify(device_list)
    except Exception as error:
        print(f"Failed to retrieve devices: {str(error)}")
        return jsonify({"error": str(error)}), 500


@app.route("/communications", methods=["GET"])
def get_communications():
    # Use the Ryu REST API to get the flow rules for the specific DPID
    RYU_DATAPATH = get_switch_dpid()

    if not RYU_DATAPATH:
        print("No DPID found.")
        return jsonify({"status": "error", "message": "No DPID found."}), 500

    try:
        response = requests.get(
            f"http://{RYU_ADDRESS}:{RYU_PORT}/stats/flow/{RYU_DATAPATH}"
        )
        response.raise_for_status()
        flows = response.json()

        flows_for_dpid = flows.get(
            str(RYU_DATAPATH), []
        )  # Make sure to use the string representation

        # Process the flow rules to extract the source and destination MAC addresses
        communication_list = []
        for flow in flows_for_dpid:
            match = flow.get("match")
            if match:
                src_mac = match.get("dl_src")
                dst_mac = match.get("dl_dst")
                if src_mac and dst_mac:
                    communication_list.append(
                        {
                            "source_mac": src_mac,
                            "destination_mac": dst_mac,
                        }
                    )

        return jsonify(communication_list), 200

    except requests.RequestException as e:
        print(f"Error during GET request: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/isolated_devices")
def get_isolated_devices():
    return None


@app.route("/isolate_mac/<mac_address>", methods=["POST"])
def isolate_mac(mac_address):
    # First GET request
    try:
        response = requests.get("http://{}:{SWITCH_PORT}/stats/s")
        response.raise_for_status()
        print(response.json())
    except requests.RequestException as e:
        print(f"Error during GET request: {e}")

    # Second POST request
    RYU_DATAPATH = get_switch_dpid()
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
            f"http://{RYU_ADDRESS}:{RYU_PORT}/stats/flowentry/add",
            json=post_payload,
        )
        response.raise_for_status()
        print(response.json())
        return (
            jsonify({"status": "success", "message": "MAC isolated successfully"}),
            200,
        )  # <-- Return a response here
    except requests.RequestException as e:
        print(f"Error during POST request: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/include_mac/<mac_address>", methods=["POST"])
def include_mac(mac_address):
    # Define the URL and the payload for the POST request
    url = f"http://{RYU_ADDRESS}:{RYU_PORT}/stats/flowentry/delete"

    RYU_DATAPATH = (
        get_switch_dpid()
    )  # Make sure this function returns 251096700645801 or appropriate DPID
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

    # Send the POST request
    try:
        response = requests.post(url, json=post_payload)
        response.raise_for_status()

        # Print and return the response
        print(response.json())
        return jsonify(response.json()), 200
    except requests.RequestException as e:
        print(f"Error during POST request: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


def get_switch_dpid():
    """Get the DPID of the switch."""
    try:
        url = f"http://{RYU_ADDRESS}:{RYU_PORT}/stats/switches"
        response = requests.get(url, timeout=5)

        if response.ok:
            switches = response.json()
            if switches:
                return switches[0]
            else:
                print("No switches found.")
                return 251096700645801  # As default
        else:
            print(f"Failed to retrieve switches. Status code: {response.status_code}")
            return None
    except Exception as error:
        print(f"Error while retrieving DPID: {str(error)}")
        return None


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
