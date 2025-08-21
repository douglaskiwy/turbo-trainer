DEVICE_REGISTRY = {}


def register_device(cls) -> type:
    """
    Decorator to register a device class in the DEVICE_REGISTRY.
    """
    DEVICE_REGISTRY[cls.__name__] = cls
    return cls
