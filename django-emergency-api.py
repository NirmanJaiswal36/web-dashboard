# Django Emergency API Implementation
# This code should be added to your Django backend project

# models.py
from django.db import models
from django.contrib.auth.models import User

class Emergency(models.Model):
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('reported', 'Reported'),
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    lat = models.FloatField()
    lng = models.FloatField()
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='medium')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='reported')
    photo_url = models.URLField(blank=True, null=True)
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_emergencies')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_emergencies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Emergency'
        verbose_name_plural = 'Emergencies'

    def __str__(self):
        return f"{self.title} - {self.severity.upper()}"

# serializers.py
from rest_framework import serializers
from .models import Emergency

class EmergencySerializer(serializers.ModelSerializer):
    reporter_name = serializers.CharField(source='reporter.get_full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    time_since_created = serializers.SerializerMethodField()

    class Meta:
        model = Emergency
        fields = [
            'id', 'title', 'description', 'lat', 'lng', 
            'severity', 'status', 'photo_url', 'reporter', 
            'reporter_name', 'assigned_to', 'assigned_to_name',
            'created_at', 'updated_at', 'resolved_at', 'time_since_created'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'reporter']

    def get_time_since_created(self, obj):
        from django.utils import timezone
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.seconds < 60:
            return "Just now"
        elif diff.seconds < 3600:
            return f"{diff.seconds // 60}m ago"
        elif diff.days == 0:
            return f"{diff.seconds // 3600}h ago"
        else:
            return f"{diff.days}d ago"

class EmergencyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Emergency
        fields = ['title', 'description', 'lat', 'lng', 'severity', 'photo_url']

    def create(self, validated_data):
        # Set the reporter to the current user
        validated_data['reporter'] = self.context['request'].user
        return super().create(validated_data)

# views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from .models import Emergency
from .serializers import EmergencySerializer, EmergencyCreateSerializer

class EmergencyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing emergency reports
    """
    queryset = Emergency.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EmergencyCreateSerializer
        return EmergencySerializer

    def get_queryset(self):
        queryset = Emergency.objects.all()
        
        # Filter by severity
        severity = self.request.query_params.get('severity', None)
        if severity:
            queryset = queryset.filter(severity=severity)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by location (radius search)
        lat = self.request.query_params.get('lat', None)
        lng = self.request.query_params.get('lng', None)
        radius = self.request.query_params.get('radius', None)
        
        if lat and lng and radius:
            # Simple bounding box filter (for more accurate distance, use PostGIS)
            lat, lng, radius = float(lat), float(lng), float(radius)
            lat_delta = radius / 111  # Rough conversion km to degrees
            lng_delta = radius / (111 * abs(lat))
            
            queryset = queryset.filter(
                lat__gte=lat - lat_delta,
                lat__lte=lat + lat_delta,
                lng__gte=lng - lng_delta,
                lng__lte=lng + lng_delta
            )
        
        # Filter by time range
        time_filter = self.request.query_params.get('time_range', None)
        if time_filter:
            now = timezone.now()
            if time_filter == '1h':
                queryset = queryset.filter(created_at__gte=now - timezone.timedelta(hours=1))
            elif time_filter == '24h':
                queryset = queryset.filter(created_at__gte=now - timezone.timedelta(days=1))
            elif time_filter == '7d':
                queryset = queryset.filter(created_at__gte=now - timezone.timedelta(days=7))
        
        return queryset

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active emergencies (not resolved or closed)"""
        active_emergencies = self.get_queryset().exclude(
            status__in=['resolved', 'closed']
        )
        serializer = self.get_serializer(active_emergencies, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def critical(self, request):
        """Get only critical emergencies"""
        critical_emergencies = self.get_queryset().filter(severity='critical')
        serializer = self.get_serializer(critical_emergencies, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Assign emergency to a user"""
        emergency = self.get_object()
        user_id = request.data.get('user_id')
        
        try:
            from django.contrib.auth.models import User
            assignee = User.objects.get(id=user_id)
            emergency.assigned_to = assignee
            emergency.status = 'assigned'
            emergency.save()
            
            serializer = self.get_serializer(emergency)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update emergency status"""
        emergency = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Emergency.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        emergency.status = new_status
        if new_status == 'resolved':
            emergency.resolved_at = timezone.now()
        emergency.save()
        
        serializer = self.get_serializer(emergency)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get emergency statistics"""
        total = self.get_queryset().count()
        critical = self.get_queryset().filter(severity='critical').count()
        high = self.get_queryset().filter(severity='high').count()
        active = self.get_queryset().exclude(status__in=['resolved', 'closed']).count()
        resolved_today = self.get_queryset().filter(
            status='resolved',
            resolved_at__gte=timezone.now().replace(hour=0, minute=0, second=0)
        ).count()
        
        return Response({
            'total': total,
            'critical': critical,
            'high': high,
            'active': active,
            'resolved_today': resolved_today
        })

# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmergencyViewSet

router = DefaultRouter()
router.register(r'emergencies', EmergencyViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]

# admin.py
from django.contrib import admin
from .models import Emergency

@admin.register(Emergency)
class EmergencyAdmin(admin.ModelAdmin):
    list_display = ['title', 'severity', 'status', 'reporter', 'assigned_to', 'created_at']
    list_filter = ['severity', 'status', 'created_at']
    search_fields = ['title', 'description', 'reporter__username']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'photo_url')
        }),
        ('Location', {
            'fields': ('lat', 'lng')
        }),
        ('Status & Assignment', {
            'fields': ('severity', 'status', 'reporter', 'assigned_to')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'resolved_at'),
            'classes': ('collapse',)
        }),
    )

# Sample data creation script (management command)
# Create this as: management/commands/create_sample_emergencies.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from myapp.models import Emergency
import random

class Command(BaseCommand):
    help = 'Create sample emergency data'

    def handle(self, *args, **options):
        # Get or create a user for testing
        user, created = User.objects.get_or_create(
            username='testuser',
            defaults={'email': 'test@example.com', 'first_name': 'Test', 'last_name': 'User'}
        )

        sample_emergencies = [
            {
                'title': 'Injured Dog Near Highway',
                'description': 'A dog has been hit by a vehicle and needs immediate medical attention. Located near the highway overpass.',
                'lat': 20.5937,
                'lng': 78.9629,
                'severity': 'critical',
                'reporter': user
            },
            {
                'title': 'Stray Pack Aggressive Behavior',
                'description': 'A pack of stray dogs showing aggressive behavior towards pedestrians. Multiple complaints received.',
                'lat': 20.6200,
                'lng': 78.9800,
                'severity': 'high',
                'reporter': user
            },
            {
                'title': 'Cat Stuck in Tree',
                'description': 'A cat has been stuck in a tall tree for over 6 hours. Owner is distressed.',
                'lat': 20.5500,
                'lng': 78.9200,
                'severity': 'medium',
                'reporter': user
            },
            {
                'title': 'Suspected Rabies Case',
                'description': 'A dog showing signs of rabies reported in residential area. Immediate quarantine needed.',
                'lat': 20.6500,
                'lng': 79.0100,
                'severity': 'critical',
                'reporter': user
            }
        ]

        for emergency_data in sample_emergencies:
            Emergency.objects.get_or_create(
                title=emergency_data['title'],
                defaults=emergency_data
            )

        self.stdout.write(
            self.style.SUCCESS('Successfully created sample emergencies')
        )

# Add to settings.py
INSTALLED_APPS = [
    # ... your other apps
    'rest_framework',
    'corsheaders',  # for CORS if frontend is on different domain
    # ... your emergency app name
]

MIDDLEWARE = [
    # ... other middleware
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

# CORS settings (if needed)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Your Next.js frontend
    "http://127.0.0.1:3000",
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20
}
