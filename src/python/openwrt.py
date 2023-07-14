"""
This module implements a Flask API to retrieve information about connected devices
from an OpenWrt router using the OpenWrtLuCi RPC library.
"""

from flask import Flask, jsonify
from openwrt_luci_rpc import OpenWrtRpc

app = Flask(__name__)


@app.route("/devices")
def get_devices():
    """
    Retrieve information about connected devices from the OpenWrt router.

    Returns:
        flask.Response: JSON response containing information about connected devices.
    """
    # TODO: Remove credentials from script
    router = OpenWrtRpc("192.168.1.1", "root", "MySmartHome!")
    result = router.get_all_connected_devices(only_reachable=False)

    device_list = []
    for device in result:
        device_dict = device._asdict()
        device_list.append(device_dict)

    print(jsonify(device_list))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
