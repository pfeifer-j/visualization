@app.route("/isolate/<ip_address>", methods=["POST"])
def isolate(ip_address):
    """Isolates a device with a given IP address."""
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

    return jsonify({"message": f"Isolated {ip_address}."})


@app.route("/include/<ip_address>", methods=["POST"])
def include_ip(ip_address):
    """
    Includes a device with a given IP address.
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

    return jsonify({"message": f"Included {ip_address}."})
