from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from googlesearch import search
import requests
from bs4 import BeautifulSoup
import re

class AnswerFromWebView(APIView):

    def clean_text(self, text):
        text = re.sub(r'\[\d+\]', '', text)

        text = re.sub(r'\[.*?\]', '', text)

        text = re.sub(r'\s+', ' ', text)
        
        return text.strip()

    def extract_text_from_url(self, url):
        try:
            response = requests.get(url, timeout=5)
            soup = BeautifulSoup(response.content, 'html.parser')
            paragraphs = [p.get_text().strip() for p in soup.find_all('p') if len(p.get_text().strip()) > 100]
            return paragraphs
        except:
            return []

    def keyword_score(self, paragraph, keywords):
        text = paragraph.lower()
        return sum(text.count(word) for word in keywords)

    def find_best_paragraph(self, paragraphs, question):
        keywords = re.findall(r'\w+', question.lower())
        scored = [(para, self.keyword_score(para, keywords)) for para in paragraphs]
        scored = [pair for pair in scored if pair[1] > 0]
        return max(scored, key=lambda x: x[1])[0] if scored else "No relevant paragraph found."

    def post(self, request):
        question = request.data.get('question')
        if not question:
            return Response({'error': 'Missing question'}, status=status.HTTP_400_BAD_REQUEST)

        urls = search(question, stop=10, lang='en', pause=2.0)
        all_paragraphs = []
        for url in urls:
            all_paragraphs.extend(self.extract_text_from_url(url))
        best_paragraph = self.find_best_paragraph(all_paragraphs, question)
        cleaned = self.clean_text(best_paragraph)

        return Response({'answer': cleaned})
