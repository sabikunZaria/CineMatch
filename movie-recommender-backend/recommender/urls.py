from django.urls import path
from . import views

urlpatterns = [
    path('recommend/', views.recommend, name='recommend'),
    path('group-recommend/', views.group_recommend, name='group-recommend'),
]