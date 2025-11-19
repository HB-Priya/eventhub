import React, { useState } from 'react';
import { generateEventPlan } from '../services/geminiService';
import { AiPlanResponse } from '../types';
import { Wand2, Loader2, CheckCircle, Sparkles, Calendar } from 'lucide-react';

interface AiPlannerProps {
  onBookPlan: (plan: AiPlanResponse, eventType: string, budget: string) => void;
}

const AiPlanner: React.FC<AiPlannerProps> = ({ onBookPlan }) => {
  const [eventType, setEventType] = useState('');
  const [budget, setBudget] = useState('Medium');
  const [preferences, setPreferences] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<AiPlanResponse | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventType) return;
    
    setLoading(true);
    const result = await generateEventPlan(eventType, budget, preferences);
    setPlan(result);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 font-playfair mb-4">AI Event Consultant</h2>
        <p className="text-slate-600">
          Not sure where to start? Tell our AI assistant about your event, and we'll suggest a theme and budget for Tirupalappa Events.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Event Type</label>
              <input
                type="text"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                placeholder="e.g., 5th Birthday for Boy, Golden Jubilee"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Budget Preference</label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="Low">Economy</option>
                <option value="Medium">Standard</option>
                <option value="High">Premium / Luxury</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Special Preferences</label>
              <textarea
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="e.g., Jungle theme, Outdoor, Pure Veg food"
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition flex justify-center items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" /> Dreaming up ideas...
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5 mr-2" /> Generate Plan
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Display */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col justify-center min-h-[300px]">
          {plan ? (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Suggested Theme</span>
                <h3 className="text-2xl font-bold text-slate-900 font-playfair">{plan.theme}</h3>
              </div>
              
              <div>
                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">Decor & Activities</span>
                <ul className="mt-2 space-y-2">
                  {plan.suggestions.map((idea, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{idea}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 mt-4">
                <span className="text-xs font-bold tracking-wider text-amber-800 uppercase">Estimated Budget</span>
                <p className="text-lg font-bold text-amber-900">{plan.estimatedBudgetRange}</p>
                <p className="text-xs text-amber-700 mt-1">*Final price depends on guest count and customization.</p>
              </div>

              <button
                onClick={() => onBookPlan(plan, eventType, budget)}
                className="w-full mt-4 bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition flex justify-center items-center shadow-lg"
              >
                <Calendar className="h-5 w-5 mr-2" /> Book This Custom Plan
              </button>
            </div>
          ) : (
            <div className="text-center text-slate-400">
              <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Fill out the form to see AI-powered suggestions for your next event!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiPlanner;