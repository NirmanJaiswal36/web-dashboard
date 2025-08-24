# Django Backend Code for Mission Management
# Save these files in your Django project

# models.py
from django.contrib.gis.db import models
from django.contrib.gis.geos import Point, Polygon
from django.utils import timezone

class Mission(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    date = models.DateField(null=True, blank=True)
    city = models.CharField(max_length=100)
    area = models.CharField(max_length=100)
    center_lat = models.FloatField()
    center_lon = models.FloatField()
    polygon = models.PolygonField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    @property
    def center(self):
        return {"lat": self.center_lat, "lng": self.center_lon}

    @property
    def area_coverage_km2(self):
        if self.polygon:
            # Convert to appropriate coordinate system for area calculation
            area_m2 = self.polygon.transform(3857, clone=True).area
            return area_m2 / 1000000  # Convert to km²
        return 0

class Sighting(models.Model):
    mission = models.ForeignKey(Mission, on_delete=models.CASCADE, related_name='sightings')
    name = models.CharField(max_length=100)
    sterilized = models.BooleanField(default=False)
    location = models.PointField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.mission.title}"

    @property
    def coordinates(self):
        return [self.location.x, self.location.y]  # [lng, lat]

# serializers.py
from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import Mission, Sighting

class MissionSerializer(serializers.ModelSerializer):
    center = serializers.ReadOnlyField()
    area_coverage_km2 = serializers.ReadOnlyField()
    
    class Meta:
        model = Mission
        fields = [
            'id', 'title', 'description', 'date', 'city', 'area',
            'center_lat', 'center_lon', 'center', 'polygon',
            'area_coverage_km2', 'created_at', 'updated_at'
        ]

class SightingSerializer(serializers.ModelSerializer):
    coordinates = serializers.ReadOnlyField()
    
    class Meta:
        model = Sighting
        fields = [
            'id', 'mission', 'name', 'sterilized', 'location',
            'coordinates', 'created_at', 'updated_at'
        ]

class MissionStatisticsSerializer(serializers.Serializer):
    total_sightings = serializers.IntegerField()
    sterilized_count = serializers.IntegerField()
    completion_percentage = serializers.FloatField()
    area_covered_km2 = serializers.FloatField()

# views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.gis.geos import Point, Polygon
from django.contrib.gis.db.models import Q
from .models import Mission, Sighting
from .serializers import MissionSerializer, SightingSerializer, MissionStatisticsSerializer

class MissionViewSet(viewsets.ModelViewSet):
    queryset = Mission.objects.all().order_by('-created_at')
    serializer_class = MissionSerializer

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        mission = self.get_object()
        sightings = mission.sightings.all()
        
        total_sightings = sightings.count()
        sterilized_count = sightings.filter(sterilized=True).count()
        completion_percentage = (sterilized_count / total_sightings * 100) if total_sightings > 0 else 0
        
        stats = {
            'total_sightings': total_sightings,
            'sterilized_count': sterilized_count,
            'completion_percentage': round(completion_percentage, 2),
            'area_covered_km2': mission.area_coverage_km2,
        }
        
        serializer = MissionStatisticsSerializer(stats)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def sightings(self, request, pk=None):
        mission = self.get_object()
        sightings = mission.sightings.all()
        
        # If mission has a polygon, filter sightings within it
        if mission.polygon:
            sightings = sightings.filter(location__within=mission.polygon)
        
        serializer = SightingSerializer(sightings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def dashboard(self, request, pk=None):
        """Return dashboard data similar to drive dashboard"""
        mission = self.get_object()
        sightings = mission.sightings.all()
        
        # Mission details
        mission_data = MissionSerializer(mission).data
        
        # KPIs
        total_sightings = sightings.count()
        sterilized_count = sightings.filter(sterilized=True).count()
        
        kpis = {
            'animals_covered': total_sightings,
            'tagged_sterilized': sterilized_count,
            'area_coverage_km2': mission.area_coverage_km2,
        }
        
        # GeoJSON for sightings
        features = []
        for sighting in sightings:
            features.append({
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': sighting.coordinates
                },
                'properties': {
                    'id': sighting.id,
                    'name': sighting.name,
                    'sterilized': sighting.sterilized,
                    'created_at': sighting.created_at.isoformat()
                }
            })
        
        geo_json = {
            'type': 'FeatureCollection',
            'features': features
        }
        
        return Response({
            'mission_details': mission_data,
            'kpis': kpis,
            'geo_json': geo_json,
            'volunteers': []  # Add volunteer data if needed
        })

class SightingViewSet(viewsets.ModelViewSet):
    queryset = Sighting.objects.all().order_by('-created_at')
    serializer_class = SightingSerializer

    def perform_create(self, serializer):
        # Ensure location is within mission polygon if specified
        mission = serializer.validated_data['mission']
        location = serializer.validated_data['location']
        
        if mission.polygon and not mission.polygon.contains(location):
            # Optionally, you can raise a validation error
            # raise serializers.ValidationError("Sighting location must be within mission area")
            pass
        
        serializer.save()

# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MissionViewSet, SightingViewSet

router = DefaultRouter()
router.register(r'missions', MissionViewSet)
router.register(r'sightings', SightingViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]

# Example API Endpoints:
# GET /api/missions/ - List all missions
# POST /api/missions/ - Create new mission
# GET /api/missions/{id}/ - Get mission details
# GET /api/missions/{id}/statistics/ - Get mission statistics
# GET /api/missions/{id}/sightings/ - Get sightings for mission
# GET /api/missions/{id}/dashboard/ - Get mission dashboard data
# GET /api/sightings/ - List all sightings
# POST /api/sightings/ - Create new sighting

# settings.py additions:
# INSTALLED_APPS = [
#     ...
#     'django.contrib.gis',
#     'rest_framework',
#     'rest_framework_gis',
#     'corsheaders',
#     ...
# ]
#
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.contrib.gis.db.backends.postgis',
#         'NAME': 'your_database_name',
#         'USER': 'your_username',
#         'PASSWORD': 'your_password',
#         'HOST': 'localhost',
#         'PORT': '5432',
#     }
# }
#
# REST_FRAMEWORK = {
#     'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
#     'PAGE_SIZE': 20
# }
