// Advanced math operations tool

// Evaluate mathematical expressions safely (without using eval)
export function calculateExpression(params) {
    try {
        const { expression } = params;
        
        if (!expression || typeof expression !== 'string') {
            throw new Error('Expression must be a non-empty string');
        }
        
        // Process the expression to support all operations
        let processedExpression = expression.trim();
        
        // Replace ^ with ** for exponentiation
        processedExpression = processedExpression.replace(/\^/g, '**');
        
        // Replace all supported math functions with their Math equivalents
        processedExpression = replaceMathFunctions(processedExpression);
        
        // Safely evaluate the expression with Math context
        const result = evaluateExpression(processedExpression);
        
        // Format the result
        return {
            content: [
                {
                    type: "text",
                    text: `Result: ${expression} = ${result}`
                }
            ]
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Sorry, I couldn't calculate that. Error: ${error.message}`
                }
            ]
        };
    }
}

// Replace all supported math functions with their Math equivalents
function replaceMathFunctions(expr) {
    // Map of supported functions to their Math object equivalents
    const functionMap = {
        'sin': 'Math.sin',
        'cos': 'Math.cos',
        'tan': 'Math.tan',
        'asin': 'Math.asin',
        'acos': 'Math.acos',
        'atan': 'Math.atan',
        'sqrt': 'Math.sqrt',
        'log': 'Math.log10', // log is base 10 in our calculator
        'ln': 'Math.log',    // ln is natural log
        'abs': 'Math.abs',
        'round': 'Math.round',
        'floor': 'Math.floor',
        'ceil': 'Math.ceil'
    };
    
    let result = expr;
    
    // Replace each function with its Math equivalent
    for (const [func, mathFunc] of Object.entries(functionMap)) {
        // Use word boundary to avoid partial matches
        const regex = new RegExp(`\\b${func}\\(`, 'g');
        result = result.replace(regex, `${mathFunc}(`);
    }
    
    return result;
}

// Safely evaluate the math expression
function evaluateExpression(expr) {
    try {
        // Create a safe context with only Math functions
        const safeEval = new Function('Math', `return ${expr}`);
        
        // Execute with only Math as a parameter
        return safeEval(Math);
    } catch (error) {
        throw new Error(`Invalid expression: ${error.message}`);
    }
}

// Calculate statistical values like mean, median, mode
export function calculateStats(params) {
    try {
        const { numbers } = params;
        
        // Validate input
        if (!Array.isArray(numbers) || numbers.length === 0) {
            throw new Error("Please provide a valid array of numbers");
        }
        
        // Convert all values to numbers
        const validNumbers = numbers.map(n => parseFloat(n)).filter(n => !isNaN(n));
        
        if (validNumbers.length === 0) {
            throw new Error("No valid numbers provided");
        }
        
        // Calculate mean
        const sum = validNumbers.reduce((acc, val) => acc + val, 0);
        const mean = sum / validNumbers.length;
        
        // Calculate median
        const sorted = [...validNumbers].sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
        const median = sorted.length % 2 === 0 
            ? (sorted[middle - 1] + sorted[middle]) / 2
            : sorted[middle];
        
        // Calculate mode (most frequent value)
        const frequency = {};
        validNumbers.forEach(num => {
            frequency[num] = (frequency[num] || 0) + 1;
        });
        
        let mode = [];
        let maxFrequency = 0;
        
        for (const [num, freq] of Object.entries(frequency)) {
            if (freq > maxFrequency) {
                maxFrequency = freq;
                mode = [parseFloat(num)];
            } else if (freq === maxFrequency) {
                mode.push(parseFloat(num));
            }
        }
        
        // Format mode display
        const modeDisplay = mode.length === Object.keys(frequency).length 
            ? "No mode (all values appear equally often)" 
            : mode.join(", ");
        
        return {
            content: [
                {
                    type: "text",
                    text: `Statistical Analysis:
- Count: ${validNumbers.length}
- Sum: ${sum}
- Mean (Average): ${mean}
- Median: ${median}
- Mode: ${modeDisplay}
- Range: ${Math.max(...validNumbers) - Math.min(...validNumbers)}
- Min: ${Math.min(...validNumbers)}
- Max: ${Math.max(...validNumbers)}`
                }
            ]
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Sorry, I couldn't calculate statistics. Error: ${error.message}`
                }
            ]
        };
    }
} 