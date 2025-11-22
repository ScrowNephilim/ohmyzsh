/**
 * JSON File Size Reducer
 * Compresses large JSON files (15MB → 10MB target) by removing non-essential data
 * while preserving conversation content and structure
 */

export interface ReductionResult {
  success: boolean;
  originalSize: number;
  reducedSize: number;
  reductionPercentage: number;
  reducedJSON: any;
  removedFields: string[];
  compressionSteps: string[];
}

/**
 * Calculate file size in bytes
 */
function calculateSize(data: any): number {
  const jsonString = JSON.stringify(data);
  return new TextEncoder().encode(jsonString).length;
}

/**
 * Format bytes to human-readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Remove metadata and timestamps from messages
 */
function stripMessageMetadata(messages: any[]): any[] {
  return messages.map(msg => ({
    role: msg.role || msg.sender || msg.from || 'user',
    content: msg.content || msg.text || msg.message || ''
  }));
}

/**
 * Truncate long messages to max length
 */
function truncateMessages(messages: any[], maxLength: number = 2000): any[] {
  return messages.map(msg => ({
    ...msg,
    content: typeof msg.content === 'string' && msg.content.length > maxLength
      ? msg.content.substring(0, maxLength) + '...'
      : msg.content
  }));
}

/**
 * Remove conversations with very few messages (likely not important)
 */
function filterShortConversations(conversations: any[], minMessages: number = 3): any[] {
  return conversations.filter(conv => {
    const messages = conv.messages || [];
    return messages.length >= minMessages;
  });
}

/**
 * Remove duplicate conversations based on content similarity
 */
function removeDuplicates(conversations: any[]): any[] {
  const seen = new Set<string>();
  return conversations.filter(conv => {
    const messages = conv.messages || [];
    if (messages.length === 0) return false;
    
    // Create hash of first 200 chars of first message
    const firstMessage = messages[0]?.content || messages[0]?.text || '';
    const hash = firstMessage.substring(0, 200);
    
    if (seen.has(hash)) return false;
    seen.add(hash);
    return true;
  });
}

/**
 * Remove empty or null fields recursively
 */
function removeEmptyFields(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(removeEmptyFields).filter(item => 
      item !== null && 
      item !== undefined && 
      item !== '' &&
      !(Array.isArray(item) && item.length === 0) &&
      !(typeof item === 'object' && Object.keys(item).length === 0)
    );
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = removeEmptyFields(value);
      if (
        cleanedValue !== null &&
        cleanedValue !== undefined &&
        cleanedValue !== '' &&
        !(Array.isArray(cleanedValue) && cleanedValue.length === 0) &&
        !(typeof cleanedValue === 'object' && Object.keys(cleanedValue).length === 0)
      ) {
        cleaned[key] = cleanedValue;
      }
    }
    return cleaned;
  }
  
  return obj;
}

/**
 * Main reduction function - reduces JSON file size progressively
 */
export async function reduceJSONSize(
  jsonData: any,
  targetSizeMB: number = 10
): Promise<ReductionResult> {
  console.log('[JSONReducer] 🗜️ Starting JSON size reduction...');
  
  const originalSize = calculateSize(jsonData);
  const targetSizeBytes = targetSizeMB * 1024 * 1024;
  const removedFields: string[] = [];
  const compressionSteps: string[] = [];
  
  let workingData = JSON.parse(JSON.stringify(jsonData)); // Deep clone
  
  console.log(`[JSONReducer] 📊 Original size: ${formatBytes(originalSize)}`);
  console.log(`[JSONReducer] 🎯 Target size: ${formatBytes(targetSizeBytes)}`);
  
  // Step 1: Remove metadata fields
  if (calculateSize(workingData) > targetSizeBytes) {
    console.log('[JSONReducer] 🔧 Step 1: Removing metadata...');
    
    const metadataFields = ['metadata', 'created_at', 'updated_at', 'id', 'conversation_id', 'user_id'];
    
    function removeMetadataRecursive(obj: any): any {
      if (Array.isArray(obj)) {
        return obj.map(removeMetadataRecursive);
      }
      if (typeof obj === 'object' && obj !== null) {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (!metadataFields.includes(key)) {
            cleaned[key] = removeMetadataRecursive(value);
          } else {
            removedFields.push(key);
          }
        }
        return cleaned;
      }
      return obj;
    }
    
    workingData = removeMetadataRecursive(workingData);
    compressionSteps.push('Removed metadata fields');
    console.log(`[JSONReducer] ✅ After metadata removal: ${formatBytes(calculateSize(workingData))}`);
  }
  
  // Step 2: Strip message metadata
  if (calculateSize(workingData) > targetSizeBytes) {
    console.log('[JSONReducer] 🔧 Step 2: Stripping message metadata...');
    
    if (Array.isArray(workingData)) {
      workingData = workingData.map(conv => ({
        ...conv,
        messages: stripMessageMetadata(conv.messages || [])
      }));
    } else if (workingData.conversations) {
      workingData.conversations = workingData.conversations.map((conv: any) => ({
        ...conv,
        messages: stripMessageMetadata(conv.messages || [])
      }));
    } else if (workingData.messages) {
      workingData.messages = stripMessageMetadata(workingData.messages);
    }
    
    compressionSteps.push('Stripped message metadata');
    console.log(`[JSONReducer] ✅ After message stripping: ${formatBytes(calculateSize(workingData))}`);
  }
  
  // Step 3: Remove short conversations
  if (calculateSize(workingData) > targetSizeBytes) {
    console.log('[JSONReducer] 🔧 Step 3: Filtering short conversations...');
    
    if (Array.isArray(workingData)) {
      const before = workingData.length;
      workingData = filterShortConversations(workingData, 3);
      console.log(`[JSONReducer] 🗑️ Removed ${before - workingData.length} short conversations`);
    } else if (workingData.conversations) {
      const before = workingData.conversations.length;
      workingData.conversations = filterShortConversations(workingData.conversations, 3);
      console.log(`[JSONReducer] 🗑️ Removed ${before - workingData.conversations.length} short conversations`);
    }
    
    compressionSteps.push('Removed conversations < 3 messages');
    console.log(`[JSONReducer] ✅ After filtering: ${formatBytes(calculateSize(workingData))}`);
  }
  
  // Step 4: Remove duplicates
  if (calculateSize(workingData) > targetSizeBytes) {
    console.log('[JSONReducer] 🔧 Step 4: Removing duplicate conversations...');
    
    if (Array.isArray(workingData)) {
      const before = workingData.length;
      workingData = removeDuplicates(workingData);
      console.log(`[JSONReducer] 🗑️ Removed ${before - workingData.length} duplicates`);
    } else if (workingData.conversations) {
      const before = workingData.conversations.length;
      workingData.conversations = removeDuplicates(workingData.conversations);
      console.log(`[JSONReducer] 🗑️ Removed ${before - workingData.conversations.length} duplicates`);
    }
    
    compressionSteps.push('Removed duplicate conversations');
    console.log(`[JSONReducer] ✅ After deduplication: ${formatBytes(calculateSize(workingData))}`);
  }
  
  // Step 5: Truncate long messages
  if (calculateSize(workingData) > targetSizeBytes) {
    console.log('[JSONReducer] 🔧 Step 5: Truncating long messages...');
    
    if (Array.isArray(workingData)) {
      workingData = workingData.map(conv => ({
        ...conv,
        messages: truncateMessages(conv.messages || [], 1500)
      }));
    } else if (workingData.conversations) {
      workingData.conversations = workingData.conversations.map((conv: any) => ({
        ...conv,
        messages: truncateMessages(conv.messages || [], 1500)
      }));
    } else if (workingData.messages) {
      workingData.messages = truncateMessages(workingData.messages, 1500);
    }
    
    compressionSteps.push('Truncated messages to 1500 chars');
    console.log(`[JSONReducer] ✅ After truncation: ${formatBytes(calculateSize(workingData))}`);
  }
  
  // Step 6: Remove empty fields
  if (calculateSize(workingData) > targetSizeBytes) {
    console.log('[JSONReducer] 🔧 Step 6: Removing empty fields...');
    workingData = removeEmptyFields(workingData);
    compressionSteps.push('Removed empty fields');
    console.log(`[JSONReducer] ✅ After cleanup: ${formatBytes(calculateSize(workingData))}`);
  }
  
  // Step 7: Aggressive truncation if still too large
  if (calculateSize(workingData) > targetSizeBytes) {
    console.log('[JSONReducer] 🔧 Step 7: AGGRESSIVE truncation...');
    
    if (Array.isArray(workingData)) {
      workingData = workingData.map(conv => ({
        ...conv,
        messages: truncateMessages(conv.messages || [], 800)
      }));
    } else if (workingData.conversations) {
      workingData.conversations = workingData.conversations.map((conv: any) => ({
        ...conv,
        messages: truncateMessages(conv.messages || [], 800)
      }));
    } else if (workingData.messages) {
      workingData.messages = truncateMessages(workingData.messages, 800);
    }
    
    compressionSteps.push('AGGRESSIVE truncation to 800 chars');
    console.log(`[JSONReducer] ✅ After aggressive truncation: ${formatBytes(calculateSize(workingData))}`);
  }
  
  const reducedSize = calculateSize(workingData);
  const reductionPercentage = ((originalSize - reducedSize) / originalSize) * 100;
  
  console.log(`[JSONReducer] ✅ Reduction complete!`);
  console.log(`[JSONReducer] 📉 Original: ${formatBytes(originalSize)}`);
  console.log(`[JSONReducer] 📊 Reduced: ${formatBytes(reducedSize)}`);
  console.log(`[JSONReducer] 💯 Saved: ${reductionPercentage.toFixed(1)}%`);
  
  return {
    success: reducedSize <= targetSizeBytes,
    originalSize,
    reducedSize,
    reductionPercentage,
    reducedJSON: workingData,
    removedFields: [...new Set(removedFields)],
    compressionSteps
  };
}

/**
 * Download reduced JSON file
 */
export function downloadReducedJSON(result: ReductionResult, filename: string = 'reduced.json') {
  const jsonString = JSON.stringify(result.reducedJSON, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
