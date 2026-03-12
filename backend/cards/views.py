from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Card, Deck
from .serializers import CardSerializer, DeckSerializer
import os
import json
from django.conf import settings

class DeckViewSet(viewsets.ModelViewSet):
    queryset = Deck.objects.all()
    serializer_class = DeckSerializer

    @action(detail=True, methods=['post'])
    def save_to_file(self, request, pk=None):
        deck = self.get_object()
        cards = deck.cards.all()
        data = CardSerializer(cards, many=True).data
        
        folder = os.path.join(settings.BASE_DIR, 'saved_decks')
        os.makedirs(folder, exist_ok=True)
        filename = f"{deck.name.replace(' ', '_')}.json"
        filepath = os.path.join(folder, filename)
        
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
            
        return Response({'status': 'saved', 'path': filepath})

class CardViewSet(viewsets.ModelViewSet):
    queryset = Card.objects.all()
    serializer_class = CardSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        deck_id = self.request.query_params.get('deck')
        if deck_id is not None:
             queryset = queryset.filter(deck_id=deck_id)
        return queryset
