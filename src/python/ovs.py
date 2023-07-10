"""
This module retrieves the flow table from an Open vSwitch (OVS) using the Ryu controller.
"""

import requests
import json


def get_flow_table(ip_address, port):
    """
    Retrieves the flow table from the OVS using Ryu controller.

    Args:
        ip_address (str): The IP address of the Ryu controller.
        port (int): The port number of the Ryu controller.

    Returns:
        dict: The flow table retrieved from the OVS, or None if retrieval fails.
    """
    datapath = "placeholder"
    url = f"http://{ip_address}:{port}/stats/flow/" + datapath
    response = requests.get(
        url, timeout=5
    )  # Adding a timeout argument to prevent hanging indefinitely

    if response.status_code == 200:
        flow_table = json.loads(response.text)
        return flow_table
    else:
        print(f"Failed to retrieve flow table. Status code: {response.status_code}")
        return None


def print_flow_table(flow_table):
    """
    Returns the flow table as JSON.

    Args:
        flow_table (dict): The flow table to be converted to JSON.

    Returns:
        str: The flow table as a JSON string.
    """
    if flow_table:
        return json.dumps(
            flow_table, indent=4
        )  # Convert flow_table to JSON string with indentation
    else:
        return None


RYU_IP_ADDRESS = "localhost"
RYU_PORT = 8080

flow_table = get_flow_table(RYU_IP_ADDRESS, RYU_PORT)
print(print_flow_table(flow_table))
