from django.shortcuts import render, redirect
from .models import  AppInterest
from django.db.models import Count
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from .models import AppInterest
from django.contrib.admin.views.decorators import staff_member_required

@csrf_exempt
def submit_interest(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            choice = data.get('choice')

            if choice not in dict(AppInterest.INTEREST_CHOICES):
                return JsonResponse({'error': 'Invalid choice'}, status=400)

            AppInterest.objects.create(choice=choice)
            return JsonResponse({'message': 'Interest saved successfully.'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Only POST allowed'}, status=405)


@staff_member_required
def interest_dashboard(request):
    interest_summary_raw = AppInterest.objects.values('choice').annotate(count=Count('id'))
    total_votes = AppInterest.objects.count()

    # Calculate percentage in the view
    interest_summary = [
        {
            'choice': item['choice'],
            'count': item['count'],
            'percentage': round((item['count'] / total_votes) * 100, 2) if total_votes > 0 else 0
        }
        for item in interest_summary_raw
    ]

    return render(request, 'app-interest/dashboard.html', {
        'interest_summary': interest_summary,
        'total_votes': total_votes,
    })

from django.shortcuts import redirect
from django.views.decorators.http import require_POST
from django.contrib.admin.views.decorators import staff_member_required
from .models import AppInterest

@require_POST
@staff_member_required
def update_interest_counts(request):
    choice = request.POST.get("choice")
    action = request.POST.get("action")

    if action == "reset_all":
        AppInterest.objects.all().delete()
    elif choice in ["yes", "maybe", "no"]:
        if action == "inc":
            AppInterest.objects.create(choice=choice)
        elif action == "dec":
            instance = AppInterest.objects.filter(choice=choice).first()
            if instance:
                instance.delete()
        elif action == "reset":
            AppInterest.objects.filter(choice=choice).delete()

    # Always redirect to dashboard
    return redirect("interest_dashboard")
