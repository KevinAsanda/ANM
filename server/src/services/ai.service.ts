import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-flash-latest';

// Helper to determine if we should run in mock/offline mode
function isDummyKey(key: string | undefined): boolean {
  if (!key) return true;
  const k = key.trim();
  return k === '' || k === 'undefined' || k.startsWith('your-') || k.startsWith('YOUR-') || k === 'mock-key';
}

const useMockAI = isDummyKey(apiKey);

/**
 * Sends a prompt to the Gemini API and returns the text response.
 */
async function callGemini(prompt: string, jsonMode: boolean = false): Promise<string> {
  if (useMockAI) {
    throw new Error('Gemini API key is not configured or is a placeholder. Using mock fallback.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
  
  const payload: any = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ]
  };

  if (jsonMode) {
    payload.generationConfig = {
      responseMimeType: 'application/json'
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey || ''
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API call failed with status ${response.status}: ${errText}`);
  }

  const data = (await response.json()) as any;
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    throw new Error('Invalid response structure received from Gemini API');
  }

  return content;
}

/**
 * Forecasts 30-day inventory demand and reorder quantities.
 */
export async function getAIInventoryForecast(
  inventoryItems: any[],
  usageHistory: any[]
): Promise<any[]> {
  if (useMockAI) {
    console.log('[AI Service] Running Mock Inventory Forecast');
    return generateMockInventoryForecast(inventoryItems, usageHistory);
  }

  const prompt = `
    You are an expert parts inventory manager for ANM Automotive, a car repair workshop in Pinetown, South Africa.
    Given the current inventory levels and the historical parts consumption over the past 30-90 days, project the demand for each part over the next 30 days and suggest a recommended order quantity.

    Rules:
    1. Do not recommend ordering a part if the current quantity in stock is healthy relative to reorder level and demand.
    2. Suggest ordering if current stock is at or below the reorder level, OR if usage history indicates high velocity.
    3. Suggested quantities must be positive integers.
    4. Estimate the total cost based on the unit_cost of the item.
    5. Always return a valid JSON array. Do not wrap in markdown tags like \`\`\`json. Return only the raw JSON.

    Current Inventory Data:
    ${JSON.stringify(inventoryItems, null, 2)}

    Historical Parts Usage Data (from service tickets):
    ${JSON.stringify(usageHistory, null, 2)}

    Return a JSON array of recommendation objects. Each object MUST have this schema:
    [
      {
        "inventory_id": "string (UUID of the part)",
        "part_name": "string (Name of the part)",
        "current_stock": number,
        "projected_demand": number (Estimated units used in next 30 days),
        "suggested_order_qty": number (Suggested count to order, 0 if no order needed),
        "estimated_cost": number (suggested_order_qty * unit_cost),
        "reasoning": "string (Brief business explanation for this suggestion)"
      }
    ]
  `;

  try {
    const rawJson = await callGemini(prompt, true);
    return JSON.parse(rawJson);
  } catch (error: any) {
    console.error('[AI Service] Error generating real forecast, falling back to mock:', error.message);
    return generateMockInventoryForecast(inventoryItems, usageHistory);
  }
}

/**
 * Evaluates symptoms and returns causes, diagnostic checklist, and recommended parts.
 */
export async function getAIRepairDiagnostics(
  symptoms: string,
  inventoryItems: any[]
): Promise<any> {
  if (useMockAI) {
    console.log('[AI Service] Running Mock Diagnostics');
    return generateMockDiagnostics(symptoms, inventoryItems);
  }

  const prompt = `
    You are an expert car mechanic diagnosing a vehicle at ANM Automotive.
    The customer reports the following symptoms: "${symptoms}".

    Analyze the symptoms and return:
    1. Top 3 most likely root causes.
    2. A step-by-step diagnostic checklist for the mechanic to perform.
    3. Recommended replacement parts that match items available in the workshop's inventory.

    Here is the list of available inventory items:
    ${JSON.stringify(inventoryItems.map(i => ({ id: i.id, part_name: i.part_name, unit_cost: i.unit_cost })), null, 2)}

    Always return a valid JSON object. Do not wrap in markdown tags. Return only raw JSON.
    JSON Schema:
    {
      "causes": ["Cause 1", "Cause 2", "Cause 3"],
      "checklist": ["Step 1", "Step 2", "Step 3"],
      "suggested_parts": [
        {
          "inventory_id": "string (UUID matching available inventory.id, or null if no match)",
          "part_name": "string (Matching part_name)",
          "suggested_qty": number,
          "reasoning": "string (Brief reason why this part is suggested)"
        }
      ]
    }
  `;

  try {
    const rawJson = await callGemini(prompt, true);
    return JSON.parse(rawJson);
  } catch (error: any) {
    console.error('[AI Service] Error generating real diagnostics, falling back to mock:', error.message);
    return generateMockDiagnostics(symptoms, inventoryItems);
  }
}

/**
 * Classifies customer symptoms into a service category and estimates duration.
 */
export async function getAIBookingClassification(symptoms: string): Promise<any> {
  if (useMockAI) {
    console.log('[AI Service] Running Mock Booking Classification');
    return generateMockBookingClassification(symptoms);
  }

  const prompt = `
    You are a service coordinator at ANM Automotive.
    A customer wants to book a service and provides the following description of the problem:
    "${symptoms}"

    Based on this, classify the job into one of these standard categories:
    - "Oil & Filter Service"
    - "Brakes & Braking System"
    - "Suspension & Steering"
    - "Engine & Transmission Diagnostic"
    - "Electrical & Battery Diagnostic"
    - "General Inspection & Repair"

    Also, estimate the labor duration in decimal hours (e.g. 1.5, 2.0, 3.5) required to perform this service.

    Always return a valid JSON object. Do not wrap in markdown tags. Return only raw JSON.
    JSON Schema:
    {
      "suggested_category": "string (Exactly one of the categories listed above)",
      "estimated_duration_hours": number,
      "reasoning": "string (Brief explanation for the category and duration estimate)"
    }
  `;

  try {
    const rawJson = await callGemini(prompt, true);
    return JSON.parse(rawJson);
  } catch (error: any) {
    console.error('[AI Service] Error generating real classification, falling back to mock:', error.message);
    return generateMockBookingClassification(symptoms);
  }
}

// ============================================================================
// MOCK FALLBACK GENERATORS
// ============================================================================

function generateMockInventoryForecast(inventoryItems: any[], usageHistory: any[]): any[] {
  return inventoryItems
    .map(item => {
      const isLow = item.qty_in_stock <= item.reorder_level;
      const recentUsage = usageHistory
        .filter(u => u.inventory_id === item.id)
        .reduce((sum, u) => sum + Number(u.qty_used), 0);

      // Rule-based mock recommendation
      let projectedDemand = recentUsage || 0;
      if (projectedDemand === 0) {
        // Fallback guess based on type of part
        if (item.part_name.toLowerCase().includes('oil') || item.part_name.toLowerCase().includes('filter')) {
          projectedDemand = 6;
        } else if (item.part_name.toLowerCase().includes('brake') || item.part_name.toLowerCase().includes('pad')) {
          projectedDemand = 3;
        } else {
          projectedDemand = 2;
        }
      }

      let suggestedQty = 0;
      let reasoning = '';

      if (isLow) {
        suggestedQty = Math.max(5, item.reorder_level * 2);
        reasoning = `Stock level (${item.qty_in_stock}) is below reorder level (${item.reorder_level}). Restock highly recommended.`;
      } else if (item.qty_in_stock <= projectedDemand + 2) {
        suggestedQty = Math.max(3, projectedDemand - item.qty_in_stock + 5);
        reasoning = `Healthy usage trend (${projectedDemand} projected in 30 days) relative to current stock (${item.qty_in_stock}). Ordering safety stock.`;
      }

      const estimatedCost = suggestedQty * (item.unit_cost || 0);

      return {
        inventory_id: item.id,
        part_name: item.part_name,
        current_stock: item.qty_in_stock,
        projected_demand: projectedDemand,
        suggested_order_qty: suggestedQty,
        estimated_cost: Number(estimatedCost.toFixed(2)),
        reasoning: reasoning || 'Current stock levels are adequate to meet projected demand.'
      };
    })
    .filter(rec => rec.suggested_order_qty > 0);
}

function generateMockDiagnostics(symptoms: string, inventoryItems: any[]): any {
  const sym = symptoms.toLowerCase();
  let causes: string[] = [];
  let checklist: string[] = [];
  let partMatches: string[] = [];

  if (sym.includes('brake') || sym.includes('squeal') || sym.includes('stopping') || sym.includes('pedal')) {
    causes = [
      'Worn front or rear brake pads making contact with the rotor',
      'Sticking brake caliper failing to release fully',
      'Brake fluid contamination or air bubbles in lines'
    ];
    checklist = [
      'Check front and rear brake pads for wear thickness (minimum 3mm)',
      'Inspect brake discs/rotors for warping, grooving, or hot spots',
      'Test brake fluid boiling point and inspect lines for leaks',
      'Verify brake caliper pistons compress smoothly'
    ];
    partMatches = ['brake pads', 'brake fluid'];
  } else if (sym.includes('oil') || sym.includes('leak') || sym.includes('smoke') || sym.includes('rattle')) {
    causes = [
      'Engine oil degradation or low oil level causing lifter rattle',
      'Clogged oil filter causing pressure bypass',
      'Worn oil pan gasket or valve cover gasket leaking'
    ];
    checklist = [
      'Check engine oil dipstick level and color condition',
      'Inspect undercarriage and oil pan area for active leaks',
      'Run engine under load and check oil pressure sensor readings',
      'Check spark plug wells for oil pooling'
    ];
    partMatches = ['engine oil', 'oil filter', 'spark plugs'];
  } else if (sym.includes('start') || sym.includes('crank') || sym.includes('click') || sym.includes('battery')) {
    causes = [
      'Weak or dead battery (cell failure)',
      'Coroded battery terminal connection causing voltage drop',
      'Faulty starter motor solenoid'
    ];
    checklist = [
      'Perform battery load test using digital tester (minimum 12.4V static)',
      'Clean and retighten positive and negative terminals',
      'Measure voltage drop at the starter motor during cranking',
      'Test alternator charging voltage under full accessory load'
    ];
    partMatches = ['battery'];
  } else {
    // General fallback diagnostics
    causes = [
      'General wear and tear of mechanical components',
      'Minor fluid depletion under operation',
      'Sensor calibration required'
    ];
    checklist = [
      'Perform full 50-point safety inspection',
      'Scan vehicle ECU for diagnostic trouble codes (DTCs)',
      'Check and top up all fluid levels (engine oil, coolant, steering)'
    ];
    partMatches = ['wiper blades', 'coolant'];
  }

  // Map matches to actual inventory items
  const suggested_parts = partMatches
    .map(matchName => {
      const item = inventoryItems.find(i => i.part_name.toLowerCase().includes(matchName));
      if (!item) return null;
      return {
        inventory_id: item.id,
        part_name: item.part_name,
        suggested_qty: matchName.includes('plug') ? 4 : 1,
        reasoning: `Recommended based on symptoms of "${symptoms}".`
      };
    })
    .filter(Boolean);

  return {
    causes,
    checklist,
    suggested_parts
  };
}

function generateMockBookingClassification(symptoms: string): any {
  const sym = symptoms.toLowerCase();
  
  if (sym.includes('brake') || sym.includes('squeal') || sym.includes('stopping')) {
    return {
      suggested_category: 'Brakes & Braking System',
      estimated_duration_hours: 1.5,
      reasoning: 'Symptoms relate directly to vehicle deceleration and brake noise. Typical brake inspection and pad replacement takes 1.5 hours.'
    };
  }
  
  if (sym.includes('oil') || sym.includes('service') || sym.includes('filter') || sym.includes('maintenance')) {
    return {
      suggested_category: 'Oil & Filter Service',
      estimated_duration_hours: 1.0,
      reasoning: 'Standard scheduled maintenance request. Lube, oil, and filter services are allocated 1.0 hour in workshop schedules.'
    };
  }

  if (sym.includes('shake') || sym.includes('steer') || sym.includes('pull') || sym.includes('suspension') || sym.includes('knock')) {
    return {
      suggested_category: 'Suspension & Steering',
      estimated_duration_hours: 2.5,
      reasoning: 'Steering pulling or clunking sounds indicate steering link or strut mount issues. Allocation of 2.5 hours includes diagnostics and alignment.'
    };
  }

  if (sym.includes('battery') || sym.includes('start') || sym.includes('click') || sym.includes('light') || sym.includes('wire')) {
    return {
      suggested_category: 'Electrical & Battery Diagnostic',
      estimated_duration_hours: 2.0,
      reasoning: 'No-start conditions or charging complaints require battery testers and alternator trace tests, usually taking up to 2.0 hours.'
    };
  }

  return {
    suggested_category: 'General Inspection & Repair',
    estimated_duration_hours: 1.0,
    reasoning: 'Non-specific vehicle symptoms reported. Allocating 1.0 hour for standard multi-point inspection and diagnostics.'
  };
}
