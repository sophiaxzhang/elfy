import { API_ENDPOINTS, API_BASE_URL } from '../config/api';
import { getToken } from '../../services/authService';

export interface TaskSuggestion {
  id: string;
  name: string;
  description: string;
  gems: number;
  location: string;
  category: string;
  isAISuggestion: boolean;
}

export interface SuggestionRequest {
  childAge: number;
  childName: string;
  context?: string;
  timeOfDay?: string;
  weather?: string;
  mood?: string;
}

export interface SuggestionResponse {
  success: boolean;
  suggestions: TaskSuggestion[];
  count: number;
  context?: string;
}

export class AITaskSuggestionService {
  static async getTaskSuggestions(request: SuggestionRequest): Promise<SuggestionResponse> {
    try {
      const token = await getToken();
      const url = `${API_BASE_URL}/test-ai-suggestions`;
      console.log('🔗 AI Service: Making request to:', url);
      console.log('📱 AI Service: Request body:', request);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(request),
      });

      console.log('📡 AI Service: Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ AI Service: Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ AI Service: Success response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching AI task suggestions:', error);
      throw error;
    }
  }

  static async getContextualSuggestions(request: SuggestionRequest): Promise<SuggestionResponse> {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/test-ai-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching contextual AI suggestions:', error);
      throw error;
    }
  }

  static getContextualInfo(): { timeOfDay: string; weather: string } {
    const hour = new Date().getHours();
    let timeOfDay = 'morning';
    
    if (hour >= 6 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';

    // For now, return a default weather. In a real app, you'd integrate with a weather API
    const weather = 'sunny'; // This could be fetched from a weather service

    return { timeOfDay, weather };
  }

  static getMoodBasedOnTime(): string {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 10) return 'energetic';
    if (hour >= 10 && hour < 14) return 'focused';
    if (hour >= 14 && hour < 18) return 'playful';
    if (hour >= 18 && hour < 21) return 'calm';
    return 'tired';
  }
}
