"""
server.py - API Server to communicate with LUCI API and the OVS, both hosted on the OpenWRT router.

This script allows for interactions such as:
- Retrieving all connected devices
- Fetching communication details
- Checking isolated devices
- Isolating and including specific MAC addresses

Author: Jan Pfeifer
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
    """
    Retrieve a list of all devices currently connected to the router.
    This is a code segment provided by the LuCi.rpc.
    """
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
    """
    Fetch communication details between connected devices.
    """
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
    """
    Return all isolated devices.
    """
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

        # Process the flow rules to extract the source MAC addresses of isolated devices
        isolated_mac_addresses = []
        for flow in flows_for_dpid:
            actions = flow.get("actions", [])
            match = flow.get("match", {})

            # If the actions list is empty and dl_src is present, consider it as an isolated device
            if not actions and "dl_src" in match:
                isolated_mac_addresses.append(match["dl_src"])

        print(jsonify(isolated_mac_addresses))
        return jsonify(isolated_mac_addresses), 200

    except requests.RequestException as e:
        print(f"Error during GET request: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/isolate_mac/<mac_address>", methods=["POST"])
def isolate_mac(mac_address):
    """
    Isolate a device by specifying its MAC address.

    The function achieves isolation by adding a flow rule to OVS with no actions effectively dropping packets.
    """

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

        # Check if the response content is valid JSON or not
        if response.text:  # if there is some response text
            try:
                json_content = response.json()
                print(json_content)
            except json.JSONDecodeError:
                print("Received non-JSON response:", response.text)
        else:
            print("Received empty response from server")

        return (
            jsonify({"status": "success", "message": "MAC isolated successfully"}),
            200,
        )  # <-- Return a response here
    except requests.RequestException as e:
        print(f"Error during POST request: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/include_mac/<mac_address>", methods=["POST"])
def include_mac(mac_address):
    """
    Remove isolation from a device.

    This function deletes the flow rule associated with the specified MAC address, enabling its communications again.
    """

    url = f"http://{RYU_ADDRESS}:{RYU_PORT}/stats/flowentry/delete"

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
    }

    # Send the POST request
    try:
        response = requests.post(url, json=post_payload)
        response.raise_for_status()

        # Check if the response content is valid JSON or not
        if response.text:  # if there's some response content
            try:
                json_content = response.json()
                print(json_content)
                return jsonify(json_content), 200
            except json.JSONDecodeError:
                print("Received non-JSON response:", response.text)
                return (
                    jsonify(
                        {
                            "status": "error",
                            "message": "Received non-JSON response from server",
                        }
                    ),
                    500,
                )
        else:
            print("Received empty response from server")
            return (
                jsonify({"status": "success", "message": "MAC included successfully"}),
                200,
            )

    except requests.RequestException as e:
        print(f"Error during POST request: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


def get_switch_dpid():
    """
    Retrieve the Data Path Identifier from the Ryu controller.
    """
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
