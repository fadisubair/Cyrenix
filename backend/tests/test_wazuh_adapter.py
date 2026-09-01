import pytest
from datetime import datetime
from app.services.ingestion.wazuh_adapter import WazuhNormalizer

def test_wazuh_normalizer_authentication_failed():
    normalizer = WazuhNormalizer()
    raw_event = {
        "rule": {"id": "5760", "description": "sshd: authentication failed."},
        "agent": {"name": "ubuntu"},
        "data": {"srcuser": "labuser", "srcip": "192.168.122.13"},
        "full_log": "sshd: authentication failed."
    }

    normalized = normalizer.normalize(raw_event)
    assert normalized.event_type == "FAILED_LOGIN"
    assert normalized.username == "labuser"
    assert normalized.source_ip == "192.168.122.13"
    assert normalized.hostname == "ubuntu"
    assert normalized.source == "Wazuh - 5760"

def test_wazuh_normalizer_pam_failed():
    normalizer = WazuhNormalizer()
    raw_event = {
        "rule": {"description": "PAM: User login failed."},
        "full_log": "PAM: User login failed."
    }

    normalized = normalizer.normalize(raw_event)
    assert normalized.event_type == "FAILED_LOGIN"

def test_wazuh_normalizer_ssh_failed_password():
    normalizer = WazuhNormalizer()
    raw_event = {
        "rule": {"description": "sshd: Insecure connection attempt"},
        "full_log": "Failed password for labuser from 192.168.122.13 port 22 ssh2"
    }

    normalized = normalizer.normalize(raw_event)
    assert normalized.event_type == "FAILED_LOGIN"

def test_wazuh_normalizer_ssh_accepted_password():
    normalizer = WazuhNormalizer()
    raw_event = {
        "rule": {"description": "sshd: Secure connection"},
        "full_log": "Accepted password for labuser from 192.168.122.13 port 22 ssh2"
    }

    normalized = normalizer.normalize(raw_event)
    assert normalized.event_type == "SUCCESSFUL_LOGIN"

def test_wazuh_normalizer_generic_alert():
    normalizer = WazuhNormalizer()
    raw_event = {
        "rule": {"description": "Audit: command executed."},
        "full_log": "User root ran command ls"
    }

    normalized = normalizer.normalize(raw_event)
    assert normalized.event_type == "WAZUH_ALERT"
