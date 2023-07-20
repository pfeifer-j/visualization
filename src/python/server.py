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
ROUTER_PASSWD = "MySmartHome!"
RYU_DATAPATH = "placeholder"
RYU_PORT = 8080


@app.route("/devices")
def get_devices():
    try:
        router = OpenWrtRpc(ROUTER_IP, ROUTER_USER, ROUTER_PASSWD)
        result = router.get_all_connected_devices(only_reachable=False)

        device_list = []
        for device in result:
            device_dict = device._asdict()
            device_list.append(device_dict)

        return jsonify(device_list)
    except Exception as e:
        error_message = f"Failed to retrieve devices: {str(e)}"
        print(error_message)
        return jsonify({"error": error_message}), 500


@app.route("/communications")
def get_communications():
    try:
        url = f"http://{ROUTER_IP}:{RYU_PORT}/stats/flow/" + RYU_DATAPATH
        response = requests.get(
            url, timeout=5
        )  # Adding a timeout argument to prevent hanging indefinitely

        if response.status_code == 200:
            flow_table = json.loads(response.text)
            return jsonify(flow_table)
        else:
            error_message = (
                f"Failed to retrieve flow table. Status code: {response.status_code}"
            )
            print(error_message)
            return jsonify({"error": error_message}), 500
    except Exception as e:
        error_message = f"Error while retrieving communications: {str(e)}"
        print(error_message)
        return jsonify({"error": error_message}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
