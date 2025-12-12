"""
URL configuration for authentication endpoints.
"""

from django.urls import path
from .views import SignupView, LoginView, ProfileView, RefreshTokenView

urlpatterns = [
    path('signup', SignupView.as_view(), name='auth-signup'),
    path('login', LoginView.as_view(), name='auth-login'),
    path('profile', ProfileView.as_view(), name='auth-profile'),
    path('refresh', RefreshTokenView.as_view(), name='auth-refresh'),
]

