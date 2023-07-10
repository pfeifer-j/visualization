"""
This script connects to an MQTT broker, subscribes to a topic, and handles messages to isolate or include devices
based on their MAC addresses. It interacts with an OVS switch using REST API calls to add or remove flow entries.
"""

import paho.mqtt.client as mqtt
from ryu.base.app_manager import RyuApp
from ryu.controller import ofp_event
from ryu.controller.handler import (
    HANDSHAKE_DISPATCHER,
    CONFIG_DISPATCHER,
    MAIN_DISPATCHER,
    set_ev_cls,
)
from ryu.ofproto import ofproto_v1_3
from ryu.lib.packet import packet
from ryu.lib.packet.ethernet import ethernet
from ryu.lib.packet.ipv6 import ipv6
from ryu.lib.packet.lldp import lldp
from ryu.lib.dpid import dpid_to_str
import requests
import json

# MQTT broker details
BROKER_ADDRESS = "192.168.1.10"
BROKER_PORT = 1883
TOPIC = "isolator"

# OVS switch details
SWITCH_ADDRESS = "192.168.1.1"
SWITCH_PORT = "8080"

# Extension for JSON support
BLOCKED_MACS = []


def isolate_mac(mac):
    """
    Isolates a device with a given MAC address.
    """
    flow = {
        "dpid": "br0",
        "cookie": 0,
        "table_id": 0,
        "priority": 100,
        "match": {"dl_src": mac},
        "actions": [{"type": "OUTPUT", "port": "CONTROLLER"}],
    }
    url = f"http://{SWITCH_ADDRESS}:{SWITCH_PORT}/stats/flowentry/add"
    headers = {"Content-type": "application/json"}
    r = requests.post(url, data=json.dumps(flow), headers=headers)
    if r.status_code == 200:
        if mac not in BLOCKED_MACS:
            BLOCKED_MACS.append(mac)
            print(f"Added {mac} to the blacklist")
        else:
            print(f"{mac} is already on the blacklist")
    else:
        print(f"Failed to isolate {mac}")


def include_mac(mac):
    """
    Includes a device with a given MAC address.
    """
    flow = {
        "dpid": "br0",
        "cookie": 0,
        "table_id": 0,
        "priority": 100,
        "match": {"dl_src": mac},
        "actions": [{"type": "OUTPUT", "port": "NORMAL"}],
    }
    url = f"http://{SWITCH_ADDRESS}:{SWITCH_PORT}/stats/flowentry/delete_strict"
    headers = {"Content-type": "application/json"}
    r = requests.post(url, data=json.dumps(flow), headers=headers)
    if r.status_code == 200:
        if mac in BLOCKED_MACS:
            BLOCKED_MACS.remove(mac)
            print(f"Removed {mac} from the blacklist")
        else:
            print(f"{mac} was not blacklisted")
    else:
        print(f"Failed to include {mac}")


def on_message(client, userdata, message):
    """
    MQTT callback function.
    """
    payload = message.payload.decode("utf-8")
    instruction = payload.strip().split(", ")

    # Catch invalid payloads
    if len(instruction) != 2:
        print(f"Invalid payload received: {payload}")
        return

    action, mac = instruction

    # Isolate devices with given MAC
    if action == "isolate":
        mac = mac.strip('"')  # remove quotation marks
        if mac not in BLOCKED_MACS:
            BLOCKED_MACS.append(mac)
            isolate_mac(mac)
            print(f"Added {mac} to the blacklist")
        else:
            print(f"{mac} is already on the blacklist")

    # Or remove newly included devices from the blacklist
    elif action == "include":
        mac = mac.strip('"')  # remove quotation marks
        if mac in BLOCKED_MACS:
            BLOCKED_MACS.remove(mac)
            include_mac(mac)
            print(f"Removed {mac} from the blacklist")
        else:
            print(f"{mac} was not blacklisted")


# Create MQTT client and connect to the broker
client = mqtt.Client()
client.connect(BROKER_ADDRESS, BROKER_PORT)

# Subscribe to MQTT topic
client.subscribe(TOPIC)

# Set MQTT callback function
client.on_message = on_message

# Start MQTT loop to receive messages
client.loop_forever()
