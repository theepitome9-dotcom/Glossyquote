/**
 * Cost Tracking Utility
 * Monitors API usage and estimated costs to prevent surprise bills
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Cost estimates (in USD for standardization)
export const API_COSTS = {
  // OpenAI GPT-4o Vision
  AI_ROOM_MEASUREMENT: 0.015, // ~$0.015 per image analysis
  AI_PHOTO_VALIDATION: 0.005, // ~$0.005 per validation
  
  // Image generation (if used)
  IMAGE_GENERATION: 0.04, // ~$0.04 per image
  
  // Text generation (if chatbot added)
  CHAT_MESSAGE: 0.002, // ~$0.002 per message
  
  // Payment processing fees (calculated separately as percentage)
  PAYMENT_PERCENTAGE: 0.029, // 2.9%
  PAYMENT_FIXED: 0.30, // £0.30 per transaction
};

export interface CostEntry {
  id: string;
  timestamp: string;
  operation: keyof typeof API_COSTS;
  cost: number;
  metadata?: {
    userId?: string;
    estimateId?: string;
    details?: string;
  };
}

export interface CostStats {
  totalCost: number;
  operationCounts: Record<string, number>;
  operationCosts: Record<string, number>;
  dailyCosts: Record<string, number>;
  lastReset: string;
}

const STORAGE_KEY = 'cost_tracking';
const STATS_KEY = 'cost_stats';

/**
 * Log an API operation cost
 */
export async function logCost(
  operation: keyof typeof API_COSTS,
  metadata?: CostEntry['metadata']
): Promise<void> {
  try {
    const cost = API_COSTS[operation];
    
    const entry: CostEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      operation,
      cost,
      metadata,
    };

    // Get existing logs
    const logsJson = await AsyncStorage.getItem(STORAGE_KEY);
    const logs: CostEntry[] = logsJson ? JSON.parse(logsJson) : [];

    // Add new entry
    logs.push(entry);

    // Keep only last 1000 entries to prevent storage bloat
    if (logs.length > 1000) {
      logs.shift();
    }

    // Save logs
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(logs));

    // Update stats
    await updateStats(entry);

    console.log(`💰 Cost logged: ${operation} = $${cost.toFixed(4)}`);
  } catch (error) {
    console.error('Failed to log cost:', error);
    // Don't throw - cost tracking should never break the app
  }
}

/**
 * Update cost statistics
 */
async function updateStats(entry: CostEntry): Promise<void> {
  try {
    const statsJson = await AsyncStorage.getItem(STATS_KEY);
    const stats: CostStats = statsJson
      ? JSON.parse(statsJson)
      : {
          totalCost: 0,
          operationCounts: {},
          operationCosts: {},
          dailyCosts: {},
          lastReset: new Date().toISOString(),
        };

    // Update totals
    stats.totalCost += entry.cost;

    // Update operation counts
    stats.operationCounts[entry.operation] = (stats.operationCounts[entry.operation] || 0) + 1;

    // Update operation costs
    stats.operationCosts[entry.operation] = (stats.operationCosts[entry.operation] || 0) + entry.cost;

    // Update daily costs
    const today = new Date().toISOString().split('T')[0];
    stats.dailyCosts[today] = (stats.dailyCosts[today] || 0) + entry.cost;

    // Save stats
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to update stats:', error);
  }
}

/**
 * Get current cost statistics
 */
export async function getCostStats(): Promise<CostStats> {
  try {
    const statsJson = await AsyncStorage.getItem(STATS_KEY);
    if (!statsJson) {
      return {
        totalCost: 0,
        operationCounts: {},
        operationCosts: {},
        dailyCosts: {},
        lastReset: new Date().toISOString(),
      };
    }
    return JSON.parse(statsJson);
  } catch (error) {
    console.error('Failed to get cost stats:', error);
    return {
      totalCost: 0,
      operationCounts: {},
      operationCosts: {},
      dailyCosts: {},
      lastReset: new Date().toISOString(),
    };
  }
}

/**
 * Get recent cost entries
 */
export async function getRecentCosts(limit: number = 50): Promise<CostEntry[]> {
  try {
    const logsJson = await AsyncStorage.getItem(STORAGE_KEY);
    if (!logsJson) return [];
    
    const logs: CostEntry[] = JSON.parse(logsJson);
    return logs.slice(-limit).reverse(); // Most recent first
  } catch (error) {
    console.error('Failed to get recent costs:', error);
    return [];
  }
}

/**
 * Get today's cost
 */
export async function getTodayCost(): Promise<number> {
  try {
    const stats = await getCostStats();
    const today = new Date().toISOString().split('T')[0];
    return stats.dailyCosts[today] || 0;
  } catch (error) {
    console.error('Failed to get today cost:', error);
    return 0;
  }
}

/**
 * Check if daily cost limit is reached
 */
export async function isDailyCostLimitReached(limitUSD: number = 10): Promise<boolean> {
  const todayCost = await getTodayCost();
  return todayCost >= limitUSD;
}

/**
 * Reset cost tracking (for testing or new billing period)
 */
export async function resetCostTracking(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    await AsyncStorage.removeItem(STATS_KEY);
    console.log('✅ Cost tracking reset');
  } catch (error) {
    console.error('Failed to reset cost tracking:', error);
  }
}

/**
 * Format cost for display
 */
export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${cost.toFixed(4)}`;
  }
  return `$${cost.toFixed(2)}`;
}

/**
 * Get cost breakdown summary
 */
export async function getCostBreakdown(): Promise<{
  total: string;
  aiMeasurement: string;
  aiValidation: string;
  other: string;
  todayCost: string;
  averageDailyCost: string;
}> {
  const stats = await getCostStats();
  
  const aiMeasurement = stats.operationCosts['AI_ROOM_MEASUREMENT'] || 0;
  const aiValidation = stats.operationCosts['AI_PHOTO_VALIDATION'] || 0;
  const other = stats.totalCost - aiMeasurement - aiValidation;
  
  // Calculate average daily cost
  const dailyCosts = Object.values(stats.dailyCosts);
  const avgDaily = dailyCosts.length > 0 
    ? dailyCosts.reduce((sum, cost) => sum + cost, 0) / dailyCosts.length 
    : 0;

  return {
    total: formatCost(stats.totalCost),
    aiMeasurement: formatCost(aiMeasurement),
    aiValidation: formatCost(aiValidation),
    other: formatCost(other),
    todayCost: formatCost(await getTodayCost()),
    averageDailyCost: formatCost(avgDaily),
  };
}

/**
 * Export data for external analysis (CSV format)
 */
export async function exportCostData(): Promise<string> {
  try {
    const logs = await getRecentCosts(1000);
    
    let csv = 'Timestamp,Operation,Cost (USD),Metadata\n';
    
    for (const log of logs) {
      const metadata = log.metadata ? JSON.stringify(log.metadata).replace(/"/g, '""') : '';
      csv += `${log.timestamp},${log.operation},${log.cost},"${metadata}"\n`;
    }
    
    return csv;
  } catch (error) {
    console.error('Failed to export cost data:', error);
    return '';
  }
}
