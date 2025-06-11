import base64
import json


def id_to_url(uid: str) -> str:
    # 补上等号（=）以恢复合法 Base64
    padding = "=" * (-len(uid) % 4)
    return base64.urlsafe_b64decode(uid + padding).decode()


def encode_cursor(created_at: str, id_: str) -> str:
    data = json.dumps({"created_at": created_at, "id": id_})
    return base64.urlsafe_b64encode(data.encode()).decode()


# 解码 cursor
def decode_cursor(cursor_str: str) -> dict:
    try:
        # Add padding if needed
        padding = "=" * (-len(cursor_str) % 4)
        padded_cursor = cursor_str + padding

        # Decode the cursor
        decoded_data = json.loads(
            base64.urlsafe_b64decode(padded_cursor.encode()).decode()
        )

        # Validate the structure
        if not isinstance(decoded_data, dict):
            return {}

        if "created_at" not in decoded_data or "id" not in decoded_data:
            return {}

        return decoded_data
    except Exception as e:
        import logging

        logging.error(f"Error decoding cursor {cursor_str}: {e}")
        return {}
