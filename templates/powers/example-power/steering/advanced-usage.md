# Advanced Usage - Example Power

This guide covers advanced patterns and customization for the Example Power.

## Chaining Tools

You can chain multiple tool calls for complex workflows:

### Text Processing Pipeline

```
1. Analyze the input text to understand its structure
2. Transform specific parts as needed
3. Echo the final result for verification
```

### Example: Format and Analyze

```
Given: "hello WORLD from KIRO"

Step 1: Transform to lowercase
Result: "hello world from kiro"

Step 2: Analyze the result
Result: { wordCount: 4, characterCount: 20 }
```

## Custom Workflows

### Batch Processing

Process multiple texts by calling tools in sequence:

```javascript
const texts = ["Hello", "World", "Kiro"];
const results = [];

for (const text of texts) {
  // Transform each text
  const transformed = await transform({ text, operation: "uppercase" });
  results.push(transformed);
}
```

### Conditional Processing

Apply different operations based on content:

```javascript
const text = "Hello World";
const analysis = await analyze({ text });

if (analysis.wordCount > 5) {
  // Long text - just get length
  await transform({ text, operation: "length" });
} else {
  // Short text - transform
  await transform({ text, operation: "uppercase" });
}
```

## Error Handling

### Invalid Operations

The transform tool validates operations:

```
Valid: uppercase, lowercase, reverse, length
Invalid: anything else

Error response:
{
  "error": "Unknown operation: invalid_op"
}
```

### Empty Input

Tools handle empty input gracefully:

```
Input: ""
Analyze result: { wordCount: 0, characterCount: 0 }
Transform result: "" (empty string)
```

## Performance Considerations

### Large Text Processing

For large texts:
1. Consider breaking into chunks
2. Process chunks in parallel if possible
3. Combine results at the end

### Caching

Results can be cached for repeated operations:

```javascript
const cache = new Map();

async function cachedTransform(text, operation) {
  const key = `${text}:${operation}`;
  if (cache.has(key)) {
    return cache.get(key);
  }
  const result = await transform({ text, operation });
  cache.set(key, result);
  return result;
}
```

## Extending the Power

### Adding New Tools

To add a new tool to the server:

1. Add tool definition in `ListToolsRequestSchema` handler
2. Add tool implementation in `CallToolRequestSchema` handler
3. Update documentation

Example new tool:

```javascript
// In ListToolsRequestSchema handler
{
  name: "count_words",
  description: "Count specific words in text",
  inputSchema: {
    type: "object",
    properties: {
      text: { type: "string" },
      word: { type: "string" }
    },
    required: ["text", "word"]
  }
}

// In CallToolRequestSchema handler
if (name === "count_words") {
  const { text, word } = args;
  const regex = new RegExp(word, "gi");
  const matches = text.match(regex) || [];
  return {
    content: [{
      type: "text",
      text: JSON.stringify({ count: matches.length })
    }]
  };
}
```

### Custom Operations

Add new transform operations:

```javascript
case "capitalize":
  result = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  break;

case "slug":
  result = text.toLowerCase().replace(/\s+/g, "-");
  break;

case "camelCase":
  result = text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
  break;
```

## Integration Patterns

### With Other Powers

Combine Example Power with other Powers:

```
1. Use domain-specific Power to extract data
2. Use Example Power to format/transform
3. Use another Power to output results
```

### With External Services

The server can be extended to call external APIs:

```javascript
import fetch from "node-fetch";

if (name === "translate") {
  const { text, targetLang } = args;
  const response = await fetch("https://api.translation.service/translate", {
    method: "POST",
    body: JSON.stringify({ text, target: targetLang })
  });
  const result = await response.json();
  return { content: [{ type: "text", text: result.translated }] };
}
```

## Debugging

### Enable Debug Logging

```javascript
// Add to server.js
const DEBUG = process.env.DEBUG === "true";

function log(...args) {
  if (DEBUG) {
    console.error("[DEBUG]", ...args);
  }
}

// Use in handlers
log("Processing tool:", name, "with args:", args);
```

### Test Locally

```bash
# Run with debug
DEBUG=true node servers/example-server.js

# Send test request via stdin
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node servers/example-server.js
```

## Best Practices Summary

1. **Validate Input**: Always check parameters before processing
2. **Return Consistent Format**: Use the same response structure
3. **Handle Errors Gracefully**: Return meaningful error messages
4. **Document Everything**: Keep POWER.md and steering files updated
5. **Test Thoroughly**: Test all operations and edge cases
