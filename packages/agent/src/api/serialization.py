import json
from datetime import date, datetime
from typing import Any, Dict, Type, TypeVar, get_type_hints
from uuid import UUID

T = TypeVar('T')


class JsonEncoder(json.JSONEncoder):
    """Custom JSON encoder for handling UUID and date objects."""

    def default(self, obj):
        if isinstance(obj, UUID):
            return str(obj)
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        return super().default(obj)


def serialize_to_json(obj: Any) -> str:
    """
    Serialize an object to a JSON string.

    Args:
        obj: The object to serialize

    Returns:
        A JSON string representation of the object
    """
    return json.dumps(obj, cls=JsonEncoder)


def deserialize_from_json(json_str: str, cls: Type[T]) -> T:
    """
    Deserialize a JSON string to an object of type cls.

    Args:
        json_str: The JSON string to deserialize
        cls: The target class type

    Returns:
        An instance of cls populated with data from the JSON string
    """
    data = json.loads(json_str)
    return _convert_dict_to_dataclass(data, cls)


def _convert_dict_to_dataclass(data: Dict, cls: Type[T]) -> T:
    """
    Convert a dictionary to a dataclass object.

    Args:
        data: The dictionary to convert
        cls: The target dataclass type

    Returns:
        An instance of cls populated with data from the dictionary
    """
    if data is None:
        return None

    field_types = get_type_hints(cls)
    kwargs = {}

    for field_name, field_type in field_types.items():
        if field_name not in data or data[field_name] is None:
            continue

        value = data[field_name]

        # Handle UUID fields
        if field_type == UUID and isinstance(value, str):
            kwargs[field_name] = UUID(value)

        # Handle date fields
        elif field_type == date and isinstance(value, str):
            kwargs[field_name] = date.fromisoformat(value)

        # Handle nested dataclass fields
        elif hasattr(field_type, '__annotations__') and isinstance(value, dict):
            kwargs[field_name] = _convert_dict_to_dataclass(value, field_type)

        # Handle lists of objects
        elif hasattr(field_type, '__origin__') and field_type.__origin__ == list:
            item_type = field_type.__args__[0]
            if hasattr(item_type, '__annotations__') and isinstance(value, list):
                kwargs[field_name] = [_convert_dict_to_dataclass(
                    item, item_type) for item in value]
            else:
                kwargs[field_name] = value
        else:
            kwargs[field_name] = value

    return cls(**kwargs)
