from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from googlesearch import search
import requests
from bs4 import BeautifulSoup
import random
from functools import lru_cache

class WellnessTipView(APIView):
    local_tips = [
        "Drink at least 8 cups of water a day to stay hydrated.",
        "Take a short walk every hour to improve circulation.",
        "Practice deep breathing to reduce stress and anxiety.",
        "Aim for at least 7-8 hours of sleep each night.",
        "Limit screen time before bed to improve sleep quality.",
        "Stretch for 5 minutes every morning to boost flexibility.",
        "Write down 3 things you’re grateful for each day.",
        "Spend time in nature to improve your mood and focus.",
        "Take breaks and avoid multitasking to boost productivity.",
        "Eat more whole foods and less processed snacks."
    ]

    @lru_cache(maxsize=1)
    def extract_web_tips(self, query="daily wellness tips"):
        try:
            urls = search(query, stop=5, lang='en', pause=2.0)
            tips = []
            for url in urls:
                try:
                    res = requests.get(url, timeout=5)
                    soup = BeautifulSoup(res.content, 'html.parser')
                    paragraphs = soup.find_all('p')
                    for p in paragraphs:
                        text = p.get_text().strip()
                        if 100 < len(text) < 300:
                            tips.append(text)
                    if len(tips) >= 5:
                        break
                except:
                    continue
            return tips
        except:
            return []

    def get(self, request):
        web_tips = self.extract_web_tips()
        if not web_tips:
            tip = random.choice(self.local_tips)
        else:
            tip = random.choice(self.local_tips + web_tips)
        return Response({"tip": tip}, status=status.HTTP_200_OK)
