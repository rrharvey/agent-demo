class ApiException(Exception):
    """Base exception for API client errors."""
    pass


class ApiConnectionError(ApiException):
    """Exception raised for errors in the API connection."""
    pass


class BadRequestError(ApiException):
    """Exception raised for 400 Bad Request responses."""
    pass


class NotFoundError(ApiException):
    """Exception raised for 404 Not Found responses."""
    pass


class ApiResponseError(ApiException):
    """Exception raised for unexpected API responses."""

    def __init__(self, status_code, response_text, *args, **kwargs):
        self.status_code = status_code
        self.response_text = response_text
        message = f"API responded with status code {status_code}: {response_text}"
        super().__init__(message, *args, **kwargs)
