# Generated by Django 5.2 on 2025-06-19 16:34

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app_interest', '0001_initial'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Tip',
        ),
        migrations.DeleteModel(
            name='TipCategory',
        ),
    ]
