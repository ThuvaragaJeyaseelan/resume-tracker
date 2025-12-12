"""
Request ID Middleware for tracking requests.
"""

import uuid


class RequestIDMiddleware:
    """
    Middleware that attaches a unique request ID to each request.
    This ID is used in responses for debugging and tracking.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Generate a unique request ID
        request.request_id = str(uuid.uuid4())
        
        # Process the request
        response = self.get_response(request)
        
        # Add request ID to response headers
        response['X-Request-ID'] = request.request_id
        
        return response

