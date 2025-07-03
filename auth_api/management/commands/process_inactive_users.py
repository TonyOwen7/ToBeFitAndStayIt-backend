from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.db import transaction
import logging
from auth_api.models import DataRetentionLog

User = get_user_model()
logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Process inactive users for data retention'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without actually doing it',
        )
        parser.add_argument(
            '--force-anonymize',
            action='store_true',
            help='Force anonymization of users past grace period',
        )
    
    def handle(self, *args, **options):
        dry_run = options['dry_run']
        force_anonymize = options['force_anonymize']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made'))
        
        # Process users who need warnings
        self.send_retention_warnings(dry_run)
        
        # Process users who need final notices
        self.send_final_notices(dry_run)
        
        # Process users for data anonymization
        if force_anonymize:
            self.anonymize_user_data(dry_run)
    
    def send_retention_warnings(self, dry_run=False):
        """Send retention warnings to inactive users"""
        users_needing_warnings = User.objects.filter(
            is_active=True,
            is_data_anonymized=False
        ).exclude(
            retention_notification_sent__gte=timezone.now() - timedelta(days=30)
        )
        
        warning_count = 0
        for user in users_needing_warnings:
            if user.should_send_retention_warning():
                days_inactive = user.days_since_last_activity()
                
                if not dry_run:
                    self.send_retention_warning_email(user, days_inactive)
                    user.retention_notification_sent = timezone.now()
                    user.retention_warnings_count += 1
                    user.save(update_fields=['retention_notification_sent', 'retention_warnings_count'])
                    
                    DataRetentionLog.objects.create(
                        user=user,
                        action='warning_sent',
                        details=f'First retention warning sent after {days_inactive} days of inactivity',
                        days_inactive=days_inactive
                    )
                
                warning_count += 1
                self.stdout.write(
                    f"{'[DRY RUN] ' if dry_run else ''}Sent retention warning to {user.email} "
                    f"(inactive for {days_inactive} days)"
                )
        
        self.stdout.write(
            self.style.SUCCESS(f"Processed {warning_count} retention warnings")
        )
    
    def send_final_notices(self, dry_run=False):
        """Send final notices to users approaching anonymization"""
        users_needing_final_notice = User.objects.filter(
            is_active=True,
            is_data_anonymized=False,
            retention_notification_sent__isnull=False,
            data_anonymization_scheduled__isnull=True
        )
        
        final_notice_count = 0
        for user in users_needing_final_notice:
            days_inactive = user.days_since_last_activity()
            
            # Send final notice at 6 months (180 days)
            if days_inactive >= 180:
                if not dry_run:
                    self.send_final_notice_email(user, days_inactive)
                    user.data_anonymization_scheduled = timezone.now() + timedelta(days=30)
                    user.save(update_fields=['data_anonymization_scheduled'])
                    
                    DataRetentionLog.objects.create(
                        user=user,
                        action='final_notice_sent',
                        details=f'Final notice sent. Data anonymization scheduled for 30 days.',
                        days_inactive=days_inactive
                    )
                
                final_notice_count += 1
                self.stdout.write(
                    f"{'[DRY RUN] ' if dry_run else ''}Sent final notice to {user.email} "
                    f"(inactive for {days_inactive} days)"
                )
        
        self.stdout.write(
            self.style.SUCCESS(f"Processed {final_notice_count} final notices")
        )
    
    def anonymize_user_data(self, dry_run=False):
        """Anonymize data for users past grace period"""
        users_for_anonymization = User.objects.filter(
            is_active=True,
            is_data_anonymized=False,
            data_anonymization_scheduled__lte=timezone.now()
        )
        
        anonymized_count = 0
        for user in users_for_anonymization:
            days_inactive = user.days_since_last_activity()
            
            if not dry_run:
                with transaction.atomic():
                    self.anonymize_user(user)
                    
                    DataRetentionLog.objects.create(
                        user=user,
                        action='data_anonymized',
                        details=f'User data anonymized after {days_inactive} days of inactivity',
                        days_inactive=days_inactive
                    )
            
            anonymized_count += 1
            self.stdout.write(
                f"{'[DRY RUN] ' if dry_run else ''}Anonymized data for {user.email} "
                f"(inactive for {days_inactive} days)"
            )
        
        self.stdout.write(
            self.style.SUCCESS(f"Processed {anonymized_count} data anonymizations")
        )
    
    def anonymize_user(self, user):
        """Anonymize user's personal data while preserving anonymized analytics"""
        anonymized_id = f"anonymized_user_{user.id}_{timezone.now().strftime('%Y%m%d')}"
        
        # Anonymize personal information
        user.email = f"{anonymized_id}@anonymized.local"
        user.username = anonymized_id
        user.first_name = "Anonymized"
        user.last_name = "User"
        user.is_data_anonymized = True
        user.is_active = False
        
        # Keep aggregated health data for research but remove personal identifiers
        # You might want to keep age ranges, general activity levels for population studies
        # but remove specific personal metrics
        
        user.save()
        
        # Send anonymization confirmation
        # Note: This should be sent before anonymizing the email
        # In practice, you'd send this before the anonymization process
    
    def send_retention_warning_email(self, user, days_inactive):
        """Send retention warning email"""
        subject = "Account Inactivity Notice - Action Required"
        
        reactivation_link = f"http://localhost:4200/auth/login"
        account_settings_link = f"http://localhost:4200/profile/settings"
        
        html_content = f"""
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:20px;padding:30px;
                    font-family:sans-serif;border:1px solid #ffd700;box-shadow:0 10px 30px rgba(0,0,0,0.1)">
          <h2 style="color:#ff6b35;margin-bottom:10px">Not we miss you {user.first_name or 'there'}!</h2>
          
          <p style="font-size:16px;color:#333;margin-bottom:20px">
            Your ToBeFitAndStayIt account has been inactive for <strong>{days_inactive} days</strong>. 
            We wanted to reach out and let you know about our data retention policy.
          </p>
          
          <div style="background:#f8f9fa;padding:20px;border-radius:10px;margin:20px 0;border-left:4px solid #ff6b35;">
            <h3 style="color:#ff6b35;margin-top:0;">Data Retention Policy</h3>
            <p style="margin:10px 0;color:#555;">
              • If your account remains inactive for <strong>6 months</strong>, we will send you a final notice<br>
              • After the final notice, you have <strong>30 days</strong> to reactivate your account<br>
              • If no action is taken, your personal health data will be <strong>anonymized</strong> for privacy protection
            </p>
          </div>
          
          <p style="font-size:16px;color:#333;margin-bottom:20px">
            To keep your account active and preserve your health data, simply log in to your account:
          </p>
          
          <a href="{reactivation_link}" style="display:inline-block;padding:14px 22px;margin:10px 5px;
            background:linear-gradient(135deg, #8bc34a, #689f38);color:white;text-decoration:none;
            border-radius:50px;font-weight:bold;font-size:16px;">Reactivate Account</a>
          
          <a href="{account_settings_link}" style="display:inline-block;padding:14px 22px;margin:10px 5px;
            background:linear-gradient(135deg, #2196f3, #1976d2);color:white;text-decoration:none;
            border-radius:50px;font-weight:bold;font-size:16px;">Account Settings</a>
          
          <div style="background:#e8f5e8;padding:15px;border-radius:10px;margin:20px 0;">
            <h4 style="color:#2e7d32;margin-top:0;">Why This Matters</h4>
            <p style="margin-bottom:0;color:#555;font-size:14px;">
              We take your privacy seriously. By anonymizing inactive accounts, we protect your personal 
              information while still being able to contribute to health research through anonymized data.
            </p>
          </div>
          
          <p style="font-size:14px;color:#666;margin-top:20px">
            Questions about this policy? Contact our support team or visit our privacy policy.
          </p>
          
          <p style="font-size:13px;color:#aaa;margin-top:30px;border-top:1px solid #eee;padding-top:10px">
            Stay healthy,<br>The ToBeFitAndStayIt Team
          </p>
        </div>
        """
        
        text_content = strip_tags(html_content)
        
        msg = EmailMultiAlternatives(subject, text_content, "moubouyitony@gmail.com", [user.email])
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
    
    def send_final_notice_email(self, user, days_inactive):
        """Send final notice before data anonymization"""
        subject = "FINAL NOTICE: Account Data Will Be Anonymized Soon"
        
        reactivation_link = f"http://localhost:4200/auth/login"
        
        html_content = f"""
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:20px;padding:30px;
                    font-family:sans-serif;border:1px solid #ff4444;box-shadow:0 10px 30px rgba(0,0,0,0.1)">
          <h2 style="color:#d32f2f;margin-bottom:10px">⚠️ FINAL NOTICE - {user.first_name or 'Account Holder'}</h2>
          
          <div style="background:#ffebee;padding:20px;border-radius:10px;margin:20px 0;border:2px solid #ff4444;">
            <h3 style="color:#d32f2f;margin-top:0;">Your account data will be anonymized in 30 days</h3>
            <p style="margin:10px 0;color:#333;font-weight:bold;">
              Account inactive for: <span style="color:#d32f2f;">{days_inactive} days</span>
            </p>
          </div>
          
          <p style="font-size:16px;color:#333;margin-bottom:20px">
            This is your final notice. Your ToBeFitAndStayIt account has been inactive for over 6 months. 
            According to our data retention policy, we will anonymize your personal health data in 
            <strong style="color:#d32f2f;">30 days</strong> unless you take action.
          </p>
          
          <div style="background:#fff3cd;padding:20px;border-radius:10px;margin:20px 0;border-left:4px solid #ffc107;">
            <h3 style="color:#856404;margin-top:0;">What This Means</h3>
            <p style="margin:10px 0;color:#555;">
              • Your personal information (name, email, specific health metrics) will be removed<br>
              • Your account will be deactivated<br>
              • This action <strong>cannot be reversed</strong><br>
              • Anonymized data may be used for health research (no personal identification possible)
            </p>
          </div>
          
          <div style="background:#e8f5e8;padding:20px;border-radius:10px;margin:20px 0;border-left:4px solid #4caf50;">
            <h3 style="color:#2e7d32;margin-top:0;">How to Keep Your Account</h3>
            <p style="margin:10px 0;color:#555;">
              Simply log in to your account within the next 30 days. That's it! 
              Your account will remain active and your data will be preserved.
            </p>
          </div>
          
          <div style="text-align:center;margin:30px 0;">
            <a href="{reactivation_link}" style="display:inline-block;padding:18px 36px;
              background:linear-gradient(135deg, #4caf50, #388e3c);color:white;text-decoration:none;
              border-radius:50px;font-weight:bold;font-size:18px;box-shadow:0 4px 12px rgba(76,175,80,0.3);">
              🔑 Save My Account Now
            </a>
          </div>
          
          <p style="font-size:14px;color:#666;margin-top:20px;text-align:center;">
            Need help? Contact our support team immediately at support@tobefitandstayit.com
          </p>
          
          <p style="font-size:13px;color:#aaa;margin-top:30px;border-top:1px solid #eee;padding-top:10px">
            This is an automated message regarding your account security and privacy.<br>
            The ToBeFitAndStayIt Team
          </p>
        </div>
        """
        
        text_content = strip_tags(html_content)
        
        msg = EmailMultiAlternatives(subject, text_content, "moubouyitony@gmail.com", [user.email])
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
