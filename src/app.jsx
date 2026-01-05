import React, { useState } from 'react';
import { Sparkles, AlertCircle, CheckCircle, Loader2, Info } from 'lucide-react';

function App() {
  const [ingredients, setIngredients] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const exampleIngredients = [
    {
      name: "Protein Bar",
      list: "Protein Blend (Whey Protein Isolate, Milk Protein Isolate), Soluble Corn Fiber, Almonds, Water, Erythritol, Natural Flavors, Palm Kernel Oil, Sea Salt, Calcium Carbonate, Sucralose, Steviol Glycosides"
    },
    {
      name: "Breakfast Cereal",
      list: "Whole Grain Oats, Sugar, Corn Syrup, Modified Corn Starch, Honey, Salt, Tripotassium Phosphate, Natural Flavor, Vitamin E, Iron, Vitamin A, Vitamin B6, Vitamin B2, Vitamin B1, Folic Acid, Vitamin B12, Vitamin D3"
    },
    {
      name: "Yogurt",
      list: "Cultured Pasteurized Nonfat Milk, Sugar, Modified Corn Starch, Strawberries, Contains 1% or less of: Kosher Gelatin, Natural Flavor, Citric Acid, Tricalcium Phosphate, Pectin, Acesulfame Potassium, Sucralose, Red 40, Vitamin D3"
    }
  ];

  const analyzeIngredients = async () => {
    if (!ingredients.trim()) {
      setError('Please paste some ingredients to analyze');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis('');

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `You are an AI health co-pilot that helps users understand food ingredients at the moment of decision.

Do not list ingredients or act like a database. Infer what the user likely cares about without asking questions.

Explain why certain ingredients matter, the trade-offs involved, and where uncertainty exists, using simple, human language.

Avoid fear-mongering, medical claims, and technical jargon.

Your goal is to reduce cognitive effort and help the user feel informed and confident.

Analyze these ingredients:
${ingredients}

Provide a clear, concise analysis in 3-4 short paragraphs. Focus on what matters most.`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const analysisText = data.content
        .map(item => (item.type === "text" ? item.text : ""))
        .filter(Boolean)
        .join("\n");

      setAnalysis(analysisText);
    } catch (err) {
      setError('Unable to analyze ingredients. Please check your API key configuration.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (example) => {
    setIngredients(example.list);
    setAnalysis('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Health Co-Pilot</h1>
              <p className="text-sm text-gray-600">Understand ingredients at the moment of decision</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">How it works</p>
            <p className="text-blue-800">Paste any ingredient list below. Our AI will instantly analyze what matters—no filters, no configuration needed.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Paste Ingredients</h2>
            
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Example: Whole Wheat Flour, Water, Sugar, Yeast, Salt, Soybean Oil, Preservatives (Calcium Propionate), Enriched Flour..."
              className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
            />

            <button
              onClick={analyzeIngredients}
              disabled={loading || !ingredients.trim()}
              className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze Ingredients
                </>
              )}
            </button>

            {/* Example Buttons */}
            <div className="mt-4">
              <p className="text-xs text-gray-600 mb-2 font-medium">Try an example:</p>
              <div className="flex flex-wrap gap-2">
                {exampleIngredients.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadExample(example)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {example.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis</h2>
            
            {!analysis && !error && !loading && (
              <div className="h-48 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Your analysis will appear here</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 mx-auto mb-3 text-indigo-600 animate-spin" />
                  <p className="text-sm text-gray-600">Analyzing ingredients...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {analysis && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-800 font-medium">Analysis complete</p>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  {analysis.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-gray-700 leading-relaxed mb-3">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 italic">
                    This analysis is AI-generated and for informational purposes only. Always consult healthcare providers for medical advice.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No Configuration</h3>
            <p className="text-sm text-gray-600">Just paste and analyze. The AI infers what matters to you.</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Plain Language</h3>
            <p className="text-sm text-gray-600">No jargon. Just clear explanations you can understand.</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Honest Insights</h3>
            <p className="text-sm text-gray-600">We explain trade-offs and uncertainty, not fear-mongering.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto px-4 py-8 mt-12 border-t border-gray-200">
        <p className="text-center text-sm text-gray-600">
          Built with ❤️ using Claude AI • This is an AI-native experience designed for human understanding
        </p>
      </div>
    </div>
  );
}

export default App;
