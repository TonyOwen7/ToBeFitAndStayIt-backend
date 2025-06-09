import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../core/components/header/header.component';
import { FooterComponent } from '../../core/components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SleepSession {
  id: number;
  type: string;
  duration: number;
  startTime: string;
  endTime: string;
}

interface Recommendation {
  title: string;
  text: string;
}

@Component({
  selector: 'app-nutrition',
  imports: [HeaderComponent, FooterComponent, CommonModule, FormsModule],
  templateUrl: './sleep.component.html',
  styleUrls: ['./sleep.component.css']
})
export class SleepComponent implements OnInit {
  sleepSessions: SleepSession[] = [];
  totalSleep: number = 0;
  age: number = 25;
  lifestyle: string = 'sedentary';
  sleepQuality: string = 'good';
  dailySleepGoal: number = 8;
  
  sleepType: string = 'night';
  startTime: string = '';
  endTime: string = '';
  
  recommendations: Recommendation[] = [];

  ngOnInit(): void {
    this.calculateGoal();
    this.updateSleepDisplay();
  }

  quickAdd(hours: number): void {
    const sleepSession: SleepSession = {
      id: Date.now(),
      type: hours >= 6 ? 'Night Sleep' : 'Nap',
      duration: hours,
      startTime: '--',
      endTime: '--'
    };

    this.sleepSessions.push(sleepSession);
    this.totalSleep += hours;
    
    this.updateSleepDisplay();
  }

  addSleep(): void {
    if (!this.startTime || !this.endTime) {
      alert('Please enter both start and end times');
      return;
    }

    const duration = this.calculateDuration(this.startTime, this.endTime);
    if (duration <= 0) {
      alert('End time must be after start time');
      return;
    }

    const sleepSession: SleepSession = {
      id: Date.now(),
      type: this.sleepType.charAt(0).toUpperCase() + this.sleepType.slice(1),
      duration: duration,
      startTime: this.startTime,
      endTime: this.endTime
    };

    this.sleepSessions.push(sleepSession);
    this.totalSleep += duration;
    
    this.updateSleepDisplay();
    this.clearInputs();
  }

  private calculateDuration(start: string, end: string): number {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    let startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;
    
    // If end time is earlier than start time, assume it's next day
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }
    
    return (endMinutes - startMinutes) / 60;
  }

  removeSleep(id: number): void {
    const session = this.sleepSessions.find(session => session.id === id);
    if (session) {
      this.totalSleep -= session.duration;
      this.sleepSessions = this.sleepSessions.filter(session => session.id !== id);
      this.updateSleepDisplay();
    }
  }

  private updateSleepDisplay(): void {
    this.updateRecommendations();
  }

  private clearInputs(): void {
    this.startTime = '';
    this.endTime = '';
  }

  setLifestyle(type: string): void {
    this.lifestyle = type;
    this.calculateGoal();
  }

  calculateGoal(): void {
    let baseHours = 8;
    
    // Age adjustments
    if (this.age < 18) baseHours = 9;
    else if (this.age > 65) baseHours = 7.5;
    
    // Lifestyle adjustments
    switch (this.lifestyle) {
      case 'athlete': baseHours += 1; break;
      case 'stressed': baseHours += 0.5; break;
      case 'active': baseHours += 0.5; break;
    }
    
    // Sleep quality adjustments
    switch (this.sleepQuality) {
      case 'poor': baseHours += 1; break;
      case 'average': baseHours += 0.5; break;
    }
    
    this.dailySleepGoal = Math.max(6, Math.min(12, baseHours));
    this.updateSleepDisplay();
  }

  private updateRecommendations(): void {
    const sleepDeficit = Math.max(this.dailySleepGoal - this.totalSleep, 0);
    
    let tips: Recommendation[] = [];
    
    if (sleepDeficit > 2) {
      tips.push({
        title: 'Significant Sleep Debt',
        text: `You need ${sleepDeficit.toFixed(1)} more hours to reach your goal. Consider going to bed earlier tonight.`
      });
    } else if (sleepDeficit > 0) {
      tips.push({
        title: 'Nearly There!',
        text: `Just ${sleepDeficit.toFixed(1)} more hours needed. A short nap might help you reach your goal.`
      });
    } else {
      tips.push({
        title: 'Great Job!',
        text: 'You\'ve met your sleep goal for today. Keep up the good sleep hygiene!'
      });
    }
    
    if (this.lifestyle === 'athlete') {
      tips.push({
        title: 'Athletic Recovery',
        text: 'As an athlete, prioritize consistent sleep schedules and consider afternoon naps for better performance recovery.'
      });
    }
    
    if (this.sleepQuality === 'poor') {
      tips.push({
        title: 'Improve Sleep Quality',
        text: 'Try maintaining a cool, dark room, avoiding screens before bed, and establishing a relaxing bedtime routine.'
      });
    }
    
    tips.push({
      title: 'General Sleep Hygiene',
      text: 'Maintain consistent sleep and wake times, limit caffeine after 2 PM, and create a relaxing bedtime environment.'
    });
    
    this.recommendations = tips;
  }

  // Getter methods for template calculations
  get sleepPercentage(): number {
    return this.dailySleepGoal > 0 ? Math.min((this.totalSleep / this.dailySleepGoal) * 100, 100) : 0;
  }

  get remainingHours(): number {
    return Math.max(this.dailySleepGoal - this.totalSleep, 0);
  }

  get sleepStatusText(): string {
    const percentage = this.sleepPercentage;
    if (percentage >= 100) return 'Well Rested!';
    if (percentage >= 75) return 'Good Sleep';
    if (percentage >= 50) return 'Moderate Rest';
    return 'Need Rest!';
  }

  get sleepStatusColor(): string {
    const percentage = this.sleepPercentage;
    if (percentage >= 100) return '#4caf50';
    if (percentage >= 75) return '#8bc34a';
    if (percentage >= 50) return '#ff9800';
    return '#f44336';
  }

  get sleepCircleBackground(): string {
    const percentage = this.sleepPercentage;
    if (percentage >= 100) return 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)';
    if (percentage >= 75) return 'linear-gradient(135deg, #8bc34a 0%, #689f38 100%)';
    if (percentage >= 50) return 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)';
    return 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
  }
}