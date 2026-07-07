// Mental Health Assessment Engine
// This analyzes mood data and provides clinical insights

class MentalHealthEngine {
    
    // Calculate depression risk based on mood patterns
    static assessDepressionRisk(moods) {
        if (!moods || moods.length < 3) return { risk: 'insufficient_data', score: 0 };
        
        const recentMoods = moods.slice(0, 14); // Last 14 entries
        let score = 0;
        let lowMoodCount = 0;
        let veryLowMoodCount = 0;
        
        recentMoods.forEach(mood => {
            if (mood.score <= 3) {
                veryLowMoodCount++;
                score += 3;
            } else if (mood.score <= 5) {
                lowMoodCount++;
                score += 1;
            }
            
            if (mood.energyLevel && mood.energyLevel <= 3) score += 2;
            if (mood.sleepQuality && mood.sleepQuality <= 3) score += 1;
            if (mood.appetite && mood.appetite <= 3) score += 1;
            if (mood.concentration && mood.concentration <= 3) score += 1;
            if (mood.socialInteraction && mood.socialInteraction <= 3) score += 2;
        });
        
        // Trend analysis
        const trend = this.calculateTrend(recentMoods);
        if (trend === 'declining') score += 5;
        
        let risk = 'low';
        if (score >= 15 || veryLowMoodCount >= 5) risk = 'high';
        else if (score >= 8 || lowMoodCount >= 7) risk = 'moderate';
        
        return {
            risk,
            score,
            lowMoodDays: lowMoodCount + veryLowMoodCount,
            veryLowMoodDays: veryLowMoodCount,
            trend,
            recommendation: this.getDepressionRecommendation(risk)
        };
    }
    
    // Calculate anxiety risk
    static assessAnxietyRisk(moods) {
        if (!moods || moods.length < 3) return { risk: 'insufficient_data', score: 0 };
        
        const recentMoods = moods.slice(0, 14);
        let score = 0;
        let highAnxietyCount = 0;
        
        recentMoods.forEach(mood => {
            if (mood.anxietyScore) {
                if (mood.anxietyScore >= 8) {
                    highAnxietyCount++;
                    score += 3;
                } else if (mood.anxietyScore >= 6) {
                    score += 1;
                }
            }
            if (mood.stressScore && mood.stressScore >= 8) score += 2;
            if (mood.sleepQuality && mood.sleepQuality <= 3) score += 1;
        });
        
        let risk = 'low';
        if (score >= 12 || highAnxietyCount >= 5) risk = 'high';
        else if (score >= 6 || highAnxietyCount >= 3) risk = 'moderate';
        
        return {
            risk,
            score,
            highAnxietyDays: highAnxietyCount,
            recommendation: this.getAnxietyRecommendation(risk)
        };
    }
    
    // Detect crisis signals
    static detectCrisis(moodEntry) {
        const crisisSignals = [];
        let severity = 'none';
        
        // Check for severe mood
        if (moodEntry.score <= 1) {
            crisisSignals.push('Severely low mood detected');
            severity = 'high';
        }
        
        // Check for combined risk factors
        if (moodEntry.score <= 2 && 
            moodEntry.energyLevel <= 2 && 
            moodEntry.socialInteraction <= 1) {
            crisisSignals.push('Multiple severe symptoms detected');
            severity = 'critical';
        }
        
        // Check note for crisis keywords
        if (moodEntry.note) {
            const crisisKeywords = [
                'suicide', 'kill myself', 'end my life', 'want to die',
                'no reason to live', 'better off dead', 'self harm',
                'hurt myself', 'cant go on', 'give up', 'hopeless'
            ];
            
            const noteLower = moodEntry.note.toLowerCase();
            const foundKeywords = crisisKeywords.filter(kw => noteLower.includes(kw));
            
            if (foundKeywords.length > 0) {
                crisisSignals.push(`Crisis keywords detected: ${foundKeywords.join(', ')}`);
                severity = 'critical';
            }
        }
        
        return {
            isCrisis: crisisSignals.length > 0,
            severity,
            signals: crisisSignals,
            immediateAction: severity === 'critical' ? this.getCrisisResources() : null
        };
    }
    
    // Calculate mood trend
    static calculateTrend(moods) {
        if (moods.length < 3) return 'stable';
        
        const firstHalf = moods.slice(Math.floor(moods.length / 2));
        const secondHalf = moods.slice(0, Math.floor(moods.length / 2));
        
        const firstAvg = firstHalf.reduce((s, m) => s + m.score, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((s, m) => s + m.score, 0) / secondHalf.length;
        
        const difference = secondAvg - firstAvg;
        
        if (difference > 1.5) return 'improving';
        if (difference < -1.5) return 'declining';
        return 'stable';
    }
    
    // Generate personalized recommendations
    static generateRecommendations(userId, moods, assessmentResults) {
        const recommendations = [];
        
        // Depression recommendations
        if (assessmentResults.depression.risk === 'high') {
            recommendations.push({
                category: 'depression',
                title: 'Seek Professional Support',
                description: 'Your mood patterns suggest you may benefit from speaking with a mental health professional. Consider scheduling an appointment with a therapist or counselor.',
                priority: 'high'
            });
            recommendations.push({
                category: 'depression',
                title: 'Behavioral Activation',
                description: 'Start with small, achievable activities each day. Even 5 minutes of activity can help improve mood.',
                priority: 'high'
            });
        }
        
        // Anxiety recommendations
        if (assessmentResults.anxiety.risk === 'high') {
            recommendations.push({
                category: 'anxiety',
                title: 'Practice Deep Breathing',
                description: 'Try the 4-7-8 breathing technique when feeling anxious. Breathe in for 4 seconds, hold for 7, exhale for 8.',
                priority: 'high'
            });
            recommendations.push({
                category: 'anxiety',
                title: 'Progressive Muscle Relaxation',
                description: 'Tense and then relax each muscle group in your body, starting from your toes and working up to your head.',
                priority: 'medium'
            });
        }
        
        // Sleep recommendations
        const avgSleep = moods.reduce((s, m) => s + (m.sleepHours || 0), 0) / moods.length;
        if (avgSleep < 7) {
            recommendations.push({
                category: 'sleep',
                title: 'Improve Sleep Hygiene',
                description: 'You\'re averaging less than 7 hours of sleep. Try going to bed 30 minutes earlier and avoid screens before bedtime.',
                priority: 'high'
            });
        }
        
        // General wellness
        recommendations.push({
            category: 'general',
            title: 'Daily Gratitude Practice',
            description: 'Write down 3 things you\'re grateful for each day. This simple practice can improve overall well-being.',
            priority: 'medium'
        });
        
        recommendations.push({
            category: 'general',
            title: 'Regular Physical Activity',
            description: 'Even a 15-minute walk can boost your mood. Try to incorporate movement into your daily routine.',
            priority: 'medium'
        });
        
        return recommendations;
    }
    
    // Generate weekly report
    static generateWeeklyReport(moods, assessmentResults) {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        
        const weekMoods = moods.filter(m => new Date(m.createdAt) >= weekStart);
        
        if (weekMoods.length === 0) return null;
        
        const avgMood = (weekMoods.reduce((s, m) => s + m.score, 0) / weekMoods.length).toFixed(1);
        const avgSleep = (weekMoods.reduce((s, m) => s + (m.sleepHours || 0), 0) / weekMoods.length).toFixed(1);
        const moodCount = weekMoods.length;
        
        // Best and worst days
        const sortedByMood = [...weekMoods].sort((a, b) => b.score - a.score);
        const bestDay = sortedByMood[0];
        const worstDay = sortedByMood[sortedByMood.length - 1];
        
        return {
            period: `${weekStart.toLocaleDateString()} - ${now.toLocaleDateString()}`,
            summary: {
                averageMood: avgMood,
                averageSleep: avgSleep,
                totalEntries: moodCount,
                bestDay: bestDay ? { score: bestDay.score, date: bestDay.createdAt, context: bestDay.context } : null,
                worstDay: worstDay ? { score: worstDay.score, date: worstDay.createdAt, context: worstDay.context } : null,
                trend: assessmentResults.trend
            },
            depressionRisk: assessmentResults.depression,
            anxietyRisk: assessmentResults.anxiety,
            recommendations: assessmentResults.recommendations,
            generatedAt: now.toISOString()
        };
    }
    
    static getDepressionRecommendation(risk) {
        const recommendations = {
            low: 'Your mood appears generally stable. Continue your wellness practices.',
            moderate: 'You\'ve had several low mood days. Consider talking to someone you trust and increasing self-care activities.',
            high: 'Your mood patterns indicate significant distress. We strongly recommend reaching out to a mental health professional.',
            insufficient_data: 'Continue logging your mood to receive personalized insights.'
        };
        return recommendations[risk] || recommendations.insufficient_data;
    }
    
    static getAnxietyRecommendation(risk) {
        const recommendations = {
            low: 'Your anxiety levels appear manageable. Keep practicing stress management techniques.',
            moderate: 'You\'re experiencing elevated anxiety. Try incorporating relaxation exercises into your daily routine.',
            high: 'Your anxiety levels are very high. Please consider professional support and use grounding techniques when overwhelmed.',
            insufficient_data: 'Continue logging to receive anxiety insights.'
        };
        return recommendations[risk] || recommendations.insufficient_data;
    }
    
    static getCrisisResources() {
        return {
            message: 'If you\'re experiencing thoughts of self-harm or suicide, please reach out immediately:',
            resources: [
                { name: 'National Suicide Prevention Lifeline', contact: '112 (NG)' },
                { name: 'Crisis Text Line', contact: 'Text HELP to 08062106493' },
                { name: 'Emergency Services', contact: '112 (NG) or your local emergency number' },
                { name: 'International Association for Suicide Prevention', contact: 'https://www.iasp.info/resources/Crisis_Centres/' }
            ],
            message2: 'You are not alone. Help is available 24/7.'
        };
    }
}

module.exports = MentalHealthEngine;
